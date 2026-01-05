// frontend/src/router.tsx

import { createBrowserRouter } from "react-router-dom";
import { JobOffers } from "./pages/JobOffers";

export const router = createBrowserRouter([
    { path: "/", element:<JobOffers /> },
]);
