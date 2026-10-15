import assert from 'node:assert/strict';
import {
  calculateFootprint,
  validateCarbonInputs,
} from '../src/services/carbonCalculatorService.js';
import { EMISSION_FACTORS } from '../src/config/emissionFactors.js';

console.log('--- STARTING CARBON CALCULATION ENGINE UNIT TESTS ---');

// Test 1: Validation - missing fields
const errors1 = validateCarbonInputs({});
assert(errors1.length > 0, 'Should return validation errors for empty input');
console.log('✓ Test 1: Empty input rejection passed');

// Test 2: Validation - negative values
const errors2 = validateCarbonInputs({
  transport: { mode: 'bus_public', distanceKmPerDay: -10, daysPerWeek: 5 },
  electricity: { billingPeriod: 'weekly_kwh', consumptionValue: 20 },
  water: { dailyLiters: 100 },
  food: { dietaryPattern: 'vegetarian' },
  waste: { weeklyWasteKg: 5, recyclingHabit: 'sometimes' },
});
assert(
  errors2.some((e) => e.includes('Daily distance must be a number between 0 and 500')),
  'Should reject negative distance'
);
console.log('✓ Test 2: Negative values rejection passed');

// Test 3: Validation - extreme out-of-bound values
const errors3 = validateCarbonInputs({
  transport: { mode: 'bus_public', distanceKmPerDay: 9999, daysPerWeek: 5 },
  electricity: { billingPeriod: 'weekly_kwh', consumptionValue: 20 },
  water: { dailyLiters: 100 },
  food: { dietaryPattern: 'vegetarian' },
  waste: { weeklyWasteKg: 5, recyclingHabit: 'sometimes' },
});
assert(
  errors3.some((e) => e.includes('Daily distance must be a number between 0 and 500')),
  'Should reject extreme distance'
);
console.log('✓ Test 3: Extreme upper-bound rejection passed');

// Test 4: Pure green lifestyle (walk/bicycle, solar electricity, low water, vegan, maximum recycling)
const greenStudent = {
  transport: { mode: 'walk_bicycle', distanceKmPerDay: 5, daysPerWeek: 5 },
  electricity: { billingPeriod: 'weekly_kwh', consumptionValue: 10, hasRenewableSolar: true },
  water: { dailyLiters: 80 },
  food: { dietaryPattern: 'vegan' },
  waste: { weeklyWasteKg: 2, recyclingHabit: 'always' },
};
const greenResult = calculateFootprint(greenStudent);
assert.equal(greenResult.breakdown.transport, 0, 'Walking must produce exactly 0 kg CO2e');
assert(greenResult.breakdown.electricity < 2, 'Solar electricity must be heavily discounted');
assert.equal(greenResult.breakdown.food, 17.5, 'Vegan food baseline must be 17.5 kg');
assert(greenResult.totalWeeklyKgCO2e < 25, 'Green lifestyle weekly total must be low (<25 kg)');
console.log('✓ Test 4: Eco-conscious lifestyle calculation passed. Total:', greenResult.totalWeeklyKgCO2e, 'kg');

// Test 5: High-emission lifestyle (solo car commute, high AC, meat heavy, no recycling)
const highEmissionsStudent = {
  transport: { mode: 'car_solo', distanceKmPerDay: 20, daysPerWeek: 5 }, // 100 km * 0.192 = 19.2 kg
  electricity: { billingPeriod: 'daily_hours_ac', consumptionValue: 6, hasRenewableSolar: false }, // 6 * 1.2 * 7 = 50.4 kWh * 0.72 = 36.29 kg
  water: { dailyLiters: 200 }, // 1400 * 0.00035 = 0.49 kg
  food: { dietaryPattern: 'meat_heavy' }, // 65.8 kg
  waste: { weeklyWasteKg: 10, recyclingHabit: 'never' }, // 10 * 1.15 = 11.5 kg
};
const highResult = calculateFootprint(highEmissionsStudent);
assert(highResult.breakdown.transport >= 19.2, 'Car solo emissions match');
assert(highResult.breakdown.food === 65.8, 'Meat heavy emissions match');
assert.equal(highResult.highestImpactCategory, 'food', 'Food should be highest impact');
assert(highResult.totalWeeklyKgCO2e > 100, 'High emissions total must exceed 100 kg');
assert(highResult.suggestions.length > 0, 'Must generate reduction suggestions');
console.log('✓ Test 5: High-emissions calculation passed. Total:', highResult.totalWeeklyKgCO2e, 'kg, Highest:', highResult.highestImpactCategory);

// Test 6: Unit conversion check - Monthly electricity vs Weekly electricity
const monthlyStudent = {
  transport: { mode: 'bus_public', distanceKmPerDay: 10, daysPerWeek: 5 },
  electricity: { billingPeriod: 'monthly_kwh', consumptionValue: 43.3, hasRenewableSolar: false }, // ~10 kWh/wk
  water: { dailyLiters: 100 },
  food: { dietaryPattern: 'vegetarian' },
  waste: { weeklyWasteKg: 5, recyclingHabit: 'sometimes' },
};
const monthlyResult = calculateFootprint(monthlyStudent);
assert(
  Math.abs(monthlyResult.breakdown.electricity - 7.2) < 0.2,
  'Monthly electricity must be converted to weekly kWh (43.3 / 4.33 = 10 kWh * 0.72 = 7.2 kg)'
);
console.log('✓ Test 6: Monthly to weekly electricity conversion passed');

console.log('--- ALL CARBON CALCULATION ENGINE TESTS PASSED! ---');
