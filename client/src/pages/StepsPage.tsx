import { Box } from "@mui/material";
import { Playback } from "components/app-bar/Playback";
import { StepsPanel } from "components/inspector/StepsPanel";
import { useViewTreeContext } from "components/inspector/ViewTree";
import { Page } from "pages/Page";

export function StepsPage() {
  const { controls, onChange, state } = useViewTreeContext();
  return (
    <Page onChange={onChange} stack={state}>
      <Page.Content>
        <Box pt={6}>
          <StepsPanel />
        </Box>
      </Page.Content>
      <Page.Options>
        <Playback />
      </Page.Options>
      <Page.Extras>{controls}</Page.Extras>
    </Page>
  );
}
