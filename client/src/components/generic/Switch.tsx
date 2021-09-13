import {
  FormControlLabel,
  Switch as MuiSwitch,
  SwitchProps as MuiSwitchProps,
} from "@material-ui/core";
import { ReactNode } from "react";

type SwitchProps = { label?: ReactNode } & MuiSwitchProps;

export function Switch({ label = <></>, ...props }: SwitchProps) {
  return (
    <FormControlLabel
      control={<MuiSwitch defaultChecked {...props} />}
      {...{ label }}
    />
  );
}
