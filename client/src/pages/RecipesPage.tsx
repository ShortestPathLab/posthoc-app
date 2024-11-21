import { WorkspacesOutlined } from "@mui-symbols-material/w400";
import {
  Box,
  CircularProgress,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Flex } from "components/generic/Flex";
import { Scroll } from "components/generic/Scrollbars";
import { useSnackbar } from "components/generic/Snackbar";
import { useViewTreeContext } from "components/inspector/ViewTree";
import { useWorkspace } from "hooks/useWorkspace";
import { chain as _, entries, map } from "lodash";
import { useAsync } from "react-async-hook";
import { useLoadingState } from "slices/loading";
import { PageContentProps } from "./PageMeta";
function stripExtension(path: string) {
  return path.split(".")[0];
}

function basename(path: string) {
  return path.split("/").pop()!;
}

export function RecipesPage({ template: Page }: PageContentProps) {
  const notify = useSnackbar();
  const { controls, onChange, state, dragHandle } = useViewTreeContext();

  const { load } = useWorkspace();
  const usingLoadingState = useLoadingState();

  const { result: files, loading } = useAsync(async () => {
    const paths = import.meta.glob<boolean, string, string>(
      "/public/recipes/*.workspace",
      {
        query: "?url",
        import: "default",
      }
    );
    return await Promise.all(
      entries(paths).map((entry) => getFileInfo(...entry))
    );
  }, []);

  const open = (path: string) =>
    usingLoadingState(async () => {
      try {
        notify(`Loading ${basename(path)}...`);
        const response = await fetch(path);
        if (!response.ok) {
          notify(`Couldn't load ${basename(path)}`, `Network error`, {
            error: true,
          });
        }
        const blob = await response.blob();
        const file = new File([blob], basename(path), { type: blob.type });
        // It is correct to not wait for this promise
        load(file);
      } catch (e) {
        notify(`Couldn't load ${basename(path)}`, `${e}`, {
          error: true,
        });
      }
    });

  return (
    <Page onChange={onChange} stack={state}>
      <Page.Key>recipes</Page.Key>

      <Page.Handle>{dragHandle}</Page.Handle>
      <Page.Content>
        <Flex vertical>
          <Scroll y>
            <Box sx={{ pt: 6 }}>
              {!loading ? (
                <List>
                  {map(files, ({ name, path }, i) => (
                    <ListItemButton key={i} onClick={() => open(path)}>
                      <ListItemIcon>
                        <WorkspacesOutlined />
                      </ListItemIcon>
                      <ListItemText primary={name} secondary={basename(path)} />
                    </ListItemButton>
                  ))}
                </List>
              ) : (
                <CircularProgress sx={{ m: 2 }} />
              )}
            </Box>
          </Scroll>
        </Flex>
      </Page.Content>
      <Page.Extras>{controls}</Page.Extras>
    </Page>
  );
}
async function getFileInfo(k: string, f: () => Promise<string>) {
  return {
    name: _(k).thru(basename).thru(stripExtension).startCase().value(),
    path: await f(),
  };
}
