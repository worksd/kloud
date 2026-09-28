// 관리자 탭 목 데이터 — 매출/수강생/설정 화면이 API 연동 전까지 쓴다. 연동 시 이 파일만 지우면 된다.

export type MockSalesDay = { date: string; amount: number; count: number };
export type MockSalesItem = { name: string; amount: number; count: number };

export const MOCK_SALES = {
  month: '2026.09',
  total: 8_420_000,
  prevTotal: 7_150_000,
  paymentCount: 63,
  refundTotal: 210_000,
  newStudentCount: 11,
  byDay: [
    { date: '09.22', amount: 640_000, count: 5 },
    { date: '09.23', amount: 1_180_000, count: 9 },
    { date: '09.24', amount: 320_000, count: 3 },
    { date: '09.25', amount: 940_000, count: 7 },
    { date: '09.26', amount: 1_520_000, count: 11 },
    { date: '09.27', amount: 480_000, count: 4 },
    { date: '09.28', amount: 760_000, count: 6 },
  ] as MockSalesDay[],
  byItem: [
    { name: '화·목 8회 정규반', amount: 3_200_000, count: 16 },
    { name: '월 4회 패스권', amount: 2_400_000, count: 24 },
    { name: '1회 수강권', amount: 1_620_000, count: 18 },
    { name: '연습실 대관', amount: 1_200_000, count: 5 },
  ] as MockSalesItem[],
};

export type MockStudent = {
  id: number;
  name: string;
  phoneTail: string;
  className: string;
  /** 남은 회차 — null이면 무제한 */
  remaining: number | null;
  endDate: string;
  status: 'Active' | 'Expiring' | 'Unpaid';
};

export const MOCK_STUDENTS: MockStudent[] = [
  { id: 1, name: '김민수', phoneTail: '1234', className: '화·목 8회 정규반', remaining: 6, endDate: '2026.10.21', status: 'Active' },
  { id: 2, name: '이서연', phoneTail: '5678', className: '월 4회 패스권', remaining: 1, endDate: '2026.09.30', status: 'Expiring' },
  { id: 3, name: '박지훈', phoneTail: '9012', className: '화 4회 정규반', remaining: null, endDate: '2026.12.31', status: 'Active' },
  { id: 4, name: '최유진', phoneTail: '3456', className: '화·목 8회 정규반', remaining: 3, endDate: '2026.10.05', status: 'Unpaid' },
  { id: 5, name: '정하늘', phoneTail: '7890', className: '1회 수강권', remaining: 2, endDate: '2026.11.12', status: 'Active' },
];

export const MOCK_STUDENT_SUMMARY = { total: 128, active: 96, expiring: 7, unpaid: 3 };
