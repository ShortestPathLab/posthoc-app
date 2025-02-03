import { FeatureDescriptor } from "protocol/FeatureQuery";
import { ReactElement, ReactNode } from "react";
import { AuthState } from "slices/auth";
import TypedEmitter from "typed-emitter";

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

// Current
export interface CloudStorageProvider<
  K extends string,
  A extends AccessToken = unknown
> {
  id: K;
  /**
   * Should probably rename this authenticate or initialise
   */
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

// Proposal
export interface CloudStorageProviderProposal<K extends string>
  extends TypedEmitter<{
    indexChanged: () => void;
  }> {
  id: K;
  /**
   * Returns the current authentication state.
   * Typically, this would read access tokens from query parameters
   * on initial load post-login, then read from local storage on subsequent loads.
   */
  authenticate: () => Promise<AuthState<unknown>>;
  /**
   * Initiates login flow.
   */
  logIn: () => Promise<void>;
  /**
   * Initiates logout flow.
   */
  logOut: () => Promise<void>;
  /**
   * Save a file to this provider.
   * @returns the id of the saved file
   */
  saveFile: (
    searchTrace: File,
    fileMetaData?: FileMetaDataType,
    fileId?: string
  ) => Promise<string>;
  getFile: (fileId: string) => Promise<File>;
  deleteFile: (fileId: string) => Promise<File>;
  /**
   * Get a publicly accessible link to the file.
   */
  getFileLink: (fileId: string) => Promise<string>;
  /**
   * Get a list of all stored files.
   */
  getIndex: () => Promise<FileMetadata[]>;
}

export type ProviderFactory<
  K extends string,
  A extends AccessToken = unknown
> = (
  getAuthState: () => Promise<AuthState<A>>,
  setAuthState: (v: AuthState<A>) => Promise<void>
) => CloudStorageProvider<K, A>;

export type CloudStorageProviderMeta<
  K extends string,
  A extends AccessToken = unknown
> = {
  id: K;
  create: ProviderFactory<K, A>;
  loginUI?: (cloudService: CloudStorageProvider<string, A>) => ReactNode;
  icon?: ReactElement;
} & FeatureDescriptor;
