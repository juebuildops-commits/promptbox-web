-- =====================================================================
-- 階段五（5a+）：PromptBox 會員中心與下載遙測 Schema
-- 規範依據：Docs/webplan/PRD_階段五_會員與帳號中心.md §1 (FR-25A & FR-27C)
-- =====================================================================

-- 1. 使用者個人資料表（profiles）
-- 鏡射 Supabase auth.users，記錄公開顯示名稱、頭像與偏好設定
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  display_name text,
  avatar_url text,
  locale text default 'zh-TW' check (locale in ('zh-TW', 'en', 'ja')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 啟用 Row Level Security (RLS)
alter table public.profiles enable row level security;

-- RLS 政策：使用者僅能讀取與修改自己的資料
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 2. 觸發器：新使用者透過 Google OAuth 登入時自動同步至 profiles
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url, locale)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    'zh-TW'
  )
  on conflict (id) do update
  set
    email = excluded.email,
    display_name = coalesce(excluded.display_name, profiles.display_name),
    avatar_url = coalesce(excluded.avatar_url, profiles.avatar_url),
    updated_at = now();

  return new;
end;
$$;

-- 綁定 auth.users 建立事件
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update of email, raw_user_meta_data on auth.users
  for each row execute function public.handle_new_user();


-- 3. 下載遙測紀錄表（download_telemetry）
-- 供 Nitro 代理路由 /dl/[platform] 記錄訪客點擊下載行為（302 導向 R2 前寫入）
create table if not exists public.download_telemetry (
  id bigint generated always as identity primary key,
  platform text not null check (platform in ('win', 'win-zip', 'mac')),
  version text not null default '3.9.4',
  user_agent text,
  country text,
  referer text,
  is_authenticated boolean default false,
  user_id uuid references auth.users on delete set null,
  created_at timestamptz default now() not null
);

-- 啟用 RLS
alter table public.download_telemetry enable row level security;

-- 任何人（包含未登入訪客）皆可由 API 寫入遙測日誌
create policy "Anyone can insert download telemetry"
  on public.download_telemetry for insert
  with check (true);

-- 僅限管理者（Service Role）有權讀取分析報表
create policy "Only service role can read download telemetry"
  on public.download_telemetry for select
  using (auth.role() = 'service_role');
