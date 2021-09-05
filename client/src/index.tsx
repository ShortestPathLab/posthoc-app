import {
  colors,
  createTheme,
  CssBaseline,
  ThemeProvider,
} from "@material-ui/core";
import { SnackbarProvider } from "components/Snackbar";
import { times } from "lodash";
import { StrictMode } from "react";
import { render } from "react-dom";
import { FeaturesProvider } from "slices/features";
import { InfoProvider } from "slices/info";
import { SliceProvider as AppStateProvider } from "slices/SliceProvider";
import { SpecimenProvider } from "slices/specimen";
import { UIStateProvider } from "slices/UIState";
import App from "./App";
import "./index.css";
import reportWebVitals from "./reportWebVitals";

const slices = [
  InfoProvider,
  FeaturesProvider,
  UIStateProvider,
  SpecimenProvider,
];

const SHADOW =
  "0px 8px 18px -1px rgb(0 0 0 / 8%), 0px 10px 48px 0px rgb(0 0 0 / 1%), 0px 20px 96px 0px rgb(0 0 0 / 0.5%)";

render(
  <StrictMode>
    <CssBaseline>
      <ThemeProvider
        theme={createTheme({
          palette: {
            primary: colors["blueGrey"],
          },
          shadows: ["", ...times(24, () => SHADOW)] as any,
        })}
      >
        <SnackbarProvider>
          <AppStateProvider slices={slices}>
            <App />
          </AppStateProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </CssBaseline>
  </StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
