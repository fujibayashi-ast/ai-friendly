import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Navigate, Route, Routes } from "react-router";
import { createQueryClient } from "./admin/queries";
import { Ai } from "./ai/ai";
import { ConfirmProvider } from "./confirm/confirm-provider";
import { I18nProvider } from "./i18n/i18n-provider";
import { Layout } from "./layout/layout";
import { OrderPage } from "./pages/order/order-page";
import { OrdersPage } from "./pages/orders/orders-page";
import { ProductsPage } from "./pages/products/products-page";

export function App() {
  const [queryClient] = useState(createQueryClient);
  return (
    <I18nProvider>
      <QueryClientProvider client={queryClient}>
        <ConfirmProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Navigate to="/orders" replace />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="orders/:id" element={<OrderPage />} />
              <Route path="products" element={<ProductsPage />} />
            </Route>
          </Routes>
          <Ai />
        </ConfirmProvider>
      </QueryClientProvider>
    </I18nProvider>
  );
}
