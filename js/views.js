// HTML builders for the cover and chapter pages. These return strings and
// don't touch the DOM.

import { REPO, WORDS_PER_MINUTE } from './config.js';

export function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Escapes text and turns double hyphens into em dashes.
function typeset(s) {
  return escapeHtml(s).replace(/--/g, '—');
}

export function chapterHref(chapter) {
  return `#/${chapter.index + 1}`;
}

// "Chapter Twelve"
export function chapterTitle(chapter) {
  return `Chapter ${chapter.name}`;
}

function readingTime(words) {
  const minutes = words / WORDS_PER_MINUTE;
  return minutes / 60 >= 1.5
    ? `${Math.round(minutes / 60)} hours`
    : `${Math.max(1, Math.round(minutes))} min`;
}


// ---------- Chapter text ----------

const SECTION_BREAK = /^§\s*\d+$/;

// Prose lines end with a space; verse lines don't, and are short.
const MAX_VERSE_LENGTH = 70;

function isVerseLine(line) {
  return line.trim() !== '' && !/\s$/.test(line) && line.length <= MAX_VERSE_LENGTH;
}

// Each line is a paragraph, except that runs of two or more verse lines are
// kept together as a stanza. Blank lines end a stanza.
function proseHtml(lines) {
  const out = [];
  let stanza = [];

  function flushStanza() {
    if (stanza.length > 1) {
      out.push(`<p class="verse">${stanza.map(typeset).join('\n')}</p>`);
    } else if (stanza.length) {
      out.push(`<p>${typeset(stanza[0])}</p>`);
    }
    stanza = [];
  }

  for (const line of lines) {
    const text = line.trim();

    if (isVerseLine(line) && !SECTION_BREAK.test(text)) {
      stanza.push(text);
      continue;
    }

    flushStanza();
    if (!text) continue;

    out.push(SECTION_BREAK.test(text)
      ? `<p class="section">${escapeHtml(text)}</p>`
      : `<p>${typeset(text)}</p>`);
  }
  flushStanza();

  return out.join('');
}


// ---------- Cover page ----------

function chapterCardHtml(chapter) {
  return `
    <a href="${chapterHref(chapter)}">
      <b>${escapeHtml(chapterTitle(chapter))}</b>
      <span>${readingTime(chapter.words)}</span>
    </a>`;
}

// `resume` is the chapter the reader last had open, or null.
export function coverHtml(book, resume) {
  const first = book.chapters[0];

  const actions = resume
    ? `<a class="primary" href="${chapterHref(resume)}">Continue · ${escapeHtml(chapterTitle(resume))} →</a>
       <a class="secondary" href="${chapterHref(first)}">Start from the beginning</a>`
    : `<a class="primary" href="${chapterHref(first)}">Start reading →</a>`;

  return `
    <section class="cover">
      <div class="kicker">A novel, 1932</div>
      <h1>${escapeHtml(book.title)}</h1>
      <p class="by">${escapeHtml(book.author)}</p>
      <p class="blurb">
        Huxley’s novel of the World State, Bernard Marx and the Savage.
        Pick up where you left off, or start at the Central London Hatchery.
      </p>

      <div class="stats">
        <span>${book.chapters.length} chapters</span>
        <span>${Math.round(book.words / 1000)}k words</span>
        <span>about ${readingTime(book.words)} of reading</span>
      </div>

      <div class="cta">${actions}</div>

      <h2>Contents</h2>
      <div class="parts">${book.chapters.map(chapterCardHtml).join('')}</div>

      <p class="foot">
        Text from <a href="https://github.com/${REPO}">${REPO}</a>.
      </p>
    </section>`;
}


// ---------- Chapter page ----------

function chapterNavHtml(book, chapter) {
  const prev = book.chapters[chapter.index - 1];
  const next = book.chapters[chapter.index + 1];

  const prevLink = prev
    ? `<a class="prev" href="${chapterHref(prev)}"><small>← Previous</small>${escapeHtml(chapterTitle(prev))}</a>`
    : '';
  const nextLink = next
    ? `<a class="next" href="${chapterHref(next)}"><small>Next →</small>${escapeHtml(chapterTitle(next))}</a>`
    : `<a class="next" href="#/"><small>The end</small>Back to the cover</a>`;

  return `<nav class="nav">${prevLink}${nextLink}</nav>`;
}

export function chapterHtml(book, chapter) {
  return `
    <article class="chapter">
      <p class="part">${escapeHtml(book.title)}</p>
      <h1>${escapeHtml(chapterTitle(chapter))}</h1>
      <div class="prose">${proseHtml(chapter.lines)}</div>
    </article>
    ${chapterNavHtml(book, chapter)}`;
}
