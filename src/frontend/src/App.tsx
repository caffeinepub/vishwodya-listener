import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { AdminAuthProvider } from "./hooks/useAdminAuth";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import BookPage from "./pages/BookPage";
import ConfirmationPage from "./pages/ConfirmationPage";
import HomePage from "./pages/HomePage";

function isAdminAuthenticated() {
  return sessionStorage.getItem("vishwodya_admin") === "true";
}

const rootRoute = createRootRoute({
  component: () => (
    <AdminAuthProvider>
      <Outlet />
      <Toaster richColors position="top-right" />
    </AdminAuthProvider>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const bookRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/book",
  component: BookPage,
});

const confirmationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/confirmation/$sessionId",
  component: ConfirmationPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminLoginPage,
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/dashboard",
  beforeLoad: () => {
    if (!isAdminAuthenticated()) {
      throw redirect({ to: "/admin" });
    }
  },
  component: AdminDashboardPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  bookRoute,
  confirmationRoute,
  adminRoute,
  adminDashboardRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
