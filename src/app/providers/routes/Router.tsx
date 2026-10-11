import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { Error404 } from "@/pages/errors/Error404";
import { LoginPage } from "@/pages/login";
import { RegisterPage, RestaurantRegisterPage } from "@/pages/register";
import { DashboardPage } from "@/pages/dashboard";
import {
  SupplyPage,
  CreateSupplyPage,
  SupplyDetailsPage,
  SuppliesRoutesLayout,
} from "@/pages/supply";
import {
  DishesPage,
  DishDetailsPage,
  DishesRoutesLayout,
} from "@/pages/dishes";
import {
  ProductsPage,
  StoreRoutesLayout,
  InventoryRoutesLayout,
  InventoryCheckPage,
  InventoryConfirmationPage,
  InventoryReportPage,
} from "@/pages/store";
import { MenuHintsPage } from "@/pages/menu-hints";
import {
  OrdersPage,
  CreateOrderPage,
  OrdersRoutesLayout,
} from "@/pages/orders";
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
      {
        path: "/supply",
        element: <SuppliesRoutesLayout />,
        children: [
          { index: true, element: <SupplyPage /> },
          { path: "new", element: <CreateSupplyPage /> },
          { path: ":supplyId", element: <SupplyDetailsPage /> },
        ],
      },
      {
        path: "/dishes",
        element: <DishesRoutesLayout />,
        children: [
          { index: true, element: <DishesPage /> },
          { path: ":dishId", element: <DishDetailsPage /> },
        ],
      },
      {
        path: "/store",
        element: <StoreRoutesLayout />,
        children: [
          { index: true, element: <ProductsPage /> },
          {
            path: "inventory",
            element: <InventoryRoutesLayout />,
            children: [
              { index: true, element: <InventoryCheckPage /> },
              { path: "confirm", element: <InventoryConfirmationPage /> },
              { path: "report", element: <InventoryReportPage /> },
            ],
          },
        ],
      },
      { path: "/menu-hints", element: <MenuHintsPage /> },
      {
        path: "/orders",
        element: <OrdersRoutesLayout />,
        children: [
          { index: true, element: <OrdersPage /> },
          { path: "new", element: <CreateOrderPage /> },
        ],
      },
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
