/**
 * @file createAdminUser.js
 * @desc Secure, one-time administrative user provisioning utility for EcoPulse.
 *
 * Safety requirements:
 * - Operates exclusively against a verified remote MongoDB Atlas cluster.
 * - Disallows localhost, local MongoDB, and in-memory databases.
 * - Does not modify existing student or faculty accounts.
 * - Refuses execution if the email or college ID is already in use.
 * - Enforces bcrypt hashing (salt factor 10) identical to user registration.
 * - Uses a genuinely hidden interactive prompt for password input (no echo).
 * - Preserves password verbatim without trimming or normalization.
 * - Restores terminal raw mode settings on all exit paths.
 * - Never prints passwords, hashes, JWTs, or raw database URIs.
 */

import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

// Load .env from server directory or current working directory
dotenv.config();
if (!process.env.MONGODB_URI) {
  dotenv.config({ path: path.resolve('server', '.env') });
}

import bcrypt from 'bcryptjs';
import { connectDB, closeDB } from '../config/db.js';
import User from '../models/User.js';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Verify whether a URI targets a remote MongoDB Atlas cluster and disallows local connections
 */
export const isAtlasUri = (rawUri) => {
  if (!rawUri || typeof rawUri !== 'string') return false;
  const trimmed = rawUri.trim();
  const isLocal =
    trimmed.includes('127.0.0.1') ||
    trimmed.includes('localhost') ||
    trimmed.includes('::1');
  if (isLocal) return false;

  return trimmed.startsWith('mongodb+srv://') || trimmed.includes('.mongodb.net');
};

/**
 * Prompt for a standard text field (non-sensitive)
 */
async function promptTextField(rl, promptText, envVarName, defaultValue = '') {
  const envVal = process.env[envVarName];
  if (envVal && envVal.trim()) {
    return envVal.trim();
  }

  const answer = await rl.question(promptText);
  const trimmed = answer.trim();
  if (!trimmed && defaultValue) {
    return defaultValue;
  }
  return trimmed;
}

/**
 * Genuinely hidden password prompt.
 * Keystrokes are not echoed to stdout.
 * Handles Enter, Backspace, and Ctrl+C safely.
 * Restores terminal raw mode on all exit paths.
 * Does not trim or modify the entered password.
 */
export function promptHiddenPassword(promptText) {
  if (process.env.ADMIN_PASSWORD !== undefined && process.env.ADMIN_PASSWORD !== '') {
    return Promise.resolve(process.env.ADMIN_PASSWORD);
  }

  if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== 'function') {
    return Promise.reject(
      new Error(
        'Terminal does not support raw mode for secure hidden password entry. To run non-interactively, set the ADMIN_PASSWORD environment variable.'
      )
    );
  }

  return new Promise((resolve, reject) => {
    process.stdout.write(promptText);

    const stdin = process.stdin;
    const wasRaw = stdin.isRaw;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    let password = '';

    const cleanup = () => {
      try {
        stdin.setRawMode(wasRaw || false);
        stdin.pause();
        stdin.removeListener('data', onData);
      } catch (_) {
        // ignore cleanup errors
      }
    };

    const onData = (chunk) => {
      for (const char of chunk) {
        if (char === '\r' || char === '\n') {
          cleanup();
          process.stdout.write('\n');
          resolve(password);
          return;
        } else if (char === '\u0003') { // Ctrl+C
          cleanup();
          process.stdout.write('\n');
          reject(new Error('Admin provisioning cancelled by user (Ctrl+C).'));
          return;
        } else if (char === '\u0004') { // Ctrl+D
          cleanup();
          process.stdout.write('\n');
          resolve(password);
          return;
        } else if (char === '\u0008' || char === '\x7f') { // Backspace / Delete
          if (password.length > 0) {
            password = password.slice(0, -1);
          }
        } else {
          password += char;
        }
      }
    };

    stdin.on('data', onData);
  });
}

