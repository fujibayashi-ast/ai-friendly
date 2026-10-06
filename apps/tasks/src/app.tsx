import { I18nProvider } from "./i18n/i18n-provider";
import { Layout } from "./layout/layout";
import { HomePage } from "./pages/home/home-page";

export function App() {
  return (
    <I18nProvider>
      <Layout>
        <HomePage />
      </Layout>
    </I18nProvider>
  );
}
