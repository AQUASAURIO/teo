import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
  console.log("🌱 Seeding database...");

  // Clean up
  await prisma.playlistSong.deleteMany();
  await prisma.playlist.deleteMany();
  await prisma.song.deleteMany();
  await prisma.album.deleteMany();
  await prisma.artist.deleteMany();
  await prisma.user.deleteMany();

  // Create user
  const user = await prisma.user.create({
    data: {
      email: "demo@teo.app",
      name: "Teo Demo",
      image: "https://picsum.photos/seed/teouser/300/300",
    },
  });

  // Create artists
  const createdArtists = [];
  for (const a of artists) {
    const artist = await prisma.artist.create({ data: a });
    createdArtists.push(artist);
  }

  // Create albums with songs
  let songIndex = 0;
  const createdSongs: Array<{ id: string; title: string; duration: number; cover: string; audioUrl: string; artistId: string; artist: string; albumId: string | null; album: string | null }> = [];

  for (let i = 0; i < albumsData.length; i++) {
    const albumData = albumsData[i];
    const artist = createdArtists.find((a) => a.name === albumData.artist)!;
    const albumSeed = albumData.title.toLowerCase().replace(/\s+/g, "");

    const album = await prisma.album.create({
      data: {
        title: albumData.title,
        cover: `https://picsum.photos/seed/${albumSeed}/300/300`,
        year: albumData.year,
        artistId: artist.id,
      },
    });

    const songs = songTemplates[i];
    for (let j = 0; j < songs.length; j++) {
      const song = await prisma.song.create({
        data: {
          title: songs[j],
          duration: durations[songIndex % durations.length],
          cover: album.cover,
          audioUrl: audioUrls[songIndex % audioUrls.length],
          artistId: artist.id,
          albumId: album.id,
        },
      });
      createdSongs.push({
        id: song.id,
        title: song.title,
        duration: song.duration,
        cover: song.cover,
        audioUrl: song.audioUrl,
        artistId: artist.id,
        artist: artist.name,
        albumId: album.id,
        album: album.title,
      });
      songIndex++;
    }
  }

  // Create playlists
  const playlistData = [
    {
      name: "Today's Top Hits",
      description: "The hottest tracks right now",
      cover: "https://picsum.photos/seed/tophits/300/300",
      songIndices: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95],
    },
    {
      name: "Chill Vibes",
      description: "Relax and unwind with these smooth tracks",
      cover: "https://picsum.photos/seed/chillvibes/300/300",
      songIndices: [5, 11, 16, 22, 28, 33, 39, 44, 55, 66, 77, 88],
    },
    {
      name: "Electronic Beats",
      description: "Feel the rhythm with electronic music",
      cover: "https://picsum.photos/seed/electronicbeats/300/300",
      songIndices: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 21, 22],
    },
    {
      name: "Indie Discoveries",
      description: "Fresh indie tracks to explore",
      cover: "https://picsum.photos/seed/indiediscoveries/300/300",
      songIndices: [16, 17, 18, 19, 20, 21, 25, 26, 27, 28, 29],
    },
  ];

  for (const pl of playlistData) {
    const playlist = await prisma.playlist.create({
      data: {
        name: pl.name,
        description: pl.description,
        cover: pl.cover,
        userId: user.id,
      },
    });

    for (let i = 0; i < pl.songIndices.length; i++) {
      const idx = pl.songIndices[i];
      if (idx < createdSongs.length) {
        await prisma.playlistSong.create({
          data: {
            playlistId: playlist.id,
            songId: createdSongs[idx].id,
            order: i,
          },
        });
      }
    }
  }

  console.log(`✅ Seeded ${createdArtists.length} artists, ${albumsData.length} albums, ${createdSongs.length} songs, ${playlistData.length} playlists`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
