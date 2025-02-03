import { has } from "lodash";
import { useEffect } from "react";
import { useAsync } from "react-async-hook";
import { useLatest } from "react-use";
import { useAuth } from "slices/auth";
import { useCloudStorageService } from "slices/cloudStorage";
import { defaultCloudStorage, useSettings } from "slices/settings";
import { assert } from "utils/assert";
import providers from "./providers";

function useCloudStorageManager(provider: keyof typeof providers) {
  //
  // ─── Create Storage Provider ─────────────────────────────────────────

  assert(has(providers, provider), "provider exists");
  const [{ [provider]: s }, setAuthState, initialised] = useAuth();
  const state = useLatest(s);
  const { result: service } = useAsync(async () => {
    if (!initialised) return;
    const service = providers[provider].create(
      async () => state.current,
      async (s) => setAuthState(() => ({ [provider]: s }))
    );
    await service.checkAuth();
    return service;
  }, [provider, state, initialised]);

  // ─── Publicise Changes ───────────────────────────────────────────────

  const [, setCloudStorageService] = useCloudStorageService();
  useEffect(() => {
    setCloudStorageService(() => ({ instance: service }));
  }, [service]);
}

export function CloudStorageService() {
  const [{ cloudStorageType = defaultCloudStorage }] = useSettings();
  useCloudStorageManager(cloudStorageType);
}
