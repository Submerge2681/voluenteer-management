'use client';

import { useState, useRef } from 'react';

interface ShareEventButtonsProps {
  title: string;
  startTime: string;
  location: string;
}

export default function ShareEventButtons({ title, startTime, location }: ShareEventButtonsProps) {
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const [copyLabel, setCopyLabel] = useState('Copy');
  const [showFediverseInput, setShowFediverseInput] = useState(false);
  const [fediverseInstance, setFediverseInstance] = useState('');
  const fediverseInputRef = useRef<HTMLInputElement>(null);

  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  const eventDate = new Date(startTime).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  const shareText = `Join me at ${title} on ${eventDate} at ${location}!`;
  const fullShareText = `${shareText}\n\n${shareUrl}`;

  const handleX = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      '_blank', 'noopener,noreferrer'
    );
  };

  const handleFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      '_blank', 'noopener,noreferrer'
    );
  };

  const handleWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(fullShareText)}`,
      '_blank', 'noopener,noreferrer'
    );
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyLabel('Copied!');
      setTimeout(() => setCopyLabel('Copy'), 2000);
    } catch {
      setCopyLabel('Failed');
      setTimeout(() => setCopyLabel('Copy'), 2000);
    }
  };

  const handleReddit = () => {
    window.open(
      `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`,
      '_blank', 'noopener,noreferrer'
    );
  };

  const handleEmail = () => {
    const subject = `You're invited: ${title}`;
    const body = `${shareText}\n\nDate: ${eventDate}\nLocation: ${location}\n\n${shareUrl}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleBluesky = () => {
    window.open(
      `https://bsky.app/intent/compose?text=${encodeURIComponent(fullShareText)}`,
      '_blank', 'noopener,noreferrer'
    );
  };

  const handleFediverseToggle = () => {
    setShowFediverseInput((prev) => !prev);
    setFediverseInstance('');
    if (!showFediverseInput) {
      setTimeout(() => fediverseInputRef.current?.focus(), 50);
    }
  };

  const handleFediverseShare = () => {
    const instance = fediverseInstance.trim().replace(/^https?:\/\//, '');
    if (!instance) return;
    window.open(
      `https://${instance}/share?text=${encodeURIComponent(fullShareText)}`,
      '_blank', 'noopener,noreferrer'
    );
    setShowFediverseInput(false);
    setFediverseInstance('');
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title, text: shareText, url: shareUrl });
    } catch {
      // User cancelled or share failed — no action needed
    }
  };

  const isCopied = copyLabel === 'Copied!';

  return (
    <div className="mt-8">
      <p className="text-slate-500 text-sm mb-4 font-medium">Share this event</p>

      <div className="flex flex-wrap md:grid md:grid-cols-3 gap-2 md:gap-0 md:gap-y-5 justify-center sm:justify-between">
        {/* X */}
        <button onClick={handleX} title="Share on X" aria-label="Share on X"
          className="h-12 w-12 flex items-center justify-center bg-black hover:bg-slate-800 text-white rounded-2xl transition-all active:scale-95 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932zM17.61 20.644h2.039L6.486 3.24H4.298z" />
          </svg>
        </button>

        {/* Facebook */}
        <button onClick={handleFacebook} title="Share on Facebook" aria-label="Share on Facebook"
          className="h-12 w-12 flex items-center justify-center bg-[#1877F2] hover:bg-[#1664d4] text-white rounded-2xl transition-all active:scale-95 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </button>

        {/* WhatsApp */}
        <button onClick={handleWhatsApp} title="Share on WhatsApp" aria-label="Share on WhatsApp"
          className="h-12 w-12 flex items-center justify-center bg-[#25D366] hover:bg-[#20b958] text-white rounded-2xl transition-all active:scale-95 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.554 4.103 1.523 5.824L0 24l6.336-1.498A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm6.127 16.878c-.258.726-1.27 1.33-2.086 1.505-.555.118-1.279.212-3.717-.798-3.117-1.288-5.126-4.453-5.28-4.659-.148-.206-1.241-1.653-1.241-3.153s.78-2.237 1.07-2.542c.254-.268.553-.335.737-.335l.528.01c.169.008.397-.064.62.474.233.563.789 1.933.858 2.073.07.14.116.304.023.49-.088.19-.132.308-.26.474-.127.165-.268.368-.382.495-.127.14-.26.292-.112.572.149.28.66 1.088 1.416 1.763.974.867 1.796 1.135 2.077 1.263.28.127.443.106.607-.064.165-.17.703-.82.891-1.1.187-.282.374-.235.632-.14.257.093 1.63.769 1.91.909.28.14.467.21.535.326.07.117.07.674-.188 1.4z"/>
          </svg>
        </button>

        {/* Reddit */}
        <button onClick={handleReddit} title="Share on Reddit" aria-label="Share on Reddit"
          className="h-12 w-12 flex items-center justify-center bg-[#FF4500] hover:bg-[#e03d00] text-white rounded-2xl transition-all active:scale-95 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
          </svg>
        </button>

        {/* Bluesky */}
        <button onClick={handleBluesky} title="Share on Bluesky" aria-label="Share on Bluesky"
          className="h-12 w-12 flex items-center justify-center bg-[#1185FE] hover:bg-[#0e6fd1] text-white rounded-2xl transition-all active:scale-95 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 16 16">
            <path d="M3.468 1.948C5.303 3.325 7.276 6.118 8 7.616c.725-1.498 2.698-4.29 4.532-5.668C13.855.955 16 .186 16 2.632c0 .489-.28 4.105-.444 4.692-.572 2.04-2.653 2.561-4.504 2.246 3.236.551 4.06 2.375 2.281 4.2-3.376 3.464-4.852-.87-5.23-1.98-.07-.204-.103-.3-.103-.218 0-.081-.033.014-.102.218-.379 1.11-1.855 5.444-5.231 1.98-1.778-1.825-.955-3.65 2.28-4.2-1.85.315-3.932-.205-4.503-2.246C.28 6.737 0 3.12 0 2.632 0 .186 2.145.955 3.468 1.948" />
          </svg>
        </button>

        {/* Email */}
        <button onClick={handleEmail} title="Share via Email" aria-label="Share via Email"
          className="h-12 w-12 flex items-center justify-center bg-slate-700 hover:bg-slate-800 text-white rounded-2xl transition-all active:scale-95 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
          </svg>
        </button>

        {/* Copy */}
        <button onClick={handleCopy} title="Copy link" aria-label="Copy link"
          className={`h-12 w-12 flex flex-col items-center justify-center min-w-[52px] rounded-2xl transition-all active:scale-95 shadow-sm text-white text-[10px] font-semibold gap-0.5 ${isCopied ? 'bg-emerald-500' : 'bg-slate-500 hover:bg-slate-600'}`}>
          {isCopied ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
          <span>{copyLabel}</span>
        </button>

        {/* Fediverse */}
        <button onClick={handleFediverseToggle} title="Share on Fediverse" aria-label="Share on Fediverse"
          className={`h-12 w-12 flex items-center justify-center rounded-2xl transition-all active:scale-95 shadow-sm text-white ${showFediverseInput ? 'bg-[#4f50e6]' : 'bg-[#6364FF] hover:bg-[#4f50e6]'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 16 16">
            <path d="M11.19 12.195c2.016-.24 3.77-1.475 3.99-2.603.348-1.778.32-4.339.32-4.339 0-3.47-2.286-4.488-2.286-4.488C12.062.238 10.083.017 8.027 0h-.05C5.92.017 3.942.238 2.79.765c0 0-2.285 1.017-2.285 4.488l-.002.662c-.004.64-.007 1.35.011 2.091.083 3.394.626 6.74 3.78 7.57 1.454.383 2.703.463 3.709.408 1.823-.1 2.847-.647 2.847-.647l-.06-1.317s-1.303.41-2.767.36c-1.45-.05-2.98-.156-3.215-1.928a4 4 0 0 1-.033-.496s1.424.346 3.228.428c1.103.05 2.137-.064 3.188-.189zm1.613-2.47H11.13v-4.08c0-.859-.364-1.295-1.091-1.295-.804 0-1.207.517-1.207 1.541v2.233H7.168V5.89c0-1.024-.403-1.541-1.207-1.541-.727 0-1.091.436-1.091 1.296v4.079H3.197V5.522q0-1.288.66-2.046c.456-.505 1.052-.764 1.793-.764.856 0 1.504.328 1.933.983L8 4.39l.417-.695c.429-.655 1.077-.983 1.934-.983.74 0 1.336.259 1.791.764q.662.757.661 2.046z" />
          </svg>
        </button>

        {/* Native Share (mobile) */}
        {canNativeShare && (
          <button onClick={handleNativeShare} title="Share" aria-label="Share via system"
            className="p-3 flex items-center justify-center bg-slate-600 hover:bg-slate-700 text-white rounded-2xl transition-all active:scale-95 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        )}
      </div>

      {/* Fediverse inline input */}
      {showFediverseInput && (
        <div className="mt-3 flex gap-2 items-center animate-in fade-in slide-in-from-top-1 duration-150">
          <input
            ref={fediverseInputRef}
            type="text"
            value={fediverseInstance}
            onChange={(e) => setFediverseInstance(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFediverseShare()}
            placeholder="e.g. mastodon.social"
            className="flex-1 text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6364FF]/40 focus:border-[#6364FF]"
          />
          <button
            onClick={handleFediverseShare}
            disabled={!fediverseInstance.trim()}
            className="px-4 py-2 text-sm font-medium bg-[#6364FF] hover:bg-[#4f50e6] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-all"
          >
            Share
          </button>
        </div>
      )}
    </div>
  );
}