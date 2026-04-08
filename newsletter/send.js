#!/usr/bin/env node
/**
 * Send an email blast to all subscribers.
 *
 * Usage:
 *   node send.js "Subject Line" ./path/to/content.html
 *
 * The content file is plain HTML — write your essay or update there.
 * Subscribers are read from ./subscribers.json (array of email strings).
 *
 * Setup:
 *   1. cp .env.example .env  and fill in your Resend API key
 *   2. npm install
 *   3. node send.js "My Subject" ./drafts/essay.html
 */

import 'dotenv/config';
import { Resend } from 'resend';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const subject     = process.argv[2];
const contentFile = process.argv[3];

if (!subject || !contentFile) {
  console.error('Usage: node send.js "Subject Line" ./path/to/content.html');
  process.exit(1);
}

const resend      = new Resend(process.env.RESEND_API_KEY);
const from        = process.env.FROM_EMAIL || 'Henry Pan <henry@henrybpan.com>';
const html        = readFileSync(resolve(contentFile), 'utf-8');
const subscribers = JSON.parse(readFileSync(new URL('./subscribers.json', import.meta.url)));

if (subscribers.length === 0) {
  console.log('No subscribers yet. Add emails to subscribers.json first.');
  process.exit(0);
}

console.log(`Sending "${subject}" to ${subscribers.length} subscriber${subscribers.length === 1 ? '' : 's'}...\n`);

let sent = 0;
let failed = 0;

for (const email of subscribers) {
  try {
    await resend.emails.send({ from, to: email, subject, html });
    console.log(`  ✓  ${email}`);
    sent++;
  } catch (err) {
    console.error(`  ✗  ${email} — ${err.message}`);
    failed++;
  }
}

console.log(`\nDone. ${sent} sent${failed > 0 ? `, ${failed} failed` : ''}.`);
