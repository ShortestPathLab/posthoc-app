import React from "react";
import { PageContentProps } from "./PageMeta";
import { Placeholder } from "components/inspector/Placeholder";
import { useViewTreeContext } from "components/inspector/ViewTree";

export function PlaceholderPage({ template: Page }: PageContentProps) {
  const { controls, onChange, state, dragHandle } = useViewTreeContext();
  return (
    <Page onChange={onChange} stack={state}>
      <Page.Handle>{dragHandle}</Page.Handle>
      <Page.Content>
        <Placeholder
          label="Empty Panel"
          secondary="Choose a view to populate this panel."
        />
      </Page.Content>
      <Page.Extras>{controls}</Page.Extras>
    </Page>
  );
}
