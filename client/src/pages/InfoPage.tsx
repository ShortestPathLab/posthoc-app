import { ListTwoTone } from "@mui/icons-material";
import { Placeholder } from "components/inspector/Placeholder";
import { Page } from "pages/Page";
import { useViewTreeContext } from "components/inspector/ViewTree";
import { useLog } from "slices/log";
import { Flex } from "components/generic/Flex";
import { Scroll } from "components/generic/Scrollbars";
import { map } from "lodash";
import { Divider, List, ListItem, ListItemText } from "@mui/material";

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
