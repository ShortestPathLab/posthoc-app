import { HideSourceOutlined as HiddenIcon } from "@material-ui/icons";
import { Overline, OverlineDot as Dot } from "components/generic/Overline";
import { getColorHex } from "components/renderer/colors";
import { TraceEvent } from "protocol/Trace";

export function EventLabel({
  event,
  hidden,
}: {
  event?: TraceEvent;
  hidden?: boolean;
}) {
  return (
    <Overline>
      <Dot
        sx={{
          color: getColorHex(event?.type),
          mr: 1,
        }}
      />
      {`${event?.type ?? "unsupported"} #${event?.id ?? "-"}`}{" "}
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
