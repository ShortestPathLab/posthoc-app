import { Stack } from "@mui/material";
import SavedLogsButton from "components/SavedLogsButton";
import { FeaturePicker } from "components/app-bar/FeaturePicker";
import { useViewTreeContext } from "components/inspector/ViewTree";
import { values } from "lodash";
import { cloudStorageProviders } from "services/cloud-storage";
import { PageContentProps } from "./PageMeta";

export function SavedLogsPage({ template: Page }: PageContentProps) {
  const { controls, onChange, state, dragHandle } = useViewTreeContext();
  return (
    <Page onChange={onChange} stack={state}>
      <Page.Key>remote</Page.Key>
      <Page.Title>Workspaces</Page.Title>
      <Page.Handle>{dragHandle}</Page.Handle>
      <Page.Options>
        <FeaturePicker
          icon={cloudStorageProviders.google.icon}
          label="Source"
          value={"google"}
          items={values(cloudStorageProviders)}
          arrow
          ellipsis={12}
        />
      </Page.Options>
      <Page.Content>
        <Stack
          sx={{
            width: "100%",
            pt: 6,
            display: "flex",
            flexDirection: "column",
            rowGap: "1rem",
          }}
        >
          <SavedLogsButton type="google" />
        </Stack>
      </Page.Content>
      <Page.Extras>{controls}</Page.Extras>
    </Page>
  );
}
