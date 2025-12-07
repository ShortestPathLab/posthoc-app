import { throttle } from "lodash-es";
import { useEffect, useState, useSyncExternalStore } from "react";
import { slice } from "slices";
import sysend from "sysend";
import useWindowFocus from "use-window-focus";
import { participant } from "./SyncParticipant";
import { Layer } from "slices/layers";

export function useSyncStatus() {
  return useSyncExternalStore(
    (cb) => {
      participant.on("sync", cb);
      return () => participant.off("sync", cb);
    },
    () => participant.current
  );
}

type Data = {
  layers: Layer[];
};

export function SyncService() {
  const isFocused = useWindowFocus();
  const { isOnly, isPrimary, loading } = useSyncStatus();
  // Init query
  useEffect(
    () => void (!loading && !isOnly && sysend.broadcast("sync")),
    [loading]
  );
  // Init response
  useEffect(() => {
    if (loading) return;
    if (isPrimary) {
      const f = () => sysend.broadcast("init", { layers: slice.layers.get() });
      sysend.on("sync", f);
      return () => sysend.off("sync", f);
    } else {
      const f = ({ layers }: Data) => slice.layers.set(layers);
      sysend.on("init", f);
      return () => sysend.off("init", f);
    }
  }, [isPrimary, loading]);
  // Broadcast
  useEffect(() => {
    if (isOnly) return;
    return slice.layers.onChange((layers) =>
      sysend.broadcast("update", { layers })
    );
  }, [isOnly]);
  // Receive
  useEffect(() => {
    if (isOnly) return;
    if (isFocused) return;
    const f = throttle(
      ({ layers }: Data) => slice.layers.set(layers),
      1000 / 24
    );
    sysend.on("update", f);
    return () => sysend.off("update", f);
  }, [isOnly, isFocused]);

  return <></>;
}

export function useActive() {
  const { participants } = useSyncStatus();
  const [isActive, setActive] = useState(false);
  const isFocused = useWindowFocus();
  useEffect(() => {
    if (isFocused && !isActive) {
      sysend.broadcast("active", sysend.id);
      setActive(true);
    }
  }, [isFocused, isActive]);
  useEffect(() => {
    const f = (id: string) => {
      if (participants.includes(id)) setActive(id === sysend.id);
    };
    sysend.on("active", f);
    return () => sysend.off("active", f);
  }, [JSON.stringify(participants)]);
  return isActive;
}
