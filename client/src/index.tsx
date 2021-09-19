import { CssBaseline, ThemeProvider } from "@material-ui/core";
import { PlaybackService } from "client/services/PlaybackService";
import { SpecimenService } from "client/services/SpecimenService";
import { theme } from "client/theme";
import { SnackbarProvider } from "components/generic/Snackbar";
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
import { LoadingStateProvider } from "./slices/loadingState";

const slices = [
  InfoProvider,
  FeaturesProvider,
  UIStateProvider,
  SpecimenProvider,
  LoadingStateProvider,
];

const services = [PlaybackService, SpecimenService];
render(
  <StrictMode>
    <CssBaseline>
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
          <AppStateProvider slices={slices} services={services}>
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
