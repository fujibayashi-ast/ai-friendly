import type { ReactNode } from "react";

/** ラベル・入力・エラーの 1 項目分 */
export function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
