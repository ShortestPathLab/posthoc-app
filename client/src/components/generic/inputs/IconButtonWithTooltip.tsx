import {
  IconButton,
  IconButtonProps,
  Tooltip,
  TooltipProps,
} from "@mui/material";
import { startCase } from "lodash-es";
import { ReactNode } from "react";

export type IconButtonWithTooltipProps = {
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
      <IconButton {...rest}>{icon}</IconButton>
    </Tooltip>
  );
}
