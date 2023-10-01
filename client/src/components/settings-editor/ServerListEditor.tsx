import { ReplayOutlined as ResetIcon } from "@mui/icons-material";
import { Button } from "@mui/material";
import { debounce } from "lodash";
import { ServerEditor } from "./ServerEditor";
import { defaultTransport } from "client";
import { ListEditor } from "components/generic/ListEditor";
import { defaultRemotes, Remote, useSettings } from "slices/settings";

export function ServerListEditor() {
  const [{ remote }, setSettings] = useSettings();
  return (
    <>
      <ListEditor<Remote>
        editor={(v) => <ServerEditor value={v} />}
        icon={null}
        value={remote}
        onChange={debounce((v) => setSettings({ remote: v }), 300)}
        addItemLabel="Add Solver"
        create={() => ({
          transport: defaultTransport,
          url: "",
          disabled: true,
        })}
        extras={
          <Button
            startIcon={<ResetIcon />}
            sx={{ ml: 2 }}
            onClick={() => setSettings({ remote: defaultRemotes })}
          >
            Reset to Defaults
          </Button>
        }
      />
    </>
  );
}