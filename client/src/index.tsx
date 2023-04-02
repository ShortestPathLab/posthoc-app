import { CssBaseline } from "@material-ui/core";
import App from "App";
import { SnackbarProvider } from "components/generic/Snackbar";
import "index.css";
import { StrictMode } from "react";
import { render } from "react-dom";
import reportWebVitals from "reportWebVitals";
import { ConnectionsService } from "services/ConnectionsService";
import { PlaybackService } from "services/PlaybackService";
import { FeaturesService } from "services/FeaturesService";
import { SpecimenService } from "services/SpecimenService";
import { ConnectionsProvider } from "slices/connections";
import { FeaturesProvider } from "slices/features";
import { LoadingProvider } from "slices/loading";
import { SettingsProvider } from "slices/settings";
import { SliceProvider as EnvironmentProvider } from "slices/SliceProvider";
import { SpecimenProvider } from "slices/specimen";
import { UIStateProvider } from "slices/UIState";

const slices = [
  SettingsProvider,
  ConnectionsProvider,
  FeaturesProvider,
  UIStateProvider,
  SpecimenProvider,
  LoadingProvider,
];

const services = [
  ConnectionsService,
  PlaybackService,
  SpecimenService,
  FeaturesService,
];

render(
  <StrictMode>
    <SnackbarProvider>
      <EnvironmentProvider slices={slices} services={services}>
        <App />
      </EnvironmentProvider>
    </SnackbarProvider>
  </StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
