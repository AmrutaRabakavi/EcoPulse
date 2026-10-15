import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Initiative from '../models/Initiative.js';
import { generateToken } from './generateToken.js';

/**
 * 4 Required Sample Initiatives Definitions
 */
const SAMPLE_INITIATIVES = [
  {
    title: 'Campus Tree Plantation Drive',
    description:
      'Join the campus greening initiative to plant 100 native trees and enhance biodiversity around the engineering quadrangles.',
    category: 'TREES',
    location: 'North Quad Gardens',
    startDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
    endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // +4 days
    points: 25,
    status: 'ACTIVE',
  },
  {
    title: 'Solar Rooftop Workshop',
    description:
      'Learn about campus solar photovoltaic arrays, micro-grid management, and student hostel energy monitoring.',
    category: 'ENERGY',
    location: 'Engineering Block Auditorium',
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 days
    endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // +8 days
    points: 20,
    status: 'UPCOMING',
  },
  {
    title: 'E-Waste Collection Week',
    description:
      'Successfully organized electronic waste aggregation for certified recycling and precious metals recovery.',
    category: 'WASTE',
    location: 'Student Activity Center',
    startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // -10 days
    endDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // -3 days
    points: 30,
    status: 'COMPLETED',
  },
  {
    title: 'Campus Clean-up Drive',
    description:
      'Community litter clean-up along the lake trail. Postponed and cancelled due to severe monsoon weather advisory.',
    category: 'COMMUNITY',
    location: 'Lake View Trail',
    startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    points: 15,
    status: 'CANCELLED',
  },
];

/**
 * In-Process Development Seeder
 * Reuses the exact active Mongoose connection established by connectDB().
 *
 * @param {Object} options
 * @param {number|string} [options.port=5000] - Port of running HTTP server
 */
export async function seedInitiativesDev(options = {}) {
  // SAFETY CHECK 1: Disallow execution in production environments
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      '[SAFETY BLOCKED] seedInitiativesDev is strictly disabled in production environments.'
    );
  }

  // SAFETY CHECK 2: Require explicit opt-in environment flag
  if (process.env.ECOPULSE_SEED_TEST_INITIATIVES !== 'true') {
    console.log(
      '[Dev Seeder] Skipped: ECOPULSE_SEED_TEST_INITIATIVES is not set to "true".'
    );
    return;
  }

  // SAFETY CHECK 3: Verify active in-process Mongoose connection
  if (mongoose.connection.readyState !== 1) {
    throw new Error(
      '[Dev Seeder] Aborted: No active Mongoose connection found. Must run in-process after connectDB().'
    );
  }

  // SAFETY CHECK 4: Verify connection target is a disposable local development database
  const host = mongoose.connection.host || '';
  const isLocal =
    host === '127.0.0.1' ||
    host === 'localhost' ||
    host.startsWith('127.0.0.1:') ||
    host.startsWith('localhost:');

  if (!isLocal) {
    throw new Error(
      `[SAFETY BLOCKED] Refusing to seed: Connected database host "${host}" is not a verified local development instance.`
    );
  }

  const port = options.port || process.env.PORT || 5000;
  const apiBaseUrl = `http://127.0.0.1:${port}/api`;

  console.log('[Dev Seeder] Starting development initiative seeding in-process...');

  // SAFETY CHECK 5: Safe admin account check - never overwrite existing non-admin roles
  const adminEmail = 'dev.admin@campus.internal';
  let adminUser = await User.findOne({ email: adminEmail });

  if (adminUser) {
    if (adminUser.role !== 'admin') {
      throw new Error(
        `[SAFETY BLOCKED] User "${adminEmail}" already exists with non-admin role "${adminUser.role}". Refusing to alter existing role.`
      );
    }
  } else {
    const passwordHash = await bcrypt.hash('dev_admin_local_secret', 8);
    adminUser = await User.create({
      fullName: 'EcoPulse Campus Administrator',
      collegeId: 'DEV-ADMIN-01',
      email: adminEmail,
      passwordHash,
      department: 'Sustainability Office',
      role: 'admin',
      ecoPoints: 100,
    });
    console.log('[Dev Seeder] Local development admin initialized.');
  }

  // Generate admin token for authenticated API calls (no tokens printed to logs)
  const adminToken = generateToken(adminUser);

  // Seed or update the four specifically named sample initiatives idempotently
  const summary = [];

  for (const sample of SAMPLE_INITIATIVES) {
    const existing = await Initiative.findOne({ title: sample.title });

    if (existing) {
      // Update existing record idempotently via PATCH /api/initiatives/:id
      const updateRes = await fetch(`${apiBaseUrl}/initiatives/${existing._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          status: sample.status,
          description: sample.description,
          points: sample.points,
          location: sample.location,
          startDate: sample.startDate.toISOString(),
          endDate: sample.endDate.toISOString(),
        }),
      });

      if (updateRes.ok) {
        console.log(`[Dev Seeder] ✓ [${sample.status}] "${sample.title}" updated.`);
        summary.push({ title: sample.title, status: sample.status, action: 'updated' });
      } else {
        console.warn(`[Dev Seeder] ! Failed to update "${sample.title}": HTTP ${updateRes.status}`);
      }
    } else {
      // Create record via POST /api/initiatives
      const createRes = await fetch(`${apiBaseUrl}/initiatives`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: sample.title,
          description: sample.description,
          category: sample.category,
          location: sample.location,
          startDate: sample.startDate.toISOString(),
          endDate: sample.endDate.toISOString(),
          points: sample.points,
          status: sample.status,
        }),
      });

      if (createRes.ok) {
        console.log(`[Dev Seeder] ✓ [${sample.status}] "${sample.title}" created.`);
        summary.push({ title: sample.title, status: sample.status, action: 'created' });
      } else {
        const errData = await createRes.json();
        console.warn(`[Dev Seeder] ! Failed to create "${sample.title}": ${errData.message}`);
      }
    }
  }

  console.log(`[Dev Seeder] Done. Processed ${summary.length} sample initiatives safely.`);
  return summary;
}
