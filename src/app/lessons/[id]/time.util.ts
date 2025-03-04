export function isPastTime(dateString: string | undefined) {
  if (!dateString) return true;

  // 날짜 형식을 통일
  const formattedString = dateString.replace(/\./g, '-').replace(' ', 'T') + ':00';
  const inputTime = new Date(formattedString);
  const now = new Date();

  if (isNaN(inputTime.getTime())) {
    return true;
  }

  return inputTime < now;
}