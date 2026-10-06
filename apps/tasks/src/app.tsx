import { Ai } from "./ai/ai";
import { ConfirmProvider } from "./confirm/confirm-provider";
import { I18nProvider } from "./i18n/i18n-provider";
import { Layout } from "./layout/layout";
import { HomePage } from "./pages/home/home-page";
import { TasksProvider } from "./tasks/tasks-provider";

export function App() {
  return (
    <I18nProvider>
      <TasksProvider>
        <ConfirmProvider>
          <Layout>
            <HomePage />
          </Layout>
          <Ai />
        </ConfirmProvider>
      </TasksProvider>
    </I18nProvider>
  );
}
