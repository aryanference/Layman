-- Guest request tracking (no auth required)
create table guest_requests (
  id uuid primary key default gen_random_uuid(),
  ip_hash text not null,
  created_at timestamptz default now()
);

-- Chat sessions per user
create table chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Messages per session
create table messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references chat_sessions(id) on delete cascade,
  role text check (role in ('user', 'assistant', 'system')),
  content text not null,
  model text,
  created_at timestamptz default now()
);

-- Per-user API keys
create table user_api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique,
  openrouter_key text,
  openai_key text,
  anthropic_key text,
  gemini_key text,
  updated_at timestamptz default now()
);

-- Row Level Security
alter table chat_sessions enable row level security;
alter table messages enable row level security;
alter table user_api_keys enable row level security;

create policy "users see own sessions" on chat_sessions
  for all using (auth.uid() = user_id);

create policy "users see own messages" on messages
  for all using (
    session_id in (select id from chat_sessions where user_id = auth.uid())
  );

create policy "users see own keys" on user_api_keys
  for all using (auth.uid() = user_id);