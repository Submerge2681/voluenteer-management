-- 1. ENUMS & TYPES
create type user_role as enum ('volunteer', 'admin', 'super_admin');
create type checkin_method as enum ('totp', 'static_otp');

-- 2. PROFILES (Extends Supabase Auth)
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  full_name text not null,
  role user_role default 'volunteer'::user_role,
  phone jsonb default '{}'::jsonb,
  socials jsonb default '{}'::jsonb,
  locations text[] default array[]::text[],
  is_cert_public boolean default true,
  last_active timestamptz,
  created_at timestamptz default now()
);

-- 3. EVENTS
create table events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  body text,
  start_time timestamptz not null,
  is_completed boolean default false,
  badge_url text,
  checkin_type checkin_method default 'static_otp'::checkin_method,
  checkin_secret text not null,
  created_at timestamptz default now()
);

-- 4. PARTICIPATION (Join Table)
create table participation (
  user_id uuid references profiles(id) on delete cascade,
  event_id uuid references events(id) on delete cascade,
  primary key (user_id, event_id)
);

-- 5. GLOBAL STATS (For ISR caching / Performance)
create table global_stats (
  id int primary key default 1,
  total_volunteers int default 0,
  total_waste int default 0,
  total_cleanups int default 0,
  last_updated timestamptz default now(),
  constraint single_row check (id = 1)
);

-- Insert initial stats row
insert into global_stats (id, total_volunteers, total_waste, total_cleanups) values (1, 0, 0, 0);

-- 6. RLS POLICIES (Security)
alter table profiles enable row level security;
alter table events enable row level security;
alter table participation enable row level security;


---------------------------------------------------------


-- Profiles: Users read own, Admins read all
create policy "Public profiles are viewable by everyone" 
  on profiles for select using (is_cert_public = true);

create policy "Users can read own profile" 
  on profiles for select using (auth.uid() = id);

create policy "Admins can manage all profiles" 
  on profiles for all using (
    exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

-- Events: Public read, Admins write
create policy "Events are public" 
  on events for select using (true);

create policy "Admins can manage events" 
  on events for all using (
    exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

-- Participation: Users read own, Admins read all
create policy "Users can read own participation" 
  on participation for select using (auth.uid() = user_id);

create policy "Admins can manage participation" 
  on participation for all using (
    exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

-- 7. AUTO-CREATE PROFILE TRIGGER
create function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, phone)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.phone);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

---------------------------------------------------------------------------
---------------------------------------------------------------------------
---------------------------------------------------------------------------
---------------------------------------------------------------------------
---------------------------------------------------------------------------
---------------------------------------------------------------------------

-- 1. Cleanup: Drop the existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Recreate Function: Added safety checks and search_path
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id, 
    new.email, 
    -- Safety check: Handle null metadata or missing full_name
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- If the profile creation fails, we log it but usually we don't want to block auth.
    -- However, for this app, a profile is required. 
    -- The RAISE command ensures the error bubbles up so we know why it failed.
    RAISE LOG 'Profile creation failed for user %: %', new.id, SQLERRM;
    RAISE; -- Re-throw the error to block the user creation
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Recreate Trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();