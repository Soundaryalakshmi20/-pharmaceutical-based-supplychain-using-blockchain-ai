import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { Camera, Loader2, X, ScanLine, ImageUp, RotateCw } from 'lucide-react';

/** Pull the serial out of a `/verify/<serial>` URL; fall back to raw text. */
function extractSerial(payload) {
  const match = String(payload).match(/\/verify\/([^/?#]+)/i);
  return decodeURIComponent(match ? match[1] : payload).trim();
}

/** Decode a QR code out of an image file (screenshot / photo of a pack). */
function decodeImageFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        // cap the working size — huge phone photos slow jsQR down for nothing
        const scale = Math.min(1, 1280 / Math.max(img.width, img.height));
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code =
          jsQR(image.data, image.width, image.height, { inversionAttempts: 'attemptBoth' }) ||
          // retry at 2x for small/low-res codes
          (() => {
            canvas.width *= 2;
            canvas.height *= 2;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const big = ctx.getImageData(0, 0, canvas.width, canvas.height);
            return jsQR(big.data, big.width, big.height, { inversionAttempts: 'attemptBoth' });
          })();
        if (code && code.data) resolve(extractSerial(code.data));
        else reject(new Error('No QR code found in that image'));
      } catch (err) {
        reject(err);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read that image file'));
    };
    img.src = url;
  });
}

/**
 * QR scanner with two input modes:
 *  - live camera
 *  - upload an image (screenshot/photo containing the QR)
 *
 * onScan receives the extracted serial once; the parent runs verification.
 */
export default function QrScanner({ open, onClose, onScan, title = 'Scan QR code' }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const doneRef = useRef(false);
  const fileRef = useRef(null);
  const [error, setError] = useState('');
  const [starting, setStarting] = useState(true);
  const [mode, setMode] = useState('camera'); // 'camera' | 'upload'
  const [decoding, setDecoding] = useState(false);

  // stop the camera whenever we switch to upload or close
  useEffect(() => {
    if (mode !== 'camera' || !open) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    }
  }, [mode, open]);

  useEffect(() => {
    if (!open || mode !== 'camera') return;
    doneRef.current = false;
    setError('');
    setStarting(true);
    let cancelled = false;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        setStarting(false);

        const canvas = canvasRef.current || document.createElement('canvas');
        canvasRef.current = canvas;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        const tick = () => {
          if (cancelled || doneRef.current) return;
          if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(image.data, image.width, image.height, {
              inversionAttempts: 'dontInvert',
            });
            if (code && code.data) {
              doneRef.current = true;
              onScan(extractSerial(code.data));
              return;
            }
          }
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      } catch (err) {
        setStarting(false);
        setError(
          err.name === 'NotAllowedError'
            ? 'Camera permission denied — upload a photo of the QR code instead.'
            : `Camera unavailable — upload a photo of the QR code instead.`
        );
      }
    }

    start();
    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [open, mode, onScan]);

  async function handleFile(e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = ''; // allow re-picking the same file
    if (!file) return;
    setDecoding(true);
    setError('');
    try {
      const serial = await decodeImageFile(file);
      onScan(serial);
    } catch (err) {
      setError(err.message);
    } finally {
      setDecoding(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <p className="flex items-center gap-2 text-sm font-semibold text-white">
            <Camera className="w-4 h-4 text-emerald-400" /> {title}
          </p>
          <button onClick={onClose} className="text-slate-400 hover:text-white" aria-label="Close scanner">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* mode switch */}
        <div className="flex border-b border-slate-800 text-xs">
          <button
            onClick={() => { setMode('camera'); setError(''); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 font-medium transition ${
              mode === 'camera' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" /> Camera
          </button>
          <button
            onClick={() => { setMode('upload'); setError(''); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 font-medium transition ${
              mode === 'upload' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageUp className="w-3.5 h-3.5" /> Upload image
          </button>
        </div>

        {mode === 'camera' ? (
          <div className="relative aspect-square bg-black">
            <video ref={videoRef} playsInline muted className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-8 border-2 border-emerald-400/70 rounded-lg pointer-events-none">
              <div className="absolute -top-px left-0 right-0 h-0.5 bg-emerald-400 animate-pulse" />
            </div>
            {starting && !error && (
              <div className="absolute inset-0 flex items-center justify-center gap-2 text-slate-300 text-sm bg-black/60">
                <Loader2 className="w-4 h-4 animate-spin" /> Starting camera…
              </div>
            )}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-rose-300 text-sm bg-black/80">
                {error}
              </div>
            )}
          </div>
        ) : (
          <div className="aspect-square bg-slate-950 flex flex-col items-center justify-center gap-4 p-6 text-center">
            <ImageUp className="w-10 h-10 text-slate-600" />
            <div>
              <p className="text-sm text-slate-300">Upload a photo or screenshot of the QR code</p>
              <p className="text-[11px] text-slate-500 mt-1">
                We read the QR locally in your browser — the image never leaves this device.
              </p>
            </div>
            <button
              onClick={() => fileRef.current && fileRef.current.click()}
              disabled={decoding}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition"
            >
              {decoding ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageUp className="w-4 h-4" />}
              {decoding ? 'Reading QR…' : 'Choose image'}
            </button>
            {error && (
              <p className="text-xs text-rose-400 flex items-center gap-1.5">
                <RotateCw className="w-3.5 h-3.5" /> {error}
              </p>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="hidden"
              data-testid="qr-file-input"
            />
          </div>
        )}

        <p className="px-4 py-3 text-[11px] text-slate-500 flex items-center gap-1.5">
          <ScanLine className="w-3.5 h-3.5 text-emerald-400" />
          {mode === 'camera'
            ? 'Point the camera at the QR code printed on the pack.'
            : 'Or switch back to the camera for a live scan.'}
        </p>
      </div>
    </div>
  );
}
