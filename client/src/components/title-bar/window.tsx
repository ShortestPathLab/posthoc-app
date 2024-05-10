import { nanoid } from "nanoid";
import { channel } from "services/SyncParticipant";

export function openWindow({
  linked = true,
  minimal = true,
  page = "",
}: { linked?: boolean; minimal?: boolean; page?: string } = {}) {
  const url = new URL(`${location.origin}${location.pathname}`);
  url.searchParams.set("channel", linked ? channel : nanoid());
  if (minimal) url.searchParams.set("minimal", "1");
  if (page) url.searchParams.set("page", page);
  window.open(
    url,
    "_blank",
    "toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=no, copyhistory=yes, width=800, height=600"
  );
}
