import { Button, Tooltip } from "@mui/material";
import { BugReportTwoTone as BugIcon } from "@mui/icons-material";
import { DebugOptionsEditor } from "components/debug-options-editor/DebugOptionsEditor";
import {
  AppBarTitle as Title,
  ManagedModal as Dialog,
} from "components/generic/Modal";
import { useSpecimen } from "slices/specimen";

export function Utility() {
  const [{ specimen }] = useSpecimen();

  return (
    <>
      <Dialog
        trigger={(onClick) => (
          <Tooltip title="Debugging Options">
            <Button
              {...{ onClick }}
              disabled={!specimen}
              startIcon={<BugIcon />}
            >
              Debug
            </Button>
          </Tooltip>
        )}
        options={{ width: 960, scrollable: false }}
        appBar={{ children: <Title>Debug</Title> }}
      >
        <DebugOptionsEditor />
      </Dialog>
    </>
  );
}
