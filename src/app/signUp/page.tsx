import { SignupForm } from "@/app/signUp/signup.form";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";

export default async function EmailSignUpPage({searchParams}: { searchParams: Promise<{ returnUrl: string, appVersion: string }> }) {
  const {returnUrl, appVersion} = await searchParams
  return (
    <div className={"flex flex-col"}>
      <div className="flex justify-between items-center mb-14">
        <SimpleHeader titleResource={'sign_up'}/>
      </div>
      <SignupForm returnUrl={returnUrl} appVersion={appVersion} />
    </div>
  );

}

