// Make deterministic "random" values (same on server & client)
function seededRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

export const mockVideos = Array.from({ length: 9 }).map((_, i) => {
  // each video gets its own deterministic RNG based on index
  const rand = seededRng(1000 + i);

  const creatorIndex = (i % 3) + 1;
  const views = Math.floor(rand() * 500_000) + 1_000;
  const daysAgo = Math.floor(rand() * 60) + 1;

  const uploadDate = new Date(
    Date.now() - daysAgo * 24 * 60 * 60 * 1000,
  ).toISOString();

  return {
    id: `v${i + 1}`,
    title: `Sample Video ${i + 1}`,
    creator: `Creator ${creatorIndex}`,
    thumbnail: `/placeholder.svg?height=360&width=640&query=sample%20video%20${i + 1}`,
    avatar: `/placeholder.svg?height=40&width=40&query=channel%20avatar%20Creator%20${creatorIndex}`,
    views,
    uploadDate,
  };
});

export const mockPlaylists = [
  {
    id: "p1",
    title: "My Highlights",
    count: 12,
    thumbnail: "/placeholder.svg",
  },
  {
    id: "p2",
    title: "Tech Talks",
    count: 8,
    thumbnail: "/placeholder.svg",
  },
];

export const mockFollowing = [
  { id: "u1", name: "Person 1", avatar: "/avatar-alex.png" },
  { id: "u2", name: "Person 2", avatar: "/avatar-jamie.jpg" },
];

export const mockSubscribers = [
  {
    id: "s1",
    name: "Taylor",
    bio: "Video enthusiast",
    avatar: "/avatar-taylor.jpg",
  },
  { id: "s2", name: "Jordan", bio: "Loves tech", avatar: "/avatar-jordan.jpg" },
];
