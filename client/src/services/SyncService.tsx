import { useEffectWhen } from "hooks/useEffectWhen";
import { throttle } from "lodash";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import { usePrevious } from "react-use";
import { Layers, useLayers } from "slices/layers";
import { Settings, useSettings } from "slices/settings";
import sysend from "sysend";
import { instance, participant } from "./SyncParticipant";

export function useSyncStatus() {
  return useSyncExternalStore(
    (cb) => {
      participant.on("sync", cb);
      return () => participant.off("sync", cb);
    },
    () => participant.current
  );
}

type SyncedData = {
  initiator: string;
  commit: string;
  state: {
    settings?: Settings;
    layers?: Layers;
  };
};

export function SyncService() {
  const {
    isPrimary,
    isOnly,
    participants: participants,
    peers,
  } = useSyncStatus();
  const [settings, setSettings, , c1] = useSettings();
  const [layers, setLayers, , c2] = useLayers();
  // Apply
  useEffect(() => {
    sysend.on<SyncedData>("settings", ({ initiator, state, commit: c3 }) => {
      // Sync settings across everyone
      if (initiator !== instance && c3 !== c1)
        setSettings((prev) => state.settings ?? prev, true);
    });
    sysend.on<SyncedData>("layers", ({ initiator, state, commit: c3 }) => {
      // Sync layers only across same channel
      if (
        initiator !== instance &&
        participants.includes(initiator) &&
        c3 !== c2
      )
        setLayers((prev) => state.layers ?? prev, true);
    });
    return () => {
      sysend.off("settings");
      sysend.off("layers");
    };
  }, [c1, c2, setSettings, setLayers, participants]);
  // Broadcast
  useEffect(() => {
    if (peers.length) {
      sysend.broadcast<SyncedData>("settings", {
        initiator: instance,
        state: { settings },
        commit: c1,
      });
    }
  }, [c1, peers.length]);
  const previous = usePrevious(c2);
  const broadCastLayers = useMemo(
    () =>
      throttle(
        (...args: Parameters<typeof sysend.broadcast<SyncedData>>) =>
          sysend.broadcast(...args),
        300
      ),
    []
  );
  // Any changes
  useEffectWhen(
    () => {
      if (previous && participants.length) {
        broadCastLayers("layers", {
          initiator: instance,
          state: { layers },
          commit: c2,
        });
      }
    },
    [c2, participants.length],
    [previous, c2]
  );
  // Primary broadcasts to new
  useEffectWhen(
    () => {
      if (!isOnly && isPrimary) {
        broadCastLayers("layers", {
          initiator: instance,
          state: { layers },
          commit: c2,
        });
      }
    },
    [c2, participants.length, isOnly, isPrimary],
    [participants.length]
  );

  return <></>;
}
