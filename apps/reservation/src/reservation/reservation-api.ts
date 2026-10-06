import type { ReservationForm } from "./reservation";

let lastNumber = 1000;

/** ダミーの予約 API。通信せず、少し待って予約番号を返す */
export async function sendReservation(
  _form: ReservationForm,
): Promise<{ number: string }> {
  await new Promise((resolve) => setTimeout(resolve, 800));
  lastNumber += 1;
  return { number: String(lastNumber) };
}
