import { KloudScreen } from "@/shared/kloud.screen";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { QrCode } from "lucide-react";

export function QRScanButtonForLesson({ lessonId }: { lessonId: number }) {
  return (
    <div className="fixed bottom-24 right-4 z-10">
      <NavigateClickWrapper method={'push'} route={KloudScreen.QRScanWithLesson(lessonId)}>
        <div
          className="flex items-center justify-center w-14 h-14 rounded-full bg-black text-white shadow-lg active:scale-95 transition-all duration-150">
          <QrCode size={24} />
        </div>
      </NavigateClickWrapper>
    </div>
  );
}
