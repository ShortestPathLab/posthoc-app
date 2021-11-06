import { Button } from "@material-ui/core";
import { BugReport as BugIcon } from "@material-ui/icons";
import { DebugOptionsEditor } from "components/DebugOptionsEditor";
import {
  AppBarTitle as Title,
  ManagedModal as Dialog,
} from "components/generic/Modal";
import { useSpecimen } from "slices/specimen";

export function UtilityControls() {
  const [{ specimen }] = useSpecimen();
  return (
    <>
      <Dialog
        trigger={(onClick) => (
          <Button {...{ onClick }} disabled={!specimen} startIcon={<BugIcon />}>
            Debug
          </Button>
        )}
        options={{ width: 960, scrollable: false }}
        appBar={{ children: <Title>Debug Options</Title> }}
      >
        <DebugOptionsEditor />
      </Dialog>
    </>
  );
}
