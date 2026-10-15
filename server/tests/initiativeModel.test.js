import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import Initiative from '../src/models/Initiative.js';

async function testInitiativeModel() {
  console.log('--- STARTING INITIATIVE MODEL VALIDATION TESTS ---');

  const dummyOrganizerId = new mongoose.Types.ObjectId();
  const dummyStudent1Id = new mongoose.Types.ObjectId();
  const dummyStudent2Id = new mongoose.Types.ObjectId();

  const validData = {
    title: 'Campus Tree Plantation Drive 2026',
    description: 'Join us to plant 50 native trees around the engineering block.',
    category: 'TREES',
    location: 'North Campus Quad',
    startDate: new Date('2026-11-01T09:00:00Z'),
    endDate: new Date('2026-11-01T17:00:00Z'),
    organizer: dummyOrganizerId,
    points: 25,
  };

  // Test 1: Valid model instantiation and validation
  const validDoc = new Initiative(validData);
  const valError = validDoc.validateSync();
  assert.equal(valError, undefined, 'Valid initiative must pass validation');
  assert.equal(validDoc.status, 'UPCOMING', 'Default status should be UPCOMING');
  assert.deepEqual(validDoc.participants, [], 'Default participants should be empty array');
  console.log('✓ Test 1: Valid initiative document passes validation');

  // Test 2: Missing required fields
  const emptyDoc = new Initiative({});
  const emptyError = emptyDoc.validateSync();
  assert(emptyError, 'Empty document must fail validation');
  assert(emptyError.errors.title, 'Title is required');
  assert(emptyError.errors.description, 'Description is required');
  assert(emptyError.errors.category, 'Category is required');
  assert(emptyError.errors.location, 'Location is required');
  assert(emptyError.errors.startDate, 'StartDate is required');
  assert(emptyError.errors.endDate, 'EndDate is required');
  assert(emptyError.errors.organizer, 'Organizer is required');
  console.log('✓ Test 2: Missing required fields rejected properly');

  // Test 3: Title length validation (max 150)
  const longTitleDoc = new Initiative({
    ...validData,
    title: 'A'.repeat(151),
  });
  const longTitleError = longTitleDoc.validateSync();
  assert(longTitleError?.errors.title, 'Title exceeding 150 chars must fail');
  console.log('✓ Test 3: Title max length (>150 chars) rejected');

  // Test 4: Description length validation (max 2000)
  const longDescDoc = new Initiative({
    ...validData,
    description: 'D'.repeat(2001),
  });
  const longDescError = longDescDoc.validateSync();
  assert(longDescError?.errors.description, 'Description exceeding 2000 chars must fail');
  console.log('✓ Test 4: Description max length (>2000 chars) rejected');

  // Test 5: Category enum validation
  const invalidCatDoc = new Initiative({
    ...validData,
    category: 'INVALID_CATEGORY',
  });
  const invalidCatError = invalidCatDoc.validateSync();
  assert(invalidCatError?.errors.category, 'Invalid category must fail enum check');

  for (const cat of ['TRANSPORT', 'ENERGY', 'WATER', 'FOOD', 'WASTE', 'COMMUNITY', 'TREES', 'CAMPUS']) {
    const catDoc = new Initiative({ ...validData, category: cat });
    assert.equal(catDoc.validateSync(), undefined, `Category ${cat} should be valid`);
  }
  console.log('✓ Test 5: Category enum checked for all 8 valid categories and invalid rejection');

  // Test 6: End date earlier than start date
  const invalidDatesDoc = new Initiative({
    ...validData,
    startDate: new Date('2026-11-05T10:00:00Z'),
    endDate: new Date('2026-11-04T10:00:00Z'),
  });
  const invalidDatesError = invalidDatesDoc.validateSync();
  assert(invalidDatesError?.errors.endDate, 'End date earlier than start date must fail validation');
  console.log('✓ Test 6: End date earlier than start date rejected');

  // Test 7: Points bounds and default
  const defaultPointsDoc = new Initiative({
    ...validData,
    points: undefined,
  });
  assert.equal(defaultPointsDoc.points, 10, 'Default points must be 10');

  const negPointsDoc = new Initiative({ ...validData, points: -5 });
  assert(negPointsDoc.validateSync()?.errors.points, 'Negative points must fail');

  const excessivePointsDoc = new Initiative({ ...validData, points: 150 });
  assert(excessivePointsDoc.validateSync()?.errors.points, 'Points over 100 must fail');
  console.log('✓ Test 7: Points bounds (0-100) and default (10) verified');

  // Test 8: Status enum validation
  const invalidStatusDoc = new Initiative({ ...validData, status: 'UNKNOWN' });
  assert(invalidStatusDoc.validateSync()?.errors.status, 'Invalid status must fail');
  for (const status of ['UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED']) {
    const sDoc = new Initiative({ ...validData, status });
    assert.equal(sDoc.validateSync(), undefined, `Status ${status} should be valid`);
  }
  console.log('✓ Test 8: Status enum verified for UPCOMING, ACTIVE, COMPLETED, CANCELLED');

  // Test 9: Duplicate participant validation at schema level
  const dupDoc = new Initiative({
    ...validData,
    participants: [dummyStudent1Id, dummyStudent1Id],
  });
  const dupError = dupDoc.validateSync();
  assert(dupError?.errors.participants, 'Duplicate participants in array must fail schema validation');
  console.log('✓ Test 9: Duplicate participant in participants array rejected by schema validator');

  // Test 10: Participant helper methods (addParticipant, hasParticipant, removeParticipant)
  const helperDoc = new Initiative(validData);
  assert.equal(helperDoc.hasParticipant(dummyStudent1Id), false, 'Initially does not have student 1');
  
  const added1 = helperDoc.addParticipant(dummyStudent1Id);
  assert.equal(added1, true, 'First add of student 1 should succeed');
  assert.equal(helperDoc.hasParticipant(dummyStudent1Id), true, 'Student 1 is now participant');
  assert.equal(helperDoc.participants.length, 1);

  const duplicateAdd = helperDoc.addParticipant(dummyStudent1Id);
  assert.equal(duplicateAdd, false, 'Adding duplicate student 1 should return false');
  assert.equal(helperDoc.participants.length, 1, 'Array length must not increase on duplicate add');

  const added2 = helperDoc.addParticipant(dummyStudent2Id);
  assert.equal(added2, true, 'Add student 2 should succeed');
  assert.equal(helperDoc.participants.length, 2);

  const removed = helperDoc.removeParticipant(dummyStudent1Id);
  assert.equal(removed, true, 'Remove student 1 should succeed');
  assert.equal(helperDoc.participants.length, 1);
  assert.equal(helperDoc.hasParticipant(dummyStudent1Id), false);
  assert.equal(helperDoc.hasParticipant(dummyStudent2Id), true);
  console.log('✓ Test 10: Participant helper methods prevent duplicate addition and manage membership properly');

  console.log('\n--- ALL INITIATIVE MODEL VALIDATION TESTS PASSED! ---');
}

testInitiativeModel().catch((err) => {
  console.error('Validation Test Failure:', err);
  process.exit(1);
});
