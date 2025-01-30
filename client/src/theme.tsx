import {
  alpha,
  colors,
  createTheme,
  SxProps,
  TextFieldProps,
  Theme,
  ThemeOptions,
} from "@mui/material";
import { constant, floor, times } from "lodash";
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
  shadeLight: Shade = "A700",
  shadeDark: Shade = "A100"
) => {
  return colors[color][mode === "dark" ? shadeDark : shadeLight];
};

const fontFamily = `"Inter", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans",
        "Droid Sans", "Helvetica Neue", "Arial", sans-serif`;
const headingFamily = `"Inter Tight", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans",
        "Droid Sans", "Helvetica Neue", "Arial", sans-serif`;

export const makeTheme = (mode: "light" | "dark", theme: AccentColor) =>
  createTheme({
    palette: {
      primary: { main: getShade(theme, mode) },
      mode,
      background:
        mode === "dark"
          ? // ? { default: "#101418", paper: "#14191f" }
            { default: "#0a0c10", paper: "#111317" }
          : { default: "#ebecef", paper: "#ffffff" },
    },
    transitions: {
      easing: {
        easeInOut: "cubic-bezier(0.2, 0, 0, 1)",
        easeOut: "cubic-bezier(0.05, 0.7, 0.1, 1.0)",
        easeIn: "cubic-bezier(0.3, 0.0, 0.8, 0.15)",
      },
    },
    typography: {
      allVariants: {
        fontFamily,
      },
      h1: { fontFamily: headingFamily },
      h2: { fontFamily: headingFamily },
      h3: { fontFamily: headingFamily },
      h4: { fontFamily: headingFamily },
      h5: { fontFamily: headingFamily, fontWeight: 400 },
      h6: { fontFamily: headingFamily, fontWeight: 450 },
      button: {
        textTransform: "none",
        fontWeight: 400,
        letterSpacing: 0,
        backgroundColor: "background.paper",
      },
      subtitle2: {
        marginTop: 6,
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
          h4: {
            marginBottom: 12,
          },
          h6: {
            fontWeight: 400,
          },
        },
      },
    },
    shadows: [
      "none",
      ...times(24, constant(shadow)),
    ] as ThemeOptions["shadows"],
  });

export function useAcrylic(color?: string) {
  const [{ "appearance/acrylic": acrylic }] = useSettings();
  return (
    acrylic
      ? {
          backdropFilter: "blur(16px)",
          background: ({ palette }) =>
            alpha(color ?? palette.background.paper, 0.75),
        }
      : {
          backdropFilter: "blur(0px)",
          background: ({ palette }) => color ?? palette.background.paper,
        }
  ) satisfies SxProps<Theme>;
}

export function usePaper() {
  return (elevation: number = 1) =>
    ({
      borderRadius: 1.5,
      transition: ({ transitions }) =>
        transitions.create(["background-color", "box-shadow"]),
      boxShadow: ({ shadows, palette }) =>
        palette.mode === "dark"
          ? shadows[1]
          : shadows[Math.max(floor(elevation) - 1, 0)],
      backgroundColor: ({ palette }) =>
        palette.mode === "dark"
          ? alpha(palette.action.disabledBackground, elevation * 0.02)
          : palette.background.paper,
      border: ({ palette }) =>
        palette.mode === "dark"
          ? `1px solid ${alpha(palette.text.primary, elevation * 0.08)}`
          : `1px solid ${alpha(palette.text.primary, elevation * 0.12)}`,
    } satisfies SxProps<Theme>);
}

export const textFieldProps = {
  variant: "filled",
} satisfies TextFieldProps;
