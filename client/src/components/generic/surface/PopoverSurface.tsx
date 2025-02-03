import { Box, Popover } from "@mui/material";
import { merge } from "lodash";
import { bindPopover } from "material-ui-popup-state";
import { PopupState as State } from "material-ui-popup-state/hooks";
import { ReactNode } from "react";
import { useAcrylic, usePaper } from "theme";
import { SlotProps } from "./SlotProps";
import { stopPropagation } from "./stopPropagation";

export function PopoverSurface({
  state,
  slotProps,
  children,
}: { state: State; slotProps?: Pick<SlotProps, "popover" | "paper"> } & {
  children: ReactNode;
}) {
  const paper = usePaper();
  const acrylic = useAcrylic();
  return (
    <Popover
      onMouseDown={stopPropagation}
      onTouchStart={stopPropagation}
      {...merge(
        bindPopover(state),
        { slotProps: { paper: { sx: acrylic } } },
        slotProps?.popover
      )}
    >
      <Box
        {...merge(
          { sx: { width: 360, ...acrylic, ...paper(1) } },
          slotProps?.paper
        )}
      >
        {children}
      </Box>
    </Popover>
  );
}
