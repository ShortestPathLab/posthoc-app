import { EditOutlined as EditIcon } from "@mui/icons-material";
import {
  Box,
  Chip,
  Switch,
  TextField,
  Tooltip,
  Typography as Type,
  debounce,
} from "@mui/material";
import { transports } from "client";
import { Flex } from "components/generic/Flex";
import { IconButtonWithTooltip as IconButton } from "components/generic/IconButtonWithTooltip";
import {
  ManagedModal as Dialog,
  AppBarTitle as Title,
} from "components/generic/Modal";
import { OverlineDot as Dot } from "components/generic/Overline";
import { SelectField as Select } from "components/generic/Select";
import { Space } from "components/generic/Space";
import { useConnection } from "hooks/useConnectionResolver";
import { useConnectionStatus } from "hooks/useConnectionStatus";
import { entries, omit, startCase } from "lodash";
import { useMemo } from "react";
import { merge } from "slices/reducers";
import { Remote } from "slices/settings";
import { usePaper } from "theme";

const statusColor = {
  connected: "success.light",
  connecting: "warning.light",
  error: "error.light",
  "not-connected": "text.disabled",
};

type ServerEditorProps = {
  value: Remote;
  onValueChange?: (e: Remote) => void;
};

export function ServerEditor({ value, onValueChange }: ServerEditorProps) {
  const connection = useConnection(value.url);
  const paper = usePaper();
  const status = useConnectionStatus(value.url);

  const handleChange = useMemo(
    () =>
      debounce((next: Partial<Remote>) => {
        onValueChange?.(merge(value, next));
      }, 300),
    [onValueChange, value]
  );

  return (
    <>
      <Flex alignItems="center" py={0.5}>
        <Box flex={1}>
          <Type>
            {connection
              ? `${connection.name} ${connection.version}`
              : startCase(status)}
          </Type>
          <Type variant="body2" color="text.secondary">
            {connection?.description ?? (value?.url || "No URL")}
          </Type>
        </Box>
        <Chip
          sx={{
            mx: 1,
            color: statusColor[status],
            ...omit(paper(1), "borderRadius"),
          }}
          size="small"
          label={startCase(status)}
        />
        <Tooltip title={`${value.disabled ? "Enable" : "Disable"} Connection`}>
          <Box>
            <Switch
              defaultChecked={!value.disabled}
              onChange={(_, v) => handleChange({ disabled: !v })}
            />
          </Box>
        </Tooltip>
        <Dialog
          trigger={(onClick) => (
            <IconButton
              icon={<EditIcon />}
              label="Edit Connection"
              sx={{ mr: -3 }}
              {...{ onClick }}
            />
          )}
          appBar={{ children: <Title>Edit Connection</Title> }}
        >
          <Box p={2.5}>
            <TextField
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
        </Dialog>
      </Flex>
    </>
  );
}
