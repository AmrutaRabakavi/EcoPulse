/**
 * Centralized Emission Factors Configuration
 * Methodology Version: v1.0-DEFRA-EPA-2026
 *
 * All factors are standardized to kg CO2e (carbon dioxide equivalent).
 * References:
 * - UK Government Greenhouse Gas Conversion Factors for Company Reporting (DEFRA 2023/2024)
 * - US EPA GHG Emission Factors for Greenhouse Gas Inventories
 * - Central Electricity Authority (CEA) CO2 Baseline Database
 * - Poore & Nemecek (2018) Science, Food production GHG emissions
 */

export const EMISSION_METHODOLOGY = {
  version: 'v1.0-DEFRA-EPA-2026',
  label: 'Estimated Carbon Footprint Engine',
  disclaimer:
    'Estimates are modeled based on user-provided lifestyle inputs and standardized GHG conversion factors. They do not constitute official certified carbon accounting.',
};

export const EMISSION_FACTORS = {
  // 1. TRANSPORTATION (kg CO2e per passenger-kilometer)
  transport: {
    walk_bicycle: {
      factor: 0.0,
      unit: 'kg CO2e / km',
      reference: 'DEFRA 2023 - Zero direct emissions',
      assumption: 'Human-powered walking or pedal cycling',
    },
    bus_public: {
      factor: 0.089,
      unit: 'kg CO2e / passenger-km',
      reference: 'DEFRA 2023 - Local bus transit average passenger load',
      assumption: 'Municipal/campus diesel and CNG bus averages',
    },
    train_metro: {
      factor: 0.035,
      unit: 'kg CO2e / passenger-km',
      reference: 'DEFRA 2023 - Urban light rail / metro transit',
      assumption: 'Electric urban rail with grid average power',
    },
    two_wheeler: {
      factor: 0.103,
      unit: 'kg CO2e / vehicle-km',
      reference: 'DEFRA 2023 / EPA - Small motorbike / scooter (<125cc)',
      assumption: 'Single passenger gasoline scooter or motorcycle',
    },
    carpool: {
      factor: 0.096,
      unit: 'kg CO2e / passenger-km',
      reference: 'DEFRA 2023 - Average passenger car shared among 2 passengers',
      assumption: 'Average gasoline/diesel car split between 2 commuters',
    },
    car_solo: {
      factor: 0.192,
      unit: 'kg CO2e / vehicle-km',
      reference: 'DEFRA 2023 - Average medium car solo driver',
      assumption: 'Single occupant gasoline vehicle',
    },
  },

  // 2. ELECTRICITY / ENERGY (kg CO2e per kWh)
  electricity: {
    grid_average: {
      factor: 0.72,
      unit: 'kg CO2e / kWh',
      reference: 'CEA Baseline / EPA eGRID Regional Average',
      assumption: 'Grid mix reflecting coal, natural gas, hydro, and renewables',
    },
    renewable_credit_discount: 0.85, // 85% reduction if dorm/campus uses verified solar/renewables
  },

  // 3. WATER (kg CO2e per liter treated and distributed)
  water: {
    municipal_supply: {
      factor: 0.00035, // 0.35 kg CO2e per cubic meter (1000 liters)
      unit: 'kg CO2e / liter',
      reference: 'UK Water Industry Research / DEFRA Water Supply & Treatment',
      assumption: 'Pumping, purification, and wastewater handling energy',
    },
  },

  // 4. FOOD / DIETARY PATTERNS (kg CO2e per week)
  food: {
    vegan: {
      weeklyKgCO2e: 17.5, // ~2.5 kg CO2e / day
      unit: 'kg CO2e / week',
      reference: 'Poore & Nemecek (2018), Scarborough et al. (2014)',
      assumption: '100% plant-based diet excluding all animal products',
    },
    vegetarian: {
      weeklyKgCO2e: 26.6, // ~3.8 kg CO2e / day
      unit: 'kg CO2e / week',
      reference: 'Poore & Nemecek (2018)',
      assumption: 'Includes dairy and eggs, excludes meat and fish',
    },
    pescatarian: {
      weeklyKgCO2e: 32.2, // ~4.6 kg CO2e / day
      unit: 'kg CO2e / week',
      reference: 'Scarborough et al. (2014)',
      assumption: 'Plant-based with fish and dairy, no red meat or poultry',
    },
    omnivore_moderate: {
      weeklyKgCO2e: 45.5, // ~6.5 kg CO2e / day
      unit: 'kg CO2e / week',
      reference: 'DEFRA / Poore & Nemecek (2018)',
      assumption: 'Mixed diet with occasional poultry/meat 2-4 days a week',
    },
    meat_heavy: {
      weeklyKgCO2e: 65.8, // ~9.4 kg CO2e / day
      unit: 'kg CO2e / week',
      reference: 'Scarborough et al. (2014)',
      assumption: 'Daily red meat and poultry consumption',
    },
  },

  // 5. WASTE GENERATION & RECYCLING (kg CO2e per kg unsorted waste)
  waste: {
    landfill_baseline: {
      factor: 1.15,
      unit: 'kg CO2e / kg waste',
      reference: 'EPA WARM Model / DEFRA Commercial & Domestic Waste',
      assumption: 'Methane and degradation from landfill disposal',
    },
    // Recycling habits discount factor applied to waste emissions
    recycling_discounts: {
      never: 0.0,       // 0% discount
      rarely: 0.15,     // 15% discount
      sometimes: 0.35,  // 35% discount
      always: 0.55,     // 55% discount
    },
  },
};
