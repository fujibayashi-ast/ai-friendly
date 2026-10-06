import { Button, Textarea } from "@ai-friendly/ui";
import { ArrowUp } from "lucide-react";
import { type KeyboardEvent, type ReactNode, type Ref, useState } from "react";

/** 入力欄と送信ボタン。Enter で送信、Shift+Enter で改行。左下に `start`（LLM の切り替えなど）を置ける */
export function Composer({
  placeholder,
  sendLabel,
  disabled,
  onSubmit,
  inputRef,
  start,
}: {
  placeholder: string;
  sendLabel: string;
  disabled: boolean;
  onSubmit: (text: string) => void;
  inputRef?: Ref<HTMLTextAreaElement>;
  start?: ReactNode;
}) {
  const [draft, setDraft] = useState("");

  const submit = () => {
    if (disabled || !draft.trim()) return;
    onSubmit(draft);
    setDraft("");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // 日本語の変換を確定する Enter では送らない
    if (
      event.key !== "Enter" ||
      event.shiftKey ||
      event.nativeEvent.isComposing
    )
      return;
    event.preventDefault();
    submit();
  };

  return (
    <form
      className="flex flex-col gap-2 border-t p-3"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <Textarea
        ref={inputRef}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        aria-label={placeholder}
        rows={1}
        className="max-h-32 min-h-10 resize-none"
      />
      <div className="flex items-center justify-between gap-2">
        <div>{start}</div>
        <Button
          type="submit"
          size="icon"
          aria-label={sendLabel}
          disabled={disabled || !draft.trim()}
          className="size-8 shrink-0"
        >
          <ArrowUp aria-hidden />
        </Button>
      </div>
    </form>
  );
}
