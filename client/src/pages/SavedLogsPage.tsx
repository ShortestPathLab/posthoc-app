import { Box } from "@mui/material";
import SavedLogsButton from "components/SavedLogsButton";
import { FeaturePicker } from "components/app-bar/FeaturePicker";
import { Block } from "components/generic/Block";
import { Scroll } from "components/generic/Scrollbars";
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
        <Block vertical>
          <Scroll y>
            <Box
              sx={{
                pt: 9,
                px: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                rowGap: "1rem",
              }}
            >
              <SavedLogsButton type="google" />
            </Box>
          </Scroll>
        </Block>
      </Page.Content>
      <Page.Extras>{controls}</Page.Extras>
    </Page>
  );
}
