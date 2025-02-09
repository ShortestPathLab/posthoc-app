import { FolderOutlined } from "@mui-symbols-material/w400";
import {
  CloudStorageProviderMeta,
  ProviderFactory,
} from "services/cloud-storage";
import google from "./google";

const providers = {
  google,
  local: {
    id: "local",
    name: "This device",
    icon: <FolderOutlined />,
    description: "Save workspaces to this device",
    create: google.create as never,
    loginUI: () => null,
  },
} as const;

export default providers satisfies {
  [K in keyof typeof providers]: CloudStorageProviderMeta<K>;
};

export type AccessTokenOf<K extends keyof typeof providers> =
  (typeof providers)[K] extends ProviderFactory<string, infer A> ? A : never;
