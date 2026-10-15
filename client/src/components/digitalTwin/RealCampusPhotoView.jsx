import React, { useState } from 'react';
import {
  MapPin,
  Zap,
  Trash2,
  Sparkles,
  Droplets,
  Trees,
  Upload,
  Eye,
  Info,
  Maximize2,
} from 'lucide-react';
import ZoneDetailsHUD from './ZoneDetailsHUD';
import { PHOTO_HOTSPOTS } from './photoHotspotsData';

export { PHOTO_HOTSPOTS };

const RealCampusPhotoView = ({ hotspots = PHOTO_HOTSPOTS, selectedZone, onSelectZone }) => {
  const [photoUrl, setPhotoUrl] = useState('/campus.webp');
  const [showLabels, setShowLabels] = useState(true);
  const [hoveredHotspot, setHoveredHotspot] = useState(null);

  const handleCustomPhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const tempUrl = URL.createObjectURL(file);
      setPhotoUrl(tempUrl);
    }
  };

  return (
    <div className="relative w-full h-[640px] bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col justify-between">
      {/* ── Main Aerial Image Canvas with Interactive Hotspots ──────── */}
      <div className="relative w-full h-full overflow-hidden flex items-center justify-center bg-slate-950">
        <img
          src={photoUrl}
          alt="Real College Campus Aerial View"
          className="w-full h-full object-cover select-none transition-transform duration-700"
          onError={(e) => {
            // Fallback to jpg if webp fails
            if (photoUrl !== '/campus.jpg') {
              setPhotoUrl('/campus.jpg');
            }
          }}
        />

        {/* Subtle Dark Vignette for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/60 pointer-events-none" />

        {/* ── Overlaid Interactive Hotspot Pins ─────────────────────── */}
        {(hotspots || []).map((spot) => {
          if (!spot || !spot.coords) return null;
          const isSelected = selectedZone?.id === spot.id;
          const isHovered = hoveredHotspot?.id === spot.id;
          const Icon = spot.icon || Zap;

          return (
            <div
              key={spot.id}
              style={{
                left: `${spot.coords.x}%`,
                top: `${spot.coords.y}%`,
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group"
            >
              {/* Pulsing Beacon Halo */}
              <div
                className={`absolute inset-0 rounded-full animate-ping opacity-75 ${
                  isSelected ? 'bg-emerald-400 scale-150' : 'bg-sky-400'
                }`}
              />

              {/* Clickable Pin Button */}
              <button
                onClick={() => onSelectZone(spot)}
                onMouseEnter={() => setHoveredHotspot(spot)}
                onMouseLeave={() => setHoveredHotspot(null)}
                className={`relative p-2 rounded-2xl shadow-xl transition-all duration-300 flex items-center justify-center border-2 ${
                  isSelected
                    ? 'bg-emerald-500 border-white text-slate-950 scale-125 ring-4 ring-emerald-500/40'
                    : 'bg-slate-900/90 border-emerald-400 text-emerald-400 hover:scale-115 hover:bg-emerald-600 hover:text-white'
                }`}
                title={spot.name}
              >
                <Icon className="w-4 h-4" />
              </button>

              {/* Pin Label Card (Always shown or on hover) */}
              {(showLabels || isHovered || isSelected) && (
                <div
                  onClick={() => onSelectZone(spot)}
                  className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap shadow-xl transition pointer-events-auto cursor-pointer border backdrop-blur-md ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 border-white ring-2 ring-emerald-400/50'
                      : 'bg-slate-900/90 text-white border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  <span>{spot.name}</span>
                </div>
              )}
            </div>
          );
        })}

        {/* ── Top-Left View Controls ─────────────────────────────────── */}
        <div className="absolute top-4 left-4 z-30 flex items-center space-x-2">
          <div className="px-3 py-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Actual Campus Aerial Photography</span>
          </div>

          <button
            onClick={() => setShowLabels((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-md backdrop-blur-md border ${
              showLabels
                ? 'bg-emerald-600/90 text-white border-emerald-500'
                : 'bg-slate-900/80 text-slate-400 border-slate-700'
            }`}
          >
            {showLabels ? 'Labels: ON' : 'Labels: OFF'}
          </button>

          {/* Upload New Photo Button */}
          <label className="px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md border border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-md cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span>Upload Photo</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleCustomPhotoUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* ── Bottom-Left Tip ────────────────────────────────────────── */}
        <div className="absolute bottom-4 left-4 z-30 hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-slate-900/80 backdrop-blur-md border border-slate-800 text-slate-300 text-[11px] rounded-xl pointer-events-none">
          <Info className="w-3.5 h-3.5 text-emerald-400" />
          <span>Click any glowing building pin to inspect live solar output &amp; eco metrics</span>
        </div>

        {/* ── Floating Building Detail Inspector HUD ─────────────────── */}
        {selectedZone && (
          <div className="absolute bottom-4 right-4 z-30 max-h-[580px] overflow-y-auto">
            <ZoneDetailsHUD
              zone={selectedZone}
              onClose={() => onSelectZone(null)}
              onFocus={() => onSelectZone({ ...selectedZone })}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RealCampusPhotoView;
