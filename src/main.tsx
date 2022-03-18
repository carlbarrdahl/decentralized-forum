import React from "react";
import * as ReactDOM from "react-dom";
import { Buffer } from "buffer";

import "./index.css";
import App from "./App";

window.Buffer = Buffer;

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
