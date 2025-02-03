import { ReplayOutlined as ResetIcon } from "@mui-symbols-material/w400";
import { Box } from "@mui/material";
import { defaultTransport } from "client";
import { FeaturePickerButton } from "components/app-bar/FeaturePickerButton";
import { ListEditor } from "components/generic/list-editor/ListEditor";
import { debounce, head } from "lodash";
import { defaultRemotes, Remote, useSettings } from "slices/settings";
import { ServerEditor } from "./ServerEditor";

export function ServerListEditor() {
  const [{ remote }, setSettings] = useSettings();
  return (
    <Box sx={{ mx: -2 }}>
      <ListEditor<Remote>
        sortable
        editor={(v) => <ServerEditor value={v} />}
        icon={null}
        value={remote}
        onChange={debounce((v) => setSettings(() => ({ remote: v })), 300)}
        addItemLabel="Add adapter"
        create={() => ({
          transport: defaultTransport,
          url: "",
          disabled: true,
        })}
        addItemExtras={
          <FeaturePickerButton
            icon={<ResetIcon />}
            onClick={() => setSettings(() => ({ remote: defaultRemotes }))}
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
