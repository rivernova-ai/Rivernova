-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  full_name text,
  major text,
  target_degree text,
  gpa text,
  target_location text,
  budget_range text,
  mode text check (mode in ('domestic', 'international', 'lifelong')),
  profile_summary text,
  is_onboarded boolean default false,

  constraint username_length check (char_length(full_name) >= 3)
);

-- Referral System Table
create table referrals (
  id uuid default gen_random_uuid() primary key,
  referrer_id uuid references profiles(id) on delete cascade not null,
  invite_code text unique not null,
  invitee_email text,
  status text check (status in ('pending', 'joined')) default 'pending',
  created_at timestamp with time zone default now()
);

alter table referrals enable row level security;

create policy "Users can view their own referrals." on referrals
  for select using (auth.uid() = referrer_id);

create policy "Users can create their own referrals." on referrals
  for insert with check (auth.uid() = referrer_id);

-- This trigger automatically creates a profile entry when a new user signs up via Supabase Auth.
-- After setting this up, make sure to add this function in Supabase Dashboard -> Database -> Functions
/*
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
*/

-- Applications Table: Stores multi-mode application data
create table public.applications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  mode text check (mode in ('international', 'domestic', 'career')) not null,
  field_of_interest text,
  budget text,
  location_pref text,
  career_goals text,
  current_edu text,
  created_at timestamp with time zone default now()
);

alter table applications enable row level security;
create policy "Users can view their own applications." on applications for select using (auth.uid() = user_id);
create policy "Users can insert their own applications." on applications for insert with check (auth.uid() = user_id);

-- Matches Table: Stores AI-generated matches for each application
create table public.matches (
  id uuid default gen_random_uuid() primary key,
  application_id uuid references public.applications(id) on delete cascade not null,
  name text not null,
  location text,
  tuition text,
  roi text,
  match_score integer,
  reasoning text,
  category text,
  citations jsonb,
  created_at timestamp with time zone default now()
);

alter table matches enable row level security;
create policy "Users can view matches related to their applications." on matches for select using (
  exists (
    select 1 from applications
    where applications.id = matches.application_id
    and applications.user_id = auth.uid()
  )
);
