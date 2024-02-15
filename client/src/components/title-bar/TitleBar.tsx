import {
  ArrowOutwardOutlined,
  LinkOutlined,
  OpenInNewOutlined,
  SearchOutlined,
} from "@mui/icons-material";
import {
  Box,
  ButtonBase,
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
import logo from "public/logo512.png";
import { docs, repository, version } from "public/manifest.json";
import { useEffect, useState } from "react";
import { ExportWorkspaceModal } from "./ExportWorkspaceModal";

export const TitleBar = () => {
  const { save, load } = useWorkspace();
  const [visible, setVisible] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
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
  return (
    <>
      <Box
        sx={{
          mt: -0.5,
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
            >
              <Box sx={{ p: 1, height: "100%" }}>
                <img src={logo} style={{ height: "100%" }} />
              </Box>
              {[
                {
                  key: "workspace",
                  items: [
                    {
                      name: "Open workspace",
                      key: "workspace-load",
                      action: load,
                    },
                    {
                      name: "Save workspace",
                      key: "workspace-save",
                      action: save,
                    },
                    {
                      name: (
                        <Stack direction="row" gap={1}>
                          <span>Publish workspace</span>
                          <OpenInNewOutlined
                            fontSize="small"
                            color="disabled"
                          />
                        </Stack>
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
                      name: "Open repository in GitHub",
                      key: "github",
                      action: () => open(repository, "_blank"),
                    },
                    {
                      name: "Open changelog",
                      key: "changelog",
                      action: () =>
                        open(`${docs}/changelog-${version}.md`, "_blank"),
                    },
                    {
                      name: "Open documentation",
                      key: "documentation",
                      action: () =>
                        open(
                          `https://path-visualiser.github.io/docs/overview/`,
                          "_blank"
                        ),
                    },
                  ],
                },
              ].map(({ key, items }) => (
                <PopupState key={key} variant="popover">
                  {(state) => (
                    <>
                      <Menu {...bindMenu(state)}>
                        <MenuList dense sx={{ p: 0 }}>
                          {items.map(({ name, key, action }) => (
                            <MenuItem
                              key={key}
                              onClick={() => {
                                action?.();
                                state.close();
                              }}
                            >
                              {name}
                            </MenuItem>
                          ))}
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
              <Box sx={{ p: 0.75, height: "100%" }}>
                <CommandsButton />
              </Box>
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

function CommandsButton() {
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
