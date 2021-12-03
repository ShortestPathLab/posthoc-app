import { colors, createTheme } from "@material-ui/core";
import { alpha, SxProps, Theme } from "@material-ui/system";
import { constant, times } from "lodash";
import { useSettings } from "slices/settings";

const shadow = `
    0px 8px 18px -1px rgb(0 0 0 / 8%), 
    0px 10px 48px 0px rgb(0 0 0 / 1%), 
    0px 20px 96px 0px rgb(0 0 0 / 0.5%)
`;

export const theme = createTheme({
  palette: {
    primary: colors["blueGrey"],
  },
  shadows: ["", ...times(24, constant(shadow))] as any,
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
