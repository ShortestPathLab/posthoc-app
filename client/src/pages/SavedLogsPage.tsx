import React, { useEffect } from "react";
import { PageContentProps } from "./PageMeta";
import { useViewTreeContext } from "components/inspector/ViewTree";
import { Flex } from "components/generic/Flex";
import { Scroll } from "components/generic/Scrollbars";
import { Box, Link, Typography } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import { Button } from "components/generic/Button";

export function SavedLogsPage({ template: Page }: PageContentProps) {
  const authenticateWithGithub = () => {
    const client_id = import.meta.env.DEV
      ? import.meta.env.VITE_DEV_CLIENT_ID
      : import.meta.env.VITE_PROD_CLIENT_ID;
    const getRedirectURI = () => {
      let redirect_uri = "";
      if (import.meta.env.DEV) {
        const currentURL = new URL(import.meta.url);
        redirect_uri = currentURL.origin;
        // * what to use to dynamically get base url
      } else {
        redirect_uri = "https://posthoc-app.pathfinding.ai";
      }
      // const searchTraceName =
      // todo: find some way to get the username before redirection
      // problem: user needs to be redirected back to the url that
      return redirect_uri;
    };
    const githubAuthLink = `https://github.com/login/oauth/authorize?client_id=${client_id}&redirect_uri=${getRedirectURI()}&scope=public_repo, user`;
    window.location.href = githubAuthLink;
  };
  useEffect(() => {
    const githubInteg = () => {
      // save to html-only cookies
      const currentURL = new URL(window.location.href);
      const queryParams = new URLSearchParams(currentURL.search);
      console.log(queryParams);
      console.log(queryParams.get("token"));
      // check if repo exists
      // create if not
      // get saved files names
      // save visualisation file
    };
    githubInteg();
  }, []);
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
              <Typography variant="body2" align="center" color="text.secondary">
                Login with github to save and share your search traces
              </Typography>
              <GitHubIcon fontSize="large" />
              <Button
                onClick={authenticateWithGithub}
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#28a745", // GitHub green
                  padding: "10px 20px",
                  borderRadius: 2,
                  fontWeight: "bold",
                  textDecoration: "none",
                  transition: "background-color 0.3s",
                  "&:hover": {
                    backgroundColor: "#218838", // Darker green on hover
                  },
                  "&:focus": {
                    outline: "2px solid #c3e6cb", // Focus outline (light green)
                  },
                }}
              >
                <Typography color="white" align="center" variant="body1">
                  Click to login with Github
                </Typography>
              </Button>
            </Box>
          </Scroll>
        </Flex>
      </Page.Content>
      <Page.Extras>{controls}</Page.Extras>
    </Page>
  );
}
