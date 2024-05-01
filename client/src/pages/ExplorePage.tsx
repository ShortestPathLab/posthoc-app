import {
  LaunchOutlined,
  SearchOutlined,
  WorkspacesOutlined,
} from "@mui/icons-material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import {
  Avatar,
  Box,
  Card,
  CardHeader,
  CardProps,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  InputAdornment,
  Stack,
  SxProps,
  Tab,
  TextField,
  Typography as Type,
} from "@mui/material";
import { Flex } from "components/generic/Flex";
import { Scroll } from "components/generic/Scrollbars";
import { useSnackbar } from "components/generic/Snackbar";
import { useFullscreenModalContext } from "components/inspector/FullscreenModalHost";
import { useViewTreeContext } from "components/inspector/ViewTree";
import { useSmallDisplay } from "hooks/useSmallDisplay";
import { useWorkspace } from "hooks/useWorkspace";
import {
  chain as _,
  entries,
  filter,
  first,
  map,
  round,
  upperCase,
} from "lodash";
import { map as mapAsync } from "promise-tools";
import { FeatureDescriptor } from "protocol/FeatureQuery";
import { docs, name } from "public/manifest.json";
import { CSSProperties, ReactNode, useMemo, useState } from "react";
import { useAsync } from "react-async-hook";
import { useLoadingState } from "slices/loading";
import { useSettings } from "slices/settings";
import { textFieldProps, usePaper } from "theme";
import { parse, stringify } from "yaml";
import { Button } from "../components/generic/Button";
import { PageContentProps } from "./PageMeta";
const paths = import.meta.glob("/public/recipes/*.workspace", {
  as: "url",
});

const metaPaths = import.meta.glob("/public/recipes/*.workspace.meta", {
  as: "url",
});

function stripExtension(path: string) {
  return path.split(".")[0];
}

function basename(path: string) {
  return path.split("/").pop()!;
}

async function getMeta(k: string) {
  const metaKey = metaPaths[k.replace(/workspace$/, "workspace.meta")];
  const path = await metaKey?.();
  if (path) {
    const a = await fetch(path);
    return parse(await a.text());
  }
}

async function getFileInfo(k: string, f: () => Promise<string>) {
  return {
    name: _(k).thru(basename).thru(stripExtension).startCase().value(),
    path: await f(),
    ...(await getMeta(k)),
  };
}

type ExampleDescriptor = FeatureDescriptor & {
  author?: string;
  image?: string;
  size?: number;
};

const makeAvatar = (children?: ReactNode) => (sx: SxProps) =>
  <Avatar sx={sx}>{children}</Avatar>;

function getAuthor(s?: string): {
  name: ReactNode;
  avatar?: (sx: SxProps) => ReactNode;
} {
  if (s) {
    try {
      const { protocol, pathname } = new URL(s);
      switch (protocol) {
        case "github:":
          return {
            name: pathname,
            avatar: (sx: SxProps) => (
              <a
                href={`https://github.com/${pathname}`}
                target="_blank"
                rel="noreferrer"
              >
                <Avatar sx={sx} src={`https://github.com/${pathname}.png`} />
              </a>
            ),
          };
        default:
          break;
      }
    } catch (e) {
      /* empty */
    }
    return { name: s, avatar: makeAvatar(s[0]) };
  }
  return { name: "No author", avatar: makeAvatar() };
}

const ellipsisProps = {
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  overflow: "hidden",
} satisfies CSSProperties;

export function FeatureCard({
  name,
  description,
  image,
  author,
  size,
  onOpenClick,
  ...rest
}: Partial<ExampleDescriptor> & CardProps & { onOpenClick?: () => void }) {
  const [{ "appearance/acrylic": acrylic }] = useSettings();
  const paper = usePaper();

  const { name: authorName, avatar } = useMemo(
    () => getAuthor(author),
    [author]
  );

  return (
    <Card
      variant="outlined"
      sx={{ ...paper(1), position: "relative", height: "100%" }}
      {...rest}
    >
      {acrylic && (
        <Box
          sx={{
            zIndex: -1,
            filter: "blur(48px)",
            opacity: 0.1,
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundImage: `url("${image}")`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "-52px -52px",
          }}
        ></Box>
      )}
      <CardHeader
        sx={{
          alignItems: "flex-start",
          "> .MuiCardHeader-content": { overflow: "hidden" },
        }}
        avatar={
          <Box
            sx={{
              ...paper(1),
              border: "none",
              borderRadius: 1,
              width: 64,
              height: 64,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                imageRendering: "pixelated",
                width: 64,
                height: 64,
                backgroundImage: `url("${image}")`,
                backgroundSize: "100%",
                backgroundPosition: "center",
              }}
            ></Box>
          </Box>
        }
        titleTypeProps={ellipsisProps}
        title={name || "Untitled"}
        subheaderTypeProps={ellipsisProps}
        subheader={
          <Stack gap={2} sx={{ pt: 1, alignItems: "flex-start" }}>
            <Type
              sx={{
                ...ellipsisProps,
                maxWidth: "100%",
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 3,
                whiteSpace: "break-spaces",
                height: 60,
              }}
            >
              {description || "No description"}
            </Type>
            <Stack direction="row" alignItems="center" gap={1}>
              {avatar?.({ width: 18, height: 18, fontSize: "0.8rem" })}
              <Type variant="caption">{authorName}</Type>
            </Stack>
            <Button
              onClick={onOpenClick}
              startIcon={<WorkspacesOutlined />}
              sx={paper(2)}
            >
              <Stack direction="row" gap={1}>
                <Type>Open</Type>
                {!!size && (
                  <Type color="text.secondary">
                    {round(size / 1024 / 1024, 2)} MB
                  </Type>
                )}
              </Stack>
            </Button>
          </Stack>
        }
      />
    </Card>
  );
}

