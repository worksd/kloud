import GoogleLogo from "../../../public/assets/logo_google.svg";

const GoogleLoginButton = () => {
  return (
    <button className="flex items-center justify-center bg-white text-black text-lg font-semibold rounded-lg h-12 shadow-lg w-full">
      <span className="mr-2">
        <GoogleLogo/>
      </span>
      Continue with Google
    </button>
  );
};

export default GoogleLoginButton