'use client'
import Image from "next/image";
import { CommonSubmitButton } from "@/app/components/buttons";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import React from "react";
import { GetUserResponse } from "@/app/endpoint/user.endpoint";
import { updateUserAction } from "@/app/onboarding/update.user.action";
import { UserStatus } from "@/entities/user/user.status";
import { getBottomMenuList } from "@/utils/bottom.menu.fetch.action";
import { kloudNav } from "@/app/lib/kloudNav";

export const LoginDeactivateScreen = ({user}: {user: GetUserResponse}) => {
  const handleActivate = async () => {
    const res = await updateUserAction({})
    if (res.success && res.user?.status == UserStatus.Ready) {
      const bootInfo = JSON.stringify({
        bottomMenuList: await getBottomMenuList(),
        route: '',
        withFcmToken: true,
      });
      kloudNav.navigateMain(bootInfo)
    }
  }
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 메인 컨텐츠 */}
      <div className="flex-1 p-6 text-black">
        <h1 className="text-2xl font-bold mt-14 mb-8">
          {user?.name}님, 다시보니 반가워요!<br/>
          잘..지내셨나요?
        </h1>

        {/* 프로필 카드 */}
        <div className="bg-[#F7F8F9] rounded-lg p-6">
          {/* 프로필 정보 */}
          <div className="flex items-center space-x-4 mb-5">
            <div className="w-[50px] h-[50px] rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={user?.profileImageUrl ?? ''}
                alt={user?.name ?? ''}
                width={50}
                height={50}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="font-bold text-[20px]">{user?.name}</div>
              <div className="text-[#86898C] font-medium text-[14px]">{user?.email}</div>
            </div>
          </div>

          <div className="w-full">
            <div className="h-[1px] relative bg-[#EAEAEA]"/>
          </div>

          {/* 탈퇴 일시 */}
          <div className="flex flex-row space-x-4 mt-5">
            <div className="text-[#86898C] font-bold mb-1">탈퇴일시</div>
            <div className="font-medium">{user?.deactivatedAt}</div>
          </div>

          {/* 안내 텍스트 */}
          <p className="text-[12px] font-medium text-[#C8CDD1]">
            * 탈퇴 후 한 달까지 모든 데이터 복구가 가능해요.
          </p>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className={"flex flex-col mx-6 mb-4 items-center"}>
        <CommonSubmitButton originProps={{onClick: handleActivate}}>
          계속 이용하기
        </CommonSubmitButton>
        <NavigateClickWrapper method={'back'}>
          <div className={"text-[#86898C] mt-4 font-medium text-[14px]"}>
            새로 가입할래요
          </div>
        </NavigateClickWrapper>
      </div>
    </div>
  )
}