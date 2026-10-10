import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { Error404 } from "@/pages/errors/Error404";
import { LoginPage } from "@/pages/login";
import { RegisterPage, RestaurantRegisterPage } from "@/pages/register";
import { DashboardPage } from "@/pages/dashboard";
import { SupplyPage } from "@/pages/supply";
import {
  DishesPage,
  DishDetailsPage,
  DishesRoutesLayout,
} from "@/pages/dishes";
import { ProductsPage } from "@/pages/store";
import { MenuHintsPage } from "@/pages/menu-hints";
import { OrdersPage } from "@/pages/orders";
import { LogsPage } from "@/pages/logs";
import { AdminPanelPage } from "@/pages/admin-panel";
import MainLayout from "../layouts/MainLayout";
import { AuthLayout } from "@/widgets/auth-layout";

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: "/", element: <Navigate to="/dashboard" replace /> },
      { path: "/dashboard", element: <DashboardPage /> },
      { path: "/supply", element: <SupplyPage /> },
      {
        path: "/dishes",
        element: <DishesRoutesLayout />,
        children: [
          { index: true, element: <DishesPage /> },
          { path: ":dishId", element: <DishDetailsPage /> },
        ],
      },
      { path: "/store", element: <ProductsPage /> },
      { path: "/menu-hints", element: <MenuHintsPage /> },
      { path: "/orders", element: <OrdersPage /> },
      { path: "/logs", element: <LogsPage /> },
      { path: "/admin-panel", element: <AdminPanelPage /> },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <LoginPage /> },
      {
        path: "/register",
        element: <Navigate to="/register/employee" replace />,
      },
      { path: "/register/employee", element: <RegisterPage /> },
      { path: "/register/restaurant", element: <RestaurantRegisterPage /> },
    ],
  },
  { path: "*", element: <Error404 /> },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
