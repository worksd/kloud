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

    if (!input) return 'input 데이터가 없습니다';

    const [datePart] = input.split(" ");
    const [year, month, day] = datePart.split(".").map(Number);
    const targetDate = new Date(year, month - 1, day);

    const diffInMs = targetDate.getTime() - today.getTime();
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

    return diffInDays > 0 ? `D-${diffInDays}` : diffInDays === 0 ? "D-Day" : undefined;
};

export function getBottomMenuList() {
    return [
        {
            label: "홈",
            labelSize: 16,
            labelColor: "#FF5733",
            iconUrl: "https://picsum.photos/250/250",
            iconSize: 24,
            page: {
                route: "/home",
                initialColor: "#FFFFFF"
            },
        },
        {
            label: "검색",
            labelSize: 12,
            labelColor: "#3357FF",
            iconUrl: "https://picsum.photos/250/250",
            iconSize: 18,
            page: {
                route: "/search",
                initialColor: "#FFFFFF"
            },
        },
        {
            label: "알림",
            labelSize: 14,
            labelColor: "#33FF57",
            iconUrl: "https://picsum.photos/250/250",
            iconSize: 20,
            page: {
                route: "/notifications",
                initialColor: "#FFFFFF"
            },
        },
        {
            label: "마이페이지",
            labelSize: 14,
            labelColor: "#33FF57",
            iconUrl: "https://picsum.photos/250/250",
            iconSize: 20,
            page: {
                route: "/setting",
                initialColor: "#FFFFFF"
            },
        },
    ];
}