import { Stack } from "@mui/material";
import WorkspacesEditor from "pages/workspaces/WorkspacesEditor";
import { FeaturePicker } from "components/app-bar/FeaturePicker";
import { useViewTreeContext } from "components/inspector/ViewTree";
import { values } from "lodash-es";
import { cloudStorageProviders } from "services/cloud-storage";
import { useCloudStorageInstance } from "slices/cloudStorage";
import { PageContentProps } from "../PageMeta";

export function WorkspacesPage({ template: Page }: PageContentProps) {
  const { controls, onChange, state, dragHandle } = useViewTreeContext();
  const { meta } = useCloudStorageInstance() ?? {};
  return (
    <Page onChange={onChange} stack={state}>
      <Page.Key>remote</Page.Key>
      <Page.Title>Workspaces</Page.Title>
      <Page.Handle>{dragHandle}</Page.Handle>
      <Page.Options>
        <FeaturePicker
          icon={meta?.id ? cloudStorageProviders[meta?.id].icon : null}
          label="Source"
          value={meta?.id}
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
          <WorkspacesEditor />
        </Stack>
      </Page.Content>
      <Page.Extras>{controls}</Page.Extras>
    </Page>
  );
}
