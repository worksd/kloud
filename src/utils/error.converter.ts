export function errorConverter({code}: {code: string}) {
  if (code == 'PAYMENT_ALREADY_PAID') {
    return {
      title: '결제 실패',
      message: '이미 결제가 완료된 요청입니다'
    }
  }
  return {
    title: '결제에 실패했습니다', // TODO: 도메인 묻은거 발라내기
    message: '다시 시도해주세요',
  }
}