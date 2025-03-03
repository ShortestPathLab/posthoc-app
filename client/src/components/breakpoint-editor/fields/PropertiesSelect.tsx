import { Typography } from "@mui/material";
import { SelectField as Select } from "components/generic/inputs/Select";
import { Space } from "components/generic/Space";
import { DebugLayerData } from "hooks/useBreakPoints";
import { entries, map, trimStart } from "lodash-es";
import { useComputeLabels } from "pages/tree/TreeUtility";
import { slice } from "slices";
import { Layer } from "slices/layers";
import { equal } from "slices/selector";
import { UploadedTrace } from "slices/UIState";
import { BreakpointFieldProps } from "../breakpoints/Breakpoint";

function useData(layer?: string) {
  "use no memo";
  const one = slice.layers.one<Layer<DebugLayerData>>(layer);
  const trace = one.use<UploadedTrace | undefined>(
    (l) => l?.source?.trace,
    equal("key")
  );
  return useComputeLabels({ key: trace?.key, trace: trace?.content });
}

export const PropertiesSelect = ({
  layer,
  ...props
}: BreakpointFieldProps<string>) => {
  const { data } = useData(layer);
  return (
    <Select
      disabled={props.disabled}
      variant="outlined"
      placeholder="Property"
      sx={{
        minWidth: 160,
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
      items={map(entries(data), ([c, v]) => ({
        value: trimStart(c, "."),
        label: (
          <>
            {`$${c}`}
            <Space />
            <Typography color="text.secondary" variant="body1" component="span">
              {v.type}
            </Typography>
          </>
        ),
      }))}
      defaultValue={props.properties?.[0]}
      onChange={(v) => props.onChange?.(v)}
      value={props?.value ?? ""}
    />
  );
};
