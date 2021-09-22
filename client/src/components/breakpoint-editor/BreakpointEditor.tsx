import { Divider, TextField, Typography as Type } from "@material-ui/core";
import { Flex } from "components/generic/Flex";
import { SelectField as Select } from "components/generic/Select";
import { Space } from "components/generic/Space";
import { Switch } from "components/generic/Switch";
import { find, last, map, startCase } from "lodash";
import { Breakpoint } from "slices/UIState";
import { comparators } from "./comparators";
import { eventTypes } from "./eventTypes";

type BreakpointEditorProps = {
  value: Breakpoint;
  onValueChange?: (v: Breakpoint) => void;
  properties?: string[];
};

export function BreakpointEditor({
  value,
  onValueChange: onChange,
  properties,
}: BreakpointEditorProps) {
  function handleChange(next: Partial<Breakpoint>) {
    onChange?.({ ...value, ...next });
  }
  return (
    <Flex>
      <Select
        placeholder="Event"
        sx={{ minWidth: 160 }}
        items={map(eventTypes, (c) => ({ value: c, label: startCase(c) }))}
        onChange={(v) => handleChange({ type: v === "any" ? undefined : v })}
        value={value.type ?? "any"}
      />
      <Divider flexItem orientation="vertical" sx={{ mx: 2 }} />
      <Select
        placeholder="Property"
        sx={{
          minWidth: 140,
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
        items={map(properties, (c) => ({
          value: c,
          label: (
            <>
              {last(c.split("."))}
              <Space />
              <Type
                color="textSecondary"
                variant="body2"
                component="span"
              >{`event.${c}`}</Type>
            </>
          ),
        }))}
        onChange={(v) => handleChange({ property: v })}
        value={value.property}
      />
      <Space />
      <Select
        placeholder="Condition"
        items={comparators.map((c) => ({
          value: c.key,
          label: startCase(c.key),
        }))}
        value={value?.condition?.key ?? comparators?.[0]?.key}
        onChange={(v) =>
          handleChange({ condition: find(comparators, { key: v }) })
        }
      />
      <Space />
      <TextField
        label="Reference"
        fullWidth
        value={`${value.reference ?? 0}`}
        variant="filled"
        inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
        onChange={(v) => handleChange({ reference: +v.target.value })}
        type="number"
      />
      <Space sx={{ px: 2 }} />
      <Switch
        checked={!!value.active}
        onChange={(_, v) => handleChange({ active: v })}
      />
    </Flex>
  );
}
