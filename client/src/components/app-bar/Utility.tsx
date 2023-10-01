import { BugReportTwoTone as BugIcon } from "@mui/icons-material";
import { Button, Tooltip } from "@mui/material";
import { DebugOptionsEditor } from "components/debug-options-editor/DebugOptionsEditor";
import { useSpecimen } from "slices/specimen";
import {
  AppBarTitle as Title,
  ManagedModal as Dialog,
} from "components/generic/Modal";


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