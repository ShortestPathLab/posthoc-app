import { Box } from "@mui/material";
import { useViewTreeContext } from "components/inspector/ViewTree";
import { LayerListEditor } from "components/layer-editor/LayerListEditor";
import { Page } from "components/pages/Page";

export function LayersPage() {
  const { controls, onChange, state } = useViewTreeContext();
  return (
    <Page onChange={onChange} stack={state}>
      <Page.Content>
        <Box p={2} pr={1} pt={6}>
          <LayerListEditor />
        </Box>
      </Page.Content>
      <Page.Extras>{controls}</Page.Extras>
    </Page>
  );
}
