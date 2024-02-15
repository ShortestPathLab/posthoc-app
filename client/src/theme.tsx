import {
  alpha,
  colors,
  createTheme,
  SxProps,
  TextFieldProps,
  Theme,
} from "@mui/material";
import { constant, times } from "lodash";
import { useSettings } from "slices/settings";

export type AccentColor = Exclude<keyof typeof colors, "common" | undefined>;

export type Shade = keyof (typeof colors)[AccentColor];

export const { common, ...accentColors } = colors;

const shadow = `
    0px 4px 9px -1px rgb(0 0 0 / 4%), 
    0px 5px 24px 0px rgb(0 0 0 / 4%), 
    0px 10px 48px 0px rgb(0 0 0 / 4%)
`;

export const getShade = (
  color: AccentColor = "blue",
  mode: "light" | "dark" = "light",
  shade?: Shade
) => {
  return colors[color][shade ?? (mode === "dark" ? "A100" : "A700")];
};

const fontFamily = `"Inter", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans",
        "Droid Sans", "Helvetica Neue", "Arial", sans-serif`;
export const makeTheme = (mode: "light" | "dark", theme: AccentColor) =>
  createTheme({
    palette: {
      primary: { main: getShade(theme, mode) },
      mode,
      background:
        mode === "dark"
          ? // ? { default: "#101418", paper: "#14191f" }
            { default: "#09090b", paper: "#0f1114" }
          : { default: "#f6f8fa", paper: "#ffffff" },
    },
    typography: {
      allVariants: {
        fontFamily,
      },
      button: {
        textTransform: "none",
        fontWeight: 400,
        letterSpacing: 0,
        backgroundColor: "background.paper",
      },
      subtitle2: {
        fontWeight: 400,
      },
    },
    components: {
      MuiPopover: {
        styleOverrides: {
          paper: {
            backgroundImage:
              "linear-gradient(rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.06))",
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundImage: "linear-gradient(#1c2128, #1c2128)",
            fontFamily,
          },
        },
      },
      MuiTypography: {
        styleOverrides: {
          body1: {
            fontWeight: 400,
            fontSize: "0.875rem",
          },
          overline: {
            fontWeight: 400,
            textTransform: "none",
            letterSpacing: 0,
            fontSize: "0.875rem",
          },
          h6: {
            fontWeight: 500,
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
        background: ({ palette }) => alpha(palette.background.paper, 0.75),
      }
    : {
        backdropFilter: "blur(0px)",
        background: ({ palette }) => palette.background.paper,
      };
}

export function usePaper(): (e?: number) => SxProps<Theme> {
  return (elevation: number = 1) => ({
    boxShadow: ({ shadows, palette }) =>
      palette.mode === "dark"
        ? shadows[1]
        : shadows[Math.max(elevation - 1, 0)],
    backgroundColor: ({ palette }) =>
      palette.mode === "dark"
        ? alpha(palette.action.disabledBackground, elevation * 0.02)
        : palette.background.paper,
    border: ({ palette }) =>
      palette.mode === "dark"
        ? `1px solid ${alpha(palette.text.primary, elevation * 0.08)}`
        : `1px solid ${alpha(palette.text.primary, elevation * 0.16)}`,
  });
}

export const textFieldProps = {
  variant: "filled",
} satisfies TextFieldProps;
