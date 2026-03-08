/**
 * add.js
 * ======
 * CLI tool to add content to henrybpan.com without opening VS Code.
 * Run with: node add.js
 *
 * No npm install required — uses only Node.js built-ins:
 * - readline (for terminal prompts)
 * - fs (for reading/writing JSON and HTML)
 * - path (for file paths)
 *
 * Supported actions:
 *   1. Add a Thought   → prepends to _data/thoughts.json
 *   2. Add an Essay    → prepends to _data/essays.json + creates stub HTML
 *   3. Add a Rec       → appends to _data/recs.json
 */

'use strict';

const readline = require('readline');
const fs       = require('fs');
const path     = require('path');

// ── ANSI color helpers ──────────────────────────────────────────────────────
const green  = (s) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const dim    = (s) => `\x1b[2m${s}\x1b[0m`;
const bold   = (s) => `\x1b[1m${s}\x1b[0m`;
const red    = (s) => `\x1b[31m${s}\x1b[0m`;

// ── Readline interface ──────────────────────────────────────────────────────
const rl = readline.createInterface({
  input:  process.stdin,
  output: process.stdout,
});

// Handle Ctrl+C gracefully
rl.on('SIGINT', () => {
  console.log('\nGoodbye.');
  process.exit(0);
});

// Promisified question helper
function ask(prompt) {
  return new Promise((resolve) => {
    rl.question(yellow(prompt), (answer) => resolve(answer.trim()));
  });
}

// ── Date helper ─────────────────────────────────────────────────────────────
/**
 * Returns today's date as "Month Dth, Year" with correct ordinal suffix.
 * Handles 11th/12th/13th edge cases correctly.
 */
function getOrdinalDate() {
  const now    = new Date();
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const day    = now.getDate();
  const suffix = (day === 11 || day === 12 || day === 13) ? 'th'
               : (day % 10 === 1) ? 'st'
               : (day % 10 === 2) ? 'nd'
               : (day % 10 === 3) ? 'rd' : 'th';
  return `${months[now.getMonth()]} ${day}${suffix}, ${now.getFullYear()}`;
}

// ── Slug generator ──────────────────────────────────────────────────────────
/** Converts a title to a URL-safe slug: lowercase, hyphens, no special chars. */
function toSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

