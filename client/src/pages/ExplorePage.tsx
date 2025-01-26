import {
  RocketLaunchOutlined as LaunchOutlined,
  SearchOutlined,
  WorkspacesOutlined,
} from "@mui-symbols-material/w400";
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
import { ColorTranslator } from "colortranslator";
import { Flex } from "components/generic/Flex";
import { Scroll } from "components/generic/Scrollbars";
import { useSnackbar } from "components/generic/Snackbar";
import { useFullscreenModalContext } from "components/inspector/FullscreenModalHost";
import { useViewTreeContext } from "components/inspector/ViewTree";
import { useSm } from "hooks/useSmallDisplay";
import { useWorkspace } from "hooks/useWorkspace";
import { chain as _, entries, first, map, round, upperCase } from "lodash";
import memoizee from "memoizee";
import { FeatureDescriptor } from "protocol/FeatureQuery";
import { docs, name } from "public/manifest.json";
import { CSSProperties, ReactNode, useMemo, useState } from "react";
import { useAsync } from "react-async-hook";
import { useLoadingState } from "slices/loading";
import { useSettings } from "slices/settings";
import { textFieldProps, usePaper } from "theme";
import { parse, stringify } from "yaml";
import { Button } from "../components/generic/Button";
import { Image } from "./Image";
import { PageContentProps } from "./PageMeta";

const paths = import.meta.glob<boolean, string, string>(
  "/public/recipes/*.workspace",
  {
    query: "?url",
    import: "default",
  }
);

const metaPaths = import.meta.glob<boolean, string, string>(
  "/public/recipes/*.workspace.meta",
  {
    query: "?url",
    import: "default",
  }
);

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

// eslint-disable-next-line react/display-name
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
    } catch {
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

export function FeatureCardLoader({
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
  ) : (
    <></>
  );
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
      <>
        {acrylic && (
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
                  backgroundPosition: "center -52px",
                }}
              />
            </Box>
          </Fade>
        )}
        <CardHeader
          sx={{
            flexDirection: "column",
            "> .MuiCardHeader-content": { overflow: "hidden" },
          }}
          avatar={
            <Box
              sx={{
                ...paper(1),
                border: "none",
                borderRadius: 1,
                width: 86,
                height: 86,
                overflow: "hidden",
                mb: 4,
              }}
            >
              <Fade in={!!image}>
                <Box
                  sx={{
                    width: 86,
                    height: 86,
                    backgroundImage: `url("${image}")`,
                    backgroundSize: "100%",
                    backgroundPosition: "center",
                  }}
                ></Box>
              </Fade>
            </Box>
          }
          titleTypographyProps={ellipsisProps}
          title={loading ? <Skeleton /> : name || "Untitled"}
          subheaderTypographyProps={ellipsisProps}
          subheader={
            <Stack gap={2} sx={{ pt: 1 }}>
              <Type
                component="div"
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
                  ? map([80, 30], (v) => <Skeleton key={v} width={`${v}%`} />)
                  : description || "No description"}
              </Type>
              <Stack direction="row" alignItems="center" gap={1}>
                {avatar?.({ width: 18, height: 18, fontSize: "0.8rem" })}
                <Type component="div" variant="caption">
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
                  <Type component="div">Open</Type>
                  {!!size && (
                    <Type component="div" color="text.secondary">
                      {round(size / 1024 / 1024, 2)} MB
                    </Type>
                  )}
                </Stack>
              </Button>
            </Stack>
          }
        />
      </>
    </Card>
  );
}

const CONTENT_WIDTH = 740;

const entries2 = entries(paths);

export function ExplorePage({ template: Page }: PageContentProps) {
  const theme = useTheme();
  const [{ "behaviour/showOnStart": showOnStart }, setSettings] = useSettings();
  const notify = useSnackbar();
  const { controls, onChange, state, dragHandle, isViewTree } =
    useViewTreeContext();
  const { close: closeModal } = useFullscreenModalContext();
  const sm = useSm();
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
        load(file, new URL(location.href).origin);
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

  function blur() {
    const accent = new ColorTranslator(theme.palette.primary.main).H;
    const blue = new ColorTranslator("rgba(0,50,255,.2)").H;

    return (
      <Box
        sx={{
          position: "absolute",
          top: "-100%",
          left: "calc(50%)",
          width: "100%",
          zIndex: -1,
          transform: "translateX(-50%) rotate(180deg)",
          height: "150%",
          filter: `hue-rotate(${accent - blue}deg)`,
          minWidth: 640,
          opacity: 0.75,
          background: `radial-gradient(46.56% 45.08% at 56.04% 55.33%,rgba(0,50,255,.2) 0,transparent 100%),radial-gradient(46.69% 41.74% at 69.64% 60.81%,rgba(192,59,196,.2) 0,transparent 100%),radial-gradient(59.78% 45.73% at 30.42% 58.68%,rgba(0,120,212,.2) 0,transparent 100%),radial-gradient(32.53% 31.57% at 50% 66.82%,rgba(70,54,104,.2) 0,transparent 100%)`,
        }}
      ></Box>
    );
  }

  return (
    <TabContext value={tab}>
      <Page onChange={onChange} stack={state}>
        <Page.Title>Explore Posthoc</Page.Title>
        <Page.Key>explore</Page.Key>
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
                      <Type component="div" variant={narrow ? "h6" : "h4"}>
                        Examples
                      </Type>
                      <Type
                        component="div"
                        variant="subtitle2"
                        color="text.secondary"
                      >
                        Browse a library of included and community-made examples
                      </Type>
                    </Box>
                    {theme.palette.mode === "dark" && blur()}
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
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search examples"
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchOutlined />
                              </InputAdornment>
                            ),
                          },
                        }}
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
                        <FeatureCardLoader
                          key={entry[0]}
                          search={search}
                          entry={entry}
                          onOpenClick={(p) => {
                            open(p);
                            closeModal?.();
                          }}
                        />
                      ))}
                    </Box>
                  </TabPanel>
                  <TabPanel value="guides" sx={{ p: 0 }}>
                    <Box p={4} sx={{ textAlign: "center" }}>
                      <Type component="div" variant={narrow ? "h6" : "h4"}>
                        Guides
                      </Type>
                      <Type
                        component="div"
                        variant="subtitle2"
                        color="text.secondary"
                      >
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
                      <Type component="div">
                        We&apos;re still working on this feature. Check out our
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
