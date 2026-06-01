import React from "react";
import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App";
import { GOOGLE_CLIENT_ID } from "./components/auth/GoogleSignInButton";
import { setupPwa } from "./pwa";
import "./index.css";

const tree = GOOGLE_CLIENT_ID ? (
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <App />
  </GoogleOAuthProvider>
) : (
  <App />
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>{tree}</React.StrictMode>,
);

setupPwa();