const CONTENT_WIDTH = 940;

export function ExplorePage({ template: Page }: PageContentProps) {
  const [{ "behaviour/showOnStart": showOnStart }, setSettings] = useSettings();
  const notify = useSnackbar();
  const { controls, onChange, state, dragHandle, isViewTree } =
    useViewTreeContext();
  const { close: closeModal } = useFullscreenModalContext();
  const sm = useSmallDisplay();
  const narrow = sm || isViewTree;
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("explore");

  const { load } = useWorkspace();
  const usingLoadingState = useLoadingState();

  const { result: files, loading } = useAsync(async () => {
    return await mapAsync(entries(paths), (entry) => getFileInfo(...entry));
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

  const filteredFiles = useMemo(
    () =>
      filter(files, (file) =>
        upperCase(stringify(file)).includes(upperCase(search))
      ),
    [search, files]
  );

  const showOnStartUpChecked = showOnStart === "explore";

  function onShowOnStartUpCheckedChange(v: boolean) {
    setSettings(() => ({
      "behaviour/showOnStart": v ? "explore" : undefined,
    }));
  }

  return (
    <TabContext value={tab}>
      <Page onChange={onChange} stack={state}>
        <Page.Title>Explore</Page.Title>
        <Page.Handle>{dragHandle}</Page.Handle>
        <Page.Options>
          <TabList
            onChange={(_, v) => setTab(v)}
            sx={{ mx: isViewTree ? 0 : -1 }}
          >
            <Tab label="Examples" value="explore" />
            <Tab label="Guides" value="guides" />
          </TabList>
        </Page.Options>
        <Page.Content>
          <Flex vertical>
            <Scroll y>
              <Box
                sx={
                  !narrow
                    ? {
                        p: 4,
                        maxWidth: CONTENT_WIDTH,
                        mx: "auto",
                      }
                    : undefined
                }
              >
                <Box pt={6}>
                  <TabPanel value="explore" sx={{ p: 0 }}>
                    <Box p={4} sx={{ textAlign: "center" }}>
                      <Type variant={narrow ? "h6" : "h4"}>Examples</Type>
                      <Type variant="subtitle2" color="text.secondary">
                        Browse a library of included and community-made examples
                      </Type>
                    </Box>
                    <Box
                      px={2}
                      pb={narrow ? 4 : 4}
                      sx={{ textAlign: "center" }}
                    >
                      <TextField
                        {...textFieldProps}
                        size={narrow ? "small" : "medium"}
                        hiddenLabel
                        fullWidth
                        sx={{ maxWidth: 480 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchOutlined />
                            </InputAdornment>
                          ),
                        }}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search examples"
                      />
                    </Box>
                    {!loading ? (
                      <Box
                        sx={{
                          p: 1,
                          display: "grid",
                          gridAutoFlow: "row",
                          gridTemplateColumns:
                            "repeat(auto-fill, minmax(min(100%, 320px), 1fr))",
                        }}
                      >
                        {filteredFiles.length ? (
                          map(
                            filteredFiles,
                            (
                              {
                                name,
                                path,
                                description,
                                screenshots,
                                author,
                                size,
                              },
                              i
                            ) => (
                              <Box key={i} sx={{ p: 1 }}>
                                <FeatureCard
                                  name={name}
                                  description={description ?? "No description"}
                                  image={first(screenshots)}
                                  author={author}
                                  onOpenClick={() => {
                                    open(path);
                                    closeModal?.();
                                  }}
                                  size={size}
                                />
                              </Box>
                            )
                          )
                        ) : (
                          <Type color="text.secondary" sx={{ p: 1 }}>
                            No results match your search.
                          </Type>
                        )}
                      </Box>
                    ) : (
                      <Box sx={{ p: 2 }}>
                        <CircularProgress />
                      </Box>
                    )}
                  </TabPanel>
                  <TabPanel value="guides" sx={{ p: 0 }}>
                    <Box p={4} sx={{ textAlign: "center" }}>
                      <Type variant={narrow ? "h6" : "h4"}>Guides</Type>
                      <Type variant="subtitle2" color="text.secondary">
                        {`Learn how to use ${name} and explore ${name} features`}
                      </Type>
                    </Box>
                    <Stack
                      sx={{
                        p: 4,
                        maxWidth: 480,
                        mx: "auto",
                        textAlign: "center",
                        alignItems: "center",
                      }}
                      gap={2}
                    >
                      <Type>
                        We're still working on this feature. Check out our
                        documentation instead.
                      </Type>
                      <Button
                        onClick={() => window.open(docs, "_blank")}
                        sx={{
                          maxWidth: "min-content",
                        }}
                        startIcon={<LaunchOutlined />}
                      >
                        Open Documentation
                      </Button>
                    </Stack>
                  </TabPanel>
                </Box>
              </Box>
            </Scroll>
          </Flex>
        </Page.Content>
        <Page.Extras>
          {!narrow && (
            <FormControlLabel
              label="Show on start-up"
              labelPlacement="start"
              sx={{ ml: "auto", mr: -5, minWidth: "fit-content" }}
              control={
                <Checkbox
                  defaultChecked={showOnStartUpChecked}
                  onChange={(_, v) => onShowOnStartUpCheckedChange?.(v)}
                />
              }
            />
          )}
          {controls}
        </Page.Extras>
      </Page>
    </TabContext>
  );
}
