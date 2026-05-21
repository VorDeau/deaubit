import { createBrowserRouter } from "react-router-dom";
import PageWrapperClient from "./components/PageWrapperClient";
import HomePage from "./pages/Home";
import DashPage from "./pages/Dash";
import DashSettingsPage from "./pages/DashSettings";
import AdminPage from "./pages/Admin";
import AdminDeletePage from "./pages/AdminDelete";
import DataDeletedPage from "./pages/DataDeleted";
import TermsPage from "./pages/Terms";
import PrivacyPage from "./pages/Privacy";
import ReportPage from "./pages/Report";
import NotFoundPage from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    element: <PageWrapperClient />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/dash", element: <DashPage /> },
      { path: "/dash/settings", element: <DashSettingsPage /> },
      { path: "/admin", element: <AdminPage /> },
      { path: "/admin/delete", element: <AdminDeletePage /> },
      { path: "/data-deleted", element: <DataDeletedPage /> },
      { path: "/terms", element: <TermsPage /> },
      { path: "/privacy", element: <PrivacyPage /> },
      { path: "/report", element: <ReportPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
