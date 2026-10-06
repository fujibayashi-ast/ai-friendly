import type { Confirmation } from "@ai-friendly/command";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@ai-friendly/ui";
import { type ReactNode, useCallback, useRef, useState } from "react";
import { useI18n } from "../i18n/use-i18n";
import { type Confirm, ConfirmContext } from "./use-confirm";

type Request = {
  confirmation: Confirmation;
  resolve(approved: boolean): void;
};

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const pending = useRef<Request | null>(null);
  // 閉じるアニメーションの間も文言を出しておくため、開閉とは別に持つ
  const [request, setRequest] = useState<Request | null>(null);
  const [open, setOpen] = useState(false);

  const confirm = useCallback<Confirm>(
    (confirmation) =>
      new Promise((resolve) => {
        pending.current?.resolve(false);
        const next = { confirmation, resolve };
        pending.current = next;
        setRequest(next);
        setOpen(true);
      }),
    [],
  );

  const answer = (approved: boolean) => {
    pending.current?.resolve(approved);
    pending.current = null;
    setOpen(false);
  };

  return (
    <ConfirmContext value={confirm}>
      {children}
      <AlertDialog
        open={open}
        onOpenChange={(next) => {
          if (!next) answer(false);
        }}
      >
        {request && (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{request.confirmation.title}</AlertDialogTitle>
              <AlertDialogDescription>
                {request.confirmation.description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => answer(false)}>
                {t("confirm.cancel")}
              </AlertDialogCancel>
              <AlertDialogAction onClick={() => answer(true)}>
                {request.confirmation.confirmLabel}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        )}
      </AlertDialog>
    </ConfirmContext>
  );
}
