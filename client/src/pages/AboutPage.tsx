import { GitHub } from "@mui/icons-material";
import {
  Avatar,
  Box,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography as Type,
} from "@mui/material";
import { head } from "lodash";
import { ReactNode } from "react";
import { Flex } from "components/generic/Flex";
import { Scroll } from "components/generic/Scrollbars";
import { useViewTreeContext } from "components/inspector/ViewTree";
import { Page } from "pages/Page";
import logo from "public/logo512.png";

const version = "1.0.4";

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

export function AboutPage() {
  const { controls, onChange, state } = useViewTreeContext();
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
              {renderSection("Build Info", <>{version}; late September 2023</>)}
              {renderSection(
                "About this App",
                <>
                  Waypoint is a visualising debugging tool for pathfinding
                  search. It can be used to visualise progression of search and
                  debug pathfinding algorithms. It can handle range of different
                  types of algorithms (demos are provided in the home page).
                  This tool is highly customizable and provide flexibility to
                  visualise any algorithm trace that you can augment using our
                  docs.
                </>
              )}
              {renderSection(
                "Team",
                <>
                  Our team is made up of present/past Monash students and
                  Professors Dr Daniel Harabor:
                  <List sx={{ mx: -2 }}>
                    {contacts.map(({ name, email }, i) => (
                      <ListItemButton href={`mailto:${email}`} key={i}>
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
  );
}
