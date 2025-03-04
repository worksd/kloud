import { SignupForm } from "@/app/signUp/signup.form";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import React from "react";

export default function SignUp() {
  return (
    <div className={"flex flex-col"}>
      <div className="flex justify-between items-center mb-14">
        <SimpleHeader titleResource={'sign_up'}/>
      </div>
      <SignupForm/>
    </div>
  );

}

