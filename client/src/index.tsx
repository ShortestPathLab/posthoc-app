import {
  colors,
  createTheme,
  CssBaseline,
  ThemeProvider,
} from "@material-ui/core";
import { StrictMode } from "react";
import { render } from "react-dom";
import { FeaturesProvider } from "slices/features";
import { InfoProvider } from "slices/info";
import { UIStateProvider } from "slices/UIState";
import { SliceProvider as AppStateProvider } from "slices/SliceProvider";
import App from "./App";
import "./index.css";
import load from "./old/load";
import reportWebVitals from "./reportWebVitals";

load().then(() => {
  render(
    <StrictMode>
      <CssBaseline>
        <ThemeProvider
          theme={createTheme({
            palette: {
              primary: colors["blueGrey"],
            },
          })}
        >
          <AppStateProvider
            slices={[InfoProvider, FeaturesProvider, UIStateProvider]}
          >
            <App />
          </AppStateProvider>
        </ThemeProvider>
      </CssBaseline>
    </StrictMode>,
    document.getElementById("root")
  );
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
