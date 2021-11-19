import { defaultTransport } from "client/getTransport";
import { ListEditor } from "components/generic/ListEditor";
import { debounce } from "lodash";
import { Remote, useSettings } from "slices/settings";
import { ServerEditor } from "./ServerEditor";

export function ServerListEditor() {
  const [{ remote }, setSettings] = useSettings();
  return (
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
    />
  );
}
