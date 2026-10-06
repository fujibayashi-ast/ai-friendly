import { I18nProvider } from "./i18n/i18n-provider";
import { Layout } from "./layout/layout";
import { HomePage } from "./pages/home/home-page";
import { ShopProvider } from "./shop/shop-provider";

export function App() {
  return (
    <I18nProvider>
      <ShopProvider>
        <Layout>
          <HomePage />
        </Layout>
      </ShopProvider>
    </I18nProvider>
  );
}
