'use client';

interface ShareEventButtonsProps {
  title: string;
  startTime: string;
  location: string;
}

export default function ShareEventButtons({
  title,
  startTime,
  location,
}: ShareEventButtonsProps) {
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const eventDate = new Date(startTime).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const shareText = `Join me at ${title} on ${eventDate} at ${location}!`;
  const fullShareText = `${shareText}\n\n${shareUrl}`;

  const handleX = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareText
    )}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(fullShareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleInstagram = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('✅ Link copied!\n\nPaste it into your Instagram post or story.');
    } catch {
      alert('Copy this link manually:\n' + shareUrl);
    }
  };

  const handleEmail = () => {
    const subject = `You're invited: ${title}`;
    const body = `${shareText}\n\nDate: ${eventDate}\nLocation: ${location}\n\n${shareUrl}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleBluesky = () => {
    const url = `https://bsky.app/intent/compose?text=${encodeURIComponent(fullShareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleMastodon = () => {
    let instance = localStorage.getItem('mastodonInstance');
    
    if (!instance) {
      instance = prompt(
        'Enter your Mastodon instance (e.g. mastodon.social, mastodon.online)',
        'mastodon.social'
      );
      if (!instance?.trim()) return;
      localStorage.setItem('mastodonInstance', instance.trim());
    }

    const url = `https://${instance}/share?text=${encodeURIComponent(fullShareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="mt-8">
      <p className="text-slate-500 text-sm mb-4 font-medium">Share this event</p>
      
      <div className="flex flex-wrap gap-2 justify-center sm:justify-between">
        {/* X (Twitter) */}
        <button
          onClick={handleX}
          title="Share on X"
          aria-label="Share on X"
          className="p-3 flex items-center justify-center bg-black hover:bg-slate-800 text-white rounded-2xl transition-all active:scale-95 shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932zM17.61 20.644h2.039L6.486 3.24H4.298z" />
          </svg>
        </button>

        {/* Facebook */}
        <button
          onClick={handleFacebook}
          title="Share on Facebook"
          aria-label="Share on Facebook"
          className="p-3 flex items-center justify-center bg-[#1877F2] hover:bg-[#1664d4] text-white rounded-2xl transition-all active:scale-95 shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </button>

        {/* WhatsApp */}
        <button
          onClick={handleWhatsApp}
          title="Share on WhatsApp"
          aria-label="Share on WhatsApp"
          className="p-3 flex items-center justify-center bg-[#25D366] hover:bg-[#20b958] text-white rounded-2xl transition-all active:scale-95 shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.198.297-.767.966-.94 1.164-.173.198-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.485-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.355L1 21l1.395-5.126a9.868 9.868 0 01-1.356-5.03C1.04 5.46 5.5 1 10.5 1 15.5 1 20 5.5 20 10.5c0 5-4.5 9.5-9.5 9.5z" />
          </svg>
        </button>

        {/* Instagram */}
        <button
          onClick={handleInstagram}
          title="Share on Instagram (copy link)"
          aria-label="Share on Instagram (copy link)"
          className="p-3 flex items-center justify-center bg-gradient-to-r from-[#E1306C] via-[#C13584] to-[#833AB4] text-white rounded-2xl transition-all active:scale-95 shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.849.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162 0 3.403 2.759 6.162 6.162 6.162 3.403 0 6.162-2.759 6.162-6.162 0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4 2.21 0 4 1.791 4 4 0 2.21-1.79 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        </button>

        {/* Email */}
        <button
          onClick={handleEmail}
          title="Share via Email"
          aria-label="Share via Email"
          className="p-3 flex items-center justify-center bg-slate-700 hover:bg-slate-800 text-white rounded-2xl transition-all active:scale-95 shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
          </svg>
        </button>

        {/* Bluesky */}
        <button
          onClick={handleBluesky}
          title="Share on Bluesky"
          aria-label="Share on Bluesky"
          className="p-3 flex items-center justify-center bg-[#1185FE] hover:bg-[#0e6fd1] text-white rounded-2xl transition-all active:scale-95 shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 16 16">
            <path d="M3.468 1.948C5.303 3.325 7.276 6.118 8 7.616c.725-1.498 2.698-4.29 4.532-5.668C13.855.955 16 .186 16 2.632c0 .489-.28 4.105-.444 4.692-.572 2.04-2.653 2.561-4.504 2.246 3.236.551 4.06 2.375 2.281 4.2-3.376 3.464-4.852-.87-5.23-1.98-.07-.204-.103-.3-.103-.218 0-.081-.033.014-.102.218-.379 1.11-1.855 5.444-5.231 1.98-1.778-1.825-.955-3.65 2.28-4.2-1.85.315-3.932-.205-4.503-2.246C.28 6.737 0 3.12 0 2.632 0 .186 2.145.955 3.468 1.948" />
          </svg>
        </button>

        {/* Mastodon */}
        <button
          onClick={handleMastodon}
          title="Share on Mastodon"
          aria-label="Share on Mastodon"
          className="p-3 flex items-center justify-center bg-[#6364FF] hover:bg-[#4f50e6] text-white rounded-2xl transition-all active:scale-95 shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 16 16">
            <path d="M11.19 12.195c2.016-.24 3.77-1.475 3.99-2.603.348-1.778.32-4.339.32-4.339 0-3.47-2.286-4.488-2.286-4.488C12.062.238 10.083.017 8.027 0h-.05C5.92.017 3.942.238 2.79.765c0 0-2.285 1.017-2.285 4.488l-.002.662c-.004.64-.007 1.35.011 2.091.083 3.394.626 6.74 3.78 7.57 1.454.383 2.703.463 3.709.408 1.823-.1 2.847-.647 2.847-.647l-.06-1.317s-1.303.41-2.767.36c-1.45-.05-2.98-.156-3.215-1.928a4 4 0 0 1-.033-.496s1.424.346 3.228.428c1.103.05 2.137-.064 3.188-.189zm1.613-2.47H11.13v-4.08c0-.859-.364-1.295-1.091-1.295-.804 0-1.207.517-1.207 1.541v2.233H7.168V5.89c0-1.024-.403-1.541-1.207-1.541-.727 0-1.091.436-1.091 1.296v4.079H3.197V5.522q0-1.288.66-2.046c.456-.505 1.052-.764 1.793-.764.856 0 1.504.328 1.933.983L8 4.39l.417-.695c.429-.655 1.077-.983 1.934-.983.74 0 1.336.259 1.791.764q.662.757.661 2.046z" />
          </svg>
        </button>
      </div>

      <p className="text-[10px] text-slate-400 mt-3 text-center">
        Mastodon will remember your instance after the first use {/* Dont want this. ask every time and in an inline field than as an aleart */}
      </p>
    </div>
  );
}