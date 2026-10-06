import { Ai } from "./ai/ai";
import { ConfirmProvider } from "./confirm/confirm-provider";
import { Layout } from "./layout/layout";
import { HomePage } from "./pages/home/home-page";
import { SettingsProvider } from "./settings/settings-provider";

export function App() {
  return (
    <SettingsProvider>
      <ConfirmProvider>
        <Layout>
          <HomePage />
        </Layout>
        <Ai />
      </ConfirmProvider>
    </SettingsProvider>
  );
}
