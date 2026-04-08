#!/usr/bin/env node
/**
 * Add one or more subscribers to the list.
 *
 * Usage:
 *   node add.js someone@email.com
 *   node add.js a@b.com c@d.com e@f.com
 */

import { readFileSync, writeFileSync } from 'fs';

const emails = process.argv.slice(2).map(e => e.trim().toLowerCase());

if (emails.length === 0) {
  console.error('Usage: node add.js email@example.com');
  process.exit(1);
}

const path        = new URL('./subscribers.json', import.meta.url);
const subscribers = JSON.parse(readFileSync(path, 'utf-8'));
const existing    = new Set(subscribers);

let added = 0;
for (const email of emails) {
  if (existing.has(email)) {
    console.log(`  –  ${email} (already on list)`);
  } else {
    subscribers.push(email);
    existing.add(email);
    console.log(`  +  ${email}`);
    added++;
  }
}

writeFileSync(path, JSON.stringify(subscribers, null, 2) + '\n');
console.log(`\n${added} added. Total: ${subscribers.length} subscriber${subscribers.length === 1 ? '' : 's'}.`);
