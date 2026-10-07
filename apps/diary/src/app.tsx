import { Route, Routes } from "react-router";
import { Ai } from "./ai/ai";
import { DiaryProvider } from "./diary/diary-provider";
import { I18nProvider } from "./i18n/i18n-provider";
import { Layout } from "./layout/layout";
import { EntriesPage } from "./pages/entries/entries-page";
import { NewEntryPage } from "./pages/new-entry/new-entry-page";

export function App() {
  return (
    <I18nProvider>
      <DiaryProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<EntriesPage />} />
            <Route path="new" element={<NewEntryPage />} />
          </Route>
        </Routes>
        <Ai />
      </DiaryProvider>
    </I18nProvider>
  );
}
