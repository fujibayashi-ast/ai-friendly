import { Button } from "@ai-friendly/ui";

/** 話しかけ方の例。押すとそのまま送る */
export function Suggestions({
  items,
  onSelect,
}: {
  items: readonly string[];
  onSelect: (text: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((text) => (
        <Button
          key={text}
          variant="outline"
          size="sm"
          className="rounded-full font-normal"
          onClick={() => onSelect(text)}
        >
          {text}
        </Button>
      ))}
    </div>
  );
}
