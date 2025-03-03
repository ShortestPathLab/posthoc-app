import { ReplayOutlined as ResetIcon } from "@mui-symbols-material/w400";
import { Box } from "@mui/material";
import { defaultTransport } from "client";
import { FeaturePickerButton } from "components/app-bar/FeaturePickerButton";
import { ListEditor } from "components/generic/list-editor/ListEditor";
import { head } from "lodash-es";
import { useSetting } from "pages/SettingsPage";
import { Renderer, defaultRenderers } from "slices/settings";
import { RendererEditor } from "./RendererEditor";

export function RendererListEditor() {
  const [renderers, setRenderers] = useSetting("renderer", []);
  return (
    <Box sx={{ mx: -2 }}>
      <ListEditor<Renderer>
        sortable
        renderEditor={({ props, handle, extras }) => (
          <>
            {handle}
            <RendererEditor {...props} />
            {extras}
          </>
        )}
        icon={null}
        value={renderers}
        onChange={setRenderers}
        addItemLabel="Add renderer"
        create={() => ({
          transport: defaultTransport,
          url: "",
          disabled: true,
        })}
        addItemExtras={
          <FeaturePickerButton
            icon={<ResetIcon />}
            onClick={() => setRenderers(() => defaultRenderers)}
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
