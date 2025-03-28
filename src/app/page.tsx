import Logo from "../../public/assets/logo_black.svg"

export default async function Main() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center">
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
  );
}