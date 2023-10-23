import { SearchOutlined } from "@mui/icons-material";
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
import download from "downloadjs";
import { fileDialog as file } from "file-select-dialog";
import { startCase } from "lodash";
import PopupState, { bindMenu, bindTrigger } from "material-ui-popup-state";
import { customAlphabet } from "nanoid";
import logo from "public/logo512.png";
import { name, repository } from "public/manifest.json";
import { useEffect, useState } from "react";
import { UIState, useUIState } from "slices/UIState";
import { parse } from "yaml";

const id = customAlphabet("qwertyuiopasdfghjklzxcvbnm1234567890", 6);

function ext(s: string) {
  return s.split(".").pop();
}

export function saveWorkspace(filename: string, obj: UIState) {
  download(JSON.stringify(obj), `${filename}.json`, "application/json");
}

const FORMATS = ["json", "yaml"];
export async function loadWorkspace() {
  const f = await file({
    accept: FORMATS.map((c) => `.workspace.${c}`),
    strict: true,
  });
  if (f && FORMATS.includes(ext(f.name)!)) {
    const content = await f.text();
    const parsed = parse(content);
    return parsed as UIState;
  }
}

export const TitleBar = () => {
  const [UI, setUIState] = useUIState();
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
  return (
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
            <Box sx={{ p: 1, pr: 0, height: "100%" }}>
              <img src={logo} style={{ height: "100%" }} />
            </Box>
            <Type sx={{ fontSize: 14, fontWeight: 300, pr: 1.5 }}>{name}</Type>
            {[
              {
                key: "workspace",
                items: [
                  {
                    name: "Load workspace",
                    key: "workspace-load",
                    action: async () => {
                      const workspace = await loadWorkspace();
                      if (workspace) {
                        setUIState(workspace);
                      }
                    },
                  },
                  {
                    name: "Save workspace",
                    key: "workspace-save",
                    action: () => {
                      saveWorkspace(`${id()}.workspace`, UI);
                    },
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
  );
};
function CommandsButton() {
  const notify = useSnackbar();
  return (
    <ButtonBase
      onClick={() => notify("Commands are not yet implemented.")}
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
