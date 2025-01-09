import KakaoLogo from "../../../public/assets/logo_kakao.svg";

const KakaoLoginButton = () => {

  const kakaoLogin = () => {
    // TODO: 카카오 로그인
  };
  return (
    <button className="relative flex items-center justify-center bg-[#FEE500] text-black text-lg font-semibold rounded-lg h-14 shadow-lg w-full"
    onClick={() => kakaoLogin()}>
      <span className="absolute left-4">
        <KakaoLogo/>
      </span>
      <span className="flex-1 text-center text-[16px]">
        카카오로 시작하기
      </span>
    </button>
  );
};

export default KakaoLoginButton