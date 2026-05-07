-- HollaYall! / Houston Help Board Supabase schema
-- Run this file in Supabase SQL Editor after creating your project.
-- Then enable Auth > Sign In / Providers > Anonymous Sign-Ins in the Supabase dashboard.

create extension if not exists pgcrypto;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  description text,
  icon text,
  created_at timestamptz not null default now()
);

create table if not exists public.areas (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  type text not null default 'area' check (type in ('campus', 'neighborhood', 'suburb', 'district', 'area')),
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) between 8 and 120),
  body text not null check (char_length(trim(body)) between 20 and 1500),
  category text not null,
  area text not null,
  urgency text not null default 'Normal' check (urgency in ('Low', 'Normal', 'Soon', 'Urgent')),
  tags text[] not null default '{}',
  contact_preference text not null default 'Replies on this board only',
  anonymous_name text not null check (char_length(trim(anonymous_name)) between 2 and 80),
  anonymous_user_id uuid not null,
  helpful_count integer not null default 0 check (helpful_count >= 0),
  reply_count integer not null default 0 check (reply_count >= 0),
  is_solved boolean not null default false,
  accepted_reply_id uuid null,
  report_count integer not null default 0 check (report_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint posts_tags_max check (array_length(tags, 1) is null or array_length(tags, 1) <= 5)
);

create table if not exists public.replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 10 and 900),
  anonymous_name text not null check (char_length(trim(anonymous_name)) between 2 and 80),
  anonymous_user_id uuid not null,
  helpful_count integer not null default 0 check (helpful_count >= 0),
  is_accepted boolean not null default false,
  report_count integer not null default 0 check (report_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'posts_accepted_reply_fk'
      and conrelid = 'public.posts'::regclass
  ) then
    alter table public.posts
      add constraint posts_accepted_reply_fk
      foreign key (accepted_reply_id) references public.replies(id) on delete set null;
  end if;
end $$;

create table if not exists public.helpful_votes (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('post', 'reply')),
  target_id uuid not null,
  anonymous_user_id uuid not null,
  created_at timestamptz not null default now(),
  unique (target_type, target_id, anonymous_user_id)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('post', 'reply')),
  target_id uuid not null,
  reason text not null check (reason in ('Spam', 'Harassment', 'Unsafe advice', 'Personal information', 'Off-topic', 'Other')),
  details text null check (details is null or char_length(details) <= 400),
  anonymous_user_id uuid not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_posts_created_at on public.posts (created_at desc);
