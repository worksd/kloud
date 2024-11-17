import AppleLoginButton from "@/app/login/apple.login.button";
import GoogleLoginButton from "@/app/login/google.login.button";

const LoginButtonForm = () => {
  return (
    <div className="space-y-4">
      <AppleLoginButton/>
      <GoogleLoginButton/>
    </div>
  )
}

export default LoginButtonForm;