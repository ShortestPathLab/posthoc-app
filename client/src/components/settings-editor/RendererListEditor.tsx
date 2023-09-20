import { ReplayOutlined as ResetIcon } from "@mui/icons-material";
import { Button } from "@mui/material";
import { defaultTransport } from "client";
import { ListEditor } from "components/generic/ListEditor";
import { debounce } from "lodash";
import { defaultRenderers, Renderer, useSettings } from "slices/settings";
import { RendererEditor } from "./RendererEditor";

export function RendererListEditor() {
  const [{ renderer }, setSettings] = useSettings();
  return (
    <>
      <ListEditor<Renderer>
        editor={(v) => <RendererEditor value={v} />}
        icon={null}
        value={renderer}
        onChange={debounce((v) => setSettings({ renderer: v }), 300)}
        addItemLabel="Add Renderer"
        create={() => ({
          transport: defaultTransport,
          url: "",
          disabled: true,
        })}
        extras={
          <Button
            startIcon={<ResetIcon />}
            sx={{ ml: 2 }}
            onClick={() => setSettings({ renderer: defaultRenderers })}
          >
            Reset to Defaults
          </Button>
        }
      />
    </>
  );
}
