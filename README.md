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

## Usage counter (visits per day)

A small Python server counts how many times the app is opened each day, and how many requests each endpoint receives. It uses only the Python standard library, so there is nothing to install. Only numbers are stored, never IP addresses, cookies or personal data.

Start it in a second terminal, alongside `npm run dev`:

```bash
python3 server/server.py
```

| Endpoint | What it does |
|---|---|
| `POST /api/visit` | The app calls this once each time it is opened |
| `GET /api/stats` | Counts per day and per endpoint, as JSON |
| `GET /admin` | Admin page with visits per day and requests per endpoint |

Open the admin page at http://localhost:5173/admin (through the app) or http://127.0.0.1:8787/admin (directly). Unknown paths are counted as "other (not found)".

The counts are saved in `server/usage.db` (not saved in git).

### Admin login

The admin page (and `/api/stats`) always asks for a username and password.

- **First start:** if no password is set, the server creates a random one, saves it in `server/.env`, and prints it once in the terminal. The username is `admin`.
- **Choose your own:** copy `server/.env.example` to `server/.env`, set `ADMIN_PASSWORD`, and restart the server.
- **Forgot it?** Open `server/.env` to see it, or delete the `ADMIN_PASSWORD` line and restart to get a new one.
- `server/.env` is ignored by git, so the password is never committed.
- A wrong password waits 1 second before answering, to slow down guessing.
- Your browser remembers the login until you close it. To log out, close the browser window or use a private window.

When you put the server online, use a strong password and HTTPS (most hosting services provide HTTPS automatically), because the browser sends the password with every admin request. If the counter is not running, the app still works; visits just aren't counted.

The app explains what is counted in its **Privacy notice** (link at the bottom of the page).

## Project structure

```
server/
├── server.py      Usage counter and admin page (Python, standard library only)
└── .env.example   Example admin login (copy to server/.env)
src/
├── usage.js       Sends one visit count when the app opens
├── App.jsx        Main app (MUI): tabs, search, filters, dropdowns, privacy notice
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
- [MUI (Material UI)](https://mui.com/)
- Python 3 (usage counter)

## Licence

[000 - Choose a licence, e.g. "All rights reserved" or MIT]

## Author

[000 - Your name and contact or LinkedIn link]
