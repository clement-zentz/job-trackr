// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/main.tsx

import "./index.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App, AppProviders } from "@/app";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
);
