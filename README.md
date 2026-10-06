# Brave New World reader

This branch holds the GitHub Pages reader. It loads `brave.txt` from the
master branch at runtime, so edits to the text show up without changing this
branch.

- `index.html`: page shell
- `css/reader.css`: styles and themes
- `js/main.js`: entry point, routing (`#/` cover, `#/<chapter>`), reading position
- `js/book.js`: parses `brave.txt` into chapters
- `js/views.js`: cover and chapter HTML, including verse and `§` section breaks
- `js/toc.js`, `js/prefs.js`, `js/storage.js`: contents drawer, theme and text size, localStorage
