import { createBrowserRouter } from "react-router";
import Landing from "./app/screens/Landing";
import Product from "./app/screens/Product";
import Login from "./app/screens/Login";
import Dashboard from "./app/Dashboard";
import AuthGate from "./AuthGate";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
  },
  {
    path: "/product",
    Component: Product,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: ":mock/dashboard",
    element: (
        <Dashboard useMockData={true}/>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <AuthGate>
        <Dashboard />
      </AuthGate>
    ),
  },
]);