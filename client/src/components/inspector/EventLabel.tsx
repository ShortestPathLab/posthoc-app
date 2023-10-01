import { HideSourceOutlined as HiddenIcon } from "@mui/icons-material";
import { startCase } from "lodash";
import { TraceEvent } from "protocol/Trace";
import { Overline } from "components/generic/Overline";

export function EventLabel({
  event,
  hidden,
}: {
  event?: TraceEvent;
  hidden?: boolean;
}) {
  return (
    <Overline>
      {startCase(`${event?.type ?? "unsupported"} #${event?.id ?? "-"}`)}{" "}
      {hidden && (
        <HiddenIcon
          sx={{
            opacity: 0.56,
            fontSize: 12,
            ml: 1,
            transform: "translateY(1.75px)",
          }}
        />
      )}
    </Overline>
  );
}