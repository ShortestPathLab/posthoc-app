import { AccessToken } from "services/cloud-storage/CloudStorage";
import { createSlice, withLocalStorage } from "./createSlice";

export type AuthState<T extends AccessToken> = {
  authenticated?: boolean;
  accessToken?: T;
  expiredDateTime?: number;
  user?: { name?: string; profile?: string };
};

export const defaultAuthState: AuthState<any> = {
  authenticated: undefined,
  accessToken: undefined,
  expiredDateTime: undefined,
};

export const [useAuth, AuthProvider] = createSlice<AuthState<any>>(
  {},
  withLocalStorage("authState", defaultAuthState)
);
