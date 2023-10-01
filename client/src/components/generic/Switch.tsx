import { ReactNode } from "react";
import {
  FormControlLabel,
  Switch as MuiSwitch,
  SwitchProps as MuiSwitchProps,
} from "@mui/material";


type SwitchProps = { label?: ReactNode } & MuiSwitchProps;

export function Switch({ label = <></>, ...props }: SwitchProps) {
  return (
    <FormControlLabel
      control={<MuiSwitch defaultChecked {...props} />}
      {...{ label }}
    />
  );
}