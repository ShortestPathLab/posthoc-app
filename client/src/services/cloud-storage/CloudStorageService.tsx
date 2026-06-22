import { isEqual } from "es-toolkit";
import { has } from "es-toolkit/compat";
import { useEffect } from "react";
import { useAsync } from "react-async-hook";
import { useLatest } from "react-use";
import { slice } from "slices";
import { defaultCloudStorage } from "slices/settings";
import { assert } from "utils/assert";
import providers from "./providers";
import { useOne } from "slices/useOne";

function useCloudStorageManager(provider: keyof typeof providers) {
  //
  // ─── Create Storage Provider ─────────────────────────────────────────

  assert(has(providers, provider), "provider exists");
  const s = useOne(slice.auth, (a) => a[provider], isEqual);
  const state = useLatest(s);
  const { result: service } = useAsync(async () => {
    const service = providers[provider].create(
      async () => state.current,
      async (s) => slice.auth.set((a) => void (a[provider] = s)),
    );
    await service.authenticate();
    return service;
  }, [provider, state]);

  // ─── Publicise Changes ───────────────────────────────────────────────

  useEffect(() => {
    slice.cloudStorage.set({ instance: service });
  }, [service]);
}

export function CloudStorageService() {
  const { cloudStorageType = defaultCloudStorage } = useOne(slice.settings);
  useCloudStorageManager(cloudStorageType);
}
