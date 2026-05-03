'use client';

import React, { useEffect, useState } from 'react';
import { KioskOperatorQRScanner } from '@/app/kiosk/KioskOperatorQRScanner';
import { KioskOperatorEmailLogin } from '@/app/kiosk/KioskOperatorEmailLogin';
import { KioskSelector } from '@/app/kiosk/KioskSelector';
import { KioskForm } from '@/app/kiosk/KioskForm';
import { KioskResponse } from '@/app/endpoint/kiosk.endpoint';
import {
  clearKioskOperatorTokenAction,
  getKiosksAction,
  getKioskOperatorTokenAction,
  saveKioskOperatorTokenAction,
  saveSelectedKioskIdAction,
} from '@/app/kiosk/kiosk.actions';
import { getMeAction } from '@/app/kiosk/get.me.action';
import { handleKioskTokenExpired } from '@/app/kiosk/kiosk.error';
import { sendKioskTokenToNative } from '@/app/kiosk/kiosk.native';

type Stage = 'scan' | 'loading' | 'selector' | 'ready' | 'error';

type Props = {
  hasInitialToken: boolean;
  initialKioskId?: number;
  urlToken?: string;
};

export const KioskBootstrap = ({ hasInitialToken, initialKioskId, urlToken }: Props) => {
  const [stage, setStage] = useState<Stage>(hasInitialToken || urlToken ? 'loading' : 'scan');
  const [kiosks, setKiosks] = useState<KioskResponse[]>([]);
  const [selected, setSelected] = useState<KioskResponse | null>(null);
  const [studio, setStudio] = useState<{ id: number; name: string; profileImageUrl?: string; kioskImageUrl?: string; receiptFooter?: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [emailOpen, setEmailOpen] = useState(false);

  // /me + /kiosks 병렬 호출 → me.studio로 스튜디오 정보, kiosks로 선택
  const loadKiosks = async (preselectedId?: number) => {
    const [meRes, kiosksRes] = await Promise.all([getMeAction(), getKiosksAction()]);

    if (await handleKioskTokenExpired(meRes)) return;
    if (await handleKioskTokenExpired(kiosksRes)) return;

    if (!('id' in meRes) || !meRes.studio?.id) {
      setErrorMessage((meRes as { message?: string }).message ?? '인증에 실패했습니다. 다시 로그인해주세요.');
      await clearKioskOperatorTokenAction();
      setStage('scan');
      return;
    }
    setStudio({
      id: meRes.studio.id,
      name: meRes.studio.name ?? '',
      profileImageUrl: meRes.studio.profileImageUrl,
      kioskImageUrl: (meRes.studio as { kioskImageUrl?: string }).kioskImageUrl,
      receiptFooter: (meRes.studio as { receiptFooter?: string }).receiptFooter,
    });

    if (!('kiosks' in kiosksRes)) {
      setErrorMessage((kiosksRes as { message?: string }).message ?? '키오스크 목록을 불러오지 못했습니다.');
      await clearKioskOperatorTokenAction();
      setStage('scan');
      return;
    }
    setKiosks(kiosksRes.kiosks);
    if (kiosksRes.kiosks.length === 0) {
      setErrorMessage('연결된 키오스크가 없습니다. 백오피스에서 키오스크를 등록해주세요.');
      setStage('error');
      return;
    }
    const pre = preselectedId ? kiosksRes.kiosks.find(k => k.id === preselectedId) : null;
    if (pre) {
      setSelected(pre);
      setStage('ready');
      return;
    }
    if (kiosksRes.kiosks.length === 1) {
      setSelected(kiosksRes.kiosks[0]);
      await saveSelectedKioskIdAction(kiosksRes.kiosks[0].id);
      setStage('ready');
      return;
    }
    setStage('selector');
  };

  // 초기 마운트 시:
  //  - URL에 ?token= 으로 들어왔으면 그 토큰을 쿠키 + 네이티브에 저장한 뒤 부트스트랩 (로그인 절차 스킵)
  //  - 또는 이미 쿠키에 토큰이 있으면 그대로 부트스트랩
  useEffect(() => {
    const init = async () => {
      if (urlToken) {
        await saveKioskOperatorTokenAction(urlToken);
        sendKioskTokenToNative(urlToken);
        // URL에 토큰이 그대로 노출되지 않도록 청소
        if (typeof window !== 'undefined') {
          window.history.replaceState({}, '', '/kiosk');
        }
        await loadKiosks(initialKioskId);
        return;
      }
      if (hasInitialToken) {
        await loadKiosks(initialKioskId);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScanned = async (scannedToken: string) => {
    setErrorMessage(null);
    setStage('loading');
    await saveKioskOperatorTokenAction(scannedToken);
    sendKioskTokenToNative(scannedToken);
    await loadKiosks();
  };

  // 이메일 로그인 성공 — 토큰은 emailLoginAction이 쿠키에 저장. 페이지 리로드 전 네이티브에도 전달
  const handleEmailLoggedIn = async () => {
    setEmailOpen(false);
    setErrorMessage(null);
    setStage('loading');
    const token = await getKioskOperatorTokenAction();
    if (token) sendKioskTokenToNative(token);
    window.location.reload();
  };

  const handleSelectKiosk = async (k: KioskResponse) => {
    if (k.status !== 'Active') return;
    await saveSelectedKioskIdAction(k.id);
    setSelected(k);
    setStage('ready');
  };

  if (stage === 'scan') {
    return (
      <>
        <KioskOperatorQRScanner onScanned={handleScanned} />

        {/* 이메일 로그인 진입 버튼 */}
        <button
          onClick={() => setEmailOpen(true)}
          className="fixed left-1/2 -translate-x-1/2 px-5 py-3 rounded-full bg-[#F2F4F6] border border-[#E6E8EA] active:scale-[0.97] transition-transform"
          style={{ bottom: 'min(8vh, 80px)' }}
        >
          <span className="text-[#1E2124] font-medium" style={{ fontSize: 'min(1.6vh, 16px)' }}>이메일로 로그인</span>
        </button>

        {emailOpen && (
          <KioskOperatorEmailLogin onLoggedIn={handleEmailLoggedIn} onCancel={() => setEmailOpen(false)} />
        )}

        {errorMessage && (
          <div className="fixed bottom-[20px] left-1/2 -translate-x-1/2 px-5 py-3 rounded-2xl bg-black/80 text-white text-[14px]">
            {errorMessage}
          </div>
        )}
      </>
    );
  }

  if (stage === 'loading') {
    return (
      <div className="bg-white w-full h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-black/20 border-t-black rounded-full animate-spin"/>
      </div>
    );
  }

  if (stage === 'selector') {
    return <KioskSelector kiosks={kiosks} onSelect={handleSelectKiosk} />;
  }

  if (stage === 'error') {
    return (
      <div className="bg-white w-full h-screen flex flex-col items-center justify-center px-[5%]">
        <p className="text-black font-bold text-center" style={{ fontSize: 'min(2.4vh,26px)' }}>
          {errorMessage}
        </p>
        <button
          onClick={() => { clearKioskOperatorTokenAction(); setStage('scan'); }}
          className="mt-[24px] px-6 h-[48px] rounded-[14px] bg-[#1E2124] flex items-center justify-center active:scale-[0.97] transition-transform"
        >
          <span className="text-white font-bold text-[16px]">다시 로그인</span>
        </button>
      </div>
    );
  }

  // ready — me.studio + 선택된 kiosk 정보로 KioskForm 렌더
  return (
    <KioskForm
      studioId={studio?.id ?? 0}
      studioName={studio?.name ?? ''}
      studioProfileImageUrl={studio?.profileImageUrl}
      studioReceiptFooter={studio?.receiptFooter}
      kioskId={selected?.id ?? 0}
      kioskImageUrl={selected?.imageUrl ?? studio?.kioskImageUrl}
      passPlans={[]}
    />
  );
};
