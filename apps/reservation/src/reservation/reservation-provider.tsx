import { zodResolver } from "@hookform/resolvers/zod";
import { type ReactNode, useCallback, useMemo, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { isDate, localToday, weekStart } from "./dates";
import { sendReservation } from "./reservation-api";
import {
  type CompletedReservation,
  ReservationContext,
} from "./reservation-context";
import {
  emptyValues,
  type FormError,
  type FormResult,
  type ReservationValues,
  reservationFields,
  reservationSchema,
} from "./reservation-form";

/** 予約フォーム（React Hook Form）とカレンダーを持つ。保存はしない */
export function ReservationProvider({ children }: { children: ReactNode }) {
  const [today] = useState(() => localToday());
  const [weekOf, setWeekOf] = useState(() => weekStart(today));
  const [completed, setCompleted] = useState<CompletedReservation | null>(null);
  const form = useForm<ReservationValues>({
    defaultValues: emptyValues,
    resolver: zodResolver(reservationSchema(today)),
    // 値が入った欄はその場で、空の欄は「予約する」を押したときにエラーを出す
    mode: "onChange",
  });
  const { control, formState, handleSubmit, reset, setValue } = form;
  const [date, time, partySize, seat, couponCode] = useWatch({
    control,
    name: reservationFields,
  });
  const values = useMemo(
    () => ({ date, time, partySize, seat, couponCode }),
    [date, time, partySize, seat, couponCode],
  );
  const submitting = formState.isSubmitting;

  const showWeek = useCallback((date: string) => {
    if (isDate(date)) setWeekOf(weekStart(date));
  }, []);

  const fill = useCallback(
    (patch: Partial<ReservationValues>) => {
      if (submitting) return;
      for (const field of reservationFields) {
        const value = patch[field];
        if (value === undefined) continue;
        setValue(field, value, { shouldValidate: true, shouldDirty: true });
      }
      if (patch.date) showWeek(patch.date);
    },
    [submitting, setValue, showWeek],
  );

  const submit = useCallback(async (): Promise<FormResult> => {
    if (submitting) return { ok: false, reason: "submitting" };
    let result: FormResult = { ok: true };
    await handleSubmit(
      async (submitted) => {
        const response = await sendReservation(submitted);
        setCompleted({ number: response.number, values: submitted });
        reset(emptyValues);
      },
      (fieldErrors) => {
        const errors: FormError[] = reservationFields.flatMap((field) => {
          const code = fieldErrors[field]?.message;
          return code ? [{ field, code }] : [];
        });
        result = { ok: false, reason: "invalid", errors };
      },
    )();
    return result;
  }, [submitting, handleSubmit, reset]);

  // 受け付けの表示は、次に入力を変えるまで出す（reset の後は isDirty が false）
  const shown = formState.isDirty ? null : completed;
  const value = useMemo(
    () => ({
      today,
      weekOf,
      values,
      submitting,
      completed: shown,
      fill,
      showWeek,
      submit,
    }),
    [today, weekOf, values, submitting, shown, fill, showWeek, submit],
  );
  return (
    <FormProvider {...form}>
      <ReservationContext value={value}>{children}</ReservationContext>
    </FormProvider>
  );
}
