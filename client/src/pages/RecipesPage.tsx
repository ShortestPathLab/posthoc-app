import { WorkspacesOutlined } from "@mui/icons-material";
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography as Type,
} from "@mui/material";
import { Flex } from "components/generic/Flex";
import { Scroll } from "components/generic/Scrollbars";
import { useViewTreeContext } from "components/inspector/ViewTree";
import { useWorkspace } from "hooks/useWorkspace";
import { map, startCase, values } from "lodash";
import { Page } from "pages/Page";
import { ReactNode } from "react";
import { useAsync } from "react-async-hook";

function stripExtension(path: string) {
  return path.split(".")[0];
}

function basename(path: string) {
  return path.split("/").pop()!;
}

export function RecipesPage() {
  const { controls, onChange, state } = useViewTreeContext();
  const { load } = useWorkspace();

  const { result: files } = useAsync(async () => {
    const paths = import.meta.glob("/public/recipes/*.workspace", {
      as: "url",
    });
    return await Promise.all(values(paths).map((f) => f()));
  }, []);

  async function open(path: string) {
    try {
      const response = await fetch(path);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const blob = await response.blob();
      const filename = basename(path);
      const file = new File([blob], filename, { type: blob.type });

      load(file);
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  }

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
        <Flex vertical>
          <Scroll y>
            <Box sx={{ pt: 6 }}>
              {renderSection(
                <Box sx={{ px: 2 }}>Recipes</Box>,
                <>
                  <List>
                    {map(files, (path, i) => (
                      <ListItemButton key={i} onClick={() => open(path)}>
                        <ListItemIcon>
                          <WorkspacesOutlined />
                        </ListItemIcon>
                        <ListItemText
                          primary={startCase(stripExtension(basename(path)))}
                          secondary={basename(path)}
                        />
                      </ListItemButton>
                    ))}
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
