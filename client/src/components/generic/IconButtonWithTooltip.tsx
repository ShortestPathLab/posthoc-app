import {
  IconButton,
  IconButtonProps,
  Tooltip,
  TooltipProps,
} from "@mui/material";
import { startCase } from "lodash";
import { ReactNode } from "react";

type IconButtonWithTooltipProps = {
  label: string;
  icon: ReactNode;
  slotProps?: {
    tooltip?: Partial<TooltipProps>;
  };
} & IconButtonProps;

export function IconButtonWithTooltip({
  label,
  icon,
  slotProps,
  ...rest
}: IconButtonWithTooltipProps) {
  return (
    <Tooltip title={startCase(label)} key={label} {...slotProps?.tooltip}>
      <span>
        <IconButton {...rest}>{icon}</IconButton>
      </span>
    </Tooltip>
  );
}
