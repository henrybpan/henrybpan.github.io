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
 * - child_process (for git commit + push)
 *
 * Supported actions:
 *   1. Add a Thought   → prepends to _data/thoughts.json
 *   2. Add an Essay    → prepends to _data/essays.json + creates stub HTML
 *   3. Add a Rec       → appends to _data/recs.json
 *
 * After every successful write, the tool asks:
 *   "Publish now? (y/n)"
 * On y: runs git add . && git commit -m "[auto] add [type]" && git push
 * GitHub Pages rebuilds automatically (~30 seconds after push).
 */

'use strict';

const readline     = require('readline');
const fs           = require('fs');
const path         = require('path');
const childProcess = require('child_process');

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
    const lines      = [];
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

// ── Publish helper ──────────────────────────────────────────────────────────
/**
 * Asks whether to publish, then runs git add / commit / push.
 * type        — label used in the prompt ("thought", "essay", "rec")
 * commitMsg   — the message after "[auto] ", e.g. "add thought: first six words..."
 */
async function publishPrompt(type, commitMsg) {
  const answer = await ask('Publish to henrybpan.com now? (y/n): ');
  if (answer.toLowerCase() !== 'y') {
    console.log(dim("Changes saved locally. Run 'node add.js' again or push manually."));
    return;
  }

  try {
    childProcess.execSync('git add .', { stdio: 'inherit' });
    childProcess.execSync(`git commit -m "[auto] ${commitMsg}"`, { stdio: 'inherit' });
    childProcess.execSync('git push', { stdio: 'inherit' });
    console.log(green('✓ Published. Site will update in ~30 seconds.'));
  } catch (e) {
    console.log(red('✗ Publish failed. Check that git is configured and you have push access.'));
    console.log(red(e.message));
    console.log(dim("Your content was saved locally — run 'git push' manually."));
  }
}

// ── ADD THOUGHT ─────────────────────────────────────────────────────────────
async function addThought() {
  const text = await askMultiline('Thought:');
  if (!text) { console.log(red('No text entered.')); return false; }

  const date  = getOrdinalDate();
  const entry = { date, text };

  const preview = `Date: ${date}\nText: ${text}`;
  if (!(await confirm(preview))) { console.log(dim('Cancelled.')); return false; }

  const filePath = path.join(__dirname, '_data', 'thoughts.json');
  const data     = readJson(filePath);
  data.unshift(entry); // prepend (newest first)
  writeJson(filePath, data);
  console.log(green('✓ Thought added.'));

  // Build commit message from first 6 words of the thought
  const first6 = text.split(/\s+/).slice(0, 6).join(' ');
  await publishPrompt('thought', `add thought: ${first6}...`);
  return true;
}

// ── ADD ESSAY ───────────────────────────────────────────────────────────────
async function addEssay() {
  const title   = await ask('Title: ');
  if (!title) { console.log(red('No title entered.')); return false; }
  const excerpt = await ask('Excerpt (one sentence): ');

  const date = getOrdinalDate();
  const slug = toSlug(title);

  const preview = `Title:   ${title}\nDate:    ${date}\nSlug:    ${slug}\nExcerpt: ${excerpt}`;
  if (!(await confirm(preview))) { console.log(dim('Cancelled.')); return false; }

  // Prepend to essays.json
  const jsonPath = path.join(__dirname, '_data', 'essays.json');
  const data     = readJson(jsonPath);
  data.unshift({ title, date, slug, excerpt });
  writeJson(jsonPath, data);

  // Create essay stub HTML file
  const stubPath    = path.join(__dirname, 'essays', `${slug}.html`);
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

  // Ask whether to publish the stub now or write first
  console.log(dim(`\nOpen essays/${slug}.html to write your content before publishing.`));
  const choice = await ask('Publish stub now, or write first? (publish/write): ');
  if (choice.toLowerCase() === 'write') {
    console.log(dim("Okay — run 'node add.js' and publish when you're ready."));
    return false; // skip "Add another?" prompt per spec
  }

  await publishPrompt('essay', `add essay: ${title}`);
  return true;
}

// ── ADD REC ─────────────────────────────────────────────────────────────────
async function addRec() {
  const title  = await ask('Title: ');
  if (!title) { console.log(red('No title entered.')); return false; }
  const author = await ask('Author / Creator: ');

  // Type selection
  const typeChoice = await ask('Type: (1) Book  (2) Essay  (3) Podcast  (4) Music — enter number: ');
  const typeMap    = {
    '1': { type: 'books',    tag: 'Book'    },
    '2': { type: 'essays',   tag: 'Essay'   },
    '3': { type: 'podcasts', tag: 'Podcast' },
    '4': { type: 'music',    tag: 'Music'   },
  };
  const selected = typeMap[typeChoice.trim()];
  if (!selected) { console.log(red('Invalid type selection.')); return false; }

  const annotation = await ask('Your one-line annotation: ');
  const imageInput = await ask('Image filename (or press Enter to skip): ');
  const image      = imageInput ? `/assets/images/recs/${imageInput}` : null;

  const entry   = { title, author, type: selected.type, tag: selected.tag, annotation, image };
  const preview = `Title:      ${title}\nAuthor:     ${author}\nType:       ${selected.tag}\nAnnotation: ${annotation}\nImage:      ${image || '(none)'}`;
  if (!(await confirm(preview))) { console.log(dim('Cancelled.')); return false; }

  const filePath = path.join(__dirname, '_data', 'recs.json');
  const data     = readJson(filePath);
  data.push(entry); // append
  writeJson(filePath, data);
  console.log(green('✓ Rec added.'));
  if (imageInput) {
    console.log(dim(`Drop the image file at assets/images/recs/${imageInput}`));
  }

  await publishPrompt('rec', `add rec: ${title}`);
  return true;
}

// ── MAIN MENU ───────────────────────────────────────────────────────────────
/**
 * Shows the main menu, dispatches to the selected action, and returns whether
 * to offer the "Add another?" prompt (false when essay 'write' path is taken).
 */
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
    case '1': return await addThought();
    case '2': return await addEssay();
    case '3': return await addRec();
    case '4':
      console.log('Goodbye.');
      rl.close();
      process.exit(0);
      break;
    default:
      console.log(red('Invalid option. Try again.'));
      return false;
  }
}

// ── ENTRY POINT ─────────────────────────────────────────────────────────────
async function run() {
  let offerAgain = await showMenu();

  while (true) {
    // Skip "Add another?" when the essay 'write' path exits gracefully
    if (!offerAgain) {
      rl.close();
      process.exit(0);
    }
    const again = await ask('\nAdd another? (y/n): ');
    if (again.toLowerCase() !== 'y') {
      console.log('Goodbye.');
      rl.close();
      process.exit(0);
    }
    offerAgain = await showMenu();
  }
}

run();
