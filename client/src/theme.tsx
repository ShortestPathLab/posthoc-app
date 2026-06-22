import type {} from "mui-create-material-you-theme/themeAugmentation";
import {
  alpha,
  colors,
  createTheme,
  SxProps,
  TextFieldProps,
  Theme,
  ThemeOptions,
} from "@mui/material";
import {
  argbFromHex,
  DynamicScheme,
  hexFromArgb,
  Hct,
  MaterialDynamicColors,
  SchemeTonalSpot,
} from "@material/material-color-utilities";
import { constant, floor, times } from "es-toolkit/compat";
import {
  createMaterialYouTheme,
  type MaterialYouSchemeExported,
} from "mui-create-material-you-theme";
import { slice } from "slices";
import { useOne } from "slices/useOne";

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
  shadeDark: Shade = "A100",
) => {
  return colors[color][mode === "dark" ? shadeDark : shadeLight];
};

const fontFamily = `"Inter", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans",
        "Droid Sans", "Helvetica Neue", "Arial", sans-serif`;
const headingFamily = `"Inter Tight", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans",
        "Droid Sans", "Helvetica Neue", "Arial", sans-serif`;

// Generate a full Material You (MD3) scheme from a single seed colour. This is
// the same tonal-spot engine `mui-create-material-you-theme` uses internally,
// but driven at runtime so our accent-colour picker keeps working instead of
// being pinned to a static scheme pasted from the Material Theme Builder.
const getSchemeFromSourceColor = (
  source: string,
  mode: "light" | "dark",
): MaterialYouSchemeExported => {
  const scheme = new SchemeTonalSpot(Hct.fromInt(argbFromHex(source)), mode === "dark", 0);
  const tokens = MaterialDynamicColors as unknown as Record<
    string,
    { getArgb: (s: DynamicScheme) => number }
  >;
  return Object.fromEntries(
    Object.getOwnPropertyNames(tokens)
      // `*PaletteKeyColor` tokens aren't part of the exported scheme shape.
      .filter((k) => !k.endsWith("PaletteKeyColor") && typeof tokens[k]?.getArgb === "function")
      .map((k) => [k, hexFromArgb(tokens[k].getArgb(scheme))]),
  ) as MaterialYouSchemeExported;
};

// Non-colour customisations. Material You only drives the palette + a set of
// component overrides, so these pass straight through and are preserved.
const themeOptions: ThemeOptions = {
  transitions: {
    easing: {
      easeInOut: "cubic-bezier(0.2, 0, 0, 1)",
      easeOut: "cubic-bezier(0.05, 0.7, 0.1, 1.0)",
      easeIn: "cubic-bezier(0.3, 0.0, 0.8, 0.15)",
    },
  },
  typography: {
    allVariants: { fontFamily },
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
    subtitle2: { marginTop: 6, fontWeight: 400 },
  },
  shape: { borderRadius: 8 },
  shadows: ["none", ...times(24, constant(shadow))] as ThemeOptions["shadows"],
};

// Component + palette overrides applied *after* Material You. The MY theme
// generator merges its own component overrides on top of whatever it's given,
// so to keep these custom styles winning they're layered on as a final pass.
const customComponents: ThemeOptions["components"] = {
  MuiPopover: {
    styleOverrides: {
      paper: {
        backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.06))",
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
      body1: { fontWeight: 400, fontSize: "0.875rem" },
      overline: {
        fontWeight: 400,
        textTransform: "none",
        letterSpacing: 0,
        fontSize: "0.875rem",
      },
      h4: { marginBottom: 12 },
      h6: { fontWeight: 400 },
    },
  },
};

export const makeTheme = (mode: "light" | "dark", theme: AccentColor) => {
  // Seed Material You from the accent colour's representative shade.
  const base = createMaterialYouTheme(
    mode,
    getSchemeFromSourceColor(colors[theme][500], mode),
    themeOptions,
  );
  // Keep our bespoke backgrounds and component styles on top of the MY palette.
  return createTheme(base, {
    palette: {
      background:
        mode === "dark"
          ? { default: "#0a0c10", paper: "#111317" }
          : { default: "#ebecf1", paper: "#ffffff" },
    },
    components: customComponents,
  });
};

export function useAcrylic(color?: string) {
  const { "appearance/acrylic": acrylic } = useOne(slice.settings);
  return (
    acrylic
      ? {
          backdropFilter: "blur(16px)",
          background: ({ palette }) => alpha(color ?? palette.background.paper, 0.75),
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
      borderRadius: 1,
      transition: ({ transitions }) => transitions.create(["background-color", "box-shadow"]),
      boxShadow: ({ shadows, palette }) =>
        palette.mode === "dark" ? shadows[1] : shadows[Math.max(floor(elevation) - 1, 0)],
      backgroundColor: ({ palette }) =>
        palette.mode === "dark"
          ? alpha(palette.action.disabledBackground, elevation * 0.02)
          : palette.background.paper,
      border: ({ palette }) =>
        palette.mode === "dark"
          ? `1px solid ${alpha(palette.text.primary, elevation * 0.08)}`
          : `1px solid ${alpha(palette.text.primary, elevation * 0.12)}`,
    }) satisfies SxProps<Theme>;
}

export const textFieldProps = { variant: "filled" } satisfies TextFieldProps;
