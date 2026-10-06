// Parses brave.txt into chapters.
//
// The text has no parts: each chapter starts with a "Chapter One" heading, and
// some chapters are split into sections by "§ 2" lines. Prose has one
// paragraph per line; verse has one line per line of the poem.
//
// Returned shape:
//   {
//     title, author, words,
//     chapters: [chapter, ...]   // in reading order
//   }
//   chapter = { name, numeral, lines, index, words, wordsBefore }
//
// `name` is the heading word ("Twelve"); `numeral` is its number as a string
// ("12"), short enough for the contents grid.

import { BOOK_AUTHOR, BOOK_TITLE } from './config.js';

const CHAPTER_HEADING = /^Chapter ([A-Z][a-z]+)$/;

function countWords(lines) {
  return lines.join(' ').split(/\s+/).filter(Boolean).length;
}

// Groups lines into chapters. Anything before the first heading (the title
// page) is skipped.
function splitChapters(lines) {
  const chapters = [];
  let chapter = null;

  for (const line of lines) {
    const match = line.trim().match(CHAPTER_HEADING);
    if (match) {
      chapter = { name: match[1], numeral: String(chapters.length + 1), lines: [] };
      chapters.push(chapter);
      continue;
    }

    if (chapter) chapter.lines.push(line);
  }

  return chapters;
}

export function parseBook(text) {
  const lines = text.replace(/^﻿/, '').replace(/\r\n?/g, '\n').split('\n');
  const chapters = splitChapters(lines);

  let words = 0;
  chapters.forEach((chapter, index) => {
    chapter.index = index;
    chapter.words = countWords(chapter.lines);
    chapter.wordsBefore = words;
    words += chapter.words;
  });

  return { title: BOOK_TITLE, author: BOOK_AUTHOR, chapters, words };
}
