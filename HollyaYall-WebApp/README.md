# HollaYall! — Houston Help Board

HollaYall! is a polished static React app for an anonymous Houston-focused help board. It lets people ask local questions, reply anonymously, vote on helpful answers, mark posts solved, report unsafe content, and browse with filters/search/sorting.

Tagline: **Ask anonymously. Help locally. Make Houston easier.**

## What is included

- React + Vite static frontend
- Tailwind CSS responsive UI
- Supabase PostgreSQL schema
- Row Level Security policies
- Anonymous Supabase Auth ownership model
- Demo mode when Supabase env vars are missing
- Anonymous posting and replying
- Helpful voting for posts and replies
- Duplicate vote prevention through a database unique constraint
- Solved/accepted answer flow
- Reports for posts and replies
- Search, filters, date range filters, and advanced sorting
- Loading, empty, error, and toast states
- README deployment instructions

## Tech stack

- Frontend: React + Vite
- Styling: Tailwind CSS
- Database: Supabase PostgreSQL
- Supabase client: `@supabase/supabase-js`
- Hosting: GitHub Pages, Netlify, or Vercel static hosting

## Project structure

```txt
hollayall/
  index.html
  package.json
  postcss.config.js
  tailwind.config.js
  vite.config.js
  .env.example
  README.md
  supabase/
    schema.sql
  src/
    App.jsx
    main.jsx
    index.css
    components/
      AskQuestionForm.jsx
      Badges.jsx
      CommunityRulesCard.jsx
      EmptyState.jsx
      HelpfulButton.jsx
      HeroSection.jsx
      LoadingSpinner.jsx
      Navbar.jsx
      PostCard.jsx
      PostDetail.jsx
      PostFilters.jsx
      ReplyCard.jsx
      ReplyForm.jsx
      ReportButton.jsx
      StatsCards.jsx
      Toast.jsx
    constants/
      options.js
    data/
      demoData.js
    lib/
      anonymousIdentity.js
      api.js
      supabase.js
    pages/
      AskPage.jsx
      BoardPage.jsx
      HomePage.jsx
      PostPage.jsx
    utils/
      filters.js
      format.js
```

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment file:

```bash
cp .env.example .env
```

3. For demo-only preview, leave `.env` unchanged and run:

```bash
npm run dev
```

The app will show a demo mode banner and use in-memory sample posts. Changes will reset on page refresh.

## Supabase setup

1. Create a new Supabase project.
2. Open **SQL Editor** in the Supabase dashboard.
3. Paste and run the contents of `supabase/schema.sql`.
4. Go to **Authentication > Sign In / Providers** and enable **Anonymous Sign-Ins**.
5. Go to **Project Settings > API** and copy:
   - Project URL
   - `anon` public key
6. Add them to `.env`:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

7. Restart the dev server:

```bash
npm run dev
```

## Why anonymous Supabase Auth is used

The app signs users in anonymously through Supabase Auth. This gives each visitor an `auth.uid()` without collecting an email, phone number, real name, or public username. The database policies use that anonymous user ID to let creators mark their own posts solved and to prevent people from directly managing other users' vote/report records.

## Security notes

- Never place a Supabase service role key in this frontend project.
- Only use `VITE_SUPABASE_ANON_KEY` in frontend code.
- RLS is enabled on all tables.
- Public users can read visible/non-flagged posts and replies.
- Authenticated anonymous users can insert posts and replies.
- Helpful vote records are unique by target and anonymous user.
- Report details are insertable but not publicly readable.
- Posts/replies with 5 or more reports are hidden by the app query and RLS select policies.
- The schema includes trigger-maintained counts for replies, helpful votes, and reports.
- The schema includes a trigger that prevents client-side edits to post fields except solved/accepted-answer state.

## Prototype limitations

This is designed as a serious portfolio or hackathon project, not a complete production moderation system.

Known limitations:

- No admin dashboard is included.
- Reports hide content after a threshold, but there is no moderator review UI yet.
- Demo mode uses in-memory data only.
- Users remain anonymous, but browser localStorage can be cleared, which changes the display name.
- Supabase Anonymous Sign-Ins must be enabled for database writes to work.
- For production, add rate limiting, stronger abuse detection, audit logs, and admin review tooling.

## Available scripts

```bash
npm run dev      # Start Vite dev server
npm run build    # Build static assets
npm run preview  # Preview production build locally
npm run lint     # Run ESLint if dependencies are installed
```

## Deploy to Vercel

1. Push this project to GitHub.
2. Import the repository in Vercel.
3. Set environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Build command: `npm run build`
5. Output directory: `dist`
6. Deploy.

## Deploy to Netlify

1. Push this project to GitHub.
2. Add a new Netlify site from Git.
3. Set environment variables in Site Settings.
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Deploy.

## Deploy to GitHub Pages

Vite can be deployed to GitHub Pages. For a repository-hosted path, add a `base` option to `vite.config.js` if needed:

```js
export default defineConfig({
  base: '/your-repo-name/',
  plugins: [react()]
});
```

Then build and publish the `dist` folder using your preferred GitHub Pages workflow.

## App philosophy

HollaYall! intentionally avoids followers, public profiles, direct messages, image posting, vanity likes, drama-focused trending feeds, and real-name identity requirements. Every feature is designed to encourage practical, kind, local help.
