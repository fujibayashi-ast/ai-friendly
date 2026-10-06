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
import { Controller, useFormContext } from "react-hook-form";
import { formatList } from "../../i18n/format";
import { isMessageKey } from "../../i18n/messages";
import { useI18n } from "../../i18n/use-i18n";
import { availableTimes, times } from "../../reservation/availability";
import { isDate } from "../../reservation/dates";
import { useReservation } from "../../reservation/reservation-context";
import {
  missingFields,
  partySizes,
  type ReservationField,
  type ReservationValues,
  seats,
} from "../../reservation/reservation-form";
import { FormField } from "./form-field";

export function ReservationFormView() {
  const { language, t } = useI18n();
  const { today, values, submitting, showWeek, submit } = useReservation();
  const { control, register, formState } = useFormContext<ReservationValues>();
  const id = useId();
  const errorOf = (field: ReservationField) => {
    const key = `error.${field}.${formState.errors[field]?.message}`;
    return isMessageKey(key) ? t(key) : undefined;
  };
  const open = isDate(values.date) ? availableTimes(values.date) : times;
  const missing = missingFields(values, today).map((field) =>
    t(`form.${field}`),
  );

  const handleDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    showWeek(event.target.value);
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
      <form noValidate onSubmit={handleSubmit}>
        <fieldset disabled={submitting} className="grid gap-5 sm:grid-cols-2">
          <FormField
            id={`${id}-date`}
            label={t("form.date")}
            error={errorOf("date")}
          >
            <Input
              id={`${id}-date`}
              type="date"
              min={today}
              aria-invalid={!!errorOf("date")}
              {...register("date", { onChange: handleDateChange })}
            />
          </FormField>
          <FormField
            id={`${id}-time`}
            label={t("form.time")}
            error={errorOf("time")}
          >
            <Controller
              control={control}
              name="time"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id={`${id}-time`}
                    className="w-full"
                    aria-invalid={!!errorOf("time")}
                    onBlur={field.onBlur}
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
                        {open.includes(time)
                          ? time
                          : t("form.time.full", { time })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
          <FormField
            id={`${id}-party`}
            label={t("form.partySize")}
            error={errorOf("partySize")}
          >
            <Controller
              control={control}
              name="partySize"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id={`${id}-party`}
                    className="w-full"
                    aria-invalid={!!errorOf("partySize")}
                    onBlur={field.onBlur}
                  >
                    <SelectValue
                      placeholder={t("form.partySize.placeholder")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {partySizes.map((count) => (
                      <SelectItem key={count} value={String(count)}>
                        {t("form.partySize.option", { count })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
          <FormField
            id={`${id}-seat`}
            label={t("form.seat")}
            hint={t("form.seat.hint")}
            error={errorOf("seat")}
          >
            <Controller
              control={control}
              name="seat"
              render={({ field }) => (
                <ToggleGroup
                  id={`${id}-seat`}
                  type="single"
                  variant="outline"
                  value={field.value}
                  aria-invalid={!!errorOf("seat")}
                  onValueChange={field.onChange}
                  className="w-full"
                >
                  {seats.map((seat) => (
                    <ToggleGroupItem key={seat} value={seat} className="flex-1">
                      {t(`seat.${seat}`)}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              )}
            />
          </FormField>
          <FormField
            id={`${id}-coupon`}
            label={t("form.couponCode")}
            hint={t("form.couponCode.hint")}
            error={errorOf("couponCode")}
          >
            <Input
              id={`${id}-coupon`}
              autoComplete="off"
              aria-invalid={!!errorOf("couponCode")}
              {...register("couponCode")}
            />
          </FormField>
          <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row sm:items-center sm:gap-4">
            <Button type="submit" className="w-full sm:w-auto">
              {submitting ? t("form.submitting") : t("form.submit")}
            </Button>
            {missing.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {t("form.missing", { fields: formatList(language, missing) })}
              </p>
            )}
          </div>
        </fieldset>
      </form>
    </section>
  );
}
