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
        <SuggestionButton key={text} text={text} onSelect={onSelect} />
      ))}
    </div>
  );
}

function SuggestionButton({
  text,
  onSelect,
}: {
  text: string;
  onSelect: (text: string) => void;
}) {
  const handleClick = () => {
    onSelect(text);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="rounded-full font-normal"
      onClick={handleClick}
    >
      {text}
    </Button>
  );
}
