import { CssBaseline } from "@material-ui/core";
import { StrictMode } from "react";
import { render } from "react-dom";
import { RPCClient } from "RPCClient";
import App from "./App";
import "./index.css";
import load from "./old/load";
import reportWebVitals from "./reportWebVitals";
import { CheckConnectionMethod } from "protocol/CheckConnection";

load().then(() => {
  render(
    <StrictMode>
      <CssBaseline>
        <App />
      </CssBaseline>
    </StrictMode>,
    document.getElementById("root")
  );
});

// TODO Remove temporary connection test
const DEV_URL = "http://localhost:8001/";
new RPCClient({ url: DEV_URL })
  .call<CheckConnectionMethod>("ping")
  .then((r = 0) =>
    console.log(`Server connection successful, server time: ${new Date(r)}`)
  );

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
