import { useState } from "react";

const STORAGE_KEY = "ai-friendly:claude-api-key";

/** Claude の API キー。タブを閉じたら消えるよう sessionStorage に持つ */
export function useApiKey() {
  const [apiKey, setApiKey] = useState(() => read());

  const update = (next: string | null) => {
    try {
      if (next) sessionStorage.setItem(STORAGE_KEY, next);
      else sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // 保存できなくても、このページを開いている間は使える
    }
    setApiKey(next);
  };

  return [apiKey, update] as const;
}

function read(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}
