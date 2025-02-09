import { CloseOutlined, ListOutlined } from "@mui-symbols-material/w400";
import { Divider, List, ListItem, ListItemText } from "@mui/material";
import { FeaturePickerButton } from "components/app-bar/FeaturePickerButton";
import { Block } from "components/generic/Block";
import { Scroll } from "components/generic/Scrollbars";
import { Placeholder } from "components/inspector/Placeholder";
import { useViewTreeContext } from "components/inspector/ViewTree";
import { map } from "lodash";
import { useLog } from "slices/log";
import { PageContentProps } from "./PageMeta";

export function InfoPage({ template: Page }: PageContentProps) {
  const { controls, onChange, state, dragHandle } = useViewTreeContext();

  const [log, setLog] = useLog();
  return (
    <Page onChange={onChange} stack={state}>
      <Page.Key>info</Page.Key>
      <Page.Title>Logs</Page.Title>
      <Page.Handle>{dragHandle}</Page.Handle>
      <Page.Options>
        <FeaturePickerButton
          disabled={!log.length}
          icon={<CloseOutlined />}
          onClick={() => setLog(() => ({ action: "clear" }))}
        >
          Clear
        </FeaturePickerButton>
      </Page.Options>
      <Page.Content>
        <Block vertical>
          {log.length ? (
            <Scroll y>
              <List sx={{ pt: 6 }}>
                {map(log, (l, i) => (
                  <div key={i}>
                    <ListItem>
                      <ListItemText
                        primary={l.content}
                        secondary={l.timestamp}
                      />
                    </ListItem>
                    <Divider />
                  </div>
                ))}
              </List>
            </Scroll>
          ) : (
            <Placeholder pt={6} label="Logs" icon={<ListOutlined />} />
          )}
        </Block>
      </Page.Content>
      <Page.Extras>{controls}</Page.Extras>
    </Page>
  );
}
