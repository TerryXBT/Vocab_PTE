-- Profiles
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  nickname text,
  target_exam text,
  created_at timestamptz default now()
);

-- Global word list
create table if not exists public.words (
  id bigserial primary key,
  word text not null,
  phonetic text,
  pos text,
  meaning_cn text not null,
  meaning_en text,
  example_sentence text,
  tags text[],
  created_at timestamptz default now()
);

-- User progress
create table if not exists public.user_word_progress (
  id bigserial primary key,
  user_id uuid not null references auth.users on delete cascade,
  word_id bigint not null references public.words on delete cascade,
  proficiency integer default 0,
  next_review_at timestamptz default now(),
  last_review_at timestamptz,
  review_count integer default 0,
  created_at timestamptz default now(),
  constraint user_word_progress_user_word_unique unique (user_id, word_id)
);

-- Optional event log
create table if not exists public.study_log (
  id bigserial primary key,
  user_id uuid not null references auth.users on delete cascade,
  word_id bigint not null references public.words on delete cascade,
  action text not null,
  result text,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.user_word_progress enable row level security;
alter table public.study_log enable row level security;

-- Policies
create policy "Profiles: user can view own" on public.profiles
  for select using (auth.uid() = id);
create policy "Profiles: user can upsert own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "Profiles: user can update own" on public.profiles
  for update using (auth.uid() = id);

create policy "Progress: user can view own" on public.user_word_progress
  for select using (auth.uid() = user_id);
create policy "Progress: user can upsert own" on public.user_word_progress
  for insert with check (auth.uid() = user_id);
create policy "Progress: user can update own" on public.user_word_progress
  for update using (auth.uid() = user_id);

create policy "Study log: user can view own" on public.study_log
  for select using (auth.uid() = user_id);
create policy "Study log: user can insert own" on public.study_log
  for insert with check (auth.uid() = user_id);

-- Words are global read-only
alter table public.words enable row level security;
create policy "Words: read access to all" on public.words
  for select using (true);

-- Optional starter data
insert into public.words (word, phonetic, pos, meaning_cn, meaning_en, example_sentence, tags)
values
('articulate', 'ɑːrˈtɪkjʊlət', 'adj', '口齿清晰的；表达清楚的', 'expressing yourself readily, clearly, effectively', 'She is an articulate speaker who captivates the audience.', array['PTE','Core']),
('meticulous', 'məˈtɪkjʊləs', 'adj', '一丝不苟的', 'showing great attention to detail; very careful and precise', 'His notes were so meticulous that everyone borrowed them.', array['PTE']);
