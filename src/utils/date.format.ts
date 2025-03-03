import { StringResource } from "@/shared/StringResource";

export function formatDateTime(input: string, locale: keyof typeof StringResource ): { time: string; date: string, dayOfWeek: (keyof (typeof StringResource)["ko"]) } {
  try {
    const daysOfWeek: (keyof (typeof StringResource)["ko"])[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

    const [datePart, timePart] = input.split(" ");
    const [year, month, day] = datePart.split(".").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);

    const dateObj = new Date(year, month - 1, day, hour, minute);

    const hours = dateObj.getHours();
    const time = `${hours}:${minute.toString().padStart(2, "0")}`;

    const dayOfWeek = daysOfWeek[dateObj.getDay()];
    const date = `${year}.${month.toString().padStart(2, "0")}.${day.toString().padStart(2, "0")}`;

    return {time, date, dayOfWeek};
  } catch (e) {
    return {
      time: '',
      date: '',
      dayOfWeek: 'unknown'
    }
  }
}
