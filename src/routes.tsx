import { createBrowserRouter, Navigate } from "react-router";
import Landing from "./app/sharedScreens/Landing";
import Product from "./app/sharedScreens/Product";
import Login from "./app/sharedScreens/Login";
import MockApp from "./app/screens-mock/MockApp";
import Dashboard from "./app/Dashboard";
import AuthGate from "./AuthGate";
import { mockScreenPaths } from "./app/screens-mock/routesMock";

const mockScreenRouteEntries = Object.values(mockScreenPaths).map((path) => ({
    path,
    element: <MockApp />,
  }));

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
    path: "/mock/dashboard",
    element: <MockApp />,
  },
  {
    path: "/mock/dashboard/:screen",
    element: <MockApp />,
  },
  {
    path: "/mock/dashboard/insight/:insightId",
    element: <MockApp />,
  },
  {
    path: "/mock",
    element: <Navigate to="/mock/dashboard" replace />,
  },
  ...mockScreenRouteEntries,
  {
    path: `${mockScreenPaths["insight-detail"]}/:insightId`,
    element: <MockApp />,
  },
  {
    path: "/dashboard",
    element: (
      <AuthGate>
        <Dashboard />
      </AuthGate>
    ),
  },
  {
    path: "/dashboard/insights",
    element: (
      <AuthGate>
        <Dashboard />
      </AuthGate>
    ),
  },
  {
    path: "/dashboard/my-insights",
    element: (
      <AuthGate>
        <Dashboard />
      </AuthGate>
    ),
  },
  {
    path: "/dashboard/:screen",
    element: (
      <AuthGate>
        <Dashboard />
      </AuthGate>
    ),
  },
  {
    path: "/dashboard/ingestion/:tab",
    element: (
      <AuthGate>
        <Dashboard />
      </AuthGate>
    ),
  },
  {
    path: "/dashboard/ingestion/approval-review-queue/:insightId",
    element: (
      <AuthGate>
        <Dashboard />
      </AuthGate>
    ),
  },
  {
    path: "/insight/:insightId",
    element: (
      <AuthGate>
        <Dashboard />
      </AuthGate>
    ),
  },
]);
