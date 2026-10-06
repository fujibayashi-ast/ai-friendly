import { ToggleGroup, ToggleGroupItem } from "@ai-friendly/ui";
import { useEffect, useState } from "react";
import { samples } from "../samples";
import {
  type Language,
  languageNames,
  languages,
  type MessageKey,
  messages,
} from "./i18n/messages";
import { SampleCard } from "./sample-card";

export function App() {
  const [language, setLanguage] = useState<Language>("ja");
  const t = (key: MessageKey) => messages[language][key];

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-2 px-4 sm:px-6">
          <span className="flex items-center gap-2.5 font-semibold whitespace-nowrap">
            <span
              aria-hidden
              className="size-5 shrink-0 rounded-[5px] bg-primary"
            />
            {t("siteName")}
          </span>
          <ToggleGroup
            type="single"
            size="sm"
            spacing={1}
            aria-label={t("language.label")}
            value={language}
            onValueChange={(value) => {
              const next = languages.find((v) => v === value);
              if (next) setLanguage(next);
            }}
          >
            {languages.map((item) => (
              <ToggleGroupItem
                key={item}
                value={item}
                lang={item}
                aria-label={languageNames[item].name}
                className="px-2.5 text-xs"
              >
                {languageNames[item].short}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <section aria-labelledby="samples">
          <h1 id="samples" className="text-2xl font-bold tracking-tight">
            {t("samples")}
          </h1>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {samples.map((sample) => (
              <li key={sample.id}>
                <SampleCard
                  href={`/${sample.id}/`}
                  title={t(`sample.${sample.id}.title`)}
                  description={t(`sample.${sample.id}.description`)}
                  example={t(`sample.${sample.id}.example`)}
                  call={sample.example}
                />
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
