import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { Error404 } from "@/pages/errors/Error404";
import { LoginPage } from "@/pages/login";
import { DashboardPage } from "@/pages/dashboard";
import { SupplyPage } from "@/pages/supply";
import { DishesPage } from "@/pages/dishes";
import { ProductsPage } from "@/pages/products";
import { MenuHintsPage } from "@/pages/menu-hints";
import { OrdersPage } from "@/pages/orders";
import { LogsPage } from "@/pages/logs";
import { AdminPanelPage } from "@/pages/admin-panel";
import MainLayout from "../layouts/MainLayout";

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: "/", element: <Navigate to="/dashboard" replace /> },
      { path: "/dashboard", element: <DashboardPage /> },
      { path: "/supply", element: <SupplyPage /> },
      { path: "/dishes", element: <DishesPage /> },
      { path: "/store", element: <ProductsPage /> },
      { path: "/menu-hints", element: <MenuHintsPage /> },
      { path: "/orders", element: <OrdersPage /> },
      { path: "/logs", element: <LogsPage /> },
      { path: "/admin-panel", element: <AdminPanelPage /> },
    ],
  },
  { path: "/login", element: <LoginPage /> },
  { path: "*", element: <Error404 /> },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
