# HollaYall! — Houston Help Board

HollaYall! is a production-ready static React + Vite + Tailwind app for Houston-local questions, answers, helpful votes, solved posts, reports, admin moderation, and image/file attachments.

The UI is intentionally simple and feed-first, inspired by Reddit and Quora: top navigation, compact search, left-side categories, central question feed, and focused post detail pages.

## What is included

- Email/password sign up and sign in
- Sign in with email or username
- Hidden access-token field for elevated owner access
- User accounts still post under anonymous display names
- Admin-only navigation after token approval
- Admin analytics dashboard
- Reported posts/replies review queue
- Admin Keep / Remove moderation actions
- Admin post deletion
- Post images and file uploads through Supabase Storage
- Helpful voting, replies, solved answers, accepted replies, filtering, sorting, and reports

## Install locally

```bash
npm install
npm run dev
```

Then open the local URL Vite prints, usually:

```text
http://localhost:5173
```

## Supabase setup

1. Create a Supabase project.
2. Go to **SQL Editor**.
3. Run the complete `supabase/schema.sql` file.
4. Go to **Authentication → Providers → Email**.
5. Enable **Email** sign-ins.
6. Decide whether you want email confirmation on or off.
   - For easiest class/demo testing, turn confirmation off.
   - For real production, keep confirmation on.
7. Confirm that the Storage bucket `post-attachments` exists after the SQL runs.

The SQL creates:

- `app_profiles`
- `posts`
- `replies`
- `helpful_votes`
- `reports`
- `post_attachments`
- `categories`
- `areas`
- RLS policies
- admin functions
- moderation functions
- count triggers
- Supabase Storage bucket/policies

## Access token for owner/admin access

The current owner access token is:

```text
215749
```

Normal users should check **Not applicable** on the sign-in/sign-up screen. The app does not show a visible “Admin sign in” option.

To become admin:

1. Create or sign in to your account.
2. Uncheck **Not applicable**.
3. Enter the access token.
4. Continue signing in or signing up.
5. The **Admin** navigation item will appear after access is approved.

Important: for a real public deployment, change this token inside `supabase/schema.sql` before running it on your final Supabase project.

Search for:

```sql
215749
```

Then replace it with your own private token.

## Environment variables

Create `.env` locally:

```bash
cp .env.example .env
```

Fill in:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_publishable_or_anon_key
VITE_ENABLE_DEMO_MODE=false
```

Use your Supabase publishable key or legacy anon public key. Never use the service role key in frontend code.

## Attachments

- Bucket: `post-attachments`
- Max files per post: 5
- Max size per file: 10MB
- Any file format is accepted by the frontend within the size limit
- Images are previewed
- Other files appear as file cards

## Deploy to Vercel or Netlify

Build settings:

```text
Build command: npm run build
Output directory: dist
Install command: npm install
```

Add these environment variables in your hosting dashboard:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_ENABLE_DEMO_MODE=false
```

Make sure `package.json` is at the root directory Vercel is building from. If your app is inside a subfolder, set that folder as the Vercel Root Directory.

## Security notes

- The frontend uses the Supabase publishable/anon key only.
- Do not use the service role key in React.
- RLS is enabled on all app tables.
- Admin tools are protected by Supabase Auth plus database-side admin checks.
- Username login uses a database function to resolve usernames to emails. This is acceptable for a student/startup prototype, but for a serious public product you may want a more advanced identity flow.
- The owner access token is included for your requested project workflow. Change it before sharing a live production deployment widely.

## Demo mode

Production mode is the default. If Supabase variables are missing, the app shows a setup screen. Set this only for temporary preview mode:

```env
VITE_ENABLE_DEMO_MODE=true
```
