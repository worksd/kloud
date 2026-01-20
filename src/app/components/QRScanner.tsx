'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";

type CameraInfo = {
  id: string;
  label: string;
};

interface QRScannerProps {
  onSuccess: (decodedText: string) => void;
  onError: (errorMessage: string) => void;
  onBack?: () => void;
}

export default function QRScanner({ onSuccess, onError, onBack }: QRScannerProps) {
  const qrCodeRegionId = "qr-reader";
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);
  const [devices, setDevices] = useState<CameraInfo[]>([]);
  const [currentCameraIdx, setCurrentCameraIdx] = useState<number | null>(null);
  const [flip, setFlip] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startScanner = useCallback(
    async (force?: boolean) => {
      if (currentCameraIdx == null || (!force && scanning) || typeof window === "undefined") return;
      if (html5QrCodeRef.current?.getState() === Html5QrcodeScannerState.SCANNING) return;

      try {
        const qrCode = new Html5Qrcode(qrCodeRegionId);
        html5QrCodeRef.current = qrCode;

        await qrCode.start(
          devices[currentCameraIdx].id,
          {
            fps: 10,
            qrbox: () => {
              const region = document.getElementById(qrCodeRegionId);
              if (!region) return { width: 250, height: 250 };

              const width = region.offsetWidth;
              const height = region.offsetHeight;

              const boxSize = Math.max(Math.floor(Math.min(width, height) * 0.8), 200);
              return { width: boxSize, height: boxSize };
            },
          },
          onSuccess,
          onError
        );

        setScanning(true);
        setError(null);
      } catch (err) {
        html5QrCodeRef.current = null;
        setError(`카메라를 시작할 수 없습니다: ${err}`);
        console.error("Failed to start scanning", err);
      }
    },
    [currentCameraIdx, scanning, devices, onSuccess, onError]
  );

  const stopScanner = useCallback(async () => {
    const scanner = html5QrCodeRef.current;
    if (scanner == null) return;

    html5QrCodeRef.current = null;
    try {
      const state = scanner.getState();
      if (state !== Html5QrcodeScannerState.SCANNING && state !== Html5QrcodeScannerState.PAUSED) return;

      await scanner.stop();
      scanner.clear();

      setScanning(false);
    } catch (err) {
      console.error("Failed to stop scanning", err);
    }
  }, []);

  const isTransitioning = useRef(false);
  const isTransitioningToggle = useRef(false);
  const reStart = useCallback(async () => {
    if (isTransitioning.current) return;
    isTransitioning.current = true;
    await stopScanner();
    await startScanner(true);

    setTimeout(() => {
      isTransitioning.current = false;
      isTransitioningToggle.current = false;
    }, 500);
  }, [startScanner, stopScanner]);

  const requestNativeCameraPermission = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).KloudEvent?.requestCameraPermission) {
        (window as any).onCameraPermissionResult = (data: { granted: boolean }) => {
          resolve(data.granted);
        };
        (window as any).KloudEvent.requestCameraPermission();
      } else {
        // 네이티브 앱이 아닌 경우 (웹 브라우저) 바로 진행
        resolve(true);
      }
    });
  };

  const tryGetMedia = async () => {
    // 네이티브 앱에 카메라 권한 요청
    const granted = await requestNativeCameraPermission();
    if (!granted) {
      setError("카메라 권한이 거부되었습니다. 설정에서 카메라 권한을 허용해주세요.");
      return;
    }

    // 권한 획득 후 카메라 접근
    if (!navigator.mediaDevices) {
      setError(`navigator.mediaDevices가 없습니다. HTTPS 또는 WebView 설정을 확인해주세요.`);
      return;
    }
    if (!navigator.mediaDevices.getUserMedia) {
      setError(`getUserMedia가 지원되지 않습니다.`);
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const deviceInfos = await navigator.mediaDevices.enumerateDevices();
    const videoInputs = deviceInfos.filter((d) => d.kind === "videoinput");

    if (videoInputs.length === 0) {
      setError("카메라를 찾을 수 없습니다.");
      return;
    }

    setDevices(
      videoInputs.map((device) => ({
        id: device.deviceId,
        label: device.label || `Camera ${device.deviceId}`,
      }))
    );

    stream.getTracks().forEach((track) => track.stop());
  };

  useLayoutEffect(() => {
    tryGetMedia().catch((error) => {
      setError(`카메라 권한을 획득할 수 없습니다: ${error}`);
    });

    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleResize = () => {
      reStart();
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, [reStart]);

  const toggleCamera = useCallback(async () => {
    if (currentCameraIdx == null || isTransitioningToggle.current) return;

    isTransitioningToggle.current = true;
    await stopScanner();
    setCurrentCameraIdx((prev) => {
      const next = (prev ?? 0) + 1;
      return next > devices.length - 1 ? 0 : next;
    });
  }, [currentCameraIdx, devices.length, stopScanner]);

  const toggleHorizontal = useCallback(() => {
    setFlip((prev) => !prev);
  }, []);

  const isFrontCamera = useCallback((cameraLabel: string) => {
    const label = cameraLabel.toLowerCase();
    return label.includes("front") || label.includes("user") || label.includes("전면");
  }, []);

  const getNextCameraLabel = useCallback(() => {
    if (currentCameraIdx == null || devices.length === 0) return "카메라 전환";

    const currentLabel = devices[currentCameraIdx].label;
    const isCurrentFront = isFrontCamera(currentLabel);

    return isCurrentFront ? "후면으로 전환" : "전면으로 전환";
  }, [currentCameraIdx, devices, isFrontCamera]);

  useLayoutEffect(() => {
    if (scanning || html5QrCodeRef.current != null || typeof window === "undefined") return;
    reStart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCameraIdx, scanning]);

  useLayoutEffect(() => {
    if (currentCameraIdx == null && devices.length > 0) {
      setCurrentCameraIdx(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [devices]);

  return (
    <div className="qr-scanner-container">
      {/* 카메라 영역 */}
      <div className="qr-reader-bg" />
      <div id={qrCodeRegionId} className={`qr-reader ${flip ? 'qr-reader-flip' : ''}`} />

      {/* 헤더 */}
      <div className="qr-header">
        {onBack && (
          <button onClick={onBack} className="qr-back-button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <span className="qr-header-title">QR 출석</span>
      </div>

      {/* 스캔 프레임 오버레이 */}
      {scanning && (
        <div className="qr-scan-overlay">
          <div className="qr-scan-frame">
            <div className="qr-scan-corner qr-top-left" />
            <div className="qr-scan-corner qr-top-right" />
            <div className="qr-scan-corner qr-bottom-left" />
            <div className="qr-scan-corner qr-bottom-right" />
            <div className="qr-scan-line" />
          </div>
          <p className="qr-scan-text">QR 코드를 프레임 안에 맞춰주세요</p>
        </div>
      )}

      {/* 로딩 화면 */}
      {!scanning && !error && (
        <div className="qr-loading-layer">
          <div className="qr-loading-spinner" />
          <span className="qr-loading-text">카메라 로드 중...</span>
        </div>
      )}

      {/* 에러 화면 */}
      {error && (
        <div className="qr-loading-layer">
          <span className="qr-error-text">{error}</span>
        </div>
      )}

      {/* 하단 버튼 */}
      <div className="qr-bottom-buttons">
        {devices.length > 1 && (
          <button onClick={toggleCamera} className="qr-action-button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 19H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5" />
              <path d="M13 5h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5" />
              <circle cx="12" cy="12" r="3" />
              <path d="m18 22-3-3 3-3" />
              <path d="m6 2 3 3-3 3" />
            </svg>
            <span>{getNextCameraLabel()}</span>
          </button>
        )}
        <button onClick={toggleHorizontal} className="qr-action-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h3" />
            <path d="M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3" />
            <path d="M12 20v2" />
            <path d="M12 14v2" />
            <path d="M12 8v2" />
            <path d="M12 2v2" />
          </svg>
          <span>좌우 반전</span>
        </button>
      </div>
    </div>
  );
}
