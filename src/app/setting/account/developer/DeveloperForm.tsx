'use client'
import React, { useEffect, useState } from "react";
import CheckIcon from "../../../../../public/assets/check_white.svg";
import { createDialog } from "@/utils/dialog.factory";
import { DialogInfo } from "@/app/setting/setting.menu.item";
import { KloudScreen } from "@/shared/kloud.screen";

type ServerConfig = {
  type: 'production' | 'test';
  label: string;
  url: string;
}

const SERVER_CONFIGS: ServerConfig[] = [
  {
    type: 'production',
    label: 'Production 서버',
    url: 'https://kloud-alpha.vercel.app'
  },
  {
    type: 'test',
    label: 'Test 서버',
    url: 'https://kloud-git-develop-rawgraphy-inc.vercel.app'
  }
];

export const DeveloperForm = () => {
  const [selectedServer, setSelectedServer] = useState<ServerConfig>(process.env.NEXT_PUBLIC_ENV == 'development' ? SERVER_CONFIGS[1] : SERVER_CONFIGS[0]);

  const ServerItem = ({config}: { config: ServerConfig }) => {
    const isSelected = selectedServer.type === config.type;

    return (
      <div
        className={`flex justify-between items-center px-4 py-4 cursor-pointer border transition-all duration-150 rounded-lg
          ${isSelected
          ? "bg-black text-white border-gray-700"
          : "bg-gray-100 text-black border-gray-300 active:scale-[0.98] active:bg-gray-200"
        }`}
        onClick={() => setSelectedServer(config)}
      >
        <div className="text-lg font-medium">{config.label}</div>
        {isSelected && <CheckIcon className="scale-125"/>}
      </div>
    );
  };

  const handleRestart = async () => {
    const dialog = await createDialog('ChangeEndpoint', `${selectedServer.label}로 테스트 환경을 바꾸시겠습니까?`)
    window.KloudEvent.showDialog(JSON.stringify(dialog))
  }

  useEffect(() => {
    window.onDialogConfirm = async (data: DialogInfo) => {
      if (data.id == 'ChangeEndpoint') {
        window.KloudEvent.changeWebEndpoint(selectedServer.url)
        window.KloudEvent.push(KloudScreen.Splash)
      }
    }
  }, [selectedServer])

  return (
    <div className="flex flex-col justify-between">
      {/* 서버 선택 영역 */}
      <div className="flex-1 p-4">
        <div className="flex flex-col gap-3">
          {SERVER_CONFIGS.map((config) => (
            <ServerItem key={config.type} config={config}/>
          ))}
        </div>
      </div>

      {/* 다시 시작하기 버튼 영역 */}
      <div className="fixed bottom-0 left-0 right-0 px-6 pb-5 bg-white">
        <button
          onClick={handleRestart}
          className={`flex items-center justify-center font-bold rounded-lg h-14 w-full text-[16px] bg-black text-white`}>
          다시 시작하기
        </button>
      </div>
    </div>
  );
}