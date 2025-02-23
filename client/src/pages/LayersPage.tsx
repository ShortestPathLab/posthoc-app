import { Block } from "components/generic/Block";
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
        <Block sx={{ mt: 0, pt: isViewTree ? 6 : 0 }}>
          <LayerListEditor />
        </Block>
      </Page.Content>
      <Page.Extras>{controls}</Page.Extras>
    </Page>
  );
}
