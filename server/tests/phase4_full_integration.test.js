import assert from 'node:assert/strict';

const baseUrl = 'http://localhost:5000/api';

// Use timestamp-based unique IDs so the test is safe to re-run
const ts = Date.now();

async function runPhase4IntegrationTests() {
  console.log('============== STARTING PHASE 4 INTEGRATION SUITE ==============');

  // ── Register Student 1 ──────────────────────────────────────────────────
  const student1 = {
    fullName: 'Ananya Deshmukh',
    collegeId: `P4-401-${ts}`,
    email: `ananya.${ts}@college.edu`,
    password: 'password2026',
    department: 'Civil & Environmental Engineering',
  };
  const reg1Res = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(student1),
  });
  const reg1Data = await reg1Res.json();
  const token1 = reg1Data.token;
  assert(token1, 'Student 1 must receive auth token');
  console.log('1. Student 1 Registered:', student1.fullName, '→ token issued');

  // ── Register Student 2 ──────────────────────────────────────────────────
  const student2 = {
    fullName: 'Vikram Joshi',
    collegeId: `P4-402-${ts}`,
    email: `vikram.${ts}@college.edu`,
    password: 'password2026',
    department: 'Computer Science & Engineering',
  };
  const reg2Res = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(student2),
  });
  const reg2Data = await reg2Res.json();
  const token2 = reg2Data.token;
  assert(token2, 'Student 2 must receive auth token');
  console.log('2. Student 2 Registered:', student2.fullName, '→ token issued');

  // ── Test 3: JWT protection: must return 401 without token ───────────────
  const unauthRes = await fetch(`${baseUrl}/carbon-footprint/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  assert.equal(unauthRes.status, 401, 'Endpoint must require JWT – expected 401');
  console.log('3. JWT Protection: returned 401 without token ✓');

  // ── Test 4: Missing required fields → 400 ──────────────────────────────
  const missingRes = await fetch(`${baseUrl}/carbon-footprint/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
    body: JSON.stringify({ transport: { mode: 'bus_public' } }),
  });
  assert.equal(missingRes.status, 400, 'Must reject missing fields with 400');
  console.log('4. Missing required fields → 400 ✓');

  // ── Test 5: Negative values → 400 ──────────────────────────────────────
  const negRes = await fetch(`${baseUrl}/carbon-footprint/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
    body: JSON.stringify({
      transport: { mode: 'bus_public', distanceKmPerDay: -5, daysPerWeek: 5 },
      electricity: { billingPeriod: 'weekly_kwh', consumptionValue: 20 },
      water: { dailyLiters: 100 },
      food: { dietaryPattern: 'vegetarian' },
      waste: { weeklyWasteKg: 4, recyclingHabit: 'sometimes' },
    }),
  });
  assert.equal(negRes.status, 400, 'Must reject negative distance with 400');
  console.log('5. Negative values → 400 ✓');

  // ── Test 6: Out-of-bound (extreme) values → 400 ─────────────────────────
  const extremeRes = await fetch(`${baseUrl}/carbon-footprint/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
    body: JSON.stringify({
      transport: { mode: 'bus_public', distanceKmPerDay: 800, daysPerWeek: 5 },
      electricity: { billingPeriod: 'weekly_kwh', consumptionValue: 20 },
      water: { dailyLiters: 100 },
      food: { dietaryPattern: 'vegetarian' },
      waste: { weeklyWasteKg: 4, recyclingHabit: 'sometimes' },
    }),
  });
  assert.equal(extremeRes.status, 400, 'Must reject extreme distance with 400');
  console.log('6. Extreme values → 400 ✓');

  // ── Test 7: Valid Calculation #1 – Baseline (bus, grid electric, avg diet) ─
  // Expected transport: 10 km * 5 days * 0.089 = 4.45 kg
  // Expected electricity: 20 kWh * 0.72 = 14.4 kg
  // Expected water: 100 L * 7 * 0.00035 = 0.245 kg
  // Expected food (vegetarian): 26.6 kg
  // Expected waste: 4 kg * 1.15 * (1-0.35) = 2.99 kg   → total ≈ 48.68 kg
  const calc1Input = {
    transport: { mode: 'bus_public', distanceKmPerDay: 10, daysPerWeek: 5 },
    electricity: { billingPeriod: 'weekly_kwh', consumptionValue: 20, hasRenewableSolar: false },
    water: { dailyLiters: 100 },
    food: { dietaryPattern: 'vegetarian' },
    waste: { weeklyWasteKg: 4, recyclingHabit: 'sometimes' },
  };
  const calc1Res = await fetch(`${baseUrl}/carbon-footprint/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
    body: JSON.stringify(calc1Input),
  });
  assert.equal(calc1Res.status, 201, 'Calculation #1 must return 201 Created');
  const calc1Data = await calc1Res.json();
  const record1Id = calc1Data.data.id;
  assert(calc1Data.data.totalWeeklyKgCO2e > 40, 'Total footprint should be >40 kg CO2e');
  assert.equal(calc1Data.data.comparison, null, 'First calculation must have null comparison');
  console.log(`7. Calculation #1: ${calc1Data.data.totalWeeklyKgCO2e} kg CO2e — baseline, comparison=null ✓`);

  // ── Unit conversion test — monthly kWh equivalent ───────────────────────
  // 86.6 kWh/month ÷ 4.33 = 20 kWh/week * 0.72 = 14.4 kg (same as calc1)
  const convInput = { ...calc1Input, electricity: { billingPeriod: 'monthly_kwh', consumptionValue: 86.6, hasRenewableSolar: false } };
  const convRes = await fetch(`${baseUrl}/carbon-footprint/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
    body: JSON.stringify(convInput),
  });
  const convData = await convRes.json();
  assert(Math.abs(convData.data.breakdown.electricity - 14.4) < 0.3, 'Monthly→weekly kWh conversion must be accurate');
  console.log(`7b. Unit conversion (monthly kWh): electricity = ${convData.data.breakdown.electricity} kg CO2e ✓`);

  // ── Test 8: Calculation #2 – reduced lifestyle (shows comparison & delta) ─
  const calc2Input = {
    transport: { mode: 'walk_bicycle', distanceKmPerDay: 5, daysPerWeek: 5 },
    electricity: { billingPeriod: 'weekly_kwh', consumptionValue: 10, hasRenewableSolar: true },
    water: { dailyLiters: 70 },
    food: { dietaryPattern: 'vegan' },
    waste: { weeklyWasteKg: 2, recyclingHabit: 'always' },
  };
  const calc2Res = await fetch(`${baseUrl}/carbon-footprint/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
    body: JSON.stringify(calc2Input),
  });
  assert.equal(calc2Res.status, 201, 'Calculation #2 must return 201');
  const calc2Data = await calc2Res.json();
  assert(calc2Data.data.comparison !== null, 'Calculation #2 must contain comparison');
  assert(calc2Data.data.comparison.difference < 0, 'Must detect emissions reduction');
  assert(calc2Data.data.comparison.percentageChange < 0, 'Percentage change must be negative');
  assert.equal(calc2Data.data.breakdown.transport, 0, 'Walk/bicycle must produce 0 kg CO2e');
  console.log(`8. Calculation #2: ${calc2Data.data.totalWeeklyKgCO2e} kg CO2e, diff=${calc2Data.data.comparison.difference} kg (${calc2Data.data.comparison.percentageChange}%) ✓`);

  // ── Test 9: History ─────────────────────────────────────────────────────
  const historyRes = await fetch(`${baseUrl}/carbon-footprint/history`, {
    headers: { Authorization: `Bearer ${token1}` },
  });
  const historyData = await historyRes.json();
  assert(historyData.count >= 3, `Student 1 must have ≥3 records (got ${historyData.count})`);
  assert(historyData.history[0].id === calc2Data.data.id, 'History must be ordered descending (newest first)');
  console.log(`9. History: ${historyData.count} records, ordered desc ✓`);

  // ── Test 10: GET /api/carbon-footprint/current ──────────────────────────
  const currRes = await fetch(`${baseUrl}/carbon-footprint/current`, {
    headers: { Authorization: `Bearer ${token1}` },
  });
  const currData = await currRes.json();
  assert(currData.data !== null, 'Current footprint must return data');
  assert.equal(currData.data.totalWeeklyKgCO2e, calc2Data.data.totalWeeklyKgCO2e, 'Current must match latest calculation');
  console.log(`10. GET /current: ${currData.data.totalWeeklyKgCO2e} kg CO2e ✓`);

  // ── Test 11: GET single record by ID ────────────────────────────────────
  const singleRes = await fetch(`${baseUrl}/carbon-footprint/${record1Id}`, {
    headers: { Authorization: `Bearer ${token1}` },
  });
  assert.equal(singleRes.status, 200, 'GET by ID must succeed for owner');
  console.log('11. GET /:id by owner → 200 ✓');

  // ── Test 12: Cross-student access control → 403 ─────────────────────────
  const crossRes = await fetch(`${baseUrl}/carbon-footprint/${record1Id}`, {
    headers: { Authorization: `Bearer ${token2}` },
  });
  assert.equal(crossRes.status, 403, 'Student 2 must be denied Student 1 record with 403 Forbidden');
  console.log('12. Cross-student access control: Student 2 → 403 Forbidden ✓');

  // ── Test 13: Dashboard reflects updated carbon summary ──────────────────
  const dashRes = await fetch(`${baseUrl}/dashboard`, {
    headers: { Authorization: `Bearer ${token1}` },
  });
  const dashData = await dashRes.json();
  assert(dashData.carbonSummary !== null, 'Dashboard carbon summary must be populated after calculation');
  assert.equal(
    dashData.carbonSummary.currentFootprint,
    calc2Data.data.totalWeeklyKgCO2e,
    'Dashboard currentFootprint must match latest calculation'
  );
  assert(dashData.carbonSummary.difference < 0, 'Dashboard must show negative delta (reduction)');
  console.log(`13. Dashboard integration: carbonSummary.currentFootprint=${dashData.carbonSummary.currentFootprint} kg, diff=${dashData.carbonSummary.difference} ✓`);

  // ── Test 14: History without token → 401 ────────────────────────────────
  const histNoAuth = await fetch(`${baseUrl}/carbon-footprint/history`);
  assert.equal(histNoAuth.status, 401, 'History endpoint must require JWT');
  console.log('14. History without token → 401 ✓');

  console.log('\n============== ALL PHASE 4 INTEGRATION TESTS PASSED! ==============');
}

runPhase4IntegrationTests().catch((err) => {
  console.error('Integration Suite Failure:', err.message ?? err);
  process.exit(1);
});
