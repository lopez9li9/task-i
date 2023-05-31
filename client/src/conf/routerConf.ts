import { createBrowserRouter } from "react-router-dom";

import Landing from "../pages/Landing";
import Home from "../pages/Home";
import NotFound from "../pages/NotFound";
import Inscriptions from "../pages/Inscriptions";
import Teams from "../pages/Teams";

const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
  },
  {
    path: "/home",
    Component: Home,
    children: [
      {
        path: "inscriptions",
        Component: Inscriptions,
      },
      {
        path: "teams",
        Component: Teams,
      },
    ],
  },
  {
    path: "*",
    Component: NotFound,
  },
]);

export default router;
