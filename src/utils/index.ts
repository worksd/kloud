import { translate } from "@/utils/translate";

export const extractNumber = (input: string): number => {
    const numericString = input.replace(/\D/g, "");
    return parseInt(numericString, 10);
};

/**
 * D day를 계산해서 문자열로 반환합니다.
 * @param input "2024.11.28 16:10"의 형태여야 함
 * @returns
 */
export const calculateDDays = (input: string): string | undefined => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!input) return '';

    const [datePart] = input.split(" ");
    const [year, month, day] = datePart.split(".").map(Number);
    const targetDate = new Date(year, month - 1, day);

    const diffInMs = targetDate.getTime() - today.getTime();
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

    return diffInDays > 0 ? `D-${diffInDays}` : diffInDays === 0 ? "D-Day" : undefined;
};

/**
 * D day를 계산해서 문자열로 반환합니다.
 * @param input "2024.11.28"의 형태여야 함
 * @returns
 */
export const calculateDdaysWithDay = (input: string): string => {
    if (!input) return '';

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // '.' 또는 '-'로 분리
    const [year, month, day] = input.split(/[-.]/).map(Number);

    // 유효한 날짜인지 확인
    if (!year || !month || !day || isNaN(year) || isNaN(month) || isNaN(day)) {
        return '';
    }

    const targetDate = new Date(year, month - 1, day);
    targetDate.setHours(0, 0, 0, 0);

    // 유효한 날짜인지 한번 더 확인
    if (isNaN(targetDate.getTime())) {
        return '';
    }

    const diffInMs = targetDate.getTime() - today.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    return diffInDays > 0 ? `D-${diffInDays}` : diffInDays === 0 ? "D-Day" : `D+${Math.abs(diffInDays)}`;
};
