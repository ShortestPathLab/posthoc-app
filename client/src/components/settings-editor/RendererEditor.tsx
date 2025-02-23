import {
  Box,
  Chip,
  Switch,
  TextField,
  Tooltip,
  Typography as Type,
} from "@mui/material";
import { Block } from "components/generic/Block";
import { Surface } from "components/generic/surface";
import { SelectField as Select } from "components/generic/inputs/Select";
import { entries, find, join, omit, startCase } from "lodash";
import { transports } from "services/RendererService";
import { merge } from "slices/reducers";
import { useRenderers } from "slices/renderers";
import { Renderer } from "slices/settings";
import { usePaper } from "theme";
import { assert } from "utils/assert";

const statusColor = {
  connected: "success.light",
  connecting: "warning.light",
  error: "error.light",
  disabled: "text.disabled",
};

type RendererEditorProps = {
  value?: Renderer;
  onChange?: (e: Renderer) => void;
};

export function RendererEditor({
  value,
  onChange: onValueChange,
}: RendererEditorProps) {
  assert(value, "renderer is defined");

  const [renderers] = useRenderers();
  const paper = usePaper();

  const current = find(renderers, { key: value.key });

  function handleChange(next: Partial<Renderer>) {
    onValueChange?.(merge(value, next));
  }

  const status = value.disabled
    ? "disabled"
    : current?.renderer
    ? "connected"
    : "error";

  return (
    <Block alignItems="center" py={1}>
      <Surface
        slotProps={{
          paper: { sx: { width: 480 } },
          popover: {
            anchorOrigin: { horizontal: -18, vertical: "bottom" },
          },
        }}
        popover
        trigger={({ open }) => (
          <>
            <Box
              className={value.key}
              onClick={open}
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
                {current?.renderer
                  ? `${current?.renderer?.meta?.name} ${current.renderer?.meta?.version}`
                  : startCase(status)}
              </Type>
              {!!current?.renderer && (
                <Type component="div" variant="body2" color="text.secondary">
                  <>
                    <span>{current.renderer?.meta?.description}</span>
                    <br />
                    <span>
                      Contributes{" "}
                      {join(current.renderer?.meta?.components, ", ")}
                    </span>
                  </>
                </Type>
              )}
              <Type component="div" variant="body2" color="text.secondary">
                {transports[value.transport ?? "native"]?.name}
                {": "}
                {value.url || "No URL"}
              </Type>
            </Box>
            <Chip
              sx={{
                minWidth: 0,
                maxWidth: "fit-content",
                flex: 1,
                mx: 1,
                color: statusColor[status],
                ...omit(paper(1), "borderRadius"),
              }}
              size="small"
              label={startCase(status)}
            />
            <Tooltip
              title={`${value.disabled ? "Enable" : "Disable"} Renderer`}
            >
              <Switch
                sx={{ mr: 0 }}
                checked={!value.disabled}
                onChange={(_, v) => handleChange({ disabled: !v })}
              />
            </Tooltip>
          </>
        )}
        title="Edit Renderer"
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
      </Surface>
    </Block>
  );
}
