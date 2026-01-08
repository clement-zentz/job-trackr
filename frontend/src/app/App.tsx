// SPDX-License-Identifier: AGPL-3.0-or-later
// File: frontend/src/app/App.tsx

import { RouterProvider } from "react-router-dom";
import { router } from "@/router";

export function App() {
  return <RouterProvider router={router} />;
}
