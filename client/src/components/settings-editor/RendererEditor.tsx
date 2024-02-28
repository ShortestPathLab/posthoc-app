import { EditOutlined as EditIcon } from "@mui/icons-material";
import {
  Box,
  Chip,
  Switch,
  TextField,
  Tooltip,
  Typography as Type,
} from "@mui/material";
import { entries, find, join, omit, startCase } from "lodash";
import { Flex } from "components/generic/Flex";
import { IconButtonWithTooltip as IconButton } from "components/generic/IconButtonWithTooltip";
import {
  AppBarTitle as Title,
  ManagedModal as Dialog,
} from "components/generic/Modal";
import { OverlineDot as Dot } from "components/generic/Overline";
import { SelectField as Select } from "components/generic/Select";
import { Space } from "components/generic/Space";
import { transports } from "services/RendererService";
import { merge } from "slices/reducers";
import { useRenderers } from "slices/renderers";
import { Renderer } from "slices/settings";
import { usePaper } from "theme";

const statusColor = {
  connected: "success.light",
  connecting: "warning.light",
  error: "error.light",
  disabled: "text.disabled",
};

type RendererEditorProps = {
  value: Renderer;
  onValueChange?: (e: Renderer) => void;
};

export function RendererEditor({ value, onValueChange }: RendererEditorProps) {
  const [renderers] = useRenderers();
  const paper = usePaper();

  const current = find(renderers, { key: value.key });

  function handleChange(next: Partial<Renderer>) {
    onValueChange?.(merge(value, next));
  }

  const status = value?.disabled ? "disabled" : current ? "connected" : "error";

  return (
    <>
      <Flex alignItems="center" py={1}>
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
          <Type>
            {current
              ? `${current.renderer.meta.name} ${current.renderer.meta.version}`
              : startCase(status)}
          </Type>
          <Type variant="body2" color="text.secondary">
            {current ? (
              <>
                <span>{current.renderer.meta.description}</span>
                <br />
                <span>
                  Contributes: {join(current.renderer.meta.components, ", ")}
                </span>
              </>
            ) : (
              value?.url || "No URL"
            )}
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
        <Tooltip title={`${value.disabled ? "Enable" : "Disable"} Renderer`}>
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
              label="Edit Renderer"
              sx={{ mr: -3 }}
              {...{ onClick }}
            />
          )}
          appBar={{ children: <Title>Edit Renderer</Title> }}
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
              placeholder="Renderer Type"
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
