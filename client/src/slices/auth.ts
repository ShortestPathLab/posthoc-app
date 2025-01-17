import { AccessToken } from "services/CloudStorageService";
import { createSlice, withLocalStorage } from "./createSlice";

export type AuthState = {
  authenticated?: boolean;
  accessToken?: AccessToken;
  expiredDateTime?: number;
};

export const defaultAuthState: AuthState = {
  authenticated: undefined,
  accessToken: undefined,
  expiredDateTime: undefined,
};

export const [useAuth, AuthProvider] = createSlice<AuthState>(
  {},
  withLocalStorage("authState", defaultAuthState)
);
