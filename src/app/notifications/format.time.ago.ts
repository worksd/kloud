import { StringResource } from "@/shared/StringResource";

export function formatTimeAgo(dateInput: string | Date, locale: keyof typeof StringResource, now: Date = new Date()): string {
  let date: Date;

  if (typeof dateInput === 'string') {
    date = new Date(dateInput.replace(/\./g, '-')); // "2025.02.24 10:45" -> "2025-02-24 10:45"
  } else {
    date = dateInput;
  }

  const diff = now.getTime() - date.getTime(); // 밀리초 단위 차이
  const seconds = Math.floor(diff / 1000); // 초 단위 변환
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return StringResource[locale].just_now;
  if (minutes < 60) return StringResource[locale].minutes_ago.replace("{n}", String(minutes));
  if (hours < 24) return StringResource[locale].hours_ago.replace("{n}", String(hours));
  return StringResource[locale].days_ago.replace("{n}", String(days));
}
