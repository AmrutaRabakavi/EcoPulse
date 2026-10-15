import React, { useState, useEffect } from 'react';
import { QrCode, Copy, Check, Clock, Sparkles } from 'lucide-react';

/**
 * Modern Dynamic QR Code Display with live countdown ring and backup code
 */
const QRCodeDisplay = ({
  code,
  token,
  points = 25,
  expiresAt,
  durationSeconds = 60,
  onExpired,
}) => {
  const [copied, setCopied] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(durationSeconds);

  // Fallback to QR server API for crisp vector QR code representation
  const claimUrl = `${window.location.origin}/qr-scan?code=${encodeURIComponent(code)}&token=${encodeURIComponent(token)}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&color=0f172a&bgcolor=ffffff&data=${encodeURIComponent(claimUrl)}`;

  useEffect(() => {
    if (!expiresAt) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const target = new Date(expiresAt).getTime();
      const diff = Math.max(0, Math.round((target - now) / 1000));
      setSecondsRemaining(diff);

      if (diff <= 0) {
        clearInterval(interval);
        if (onExpired) onExpired();
      }
    }, 500);

    return () => clearInterval(interval);
  }, [expiresAt, onExpired]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const progressPct = Math.max(0, Math.min(100, (secondsRemaining / durationSeconds) * 100));
  const isUrgent = secondsRemaining <= 15;

  return (
    <div className="flex flex-col items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-xl max-w-sm mx-auto text-center">
      {/* Top Banner */}
      <div className="flex items-center justify-between w-full mb-3 px-1">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>+{points} EcoPoints</span>
        </div>
        <div
          className={`inline-flex items-center space-x-1 text-xs font-mono font-semibold px-2.5 py-1 rounded-full ${
            isUrgent
              ? 'bg-rose-100 text-rose-700 animate-pulse'
              : 'bg-slate-100 text-slate-700'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{secondsRemaining}s left</span>
        </div>
      </div>

      {/* QR Code Container with Animated Scan Reticle */}
      <div className="relative p-3 bg-white rounded-2xl border-2 border-emerald-500/30 shadow-inner group">
        <img
          src={qrImageUrl}
          alt={`Scan QR Code: ${code}`}
          className="w-56 h-56 rounded-xl object-contain bg-white"
          onError={(e) => {
            // In case of offline, fallback to styled graphic
            e.target.style.display = 'none';
          }}
        />

        {/* Scan Reticle Corners */}
        <div className="absolute top-1 left-1 w-4 h-4 border-t-2 border-l-2 border-emerald-600 rounded-tl-sm pointer-events-none" />
        <div className="absolute top-1 right-1 w-4 h-4 border-t-2 border-r-2 border-emerald-600 rounded-tr-sm pointer-events-none" />
        <div className="absolute bottom-1 left-1 w-4 h-4 border-b-2 border-l-2 border-emerald-600 rounded-bl-sm pointer-events-none" />
        <div className="absolute bottom-1 right-1 w-4 h-4 border-b-2 border-r-2 border-emerald-600 rounded-br-sm pointer-events-none" />
      </div>

      {/* Progress Bar for Expiration */}
      <div className="w-full bg-slate-100 rounded-full h-1.5 mt-4 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${
            isUrgent ? 'bg-rose-500' : 'bg-emerald-500'
          }`}
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Backup Manual Code */}
      <div className="mt-4 w-full">
        <p className="text-xs text-slate-500 mb-1">Backup Station Code</p>
        <div className="flex items-center justify-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2">
          <span className="font-mono font-extrabold text-lg tracking-widest text-slate-900">
            {code}
          </span>
          <button
            onClick={handleCopyCode}
            title="Copy code"
            className="p-1 hover:bg-slate-200 rounded-lg text-slate-500 transition"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeDisplay;
