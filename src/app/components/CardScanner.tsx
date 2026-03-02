'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

export interface CardScanResult {
  cardNumber: string;
  expiryMonth?: string;
  expiryYear?: string;
}

interface CardScannerProps {
  locale: Locale;
  onCardDetected: (result: CardScanResult) => void;
  onManualEntry: () => void;
  onClose: () => void;
}

function luhnCheck(num: string): boolean {
  const digits = num.split('').map(Number);
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = digits[i];
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

function extractCardNumber(text: string): string | null {
  const cleaned = text.replace(/[^0-9\s]/g, '');

  // Match 16 consecutive digits
  const continuous = cleaned.replace(/\s/g, '');
  const match16 = continuous.match(/\d{16}/);
  if (match16 && luhnCheck(match16[0])) {
    return match16[0];
  }

  // Match 4-group pattern (4 digits separated by spaces)
  const groupMatch = cleaned.match(/\d{4}\s+\d{4}\s+\d{4}\s+\d{4}/);
  if (groupMatch) {
    const digits = groupMatch[0].replace(/\s/g, '');
    if (digits.length === 16 && luhnCheck(digits)) {
      return digits;
    }
  }

  return null;
}

function extractExpiry(text: string): { month: string; year: string } | null {
  // Match MM/YY or MM / YY patterns (month 01-12, year 00-99)
  const match = text.match(/\b(0[1-9]|1[0-2])\s*[\/\-]\s*(\d{2})\b/);
  if (match) {
    return { month: match[1], year: match[2] };
  }
  return null;
}

const requestNativeCameraPermission = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).KloudEvent?.requestCameraPermission) {
      (window as any).onCameraPermissionResult = (data: { granted: boolean }) => {
        resolve(data.granted);
      };
      (window as any).KloudEvent.requestCameraPermission();
    } else {
      resolve(true);
    }
  });
};

export default function CardScanner({ locale, onCardDetected, onManualEntry, onClose }: CardScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const workerRef = useRef<any>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detected, setDetected] = useState(false);

  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (workerRef.current) {
      workerRef.current.terminate().catch(() => {});
      workerRef.current = null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        // Request native camera permission
        const granted = await requestNativeCameraPermission();
        if (!granted) {
          setError(getLocaleString({ locale, key: 'card_scan_error_permission' }));
          setLoading(false);
          return;
        }

        if (!navigator.mediaDevices?.getUserMedia) {
          setError(getLocaleString({ locale, key: 'card_scan_error_no_camera' }));
          setLoading(false);
          return;
        }

        // Start camera (prefer rear)
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
        });

        if (cancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Load Tesseract worker via dynamic import
        const Tesseract = await import('tesseract.js');
        if (cancelled) return;

        const worker = await Tesseract.createWorker('eng');
        if (cancelled) {
          await worker.terminate();
          return;
        }

        await worker.setParameters({
          tessedit_char_whitelist: '0123456789 /',
          tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
        } as any);

        workerRef.current = worker;
        setLoading(false);

        // Start OCR interval
        intervalRef.current = setInterval(async () => {
          if (!videoRef.current || !canvasRef.current || !workerRef.current) return;

          const video = videoRef.current;
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          if (!ctx || video.videoWidth === 0) return;

          // Crop center region (80% width, 30% height)
          const cropW = video.videoWidth * 0.8;
          const cropH = video.videoHeight * 0.3;
          const cropX = (video.videoWidth - cropW) / 2;
          const cropY = (video.videoHeight - cropH) / 2;

          canvas.width = cropW;
          canvas.height = cropH;

          ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

          // Grayscale + threshold binarization
          const imageData = ctx.getImageData(0, 0, cropW, cropH);
          const data = imageData.data;
          for (let i = 0; i < data.length; i += 4) {
            const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
            const val = gray > 128 ? 255 : 0;
            data[i] = data[i + 1] = data[i + 2] = val;
          }
          ctx.putImageData(imageData, 0, 0);

          try {
            const { data: result } = await workerRef.current.recognize(canvas);
            const cardNumber = extractCardNumber(result.text);
            if (cardNumber) {
              const expiry = extractExpiry(result.text);
              setDetected(true);
              // Small delay to show feedback
              setTimeout(() => {
                onCardDetected({
                  cardNumber,
                  expiryMonth: expiry?.month,
                  expiryYear: expiry?.year,
                });
              }, 500);
              // Stop scanning after detection
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
              }
            }
          } catch {
            // Ignore OCR errors, continue scanning
          }
        }, 1500);

      } catch (err) {
        if (!cancelled) {
          setError(getLocaleString({ locale, key: 'card_scan_error_no_camera' }));
          setLoading(false);
        }
      }
    };

    init();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [locale, onCardDetected, cleanup]);

  return (
    <div className="card-scanner-container">
      {/* Camera video */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="card-scanner-video"
      />
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Header */}
      <div className="card-scanner-header">
        <button onClick={onClose} className="card-scanner-close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="card-scanner-header-title">
          {getLocaleString({ locale, key: 'card_scan_title' })}
        </span>
      </div>

      {/* Scan overlay */}
      {!loading && !error && (
        <div className="card-scanner-overlay">
          <div className="card-scan-frame">
            <div className="card-scan-corner card-scan-corner-tl" />
            <div className="card-scan-corner card-scan-corner-tr" />
            <div className="card-scan-corner card-scan-corner-bl" />
            <div className="card-scan-corner card-scan-corner-br" />
            {!detected && <div className="card-scan-line" />}
          </div>
          <p className={`card-scan-guide-text ${detected ? 'card-scan-detected-text' : ''}`}>
            {detected
              ? getLocaleString({ locale, key: 'card_scan_detected' })
              : getLocaleString({ locale, key: 'card_scan_guide' })
            }
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && !error && (
        <div className="card-scanner-loading">
          <div className="card-scanner-spinner" />
          <span>{getLocaleString({ locale, key: 'card_scan_loading' })}</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="card-scanner-error">
          <span className="card-scanner-error-text">{error}</span>
          <button className="card-scanner-manual-btn" onClick={onManualEntry}>
            {getLocaleString({ locale, key: 'card_scan_manual_entry' })}
          </button>
        </div>
      )}

      {/* Bottom - manual entry button */}
      {!error && (
        <div className="card-scanner-bottom">
          <button className="card-scanner-manual-btn" onClick={onManualEntry}>
            {getLocaleString({ locale, key: 'card_scan_manual_entry' })}
          </button>
        </div>
      )}
    </div>
  );
}
