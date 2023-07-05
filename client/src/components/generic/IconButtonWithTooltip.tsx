import { IconButton, IconButtonProps, Tooltip } from "@mui/material";
import { startCase } from "lodash";
import { ReactNode } from "react";

type IconButtonWithTooltipProps = {
  label: string;
  icon: ReactNode;
} & IconButtonProps;

export function IconButtonWithTooltip({
  label,
  icon,
  ...rest
}: IconButtonWithTooltipProps) {
  return (
    <Tooltip title={startCase(label)} key={label}>
      <span>
        <IconButton {...rest}>{icon}</IconButton>
      </span>
    </Tooltip>
  );
}