export async function provisionAdmin() {
  let dbConnected = false;

  try {
    console.log('======================================================');
    console.log(' EcoPulse — Administrator Account Provisioning');
    console.log('======================================================\n');

    // 1. Database configuration guard: require explicit remote MongoDB Atlas URI
    const rawUri = process.env.MONGODB_URI ? process.env.MONGODB_URI.trim() : '';
    if (!rawUri) {
      throw new Error(
        'Database configuration error: MONGODB_URI is missing or blank in environment variables.'
      );
    }

    if (!isAtlasUri(rawUri)) {
      throw new Error(
        'Safety check failed: This provisioning utility requires a verified remote MongoDB Atlas connection (e.g. mongodb+srv://.../ecopulse). Localhost, local MongoDB, and in-memory databases are strictly disallowed.'
      );
    }

    // 2. Collect non-sensitive inputs via standard readline
    const rl = readline.createInterface({ input, output });
    let fullName = '';
    let email = '';
    let collegeId = '';
    let department = '';

    try {
      fullName = await promptTextField(
        rl,
        'Admin Full Name (e.g. Dr. Anita Sharma): ',
        'ADMIN_FULL_NAME'
      );
      email = (
        await promptTextField(
          rl,
          'Admin Email (e.g. admin@campus.edu): ',
          'ADMIN_EMAIL'
        )
      ).toLowerCase();
      collegeId = (
        await promptTextField(
          rl,
          'Admin College ID (e.g. ADM-2026-001): ',
          'ADMIN_COLLEGE_ID'
        )
      ).toUpperCase();
      department = await promptTextField(
        rl,
        'Department [Sustainability Office]: ',
        'ADMIN_DEPARTMENT',
        'Sustainability Office'
      );
    } finally {
      rl.close();
    }

    // 3. Collect password via hidden interactive prompt (untrimmed, no echo)
    const password = await promptHiddenPassword('Admin Password (min 6 characters): ');

    // 4. Validate input fields
    if (!fullName || fullName.length < 2 || fullName.length > 100) {
      throw new Error('Full Name is required and must be between 2 and 100 characters.');
    }

    if (!email || !EMAIL_REGEX.test(email)) {
      throw new Error('A valid email address is required (e.g. admin@campus.edu).');
    }

    if (!collegeId) {
      throw new Error('College ID is required.');
    }

    if (!password || password.length < 6) {
      throw new Error('Password is required and must be at least 6 characters long.');
    }

    // 5. Connect to database
    console.log('\n[Provisioning] Connecting to configured database...');
    await connectDB();
    dbConnected = true;

    // 6. Collision safeguards: refuse if email or collegeId already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      throw new Error(
        `Refusing creation: An account with email "${email}" already exists with role "${existingEmail.role}". Existing accounts cannot be overwritten.`
      );
    }

    const existingCollegeId = await User.findOne({ collegeId });
    if (existingCollegeId) {
      throw new Error(
        `Refusing creation: An account with College ID "${collegeId}" already exists with role "${existingCollegeId.role}". Existing accounts cannot be overwritten.`
      );
    }

    // 7. Hash password matching the existing registration approach
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 8. Persist admin user
    const newAdmin = await User.create({
      fullName,
      collegeId,
      email,
      passwordHash,
      department,
      role: 'admin',
      ecoPoints: 0,
    });

    console.log('\n✓ [SUCCESS] Administrator account provisioned successfully.');
    console.log(`  ID:          ${newAdmin._id}`);
    console.log(`  Full Name:   ${newAdmin.fullName}`);
    console.log(`  Email:       ${newAdmin.email}`);
    console.log(`  College ID:  ${newAdmin.collegeId}`);
    console.log(`  Department:  ${newAdmin.department}`);
    console.log(`  Role:        ${newAdmin.role}`);
    console.log('\nPassword has been securely hashed and stored. Secrets were not printed.');
  } catch (err) {
    console.error(`\n✖ [FAILED] ${err.message}`);
    process.exitCode = 1;
  } finally {
    if (dbConnected) {
      await closeDB();
    }
  }
}

// Execute directly if run as CLI script
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  provisionAdmin().catch((err) => {
    console.error(`\n✖ [FAILED] ${err.message}`);
    process.exit(1);
  });
}
