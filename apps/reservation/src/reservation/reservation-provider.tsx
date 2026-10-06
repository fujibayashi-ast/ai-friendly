import { type ReactNode, useCallback, useMemo, useState } from "react";
import { localToday } from "./dates";
import {
  completeSubmit,
  initialReservationState,
  type ReservationForm,
  showRequiredErrors,
  showWeek,
  startSubmit,
  updateForm,
  validate,
} from "./reservation";
import { sendReservation } from "./reservation-api";
import {
  type CompletedReservation,
  ReservationContext,
} from "./reservation-context";

/** 予約フォームとカレンダーを持つ。保存はしない（再読み込みで最初に戻る） */
export function ReservationProvider({ children }: { children: ReactNode }) {
  const [today] = useState(() => localToday());
  const [state, setState] = useState(() => initialReservationState(today));
  const [completed, setCompleted] = useState<CompletedReservation | null>(null);

  const actions = useMemo(
    () => ({
      updateForm: (patch: Partial<ReservationForm>) => {
        setCompleted(null);
        setState((s) => updateForm(s, patch));
      },
      showWeek: (date: string) => setState((s) => showWeek(s, date)),
    }),
    [],
  );

  const { form, submitting } = state;
  const submit = useCallback(async () => {
    if (submitting) return;
    if (validate(form, today).length > 0) {
      setState(showRequiredErrors);
      return;
    }
    setState(startSubmit);
    const result = await sendReservation(form);
    setState(completeSubmit);
    setCompleted({ number: result.number, form });
  }, [form, submitting, today]);

  const value = useMemo(
    () => ({ state, today, completed, ...actions, submit }),
    [state, today, completed, actions, submit],
  );
  return <ReservationContext value={value}>{children}</ReservationContext>;
}
