import { Button } from "@ai-friendly/ui";

/** Gemini Nano のモデルのダウンロード・使えないことの表示（見た目だけ） */
export function GeminiNanoSetup({
  status,
  progress,
  failed,
  onDownload,
  texts,
}: {
  status: "checking" | "unavailable" | "downloadable" | "downloading";
  /** 0〜1 */
  progress: number;
  failed: boolean;
  onDownload: () => void;
  texts: {
    description: string;
    download: string;
    downloadNote: string;
    downloading: string;
    downloadFailed: string;
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
      {status === "downloading" ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm" aria-live="polite">
            {texts.downloading} {percent}%
          </p>
          <div
            role="progressbar"
            aria-label={texts.downloading}
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
        <Button className="self-start" onClick={onDownload}>
          {texts.download}
        </Button>
      )}
      {failed && (
        <p role="alert" className="text-sm text-destructive">
          {texts.downloadFailed}
        </p>
      )}
      <p className="text-xs text-muted-foreground">{texts.downloadNote}</p>
    </div>
  );
}
