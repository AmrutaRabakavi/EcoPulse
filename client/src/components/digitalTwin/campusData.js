/**
 * @file campusData.js
 * @desc Coordinates, dimensions, and sustainability telemetry for the 3D Green Campus Digital Twin.
 */

export const CAMPUS_ZONES = [
  {
    id: 'library',
    name: 'Central Library & Solar Array',
    category: 'Renewable Energy',
    position: [0, 2, 0], // Center building
    size: [6, 4, 8],
    color: '#0284c7', // Sky blue
    accentColor: '#38bdf8',
    beaconColor: '#10b981', // Emerald
    healthStatus: 'OPTIMAL',
    ecoScore: 96,
    hasSolar: true,
    hasBins: true,
    solarOutputKw: 48.5,
    dailySolarKwh: 312,
    binStatus: '3 Smart Bins • 34% Average Fill',
    waterSavedLiters: 1240,
    initiativesCount: 4,
    description:
      'Equipped with 140 rooftop photovoltaic solar panels providing 100% of daytime lighting and climate control with live battery telemetry.',
    features: [
      'Rooftop Solar Array (140 Photovoltaic Panels)',
      'Smart Hydration Refill Station (Floor 1)',
      'High-Efficiency Daylight Dimming Sensors',
    ],
  },
  {
    id: 'academic',
    name: 'Engineering & Academic Block A',
    category: 'Energy Efficiency',
    position: [-13, 2.5, -6],
    size: [8, 5, 7],
    color: '#334155', // Slate
    accentColor: '#64748b',
    beaconColor: '#10b981',
    healthStatus: 'OPTIMAL',
    ecoScore: 91,
    hasSolar: true,
    hasBins: true,
    solarOutputKw: 28.2,
    dailySolarKwh: 184,
    binStatus: '4 Smart Bins • 41% Average Fill',
    waterSavedLiters: 890,
    initiativesCount: 3,
    description:
      'Main lecture complex with automated daylight sensors, occupancy heat recovery ventilation, and dedicated e-waste dropoff.',
    features: [
      'Smart HVAC Occupancy Heat Recovery',
      'E-Waste & Battery Recycling Depot',
      'Sheltered Bicycle Commuter Hub (60 spots)',
    ],
  },
  {
    id: 'student_center',
    name: 'Student Center & Food Court',
    category: 'Zero Waste & Organics',
    position: [13, 1.75, -5],
    size: [7.5, 3.5, 7],
    color: '#059669', // Emerald
    accentColor: '#34d399',
    beaconColor: '#f59e0b', // Amber alert
    healthStatus: 'MODERATE',
    ecoScore: 84,
    hasSolar: false,
    hasBins: true,
    solarOutputKw: 0,
    dailySolarKwh: 0,
    binStatus: '6 Smart Bins • 68% Fill (Collection Scheduled)',
    waterSavedLiters: 2100,
    initiativesCount: 5,
    description:
      'Central campus dining hub running an active compost diversion program and reusable container deposit exchange.',
    features: [
      'Commercial Food Waste Composter (Daily Output)',
      'Reusable OZZI Takeout Container System',
      'IoT Smart Bins with Dynamic QR Claim Displays',
    ],
  },
  {
    id: 'science_complex',
    name: 'Science & Advanced Research Labs',
    category: 'Green Chemistry',
    position: [-11, 2.25, 10],
    size: [7, 4.5, 6],
    color: '#4f46e5', // Indigo
    accentColor: '#818cf8',
    beaconColor: '#10b981',
    healthStatus: 'OPTIMAL',
    ecoScore: 89,
    hasSolar: true,
    hasBins: true,
    solarOutputKw: 31.4,
    dailySolarKwh: 205,
    binStatus: '2 Smart Bins • 28% Average Fill',
    waterSavedLiters: 3400,
    initiativesCount: 2,
    description:
      'State-of-the-art laboratory wing with closed-loop water chillers, chemical neutralization, and smart exhaust recapture.',
    features: [
      'Closed-Loop Lab Equipment Water Recirculation',
      'Green Chemistry Solvent Recovery Plant',
      'Variable Air Volume (VAV) Smart Fume Hoods',
    ],
  },
  {
    id: 'hostels',
    name: 'Eco-Living Residence Halls',
    category: 'Water & Living',
    position: [14, 3, 9],
    size: [6.5, 6, 8],
    color: '#b45309', // Amber-700
    accentColor: '#f59e0b',
    beaconColor: '#10b981',
    healthStatus: 'OPTIMAL',
    ecoScore: 93,
    hasSolar: true,
    hasBins: true,
    solarOutputKw: 19.8,
    dailySolarKwh: 130,
    binStatus: '5 Smart Bins • 39% Average Fill',
    waterSavedLiters: 4800,
    initiativesCount: 6,
    description:
      'Dormitory complex equipped with solar water heaters, greywater toilet flushing, and floor-by-floor recycling competitions.',
    features: [
      '100% Rooftop Solar Water Heating System',
      'Sub-Surface Greywater Recycling Filter',
      'Inter-Dormitory Energy Cup Competitions',
    ],
  },
  {
    id: 'sports_arena',
    name: 'Sports Complex & Athletic Field',
    category: 'Rainwater & Fitness',
    position: [0, 1.5, 16],
    size: [11, 3, 7.5],
    color: '#0f766e', // Teal-700
    accentColor: '#2dd4bf',
    beaconColor: '#10b981',
    healthStatus: 'OPTIMAL',
    ecoScore: 95,
    hasSolar: true,
    hasBins: true,
    solarOutputKw: 22.0,
    dailySolarKwh: 145,
    binStatus: '3 Smart Bins • 22% Average Fill',
    waterSavedLiters: 5200,
    initiativesCount: 3,
    description:
      'Olympic-grade athletic facility featuring an underground 50,000-liter rainwater harvesting cistern and solar floodlights.',
    features: [
      '50,000-Liter Rainwater Cistern for Field Irrigation',
      'Solar-Powered LED Stadium Floodlights',
      'Kinetic Generation Cardio Equipment',
    ],
  },
  {
    id: 'eco_hub',
    name: 'Central Eco-Hub & Recycling Facility',
    category: 'IoT Waste Hub',
    position: [0, 1.4, -14],
    size: [5.5, 2.8, 5.5],
    color: '#15803d', // Green-700
    accentColor: '#4ade80',
    beaconColor: '#10b981',
    healthStatus: 'OPTIMAL',
    ecoScore: 98,
    hasSolar: true,
    hasBins: true,
    solarOutputKw: 12.5,
    dailySolarKwh: 80,
    binStatus: 'Main Depot • Zero Overflow Active Sorting',
    waterSavedLiters: 750,
    initiativesCount: 4,
    description:
      'Campus material recovery facility where student-collected plastics, compost, and e-waste are sorted and prepared for upcycling.',
    features: [
      'Smart Dustbin Fleet Central Telemetry Server',
      'Plastic Shredder & 3D Filament Extruder',
      'Student Upcycling Workshop & Tool Lending Library',
    ],
  },
];
