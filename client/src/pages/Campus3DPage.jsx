import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  Trash2,
  Droplets,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import RealCampusPhotoView from '../components/digitalTwin/RealCampusPhotoView';
import { PHOTO_HOTSPOTS } from '../components/digitalTwin/photoHotspotsData';
import { getBuildingTelemetry } from '../api/smartBinApi';

const Campus3DPage = () => {
  // Live IoT Smart Bin building telemetry
  const [buildingTelemetry, setBuildingTelemetry] = useState({});

  useEffect(() => {
    let isMounted = true;
    const fetchTelemetry = async () => {
      try {
        const data = await getBuildingTelemetry();
        if (data.success && data.telemetry && isMounted) {
          setBuildingTelemetry(data.telemetry);
        }
      } catch (err) {
        console.error('Failed to fetch building telemetry:', err);
      }
    };
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 6000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Merge live telemetry into aerial photo hotspots
  const enrichedHotspots = (PHOTO_HOTSPOTS || []).map((spot) => {
    const t = buildingTelemetry[spot.id];
    if (!t) return spot;
    return {
      ...spot,
      binStatus: t.binStatus || spot.binStatus,
      binCount: t.binCount,
      fillLevel: t.fillLevel,
      totalDeposits: t.totalDeposits,
      recentWasteType: t.recentWasteType,
      binId: t.binId,
    };
  });

  // Currently inspected zone
  const [selectedZone, setSelectedZone] = useState(() => PHOTO_HOTSPOTS[0]);

  // Keep selected zone synchronized with latest telemetry
  useEffect(() => {
    if (selectedZone) {
      const updated = enrichedHotspots.find((h) => h.id === selectedZone.id);
      if (
        updated &&
        (updated.totalDeposits !== selectedZone.totalDeposits ||
          updated.binStatus !== selectedZone.binStatus ||
          updated.fillLevel !== selectedZone.fillLevel)
      ) {
        setSelectedZone(updated);
      }
    }
  }, [buildingTelemetry]);

  // Compute aggregate campus numbers from real hotspots
  const totalSolarKw = (enrichedHotspots || [])
    .reduce((acc, z) => acc + (z?.solarOutputKw || 0), 0)
    .toFixed(1);
  const avgEcoScore = enrichedHotspots?.length
    ? Math.round(
        enrichedHotspots.reduce((acc, z) => acc + (z?.ecoScore || 0), 0) /
          enrichedHotspots.length
      )
    : 95;
  const totalWaterSaved = (enrichedHotspots || []).reduce(
    (acc, z) => acc + (z?.waterSavedLiters || 0),
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* ── Top Header & Live Telemetry Summary ───────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Campus Sustainability Map</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Campus Aerial Map &amp; Smart Bins
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Live aerial photography of your college campus with IoT smart dustbin telemetry, fill levels, and instant points.
          </p>
        </div>

        {/* Aggregate Campus Metrics Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="flex items-center justify-center space-x-1 text-xs text-sky-600 font-bold mb-0.5">
              <Zap className="w-3.5 h-3.5" />
              <span>Solar Power</span>
            </div>
            <div className="text-lg font-extrabold text-slate-900">{totalSolarKw} kW</div>
            <div className="text-[10px] text-slate-400">Live Campus Output</div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="flex items-center justify-center space-x-1 text-xs text-emerald-600 font-bold mb-0.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Campus Eco Score</span>
            </div>
            <div className="text-lg font-extrabold text-emerald-600">{avgEcoScore} / 100</div>
            <div className="text-[10px] text-slate-400">Optimal Performance</div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm text-center col-span-2 sm:col-span-1">
            <div className="flex items-center justify-center space-x-1 text-xs text-cyan-600 font-bold mb-0.5">
              <Droplets className="w-3.5 h-3.5" />
              <span>Water Offset</span>
            </div>
            <div className="text-lg font-extrabold text-slate-900">
              {totalWaterSaved.toLocaleString()} L
            </div>
            <div className="text-[10px] text-slate-400">Harvested &amp; Recycled</div>
          </div>
        </div>
      </div>

      {/* ── Real Campus Photo Viewport ────────────────────────────────── */}
      <RealCampusPhotoView
        hotspots={enrichedHotspots}
        selectedZone={selectedZone}
        onSelectZone={(zone) => setSelectedZone(zone)}
      />

      {/* ── Campus Zones Directory ─────────────────────────────────── */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-900">
            Campus Zones ({enrichedHotspots.length})
          </h2>
          <span className="text-xs text-slate-500">
            Click any zone to inspect on the map or open smart bin
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(enrichedHotspots || []).map((zone) => {
            if (!zone) return null;
            const fill = zone.fillLevel !== undefined ? zone.fillLevel : 28;
            const fillBadgeColor =
              fill >= 75
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : fill >= 40
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200';

            return (
              <div
                key={zone.id}
                onClick={() => {
                  setSelectedZone(zone);
                  window.scrollTo({ top: 120, behavior: 'smooth' });
                }}
                className={`p-5 rounded-2xl border transition cursor-pointer shadow-sm flex flex-col justify-between ${
                  selectedZone?.id === zone.id
                    ? 'bg-emerald-50/50 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                <div>
                  {/* Zone Name & Points */}
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-extrabold text-slate-900 text-base">{zone.name}</h3>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      {zone.ecoScore} pts
                    </span>
                  </div>

                  {/* Fill Rate Progress Bar */}
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                      <span className="flex items-center space-x-1">
                        <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>Fill Rate</span>
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${fillBadgeColor}`}>
                        {fill}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
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
                  </div>
                </div>

                {/* Open Bin Button */}
                <div className="mt-5 pt-3 border-t border-slate-100">
                  <Link
                    to={`/smart-bin?binId=${zone.binId || 'BIN-IT-01'}`}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl transition shadow flex items-center justify-center space-x-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Open Bin</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Campus3DPage;
