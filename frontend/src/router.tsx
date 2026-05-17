import { createBrowserRouter } from "react-router-dom";
import Layout from "./Layout";
import TreasurePage from "./pages/treasurePage";
import TreasureDetails from "./treasureDetails";
import CategoryPage from "./pages/categoryPage";

const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { path: "/treasure", Component: TreasurePage },
      { path: "/category", Component: CategoryPage },
      { path: "treasure/details/:id", Component: TreasureDetails },
    ],
  },
]);

export default router;
