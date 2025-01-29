import {
  CloudStorageProviderMeta,
  ProviderFactory,
} from "services/cloud-storage";
import google from "./google";

const providers = { google } as const;

export default providers satisfies {
  [K in keyof typeof providers]: CloudStorageProviderMeta<K, any>;
};

export type AccessTokenOf<K extends keyof typeof providers> =
  (typeof providers)[K] extends ProviderFactory<string, infer A> ? A : never;
