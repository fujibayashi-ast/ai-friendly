import { I18nProvider } from "./i18n/i18n-provider";
import { Layout } from "./layout/layout";
import { HomePage } from "./pages/home/home-page";
import { TasksProvider } from "./tasks/tasks-provider";

export function App() {
  return (
    <I18nProvider>
      <TasksProvider>
        <Layout>
          <HomePage />
        </Layout>
      </TasksProvider>
    </I18nProvider>
  );
}
