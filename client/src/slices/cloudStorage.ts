import { store } from "@davstack/store";
import { useMemo } from "react";
import { CloudStorageProvider, cloudStorageProviders } from "services/cloud-storage";
import { auth } from "./auth";
import { useOne } from "./useOne";

type CloudStorageServiceSlice = {
  instance?: CloudStorageProvider<keyof typeof cloudStorageProviders, unknown>;
};

export const cloudStorage = store<CloudStorageServiceSlice>(
  {},
  {
    name: "cloud-storage",
    devtools: { enabled: import.meta.env.DEV },
  },
);

/**
 * Returns the current CloudStorageProviderMeta and CloudStorageProvider instance.
 * If the instance is not available, returns undefined.
 *
 * @example
 * const { meta, instance } = useCloudStorageInstance() ?? {}
 * if (instance) {
 *   const file = await instance.getFile("FILE_ID")
 *   // ...
 * }
 *
 */
export function useCloudStorageInstance() {
  const instance = useOne(cloudStorage, (s) => s.instance);
  const authState = useOne(auth);
  return useMemo(() => {
    if (instance)
      return {
        auth: authState[instance.id],
        meta: cloudStorageProviders[instance.id],
        instance,
      };
  }, [instance, authState]);
}
