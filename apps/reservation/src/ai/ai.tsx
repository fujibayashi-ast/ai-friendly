import {
  FloatingChat,
  useClaude,
  useGeminiNano,
  useQwen,
} from "@ai-friendly/assistant";
import { type AiTool, createAiTools } from "@ai-friendly/command";
import { registerWebMcpTools } from "@ai-friendly/command/webmcp";
import { useEffect, useMemo, useState } from "react";
import {
  describeError,
  useReservationCommands,
} from "../commands/reservation-commands";
import { useConfirm } from "../confirm/use-confirm";
import { useI18n } from "../i18n/use-i18n";
import { availableTimes, dayStatus } from "../reservation/availability";
import { weekDates, weekdayOf } from "../reservation/dates";
import { useReservation } from "../reservation/reservation-context";
import { formErrors } from "../reservation/reservation-form";

declare global {
  interface Window {
    /** 開発中だけ: WebMCP がないブラウザでも、同じツールを devtools から呼べるようにする */
    __aiTools?: AiTool[];
  }
}

/** サイトの関数を Command として AI（チャット・WebMCP）から呼べるようにする */
export function Ai() {
  const { today, values, weekOf } = useReservation();
  const { language, t } = useI18n();
  const commands = useReservationCommands();
  const confirm = useConfirm();

  // 状態が変わるたびにツールを作り直す（get_state が今の入力・カレンダーを返すように）
  const tools = useMemo(
    () =>
      createAiTools({
        commands,
        // 文言は Command の定義が持つ。文言のない確認は出さずに拒否する
        confirm: (_, confirmation) =>
          confirmation ? confirm(confirmation) : false,
        // 空き状況は、カレンダーに出ている週だけ（画面に見えている分）
        getState: () => ({
          today: { date: today, weekday: weekdayOf(today) },
          form: {
            date: values.date,
            time: values.time,
            party_size: values.partySize ? Number(values.partySize) : null,
            seat: values.seat || null,
            coupon_code: values.couponCode,
          },
          errors: formErrors(values, today, { required: false }).map((error) =>
            describeError(error, values, today),
          ),
          calendar: weekDates(weekOf).map((date) => ({
            date,
            weekday: weekdayOf(date),
            status: date < today ? "past" : dayStatus(date),
            available_times: date < today ? [] : availableTimes(date),
          })),
        }),
      }),
    [commands, confirm, today, values, weekOf],
  );

  useEffect(() => {
    const controller = new AbortController();
    void registerWebMcpTools(tools, { signal: controller.signal });
    if (import.meta.env.DEV) window.__aiTools = tools;
    return () => {
      controller.abort();
      if (window.__aiTools === tools) delete window.__aiTools;
    };
  }, [tools]);

  const system = useMemo(() => systemPrompt(today), [today]);

  // 再読み込みで消える。保存はしない
  const [apiKey, setApiKey] = useState<string | null>(null);
  const claude = useClaude({
    apiKey,
    onApiKeyChange: setApiKey,
    system,
    language,
  });
  const geminiNano = useGeminiNano({ system, language });
  const qwen = useQwen({ system, language });
  const qwen9b = useQwen({ system, language, model: "9B" });

  return (
    <FloatingChat
      providers={[qwen, qwen9b, geminiNano, claude]}
      tools={tools}
      language={language}
      debug={import.meta.env.DEV}
      suggestions={[
        t("chat.suggest.fill"),
        t("chat.suggest.week"),
        t("chat.suggest.coupon"),
      ]}
    />
  );
}

// 小さいモデルは get_state を読まずに日付を作りがちなので、今日はプロンプトにも書く
const systemPrompt = (today: string) =>
  `Today is ${today} (${weekdayOf(today)}). ` +
  "You help the user book a table at this restaurant by filling in the reservation form with the tools. The form and the calendar are in get_state. Fill in what you know right away with fill_reservation_form. If the date, time, party size or seat is missing, ask the user for one of them at a time. If a tool returns an error, fix the input or ask the user. Submit only when every field is filled and the user wants to book. To see other weeks, call show_availability and then get_state. If the user asks about anything other than reservations at this restaurant, say briefly that you can only help with this website. Reply briefly in the same language as the user.";
