import { colors, createTheme } from "@material-ui/core";
import { alpha, SxProps, Theme } from "@material-ui/system";
import { TraceEventType } from "components/render/types/trace";
import { constant, times } from "lodash";
import { useSettings } from "slices/settings";

export type EventTypeColoursType = {
  [key in TraceEventType]: string
}

declare module '@material-ui/core/styles' {
  interface Theme {
    map: {
      walls: string;
    };
    event: EventTypeColoursType
  }
  interface ThemeOptions {
    map?: {
      walls?: string;
    };
    event?: EventTypeColoursType;
  }
}

const darkShadow = `
    0px 8px 18px -1px rgb(0 0 0 / 8%), 
    0px 10px 48px 0px rgb(0 0 0 / 1%), 
    0px 20px 96px 0px rgb(0 0 0 / 0.5%)
`;
const lightShadow = `
    0px 8px 18px -1px rgb(255 255 255 / 8%), 
    0px 10px 48px 0px rgb(255 255 255 / 1%), 
    0px 20px 96px 0px rgb(255 255 255 / 0.5%)
`;

export const getTheme = (preferDark:boolean = false) => createTheme(preferDark?{
  palette: {
    mode: 'dark',
    primary: colors["teal"],
    background: {
      paper: colors["grey"][900]
    }
  },
  map: {
    walls: colors["grey"][300]
  },
  event: {
    source: colors["teal"]["A700"],
    destination: colors["pink"]["A700"],
    expanding: colors["deepOrange"]["700"],
    generating: colors["yellow"]["700"],
    updating: colors["yellow"]["700"],
    closing: colors["blueGrey"][600],
    end: colors["pink"]["A700"],
  },
  shadows: ["", ...times(24, constant(lightShadow))] as any,
}:{
  palette: {
    mode: 'light',
    primary: colors["blueGrey"],
  },
  map: {
    walls: colors["blueGrey"][800]
  },
  event: {
    source: colors["teal"]["A400"],
    destination: colors["pink"]["A400"],
    expanding: colors["deepOrange"]["400"],
    generating: colors["yellow"]["400"],
    updating: colors["yellow"]["400"],
    closing: colors["blueGrey"]["200"],
    end: colors["pink"]["A400"],
  },
  shadows: ["", ...times(24, constant(darkShadow))] as any,
});

export function useAcrylic(): SxProps<Theme> {
  const [{ acrylic }] = useSettings();
  return acrylic
    ? {
        backdropFilter: "blur(5px)",
        background: ({ palette }) => alpha(palette.background.paper, 0.84),
      }
    : {
        backdropFilter: "blur(0px)",
        background: ({ palette }) => palette.background.paper,
      };
}
