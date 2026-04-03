import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const supabase = createClient(
  'https://nheydbdeskcnbtrepwwz.supabase.co',
  'sb_publishable_WS6EklQ3DR8xIRe6U9rIVQ_rMHLzzQH'
);

const EXISTING_USER_ID = '256192fc-fcbb-4a61-af16-f478b4723266';

const artists = [
  { name: "Luna Nova", image: "https://picsum.photos/seed/lunanova/300/300", bio: "Dream pop artist blending ethereal vocals with electronic soundscapes." },
  { name: "The Midnight Circuit", image: "https://picsum.photos/seed/midnightcircuit/300/300", bio: "Synthwave duo crafting retro-futuristic anthems for the digital age." },
  { name: "Aria Stone", image: "https://picsum.photos/seed/ariastone/300/300", bio: "Indie folk singer-songwriter with a hauntingly beautiful voice." },
  { name: "Neon Pulse", image: "https://picsum.photos/seed/neonpulse/300/300", bio: "Electronic music producer pushing boundaries of bass and beats." },
  { name: "Cedar Falls", image: "https://picsum.photos/seed/cedarfalls/300/300", bio: "Alternative rock band known for their powerful live performances." },
  { name: "Sofia Waves", image: "https://picsum.photos/seed/sofiawaves/300/300", bio: "R&B artist with smooth vocals and jazzy production." },
  { name: "Echo Chamber", image: "https://picsum.photos/seed/echochamber/300/300", bio: "Experimental ambient group creating immersive sound experiences." },
  { name: "Marcus Veil", image: "https://picsum.photos/seed/marcusveil/300/300", bio: "Hip-hop artist blending conscious lyrics with lo-fi beats." },
];

const albumsData = [
  { title: "Starlight Dreams", artist: "Luna Nova", year: 2023 },
  { title: "Celestial Tides", artist: "Luna Nova", year: 2021 },
  { title: "Moonrise Echoes", artist: "Luna Nova", year: 2024 },
  { title: "Digital Sunset", artist: "The Midnight Circuit", year: 2022 },
  { title: "Retrograde", artist: "The Midnight Circuit", year: 2023 },
  { title: "Neon Highways", artist: "The Midnight Circuit", year: 2024 },
  { title: "Whisper & Stone", artist: "Aria Stone", year: 2020 },
  { title: "Forest Paths", artist: "Aria Stone", year: 2022 },
  { title: "Wildflower", artist: "Aria Stone", year: 2024 },
  { title: "Bass Protocol", artist: "Neon Pulse", year: 2023 },
  { title: "Frequency Shift", artist: "Neon Pulse", year: 2024 },
  { title: "Amber Sky", artist: "Cedar Falls", year: 2021 },
  { title: "Thunder Road", artist: "Cedar Falls", year: 2023 },
  { title: "Horizon Line", artist: "Cedar Falls", year: 2024 },
  { title: "Velvet Nights", artist: "Sofia Waves", year: 2022 },
  { title: "Golden Hour", artist: "Sofia Waves", year: 2024 },
  { title: "Infinite Drift", artist: "Echo Chamber", year: 2023 },
  { title: "Void Patterns", artist: "Echo Chamber", year: 2024 },
  { title: "Concrete Jungle", artist: "Marcus Veil", year: 2022 },
  { title: "Midnight Philosophy", artist: "Marcus Veil", year: 2024 },
];

const songTemplates = [
  ["Starlight Serenade", "Galaxy Waltz", "Dreamweaver", "Celestial Motion", "Aurora Borealis", "Lunar Lullaby"],
  ["Ocean of Light", "Pulsar Dance", "Gravity Pull", "Supernova Heart", "Nebula Kiss"],
  ["First Light", "Crescent Moon", "Twilight Zone", "Astral Plane", "Midnight Haze", "Cosmic Dust", "Starfall"],
  ["Chrome Hearts", "Voltage", "Night Drive", "Pixel Rain", "Binary Sunset", "Synth City"],
  ["Time Machine", "Laser Grid", "Mainframe", "Arcade Dreams", "Data Stream"],
  ["Speed of Light", "Cyber Valley", "Turbo Mode", "Quantum Leap", "Warp Drive", "Solar Flare", "Electric Storm"],
  ["River Song", "Mountain Echo", "Paper Boats", "Autumn Leaves", "Quiet Storm"],
  ["Hollow Tree", "Birdsong", "Morning Dew", "Pebble Path", "Wild Rose", "Silent Creek"],
  ["Garden Gate", "Summer Breeze", "Sunlit Meadow", "Butterfly Effect", "Daisy Chain"],
  ["Drop Zone", "Subsonic", "Wavelength", "Pulse Check", "Bass Drop", "Shockwave"],
  ["Afterglow", "Resonance", "Tremor", "Overdrive", "Feedback Loop", "Phase Shift", "Doppler"],
  ["Canyon Echo", "Prairie Wind", "Rockface", "Campfire Tales", "Summit"],
  ["Lightning Strike", "Rolling Thunder", "Wildfire", "Breaking Ground", "Highway One", "Storm Chaser"],
  ["Edge of the World", "Clear Skies", "New Dawn", "Distant Shore", "Coming Home"],
  ["Silk & Satin", "Honey Drip", "Cocoa Lounge", "Candlelight", "Smooth Operator"],
  ["Daydream", "Sunrise", "Afternoon Delight", "Sunset Boulevard", "Moonwalk"],
  ["Event Horizon", "White Noise", "Deep Space", "Signal Lost", "Antimatter", "Zero Gravity"],
  ["Reflection", "Parallel Lines", "The Void", "Schrödinger", "Entanglement"],
  ["City Lights", "Broken Pavement", "Notebook Rhymes", "Street Corner", "Rooftop View"],
  ["3AM Thoughts", "Inner Voice", "The Process", "Breaking Chains", "Last Chapter", "Epilogue"],
];

