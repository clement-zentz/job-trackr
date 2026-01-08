// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/main.tsx

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App, AppProviders } from "@/app";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
);
