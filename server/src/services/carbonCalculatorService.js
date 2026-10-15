import {
  EMISSION_FACTORS,
  EMISSION_METHODOLOGY,
} from '../config/emissionFactors.js';

/**
 * Validates carbon footprint inputs
 */
export const validateCarbonInputs = (inputs) => {
  const errors = [];

  if (!inputs || typeof inputs !== 'object') {
    return ['Invalid inputs payload'];
  }

  const { transport, electricity, water, food, waste } = inputs;

  // 1. Transport Validation
  if (!transport) {
    errors.push('Transportation details are required');
  } else {
    const validModes = Object.keys(EMISSION_FACTORS.transport);
    if (!validModes.includes(transport.mode)) {
      errors.push(`Invalid transport mode: ${transport.mode}`);
    }
    if (
      typeof transport.distanceKmPerDay !== 'number' ||
      transport.distanceKmPerDay < 0 ||
      transport.distanceKmPerDay > 500
    ) {
      errors.push('Daily distance must be a number between 0 and 500 km');
    }
    if (
      typeof transport.daysPerWeek !== 'number' ||
      transport.daysPerWeek < 0 ||
      transport.daysPerWeek > 7
    ) {
      errors.push('Days per week must be a number between 0 and 7');
    }
  }

  // 2. Electricity Validation
  if (!electricity) {
    errors.push('Electricity details are required');
  } else {
    const validPeriods = ['weekly_kwh', 'monthly_kwh', 'daily_hours_ac'];
    if (!validPeriods.includes(electricity.billingPeriod)) {
      errors.push(`Invalid electricity billing period: ${electricity.billingPeriod}`);
    }
    if (
      typeof electricity.consumptionValue !== 'number' ||
      electricity.consumptionValue < 0 ||
      electricity.consumptionValue > 5000
    ) {
      errors.push('Electricity consumption must be a number between 0 and 5000');
    }
  }

  // 3. Water Validation
  if (!water) {
    errors.push('Water details are required');
  } else {
    if (
      typeof water.dailyLiters !== 'number' ||
      water.dailyLiters < 0 ||
      water.dailyLiters > 2000
    ) {
      errors.push('Daily water usage must be a number between 0 and 2000 liters');
    }
  }

  // 4. Food Validation
  if (!food) {
    errors.push('Food details are required');
  } else {
    const validDiets = Object.keys(EMISSION_FACTORS.food);
    if (!validDiets.includes(food.dietaryPattern)) {
      errors.push(`Invalid dietary pattern: ${food.dietaryPattern}`);
    }
  }

  // 5. Waste Validation
  if (!waste) {
    errors.push('Waste details are required');
  } else {
    if (
      typeof waste.weeklyWasteKg !== 'number' ||
      waste.weeklyWasteKg < 0 ||
      waste.weeklyWasteKg > 150
    ) {
      errors.push('Weekly waste must be a number between 0 and 150 kg');
    }
    const validRecycling = Object.keys(
      EMISSION_FACTORS.waste.recycling_discounts
    );
    if (!validRecycling.includes(waste.recyclingHabit)) {
      errors.push(`Invalid recycling habit: ${waste.recyclingHabit}`);
    }
  }

  return errors;
};

/**
 * Deterministic calculation engine for personal carbon footprint
 */
