import { PageContentProps } from "./PageMeta";
import { useViewTreeContext } from "components/inspector/ViewTree";
import { Flex } from "components/generic/Flex";
import { Scroll } from "components/generic/Scrollbars";
import { Box } from "@mui/material";
import SavedLogsButton from "components/SavedLogsButton";

export function SavedLogsPage({ template: Page }: PageContentProps) {
  const { controls, onChange, state, dragHandle } = useViewTreeContext();
  return (
    <Page onChange={onChange} stack={state}>
      <Page.Key>savedLogs</Page.Key>
      <Page.Title>Saved Logs</Page.Title>
      <Page.Handle>{dragHandle}</Page.Handle>
      <Page.Content>
        <Flex vertical>
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
              <SavedLogsButton type="google"/>
            </Box>
          </Scroll>
        </Flex>
      </Page.Content>
      <Page.Extras>{controls}</Page.Extras>
    </Page>
  );
}
