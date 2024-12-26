import AppleLogo from "../../../public/assets/logo_apple.svg"

const AppleLoginButton = () => {
  return (
    <button className="flex items-center justify-center bg-black text-white text-lg font-semibold rounded-lg h-12 shadow-lg w-full">
      <span className="mr-2">
        <AppleLogo />
      </span>
      Continue with Apple
    </button>
  );
};

export default AppleLoginButton