export const calculateFootprint = (inputs) => {
  const validationErrors = validateCarbonInputs(inputs);
  if (validationErrors.length > 0) {
    const err = new Error(validationErrors.join('; '));
    err.statusCode = 400;
    throw err;
  }

  const { transport, electricity, water, food, waste } = inputs;

  // --- 1. TRANSPORTATION EMISSIONS ---
  const transportFactor = EMISSION_FACTORS.transport[transport.mode].factor;
  const weeklyTransportKm = transport.distanceKmPerDay * transport.daysPerWeek;
  const transportEmissions = weeklyTransportKm * transportFactor;

  // --- 2. ELECTRICITY / ENERGY EMISSIONS ---
  let weeklyKWh = 0;
  if (electricity.billingPeriod === 'weekly_kwh') {
    weeklyKWh = electricity.consumptionValue;
  } else if (electricity.billingPeriod === 'monthly_kwh') {
    weeklyKWh = electricity.consumptionValue / 4.33; // average weeks per month
  } else if (electricity.billingPeriod === 'daily_hours_ac') {
    // Standard ~1.2 kW AC unit
    weeklyKWh = electricity.consumptionValue * 1.2 * 7;
  }

  let electricityEmissions =
    weeklyKWh * EMISSION_FACTORS.electricity.grid_average.factor;

  if (electricity.hasRenewableSolar) {
    const discount =
      EMISSION_FACTORS.electricity.renewable_credit_discount;
    electricityEmissions = electricityEmissions * (1 - discount);
  }

  // --- 3. WATER EMISSIONS ---
  const weeklyWaterLiters = water.dailyLiters * 7;
  const waterEmissions =
    weeklyWaterLiters * EMISSION_FACTORS.water.municipal_supply.factor;

  // --- 4. FOOD EMISSIONS ---
  const foodEmissions =
    EMISSION_FACTORS.food[food.dietaryPattern].weeklyKgCO2e;

  // --- 5. WASTE EMISSIONS ---
  const recyclingDiscount =
    EMISSION_FACTORS.waste.recycling_discounts[waste.recyclingHabit] || 0.0;
  const baseWasteEmissions =
    waste.weeklyWasteKg * EMISSION_FACTORS.waste.landfill_baseline.factor;
  const wasteEmissions = baseWasteEmissions * (1 - recyclingDiscount);

  // --- TOTALS & BREAKDOWN ---
  const breakdownRaw = {
    transport: Number(transportEmissions.toFixed(2)),
    electricity: Number(electricityEmissions.toFixed(2)),
    water: Number(waterEmissions.toFixed(2)),
    food: Number(foodEmissions.toFixed(2)),
    waste: Number(wasteEmissions.toFixed(2)),
  };

  const totalWeeklyKgCO2e = Number(
    (
      breakdownRaw.transport +
      breakdownRaw.electricity +
      breakdownRaw.water +
      breakdownRaw.food +
      breakdownRaw.waste
    ).toFixed(2)
  );

  const annualEstimateKgCO2e = Number(
    (totalWeeklyKgCO2e * 52).toFixed(1)
  );

  // Calculate percentages
  const percentages = {};
  for (const [cat, val] of Object.entries(breakdownRaw)) {
    percentages[cat] =
      totalWeeklyKgCO2e > 0
        ? Number(((val / totalWeeklyKgCO2e) * 100).toFixed(1))
        : 0;
  }

  // Determine highest-impact category
  let highestImpactCategory = 'food';
  let highestVal = -1;
  for (const [cat, val] of Object.entries(breakdownRaw)) {
    if (val > highestVal) {
      highestVal = val;
      highestImpactCategory = cat;
    }
  }

  // Reduction suggestions tailored to student lifestyle
  const suggestions = generateReductionSuggestions(
    highestImpactCategory,
    breakdownRaw,
    inputs
  );

  return {
    totalWeeklyKgCO2e,
    annualEstimateKgCO2e,
    breakdown: breakdownRaw,
    percentages,
    highestImpactCategory,
    suggestions,
    methodologyVersion: EMISSION_METHODOLOGY.version,
    disclaimer: EMISSION_METHODOLOGY.disclaimer,
  };
};

/**
 * Generate practical reduction recommendations based on student's footprint
 */
function generateReductionSuggestions(highestCat, breakdown, inputs) {
  const tips = [];

  if (highestCat === 'transport' || breakdown.transport > 15) {
    tips.push({
      category: 'transport',
      title: 'Shift to Campus Transit or Cycling',
      tip: 'Walking, bicycling, or using the campus shuttle can cut up to 80% of your weekly transit footprint.',
    });
  }

  if (highestCat === 'food' || breakdown.food > 30) {
    tips.push({
      category: 'food',
      title: 'Embrace "Meatless Mondays"',
      tip: 'Replacing just 2 meat-based meals a week with plant-based alternatives reduces weekly food emissions by ~10–15 kg CO2e.',
    });
  }

  if (highestCat === 'electricity' || breakdown.electricity > 15) {
    tips.push({
      category: 'electricity',
      title: 'Optimize Dorm Energy Usage',
      tip: 'Setting your dorm air conditioner to 24°C instead of 18°C saves approximately 30% on cooling power.',
    });
  }

  if (highestCat === 'waste' || breakdown.waste > 8) {
    tips.push({
      category: 'waste',
      title: 'Segregate Plastic and Paper',
      tip: 'Deposit sorted plastics and paper at campus eco-stations to avoid landfill methane emissions.',
    });
  }

  if (breakdown.water > 0.5) {
    tips.push({
      category: 'water',
      title: 'Mindful Shower & Tap Habits',
      tip: 'Limiting showers to 5 minutes conserves ~40 liters of treated campus water daily.',
    });
  }

  return tips.slice(0, 3);
}
