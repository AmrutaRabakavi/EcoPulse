import assert from 'node:assert/strict';
import http from 'http';
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';
import User from '../src/models/User.js';
import Initiative from '../src/models/Initiative.js';
import { generateToken } from '../src/utils/generateToken.js';
import bcrypt from 'bcryptjs';

const ts = Date.now();

async function runInitiativeApiTests() {
  console.log('============== STARTING CAMPUS INITIATIVES API TEST SUITE ==============');

  // 1. Connect DB and start local test HTTP server
  await connectDB();
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api`;
  console.log(`Test server running at ${baseUrl}`);

  try {
    const passwordHash = await bcrypt.hash('password123', 8);

    // 2. Create Admin user & token
    const adminUser = await User.create({
      fullName: 'Dr. Anita Sharma',
      collegeId: `ADM-${ts}`,
      email: `admin.${ts}@college.edu`,
      passwordHash,
      department: 'Sustainability Office',
      role: 'admin',
      ecoPoints: 100,
    });
    const adminToken = generateToken(adminUser);
    console.log('✓ Admin user created and authenticated');

    // 3. Create Student 1 user & token
    const student1 = await User.create({
      fullName: 'Rahul Verma',
      collegeId: `STU-1-${ts}`,
      email: `student1.${ts}@college.edu`,
      passwordHash,
      department: 'Electrical Engineering',
      role: 'student',
      ecoPoints: 50,
    });
    const student1Token = generateToken(student1);
    console.log('✓ Student 1 created and authenticated');

    // 4. Create Student 2 user & token
    const student2 = await User.create({
      fullName: 'Sneha Patel',
      collegeId: `STU-2-${ts}`,
      email: `student2.${ts}@college.edu`,
      passwordHash,
      department: 'Mechanical Engineering',
      role: 'student',
      ecoPoints: 50,
    });
    const student2Token = generateToken(student2);
    console.log('✓ Student 2 created and authenticated');

    // ── Test 1: Unauthenticated requests require Bearer token (401) ───────
    const unauthRes = await fetch(`${baseUrl}/initiatives`);
    assert.equal(unauthRes.status, 401, 'Unauthenticated GET /initiatives must return 401');
    const unauthData = await unauthRes.json();
    assert.equal(unauthData.success, false);
    console.log('✓ Test 1: Unauthenticated requests properly rejected with 401');

    // ── Test 2: Role Permissions - Students cannot create initiatives (403) ──
    const studentCreateRes = await fetch(`${baseUrl}/initiatives`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${student1Token}`,
      },
      body: JSON.stringify({
        title: 'Student Unauthorized Event',
        description: 'Should not be allowed',
        category: 'COMMUNITY',
        location: 'Campus Center',
        startDate: new Date('2026-11-10T10:00:00Z'),
        endDate: new Date('2026-11-10T15:00:00Z'),
      }),
    });
    assert.equal(studentCreateRes.status, 403, 'Student creating initiative must return 403');
    console.log('✓ Test 2: Student creation forbidden with 403');

    // ── Test 3: Admin creation validation errors (400) ────────────────────
    // 3a. Missing required fields
    const missingFieldsRes = await fetch(`${baseUrl}/initiatives`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Missing other fields',
      }),
    });
    assert.equal(missingFieldsRes.status, 400, 'Missing fields must return 400');

    // 3b. Invalid category
    const invalidCatRes = await fetch(`${baseUrl}/initiatives`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Invalid Cat Event',
        description: 'Test',
        category: 'NOT_A_CATEGORY',
        location: 'Hall',
        startDate: new Date('2026-11-10T10:00:00Z'),
        endDate: new Date('2026-11-10T15:00:00Z'),
      }),
    });
    assert.equal(invalidCatRes.status, 400, 'Invalid category must return 400');

    // 3c. End date earlier than start date
    const badDateRes = await fetch(`${baseUrl}/initiatives`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Bad Date Event',
        description: 'Test',
        category: 'ENERGY',
        location: 'Solar Rooftop',
        startDate: new Date('2026-11-12T10:00:00Z'),
        endDate: new Date('2026-11-11T10:00:00Z'),
      }),
    });
    assert.equal(badDateRes.status, 400, 'End date before start date must return 400');

    // 3d. Title exceeding 150 characters
    const longTitleRes = await fetch(`${baseUrl}/initiatives`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'A'.repeat(151),
        description: 'Test',
        category: 'ENERGY',
        location: 'Solar Rooftop',
        startDate: new Date('2026-11-10T10:00:00Z'),
        endDate: new Date('2026-11-10T12:00:00Z'),
      }),
    });
    assert.equal(longTitleRes.status, 400, 'Title > 150 chars must return 400');
    console.log('✓ Test 3: Admin creation inputs validated properly (missing fields, invalid category, date order, title length)');

    // ── Test 4: Admin creates valid initiative (201) ──────────────────────
    const createRes = await fetch(`${baseUrl}/initiatives`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Campus Solar Energy Awareness Camp',
        description: 'Learn about rooftop solar panels and monitor dormitory energy savings.',
        category: 'ENERGY',
        location: 'Auditorium Block C',
        startDate: new Date(Date.now() + 86400000).toISOString(),
        endDate: new Date(Date.now() + 172800000).toISOString(),
        points: 20,
        status: 'UPCOMING',
      }),
    });
    assert.equal(createRes.status, 201, 'Valid creation must return 201');
    const createData = await createRes.json();
    assert.equal(createData.success, true);
    const createdInitiative = createData.initiative;
    assert.equal(createdInitiative.title, 'Campus Solar Energy Awareness Camp');
    assert.equal(createdInitiative.status, 'UPCOMING');
    assert.equal(createdInitiative.points, 20);
    const initiativeId = createdInitiative._id;
    console.log(`✓ Test 4: Admin created initiative successfully with ID: ${initiativeId}`);

    // ── Test 5: List initiatives (GET /api/initiatives) ────────────────────
    const listRes = await fetch(`${baseUrl}/initiatives`, {
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    assert.equal(listRes.status, 200, 'Listing initiatives must return 200');
    const listData = await listRes.json();
    assert.equal(listData.success, true);
    assert(listData.count >= 1);
    const found = listData.initiatives.find((i) => i._id === initiativeId);
    assert(found, 'Created initiative should be present in list');
    assert.equal(found.participantCount, 0);
    assert.equal(found.hasJoined, false);

    // Filter by category
    const catListRes = await fetch(`${baseUrl}/initiatives?category=ENERGY`, {
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    const catListData = await catListRes.json();
    assert(catListData.initiatives.every((i) => i.category === 'ENERGY'));

    // Filter by invalid category
    const badCatRes = await fetch(`${baseUrl}/initiatives?category=INVALID`, {
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    assert.equal(badCatRes.status, 400);
    console.log('✓ Test 5: Listing and filtering initiatives verified');

    // ── Test 6: Get initiative by ID (GET /api/initiatives/:id) ────────────
    // 6a. Invalid ID format
    const badIdRes = await fetch(`${baseUrl}/initiatives/invalid-id-123`, {
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    assert.equal(badIdRes.status, 400);

    // 6b. Non-existent ID
    const nonExistentRes = await fetch(`${baseUrl}/initiatives/66e000000000000000000000`, {
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    assert.equal(nonExistentRes.status, 404);

    // 6c. Valid ID
    const detailRes = await fetch(`${baseUrl}/initiatives/${initiativeId}`, {
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    assert.equal(detailRes.status, 200);
    const detailData = await detailRes.json();
    assert.equal(detailData.success, true);
    assert.equal(detailData.initiative._id, initiativeId);
    assert.equal(detailData.initiative.participantCount, 0);
    assert.equal(detailData.initiative.hasJoined, false);
    assert.equal(detailData.initiative.organizer.email, adminUser.email);
    console.log('✓ Test 6: Single initiative lookup, invalid ID handling, and 404 verified');

    // ── Test 7: Joining rules - UPCOMING initiative rejected (400) ────────
    const joinUpcomingRes = await fetch(`${baseUrl}/initiatives/${initiativeId}/join`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    assert.equal(joinUpcomingRes.status, 400, 'Joining UPCOMING initiative must return 400');
    console.log('✓ Test 7: Joining not-yet-open (UPCOMING) initiative correctly rejected');

    // ── Test 8: Admin activates initiative (PATCH /api/initiatives/:id) ────
    const patchActiveRes = await fetch(`${baseUrl}/initiatives/${initiativeId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: 'ACTIVE',
      }),
    });
    assert.equal(patchActiveRes.status, 200, 'Admin patch must return 200');
    const patchedData = await patchActiveRes.json();
    assert.equal(patchedData.initiative.status, 'ACTIVE');
    console.log('✓ Test 8: Admin patched initiative status to ACTIVE');

    // Student cannot patch
    const studentPatchRes = await fetch(`${baseUrl}/initiatives/${initiativeId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${student1Token}`,
      },
      body: JSON.stringify({ status: 'CANCELLED' }),
    });
    assert.equal(studentPatchRes.status, 403, 'Student cannot patch initiative');
    console.log('✓ Test 8b: Student patch forbidden (403)');

    // ── Test 9: Student 1 joins ACTIVE initiative (200) ───────────────────
    const initialStudent1Points = (await User.findById(student1._id)).ecoPoints;

    const joinRes = await fetch(`${baseUrl}/initiatives/${initiativeId}/join`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    assert.equal(joinRes.status, 200, 'Student joining active initiative must return 200');
    const joinData = await joinRes.json();
    assert.equal(joinData.success, true);
    assert.equal(joinData.initiative.hasJoined, true);
    assert.equal(joinData.initiative.participantCount, 1);

    // Verify ecoPoints were NOT awarded merely for joining
    const afterStudent1Points = (await User.findById(student1._id)).ecoPoints;
    assert.equal(afterStudent1Points, initialStudent1Points, 'Points must not be awarded for joining');
    console.log('✓ Test 9: Student 1 joined successfully without arbitrary point awards');

    // ── Test 10: Duplicate join rejected (400) ────────────────────────────
    const dupJoinRes = await fetch(`${baseUrl}/initiatives/${initiativeId}/join`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    assert.equal(dupJoinRes.status, 400, 'Duplicate join must return 400');
    const dupJoinData = await dupJoinRes.json();
    assert.equal(dupJoinData.success, false);
    assert.match(dupJoinData.message, /already joined/i);
    console.log('✓ Test 10: Duplicate join rejected with 400 and clear message');

    // Detail check reflects participation for Student 1 and not Student 2
    const s1DetailRes = await fetch(`${baseUrl}/initiatives/${initiativeId}`, {
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    const s1Detail = await s1DetailRes.json();
    assert.equal(s1Detail.initiative.hasJoined, true);
    assert.equal(s1Detail.initiative.participantCount, 1);

    const s2DetailRes = await fetch(`${baseUrl}/initiatives/${initiativeId}`, {
      headers: { Authorization: `Bearer ${student2Token}` },
    });
    const s2Detail = await s2DetailRes.json();
    assert.equal(s2Detail.initiative.hasJoined, false);
    assert.equal(s2Detail.initiative.participantCount, 1);
    console.log('✓ Test 10b: Individual student membership visibility verified');

    // ── Test 11: Deletion safeguards - Reject deletion when participants exist (400) ─
    const deleteBlockedRes = await fetch(`${baseUrl}/initiatives/${initiativeId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(deleteBlockedRes.status, 400, 'Deleting initiative with participants must return 400');
    const deleteBlockedData = await deleteBlockedRes.json();
    assert.equal(deleteBlockedData.success, false);
    assert.match(deleteBlockedData.message, /Cannot delete initiative with existing participants/i);
    console.log('✓ Test 11: Deletion rejected when participants exist to protect records');

    // ── Test 12: Leaving rules ────────────────────────────────────────────
    // 12a. Student 2 cannot leave because they haven't joined
    const s2LeaveRes = await fetch(`${baseUrl}/initiatives/${initiativeId}/leave`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${student2Token}` },
    });
    assert.equal(s2LeaveRes.status, 400, 'Non-participant leaving must return 400');

    // 12b. Student 1 leaves successfully
    const s1LeaveRes = await fetch(`${baseUrl}/initiatives/${initiativeId}/leave`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    assert.equal(s1LeaveRes.status, 200, 'Participant leaving must return 200');
    const s1LeaveData = await s1LeaveRes.json();
    assert.equal(s1LeaveData.success, true);
    assert.equal(s1LeaveData.initiative.hasJoined, false);
    assert.equal(s1LeaveData.initiative.participantCount, 0);
    console.log('✓ Test 12: Leaving rules verified (non-participant rejected, participant leaves cleanly)');

    // ── Test 13: Admin deletion after participants left (200) ─────────────
    const deleteSuccessRes = await fetch(`${baseUrl}/initiatives/${initiativeId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(deleteSuccessRes.status, 200, 'Admin can delete empty initiative');
    const deleteSuccessData = await deleteSuccessRes.json();
    assert.equal(deleteSuccessData.success, true);

    const verifyDeleted = await fetch(`${baseUrl}/initiatives/${initiativeId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(verifyDeleted.status, 404, 'Deleted initiative returns 404');
    console.log('✓ Test 13: Admin deleted empty initiative successfully');

    // ── Test 14: Lifecycle rules for COMPLETED & CANCELLED initiatives ────
    // Create an initiative with COMPLETED status
    const completedInit = await Initiative.create({
      title: 'Past Tree Drive',
      description: 'Finished drive',
      category: 'TREES',
      location: 'South Lawn',
      startDate: new Date('2026-09-01T09:00:00Z'),
      endDate: new Date('2026-09-01T17:00:00Z'),
      organizer: adminUser._id,
      status: 'COMPLETED',
      points: 15,
    });

    const joinCompletedRes = await fetch(`${baseUrl}/initiatives/${completedInit._id}/join`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    assert.equal(joinCompletedRes.status, 400, 'Cannot join COMPLETED initiative');

    // Create an initiative with CANCELLED status
    const cancelledInit = await Initiative.create({
      title: 'Rainout Drive',
      description: 'Cancelled due to storms',
      category: 'WATER',
      location: 'Lake Quad',
      startDate: new Date('2026-11-01T09:00:00Z'),
      endDate: new Date('2026-11-01T17:00:00Z'),
      organizer: adminUser._id,
      status: 'CANCELLED',
      points: 15,
    });

    const joinCancelledRes = await fetch(`${baseUrl}/initiatives/${cancelledInit._id}/join`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    assert.equal(joinCancelledRes.status, 400, 'Cannot join CANCELLED initiative');
    console.log('✓ Test 14: COMPLETED and CANCELLED joining rules enforced');

    console.log('\n============== ALL 14 CAMPUS INITIATIVES API TESTS PASSED! ==============');
  } finally {
    server.close();
    await mongoose.disconnect();
    process.exit(0);
  }
}

runInitiativeApiTests().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
