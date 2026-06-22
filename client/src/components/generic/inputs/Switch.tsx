import { ReactNode } from "react";
import {
  FormControlLabel,
  Switch as MuiSwitch,
  SwitchProps as MuiSwitchProps,
} from "@mui/material";

type SwitchProps = { label?: ReactNode } & MuiSwitchProps;

export function Switch({ label: labelProp, ...props }: SwitchProps) {
  // Default moved out of the destructure: `{ label = ... }` makes React Compiler bail.
  // `label` is ReactNode (can be null), so preserve exact undefined-only default semantics.
  const label = labelProp === undefined ? <></> : labelProp;
  return <FormControlLabel control={<MuiSwitch defaultChecked {...props} />} {...{ label }} />;
}
