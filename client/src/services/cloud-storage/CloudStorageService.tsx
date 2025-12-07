import { has } from "lodash-es";
import { useEffect } from "react";
import { useAsync } from "react-async-hook";
import { useLatest } from "react-use";
import { slice } from "slices";
import { useAuth } from "slices/auth";
import { useCloudStorageService } from "slices/cloudStorage";
import { defaultCloudStorage } from "slices/settings";
import { assert } from "utils/assert";
import providers from "./providers";

function useCloudStorageManager(provider: keyof typeof providers) {
  "use no memo";
  //
  // ─── Create Storage Provider ─────────────────────────────────────────

  assert(has(providers, provider), "provider exists");
  const [{ [provider]: s }, setAuthState, initialised] = useAuth();
  const state = useLatest(s);
  const { result: service } = useAsync(async () => {
    if (!initialised) return;
    const service = providers[provider].create(
      async () => state.current,
      async (s) => setAuthState(() => ({ [provider]: s })),
    );
    await service.authenticate();
    return service;
  }, [provider, state, initialised]);

  // ─── Publicise Changes ───────────────────────────────────────────────

  const [, setCloudStorageService] = useCloudStorageService();
  useEffect(() => {
    setCloudStorageService(() => ({ instance: service }));
  }, [service]);
}

export function CloudStorageService() {
  "use no memo";
  const { cloudStorageType = defaultCloudStorage } = slice.settings.use();
  useCloudStorageManager(cloudStorageType);
}
