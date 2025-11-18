# Voca PTE — Vocabulary SRS Starter (React + Vite + Supabase)

Pure-frontend vocabulary learning app with Supabase Auth/Postgres and browser speech synthesis. Designed to host on GitHub Pages at zero cost.

## Project structure
```
.
├─ .github/workflows/deploy.yml   # GitHub Pages workflow
├─ supabase_schema.sql            # Tables + RLS policies + sample data
├─ .env.example                   # Env var template
├─ index.html
├─ package.json / tsconfig* / vite.config.ts
└─ src
   ├─ App.tsx
   ├─ main.tsx
   ├─ styles.css
   ├─ supabaseClient.ts
   ├─ types.ts
   ├─ context/AuthContext.tsx
   ├─ utils/{speech,spacedRepetition}.ts
   ├─ components/{Layout,StatCard}.tsx
   └─ pages/{Landing,Login,Signup,Dashboard,Words,Review}Page.tsx
```

## Supabase setup
1) Create a Supabase project (free tier).  
2) In the SQL editor, run `supabase_schema.sql`. This creates:
   - `profiles`, `words`, `user_word_progress`, optional `study_log`
   - RLS policies so users only see/update their own data
   - Sample words (safe to remove).
3) Note your API URL and anon public key from **Settings → API**.
4) In the Supabase dashboard **Authentication → Settings**, ensure email/password is enabled.

### Configure environment variables
Create `.env` (or `.env.local`) based on `.env.example`:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

## Run locally
```bash
npm install
npm run dev
```
Open the printed localhost URL. Auth, database, and storage calls speak directly to Supabase from the browser.

## Deploy to GitHub Pages
1) Push this repo to GitHub.  
2) Add repo Secrets: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.  
3) Ensure default branch is `main` (or tweak workflow).  
4) Enable Pages: Settings → Pages → Source: “GitHub Actions”.  
5) The provided workflow (`.github/workflows/deploy.yml`) builds and deploys `dist/` with Vite’s `HashRouter`-friendly config (`base: './'`), so refreshes do not 404.

Manual deploy alternative:
```bash
npm install
npm run build
npx gh-pages -d dist   # if you prefer the gh-pages CLI
```

## App notes
- Routing uses `HashRouter` to avoid GitHub Pages 404s.  
- Pronunciation uses the browser’s `speechSynthesis` (US/UK toggle).  
- Spaced repetition logic lives in `src/utils/spacedRepetition.ts` and updates Supabase on each response.  
- Dashboard shows due count, total studied, and total reviews.  
- Words list supports basic search and tag filtering (expects `tags` array).

## Minimal data seeding
- Words: insert rows into `public.words`.  
- Progress: inserting rows into `user_word_progress` (per user) seeds initial schedules; default `next_review_at` is `now()` so new items appear immediately.

## Troubleshooting
- Blank screen/local 404: ensure `.env` is loaded and Vite was restarted after changes.  
- Refresh 404 on Pages: confirm HashRouter is in use (already configured) and Pages workflow succeeded.  
- RLS errors: make sure you ran the SQL file and are authenticated before hitting protected tables.
# Vocab_PTE
