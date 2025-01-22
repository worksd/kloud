export function formatDateTime(input: string): { time: string; date: string } {
  try {
    const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];

    const [datePart, timePart] = input.split(" ");
    const [year, month, day] = datePart.split(".").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);

    const dateObj = new Date(year, month - 1, day, hour, minute);

    const hours = dateObj.getHours();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHour = hours % 12 || 12;
    const time = `${ampm} ${formattedHour}:${minute.toString().padStart(2, "0")}`;

    const dayOfWeek = daysOfWeek[dateObj.getDay()];
    const date = `${year}.${month.toString().padStart(2, "0")}.${day.toString().padStart(2, "0")} (${dayOfWeek})`;

    return {time, date};
  } catch (e) {
    return {
      time: '',
      date: ''
    }
  }
}
