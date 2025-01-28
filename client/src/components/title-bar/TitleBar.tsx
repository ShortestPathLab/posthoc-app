import {
  OpenInNewOutlined,
  SearchOutlined,
  WorkspacesOutlined,
} from "@mui-symbols-material/w400";
import {
  alpha,
  Box,
  ButtonBase,
  Chip,
  Collapse,
  Divider,
  Menu,
  MenuItem,
  MenuList,
  Stack,
  Tooltip,
  Typography as Type,
  useTheme,
} from "@mui/material";
import { FeaturePickerButton } from "components/app-bar/FeaturePickerButton";
import { Scroll } from "components/generic/Scrollbars";
import { useSnackbar } from "components/generic/Snackbar";
import { useSurface } from "components/generic/surface";
import { shades } from "components/renderer/colors";
import { useTitleBar } from "hooks/useTitleBar";
import { useWorkspace } from "hooks/useWorkspace";
import { get, startCase } from "lodash";
import PopupState, { bindMenu, bindTrigger } from "material-ui-popup-state";
import { isMobile } from "mobile-device-detect";
import { nanoid as id } from "nanoid";
import logo from "public/logo512.png";
import { changelog, docs, repository, version } from "public/manifest.json";
import {
  cloneElement,
  ReactElement,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { useSyncStatus } from "services/SyncService";
import { getDefaultViewTree, useView } from "slices/view";
import { getShade } from "theme";
import { ExportWorkspace } from "./ExportWorkspaceModal";
import { openWindow } from "./window";

const canOpenWindows = !isMobile;

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function MenuEntry({
  startIcon,
  endIcon,
  label,
}: {
  startIcon?: ReactElement;
  endIcon?: ReactElement;
  label: ReactNode;
}) {
  return (
    <Stack direction="row" gap={1}>
      {!!startIcon &&
        cloneElement(startIcon, { fontSize: "small", color: "disabled" })}
      <span>{label}</span>
      {!!endIcon &&
        cloneElement(endIcon, { fontSize: "small", color: "disabled" })}
    </Stack>
  );
}

export function useTitleBarVisible() {
  const [visible, setVisible] = useState(false);
  const [rect, setRect] = useState<DOMRect>(new DOMRect());
  useEffect(() => {
    if ("windowControlsOverlay" in navigator) {
      const f = () => {
        setVisible(!!navigator.windowControlsOverlay.visible);
        setRect(navigator.windowControlsOverlay.getTitlebarAreaRect());
      };
      navigator.windowControlsOverlay.addEventListener("geometrychange", f);
      f();
      return () =>
        navigator.windowControlsOverlay.removeEventListener(
          "geometrychange",
          f
        );
    }
  }, [setVisible]);
  return { visible, rect };
}

const WorkspaceChip = () => {
  const theme = useTheme();
  const { index, isPrimary, participants, peers } = useSyncStatus();
  const shade = shades[((index + 1) * 2) % shades.length];
  const a = alphabet[index];
  const color = getShade(shade, theme.palette.mode);
  return (
    <Tooltip
      title={`${isPrimary ? "Primary" : "Secondary"} window, ${
        participants.length + 1
      } in group`}
    >
      <Collapse
        in={!!peers.length}
        orientation="horizontal"
        sx={{ ml: "0px !important", overflow: "hidden" }}
      >
        <Chip
          size="small"
          icon={<WorkspacesOutlined sx={{ color: `${color} !important` }} />}
          sx={{
            ml: 1,
            flex: 0,
            WebkitAppRegion: "no-drag",
            color: color,
            background: alpha(color, 0.08),
          }}
          label={`Group ${a}`}
        />
      </Collapse>
    </Tooltip>
  );
};

export const TitleBarPlaceholder = () => {
  const visible = useTitleBarVisible();
  const { palette } = useTheme();
  const color = palette.background.default;
  useTitleBar(color);
  return (
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: 36,
        width: "100%",
        height: visible ? "env(titlebar-area-height, 50px)" : 0,
      }}
    />
  );
};

