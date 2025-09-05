'use client';

import React, { useEffect, useMemo, useState } from 'react';
import CheckIcon from '../../../../../public/assets/check_white.svg';
import { createDialog, DialogInfo } from '@/utils/dialog.factory';
import { KloudScreen } from '@/shared/kloud.screen';

type ServerConfig = {
  type: 'production' | 'test' | 'custom';
  label: string;
  url: string;
};

const BASE_CONFIGS: ServerConfig[] = [
  {
    type: 'production',
    label: 'Production 서버',
    url: 'https://rawgraphy.com',
  },
  {
    type: 'test',
    label: 'Test 서버',
    url: 'https://staging.rawgraphy.com',
  },
];

// 개발환경에서만 노출할 커스텀 서버 항목
const CUSTOM_CONFIG: ServerConfig = {
  type: 'custom',
  label: 'localhost / 사내망 서버',
  url: '',
};

const isDev = process.env.NODE_ENV !== 'production';

export const DeveloperForm = () => {
  // 환경에 따른 기본 선택값
  const defaultSelected = useMemo<ServerConfig>(() => {
    // 기존 로직 유지: NEXT_PUBLIC_IOS_PORTONE_PG == 'nice'면 test, 아니면 prod
    const base =
      process.env.NEXT_PUBLIC_IOS_PORTONE_PG === 'nice'
        ? BASE_CONFIGS[1]
        : BASE_CONFIGS[0];

    // 개발환경이면 커스텀을 기본 선택 (직접 입력 유도)
    return isDev ? CUSTOM_CONFIG : base;
  }, []);

  const SERVER_CONFIGS: ServerConfig[] = useMemo(
    () => (isDev ? [...BASE_CONFIGS, CUSTOM_CONFIG] : BASE_CONFIGS),
    [],
  );

  const [selectedServer, setSelectedServer] = useState<ServerConfig>(defaultSelected);
  const [customUrl, setCustomUrl] = useState<string>(''); // 개발 기본 예시
  const [error, setError] = useState<string>('');

  // 선택 항목 렌더
  const ServerItem = ({ config }: { config: ServerConfig }) => {
    const isSelected = selectedServer.type === config.type;

    return (
      <div
        className={`flex justify-between items-center px-4 py-4 cursor-pointer border transition-all duration-150 rounded-lg
          ${isSelected
          ? 'bg-black text-white border-gray-700'
          : 'bg-gray-100 text-black border-gray-300 active:scale-[0.98] active:bg-gray-200'
        }`}
        onClick={() => setSelectedServer(config)}
      >
        <div className="text-lg font-medium">{config.label}</div>
        {isSelected && <CheckIcon className="scale-125" />}
      </div>
    );
  };

  // 간단한 URL 검증
  const validateUrl = (url: string) => {
    try {
      const u = new URL(url);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const resolveFinalUrl = (): string => {
    if (selectedServer.type === 'custom') {
      return 'http://' + customUrl.trim() + ':3000';
    }
    return selectedServer.url;
  };

  const handleRestart = async () => {
    const urlToApply = resolveFinalUrl();

    if (selectedServer.type === 'custom') {
      if (!urlToApply) {
        setError('URL을 입력해 주세요.');
        return;
      }
      if (!validateUrl(urlToApply)) {
        setError('유효한 http(s) URL을 입력해 주세요. 예) http://192.168.0.11:3000');
        return;
      }
      setError('');
    }

    const dialog = await createDialog({
      id: 'ChangeEndpoint',
      message: `${selectedServer.label}로 테스트 환경을 바꾸시겠습니까?\n(${urlToApply})`,
    });
    window.KloudEvent.showDialog(JSON.stringify(dialog));
  };

  useEffect(() => {
    window.onDialogConfirm = async (data: DialogInfo) => {
      if (data.id === 'ChangeEndpoint') {
        const urlToApply = resolveFinalUrl();
        window.KloudEvent.changeWebEndpoint(urlToApply);
        window.KloudEvent.push(KloudScreen.Splash);
      }
    };
  }, [selectedServer, customUrl]);

  return (
    <div className="flex flex-col justify-between min-h-[100dvh]">
      {/* 서버 선택 영역 */}
      <div className="flex-1 p-4">
        <div className="flex flex-col gap-3">
          {SERVER_CONFIGS.map((config) => (
            <ServerItem key={config.type} config={config} />
          ))}

          {/* 개발환경 + 커스텀 선택 시 입력창 노출 */}
          {isDev && selectedServer.type === 'custom' && (
            <input
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              inputMode="url"
              placeholder="192.168.0.11"
              className={`w-full h-12 rounded-lg px-4 border outline-none
    bg-white text-black
    ${error ? 'border-red-500' : 'border-gray-300'}
    focus:border-black`}
            />
          )}
        </div>
      </div>

      {/* 다시 시작하기 버튼 영역 */}
      <div className="sticky bottom-0 left-0 right-0 px-6 pb-5 bg-white">
        <button
          onClick={handleRestart}
          className="flex items-center justify-center font-bold rounded-lg h-14 w-full text-[16px] bg-black text-white active:scale-[0.98] transition"
        >
          다시 시작하기
        </button>
      </div>
    </div>
  );
};
