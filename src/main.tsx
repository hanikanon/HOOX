import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";
import { initOneSignal } from "./lib/onesignal";
import "./styles.css";

const router = getRouter();

// Best-effort — lets other devices reach this one with a real "incoming
// call" push notification even while the app is fully closed. Never blocks
// app startup if it fails (offline, first run before permission prompt,
// running in a plain browser tab, etc).
void initOneSignal();

const rootEl = document.getElementById("root")!;
createRoot(rootEl).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
