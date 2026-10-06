import { Button, Textarea } from "@ai-friendly/ui";
import { ArrowUp } from "lucide-react";
import { type KeyboardEvent, type Ref, useState } from "react";

/** 入力欄と送信ボタン。Enter で送信、Shift+Enter で改行 */
export function Composer({
  placeholder,
  sendLabel,
  disabled,
  onSubmit,
  inputRef,
}: {
  placeholder: string;
  sendLabel: string;
  disabled: boolean;
  onSubmit: (text: string) => void;
  inputRef?: Ref<HTMLTextAreaElement>;
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
      className="flex items-end gap-2 border-t p-3"
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
      <Button
        type="submit"
        size="icon"
        aria-label={sendLabel}
        disabled={disabled || !draft.trim()}
        className="size-10 shrink-0"
      >
        <ArrowUp aria-hidden />
      </Button>
    </form>
  );
}
