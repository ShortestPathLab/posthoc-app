import { ListTwoTone } from "@mui/icons-material";
import { Divider, List, ListItem, ListItemText } from "@mui/material";
import { map } from "lodash";
import { Flex } from "components/generic/Flex";
import { Scroll } from "components/generic/Scrollbars";
import { Placeholder } from "components/inspector/Placeholder";
import { useViewTreeContext } from "components/inspector/ViewTree";
import { Page } from "pages/Page";
import { useLog } from "slices/log";

export function InfoPage() {
  const { controls, onChange, state } = useViewTreeContext();
  const [log] = useLog();
  return (
    <Page onChange={onChange} stack={state}>
      <Page.Content>
        <Flex vertical>
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
            <Placeholder pt={6} label="Logs" icon={<ListTwoTone />} />
          )}
        </Flex>
      </Page.Content>
      <Page.Extras>{controls}</Page.Extras>
    </Page>
  );
}