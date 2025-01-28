import {
  CheckOutlined,
  DoneAllOutlined,
  ShieldOutlined,
} from "@mui-symbols-material/w400";
import { Link, Stack } from "@mui/material";
import { Button } from "components/generic/inputs/Button";
import { producify } from "produce";
import { ReactNode } from "react";
import { useSettings } from "slices/settings";
import { useUIState } from "slices/UIState";
import { Placeholder } from "./Placeholder";
import { useUntrustedLayers as useUntrustedLayer } from "./useUntrustedLayers";

export function TrustedContent({ children }: { children?: ReactNode }) {
  const { isTrusted, untrustedLayerOrigin } = useUntrustedLayer();

  const [, setSettings] = useSettings();
  const [, setUIState] = useUIState();
  return isTrusted ? (
    <>{children}</>
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