const audioUrls = Array.from({ length: 16 }, (_, i) =>
  `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${i + 1}.mp3`
);

const durations = [234, 198, 267, 312, 185, 256, 223, 289, 201, 245, 278, 194, 310, 215, 261, 230, 203, 247, 275, 190, 258, 222, 285, 199, 240];

async function main() {
  console.log("🌱 Seeding Supabase database...");

  // 1. Create artists
  const createdArtists: Array<{ id: string; name: string }> = [];
  for (const a of artists) {
    const { data, error } = await supabase.from('artists').insert(a).select().single();
    if (error) {
      console.error(`  ❌ Artist error (${a.name}):`, error.message);
      // Check if already exists
      const { data: existing } = await supabase.from('artists').select('id, name').eq('name', a.name).single();
      if (existing) {
        createdArtists.push(existing);
        console.log(`  ⚠️  Artist already exists: ${a.name}`);
      }
      continue;
    }
    createdArtists.push(data);
    console.log(`  ✅ Created artist: ${data.name}`);
  }

  // 2. Create albums
  const createdAlbums: Array<{ id: string; title: string; cover: string }> = [];
  for (const albumData of albumsData) {
    const artist = createdArtists.find((a) => a.name === albumData.artist);
    if (!artist) {
      console.error(`  ❌ Artist not found: ${albumData.artist}`);
      continue;
    }
    const albumSeed = albumData.title.toLowerCase().replace(/\s+/g, "");
    const albumPayload = {
      title: albumData.title,
      cover: `https://picsum.photos/seed/${albumSeed}/300/300`,
      year: albumData.year,
      artistId: artist.id,
    };
    const { data, error } = await supabase.from('albums').insert(albumPayload).select().single();
    if (error) {
      console.error(`  ❌ Album error (${albumData.title}):`, error.message);
      continue;
    }
    createdAlbums.push(data);
    console.log(`  ✅ Created album: ${data.title} by ${albumData.artist}`);
  }

  // 3. Create songs
  let songIndex = 0;
  const createdSongs: Array<{ id: string; title: string }> = [];

  for (let i = 0; i < albumsData.length; i++) {
    const albumData = albumsData[i];
    const artist = createdArtists.find((a) => a.name === albumData.artist);
    const album = createdAlbums.find((a) => a.title === albumData.title);
    if (!artist || !album) continue;

    const songs = songTemplates[i];
    for (const songTitle of songs) {
      const songPayload = {
        title: songTitle,
        duration: durations[songIndex % durations.length],
        cover: album.cover,
        audioUrl: audioUrls[songIndex % audioUrls.length],
        artistId: artist.id,
        albumId: album.id,
      };
      const { data, error } = await supabase.from('songs').insert(songPayload).select().single();
      if (error) {
        console.error(`  ❌ Song error (${songTitle}):`, error.message);
        songIndex++;
        continue;
      }
      createdSongs.push(data);
      songIndex++;
    }
  }
  console.log(`  ✅ Created ${createdSongs.length} songs`);

  // 4. Create playlists
  const playlistData = [
    {
      title: "Today's Top Hits",
      description: "The hottest tracks right now",
      coverImage: "https://picsum.photos/seed/tophits/300/300",
      songIndices: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95],
    },
    {
      title: "Chill Vibes",
      description: "Relax and unwind with these smooth tracks",
      coverImage: "https://picsum.photos/seed/chillvibes/300/300",
      songIndices: [5, 11, 16, 22, 28, 33, 39, 44, 55, 66, 77, 88],
    },
    {
      title: "Electronic Beats",
      description: "Feel the rhythm with electronic music",
      coverImage: "https://picsum.photos/seed/electronicbeats/300/300",
      songIndices: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 21, 22],
    },
    {
      title: "Indie Discoveries",
      description: "Fresh indie tracks to explore",
      coverImage: "https://picsum.photos/seed/indiediscoveries/300/300",
      songIndices: [16, 17, 18, 19, 20, 21, 25, 26, 27, 28, 29],
    },
  ];

  for (const pl of playlistData) {
    const { data: playlist, error } = await supabase.from('playlists').insert({
      id: randomUUID(),
      title: pl.title,
      description: pl.description,
      coverImage: pl.coverImage,
      userId: EXISTING_USER_ID,
    }).select().single();

    if (error) {
      console.error(`  ❌ Playlist error (${pl.title}):`, error.message);
      continue;
    }
    console.log(`  ✅ Created playlist: ${playlist.title}`);

    // 5. Add songs to playlists
    for (let i = 0; i < pl.songIndices.length; i++) {
      const idx = pl.songIndices[i];
      if (idx < createdSongs.length) {
        const { error: psError } = await supabase.from('playlistSongs').insert({
          playlistId: playlist.id,
          songId: createdSongs[idx].id,
          order: i,
        });
        if (psError) {
          console.error(`    ❌ PlaylistSong error:`, psError.message);
        }
      }
    }
    console.log(`    ✅ Added ${Math.min(pl.songIndices.length, createdSongs.length)} songs to ${playlist.title}`);
  }

  console.log(`\n🎉 Seeding complete!`);
  console.log(`   Artists: ${createdArtists.length}`);
  console.log(`   Albums: ${createdAlbums.length}`);
  console.log(`   Songs: ${createdSongs.length}`);
  console.log(`   Playlists: ${playlistData.length}`);
}

main().catch(console.error);
