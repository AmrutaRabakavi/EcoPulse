/**
 * @file smartBinApi.test.js
 * @desc Unit & integration tests for IoT Smart Dustbin detection & dynamic single-use QR claims.
 *
 * Safety & Isolation:
 * - Runs strictly against MongoMemoryServer for 100% database isolation.
 * - Leaves zero records in MongoDB Atlas.
 */

import assert from 'node:assert/strict';
import http from 'http';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import User from '../src/models/User.js';
import WasteDeposit from '../src/models/WasteDeposit.js';
import Activity from '../src/models/Activity.js';

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'ecopulse_jwt_secret_dev_key_2026';
}

console.log('============== STARTING SMART DUSTBIN & QR TESTS ==============');

let server;
let baseUrl;
let memoryServerInstance;

async function setup() {
  const { MongoMemoryServer } = await import('mongodb-memory-server');
  memoryServerInstance = await MongoMemoryServer.create();
  const uri = memoryServerInstance.getUri();
  await mongoose.connect(uri);

  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  baseUrl = `http://127.0.0.1:${port}/api/smart-bin`;
}

async function teardown() {
  if (server) server.close();
  await mongoose.disconnect();
  if (memoryServerInstance) await memoryServerInstance.stop();
}

function generateToken(user) {
  const secret = process.env.JWT_SECRET || 'ecopulse_jwt_secret_dev_key_2026';
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    secret,
    { expiresIn: '7d' }
  );
}

async function runTests() {
  await setup();

  try {
    // Seed a student user
    const student = await User.create({
      fullName: 'Tara Sharma',
      collegeId: 'STU-BIN-101',
      email: 'tara.sharma@campus.edu',
      passwordHash: 'dummyhashedpw123',
      department: 'Environmental Science',
      ecoPoints: 50,
    });
    const studentToken = generateToken(student);

    // ── Test 1: Get campus smart dustbin list ─────────────────────────────────
    const resList = await fetch(`${baseUrl}/list`);
    assert.equal(resList.status, 200, 'Bin list must return 200');
    const dataList = await resList.json();
    assert.equal(dataList.success, true);
    assert(dataList.bins.length >= 4, 'Must return at least 4 campus bins');
    console.log('✓ Test 1: Campus smart dustbin directory retrieved');

    // ── Test 2: Detect waste drop & generate dynamic 60s QR code ──────────────
    const resDetect = await fetch(`${baseUrl}/detect-waste`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        binId: 'BIN-LIB-01',
        wasteType: 'plastic',
      }),
    });
    assert.equal(resDetect.status, 201, 'Waste detection must return 201');
    const dataDetect = await resDetect.json();
    assert.equal(dataDetect.success, true);
    assert(dataDetect.deposit.depositCode.startsWith('ECO-'));
    assert(dataDetect.deposit.token.length >= 16);
    assert.equal(dataDetect.deposit.points, 25);
    assert.equal(dataDetect.deposit.durationSeconds, 60);
    const depositToken = dataDetect.deposit.token;
    const depositCode = dataDetect.deposit.depositCode;
    console.log('✓ Test 2: Waste detected and single-use 60s dynamic QR generated');

    // ── Test 3: Unauthenticated student cannot claim points ───────────────────
    const resUnauth = await fetch(`${baseUrl}/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: depositToken }),
    });
    assert.equal(resUnauth.status, 401, 'Unauthenticated claim must return 401');
    console.log('✓ Test 3: Unauthenticated claim properly rejected (401)');

    // ── Test 4: Check pending status ──────────────────────────────────────────
    const resStatusPending = await fetch(`${baseUrl}/status/${depositToken}`);
    assert.equal(resStatusPending.status, 200);
    const dataStatusPending = await resStatusPending.json();
    assert.equal(dataStatusPending.status, 'PENDING');
    assert(dataStatusPending.secondsRemaining > 0);
    console.log('✓ Test 4: Dynamic QR status reports PENDING with active countdown');

    // ── Test 5: Authenticated student claims points successfully ──────────────
    const resClaim = await fetch(`${baseUrl}/claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({ token: depositToken }),
    });
    assert.equal(resClaim.status, 200, 'Claim must succeed with 200');
    const dataClaim = await resClaim.json();
    assert.equal(dataClaim.success, true);
    assert.equal(dataClaim.pointsAwarded, 25);
    assert.equal(dataClaim.totalEcoPoints, 75); // 50 initial + 25
    console.log('✓ Test 5: Student successfully claimed points (+25 EcoPoints awarded)');

    // Verify database record
    const updatedUser = await User.findById(student._id);
    assert.equal(updatedUser.ecoPoints, 75, 'User points must be updated in DB');

    const activity = await Activity.findOne({ studentId: student._id });
    assert(activity, 'Verified activity record must be logged');
    assert.equal(activity.verificationMethod, 'IOT');
    assert.equal(activity.verified, true);
    console.log('✓ Test 6: EcoPoints incremented and verified IoT activity logged');

    // ── Test 7: Duplicate claim attempt must be rejected (single-use) ─────────
    const resDup = await fetch(`${baseUrl}/claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({ token: depositToken }),
    });
    assert.equal(resDup.status, 400, 'Duplicate claim must return 400');
    const dataDup = await resDup.json();
    assert(dataDup.message.includes('already been claimed'));
    console.log('✓ Test 7: Duplicate QR claim rejected (anti-cheat single-use enforced)');

    // ── Test 8: Status after claim reports CLAIMED with student info ───────────
    const resStatusClaimed = await fetch(`${baseUrl}/status/${depositCode}`);
    assert.equal(resStatusClaimed.status, 200);
    const dataStatusClaimed = await resStatusClaimed.json();
    assert.equal(dataStatusClaimed.status, 'CLAIMED');
    assert.equal(dataStatusClaimed.claimedBy.fullName, 'Tara Sharma');
    console.log('✓ Test 8: Kiosk status updates to CLAIMED with student details');

    // ── Test 9: Expired deposit rejected after 60s deadline ────────────────────
    const pastExpiresAt = new Date(Date.now() - 5000); // 5 seconds ago
    const expiredDeposit = await WasteDeposit.create({
      depositCode: 'ECO-EXPD99',
      token: 'expired_token_hex_99999',
      binId: 'BIN-ENG-02',
      binName: 'Engineering Smart Bin',
      wasteType: 'metal',
      points: 30,
      status: 'PENDING',
      expiresAt: pastExpiresAt,
    });

    const resExpired = await fetch(`${baseUrl}/claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({ token: expiredDeposit.token }),
    });
    assert.equal(resExpired.status, 400, 'Expired QR code must return 400');
    const dataExpired = await resExpired.json();
    assert(dataExpired.message.includes('expired'));
    console.log('✓ Test 9: Expired QR deposit correctly rejected (60s limit enforced)');

    console.log('\n============== ALL 9 SMART BIN & QR TESTS PASSED! ==============');
  } finally {
    await teardown();
  }
}

runTests().catch((err) => {
  console.error('\n✖ SMART BIN TESTS FAILED:', err);
  process.exit(1);
});
