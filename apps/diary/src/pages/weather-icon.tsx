import type { Weather } from "../diary/diary";

const icons: Record<Weather, string> = {
  sunny: "☀️",
  cloudy: "☁️",
  rainy: "☔",
  snowy: "⛄",
};

export function WeatherIcon({ weather }: { weather: Weather }) {
  return <span aria-hidden>{icons[weather]}</span>;
}
