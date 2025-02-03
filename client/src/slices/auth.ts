import { AccessToken } from "services/cloud-storage/CloudStorage";
import { createSlice, withLocalStorage } from "./createSlice";

export type AuthState<T extends AccessToken> = {
  authenticated?: boolean;
  accessToken?: T;
  expiredDateTime?: number;
  user?: { name?: string; profile?: string };
};

export const [useAuth, AuthProvider] = createSlice<{
  [K in string]: AuthState<unknown>;
}>({}, withLocalStorage("authState", {}));
