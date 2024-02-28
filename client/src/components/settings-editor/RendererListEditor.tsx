import { ReplayOutlined as ResetIcon } from "@mui/icons-material";
import { Box } from "@mui/material";
import { defaultTransport } from "client";
import { FeaturePickerButton } from "components/app-bar/FeaturePickerButton";
import { ListEditor } from "components/generic/ListEditor";
import { debounce } from "lodash";
import { Renderer, defaultRenderers, useSettings } from "slices/settings";
import { RendererEditor } from "./RendererEditor";

export function RendererListEditor() {
  const [{ renderer }, setSettings] = useSettings();
  return (
    <Box sx={{ mx: -2 }}>
      <ListEditor<Renderer>
        sortable
        button={false}
        editor={(v) => <RendererEditor value={v} />}
        icon={null}
        value={renderer}
        onChange={debounce((v) => setSettings(() => ({ renderer: v })), 300)}
        addItemLabel="Add Renderer"
        create={() => ({
          transport: defaultTransport,
          url: "",
          disabled: true,
        })}
        addItemExtras={
          <FeaturePickerButton
            icon={<ResetIcon />}
            sx={{ ml: 2 }}
            onClick={() => setSettings(() => ({ renderer: defaultRenderers }))}
          >
            Reset to Defaults
          </FeaturePickerButton>
        }
      />
    </Box>
  );
}
