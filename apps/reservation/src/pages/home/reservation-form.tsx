import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  ToggleGroup,
  ToggleGroupItem,
} from "@ai-friendly/ui";
import { type ChangeEvent, type FormEvent, useId } from "react";
import { useI18n } from "../../i18n/use-i18n";
import { availableTimes, times } from "../../reservation/availability";
import { isDate } from "../../reservation/dates";
import {
  type FormField as Field,
  type FormError,
  partySizes,
  seats,
  validate,
} from "../../reservation/reservation";
import { useReservation } from "../../reservation/reservation-context";
import { FormField } from "./form-field";

// 項目ごとのエラーの組み合わせだけを、文言のキーにする
type ErrorKey<E> = E extends {
  field: infer F extends string;
  code: infer C extends string;
}
  ? `error.${F}.${C}`
  : never;
const errorKey = <E extends FormError>(error: E) =>
  `error.${error.field}.${error.code}` as ErrorKey<E>;

export function ReservationFormView() {
  const { t } = useI18n();
  const { state, today, updateForm, submit } = useReservation();
  const { form, submitting } = state;
  const id = useId();
  const errors = validate(form, today, state.showRequired);
  const errorOf = (field: Field) => {
    const error = errors.find((item) => item.field === field);
    return error && t(errorKey(error));
  };
  const open = isDate(form.date) ? availableTimes(form.date) : times;

  const handleDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateForm({ date: event.target.value });
  };

  const handleTimeChange = (value: string) => {
    updateForm({ time: value });
  };

  const handlePartySizeChange = (value: string) => {
    updateForm({ partySize: Number(value) });
  };

  const handleSeatChange = (value: string) => {
    const seat = seats.find((item) => item === value);
    if (seat) updateForm({ seat });
  };

  const handleCouponChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateForm({ couponCode: event.target.value });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submit();
  };

  return (
    <section aria-labelledby={`${id}-title`} className="flex flex-col gap-4">
      <h2 id={`${id}-title`} className="text-lg font-semibold">
        {t("form.title")}
      </h2>
      <form
        noValidate
        onSubmit={handleSubmit}
        className="grid gap-5 sm:grid-cols-2"
      >
        <FormField
          id={`${id}-date`}
          label={t("form.date")}
          error={errorOf("date")}
        >
          <Input
            id={`${id}-date`}
            type="date"
            min={today}
            value={form.date}
            disabled={submitting}
            aria-invalid={!!errorOf("date")}
            onChange={handleDateChange}
          />
        </FormField>
        <FormField
          id={`${id}-time`}
          label={t("form.time")}
          error={errorOf("time")}
        >
          <Select
            value={form.time}
            disabled={submitting}
            onValueChange={handleTimeChange}
          >
            <SelectTrigger
              id={`${id}-time`}
              className="w-full"
              aria-invalid={!!errorOf("time")}
            >
              <SelectValue placeholder={t("form.time.placeholder")} />
            </SelectTrigger>
            <SelectContent>
              {times.map((time) => (
                <SelectItem
                  key={time}
                  value={time}
                  disabled={!open.includes(time)}
                >
                  {open.includes(time) ? time : t("form.time.full", { time })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField
          id={`${id}-party`}
          label={t("form.partySize")}
          error={errorOf("partySize")}
        >
          <Select
            value={form.partySize === null ? "" : String(form.partySize)}
            disabled={submitting}
            onValueChange={handlePartySizeChange}
          >
            <SelectTrigger
              id={`${id}-party`}
              className="w-full"
              aria-invalid={!!errorOf("partySize")}
            >
              <SelectValue placeholder={t("form.partySize.placeholder")} />
            </SelectTrigger>
            <SelectContent>
              {partySizes.map((count) => (
                <SelectItem key={count} value={String(count)}>
                  {t("form.partySize.option", { count })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField
          id={`${id}-seat`}
          label={t("form.seat")}
          hint={t("form.seat.hint")}
          error={errorOf("seat")}
        >
          <ToggleGroup
            id={`${id}-seat`}
            type="single"
            variant="outline"
            value={form.seat ?? ""}
            disabled={submitting}
            aria-invalid={!!errorOf("seat")}
            onValueChange={handleSeatChange}
            className="w-full"
          >
            {seats.map((seat) => (
              <ToggleGroupItem key={seat} value={seat} className="flex-1">
                {t(`seat.${seat}`)}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </FormField>
        <FormField
          id={`${id}-coupon`}
          label={t("form.couponCode")}
          hint={t("form.couponCode.hint")}
          error={errorOf("couponCode")}
        >
          <Input
            id={`${id}-coupon`}
            value={form.couponCode}
            disabled={submitting}
            autoComplete="off"
            aria-invalid={!!errorOf("couponCode")}
            onChange={handleCouponChange}
          />
        </FormField>
        <div className="flex items-end sm:col-span-2">
          <Button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto"
          >
            {submitting ? t("form.submitting") : t("form.submit")}
          </Button>
        </div>
      </form>
    </section>
  );
}
