import { GuestRoutesLayout } from "@/widgets/guest-layout";
import DashboardPage from "@/pages/dashboard/ui/DashboardPage";
import { TestPanel } from "@/features/test-panel";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { Error404 } from "@/pages/errors/Error404";
import { LoginPage } from "@/pages/login";
import { RegisterPage, RestaurantRegisterPage } from "@/pages/register";
import {
  SupplyPage,
  CreateSupplyPage,
  SupplyDetailsPage,
} from "@/pages/supply";
import { DishesPage, DishDetailsPage } from "@/pages/dishes";
import {
  ProductsPage,
  InventoryCheckPage,
  InventoryConfirmationPage,
  InventoryReportPage,
} from "@/pages/store";
import { MenuHintsPage } from "@/pages/menu-hints";
import { OrdersPage, CreateOrderPage } from "@/pages/orders";
import { LogsPage } from "@/pages/logs";
import { AdminPanelPage } from "@/pages/admin-panel";
import MainLayout from "../layouts/MainLayout";
import { AuthLayout } from "@/widgets/auth-layout";
import {
  GuestMenuPage,
  GuestDishPage,
  GuestCartPage,
  GuestOrderCompletePage,
} from "@/pages/guest";

const router = createBrowserRouter([
  {
    path: "/order/new/guest/:restaurantId",
    element: <GuestRoutesLayout />,
    children: [
      { index: true, element: <GuestMenuPage /> },
      { path: "dish/:dishId", element: <GuestDishPage /> },
      { path: "cart", element: <GuestCartPage /> },
      { path: "complete", element: <GuestOrderCompletePage /> },
    ],
  },
  {
    element: <MainLayout />,
    children: [
      { path: "/", element: <Navigate to="/analytics/dashboard" replace /> },
      {
        path: "/dashboard",
        element: <Navigate to="/analytics/dashboard" replace />,
      },
      {
        path: "/analytics",
        element: <Navigate to="/analytics/dashboard" replace />,
      },
      { path: "/analytics/dashboard", element: <DashboardPage /> },
      {
        path: "/analytics/dependencies",
        element: <Navigate to="/dishes?mode=graph" replace />,
      },
      {
        path: "/supply",
        children: [
          { index: true, element: <SupplyPage /> },
          { path: "new", element: <CreateSupplyPage /> },
          { path: ":supplyId", element: <SupplyDetailsPage /> },
        ],
      },
      {
        path: "/dishes",
        children: [
          { index: true, element: <DishesPage /> },
          { path: ":dishId", element: <DishDetailsPage /> },
        ],
      },
      {
        path: "/store",
        children: [
          { index: true, element: <ProductsPage /> },
          {
            path: "inventory",
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
  { path: "/test", element: <TestPanel /> },
  { path: "*", element: <Error404 /> },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
