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
import { Block } from "components/generic/Block";
import { Scroll } from "components/generic/Scrollbars";
import { useViewTreeContext } from "components/inspector/ViewTree";
import { head, trimEnd } from "lodash";
import logo from "public/logo512.png";
import { homepage, name, repository, version_name } from "public/manifest.json";
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
function parseUrl(path: string) {
  const url = new URL(path);
  return trimEnd(`${url.hostname}${url.pathname}`, "/");
}

export function AboutContent() {
  function renderSection(label: ReactNode, content: ReactNode) {
    return (
      <Box sx={{ pt: 2 }}>
        <Type component="div" variant="overline" color="text.secondary">
          {label}
        </Type>
        <Type component="div" variant="body2">
          {content}
        </Type>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ pt: 0, pb: 2 }}>
        <img src={logo} height="64" />
      </Box>
      <Type component="div" variant="h6">
        {name}
      </Type>
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
            <ListItemButton target="_blank" href={homepage}>
              <ListItemAvatar>
                <Avatar sx={{ width: 24, height: 24 }} src={logo} />
              </ListItemAvatar>
              <ListItemText primary="Home" secondary={parseUrl(homepage)} />
            </ListItemButton>
            <ListItemButton target="_blank" href={repository}>
              <ListItemIcon>
                <GitHub />
              </ListItemIcon>
              <ListItemText
                primary="Repository"
                secondary={parseUrl(repository)}
              />
            </ListItemButton>
          </List>
        </>
      )}
    </Box>
  );
}

export function AboutPage({ template: Page }: PageContentProps) {
  const { controls, onChange, state, dragHandle } = useViewTreeContext();

  return (
    <Page onChange={onChange} stack={state}>
      <Page.Key>about</Page.Key>

      <Page.Handle>{dragHandle}</Page.Handle>
      <Page.Content>
        <Block>
          <Scroll y>
            <AboutContent />
          </Scroll>
        </Block>
      </Page.Content>
      <Page.Extras>{controls}</Page.Extras>
    </Page>
  );
}
