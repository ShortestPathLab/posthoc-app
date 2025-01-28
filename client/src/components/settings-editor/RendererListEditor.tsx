import { ReplayOutlined as ResetIcon } from "@mui-symbols-material/w400";
import { Box } from "@mui/material";
import { defaultTransport } from "client";
import { FeaturePickerButton } from "components/app-bar/FeaturePickerButton";
import { ListEditor } from "components/generic/list-editor/ListEditor";
import { debounce, head } from "lodash";
import { Renderer, defaultRenderers, useSettings } from "slices/settings";
import { RendererEditor } from "./RendererEditor";

export function RendererListEditor() {
  const [{ renderer }, setSettings] = useSettings();
  return (
    <Box sx={{ mx: -2 }}>
      <ListEditor<Renderer>
        sortable
        editor={(v) => <RendererEditor value={v} />}
        icon={null}
        value={renderer}
        onChange={debounce((v) => setSettings(() => ({ renderer: v })), 300)}
        addItemLabel="Add renderer"
        create={() => ({
          transport: defaultTransport,
          url: "",
          disabled: true,
        })}
        addItemExtras={
          <FeaturePickerButton
            icon={<ResetIcon />}
            onClick={() => setSettings(() => ({ renderer: defaultRenderers }))}
          >
            Reset
          </FeaturePickerButton>
        }
        onFocus={(key) => {
          const element = head(document.getElementsByClassName(key));
          if (
            element &&
            "click" in element &&
            typeof element.click === "function"
          ) {
            element.click();
          }
        }}
      />
    </Box>
  );
}
