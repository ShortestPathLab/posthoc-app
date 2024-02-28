import { ReplayOutlined as ResetIcon } from "@mui/icons-material";
import { Box } from "@mui/material";
import { defaultTransport } from "client";
import { FeaturePickerButton } from "components/app-bar/FeaturePickerButton";
import { ListEditor } from "components/generic/ListEditor";
import { debounce } from "lodash";
import { defaultRemotes, Remote, useSettings } from "slices/settings";
import { ServerEditor } from "./ServerEditor";

export function ServerListEditor() {
  const [{ remote }, setSettings] = useSettings();
  return (
    <Box sx={{ mx: -2 }}>
      <ListEditor<Remote>
        sortable
        button={false}
        editor={(v) => <ServerEditor value={v} />}
        icon={null}
        value={remote}
        onChange={debounce((v) => setSettings(() => ({ remote: v })), 300)}
        addItemLabel="Add Solver"
        create={() => ({
          transport: defaultTransport,
          url: "",
          disabled: true,
        })}
        addItemExtras={
          <FeaturePickerButton
            icon={<ResetIcon />}
            sx={{ ml: 2 }}
            onClick={() => setSettings(() => ({ remote: defaultRemotes }))}
          >
            Reset to Defaults
          </FeaturePickerButton>
        }
      />
    </Box>
  );
}
