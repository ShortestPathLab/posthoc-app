import { store } from "@davstack/store";
import { AccessToken } from "services/cloud-storage/CloudStorage";

export type AuthState<T extends AccessToken> = {
  authenticated?: boolean;
  accessToken?: T;
  expiredDateTime?: number;
  user?: { name?: string; profile?: string };
};

export const auth = store<{
  [K in string]: AuthState<unknown>;
}>(
  {},
  {
    name: "authState",
    persist: { enabled: true },
  },
);
