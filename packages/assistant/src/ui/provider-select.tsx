import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ai-friendly/ui";

/** 使う LLM の切り替え。候補が 1 つのときは出さない */
export function ProviderSelect({
  labels,
  selected,
  onSelect,
  label,
}: {
  labels: readonly string[];
  selected: number;
  onSelect: (index: number) => void;
  /** 読み上げ用の名前 */
  label: string;
}) {
  if (labels.length < 2) return null;

  const handleValueChange = (value: string) => {
    onSelect(Number(value));
  };

  return (
    <Select value={String(selected)} onValueChange={handleValueChange}>
      <SelectTrigger
        size="sm"
        aria-label={label}
        className="border-none font-medium shadow-none hover:bg-accent dark:bg-transparent"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper" side="top" align="start">
        {labels.map((name, index) => (
          <SelectItem key={name} value={String(index)}>
            {name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
