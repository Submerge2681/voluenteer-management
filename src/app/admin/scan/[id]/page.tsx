'use client';
import { useState, useEffect, use } from 'react';
import { generate } from 'otplib';
import { useQRCode } from 'next-qrcode'; // Hypothetical wrapper or use 'qrcode.react'

export default function AdminQRDisplay({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [token, setToken] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [secret, setSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { Canvas } = useQRCode();

  // 1. Fetch Event Secret on Mount (Protected by RLS in real app)
  useEffect(() => {
    async function fetchSecret() {
      try {
        const res = await fetch(`/api/events/${id}/secret`);
        if (!res.ok) {
          throw new Error(`Failed to fetch secret: ${res.status}`);
        }
        const data = await res.json();
        setSecret(data.secret);
      } catch (err) {
        setError((err as Error).message);
      }
    }
    fetchSecret();
  }, [id]);

  // 2. TOTP Tick Loop
  useEffect(() => {
    if (!secret) return;

    const update = async () => {
      try {
        const newToken = await generate({ secret });
        setToken(newToken);
      } catch (err) {
        console.error('Error generating token:', err);
        // Optionally set error state
      }

      const now = Date.now() / 1000;
      const timeUsed = Math.floor(now) % 30;
      setTimeLeft(30 - timeUsed);
    };

    update(); // Initial update
    const interval = setInterval(update, 1000);

    return () => clearInterval(interval);
  }, [secret]);

  if (error) return <div>Error: {error}</div>;
  if (!secret) return <div>Loading Secure Channel...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <h2 className="text-2xl font-bold mb-8">Scan to Check-In</h2>
      
      <div className="p-4 bg-white rounded-xl">
        {/* The QR contains the URL to the checkin API with the token */}
        {/* Format: https://site.com/events/checkin/TOKEN?event_id=ID */}
        <Canvas
          text={`${process.env.NEXT_PUBLIC_APP_URL}/checkin/${token}?event_id=${id}`}
          options={{
            errorCorrectionLevel: 'M',
            margin: 3,
            scale: 4,
            width: 300,
          }}
        />
      </div>

      <div className="mt-8 text-center">
        <p className="text-gray-400 uppercase tracking-widest text-xs">Current PIN</p>
        <p className="text-4xl font-mono font-bold tracking-[0.5em] text-indigo-400">
          {token}
        </p>
      </div>

      <div className="mt-4 w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
        <div 
            className="h-full bg-indigo-500 transition-all duration-1000 ease-linear"
            style={{ width: `${(timeLeft / 30) * 100}%` }}
        />
      </div>
    </div>
  );
}