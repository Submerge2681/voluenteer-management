'use client';

import { useState, useEffect } from 'react';
import { useQRCode } from 'next-qrcode'; 
import { RefreshCw, Copy, Check } from 'lucide-react';
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

  useEffect(() => {
    const updateCode = async () => {
      setCode(await generateEventCode(secret, type));
      setTimeLeft(getTotpTimeRemaining());
    };

    if (type === 'static_otp') {
      updateCode();
      return;
    }

    updateCode(); // Initial call
    const timer = setInterval(updateCode, 1000);

    return () => clearInterval(timer);
  }, [secret, type]);

  const copyLink = () => {
    const url = `${window.location.origin}/api/checkin?otp=${code}&event_id=${eventId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Column 1: QR Code */}
      <div className="flex flex-col items-center justify-center bg-white p-6 rounded-lg text-slate-900">
        <Canvas
          // The QR points to a URL that the user can scan with their phone camera
          // or with the in-app scanner if you build one.
          text={`${typeof window !== 'undefined' ? window.location.origin : ''}/api/checkin?otp=${code}&event=${eventId}`}
          options={{
            errorCorrectionLevel: 'M',
            margin: 2,
            scale: 4,
            width: 200,
          }}
        />
        <p className="mt-4 text-xs font-bold uppercase tracking-widest text-slate-500">
          Scan to Check In
        </p>
      </div>

      {/* Column 2: Manual Code & Timer */}
      <div className="flex flex-col justify-center space-y-6">
        <div>
          <label className="text-slate-400 text-xs uppercase tracking-wider font-semibold">
            Current Active PIN
          </label>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-5xl font-mono font-bold text-indigo-400 tracking-widest">
              {code || '...'}
            </span>
            <button 
              onClick={copyLink} 
              className="p-2 hover:bg-slate-800 rounded-full transition text-slate-400"
              title="Copy Check-in Link"
            >
              {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {type === 'totp' && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Security Refresh</span>
              <span>{timeLeft}s</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 transition-all duration-1000 ease-linear"
                style={{ width: `${(timeLeft / 30) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-2">
              <RefreshCw className="w-3 h-3 animate-spin" />
              Syncing with server time
            </p>
          </div>
        )}

        <div className="p-4 bg-slate-800 rounded border border-slate-700 text-sm text-slate-300">
          <strong>Tip:</strong> If a volunteer cannot scan, enter the PIN manually in their dashboard.
        </div>
      </div>
    </div>
  );
}