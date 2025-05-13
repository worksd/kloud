import Image from "next/image";
import { TranslatableText } from "@/utils/TranslatableText";

export const ProfileEditForm = ({isOnboarding, nickName, profileImageUrl, inputErrorMessage, onNickNameChanged}: {
  isOnboarding: boolean,
  nickName: string,
  profileImageUrl: string,
  inputErrorMessage: string | null,
  onNickNameChanged: (nickName: string) => void
}) => {
  return (
    <div className={'px-6 py-4'}>
      {/* 헤더 영역 */}
      {isOnboarding &&
        <div className={'mb-4'}>
          <h1 className="text-2xl font-bold mb-2 text-black">
            <TranslatableText titleResource={'change_profile_message'}/>
          </h1>
          <div className="text-gray-600">
            <TranslatableText titleResource={'change_profile_description'}/>
          </div>
        </div>
      }

      {/* 컨텐츠 영역 */}
      <div className="flex flex-row space-x-4">
        {/* 프로필 이미지 업로드 */}
        <div className="flex justify-center mb-2">
          <div className="relative w-20 h-20 rounded-full bg-gray-100 overflow-hidden cursor-pointer">
            {profileImageUrl !== '' &&
              <Image
                src={profileImageUrl ?? ''}
                alt='프로필 사진'
                fill
                className="object-cover"
              />
            }
          </div>
        </div>

        {/* 닉네임 입력 */}
        <div className="flex flex-col w-full">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <TranslatableText titleResource={'nick_name'}/>
          </label>
          <input
            value={nickName}
            onChange={(e) => onNickNameChanged(e.target.value)}
            maxLength={10}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black text-black"
          />
          <div className="flex flex-row justify-between mt-1">
            <div className="pl-1 text-red-600 text-[13px] min-h-[20px]">
              {inputErrorMessage || ''} {/* 빈 문자열로 공간 유지 */}
            </div>
            <div className="text-right text-sm text-gray-500">
              {nickName.length}/10
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}