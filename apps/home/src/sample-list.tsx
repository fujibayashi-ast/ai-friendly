import { samples } from "../samples";
import type { MessageKey } from "./i18n/messages";
import { SampleCard } from "./sample-card";

type Group = (typeof samples)[number]["group"];

/** 区分（本編・おまけ）ごとのカードの一覧 */
export function SampleList({
  group,
  t,
}: {
  group: Group;
  t: (key: MessageKey) => string;
}) {
  return (
    <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {samples
        .filter((sample) => sample.group === group)
        .map((sample) => (
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
  );
}
