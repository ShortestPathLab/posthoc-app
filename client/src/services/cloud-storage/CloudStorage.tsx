import { FeatureDescriptor } from "protocol/FeatureQuery";
import { ReactElement } from "react";
import { AuthState } from "slices/auth";

export type FileMetaDataType = {
  fileName: string;
  description?: string;
};

export type AccessToken = unknown;

export type FileMetadata = {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  size: string;
};

export interface CloudStorageProvider<K extends string, A extends AccessToken> {
  id: K;
  checkAuth: () => Promise<AuthState<A>>;
  authenticate: () => Promise<void>;
  logout: () => Promise<void>;
  // todo: change the searchTrace to multiple/split files
  saveFile: (
    searchTrace: File,
    fileMetaData?: FileMetaDataType,
    fileId?: string
  ) => Promise<string>;
  getFile: (fileId: string) => Promise<File>;
  deleteFile: (fileId: string) => Promise<File>;
  generateLink: (fileId: string) => string;
  getSavedFilesMetadata: () => Promise<FileMetadata[]>;
}

export type ProviderFactory<K extends string, A extends AccessToken> = (
  accessToken: A,
  updateState: (newState: AuthState<A>) => Promise<boolean>
) => CloudStorageProvider<K, A>;

export type CloudStorageProviderMeta<
  K extends string,
  A extends AccessToken
> = {
  id: K;
  create: ProviderFactory<K, A>;
  icon?: ReactElement;
} & FeatureDescriptor;
