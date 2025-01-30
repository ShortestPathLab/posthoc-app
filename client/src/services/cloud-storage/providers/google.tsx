import { createClient, RequestOptions } from "client/createHttpClient";
import { Lawnicon } from "components/generic/Lawnicon";
import { each, head, isString, now, once } from "lodash";
import {
  AuthError,
  CloudStorageError,
  CloudStorageProviderMeta,
  FileMetadata,
  ProviderFactory,
} from "services/cloud-storage";
import { AuthState, defaultAuthState } from "slices/auth";

const id = "google";

const rootFolderName = "posthoc-workspaces";

const clientId = import.meta.env.VITE_CLIENT_ID;
const apiKey = import.meta.env.VITE_API_KEY;

const scope =
  "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile";
const authUrl = "https://accounts.google.com/o/oauth2/v2/auth";
const driveApiUrl = "https://www.googleapis.com/drive/v3/files";
const driveMultiPartApiUrl = "https://www.googleapis.com/upload/drive/v3/files";
const folderMime = "application/vnd.google-apps.folder";

type GoogleDriveFileList = { files: FileMetadata[] };

const getFilePath = (fileId: string) =>
  `https://drive.google.com/uc?export=download&id=${fileId}`;

const googleUserInfoUrl = "https://www.googleapis.com/oauth2/v1/userinfo";
export const createGoogleStorageService: ProviderFactory<typeof id, string> = (
  storedToken
) => {
  const authenticate = async () => {
    const url = new URL(authUrl);
    const params = {
      scope,
      include_granted_scopes: "true",
      response_type: "token",
      state: "testing",
      redirect_uri: window.location.origin,
      client_id: clientId,
    };
    each(params, (value, key) => {
      url.searchParams.append(key, value);
    });
    window.location.href = url.toString();
  };

  const checkAuth = once(async (): Promise<AuthState<string>> => {
    if (window.location.hash) {
      const params = new URLSearchParams(window.location.hash.slice(1));
      const accessToken = params.get("access_token");
      const expiresIn = +(params.get("expires_in") ?? "");
      if (isString(accessToken) && isFinite(expiresIn)) {
        window.history.replaceState(null, "", window.location.origin);
        return {
          authenticated: true,
          accessToken,
          expiredDateTime: now() + expiresIn * 1000,
        };
      } else {
        return defaultAuthState;
      }
    }
    return defaultAuthState;
  });

  type O = { auth?: boolean };

  const getHeaders = async ({
    auth,
  }: O & RequestOptions): Promise<Record<string, string>> => {
    if (!auth) return {};
    const token = storedToken ?? (await checkAuth())?.accessToken;
    if (token) return { Authorization: `Bearer ${token}` };
    else
      throw new AuthError(
        "Could not retrieve access token and no tokens are stored"
      );
  };

  const userClient = createClient<O>(googleUserInfoUrl, getHeaders);
  const client = createClient<O>(driveApiUrl, getHeaders);
  const multiPartApiClient = createClient<O>(driveMultiPartApiUrl, getHeaders);

  const makePublic = async (fileId: string) => {
    await client.post({
      label: "Make file public",
      path: `/${fileId}/permissions`,
      body: {
        role: "reader",
        type: "anyone",
      },
      auth: true,
    });
    return getFilePath(fileId);
  };

  const rootFolderExists = async (parentName: string) => {
    const query = `name = '${parentName}' and mimeType = '${folderMime}' and trashed = false`;
    const data = await client.get<GoogleDriveFileList>({
      label: "Check folder exists",
      path: `?q=${encodeURIComponent(query)}&fields=files(id,name)`,
      auth: true,
      result: "json",
    });
    return head(data.files)?.id;
  };

  const createRootFolder = async (folderName: string) => {
    // TODO: better way to confirm parent folder existence
    // * folder name can be pre-existing
    // ! Pre-existing folders are ok,
    // ! in the future we can implement more complex handling for this case.
    const id = await rootFolderExists(folderName);
    if (id) return id;
    const data = await client.post<FileMetadata>({
      label: "Create folder",
      body: { name: folderName, mimeType: folderMime },
      auth: true,
      result: "json",
    });
    // ? would not having the res stored not catch error?
    // ! Catch block should catch all errors as long as they're thrown,
    // ! regardless if the output was stored or not.
    // ! if something doesn't seem to be caught:
    // !   - it was already caught
    // !   - the error-throwing function wasn't run with `await`
    await makePublic(data.id);

    return data.id;
  };

  const getFile = async (fileId: string) => {
    const [{ name, modifiedTime }, media] = await Promise.all([
      client.get<FileMetadata>({
        label: "Get file metadata",
        path: `/${fileId}?key=${apiKey}`,
        result: "json",
      }),

      client.get({
        label: "Get file media",
        path: `/${fileId}?alt=media&key=${apiKey}`,
        result: "blob",
      }),
    ]);
    return new File([media], name, {
      lastModified: new Date(modifiedTime).valueOf(),
    });
  };

  const saveFile = async (file: File) => {
    const parentId = await createRootFolder(rootFolderName);
    const form = new FormData();
    const metadata = {
      metadata: new Blob(
        [
          JSON.stringify({
            name: file.name,
            parents: [parentId],
          }),
        ],
        { type: "application/json" }
      ),
      file,
    };
    each(metadata, (value, key) => void form.append(key, value));
    const data = await multiPartApiClient.post<FileMetadata>({
      label: "Save file",
      path: "?uploadType=multipart",
      body: form,
      auth: true,
      result: "json",
    });
    return data.id;
  };

  const getFolderIdByName = async (folderName: string) => {
    const data = await client.get<GoogleDriveFileList>({
      label: "Find folder by name",
      path: `/?q=name='${folderName}'+and+mimeType='${folderMime}'&fields=files(id,name)`,
      auth: true,
      result: "json",
    });
    if (data.files.length) return head(data.files)?.id;
    throw new CloudStorageError("No folder found with the specified name.");
  };

  const getSavedFilesMetadata = async () => {
    await createRootFolder(rootFolderName);
    // * change this to a global var
    const folderId = await getFolderIdByName(rootFolderName);
    const data = await client.get<GoogleDriveFileList>({
      label: "Get files in folder",
      path: `?q='${folderId}'+in+parents&fields=files(id,name,mimeType,modifiedTime,size)`,
      auth: true,
      result: "json",
    });
    return data.files;
  };

  const generateLink = (fileId: string) => {
    return `${window.location.origin}?workspaceFile=${id}:${fileId}`;
  };

  const logout = async () => {};

  return {
    id,
    checkAuth: once(async () => {
      const auth = await checkAuth();
      if (auth.authenticated && !auth.user) {
        const user = await userClient.get<{
          name: string;
          picture: string;
        }>({
          label: "Get user info",
          result: "json",
          path: "?alt=json",
          auth: true,
        });
        return {
          ...auth,
          user: {
            name: user.name,
            profile: user.picture,
          },
        };
      }
      return auth;
    }),
    authenticate,
    logout,
    saveFile,
    getFile,
    getSavedFilesMetadata,
    generateLink,
    ///@ts-expect-error TODO: implement this
    deleteFile: async () => new File(),
  };
};

export default {
  id: "google",
  name: "Google Drive",
  description: "Save and sync workspaces to your Google Drive",
  icon: <Lawnicon>google_drive</Lawnicon>,
  create: createGoogleStorageService,
} satisfies CloudStorageProviderMeta<"google", string>;
