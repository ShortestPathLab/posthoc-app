import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./requestIdleCallbackPolyfill";
import App from "App";
import "index.css";
import "overlayscrollbars/overlayscrollbars.css";
import { createRoot } from "react-dom/client";
import { slices } from "slices";
import { SliceProvider as EnvironmentProvider } from "slices/SliceProvider";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient();

const root = createRoot(document.getElementById("root")!);

root.render(
  <EnvironmentProvider slices={slices}>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools />
    </QueryClientProvider>
  </EnvironmentProvider>
);
