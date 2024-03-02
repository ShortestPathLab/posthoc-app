import { Box } from "@mui/material";
import { Flex } from "components/generic/Flex";
import { Scroll } from "components/generic/Scrollbars";
import { useViewTreeContext } from "components/inspector/ViewTree";
import { LayerListEditor } from "components/layer-editor/LayerListEditor";
import { PageContentProps } from "./PageMeta";

export function LayersPage({ template: Page }: PageContentProps) {
  const { controls, onChange, state, dragHandle } = useViewTreeContext();

  return (
    <Page onChange={onChange} stack={state}>
      <Page.Title>Layers</Page.Title>
      <Page.Handle>{dragHandle}</Page.Handle>
      <Page.Content>
        <Flex>
          <Scroll y style={{ width: "100%" }}>
            <Box pt={6}>
              <LayerListEditor />
            </Box>
          </Scroll>
        </Flex>
      </Page.Content>
      <Page.Extras>{controls}</Page.Extras>
    </Page>
  );
}
