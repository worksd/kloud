export function errorConverter({code}: {code: string}) {
  if (code == 'PAYMENT_ALREADY_PAID') {
    return {
      title: '결제 실패',
      message: '이미 결제가 완료된 요청입니다'
    }
  }
  return {
    title: '',
    message: '',
  }
}