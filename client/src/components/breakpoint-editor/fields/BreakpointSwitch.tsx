import { Switch } from "components/generic/inputs/Switch";
import { BreakpointFieldProps } from "../breakpoints/Breakpoint";
import { Block } from "components/generic/Block";
import { Tooltip } from "@mui/material";

export const BreakpointSwitch = (props: BreakpointFieldProps<boolean>) => {
  return (
    <Block sx={{ flex: 1, justifyContent: "flex-end", ml: 4 }}>
      <Tooltip title={props.value ? "Disable" : "Enable"}>
        <Switch
          disabled={props.disabled}
          checked={!!props?.value}
          onChange={(_, v) => props?.onChange?.(v)}
          sx={{ mr: -4, flex: 1, alignSelf: "flex-end" }}
          value={props.value}
        />
      </Tooltip>
    </Block>
  );
};
