-- Users table (managed by Supabase Auth, but we extend it)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  theme_color text default '#1DB954',
  theme_mode text default 'dark',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Artists
create table public.artists (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  image text not null,
  bio text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.artists enable row level security;
create policy "Artists are publicly readable" on public.artists for select using (true);

-- Albums
create table public.albums (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  cover text not null,
  year integer,
  artist_id uuid references public.artists(id) on delete cascade not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.albums enable row level security;
create policy "Albums are publicly readable" on public.albums for select using (true);

-- Songs
create table public.songs (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  duration integer not null default 0,
  cover text not null,
  audio_url text not null,
  artist_id uuid references public.artists(id) on delete cascade not null,
  album_id uuid references public.albums(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.songs enable row level security;
create policy "Songs are publicly readable" on public.songs for select using (true);

-- Playlists
create table public.playlists (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  cover text,
  is_public boolean default true,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.playlists enable row level security;
create policy "Users can read own playlists" on public.playlists for select using (auth.uid() = user_id or is_public = true);
create policy "Users can create own playlists" on public.playlists for insert with check (auth.uid() = user_id);
create policy "Users can update own playlists" on public.playlists for update using (auth.uid() = user_id);
create policy "Users can delete own playlists" on public.playlists for delete using (auth.uid() = user_id);

-- Playlist Songs
create table public.playlist_songs (
  id uuid default gen_random_uuid() primary key,
  playlist_id uuid references public.playlists(id) on delete cascade not null,
  song_id uuid references public.songs(id) on delete cascade not null,
  "order" integer default 0,
  added_at timestamptz default now(),
  unique(playlist_id, song_id)
);

alter table public.playlist_songs enable row level security;
create policy "Playlist songs are readable if playlist is readable" on public.playlist_songs for select using (
  exists (select 1 from public.playlists where playlists.id = playlist_songs.playlist_id and (auth.uid() = playlists.user_id or playlists.is_public = true))
);
create policy "Users can add to own playlists" on public.playlist_songs for insert with check (
  exists (select 1 from public.playlists where playlists.id = playlist_songs.playlist_id and auth.uid() = playlists.user_id)
);
create policy "Users can remove from own playlists" on public.playlist_songs for delete using (
  exists (select 1 from public.playlists where playlists.id = playlist_songs.playlist_id and auth.uid() = playlists.user_id)
);
