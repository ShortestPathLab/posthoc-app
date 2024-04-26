import { OpenInNewOutlined, SearchOutlined } from "@mui/icons-material";
import {
  Box,
  ButtonBase,
  Divider,
  Menu,
  MenuItem,
  MenuList,
  Stack,
  Typography as Type,
} from "@mui/material";
import { FeaturePickerButton } from "components/app-bar/FeaturePickerButton";
import { Scroll } from "components/generic/Scrollbars";
import { useSnackbar } from "components/generic/Snackbar";
import { useWorkspace } from "hooks/useWorkspace";
import { startCase } from "lodash";
import PopupState, { bindMenu, bindTrigger } from "material-ui-popup-state";
import { nanoid as id } from "nanoid";
import logo from "public/logo512.png";
import { changelog, repository, version, docs } from "public/manifest.json";
import {
  ReactElement,
  ReactNode,
  cloneElement,
  useEffect,
  useState,
} from "react";
import { getDefaultViewTree, useView } from "slices/view";
import { ExportWorkspaceModal } from "./ExportWorkspaceModal";

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
  useEffect(() => {
    if ("windowControlsOverlay" in navigator) {
      const f = () => {
        setVisible(!!navigator.windowControlsOverlay.visible);
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
  return visible;
}

export const TitleBar = () => {
  const { save, load } = useWorkspace();
  const visible = useTitleBarVisible();
  const [, setView] = useView();
  const [exportModalOpen, setExportModalOpen] = useState(false);
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
              {[
                {
                  key: "view",
                  items: [
                    {
                      type: "action",
                      key: `panel-new-right`,
                      name: "Add panel to the right",
                      action: () => handleOpenPanel("horizontal"),
                    },
                    {
                      type: "action",
                      key: `panel-new-bottom`,
                      name: "Add panel below",
                      action: () => handleOpenPanel("vertical"),
                    },
                    { type: "divider" },
                    {
                      type: "action",
                      name: "Reset layout",
                      key: "panel-reset",
                      action: () => setView(getDefaultViewTree),
                    },
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
                    {
                      type: "action",
                      name: (
                        <MenuEntry
                          label="Publish workspace"
                          endIcon={<OpenInNewOutlined />}
                        />
                      ),
                      key: "workspace-save-metadata",
                      action: () => setExportModalOpen(true),
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
                      action: () =>
                        open(`${changelog}/changelog-${version}.md`, "_blank"),
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
      <ExportWorkspaceModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
      />
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
      <Type sx={{ mt: 0 }}>Commands</Type>
    </ButtonBase>
  );
}
