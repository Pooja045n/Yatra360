#!/usr/bin/env node
/**
 * Seed demo credentials for Yatra360.
 * Usage:
 *   node backend/scripts/seedDemoUsers.js
 * (Ensure you have MONGO_URI / JWT_SECRET set in environment or .env in backend directory.)
 */
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const { buildMongoUri } = require('../config/db');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const MONGO_URI = buildMongoUri();

async function run() {
  try {
  await mongoose.connect(MONGO_URI);
  console.log('[seed] Connected to Mongo ->', mongoose.connection.name);

    const demoUsers = [
      {
        name: 'Demo Admin',
        email: 'admin@yatra360.demo',
        password: 'AdminPass123!',
        isAdmin: true,
        role: 'admin',
        preferences: { interests: ['heritage','adventure'], budgetTier: 'mid' }
      },
      {
        name: 'Demo Traveler',
        email: 'user@yatra360.demo',
        password: 'UserPass123!',
        isAdmin: false,
        role: 'user',
        preferences: { interests: ['culture','food'], budgetTier: 'budget' }
      },
      {
        name: 'Explorer Beta',
        email: 'explorer@yatra360.demo',
        password: 'Explorer123!',
        isAdmin: false,
        role: 'user',
        preferences: { interests: ['nature','photography'], budgetTier: 'premium' }
      }
    ];

    for (const u of demoUsers) {
      const existing = await User.findOne({ email: u.email });
      if (existing) {
        console.log(`[seed] Skipping existing ${u.email}`);
        continue;
      }
      const hash = await bcrypt.hash(u.password, 10);
      await User.create({
        name: u.name,
        email: u.email,
        password: hash,
        isAdmin: u.isAdmin,
        role: u.role,
        preferences: u.preferences
      });
      console.log(`[seed] Created user: ${u.email} (password: ${u.password})`);
    }

    console.log('\nSeed complete. Demo credentials:');
    console.log(' Admin -> email: admin@yatra360.demo | password: AdminPass123!');
    console.log(' User  -> email: user@yatra360.demo  | password: UserPass123!');
    console.log(' User  -> email: explorer@yatra360.demo | password: Explorer123!');
  } catch (e) {
    console.error('[seed] Error:', e);
  } finally {
    await mongoose.disconnect();
    console.log('[seed] Disconnected');
  }
}

run();
