import React from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  Zap,
  Trash2,
  Droplets,
  Users,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Compass,
} from 'lucide-react';

const ZoneDetailsHUD = ({ zone, onClose, onFocus }) => {
  if (!zone) return null;

  const fill = zone.fillLevel || 28;
  const fillBadgeColor =
    fill >= 75
      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
      : fill >= 40
      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';

  return (
    <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 text-white rounded-3xl p-6 shadow-2xl max-w-sm w-full animate-fade-in relative z-20">
      {/* ── Top Header: Name & Points ─────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-1 rounded-full border border-emerald-500/30">
            {zone.ecoScore} pts
          </span>
          <h2 className="text-xl font-extrabold text-white mt-2 leading-snug">
            {zone.name}
          </h2>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* ── Fill Rate Card ──────────────────────────────────────────── */}
      <div className="my-5 p-4 bg-slate-800/90 rounded-2xl border border-slate-700/70 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
            <Trash2 className="w-4 h-4" />
            <span>Fill Rate</span>
          </div>
          <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${fillBadgeColor}`}>
            {fill}% Full
          </span>
        </div>

        <div className="w-full bg-slate-700/60 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              fill >= 75
                ? 'bg-rose-500'
                : fill >= 40
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${fill}%` }}
          />
        </div>

        <div className="text-[11px] text-slate-400 flex items-center justify-between">
          <span>{zone.binCount || 3} Smart Bins</span>
          {zone.totalDeposits !== undefined && zone.totalDeposits > 0 && (
            <span className="text-emerald-400 font-semibold">
              {zone.totalDeposits} {zone.totalDeposits === 1 ? 'waste drop' : 'waste drops'} logged
            </span>
          )}
        </div>
      </div>

      {/* ── Open Bin Action ─────────────────────────────────────────── */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
        <Link
          to={`/smart-bin?binId=${zone.binId || 'BIN-IT-01'}`}
          className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold rounded-xl transition shadow flex items-center justify-center space-x-2"
        >
          <Trash2 className="w-4 h-4" />
          <span>Open Bin</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        <button
          onClick={onFocus}
          className="py-3 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition flex items-center justify-center"
          title="Center on Map"
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ZoneDetailsHUD;
