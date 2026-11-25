# Say It Professionally

A React app for learning English in a practical, easy way. It turns rude or blunt phrases into respectful, professional English, and includes a large library of proverbs, idioms, phrasal verbs, natural phrases and business expressions. Every entry has a meaning and two examples.

## Features

- **💼 How to Say It Professionally** (main tab): rude or blunt phrases turned into respectful versions. Each one shows what to avoid, why the new version works, and two examples.
- **📚 English Sayings & Expressions** (second tab):
  - Proverbs
  - Idioms & Expressions
  - Phrasal Verbs
  - Natural English ("I'm ready" → "I'm all set")
  - Business English (meetings, emails, calls, presentations, negotiation and more)
- Category filters, search, expand or collapse all, and a 🎲 Random button
- Tap any entry to open a dropdown with the meaning and examples
- "Extra" tag marks entries added beyond the original source lists
- Light and dark mode, and works on mobile

## Getting started

You need [Node.js](https://nodejs.org/) 18 or newer.

Install dependencies (first time only):

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Then open the address shown in the terminal, usually http://localhost:5173/. Press `Ctrl + C` in the terminal to stop it.

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Project structure

```
src/
├── App.jsx        Main app: tabs, search, filters and dropdowns
├── main.jsx       React entry point
├── styles.css     Styles (light and dark mode)
├── data.js        Categories, types and proverbs; combines all content into one list
├── polite.js      How to Say It Professionally (rude → respectful)
├── idioms.js      Idioms & expressions
├── phrasal.js     Phrasal verbs
├── natural.js     Everyday → natural English
└── business.js    Business expressions and collocations
```

## Adding content

Each content file is a list of arrays. Add one line to add a new entry.

**Professional phrase** (`src/polite.js`):

```js
['polRequests', 'Could you please...?', 'Give me that.', 'Why it works.',
  'Example one.', 'Example two.', false],
// [category, respectful phrase, rude phrase, why it works, example 1, example 2, fromOriginalList]
```

**Idiom** (`src/idioms.js`):

```js
['everyday', 'A piece of cake', 'Something very easy to do.',
  'Example one.', 'Example two.'],
// [category, idiom, meaning, example 1, example 2]
```

Category keys are defined in `src/data.js` (`CATEGORIES`), `src/business.js` (`BUSINESS_CATEGORIES`) and `src/polite.js` (`POLITE_CATEGORIES`).

## Content sources and credits

Some lists in this app were collected from public learning posts, including English by Siddharth, English Learner, @englishwithsimi, the "200 Business Expressions" posters and a "Rude → Respectful English" poster. Meanings, examples and explanations were written for this app.

Before using this app commercially, rewrite any source lists in your own words and confirm you have the right to use them. [000 - Legal review of content rights before commercial use]

## Built with

- [React](https://react.dev/) 18
- [Vite](https://vite.dev/) 6

## Licence

[000 - Choose a licence, e.g. "All rights reserved" or MIT]

## Author

[000 - Your name and contact or LinkedIn link]
