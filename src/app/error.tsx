'use client'

import { useEffect } from "react";
import Logo from "../../public/assets/logo_black.svg"
import { kloudNav } from "@/app/lib/kloudNav";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Discord 웹훅으로 에러 전송
    const sendError = async () => {
      try {
        const response = await fetch('/api/error-webhook', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            error: {
              name: error.name,
              message: error.message,
              stack: error.stack,
              digest: error.digest,
            },
            context: {
              pathname: window.location.pathname,
              route: window.location.pathname + window.location.search,
              userAgent: navigator.userAgent,
              timestamp: new Date().toISOString(),
              statusCode: error.digest ? parseInt(error.digest) : undefined,
              digest: error.digest,
            },
          }),
        });

        if (!response.ok) {
          console.error('Failed to send error to Discord');
        }
      } catch (e) {
        console.error('Error sending to Discord webhook', e);
      }
    };

    sendError();
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      {/* 404 아이콘 */}
      <div className="mb-8">
        <Logo/>
      </div>

      {/* 메시지 */}
      <h1 className="text-[20px] font-bold text-black mb-4">
        에러가 발생했습니다.
      </h1>

      <p className="text-[16px] text-[#86898C] text-center mb-8 max-w-md">
        요청하신 페이지를 불러올 수 없습니다.
      </p>

      {/* 홈으로 돌아가기 버튼 */}
      <div
        className="px-6 py-3 bg-black text-white rounded-lg font-semibold
          transition-transform duration-100 active:scale-[0.98]
          hover:bg-gray-800"
        onClick={() => kloudNav.back()}
      >
        뒤로가기
      </div>
    </div>
  );
}