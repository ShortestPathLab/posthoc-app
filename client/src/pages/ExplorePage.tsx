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
  Fade,
  FormControlLabel,
  InputAdornment,
  Skeleton,
  Stack,
  SxProps,
  Tab,
  TextField,
  Typography as Type,
  useTheme,
} from "@mui/material";
import { Flex } from "components/generic/Flex";
import { Scroll } from "components/generic/Scrollbars";
import { useSnackbar } from "components/generic/Snackbar";
import { useFullscreenModalContext } from "components/inspector/FullscreenModalHost";
import { useViewTreeContext } from "components/inspector/ViewTree";
import { useSmallDisplay } from "hooks/useSmallDisplay";
import { useWorkspace } from "hooks/useWorkspace";
import { chain as _, entries, first, map, round, upperCase } from "lodash";
import { FeatureDescriptor } from "protocol/FeatureQuery";
import { docs, name } from "public/manifest.json";
import {
  CSSProperties,
  ComponentProps,
  ReactNode,
  useMemo,
  useState,
} from "react";
import { useAsync } from "react-async-hook";
import { useLoadingState } from "slices/loading";
import { useSettings } from "slices/settings";
import { textFieldProps, usePaper } from "theme";
import { parse, stringify } from "yaml";
import { Button } from "../components/generic/Button";
import { PageContentProps } from "./PageMeta";
import memoizee from "memoizee";
import PopupState from "material-ui-popup-state";
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

const getFileInfo = memoizee(
  async (k: string, f: () => Promise<string>) => {
    return {
      name: _(k).thru(basename).thru(stripExtension).startCase().value(),
      path: await f(),
      ...(await getMeta(k)),
    };
  },
  { normalizer: ([k]) => k }
);

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
                <Avatar sx={sx}>
                  <Image
                    width="100%"
                    height="100%"
                    src={`https://github.com/${pathname}.png`}
                  />
                </Avatar>
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

export function Image(props: ComponentProps<"img">) {
  return (
    <PopupState variant="popover">
      {({ open, isOpen }) => (
        <>
          <Fade in={isOpen}>
            <img {...props} onLoad={open}></img>
          </Fade>
        </>
      )}
    </PopupState>
  );
}

const ellipsisProps = {
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  overflow: "hidden",
} satisfies CSSProperties;

export function FeatureCard2({
  entry,
  onOpenClick,
  search,
}: {
  entry?: [string, () => Promise<string>];
  onOpenClick?: (path: string) => void;
  search?: string;
}) {
  const { result, loading } = useAsync(async () => {
    if (entry) {
      return await getFileInfo(...entry);
    }
  }, [entry]);
  const { name, description, screenshots, author, path, size } = result ?? {};
  const match = upperCase(stringify(result)).includes(upperCase(search));
  return match ? (
    <Box sx={{ p: 1 }}>
      <FeatureCard
        loading={loading}
        name={name}
        description={description ?? "No description"}
        image={first(screenshots)}
        author={author}
        onOpenClick={() => {
          onOpenClick?.(path);
        }}
        size={size}
      />
    </Box>
  ) : undefined;
}

export function FeatureCard({
  name,
  description,
  image,
  author,
  size,
  onOpenClick,
  loading,
  ...rest
}: Partial<ExampleDescriptor> &
  CardProps & { onOpenClick?: () => void; loading?: boolean }) {
  const [{ "appearance/acrylic": acrylic }] = useSettings();
  const paper = usePaper();
  const theme = useTheme();

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
        <>
          <Fade in={!loading} timeout={theme.transitions.duration.complex}>
            <Box>
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
              />
            </Box>
          </Fade>
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
                <Fade in={!!image}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      backgroundImage: `url("${image}")`,
                      backgroundSize: "100%",
                      backgroundPosition: "center",
                    }}
                  ></Box>
                </Fade>
              </Box>
            }
            titleTypeProps={ellipsisProps}
            title={loading ? <Skeleton /> : name || "Untitled"}
            subheaderTypeProps={ellipsisProps}
            subheader={
              <Stack gap={2} sx={{ pt: 1, alignItems: "flex-start" }}>
                <Type
                  sx={{
                    ...ellipsisProps,
                    maxWidth: "100%",
                    width: "100%",
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 3,
                    whiteSpace: "break-spaces",
                    height: 60,
                  }}
                >
                  {loading
                    ? map([80, 30], (v) => <Skeleton width={`${v}%`} />)
                    : description || "No description"}
                </Type>
                <Stack direction="row" alignItems="center" gap={1}>
                  {avatar?.({ width: 18, height: 18, fontSize: "0.8rem" })}
                  <Type variant="caption">
                    {loading ? <Skeleton width={120} /> : authorName}
                  </Type>
                </Stack>
                <Button
                  disabled={loading}
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
        </>
      )}
    </Card>
  );
}

const CONTENT_WIDTH = 940;

const entries2 = entries(paths);

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
                    <Box
                      sx={{
                        p: 1,
                        display: "grid",
                        gridAutoFlow: "row",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(min(100%, 320px), 1fr))",
                      }}
                    >
                      {map(entries2, (entry) => (
                        <FeatureCard2
                          key={entry[0]}
                          search={search}
                          entry={entry}
                          onOpenClick={(p) => {
                            open(p), closeModal?.();
                          }}
                        />
                      ))}
                    </Box>
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
