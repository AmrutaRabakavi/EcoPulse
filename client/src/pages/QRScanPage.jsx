import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  QrCode,
  ScanLine,
  Camera,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  MapPin,
  Trash2,
  ShieldCheck,
  KeyRound,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { claimWastePoints } from '../api/smartBinApi';
import { useAuth } from '../context/AuthContext';

const QRScanPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const queryCode = searchParams.get('code') || '';
  const queryToken = searchParams.get('token') || '';

  const [activeTab, setActiveTab] = useState(queryCode || queryToken ? 'manual' : 'camera');
  const [inputCode, setInputCode] = useState(queryCode);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [claimSuccess, setClaimSuccess] = useState(null);

  // Camera state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);

  // Auto-fill code if present in URL
  useEffect(() => {
    if (queryCode) {
      setInputCode(queryCode);
      setActiveTab('manual');
    }
  }, [queryCode]);

  // Clean up camera on unmount or tab switch
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraError(
        'Unable to access camera. Please enter the station code below or check camera permissions.'
      );
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleTabChange = (tab) => {
    if (tab !== 'camera') {
      stopCamera();
    }
    setActiveTab(tab);
    setErrorMsg(null);
  };

  const handleClaim = async (tokenOrCode) => {
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    const payload = queryToken
      ? { token: queryToken }
      : { code: tokenOrCode || inputCode };

    if (!payload.token && (!payload.code || !payload.code.trim())) {
      setErrorMsg('Please enter a valid station code.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const data = await claimWastePoints(payload);
      if (data.success) {
        setClaimSuccess(data);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err) {
      console.error('Claim error:', err);
      setErrorMsg(
        err.response?.data?.message || 'Failed to claim points. Please check the code.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 bg-emerald-100 text-emerald-800 rounded-2xl mb-1">
          <QrCode className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">
          Smart Dustbin QR Scanner
        </h1>
        <p className="text-slate-600 max-w-md mx-auto text-sm">
          Scan the dynamic QR code displayed on the campus Smart Dustbin after depositing waste to claim instant EcoPoints.
        </p>
      </div>

      {/* ── Success Modal / Card ────────────────────────────────────── */}
      {claimSuccess ? (
        <div className="bg-white rounded-3xl p-8 border-2 border-emerald-500 shadow-2xl text-center space-y-6 animate-fade-in max-w-lg mx-auto">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto border border-emerald-200">
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
          </div>

          <div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
              Verified Waste Disposal
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
              +{claimSuccess.pointsAwarded} EcoPoints Awarded!
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {claimSuccess.message}
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Station:</span>
              <span className="font-semibold text-slate-900">{claimSuccess.binName}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Waste Material:</span>
              <span className="font-semibold uppercase text-slate-900">{claimSuccess.wasteType}</span>
            </div>
            <div className="flex justify-between text-slate-600 pt-2 border-t border-slate-200 font-bold">
              <span>New Total Balance:</span>
              <span className="text-emerald-600 font-extrabold">{claimSuccess.totalEcoPoints} pts</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                setClaimSuccess(null);
                setInputCode('');
              }}
              className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition"
            >
              Scan Another Code
            </button>
            <Link
              to="/dashboard"
              className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition flex items-center justify-center space-x-1"
            >
              <span>View Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        /* ── Scanner / Input Card ────────────────────────────────────── */
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm max-w-lg mx-auto space-y-6">
          {/* Tab Switcher */}
          <div className="flex p-1 bg-slate-100 rounded-2xl">
            <button
              onClick={() => handleTabChange('camera')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5 ${
                activeTab === 'camera'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Camera Scanner</span>
            </button>
            <button
              onClick={() => handleTabChange('manual')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5 ${
                activeTab === 'manual'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>Enter Station Code</span>
            </button>
          </div>

          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ── TAB 1: Camera Scanner ──────────────────────────────────── */}
          {activeTab === 'camera' && (
            <div className="space-y-4 text-center">
              <div className="relative w-full h-64 bg-slate-900 rounded-2xl overflow-hidden flex flex-col items-center justify-center border-2 border-slate-800">
                {cameraActive ? (
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                  />
                ) : (
                  <div className="p-6 text-center text-slate-400 space-y-2">
                    <ScanLine className="w-12 h-12 text-emerald-400 mx-auto animate-pulse" />
                    <p className="text-xs">
                      Point camera at the Smart Dustbin display screen
                    </p>
                  </div>
                )}

                {/* Reticle Overlay */}
                <div className="absolute inset-8 border-2 border-dashed border-emerald-400/80 rounded-2xl pointer-events-none flex items-center justify-center">
                  <div className="w-full h-0.5 bg-emerald-400/50 shadow-glow animate-bounce" />
                </div>
              </div>

              {cameraError && (
                <p className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                  {cameraError}
                </p>
              )}

              <div className="flex gap-2">
                {!cameraActive ? (
                  <button
                    onClick={startCamera}
                    className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center space-x-1.5"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Activate Camera</span>
                  </button>
                ) : (
                  <button
                    onClick={stopCamera}
                    className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition"
                  >
                    Stop Camera
                  </button>
                )}

                <button
                  onClick={() => handleTabChange('manual')}
                  className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                >
                  Enter Code
                </button>
              </div>
            </div>
          )}

          {/* ── TAB 2: Manual Code Input ───────────────────────────────── */}
          {activeTab === 'manual' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  6-Digit Station Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={14}
                    placeholder="e.g. ECO-7B8A2"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 font-mono font-bold text-lg text-center tracking-widest rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1 text-center">
                  Shown beneath the QR code on the dustbin's screen
                </p>
              </div>

              <button
                disabled={loading || !inputCode.trim()}
                onClick={() => handleClaim(inputCode)}
                className={`w-full py-3.5 px-6 font-bold text-sm rounded-xl transition flex items-center justify-center space-x-2 ${
                  loading || !inputCode.trim()
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md active:scale-95'
                }`}
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>{loading ? 'Verifying with Smart Bin...' : 'Claim Waste EcoPoints'}</span>
              </button>
            </div>
          )}

          {/* ── Quick Link to Dustbin Kiosk Simulation ─────────────────── */}
          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500 mb-2">
              Testing on campus or in demo mode?
            </p>
            <Link
              to="/smart-bin"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2 rounded-xl transition border border-emerald-200"
            >
              <Trash2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Open Smart Dustbin Kiosk Screen &rarr;</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRScanPage;
