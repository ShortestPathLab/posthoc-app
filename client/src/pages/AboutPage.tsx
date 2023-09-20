import { GitHub } from "@mui/icons-material";
import { TabContext, TabList } from "@mui/lab";
import {
  Avatar,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tab,
  Typography as Type,
  Typography,
} from "@mui/material";
import { Scroll } from "components/generic/Scrollbars";
import { Flex } from "components/generic/Flex";
import { useViewTreeContext } from "components/inspector/ViewTree";
import { Page } from "pages/Page";
import { head } from "lodash";
import { ReactNode, useState } from "react";
import { useSettings } from "slices/settings";
import logo from "public/logo512.png";

const version = "0.1.2";

const contacts = [
  { name: "Dr Daniel Harabor", email: "daniel.harabor@monash.edu" },
  { name: "Dr Michael Wybrow", email: "michael.wybrow@monash.edu" },
  { name: "Karan Batta", email: "krnbatta@gmail.com" },
  { name: "Jay Wingate", email: "jaypeterwingate@gmail.com" },
  { name: "Kevin Zheng", email: "kzhe0012@student.monash.edu" },
  { name: "Leo Whitehead", email: "leo@whiteheadsoftware.dev" },
  { name: "Can Wang", email: "camwang@outlook.com" },
  { name: "Rory Tobin-Underwood", email: "rorytu@gmail.com" },
];

const formatLabel = (v: number) => `${v}x`;

export function AboutPage() {
  const { controls, onChange, state } = useViewTreeContext();
  const [{ playbackRate = 1, acrylic, theme = "light" }, setSettings] =
    useSettings();
  const [tab, setTab] = useState("general");
  function renderSection(label: ReactNode, content: ReactNode) {
    return (
      <Box sx={{ pt: 2 }}>
        <Type variant="overline" color="text.secondary">
          {label}
        </Type>
        <Type variant="body2">{content}</Type>
      </Box>
    );
  }
  return (
    <TabContext value={tab}>
      <Page onChange={onChange} stack={state}>
        <Page.Content>
          <Flex>
            {" "}
            <Scroll y>
              <Box sx={{ p: 2 }}>
                <Box sx={{ pt: 6, pb: 2 }}>
                  <img src={logo} height="64" />
                </Box>
                <Type variant="h6">Waypoint {version}</Type>
                {renderSection(
                  "About this App",
                  <>
                    Waypoint is a visualising debugging tool for pathfinding
                    search. It can be used to visualise progression of search
                    and debug pathfinding algorithms. It can handle range of
                    different types of algorithms (demos are provided in the
                    home page). This tool is highly customizable and provide
                    flexibility to visualise any algorithm trace that you can
                    augment using our docs.
                  </>
                )}
                {renderSection(
                  "Team",
                  <>
                    Our team is made up of present/past Monash students and
                    Professors Dr Daniel Harabor:
                    <List sx={{ mx: -2 }}>
                      {contacts.map(({ name, email }) => (
                        <ListItemButton href={`mailto:${email}`}>
                          <ListItemAvatar>
                            <Avatar>{head(name)}</Avatar>
                          </ListItemAvatar>
                          <ListItemText primary={name} secondary={email} />
                        </ListItemButton>
                      ))}
                    </List>
                  </>
                )}
                {renderSection(
                  "Resources",
                  <>
                    <List sx={{ mx: -2 }}>
                      <ListItemButton
                        target="_blank"
                        href="https://github.com/path-visualiser"
                      >
                        <ListItemIcon>
                          <GitHub />
                        </ListItemIcon>
                        <ListItemText
                          primary="Repository"
                          secondary="https://github.com/path-visualiser"
                        />
                      </ListItemButton>
                    </List>
                  </>
                )}
              </Box>
            </Scroll>
          </Flex>
        </Page.Content>
        <Page.Extras>{controls}</Page.Extras>
      </Page>
    </TabContext>
  );
}
