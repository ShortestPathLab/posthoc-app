import "./requestIdleCallbackPolyfill";
import App from "App";
import "index.css";
import "overlayscrollbars/overlayscrollbars.css";
import { createRoot } from "react-dom/client";
import { slices } from "slices";
import { SliceProvider as EnvironmentProvider } from "slices/SliceProvider";

const root = createRoot(document.getElementById("root")!);

root.render(
  <EnvironmentProvider slices={slices}>
    <App />
  </EnvironmentProvider>
);
