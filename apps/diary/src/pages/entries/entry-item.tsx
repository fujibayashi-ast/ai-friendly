import type { Entry } from "../../diary/diary";

export function EntryItem({ entry }: { entry: Entry }) {
  return (
    <li className="flex flex-col gap-1 py-4">
      <h2 className="font-semibold">{entry.title}</h2>
      <p className="line-clamp-2 text-sm leading-relaxed">{entry.body}</p>
    </li>
  );
}
