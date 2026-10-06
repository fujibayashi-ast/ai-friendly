import { Button } from "@ai-friendly/ui";
import { useMemo } from "react";
import { ApiKeyForm } from "../chat/api-key-form";
import type { ProviderOption } from "../chat/chat";
import { type ChatLanguage, createTranslate } from "../i18n/messages";
import { createClaudeProvider } from "./claude-provider";

/**
 * Claude API を `Chat` の `providers` の候補にする
 * キーがなければ `ApiKeyForm` を出し、あれば入力欄の左下に「キーを変更」を出す
 * キーの持ち方（保存するか）はサイトが決め、`apiKey` / `onApiKeyChange` で渡す
 *
 * @example
 * const [apiKey, setApiKey] = useState<string | null>(null);
 * const claude = useClaude({ apiKey, onApiKeyChange: setApiKey, system, language });
 * @see docs/assistant.md
 */
export function useClaude({
  apiKey,
  onApiKeyChange,
  system,
  language,
}: {
  apiKey: string | null;
  onApiKeyChange: (apiKey: string | null) => void;
  system?: string;
  language: ChatLanguage;
}): ProviderOption {
  const provider = useMemo(
    () => (apiKey ? createClaudeProvider({ apiKey, system }) : undefined),
    [apiKey, system],
  );
  const t = createTranslate(language);

  const handleChangeKey = () => {
    onApiKeyChange(null);
  };

  return {
    label: "Claude",
    provider,
    setup: <ApiKeyForm language={language} onSubmit={onApiKeyChange} />,
    actions: apiKey && (
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground"
        onClick={handleChangeKey}
      >
        {t("apiKey.change")}
      </Button>
    ),
  };
}
