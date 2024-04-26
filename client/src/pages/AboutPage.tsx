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
import { Flex } from "components/generic/Flex";
import { Scroll } from "components/generic/Scrollbars";
import { useViewTreeContext } from "components/inspector/ViewTree";
import { head } from "lodash";
import logo from "public/logo512.png";
import { name, version_name, repository } from "public/manifest.json";
import { ReactNode } from "react";
import { PageContentProps } from "./PageMeta";

const contacts = [
  { name: "Dr Daniel Harabor", email: "daniel.harabor@monash.edu" },
  { name: "Dr Michael Wybrow", email: "michael.wybrow@monash.edu" },
  { name: "Kevin Zheng", email: "kevin.zheng@monash.edu" },
  { name: "Francis Anthony", email: "fant0003@student.monash.edu" },
  { name: "Karan Batta", email: "krnbatta@gmail.com" },
  { name: "Jay Wingate", email: "jaypeterwingate@gmail.com" },
  { name: "Leo Whitehead", email: "leo@whiteheadsoftware.dev" },
  { name: "Can Wang", email: "camwang@outlook.com" },
  { name: "Rory Tobin-Underwood", email: "rorytu@gmail.com" },
];

export function AboutContent() {
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
    <Box>
      <Box sx={{ pt: 0, pb: 2 }}>
        <img src={logo} height="64" />
      </Box>
      <Type variant="h6">{name}</Type>
      {renderSection("Build Info", <>{version_name}</>)}
      {renderSection(
        "Team",
        <>
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
            <ListItemButton target="_blank" href={repository}>
              <ListItemIcon>
                <GitHub />
              </ListItemIcon>
              <ListItemText primary="Repository" secondary={repository} />
            </ListItemButton>
          </List>
        </>
      )}
    </Box>
  );
}

export function AboutPage({ template: Page }: PageContentProps) {
  const { controls, onChange, state, dragHandle } = useViewTreeContext();

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
      <Page.Handle>{dragHandle}</Page.Handle>
      <Page.Content>
        <Flex>
          <Scroll y>
            <AboutContent />
          </Scroll>
        </Flex>
      </Page.Content>
      <Page.Extras>{controls}</Page.Extras>
    </Page>
  );
}
