import { ApiError } from "../admin/admin-api";
import { useI18n } from "../i18n/use-i18n";

/** 操作が API に断られたときの理由を出す */
export function ApiErrorMessage({ error }: { error: Error | null }) {
  const { t } = useI18n();
  if (!error) return null;
  return (
    <p role="alert" className="text-sm text-destructive">
      {error instanceof ApiError
        ? t(`error.${error.error.code}`)
        : t("error.unknown")}
    </p>
  );
}
