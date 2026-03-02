'use client';

import { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeScannerState, Html5QrcodeSupportedFormats } from "html5-qrcode";

type CameraInfo = {
  id: string;
  label: string;
};

export type QRScannerHandle = {
  toggleCamera: () => void;
  toggleFlip: () => void;
  hasMultipleCameras: boolean;
};

interface QRScannerProps {
  onSuccess: (decodedText: string) => void;
  onError: (errorMessage: string) => void;
  onBack?: () => void;
  isProcessing?: boolean;
  resultState?: 'idle' | 'success' | 'error';
  resultMessage?: string;
  lessonId?: string | null;
  lessonTitle?: string | null;
  lessonFetchStatus?: string;
  currentUrl?: string;
}

const QRScanner = forwardRef<QRScannerHandle, QRScannerProps>(function QRScanner({ onSuccess, onError, onBack, isProcessing, resultState = 'idle', resultMessage, lessonId, lessonTitle, lessonFetchStatus, currentUrl }, ref) {
  const qrCodeRegionId = "qr-reader";
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);
  const [devices, setDevices] = useState<CameraInfo[]>([]);
  const [currentCameraIdx, setCurrentCameraIdx] = useState<number | null>(null);
  const [flip, setFlip] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 디버그 상태
  const [showDebug, setShowDebug] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [scanAttempts, setScanAttempts] = useState(0);
  const [lastDetected, setLastDetected] = useState<string | null>(null);

  const addDebugLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)]);
  }, []);

  const startScanner = useCallback(
    async (force?: boolean) => {
      if (currentCameraIdx == null || (!force && scanning) || typeof window === "undefined") return;
      if (html5QrCodeRef.current?.getState() === Html5QrcodeScannerState.SCANNING) return;

      try {
        addDebugLog(`카메라 시작 시도: ${devices[currentCameraIdx].label}`);

        const qrCode = new Html5Qrcode(qrCodeRegionId, {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        });
        html5QrCodeRef.current = qrCode;

        await qrCode.start(
          devices[currentCameraIdx].id,
          {
            fps: 15,
            qrbox: () => {
              const region = document.getElementById(qrCodeRegionId);
              if (!region) return { width: 250, height: 250 };

              const width = region.offsetWidth;
              const height = region.offsetHeight;

              const boxSize = Math.max(Math.floor(Math.min(width, height) * 0.7), 200);
              return { width: boxSize, height: boxSize };
            },
            aspectRatio: 1,
          },
          (decodedText) => {
            addDebugLog(`✅ QR 인식 성공: ${decodedText.substring(0, 50)}...`);
            setLastDetected(decodedText);
            onSuccess(decodedText);
          },
          (errorMessage) => {
            // 스캔 시도 카운트 (너무 자주 업데이트하지 않도록)
            setScanAttempts(prev => prev + 1);
          }
        );

        setScanning(true);
        setError(null);
        addDebugLog(`✅ 카메라 시작 성공`);
      } catch (err) {
        html5QrCodeRef.current = null;
        const errMsg = `카메라를 시작할 수 없습니다: ${err}`;
        setError(errMsg);
        addDebugLog(`❌ ${errMsg}`);
        console.error("Failed to start scanning", err);
      }
    },
    [currentCameraIdx, scanning, devices, onSuccess, addDebugLog]
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
  const reStart = useCallback(async () => {
    if (isTransitioning.current) return;
    isTransitioning.current = true;
    await stopScanner();
    await startScanner(true);

    setTimeout(() => {
      isTransitioning.current = false;
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
    addDebugLog('카메라 권한 요청 중...');

    // 네이티브 앱에 카메라 권한 요청
    const granted = await requestNativeCameraPermission();
    if (!granted) {
      const errMsg = "카메라 권한이 거부되었습니다.";
      setError(errMsg);
      addDebugLog(`❌ ${errMsg}`);
      return;
    }
    addDebugLog('✅ 네이티브 권한 획득');

    // 권한 획득 후 카메라 접근
    if (!navigator.mediaDevices) {
      const errMsg = `navigator.mediaDevices가 없습니다. HTTPS 필요.`;
      setError(errMsg);
      addDebugLog(`❌ ${errMsg}`);
      addDebugLog(`현재 URL: ${window.location.href}`);
      addDebugLog(`프로토콜: ${window.location.protocol}`);
      return;
    }
    addDebugLog('✅ mediaDevices 사용 가능');

    if (!navigator.mediaDevices.getUserMedia) {
      const errMsg = `getUserMedia가 지원되지 않습니다.`;
      setError(errMsg);
      addDebugLog(`❌ ${errMsg}`);
      return;
    }

    try {
      addDebugLog('getUserMedia 호출 중...');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      addDebugLog('✅ getUserMedia 성공');

      const deviceInfos = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = deviceInfos.filter((d) => d.kind === "videoinput");
      addDebugLog(`발견된 카메라: ${videoInputs.length}개`);

      if (videoInputs.length === 0) {
        setError("카메라를 찾을 수 없습니다.");
        addDebugLog('❌ 카메라 없음');
        return;
      }

      videoInputs.forEach((device, idx) => {
        addDebugLog(`  카메라 ${idx + 1}: ${device.label || device.deviceId.substring(0, 8)}`);
      });

      setDevices(
        videoInputs.map((device) => ({
          id: device.deviceId,
          label: device.label || `Camera ${device.deviceId}`,
        }))
      );

      stream.getTracks().forEach((track) => track.stop());
    } catch (err) {
      addDebugLog(`❌ getUserMedia 에러: ${err}`);
      throw err;
    }
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
    if (currentCameraIdx == null || devices.length <= 1) return;
    if (isTransitioning.current) return;

    isTransitioning.current = true;
    addDebugLog('카메라 전환 중...');
    await stopScanner();

    const nextIdx = (currentCameraIdx + 1) % devices.length;
    setCurrentCameraIdx(nextIdx);
    setScanning(false);

    // 직접 새 카메라로 시작
    try {
      addDebugLog(`새 카메라 시작: ${devices[nextIdx].label}`);
      const qrCode = new Html5Qrcode(qrCodeRegionId, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });
      html5QrCodeRef.current = qrCode;

      await qrCode.start(
        devices[nextIdx].id,
        {
          fps: 15,
          qrbox: () => {
            const region = document.getElementById(qrCodeRegionId);
            if (!region) return { width: 250, height: 250 };
            const width = region.offsetWidth;
            const height = region.offsetHeight;
            const boxSize = Math.max(Math.floor(Math.min(width, height) * 0.7), 200);
            return { width: boxSize, height: boxSize };
          },
          aspectRatio: 1,
        },
        (decodedText) => {
          addDebugLog(`✅ QR 인식 성공: ${decodedText.substring(0, 50)}...`);
          setLastDetected(decodedText);
          onSuccess(decodedText);
        },
        () => {
          setScanAttempts(prev => prev + 1);
        }
      );
      setScanning(true);
      setError(null);
      addDebugLog('✅ 카메라 전환 완료');
    } catch (err) {
      html5QrCodeRef.current = null;
      const errMsg = `카메라를 시작할 수 없습니다: ${err}`;
      setError(errMsg);
      addDebugLog(`❌ ${errMsg}`);
    }

    setTimeout(() => {
      isTransitioning.current = false;
    }, 300);
  }, [currentCameraIdx, devices, stopScanner, onSuccess, addDebugLog]);

  const toggleHorizontal = useCallback(() => {
    setFlip((prev) => !prev);
  }, []);

  useImperativeHandle(ref, () => ({
    toggleCamera,
    toggleFlip: toggleHorizontal,
    hasMultipleCameras: devices.length > 1,
  }), [toggleCamera, toggleHorizontal, devices.length]);

  useLayoutEffect(() => {
    if (scanning || html5QrCodeRef.current != null || typeof window === "undefined") return;
    reStart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCameraIdx, scanning]);

  useLayoutEffect(() => {
    if (currentCameraIdx == null && devices.length > 0) {
      // 후면 카메라 우선 선택 (back, rear, 후면, environment 등의 키워드 포함)
      const backCameraIdx = devices.findIndex((device) => {
        const label = device.label.toLowerCase();
        return label.includes('back') || label.includes('rear') || label.includes('후면') || label.includes('environment');
      });
      setCurrentCameraIdx(backCameraIdx !== -1 ? backCameraIdx : 0);
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
        <div style={{ position: 'absolute', right: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
          {devices.length > 1 && (
            <button onClick={toggleCamera} style={{ background: 'none', border: 'none', padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, cursor: 'pointer' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 19H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5" />
                <path d="M13 5h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5" />
                <circle cx="12" cy="12" r="3" />
                <path d="m18 22-3-3 3-3" />
                <path d="m6 2 3 3-3 3" />
              </svg>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)' }}>전환</span>
            </button>
          )}
          <button onClick={toggleHorizontal} style={{ background: 'none', border: 'none', padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, cursor: 'pointer' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h3" />
              <path d="M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3" />
              <path d="M12 20v2" />
              <path d="M12 14v2" />
              <path d="M12 8v2" />
              <path d="M12 2v2" />
            </svg>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)' }}>반전</span>
          </button>
        </div>
      </div>

      {/* 스캔 프레임 오버레이 */}
      {scanning && (
        <div className="qr-scan-overlay">
          <div className={`qr-scan-frame ${isProcessing ? 'qr-frame-success' : resultState === 'error' ? 'qr-frame-error' : resultState === 'success' ? 'qr-frame-success' : ''}`}>
            <div className="qr-scan-corner qr-top-left" />
            <div className="qr-scan-corner qr-top-right" />
            <div className="qr-scan-corner qr-bottom-left" />
            <div className="qr-scan-corner qr-bottom-right" />
            {!isProcessing && resultState === 'idle' && <div className="qr-scan-line" />}
          </div>
          <p className={`qr-scan-text ${isProcessing ? 'qr-text-success' : resultState === 'error' ? 'qr-text-error' : resultState === 'success' ? 'qr-text-success' : ''}`}>
            {isProcessing ? '출석체크중입니다...' : resultMessage || 'QR 코드를 프레임 안에 맞춰주세요'}
          </p>
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

      {/* 디버그 패널 */}
      {showDebug && (
        <div
          style={{
            position: 'fixed',
            top: 100,
            left: 8,
            right: 8,
            maxHeight: '40vh',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            borderRadius: 8,
            padding: 12,
            zIndex: 1000,
            overflow: 'auto',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ color: '#00ff00', fontWeight: 'bold', fontSize: 14 }}>🔧 DEBUG MODE</span>
            <button
              onClick={() => setShowDebug(false)}
              style={{ color: 'white', background: 'none', border: 'none', fontSize: 18 }}
            >
              ✕
            </button>
          </div>

          {/* 상태 요약 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: 8, borderRadius: 4 }}>
              <div style={{ color: '#888', fontSize: 10 }}>스캔 상태</div>
              <div style={{ color: scanning ? '#00ff00' : '#ff6b6b', fontSize: 14, fontWeight: 'bold' }}>
                {scanning ? '🟢 스캔 중' : '🔴 대기'}
              </div>
            </div>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: 8, borderRadius: 4 }}>
              <div style={{ color: '#888', fontSize: 10 }}>스캔 시도</div>
              <div style={{ color: '#00ff00', fontSize: 14, fontWeight: 'bold' }}>
                {scanAttempts.toLocaleString()}회
              </div>
            </div>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: 8, borderRadius: 4 }}>
              <div style={{ color: '#888', fontSize: 10 }}>카메라</div>
              <div style={{ color: '#fff', fontSize: 12 }}>
                {currentCameraIdx !== null && devices[currentCameraIdx]
                  ? devices[currentCameraIdx].label.substring(0, 15)
                  : '없음'}
              </div>
            </div>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: 8, borderRadius: 4 }}>
              <div style={{ color: '#888', fontSize: 10 }}>카메라 수</div>
              <div style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>
                {devices.length}개
              </div>
            </div>
          </div>

          {/* 레슨 정보 */}
          <div style={{ backgroundColor: 'rgba(100,149,237,0.2)', padding: 8, borderRadius: 4, marginBottom: 12 }}>
            <div style={{ color: '#6495ED', fontSize: 10, marginBottom: 4 }}>레슨 정보</div>
            <div style={{ color: '#fff', fontSize: 11, wordBreak: 'break-all' }}>
              <div>url: {currentUrl ?? '없음'}</div>
              <div>lessonId: {lessonId ?? '없음'}</div>
              <div>title: {lessonTitle ?? '없음'}</div>
              <div>status: {lessonFetchStatus ?? 'unknown'}</div>
            </div>
          </div>

          {/* 마지막 인식 */}
          {lastDetected && (
            <button
              onClick={async () => {
                await navigator.clipboard.writeText(lastDetected);
                alert('복사되었습니다');
              }}
              style={{ backgroundColor: 'rgba(0,255,0,0.2)', padding: 8, borderRadius: 4, marginBottom: 8, width: '100%', border: 'none', textAlign: 'left', cursor: 'pointer' }}
            >
              <div style={{ color: '#00ff00', fontSize: 10 }}>마지막 인식 (탭하여 복사)</div>
              <div style={{ color: '#fff', fontSize: 11, wordBreak: 'break-all' }}>
                {lastDetected.substring(0, 100)}...
              </div>
            </button>
          )}

          {/* 로그 */}
          <div style={{ color: '#888', fontSize: 10, marginBottom: 4 }}>로그</div>
          <div style={{ maxHeight: 150, overflow: 'auto' }}>
            {debugLogs.map((log, idx) => (
              <div key={idx} style={{ color: '#ccc', fontSize: 11, marginBottom: 2, fontFamily: 'monospace' }}>
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 디버그 토글 버튼 (숨겨졌을 때) */}
      {!showDebug && (
        <button
          onClick={() => setShowDebug(true)}
          style={{
            position: 'fixed',
            top: 100,
            right: 8,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: '#00ff00',
            border: 'none',
            borderRadius: 4,
            padding: '4px 8px',
            fontSize: 12,
            zIndex: 1000,
          }}
        >
          🔧 Debug
        </button>
      )}
    </div>
  );
});

export default QRScanner;
