import { Box, Divider, TextField, Typography } from "@mui/material";
import { find, last, map, startCase } from "lodash";
import { comparators } from "./comparators";
import { eventTypes } from "./eventTypes";
import { SelectField as Select } from "components/generic/inputs/Select";
import { Space } from "components/generic/Space";
import { Switch } from "components/generic/inputs/Switch";
import { BreakpointFieldProps } from "hooks/useBreakPoints2";

export const EventSelect = (props: BreakpointFieldProps<string>) => {
  return (
    <Box display="flex">
      <Select
        placeholder="Event"
        sx={{ minWidth: 160 }}
        items={map(eventTypes, (c) => ({ value: c, label: startCase(c) }))}
        onChange={(v) => props.onChange?.(v)}
        value={props?.value}
      />
      <Divider flexItem orientation="vertical" sx={{ mx: 2 }} />
    </Box>
  );
};

export const PropertiesSelect = (props: BreakpointFieldProps<string>) => {
  return (
    <Box display="flex">
      <Select
        placeholder="Property"
        sx={{
          minWidth: 140,
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
        items={map(props.properties, (c) => ({
          value: c,
          label: (
            <>
              {last(c.split("."))}
              <Space />
              <Typography
                color="text.secondary"
                variant="body2"
                component="span"
              >{`$.${c}`}</Typography>
            </>
          ),
        }))}
        defaultValue={props.properties?.[0]}
        onChange={(v) => props.onChange?.(v)}
        value={props?.value}
      />
      <Space />
    </Box>
  );
};

export const ConditionSelect = (props: BreakpointFieldProps<string>) => {
  return (
    <Box display="flex">
      <Select
        placeholder="Condition"
        items={props.conditions?.map((c) => ({
          value: c,
          label: startCase(c),
        }))}
        value={props.value}
        onChange={(v) => {
          props.onChange?.(v);
        }}
      />
      <Space />
    </Box>
  );
};

export const ReferenceInput = (props: BreakpointFieldProps<number>) => {
  return (
    <Box display="flex">
      <TextField
        label="Reference"
        fullWidth
        defaultValue={`${props.value ?? 0}`}
        variant="filled"
        onChange={(v) => props.onChange?.(+v.target.value)}
        type="number"
        disabled={props.disabled}
        slotProps={{
          htmlInput: { inputMode: "numeric", pattern: "[0-9]*" },
        }}
      />
      <Space />
    </Box>
  );
};

export const BreakPointSwitch = (props: BreakpointFieldProps<boolean>) => {
  return (
    <Box display="flex">
      <Switch
        checked={!!props?.value}
        onChange={(_, v) => props?.onChange?.(v)}
        sx={{ mr: -4 }}
        value={props.value}
      />
    </Box>
  );
};
