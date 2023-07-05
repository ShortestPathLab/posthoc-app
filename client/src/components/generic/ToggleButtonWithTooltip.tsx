import { ToggleButtonProps, ToggleButton, Tooltip } from "@mui/material";
import { startCase } from "lodash";
import { ReactNode } from "react";

type ToggleButtonWithTooltipProps = {
  label: string;
  icon: ReactNode;
  value: string;
} & ToggleButtonProps;

export function ToggleButtonWithTooltip({
  label,
  icon,
  ...rest
}: ToggleButtonWithTooltipProps) {
  return (
    <Tooltip title={startCase(label)} key={label}>
      <span>
        <ToggleButton {...rest}>{icon}</ToggleButton>
      </span>
    </Tooltip>
  );
}
