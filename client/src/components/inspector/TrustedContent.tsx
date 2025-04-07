import {
  CheckOutlined,
  DoneAllOutlined,
  ShieldOutlined,
} from "@mui-symbols-material/w400";
import { Link, Stack } from "@mui/material";
import { Button } from "components/generic/inputs/Button";
import { produce } from "immer";
import { ReactNode } from "react";
import { slice } from "slices";
import { useSettings } from "slices/settings";
import { Placeholder } from "./Placeholder";
import { useUntrustedLayers as useUntrustedLayer } from "./useUntrustedLayers";

export function TrustedContent({ children }: { children?: ReactNode }) {
  const { isTrusted, origin } = useUntrustedLayer();

  const [, setSettings] = useSettings();
  return isTrusted ? (
    <>{children}</>
  ) : (
    <Placeholder
      icon={<ShieldOutlined />}
      label={
        origin ? (
          <>
            Trust <Link href={origin}>{origin}</Link>?
          </>
        ) : (
          <>Trust this workspace?</>
        )
      }
      secondary={`To enable custom views and advanced debugger features, you must trust this workspace first to allow third-party code to run.`}
      action={
        <Stack direction="column" gap={2} alignItems="center">
          <Button
            onClick={() => slice.ui.isTrusted.set(true)}
            startIcon={<CheckOutlined />}
          >
            Trust this time
          </Button>
          {!!origin && (
            <Button
              variant="text"
              startIcon={<DoneAllOutlined />}
              onClick={() => {
                setSettings(
                  produce((f) => {
                    f.trustedOrigins = f.trustedOrigins ?? [];
                    f.trustedOrigins?.push(origin);
                  })
                );
              }}
            >
              Always trust workspaces from this origin
            </Button>
          )}
        </Stack>
      }
    />
  );
}
