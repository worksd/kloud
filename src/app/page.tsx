import Logo from "../../public/assets/logo_black.svg"
import { Metadata, Viewport } from 'next'
import { LessonsHome } from "@/app/lessons/LessonsHome";

export const metadata: Metadata = {
  title: 'Rawgraphy - 댄스 스튜디오 예약 플랫폼',
  description: '댄스 스튜디오 예약을 손쉽게, Rawgraphy와 함께하세요',
  keywords: ['댄스', '스튜디오', '예약', '댄스 스튜디오', 'Rawgraphy'],
  openGraph: {
    title: 'Rawgraphy - 댄스 스튜디오 예약 플랫폼',
    description: '댄스 스튜디오 예약을 손쉽게, Rawgraphy와 함께하세요',
    type: 'website',
    locale: 'ko_KR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rawgraphy - 댄스 스튜디오 예약 플랫폼',
    description: '댄스 스튜디오 예약을 손쉽게, Rawgraphy와 함께하세요',
  },
  robots: 'index, follow',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
}
export default async function Main({searchParams}: {
  searchParams: Promise<{ appVersion?: string }>
}) {
  const { appVersion = '' } = await searchParams;
  const isWeb = appVersion === '';

  return (
    <>
    {/* PC 웹(lg+) 홈 — 예약 가능 수업 격자를 루트에서 바로 그린다 (구 /lessons, 리다이렉트 훕 없이) */}
    {isWeb && (
      <div className="hidden lg:block">
        <LessonsHome/>
      </div>
    )}

    {/* welcome — PC 웹에서는 lg:hidden으로 paint 단계에서 가려진다 (모바일 웹/앱 전용) */}
    <main className={`h-screen overflow-hidden bg-white flex items-center justify-center select-none ${isWeb ? 'lg:hidden' : ''}`}>
      <div className="w-full max-w-5xl mx-auto px-4">
        {/* Logo and Welcome */}
        <div className="flex flex-col items-center justify-center">
          <div className="mb-8">
            <Logo />
          </div>
          <div className="text-black text-[20px] font-paperlogy mb-16">
            댄스 스튜디오 예약을 손쉽게
          </div>

          {/* App Store Buttons */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <a href="https://apps.apple.com/app/id6740252635"
               target="_blank"
               rel="noopener noreferrer"
               className="w-full md:w-auto">
              <button className="w-full md:w-auto bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-2xl transition-all flex items-center justify-center gap-2">
                <span className="text-lg">App Store</span>
              </button>
            </a>
            <a href="https://play.google.com/store/apps/details?id=com.rawgraphy.blanc"
               target="_blank"
               rel="noopener noreferrer"
               className="w-full md:w-auto">
              <button className="w-full md:w-auto bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-2xl transition-all flex items-center justify-center gap-2">
                <span className="text-lg">Play Store</span>
              </button>
            </a>
          </div>
        </div>
      </div>
    </main>
    </>
  );
}
