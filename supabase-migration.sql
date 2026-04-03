-- Teo Music App - Fixed Migration
-- Corregido para coincidir con el schema existente (playlists.id es text, no uuid)

-- 1. Agregar columnas faltantes a profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS themeColor text DEFAULT '#1DB954';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS themeMode text DEFAULT 'dark';

-- 2. Crear tabla de artistas
CREATE TABLE IF NOT EXISTS public.artists (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  image text NOT NULL,
  bio text,
  "createdAt" timestamptz DEFAULT now(),
  "updatedAt" timestamptz DEFAULT now()
);
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Artists readable" ON public.artists FOR SELECT USING (true);

-- 3. Crear tabla de albums
CREATE TABLE IF NOT EXISTS public.albums (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  cover text NOT NULL,
  year integer,
  artistId uuid NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  "createdAt" timestamptz DEFAULT now(),
  "updatedAt" timestamptz DEFAULT now()
);
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Albums readable" ON public.albums FOR SELECT USING (true);

-- 4. Crear tabla de canciones
CREATE TABLE IF NOT EXISTS public.songs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  duration integer NOT NULL DEFAULT 0,
  cover text NOT NULL,
  audioUrl text NOT NULL,
  artistId uuid NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  albumId uuid REFERENCES public.albums(id) ON DELETE SET NULL,
  "createdAt" timestamptz DEFAULT now(),
  "updatedAt" timestamptz DEFAULT now()
);
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Songs readable" ON public.songs FOR SELECT USING (true);

-- 5. Crear tabla playlistSongs - playlistId como TEXT para coincidir con playlists.id
CREATE TABLE IF NOT EXISTS public."playlistSongs" (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  playlistId text NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  songId uuid NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  "order" integer DEFAULT 0,
  "addedAt" timestamptz DEFAULT now(),
  UNIQUE(playlistId, songId)
);
ALTER TABLE public."playlistSongs" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "PS readable" ON public."playlistSongs" FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.playlists WHERE playlists.id = "playlistSongs"."playlistId" AND playlists."isPublic" = true)
);
CREATE POLICY "PS insert" ON public."playlistSongs" FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.playlists WHERE playlists.id = "playlistSongs"."playlistId" AND playlists."userId" = auth.uid())
);
CREATE POLICY "PS delete" ON public."playlistSongs" FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.playlists WHERE playlists.id = "playlistSongs"."playlistId" AND playlists."userId" = auth.uid())
);
