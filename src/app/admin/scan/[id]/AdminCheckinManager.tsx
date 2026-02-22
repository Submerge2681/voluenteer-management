'use client';

import { useState, useEffect } from 'react';
import { useQRCode } from 'next-qrcode';
import { RefreshCw, Copy, Check, Maximize2, X } from 'lucide-react';
import { generateEventCode, getTotpTimeRemaining } from '@/lib/totp';

interface Props {
  eventId: string;
  secret: string;
  type: 'totp' | 'static_otp';
}

export default function AdminCheckinManager({ eventId, secret, type }: Props) {
  const { Canvas } = useQRCode();
  const [code, setCode] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // State to safely handle client-side rendering without hydration errors
  const [mounted, setMounted] = useState(false);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setMounted(true);
    setOrigin(window.location.origin);

    const updateCode = async () => {
      setCode(await generateEventCode(secret, type));
      setTimeLeft(getTotpTimeRemaining());
    };

    if (type === 'static_otp') {
      updateCode();
      return;
    }

    updateCode();
    const timer = setInterval(updateCode, 1000);
    return () => clearInterval(timer);
  }, [secret, type]);

  // Ensures URL is only built after hydration to prevent SSR mismatch
  const url = mounted && code ? `${origin}/api/checkin?otp=${code}&event_id=${eventId}` : '';

  const copyLink = () => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="flex flex-col items-center gap-8">
        {/* Column 1: Standard Size QR Code */}
        <div className="flex flex-col items-center justify-center bg-white p-6 rounded-lg text-slate-900 w-fit shadow-sm">
          <Canvas
            text={url || 'initializing...'}
            options={{
              errorCorrectionLevel: 'M',
              margin: 2,
              scale: 4,
              width: 300,
            }}
          />
          <div className="flex gap-2 mt-4 items-center">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Scan to Check In
            </p>

            <button
              onClick={() => setIsFullscreen(true)}
              className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition-colors"
              title="Fullscreen QR"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Column 2: Data & Links */}
        <div className="flex flex-col justify-center w-full max-w-2xl">
          <label className="text-slate-400 text-xs uppercase tracking-wider font-semibold hidden sm:block">
            Current Active PIN and URL
          </label>

          <div className="flex flex-col sm:flex-row items-center flex-wrap gap-4 sm:gap-8 mt-2">
            <label className="text-slate-400 text-xs uppercase tracking-wider font-semibold sm:hidden">
              Current Active PIN
            </label>
            <span className="text-5xl font-mono font-bold text-indigo-400 tracking-widest">
              {code || '...'}
            </span>

            <hr className='my-1 w-full text-slate-800'></hr>

            <label className="text-slate-400 text-xs uppercase tracking-wider font-semibold sm:hidden">
              Current Active URL
            </label>
            <div className="flex items-center gap-4 flex-1">
              <span className="text-sm sm:text-base font-mono text-indigo-400 tracking-widest border-2 border-slate-600 rounded-xl p-3 sm:p-4 break-all flex-1">
                {url || 'Loading URL...'}
              </span>

              <button
                onClick={copyLink}
                className="p-3 bg-slate-800 hover:bg-slate-700 rounded-full transition text-slate-300 shrink-0"
                title="Copy Check-in Link"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-400" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Standard Inline Progress Bar */}
          {type === 'totp' && (
            <div className="space-y-2 mt-6">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Security Refresh</span>
                <span className="font-mono">{timeLeft}s</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-1000 ease-linear"
                  style={{ width: `${(timeLeft / 30) * 100}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-2">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Syncing with server time
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-6 sm:p-12"
          onClick={() => setIsFullscreen(false)}
        >
          {/* Landscape Timeline: Vertical bars on Left & Right */}
          {type === 'totp' && (
            <>
              <div className="hidden landscape:block absolute left-4 sm:left-8 top-12 bottom-12 w-2 sm:w-3 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="w-full h-full bg-indigo-500 origin-center transition-transform duration-1000 ease-linear"
                  style={{ transform: `scaleY(${timeLeft / 30})` }}
                />
              </div>
              <div className="hidden landscape:block absolute right-4 sm:right-8 top-12 bottom-12 w-2 sm:w-3 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="w-full h-full bg-indigo-500 origin-center transition-transform duration-1000 ease-linear"
                  style={{ transform: `scaleY(${timeLeft / 30})` }}
                />
              </div>
            </>
          )}

          {/* Portrait Timeline: Horizontal bar on Top */}
          {type === 'totp' && (
            <div className="hidden portrait:block absolute top-8 left-8 right-8 h-2 sm:h-3 bg-slate-900 rounded-full overflow-hidden">
              <div
                className="w-full h-full bg-indigo-500 origin-center transition-transform duration-1000 ease-linear"
                style={{ transform: `scaleX(${timeLeft / 30})` }}
              />
            </div>
          )}

          {/* Max-Size QR Code Modal */}
          <div
            className="bg-white rounded-3xl p-4 sm:p-8 flex flex-col items-center justify-center relative w-full h-full max-w-[85vmin] max-h-[85vmin] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* The child CSS forces the Next-QR canvas to responsibly fill the modal */}
            <div className="w-full h-full flex items-center justify-center [&>canvas]:w-full! [&>canvas]:h-auto! [&>canvas]:max-h-full [&>canvas]:object-contain">
              <Canvas
                text={url || 'loading...'}
                options={{
                  errorCorrectionLevel: 'M',
                  margin: 1,
                  width: 1080, // Render at a huge internal resolution so it's sharp when scaled
                }}
              />
            </div>

            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute -top-12 sm:-top-16 right-0 flex items-center gap-2 text-slate-400 hover:text-white transition-colors p-2"
              title="Close Fullscreen"
            >
              <X className="w-8 h-8 sm:w-10 sm:h-10" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}