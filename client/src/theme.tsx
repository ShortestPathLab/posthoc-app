import { colors, createTheme } from "@mui/material";
import { alpha, SxProps, Theme } from "@mui/material";
import { constant, times } from "lodash";
import { useSettings } from "slices/settings";

export type AccentColor = Exclude<keyof typeof colors, "common" | undefined>;

export const { common, ...accentColors } = colors;

const shadow = `
    0px 8px 18px -1px rgb(0 0 0 / 8%), 
    0px 10px 48px 0px rgb(0 0 0 / 1%), 
    0px 20px 96px 0px rgb(0 0 0 / 0.5%)
`;

export const makeTheme = (mode: "light" | "dark", theme: AccentColor) =>
  createTheme({
    palette: {
      primary: { main: colors[theme][mode === "dark" ? "200" : "500"] },
      mode,
      background:
        mode === "dark"
          ? { default: "#1c2128", paper: "#22272e" }
          : { default: "#f6f8fa", paper: "#ffffff" },
    },
    typography: {
      allVariants: {
        fontFamily: "Inter",
      },
      button: {
        textTransform: "none",
        letterSpacing: 0,
      },
    },
    components: {
      MuiTypography: {
        styleOverrides: {
          body1: {
            fontWeight: 500,
            fontSize: "0.875rem",
          },
          overline: {
            fontWeight: 500,
            textTransform: "none",
            letterSpacing: 0,
            fontSize: "0.875rem",
          },
          h6: {
            fontWeight: 600,
            letterSpacing: -0.4,
          },
        },
      },
    },
    shadows: ["", ...times(24, constant(shadow))] as any,
  });

export function useAcrylic(): SxProps<Theme> {
  const [{ acrylic }] = useSettings();
  return acrylic
    ? {
        backdropFilter: "blur(10px)",
        background: ({ palette }) => alpha(palette.background.paper, 0.84),
      }
    : {
        backdropFilter: "blur(0px)",
        background: ({ palette }) => palette.background.paper,
      };
}