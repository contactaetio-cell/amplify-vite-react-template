import { createBrowserRouter, Navigate } from "react-router";
import Landing from "./app/sharedScreens/Landing";
import Product from "./app/sharedScreens/Product";
import Login from "./app/sharedScreens/Login";
import DashboardMock from "./app/screens-mock/Dashboard-mock";
import Dashboard from "./app/Dashboard";
import AuthGate from "./AuthGate";
import ExportIcons from "./app/screens-mock/ExportIcons";
import { mockScreenPaths } from "./app/screens-mock/routesMock";

const mockScreenRouteEntries = Object.values(mockScreenPaths).map((path) => ({
    path,
    element: <DashboardMock />,
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
    path: "/export-icons",
    Component: ExportIcons,
  },
  {
    path: "/mock/dashboard",
    element: <Navigate to={mockScreenPaths.home} replace />,
  },
  {
    path: "/mock/dashboard/:screen",
    element: <DashboardMock />,
  },
  {
    path: "/mock/dashboard/insight/:insightId",
    element: <DashboardMock />,
  },
  {
    path: "/mock",
    element: <Navigate to={mockScreenPaths.home} replace />,
  },
  ...mockScreenRouteEntries,
  {
    path: `${mockScreenPaths["insight-detail"]}/:insightId`,
    element: <DashboardMock />,
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
    path: "/dashboard/:screen",
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
