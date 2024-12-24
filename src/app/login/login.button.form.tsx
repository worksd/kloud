'use client';
import AppleLoginButton from "@/app/login/apple.login.button";
import GoogleLoginButton from "@/app/login/google.login.button";
import { useRouter } from "next/navigation";
import { KloudScreen } from "@/shared/kloud.screen"; // Updated import

export default function LoginButtonForm() {
  const router = useRouter();

  const handleRedirect = () => {
    window.KloudEvent.push(KloudScreen.LoginEmail)
  };

  return (
    <section className="space-y-4 flex flex-col items-center justify-center">
      <AppleLoginButton />
      <GoogleLoginButton />
      <div className="text-black cursor-pointer" onClick={handleRedirect}>
        Continue With Email
      </div>
    </section>
  );
}