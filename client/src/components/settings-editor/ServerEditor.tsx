import {
  Switch,
  TextField,
  Tooltip,
  Typography as Type,
} from "@material-ui/core";
import { EditTwoTone as EditIcon } from "@material-ui/icons";
import { Box } from "@material-ui/system";
import { Flex } from "components/generic/Flex";
import { IconButtonWithTooltip as IconButton } from "components/generic/IconButtonWithTooltip";
import {
  AppBarTitle as Title,
  ManagedModal as Dialog,
} from "components/generic/Modal";
import { OverlineDot as Dot } from "components/generic/Overline";
import { Space } from "components/generic/Space";
import { useConnection } from "hooks/useConnectionResolver";
import { useConnectionStatus } from "hooks/useConnectionStatus";
import { entries, startCase } from "lodash";
import { merge } from "slices/reducers";
import { Remote } from "slices/settings";
import { SelectField as Select } from "components/generic/Select";
import { transports } from "client/getTransport";

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
  const status = useConnectionStatus(value.url);

  function handleChange(next: Partial<Remote>) {
    return onValueChange?.(merge(value, next));
  }

  return (
    <>
      <Flex alignItems="center" py={0.5}>
        <Dot sx={{ color: statusColor[status] }} />
        <Space />
        <Box flex={1}>
          <Type>
            {connection
              ? `${connection.name} ${connection.version}`
              : startCase(status)}
          </Type>
          <Type variant="body2" color="text.secondary">
            {value?.url || "No URL"}
          </Type>
        </Box>
        <Tooltip title={`${value.disabled ? "Enable" : "Disable"} Connection`}>
          <Box>
            <Switch
              checked={!value.disabled}
              onChange={(_, v) => handleChange({ disabled: !v })}
            />
          </Box>
        </Tooltip>
        <Dialog
          trigger={(onClick) => (
            <IconButton
              icon={<EditIcon />}
              label="Edit Connection"
              {...{ onClick }}
            />
          )}
          appBar={{ children: <Title>Edit Connection</Title> }}
        >
          <Box p={2.5}>
            <TextField
              value={value.url}
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
