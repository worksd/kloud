import React from "react";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import SignOutForm from "@/app/profile/setting/signOut/SignOutForm";

export default async function SignOut({
                                               searchParams
                                             }: {
  searchParams: Promise<{ os: string }>
}) {
  return (
    <div className="flex flex-col w-screen min-h-screen bg-white mx-auto">
      <div className="flex justify-between items-center mb-14">
        <SimpleHeader titleResource="sign_out"/>
      </div>
      <SignOutForm/>
    </div>
  )
}