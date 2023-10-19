import { SearchOutlined } from "@mui/icons-material";
import { Box, ButtonBase, Stack, Typography as Type } from "@mui/material";
import { useSnackbar } from "components/generic/Snackbar";
import { name } from "manifest.json";
import logo from "public/logo512.png";
import { useEffect, useState } from "react";

export const TitleBar = () => {
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
      }}
    >
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
          <Type sx={{ fontSize: 14, fontWeight: 300 }}>{name}</Type>
          <Box sx={{ p: 0.75, height: "100%" }}>
            <CommandsButton />
          </Box>
        </Stack>
      </Box>
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
