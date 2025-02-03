import { useMemo } from "react";
import {
  CloudStorageProvider,
  cloudStorageProviders,
} from "services/cloud-storage";
import { useAuth } from "./auth";
import { createSlice } from "./createSlice";

type CloudStorageServiceSlice = {
  instance?: CloudStorageProvider<keyof typeof cloudStorageProviders, unknown>;
};
export const [useCloudStorageService, CloudStorageServiceProvider] =
  createSlice<CloudStorageServiceSlice>({});

/**
 * Returns the current CloudStorageProviderMeta and CloudStorageProvider instance.
 * If the instance is not available, returns undefined.
 *
 * @example
 * const { meta, instance } = useCloudStorage() ?? {}
 * if (instance) {
 *   const file = await instance.getFile("FILE_ID")
 *   // ...
 * }
 *
 */
export function useCloudStorageInstance() {
  const [{ instance }] = useCloudStorageService();
  const [authState] = useAuth();
  return useMemo(() => {
    if (instance)
      return {
        auth: authState[instance.id],
        meta: cloudStorageProviders[instance.id],
        instance,
      };
  }, [instance, authState]);
}
