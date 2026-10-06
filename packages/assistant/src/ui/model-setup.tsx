import { Button } from "@ai-friendly/ui";

/** ブラウザの中で動かす LLM の、モデルのダウンロード・読み込みと、使えないことの表示（見た目だけ） */
export function ModelSetup({
  status,
  progress,
  failed,
  onLoad,
  texts,
}: {
  status: "checking" | "unavailable" | "ready" | "loading";
  /** 0〜1 */
  progress: number;
  failed: boolean;
  onLoad: () => void;
  texts: {
    description: string;
    /** ボタン（「モデルをダウンロード」など） */
    action: string;
    note: string;
    /** 進み具合の前に出す（「ダウンロードしています…」など） */
    loading: string;
    failed: string;
    unavailable: string;
  };
}) {
  if (status === "checking") return null;
  if (status === "unavailable") {
    return <p className="p-4 text-sm">{texts.unavailable}</p>;
  }
  const percent = Math.round(progress * 100);
  return (
    <div className="flex flex-col gap-3 p-4">
      <p className="text-sm">{texts.description}</p>
      {status === "loading" ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm" aria-live="polite">
            {texts.loading} {percent}%
          </p>
          <div
            role="progressbar"
            aria-label={texts.loading}
            aria-valuenow={percent}
            className="h-2 w-full overflow-hidden rounded-full bg-muted"
          >
            <div
              className="h-full bg-primary transition-[width] motion-reduce:transition-none"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      ) : (
        <Button className="self-start" onClick={onLoad}>
          {texts.action}
        </Button>
      )}
      {failed && (
        <p role="alert" className="text-sm text-destructive">
          {texts.failed}
        </p>
      )}
      <p className="text-xs text-muted-foreground">{texts.note}</p>
    </div>
  );
}
