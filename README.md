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

To run the Vite app together with the Netlify Functions locally:

```bash
npm run dev:netlify
```

Then open http://localhost:8888/.

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Usage counter (visits per day)

A small JavaScript serverless backend counts how many times the app is opened each day and how many requests each endpoint receives. It runs as Netlify Functions and stores counts in Netlify Database (Postgres). Only numbers are stored, never IP addresses, cookies or personal data.

| Endpoint | What it does |
|---|---|
| `POST /api/visit` | The app calls this once each time it is opened |
| `GET /api/stats` | Counts per day and per endpoint, as JSON |
| `GET /admin` | Admin page with visits per day and requests per endpoint |

Open the admin page at http://localhost:8888/admin.

### Admin login

The admin page (and `/api/stats`) always asks for a username and password.

- Copy `.env.example` to `.env`.
- Set `ADMIN_USER` and `ADMIN_PASSWORD` locally or in Netlify's private environment variables.
- Never commit real credentials.
- Deploy the app and functions from the repository through Netlify.
- Connect a Netlify Database to the project. Netlify provides the database connection variables used by `@netlify/neon`.

Use a strong password and HTTPS for the deployed admin login. If the counter is unavailable, the app still works and visits are not counted.

The app explains what is counted in its **Privacy notice** (link at the bottom of the page).

## Deploy to Netlify

1. Push the repository to GitHub.
2. Create a Netlify project linked to the GitHub repository.
3. Confirm the build settings use `npm run build` and publish the `dist` directory.
4. Add a Netlify Database and connect it to the project.
5. Set `ADMIN_USER` and `ADMIN_PASSWORD` as private Netlify environment variables.
6. Deploy the project.

The `netlify.toml` file configures the Vite build, Netlify Functions, API routes and `/admin` route.

## Project structure

```
netlify/
└── functions/
    ├── api.mjs          /api/visit and /api/stats
    ├── admin.mjs        /admin
    ├── _usage-auth.mjs  Basic authentication
    └── _usage-db.mjs    Postgres storage
netlify.toml
.env.example
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
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Netlify Database](https://docs.netlify.com/database/overview/)
- Node.js


## Author

Maria Estela Souza  
- [Linkedin](https://www.linkedin.com/in/maria-estela-souza-737ab216a/)

