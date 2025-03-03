import { ReplayOutlined as ResetIcon } from "@mui-symbols-material/w400";
import { Box } from "@mui/material";
import { defaultTransport } from "client";
import { FeaturePickerButton } from "components/app-bar/FeaturePickerButton";
import { ListEditor } from "components/generic/list-editor/ListEditor";
import { head } from "lodash-es";
import { useSetting } from "pages/SettingsPage";
import { defaultRemotes, Remote } from "slices/settings";
import { ServerEditor } from "./ServerEditor";

export function ServerListEditor() {
  const [remote, setRemote] = useSetting("remote", []);
  return (
    <Box sx={{ mx: -2 }}>
      <ListEditor<Remote>
        sortable
        renderEditor={({ props, handle, extras }) => (
          <>
            {handle}
            <ServerEditor {...props} />
            {extras}
          </>
        )}
        icon={null}
        value={remote}
        onChange={setRemote}
        addItemLabel="Add adapter"
        create={() => ({
          transport: defaultTransport,
          url: "",
          disabled: true,
        })}
        addItemExtras={
          <FeaturePickerButton
            icon={<ResetIcon />}
            onClick={() => setRemote(() => defaultRemotes)}
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
