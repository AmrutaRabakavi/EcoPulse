import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  RefreshCw,
  QrCode,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  getCampusBins,
  detectWaste,
  getDepositStatus,
  claimWastePoints,
} from '../api/smartBinApi';
import QRCodeDisplay from '../components/common/QRCodeDisplay';
import { useAuth } from '../context/AuthContext';

const WASTE_CATEGORIES = [
  { id: 'plastic', label: 'Plastic Bottle / Cup', points: 25, icon: '🥤', color: 'emerald' },
  { id: 'metal', label: 'Aluminum Can / Foil', points: 30, icon: '🥫', color: 'sky' },
  { id: 'paper', label: 'Paper / Cardboard', points: 20, icon: '📦', color: 'amber' },
  { id: 'organic', label: 'Food / Compostable', points: 15, icon: '🍎', color: 'lime' },
  { id: 'general', label: 'Non-Recyclable Waste', points: 10, icon: '🗑️', color: 'slate' },
];

const SmartBinKioskPage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const queryBinId = searchParams.get('binId');
  const [bins, setBins] = useState([]);
  const [selectedBinId, setSelectedBinId] = useState('BIN-IT-01');
  const [selectedWasteType, setSelectedWasteType] = useState('plastic');
  
  // Kiosk Lifecycle State: 'IDLE' | 'DETECTING' | 'QR_ACTIVE' | 'CLAIMED' | 'EXPIRED'
  const [kioskState, setKioskState] = useState('IDLE');
  const [activeDeposit, setActiveDeposit] = useState(null);
  const [claimedStudentName, setClaimedStudentName] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [isSelfClaiming, setIsSelfClaiming] = useState(false);

  // Simulated bin fill level
  const [fillLevel, setFillLevel] = useState(28);

  const pollIntervalRef = useRef(null);

  // Load campus bins on mount
  useEffect(() => {
    const loadBins = async () => {
      try {
        const data = await getCampusBins();
        if (data.success && data.bins.length > 0) {
          setBins(data.bins);
          const matched = queryBinId ? data.bins.find(b => b.binId === queryBinId) : null;
          const initialBin = matched || data.bins[0];
          setSelectedBinId(initialBin.binId);
          if (initialBin.baseFillPercent) {
            setFillLevel(initialBin.baseFillPercent);
          }
        }
      } catch (err) {
        console.error('Failed to load bins:', err);
      }
    };
    loadBins();
  }, [queryBinId]);

  const handleSelectBin = (binId) => {
    setSelectedBinId(binId);
    const target = bins.find((b) => b.binId === binId);
    if (target?.baseFillPercent) {
      setFillLevel(target.baseFillPercent);
    }
  };

  // Poll status while QR is active
  useEffect(() => {
    if (kioskState !== 'QR_ACTIVE' || !activeDeposit?.token) {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      return;
    }

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await getDepositStatus(activeDeposit.token);
        if (res.status === 'CLAIMED') {
          clearInterval(pollIntervalRef.current);
          setKioskState('CLAIMED');
          setClaimedStudentName(res.claimedBy?.fullName || 'Student');
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });

          // Auto reset to idle after 6 seconds
          setTimeout(() => {
            setKioskState('IDLE');
            setActiveDeposit(null);
          }, 6000);
        } else if (res.status === 'EXPIRED') {
          clearInterval(pollIntervalRef.current);
          setKioskState('EXPIRED');
        }
      } catch (err) {
        console.error('Status poll error:', err);
      }
    }, 2000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [kioskState, activeDeposit]);

  const handleSimulateWasteDrop = async () => {
    setErrorMsg(null);
    setKioskState('DETECTING');

    // Play lid opening and sensor detection delay
    setTimeout(async () => {
      try {
        const data = await detectWaste(selectedBinId, selectedWasteType);
        if (data.success) {
          setActiveDeposit(data.deposit);
          setFillLevel((prev) => Math.min(95, prev + 2));
          setKioskState('QR_ACTIVE');
        } else {
          setErrorMsg(data.message || 'Sensor detection failed.');
          setKioskState('IDLE');
        }
      } catch (err) {
        setErrorMsg(err.response?.data?.message || 'Failed to communicate with dustbin sensor.');
        setKioskState('IDLE');
      }
    }, 1200);
  };

  const handleSelfClaim = async () => {
    if (!activeDeposit?.token) return;
    setIsSelfClaiming(true);
    setErrorMsg(null);

    try {
      const res = await claimWastePoints({ token: activeDeposit.token });
      if (res.success) {
        setKioskState('CLAIMED');
        setClaimedStudentName(user?.fullName || 'You');
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
        setTimeout(() => {
          setKioskState('IDLE');
          setActiveDeposit(null);
        }, 6000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to claim points.');
    } finally {
      setIsSelfClaiming(false);
    }
  };

  const selectedCategoryObj =
    WASTE_CATEGORIES.find((c) => c.id === selectedWasteType) || WASTE_CATEGORIES[0];
  const selectedBinObj = bins.find((b) => b.binId === selectedBinId);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* ── Top Header & Location Selector ────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold mb-2">
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            <span>IoT Smart Dustbin Telemetry Station</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Smart Dustbin & QR Kiosk
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Simulates a campus smart bin: detects waste deposits in real time, displays single-use QR codes, and awards instant EcoPoints.
          </p>
        </div>

        {/* Station Location Selector */}
        <div className="flex flex-col sm:items-end gap-2">
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1 sm:text-right">
              Campus Building Station
            </label>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <select
                value={selectedBinId}
                disabled={kioskState === 'QR_ACTIVE'}
                onChange={(e) => handleSelectBin(e.target.value)}
                className="bg-slate-50 border border-slate-300 text-slate-800 text-sm font-bold rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {bins.map((b) => (
                  <option key={b.binId} value={b.binId}>
                    {b.buildingName ? `${b.buildingName} — ${b.name}` : b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Link
            to="/campus-3d"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition shadow-sm"
          >
            <span>🗺️ View on Campus Aerial Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-2xl flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ── Main Kiosk Display Grid ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Smart Bin Hardware Simulator */}
        <div className="lg:col-span-6 bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono tracking-wider text-slate-400 uppercase">
                Sensor ID: {selectedBinId}
              </span>
            </div>
            <span className="text-xs font-medium text-slate-400">
              Ultrasonic Distance: {100 - fillLevel} cm
            </span>
          </div>

          {/* Animated 3D Bin Graphic */}
          <div className="my-8 flex flex-col items-center">
            <div className="relative w-44 h-56 flex flex-col items-center justify-end">
              {/* Bin Lid (Animates on drop) */}
              <div
                className={`w-36 h-6 bg-emerald-600 rounded-t-xl border-t-2 border-emerald-400 transition-all duration-700 shadow-md ${
                  kioskState === 'DETECTING'
                    ? '-translate-y-8 -rotate-12 bg-emerald-400'
                    : 'translate-y-0 rotate-0'
                }`}
              />

              {/* Bin Body */}
              <div className="w-32 h-44 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 rounded-b-2xl border-2 border-slate-600 relative overflow-hidden flex flex-col justify-end p-2 shadow-2xl">
                {/* Waste Level Liquid Fill */}
                <div
                  className="w-full bg-emerald-500/30 border-t-2 border-emerald-400/80 rounded-b-xl transition-all duration-1000 flex items-center justify-center text-[10px] font-mono text-emerald-300 font-bold"
                  style={{ height: `${fillLevel}%` }}
                >
                  {fillLevel}% Full
                </div>

                {/* EcoPulse Emblem on Bin */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-40">
                  <Trash2 className="w-10 h-10 text-emerald-400 mb-1" />
                  <span className="text-[10px] tracking-widest font-extrabold uppercase">
                    EcoPulse
                  </span>
                </div>
              </div>
            </div>

            {/* Sensor Status Indicator */}
            <div className="mt-4 text-center">
              {kioskState === 'DETECTING' && (
                <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-amber-500/20 text-amber-300 rounded-full text-xs font-bold animate-pulse border border-amber-500/40">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Ultrasonic Sensor: Detecting Object...</span>
                </div>
              )}
              {kioskState === 'QR_ACTIVE' && (
                <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold border border-emerald-500/40">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Waste Verified &bull; Single-Use QR Ready</span>
                </div>
              )}
              {kioskState === 'IDLE' && (
                <span className="text-xs text-slate-400">
                  Bin ready &bull; Ultrasonic proximity sensor active
                </span>
              )}
            </div>
          </div>

          {/* Waste Category Selection */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <span className="text-xs font-bold text-slate-300 block">
              Select Waste Deposited:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {WASTE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  disabled={kioskState !== 'IDLE'}
                  onClick={() => setSelectedWasteType(cat.id)}
                  className={`p-2.5 rounded-xl border text-left text-xs font-medium transition flex items-center space-x-2 ${
                    selectedWasteType === cat.id
                      ? 'bg-emerald-600/30 border-emerald-500 text-white shadow-sm'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                  } ${kioskState !== 'IDLE' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className="text-base">{cat.icon}</span>
                  <div>
                    <div className="font-bold truncate text-[11px]">{cat.label}</div>
                    <div className="text-[10px] text-emerald-400 font-bold">
                      +{cat.points} pts
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Drop Waste Trigger Button */}
            <button
              disabled={kioskState !== 'IDLE'}
              onClick={handleSimulateWasteDrop}
              className={`w-full mt-4 py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 transition shadow-lg ${
                kioskState === 'IDLE'
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold cursor-pointer active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Trash2 className="w-5 h-5" />
              <span>
                {kioskState === 'DETECTING'
                  ? 'Sensor Scanning...'
                  : kioskState === 'QR_ACTIVE'
                  ? 'Awaiting Student Scan'
                  : `Throw In ${selectedCategoryObj.label}`}
              </span>
            </button>
          </div>
        </div>

        {/* Right Column: Dynamic Screen Display (QR Code / Claimed / Expired) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl flex flex-col items-center justify-center min-h-[520px] text-center">
          {kioskState === 'IDLE' && (
            <div className="space-y-4 max-w-sm">
              <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-3xl flex items-center justify-center mx-auto border border-slate-200">
                <QrCode className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">
                Smart Screen Standby
              </h3>
              <p className="text-sm text-slate-500">
                When waste is thrown into the dustbin, the ultrasonic sensor triggers and a dynamic single-use QR code appears here for 60 seconds.
              </p>
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs text-emerald-800 font-medium">
                Tip: Click <strong>"Throw In Waste"</strong> on the left panel to test the live IoT detection workflow!
              </div>
            </div>
          )}

          {kioskState === 'DETECTING' && (
            <div className="space-y-4">
              <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto" />
              <h3 className="text-lg font-bold text-slate-900">
                Sensor Analyzing Waste...
              </h3>
              <p className="text-xs text-slate-500">
                Verifying material density &amp; generating secure disposal token...
              </p>
            </div>
          )}

          {kioskState === 'QR_ACTIVE' && activeDeposit && (
            <div className="w-full space-y-4">
              <QRCodeDisplay
                code={activeDeposit.depositCode}
                token={activeDeposit.token}
                points={activeDeposit.points}
                expiresAt={activeDeposit.expiresAt}
                durationSeconds={activeDeposit.durationSeconds}
                onExpired={() => setKioskState('EXPIRED')}
              />

              <div className="max-w-sm mx-auto space-y-2">
                <p className="text-xs text-slate-500">
                  Open <strong>EcoPulse QR Scanner</strong> on your phone to scan, or test directly:
                </p>

                {/* 1-Click Test Claim Button for Evaluator */}
                {user ? (
                  <button
                    disabled={isSelfClaiming}
                    onClick={handleSelfClaim}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center space-x-1.5"
                  >
                    {isSelfClaiming ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    <span>
                      {isSelfClaiming
                        ? 'Claiming...'
                        : `Quick Claim (+${activeDeposit.points} pts for ${user.fullName.split(' ')[0]})`}
                    </span>
                  </button>
                ) : (
                  <Link
                    to={`/login?redirect=/qr-scan?code=${activeDeposit.depositCode}`}
                    className="inline-block text-xs font-bold text-emerald-600 hover:underline"
                  >
                    Sign in to claim points on this browser &rarr;
                  </Link>
                )}

                <Link
                  to={`/qr-scan?code=${activeDeposit.depositCode}&token=${activeDeposit.token}`}
                  className="block text-xs text-slate-500 hover:text-slate-800 underline"
                >
                  Open Dedicated Mobile Scanner View
                </Link>
              </div>
            </div>
          )}

          {kioskState === 'CLAIMED' && (
            <div className="space-y-4 max-w-sm animate-fade-in">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-700 rounded-3xl flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-12 h-12 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900">
                Points Claimed!
              </h3>
              <p className="text-sm text-slate-600">
                Thank you, <span className="font-bold text-slate-900">{claimedStudentName}</span>!
                <br />
                Your responsible waste disposal has been verified by the IoT smart bin.
              </p>
              <div className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-50 text-emerald-800 font-extrabold rounded-full text-sm border border-emerald-200">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>+{activeDeposit?.points || 25} EcoPoints Credited</span>
              </div>
              <p className="text-xs text-slate-400 mt-4">
                Returning to standby screen in 5 seconds...
              </p>
            </div>
          )}

          {kioskState === 'EXPIRED' && (
            <div className="space-y-4 max-w-sm">
              <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mx-auto border border-rose-100">
                <Clock className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                QR Code Expired
              </h3>
              <p className="text-sm text-slate-500">
                The 60-second claim window has expired to prevent unauthorized re-use.
              </p>
              <button
                onClick={() => setKioskState('IDLE')}
                className="py-2.5 px-6 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
              >
                Reset Standby Screen
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartBinKioskPage;
