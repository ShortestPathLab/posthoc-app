import { useEffect, useMemo } from "react";
import { useAsync } from "react-async-hook";
import { AuthState, defaultAuthState, useAuth } from "slices/auth";
import { useCloudStorageService } from "slices/cloudStorage";
import { defaultCloudStorage, useSettings } from "slices/settings";
import providers, { AccessTokenOf } from "./providers";

export function CloudStorageService() {
  const [, setCloudStorageService] = useCloudStorageService();
  const [{ cloudStorageType = defaultCloudStorage }] = useSettings();
  const [authState, setAuthState] = useAuth();
  const cloudService = useMemo(() => {
    if (!(cloudStorageType in providers)) {
      throw new Error("Invalid Provider");
    }
    const token = authState.accessToken as AccessTokenOf<
      typeof cloudStorageType
    >;
    const update = async (newState: AuthState<unknown>) => {
      try {
        setAuthState(() => newState);
        return true;
      } catch {
        return false;
      }
    };
    return providers[cloudStorageType].create(token, update);
  }, [cloudStorageType, authState.accessToken]);

  useAsync(async () => {
    try {
      const res = await cloudService.checkAuth();
      setAuthState((authState) => {
        const now = Date.now();

        if (
          authState?.authenticated &&
          authState.expiredDateTime &&
          authState.expiredDateTime < now
        ) {
          return res?.accessToken ? res : defaultAuthState;
        }
        return res?.accessToken ? res : authState || defaultAuthState;
      });
    } catch (error) {
      console.error("Auth error:", error);
    }
  }, [cloudService]);

  useEffect(() => {
    setCloudStorageService(() => ({
      instance: cloudService,
    }));
  }, [cloudService]);

  return <></>;
}
