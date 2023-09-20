import { Button, ButtonProps, Tooltip } from "@mui/material";
import { startCase } from "lodash";

type ButtonWithTooltipProps = {
  label: string;
  children: React.ReactNode;
} & ButtonProps;

export function ButtonWithTooltip({
  label,
  children,
  ...rest
}: ButtonWithTooltipProps) {
  return (
    <>
      <Tooltip title={startCase(label)} key={label}>
        <span>
          <Button {...rest}>{children}</Button>
        </span>
      </Tooltip>
    </>
  );
}