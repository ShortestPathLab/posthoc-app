import {
  CheckOutlined,
  DoneAllOutlined,
  ShieldOutlined,
} from "@mui/icons-material";
import { Link, Stack } from "@mui/material";
import { ReactNode } from "react";
import { Placeholder } from "./Placeholder";
import { useSettings } from "slices/settings";
import { Button } from "components/generic/Button";
import { producify } from "produce";
import { useUntrustedLayers as useUntrustedLayer } from "./useUntrustedLayers";
import { useUIState } from "slices/UIState";

export function TrustedContent({ children }: { children?: ReactNode }) {
  const { isTrusted, untrustedLayerOrigin } = useUntrustedLayer();

  const [, setSettings] = useSettings();
  const [, setUIState] = useUIState();
  return isTrusted ? (
    children
  ) : (
    <Placeholder
      icon={<ShieldOutlined />}
      label={
        untrustedLayerOrigin ? (
          <>
            Trust{" "}
            <Link href={untrustedLayerOrigin}>{untrustedLayerOrigin}</Link>?
          </>
        ) : (
          <>Trust this workspace?</>
        )
      }
      secondary={`To enable custom views and advanced debugger features, you must trust this workspace first to allow third-party code to run.`}
      action={
        <Stack direction="column" gap={2} alignItems="center">
          <Button
            onClick={() => setUIState(() => ({ isTrusted: true }))}
            startIcon={<CheckOutlined />}
          >
            Trust this time
          </Button>
          {!!untrustedLayerOrigin && (
            <Button
              variant="text"
              startIcon={<DoneAllOutlined />}
              onClick={() =>
                setSettings(
                  producify((f) => {
                    f.trustedOrigins = f.trustedOrigins ?? [];
                    f.trustedOrigins?.push(untrustedLayerOrigin);
                  })
                )
              }
            >
              Always trust workspaces from this origin
            </Button>
          )}
        </Stack>
      }
    />
  );
}
