import {
  Box,
  Chip,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography as Type,
  debounce,
} from "@mui/material";
import { transports } from "client";
import { Block } from "components/generic/Block";
import { Surface } from "components/generic/surface";
import { SelectField as Select } from "components/generic/inputs/Select";
import { useConnection } from "hooks/useConnectionResolver";
import { useConnectionStatus } from "hooks/useConnectionStatus";
import { entries, omit, startCase } from "lodash";
import { useMemo } from "react";
import { merge } from "slices/reducers";
import { Remote } from "slices/settings";
import { usePaper } from "theme";
import { EditorProps } from "components/Editor";
import { assert } from "utils/assert";

const statusColor = {
  connected: "success.light",
  connecting: "warning.light",
  error: "error.light",
  "not-connected": "text.disabled",
};
export function ServerEditor({ value, onChange }: EditorProps<Remote>) {
  assert(value, "server is defined");
  const connection = useConnection(value.url);
  const paper = usePaper();
  const status = useConnectionStatus(value.url);

  const handleChange = useMemo(
    () =>
      debounce((next: Partial<Remote>) => {
        onChange?.(merge(value, next));
      }, 300),
    [onChange, value]
  );

  return (
    <>
      <Block alignItems="center">
        <Surface
          slotProps={{
            paper: { sx: { width: 480 } },
            popover: {
              anchorOrigin: { horizontal: -18, vertical: "bottom" },
            },
          }}
          popover
          trigger={({ open }) => (
            <Stack
              direction="row"
              flex={1}
              alignItems="center"
              sx={{ py: 1, mr: -3 }}
            >
              <Stack
                className={value.key}
                direction="row"
                flex={1}
                alignItems="center"
                onClick={open}
              >
                <Box
                  flex={1}
                  sx={{
                    width: 0,
                    overflow: "hidden",
                    "> *": {
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                    },
                  }}
                >
                  <Type component="div">
                    {connection
                      ? `${connection.name} ${connection.version}`
                      : startCase(status)}
                  </Type>
                  {!!connection?.description && (
                    <Type
                      component="div"
                      variant="body2"
                      color="text.secondary"
                    >
                      {connection.description}
                    </Type>
                  )}
                  <Type component="div" variant="body2" color="text.secondary">
                    {transports[value?.transport]?.name}
                    {": "}
                    {value?.url || "No URL"}
                  </Type>
                </Box>
                <Chip
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    maxWidth: "fit-content",
                    mx: 1,
                    color: statusColor[status],
                    ...omit(paper(1), "borderRadius"),
                  }}
                  size="small"
                  label={startCase(status)}
                />
              </Stack>
              <Tooltip
                title={`${value.disabled ? "Enable" : "Disable"} adapter`}
              >
                <Box>
                  <Switch
                    defaultChecked={!value.disabled}
                    onChange={(_, v) => handleChange({ disabled: !v })}
                  />
                </Box>
              </Tooltip>
            </Stack>
          )}
          title="Edit Adapter"
        >
          <Box p={2.5}>
            <TextField
              autoFocus
              defaultValue={value.url}
              onChange={(e) => handleChange({ url: e.target.value })}
              fullWidth
              variant="filled"
              label="URL"
              sx={{ mb: 2 }}
            />
            <Select
              placeholder="Connection Type"
              items={entries(transports).map(([k, { name }]) => ({
                value: k,
                label: name,
              }))}
              fullWidth
              value={value.transport}
              onChange={(v) => handleChange({ transport: v })}
            />
          </Box>
        </Surface>
      </Block>
    </>
  );
}