create index if not exists idx_posts_category on public.posts (category);
create index if not exists idx_posts_area on public.posts (area);
create index if not exists idx_posts_urgency on public.posts (urgency);
create index if not exists idx_posts_solved on public.posts (is_solved);
create index if not exists idx_posts_tags on public.posts using gin (tags);
create index if not exists idx_replies_post_id on public.replies (post_id);
create index if not exists idx_votes_lookup on public.helpful_votes (target_type, target_id, anonymous_user_id);
create index if not exists idx_reports_target on public.reports (target_type, target_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.validate_post_update()
returns trigger
language plpgsql
as $$
begin
  if current_setting('app.internal_update', true) = 'true' then
    return new;
  end if;

  -- Frontend creators can only mark solved / accepted answer. Other moderation and counters are internal.
  if new.title is distinct from old.title
    or new.body is distinct from old.body
    or new.category is distinct from old.category
    or new.area is distinct from old.area
    or new.urgency is distinct from old.urgency
    or new.tags is distinct from old.tags
    or new.contact_preference is distinct from old.contact_preference
    or new.anonymous_name is distinct from old.anonymous_name
    or new.anonymous_user_id is distinct from old.anonymous_user_id
    or new.helpful_count is distinct from old.helpful_count
    or new.reply_count is distinct from old.reply_count
    or new.report_count is distinct from old.report_count
    or new.created_at is distinct from old.created_at
  then
    raise exception 'Only solved status and accepted reply can be updated from the client.';
  end if;

  return new;
end;
$$;

create or replace function public.validate_reply_update()
returns trigger
language plpgsql
as $$
begin
  if current_setting('app.internal_update', true) = 'true' then
    return new;
  end if;

  raise exception 'Replies cannot be edited from the public client.';
end;
$$;

create or replace function public.ensure_accepted_reply_belongs_to_post()
returns trigger
language plpgsql
as $$
begin
  if new.accepted_reply_id is null then
    return new;
  end if;

  if not exists (
    select 1 from public.replies r
    where r.id = new.accepted_reply_id
      and r.post_id = new.id
  ) then
    raise exception 'Accepted reply must belong to the same post.';
  end if;

  new.is_solved = true;
  return new;
end;
$$;

create or replace function public.sync_accepted_reply()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform set_config('app.internal_update', 'true', true);

  if new.accepted_reply_id is null or new.is_solved = false then
    update public.replies
      set is_accepted = false,
          updated_at = now()
      where post_id = new.id;
  else
    update public.replies
      set is_accepted = (id = new.accepted_reply_id),
          updated_at = now()
      where post_id = new.id;
  end if;

  return new;
end;
$$;

create or replace function public.update_reply_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform set_config('app.internal_update', 'true', true);

  if tg_op = 'INSERT' then
    update public.posts
      set reply_count = reply_count + 1,
          updated_at = now()
      where id = new.post_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.posts
      set reply_count = greatest(reply_count - 1, 0),
          updated_at = now()
      where id = old.post_id;
    return old;
  end if;

  return null;
end;
$$;

create or replace function public.validate_helpful_vote_target()
returns trigger
language plpgsql
as $$
begin
  if new.target_type = 'post' and not exists (select 1 from public.posts where id = new.target_id) then
    raise exception 'Helpful vote target post does not exist.';
  end if;

  if new.target_type = 'reply' and not exists (select 1 from public.replies where id = new.target_id) then
    raise exception 'Helpful vote target reply does not exist.';
  end if;

  return new;
end;
$$;

create or replace function public.update_helpful_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  delta integer;
  target_type_value text;
  target_id_value uuid;
begin
  perform set_config('app.internal_update', 'true', true);

  if tg_op = 'INSERT' then
    delta := 1;
    target_type_value := new.target_type;
    target_id_value := new.target_id;
  elsif tg_op = 'DELETE' then
    delta := -1;
    target_type_value := old.target_type;
    target_id_value := old.target_id;
  else
    return null;
  end if;

  if target_type_value = 'post' then
    update public.posts
      set helpful_count = greatest(helpful_count + delta, 0),
          updated_at = now()
      where id = target_id_value;
  else
    update public.replies
      set helpful_count = greatest(helpful_count + delta, 0),
          updated_at = now()
      where id = target_id_value;
  end if;

  if tg_op = 'INSERT' then
    return new;
  end if;
  return old;
end;
$$;

create or replace function public.validate_report_target()
returns trigger
language plpgsql
as $$
begin
  if new.target_type = 'post' and not exists (select 1 from public.posts where id = new.target_id) then
    raise exception 'Report target post does not exist.';
  end if;

  if new.target_type = 'reply' and not exists (select 1 from public.replies where id = new.target_id) then
    raise exception 'Report target reply does not exist.';
  end if;

  return new;
end;
$$;

create or replace function public.update_report_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform set_config('app.internal_update', 'true', true);

  if new.target_type = 'post' then
    update public.posts
      set report_count = report_count + 1,
          updated_at = now()
      where id = new.target_id;
  else
    update public.replies
      set report_count = report_count + 1,
          updated_at = now()
      where id = new.target_id;
  end if;

  return new;
end;
$$;

drop trigger if exists posts_validate_update on public.posts;
create trigger posts_validate_update
before update on public.posts
for each row execute function public.validate_post_update();

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
before update on public.posts
for each row execute function public.set_updated_at();

drop trigger if exists posts_validate_accepted_reply on public.posts;
create trigger posts_validate_accepted_reply
before insert or update of accepted_reply_id, is_solved on public.posts
for each row execute function public.ensure_accepted_reply_belongs_to_post();

drop trigger if exists posts_sync_accepted_reply on public.posts;
create trigger posts_sync_accepted_reply
after update of accepted_reply_id, is_solved on public.posts
for each row execute function public.sync_accepted_reply();

drop trigger if exists replies_validate_update on public.replies;
create trigger replies_validate_update
before update on public.replies
for each row execute function public.validate_reply_update();

drop trigger if exists replies_set_updated_at on public.replies;
create trigger replies_set_updated_at
before update on public.replies
for each row execute function public.set_updated_at();

drop trigger if exists replies_count_insert on public.replies;
create trigger replies_count_insert
after insert on public.replies
for each row execute function public.update_reply_count();

drop trigger if exists replies_count_delete on public.replies;
create trigger replies_count_delete
after delete on public.replies
for each row execute function public.update_reply_count();

drop trigger if exists votes_validate_target on public.helpful_votes;
create trigger votes_validate_target
before insert on public.helpful_votes
for each row execute function public.validate_helpful_vote_target();

drop trigger if exists votes_update_count_insert on public.helpful_votes;
create trigger votes_update_count_insert
after insert on public.helpful_votes
for each row execute function public.update_helpful_count();

drop trigger if exists votes_update_count_delete on public.helpful_votes;
create trigger votes_update_count_delete
after delete on public.helpful_votes
for each row execute function public.update_helpful_count();

drop trigger if exists reports_validate_target on public.reports;
create trigger reports_validate_target
before insert on public.reports
for each row execute function public.validate_report_target();

drop trigger if exists reports_update_count_insert on public.reports;
create trigger reports_update_count_insert
after insert on public.reports
for each row execute function public.update_report_count();

alter table public.categories enable row level security;
alter table public.areas enable row level security;
alter table public.posts enable row level security;
alter table public.replies enable row level security;
alter table public.helpful_votes enable row level security;
alter table public.reports enable row level security;

-- Public reference data
drop policy if exists "Read categories" on public.categories;
create policy "Read categories" on public.categories
  for select to anon, authenticated
  using (true);

drop policy if exists "Read areas" on public.areas;
create policy "Read areas" on public.areas
  for select to anon, authenticated
  using (true);

-- Posts: public read of non-flagged content; authenticated anonymous users can create and solve their own posts.
drop policy if exists "Read visible posts" on public.posts;
create policy "Read visible posts" on public.posts
  for select to anon, authenticated
  using (report_count < 5);

drop policy if exists "Create own anonymous posts" on public.posts;
create policy "Create own anonymous posts" on public.posts
  for insert to authenticated
  with check (auth.uid() = anonymous_user_id);

drop policy if exists "Creators update solved state" on public.posts;
create policy "Creators update solved state" on public.posts
  for update to authenticated
  using (auth.uid() = anonymous_user_id)
  with check (auth.uid() = anonymous_user_id);

-- Replies: public read of non-flagged content; authenticated anonymous users can create replies.
drop policy if exists "Read visible replies" on public.replies;
create policy "Read visible replies" on public.replies
  for select to anon, authenticated
  using (report_count < 5);

drop policy if exists "Create own anonymous replies" on public.replies;
create policy "Create own anonymous replies" on public.replies
  for insert to authenticated
  with check (auth.uid() = anonymous_user_id);

-- Helpful votes: users can only see and manage their own vote records. Counts are public on posts/replies.
drop policy if exists "Read own helpful votes" on public.helpful_votes;
create policy "Read own helpful votes" on public.helpful_votes
  for select to authenticated
  using (auth.uid() = anonymous_user_id);

drop policy if exists "Create own helpful votes" on public.helpful_votes;
create policy "Create own helpful votes" on public.helpful_votes
  for insert to authenticated
  with check (auth.uid() = anonymous_user_id);

drop policy if exists "Delete own helpful votes" on public.helpful_votes;
create policy "Delete own helpful votes" on public.helpful_votes
  for delete to authenticated
  using (auth.uid() = anonymous_user_id);

-- Reports: users can submit reports, but report details are not publicly readable.
drop policy if exists "Create own reports" on public.reports;
create policy "Create own reports" on public.reports
  for insert to authenticated
  with check (auth.uid() = anonymous_user_id);

insert into public.categories (name, description, icon) values
  ('Study Help', 'Homework, tutoring, explanations, and class help.', 'book-open'),
  ('Campus Life', 'General student-life questions.', 'school'),
  ('Food Deals', 'Budget-friendly Houston food tips.', 'utensils'),
  ('Career & Interviews', 'Internships, resumes, interviews, and networking.', 'briefcase'),
  ('Housing', 'Roommates, rentals, moving, and housing questions.', 'home'),
  ('Transportation', 'Getting around Houston without sharing exact locations.', 'bus'),
  ('Quiet Study Spots', 'Libraries, cafes, and calm study areas.', 'volume-2'),
  ('Local Advice', 'Useful Houston know-how.', 'map'),
  ('Events', 'Local events and campus events.', 'calendar'),
  ('Safety', 'Safer choices and general safety guidance.', 'shield'),
  ('Tech Help', 'Computer, coding, software, and device help.', 'laptop'),
  ('Money & Budgeting', 'Budget-friendly options and practical money tips.', 'wallet'),
  ('Health & Wellness', 'General wellness direction and resource suggestions.', 'heart'),
  ('General Help', 'Anything helpful and Houston-relevant.', 'message-circle')
on conflict (name) do nothing;

insert into public.areas (name, type) values
  ('University of Houston', 'campus'),
  ('Texas Southern University', 'campus'),
  ('Rice University', 'campus'),
  ('Houston Community College', 'campus'),
  ('Downtown Houston', 'district'),
  ('Midtown', 'neighborhood'),
  ('Third Ward', 'neighborhood'),
  ('Montrose', 'neighborhood'),
  ('Medical Center', 'district'),
  ('The Heights', 'neighborhood'),
  ('Galleria', 'district'),
  ('EaDo', 'neighborhood'),
  ('Museum District', 'district'),
  ('Sugar Land', 'suburb'),
  ('Katy', 'suburb'),
  ('Pearland', 'suburb'),
  ('Pasadena', 'suburb'),
  ('Greater Houston', 'area')
on conflict (name) do nothing;

-- Optional: enable realtime for these tables if the Supabase publication exists.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.posts;
    exception when duplicate_object then null;
    end;
    begin
      alter publication supabase_realtime add table public.replies;
    exception when duplicate_object then null;
    end;
    begin
      alter publication supabase_realtime add table public.helpful_votes;
    exception when duplicate_object then null;
    end;
  end if;
end $$;

-- Post attachments: images and files for posts.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('post-attachments', 'post-attachments', true, 10485760, null)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.post_attachments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  file_name text not null check (char_length(trim(file_name)) between 1 and 255),
  file_path text unique not null,
  file_type text not null default 'application/octet-stream',
  file_size bigint not null check (file_size > 0 and file_size <= 10485760),
  anonymous_user_id uuid not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_post_attachments_post_id on public.post_attachments (post_id);
create index if not exists idx_post_attachments_user_id on public.post_attachments (anonymous_user_id);

alter table public.post_attachments enable row level security;

drop policy if exists "Read visible post attachments" on public.post_attachments;
create policy "Read visible post attachments" on public.post_attachments
  for select to anon, authenticated
  using (exists (select 1 from public.posts p where p.id = post_id and p.report_count < 5));

drop policy if exists "Create own post attachments" on public.post_attachments;
create policy "Create own post attachments" on public.post_attachments
  for insert to authenticated
  with check (
    auth.uid() = anonymous_user_id
    and exists (select 1 from public.posts p where p.id = post_id and p.anonymous_user_id = auth.uid())
  );

drop policy if exists "Delete own post attachments" on public.post_attachments;
create policy "Delete own post attachments" on public.post_attachments
  for delete to authenticated
  using (auth.uid() = anonymous_user_id);

drop policy if exists "Public read post attachments storage" on storage.objects;
create policy "Public read post attachments storage" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'post-attachments');

drop policy if exists "Authenticated upload own post attachments storage" on storage.objects;
create policy "Authenticated upload own post attachments storage" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'post-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Authenticated delete own post attachments storage" on storage.objects;
create policy "Authenticated delete own post attachments storage" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'post-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.post_attachments;
    exception when duplicate_object then null;
    end;
  end if;
end $$;