// ── JSON file helpers ───────────────────────────────────────────────────────
/** Reads a JSON file and returns parsed array. Creates file with [] if missing. */
function readJson(filePath) {
  if (!fs.existsSync(filePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.error(red(`Error reading ${filePath}: ${e.message}`));
    return [];
  }
}

/** Writes an array back to a JSON file with 2-space indentation. */
function writeJson(filePath, data) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

// ── Multi-line input helper ─────────────────────────────────────────────────
/**
 * Collects multi-line input from the user.
 * Ends when the user presses Enter twice (two consecutive blank lines).
 */
function askMultiline(prompt) {
  return new Promise((resolve) => {
    console.log(yellow(prompt));
    console.log(dim('  (Press Enter twice when done)'));
    const lines = [];
    let lastWasBlank = false;

    const handler = (line) => {
      if (line === '' && lastWasBlank) {
        // Two consecutive blank lines — done
        rl.removeListener('line', handler);
        resolve(lines.join('\n').trimEnd());
      } else {
        lines.push(line);
        lastWasBlank = (line === '');
      }
    };
    rl.on('line', handler);
  });
}

// ── Confirm helper ──────────────────────────────────────────────────────────
/** Shows a preview and asks y/n. Returns true if user confirms. */
async function confirm(preview) {
  console.log('\n' + dim('─'.repeat(40)));
  console.log(preview);
  console.log(dim('─'.repeat(40)));
  const answer = await ask('Add this? (y/n): ');
  return answer.toLowerCase() === 'y';
}

// ── ADD THOUGHT ─────────────────────────────────────────────────────────────
async function addThought() {
  const text = await askMultiline('Thought:');
  if (!text) { console.log(red('No text entered.')); return; }

  const date  = getOrdinalDate();
  const entry = { date, text };

  const preview = `Date: ${date}\nText: ${text}`;
  if (!(await confirm(preview))) { console.log(dim('Cancelled.')); return; }

  const filePath = path.join(__dirname, '_data', 'thoughts.json');
  const data     = readJson(filePath);
  data.unshift(entry); // prepend (newest first)
  writeJson(filePath, data);
  console.log(green('✓ Thought added.'));
}

// ── ADD ESSAY ───────────────────────────────────────────────────────────────
async function addEssay() {
  const title   = await ask('Title: ');
  if (!title) { console.log(red('No title entered.')); return; }
  const excerpt = await ask('Excerpt (one sentence): ');

  const date = getOrdinalDate();
  const slug = toSlug(title);

  const preview = `Title:   ${title}\nDate:    ${date}\nSlug:    ${slug}\nExcerpt: ${excerpt}`;
  if (!(await confirm(preview))) { console.log(dim('Cancelled.')); return; }

  // Prepend to essays.json
  const jsonPath = path.join(__dirname, '_data', 'essays.json');
  const data     = readJson(jsonPath);
  data.unshift({ title, date, slug, excerpt });
  writeJson(jsonPath, data);

  // Create essay stub HTML file
  const stubPath = path.join(__dirname, 'essays', `${slug}.html`);
  const stubContent =
`---
layout: default
title: ${title}
---
<!-- essays/${slug}.html — Created ${date}. Add your content below. -->

<section class="content">
  <a href="/essays/" class="back-link">&larr; Essays</a>
  <h1>${title}</h1>
  <p class="date">${date}</p>
  <div class="essay-text">
    <p>Write your essay here.</p>
  </div>
</section>
`;
  fs.writeFileSync(stubPath, stubContent, 'utf8');
  console.log(green(`✓ Essay stub created at essays/${slug}.html`));
}

// ── ADD REC ─────────────────────────────────────────────────────────────────
async function addRec() {
  const title  = await ask('Title: ');
  if (!title) { console.log(red('No title entered.')); return; }
  const author = await ask('Author / Creator: ');

  // Type selection
  const typeChoice = await ask('Type: (1) Book  (2) Essay  (3) Podcast  (4) Music — enter number: ');
  const typeMap    = { '1': { type: 'books', tag: 'Book' }, '2': { type: 'essays', tag: 'Essay' }, '3': { type: 'podcasts', tag: 'Podcast' }, '4': { type: 'music', tag: 'Music' } };
  const selected   = typeMap[typeChoice.trim()];
  if (!selected) { console.log(red('Invalid type selection.')); return; }

  const annotation = await ask('Your one-line annotation: ');
  const imageInput = await ask('Image filename (or press Enter to skip): ');
  const image      = imageInput ? `/assets/images/recs/${imageInput}` : null;

  const entry   = { title, author, type: selected.type, tag: selected.tag, annotation, image };
  const preview = `Title:      ${title}\nAuthor:     ${author}\nType:       ${selected.tag}\nAnnotation: ${annotation}\nImage:      ${image || '(none)'}`;
  if (!(await confirm(preview))) { console.log(dim('Cancelled.')); return; }

  const filePath = path.join(__dirname, '_data', 'recs.json');
  const data     = readJson(filePath);
  data.push(entry); // append
  writeJson(filePath, data);
  console.log(green('✓ Rec added.'));
  if (imageInput) {
    console.log(dim(`Drop the image file at assets/images/recs/${imageInput}`));
  }
}

// ── MAIN MENU ───────────────────────────────────────────────────────────────
/** Shows the main menu and dispatches to the selected action. */
async function showMenu() {
  console.log('\n' + bold('henrybpan.com — Content Manager'));
  console.log(dim('─────────────────────────────────'));
  console.log('  1. Add Thought');
  console.log('  2. Add Essay');
  console.log('  3. Add Rec');
  console.log('  4. Exit');
  console.log(dim('─────────────────────────────────'));

  const choice = await ask('Choose an option: ');

  switch (choice) {
    case '1': await addThought(); break;
    case '2': await addEssay();   break;
    case '3': await addRec();     break;
    case '4':
      console.log('Goodbye.');
      rl.close();
      process.exit(0);
      break;
    default:
      console.log(red('Invalid option. Try again.'));
  }
}

/** After an action, ask whether to continue or exit. */
async function run() {
  await showMenu();

  while (true) {
    const again = await ask('\nAdd another? (y/n): ');
    if (again.toLowerCase() !== 'y') {
      console.log('Goodbye.');
      rl.close();
      process.exit(0);
    }
    await showMenu();
  }
}

// ── ENTRY POINT ─────────────────────────────────────────────────────────────
run();
