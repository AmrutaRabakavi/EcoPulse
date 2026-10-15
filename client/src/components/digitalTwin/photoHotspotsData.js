import { Zap, Droplets, Trees, Sparkles } from 'lucide-react';

export const PHOTO_HOTSPOTS = [
  {
    id: 'it_block',
    name: 'IT Block',
    category: 'IT Block',
    coords: { x: 52, y: 67 }, // Front building with visible rooftop solar
    icon: Zap,
    color: '#0284c7', // Sky
    beaconColor: '#10b981', // Emerald
    healthStatus: 'OPTIMAL',
    ecoScore: 97,
    solarOutputKw: 58.4,
    dailySolarKwh: 380,
    binStatus: '3 Smart Bins • 28% Fill',
    waterSavedLiters: 1420,
    initiativesCount: 4,
    binId: 'BIN-IT-01',
    fillLevel: 28,
  },
  {
    id: 'main_building',
    name: 'Main Building',
    category: 'Main Building',
    coords: { x: 35, y: 35 }, // Long complex behind IT Block
    icon: Zap,
    color: '#0d9488', // Teal
    beaconColor: '#10b981',
    healthStatus: 'OPTIMAL',
    ecoScore: 95,
    solarOutputKw: 64.0,
    dailySolarKwh: 410,
    binStatus: '4 Smart Bins • 35% Fill',
    waterSavedLiters: 1890,
    initiativesCount: 3,
    binId: 'BIN-MAIN-02',
    fillLevel: 35,
  },
  {
    id: 'library',
    name: 'Library',
    category: 'Library',
    coords: { x: 67, y: 52 }, // Central building with courtyard
    icon: Sparkles,
    color: '#475569', // Slate
    beaconColor: '#10b981',
    healthStatus: 'OPTIMAL',
    ecoScore: 93,
    solarOutputKw: 18.2,
    dailySolarKwh: 120,
    binStatus: '5 Smart Bins • 42% Fill',
    waterSavedLiters: 2350,
    initiativesCount: 5,
    binId: 'BIN-LIB-01',
    fillLevel: 42,
  },
  {
    id: 'ground',
    name: 'College Ground',
    category: 'Ground',
    coords: { x: 15, y: 28 }, // Sports ground on the left
    icon: Droplets,
    color: '#ea580c', // Orange
    beaconColor: '#10b981',
    healthStatus: 'OPTIMAL',
    ecoScore: 92,
    solarOutputKw: 12.0,
    dailySolarKwh: 75,
    binStatus: '2 Smart Bins • 19% Fill',
    waterSavedLiters: 6400,
    initiativesCount: 2,
    binId: 'BIN-GRD-04',
    fillLevel: 19,
  },
  {
    id: 'near_temple',
    name: 'Near Temple',
    category: 'Near Temple',
    coords: { x: 8, y: 49 }, // Temple on the far left edge
    icon: Trees,
    color: '#15803d', // Green
    beaconColor: '#10b981',
    healthStatus: 'OPTIMAL',
    ecoScore: 99,
    solarOutputKw: 0,
    dailySolarKwh: 0,
    binStatus: 'Organic Composting Bins Active',
    waterSavedLiters: 3100,
    initiativesCount: 6,
    binId: 'BIN-TMP-05',
    fillLevel: 15,
  },
];
