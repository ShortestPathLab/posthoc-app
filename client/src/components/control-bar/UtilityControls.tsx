import { Button } from "@material-ui/core";
import { DebugOptionsEditor as DebugOptionsEditor } from "components/DebugOptionsEditor";
import { AppBarTitle as Title, ManagedModal as Dialog } from "components/Modal";
import { useCompatibilityLayer } from "hooks/useCompatibilityLayer";
import { usePlaybackState } from "hooks/usePlaybackState";

export function UtilityControls() {
  const ready = usePlaybackState() !== "none";
  const INTEROP_compare = useCompatibilityLayer("#comparator button");
  const INTEROP_timeTravel = useCompatibilityLayer("#time-travel button");
  return (
    <>
      <Dialog
        trigger={(onClick) => (
          <Button {...{ onClick }} disabled={!ready}>
            Debug...
          </Button>
        )}
        options={{
          width: 960,
          scrollable: false,
        }}
        appBar={{
          children: <Title>Debug Options</Title>,
        }}
      >
        <DebugOptionsEditor />
      </Dialog>
      <Button disabled={!ready} onClick={INTEROP_compare}>
        Compare...
      </Button>
      <Button disabled={!ready} onClick={INTEROP_timeTravel}>
        Jump...
      </Button>
    </>
  );
}
