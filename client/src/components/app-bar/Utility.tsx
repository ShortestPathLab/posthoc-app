import { Button, Tooltip } from "@material-ui/core";
import { BugReportTwoTone as BugIcon } from "@material-ui/icons";
import { DebugOptionsEditor } from "components/DebugOptionsEditor";
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
          <Tooltip title="Debug Options">
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
        appBar={{ children: <Title>Debug Options</Title> }}
      >
        <DebugOptionsEditor />
      </Dialog>
    </>
  );
}
