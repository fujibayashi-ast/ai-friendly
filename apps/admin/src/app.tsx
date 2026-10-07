import { Navigate, Route, Routes } from "react-router";
import { AdminProvider } from "./admin/admin-provider";
import { I18nProvider } from "./i18n/i18n-provider";
import { Layout } from "./layout/layout";
import { OrderPage } from "./pages/order/order-page";
import { OrdersPage } from "./pages/orders/orders-page";
import { ProductsPage } from "./pages/products/products-page";

export function App() {
  return (
    <I18nProvider>
      <AdminProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Navigate to="/orders" replace />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/:id" element={<OrderPage />} />
            <Route path="products" element={<ProductsPage />} />
          </Route>
        </Routes>
      </AdminProvider>
    </I18nProvider>
  );
}
