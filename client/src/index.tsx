import {
  colors,
  createTheme,
  CssBaseline,
  ThemeProvider,
} from "@material-ui/core";
import { CheckConnectionMethod } from "protocol/CheckConnection";
import { AlgorithmFeatureQueryMethod } from "protocol/FeatureQuery";
import { PathfindingTaskMethod } from "protocol/SolveTask";
import { StrictMode } from "react";
import { render } from "react-dom";
import { RPCClient } from "RPCClient";
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
          <App />
        </ThemeProvider>
      </CssBaseline>
    </StrictMode>,
    document.getElementById("root")
  );
});

// TODO Remove temporary connection test
const DEV_URL = "http://localhost:8001/";

const client = new RPCClient({ url: DEV_URL });

client
  .call<CheckConnectionMethod>("about")
  .then((r) =>
    console.log(`Server connection successful, version ${r?.version}`)
  );

client
  .call<AlgorithmFeatureQueryMethod>("features/algorithm")
  .then(console.log);

client
  .call<PathfindingTaskMethod>("solve/pathfinding", {
    algorithm: "astar",
    mapURI: "",
    end: 0,
    start: 0,
    mapType: "",
  })
  .then(console.log);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