export const TitleBar = () => {
  const { palette } = useTheme();
  const color = palette.background.default;
  useTitleBar(color);
  // const push = useSnackbar();
  const { save, load } = useWorkspace();
  const { visible, rect } = useTitleBarVisible();
  const [, setView] = useView();
  // const sm = useSmallDisplay();
  // const prevSm = usePrevious(sm);
  // useEffect(() => {
  //   if (isBoolean(prevSm)) {
  //     if (sm) {
  //       push("Do you want to reset layout?", "Window size is small", {
  //         actionLabel: "Reset layout",
  //         action: () => setView(getDefaultViewTree),
  //       });
  //     }
  //   }
  // }, [sm, prevSm, setView]);
  const { open: openModal, dialog } = useSurface(ExportWorkspace, {
    title: "Export Workspace",
  });
  function handleOpenPanel(orientation: "horizontal" | "vertical") {
    setView(({ view }) => {
      return {
        view: {
          type: "branch",
          orientation,
          key: id(),
          children: [
            { ...view, size: 80 },
            {
              type: "leaf",
              key: id(),
              content: { type: "" },
              size: 20,
              acceptDrop: true,
            },
          ],
        },
      };
    });
  }

  return (
    <>
      <Box
        sx={{
          mx: 0.5,
          borderBottom: (t) => `1px solid ${t.palette.background.default}`,
          minHeight: 36,
          paddingLeft: "env(titlebar-area-x, 0px)",
          height: visible ? "env(titlebar-area-height, 50px)" : 0,
          width: "env(titlebar-area-width, 100%)",
          WebkitAppRegion: "drag",
          overflowX: "auto",
        }}
      >
        <Scroll x style={{ height: "100%" }}>
          <Box sx={{ height: "100%" }}>
            <Stack
              direction="row"
              spacing={1}
              sx={{ height: "100%" }}
              alignItems="center"
              justifyContent="flex-start"
            >
              {(!visible || rect.x === 0) && (
                // Hide for macos style windows
                <Box
                  sx={{
                    p: 1,
                    height: "100%",
                    // Firefox fix
                    maxWidth: "min-content",
                    aspectRatio: 1,
                  }}
                >
                  <img src={logo} style={{ height: "100%" }} />
                </Box>
              )}
              {<WorkspaceChip />}
              {[
                {
                  key: "view",
                  items: [
                    {
                      disabled: !canOpenWindows,
                      key: "panel-new-window",
                      type: "action",
                      name: "New window",
                      action: () => openWindow(),
                    },
                    { type: "divider" },
                    {
                      type: "action",
                      key: `panel-new-right`,
                      name: "Add view to the right",
                      action: () => handleOpenPanel("horizontal"),
                    },
                    {
                      type: "action",
                      key: `panel-new-bottom`,
                      name: "Add view below",
                      action: () => handleOpenPanel("vertical"),
                    },
                    { type: "divider" },
                    {
                      type: "action",
                      name: "Reset layout",
                      key: "panel-reset",
                      action: () => setView(getDefaultViewTree),
                    },
                    {
                      type: "action",
                      name: "Reload window",
                      key: "panel-reload",
                      action: () => location.reload(),
                    },
                    // {
                    //   type: "action",
                    //   name: "New workspace",
                    //   action: () =>
                    //     openWindow({ linked: false, minimal: false }),
                    // },
                  ],
                },
                {
                  key: "workspace",
                  items: [
                    {
                      type: "action",
                      name: "Open workspace",
                      key: "workspace-load",
                      action: load,
                    },
                    {
                      type: "action",
                      name: "Save workspace",
                      key: "workspace-save",
                      action: save,
                    },
                    { type: "divider" },
                    {
                      type: "action",
                      name: (
                        <MenuEntry
                          label="Publish workspace"
                          endIcon={<OpenInNewOutlined />}
                        />
                      ),
                      key: "workspace-save-metadata",
                      action: () => openModal({}),
                    },
                  ],
                },
                {
                  key: "help",
                  items: [
                    {
                      type: "action",
                      name: "Open repository in GitHub",
                      key: "github",
                      action: () => open(repository, "_blank"),
                    },
                    {
                      type: "action",
                      name: "Changelog",
                      key: "changelog",
                      action: () => open(`${changelog}/${version}`, "_blank"),
                    },
                    {
                      type: "action",
                      name: "Documentation",
                      key: "documentation",
                      action: () => open(docs, "_blank"),
                    },
                  ],
                },
              ].map(({ key, items }) => (
                <PopupState key={key} variant="popover">
                  {(state) => (
                    <>
                      <Menu {...bindMenu(state)}>
                        <MenuList dense sx={{ p: 0 }}>
                          {items.map((item, i) => {
                            if (item.type === "action") {
                              const { name, key, action } = item;
                              return (
                                <MenuItem
                                  disabled={get(item, "disabled")}
                                  key={key}
                                  onClick={() => {
                                    action?.();
                                    state.close();
                                  }}
                                >
                                  {name}
                                </MenuItem>
                              );
                            } else {
                              return <Divider key={i} />;
                            }
                          })}
                        </MenuList>
                      </Menu>
                      <FeaturePickerButton
                        key={key}
                        {...bindTrigger(state)}
                        sx={{
                          WebkitAppRegion: "no-drag",
                          minWidth: "fit-content",
                          p: 0.5,
                          px: 1,
                        }}
                      >
                        {startCase(key)}
                      </FeaturePickerButton>
                    </>
                  )}
                </PopupState>
              ))}
              {/* <Box sx={{ p: 0.75, height: "100%" }}>
              <CommandsButton />
            </Box> */}
            </Stack>
          </Box>
        </Scroll>
      </Box>
      {dialog}
    </>
  );
};

export function CommandsButton() {
  const notify = useSnackbar();
  return (
    <ButtonBase
      onClick={() => notify("Commands are not yet implemented")}
      sx={{
        WebkitAppRegion: "no-drag",
        fontSize: 14,
        borderRadius: (t) => t.shape.borderRadius,
        "&:hover": {
          bgcolor: "background.paper",
        },
        height: "100%",
        m: 0,
        display: "flex",
        alignItems: "center",
        px: 1,
        pr: 2,
        gap: (t) => t.spacing(1),
        color: "text.secondary",
        cursor: "text",
      }}
    >
      <SearchOutlined fontSize="small" color="disabled" />{" "}
      <Type component="div" sx={{ mt: 0 }}>
        Commands
      </Type>
    </ButtonBase>
  );
}
