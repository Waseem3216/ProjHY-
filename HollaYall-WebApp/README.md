# HollaYall! — Houston Help Board

HollaYall! is a static React + Vite + Tailwind app for anonymous Houston-local questions, replies, helpful votes, solved posts, reports, and post attachments.

The UI has been simplified into a Reddit/Quora-style layout: top navigation with search, left community/category navigation, a central question feed, compact filters, and a right rail with quick tags.

## New in this version

- Simpler Reddit/Quora-inspired interface
- Removed marketing-heavy landing sections from the default experience
- Default route now opens the board/feed directly
- Post attachments added with Supabase Storage
- Users can upload images or files on posts
- Images preview in the feed/detail view
- Non-image files display as downloadable/openable file cards
- Production mode remains the default; demo mode must be manually enabled

## Install

```bash
npm install
npm run dev
```

## Supabase setup

1. Create a Supabase project.
2. Go to **SQL Editor**.
3. Run the complete `supabase/schema.sql` file.
4. Go to **Authentication → Providers**.
5. Enable **Anonymous Sign-Ins**.
6. Confirm that the Storage bucket `post-attachments` exists.

The schema creates the main tables, RLS policies, triggers, and the Storage bucket/policies for attachments.

## Environment variables

Create `.env`:

```bash
cp .env.example .env
```

Fill in:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_publishable_or_anon_key
VITE_ENABLE_DEMO_MODE=false
```

Use your Supabase publishable key or legacy anon public key. Never use the service role key in the frontend.

## Attachments

- Bucket: `post-attachments`
- Max files per post: 5
- Max size per file: 10MB
- Any format is accepted by the frontend within the size limit
- Images are previewed
- Other files are shown as downloadable/openable file cards

## Deploy

For Vercel or Netlify:

- Build command: `npm run build`
- Output directory: `dist`
- Add these environment variables in the hosting dashboard:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_ENABLE_DEMO_MODE=false`

## Production note

If Supabase variables are missing, the app shows a setup screen instead of pretending to save data. Set `VITE_ENABLE_DEMO_MODE=true` only for temporary preview mode.
