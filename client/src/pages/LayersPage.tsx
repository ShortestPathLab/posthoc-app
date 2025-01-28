import { Box } from "@mui/material";
import { Block } from "components/generic/Block";
import { Scroll } from "components/generic/Scrollbars";
import { useViewTreeContext } from "components/inspector/ViewTree";
import { LayerListEditor } from "components/layer-editor/LayerListEditor";
import { PageContentProps } from "./PageMeta";

export function LayersPage({ template: Page }: PageContentProps) {
  const { controls, onChange, state, dragHandle, isViewTree } =
    useViewTreeContext();

  return (
    <Page onChange={onChange} stack={state}>
      <Page.Key>layers</Page.Key>
      <Page.Title>Layers</Page.Title>
      <Page.Handle>{dragHandle}</Page.Handle>
      <Page.Content>
        <Block
          sx={{
            mt: isViewTree ? 0 : -6,
          }}
        >
          <Scroll y style={{ width: "100%" }}>
            <Box pt={6}>
              <LayerListEditor />
            </Box>
          </Scroll>
        </Block>
      </Page.Content>
      <Page.Extras>{controls}</Page.Extras>
    </Page>
  );
}
