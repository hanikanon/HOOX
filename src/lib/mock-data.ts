// Sample data — Version 1 of Hoox is a community platform, not a trading terminal.
// This data seeds the UI so every surface looks production-ready.

import type { BadgeTier } from "@/components/verification-badge";

export type ChatKind = "dm" | "group" | "channel";

export interface Chat {
  id: string;
  name: string;
  handle?: string;
  kind: ChatKind;
  avatarSeed: string;
  lastMessage: string;
  lastAuthor?: string;
  time: string;
  unread?: number;
  online?: boolean;
  typing?: boolean;
  verified?: boolean;
  badge?: BadgeTier;
  muted?: boolean;
  pinned?: boolean;
  members?: number;
  /** Real phone number (E.164, e.g. "+213xxxxxxxxx") for the call button to
   * dial via tel:. Only set on chats that should have a working call button —
   * leave unset for everyone else. */
  phone?: string;
}

export const chats: Chat[] = [
  {
    id: "inner-circle",
    name: "Inner Circle Alpha",
    kind: "group",
    avatarSeed: "inner",
    lastMessage: "Breaking support at 62k, watching for a retest before adding size…",
    lastAuthor: "Julian",
    time: "14:20",
    unread: 12,
    online: true,
    verified: true,
    badge: "elite",
    pinned: true,
    members: 248,
  },
  {
    id: "elena",
    name: "Elena Vance",
    kind: "dm",
    avatarSeed: "elena",
    lastMessage: "Check the new chart I just sent over.",
    time: "13:52",
    unread: 2,
    online: true,
    typing: true,
    badge: "analyst",
  },
  {
    id: "announcements",
    name: "Hoox Announcements",
    kind: "channel",
    avatarSeed: "owl",
    lastMessage: "New Course: Mastering HFT Basics is now live for Premium members.",
    time: "Tue",
    verified: true,
    badge: "official",
    members: 12480,
  },
  {
    id: "btc-strategy",
    name: "BTC Strategy Group",
    kind: "group",
    avatarSeed: "btc",
    lastMessage: "The quarterly report is out now for all members.",
    lastAuthor: "Marcus",
    time: "Yesterday",
    badge: "trader",
    members: 96,
  },
  {
    id: "macro",
    name: "Global Macro Insights",
    kind: "channel",
    avatarSeed: "macro",
    lastMessage: "Fed minutes suggest a potential pause in rate hikes…",
    time: "Mon",
    verified: true,
    badge: "verified",
    muted: true,
    members: 3140,
  },
  {
    id: "sarah",
    name: "Sarah Jenkins",
    kind: "dm",
    avatarSeed: "sarah",
    lastMessage: "Voice message · 0:42",
    time: "Sun",
    online: false,
  },
  {
    id: "options",
    name: "Options Desk",
    kind: "group",
    avatarSeed: "opt",
    lastMessage: "Weekly IV summary attached (PDF).",
    lastAuthor: "Amir",
    time: "Sat",
    members: 58,
  },
];

export interface Message {
  id: string;
  author: string;
  authorRole?: "admin" | "mod" | "pro";
  time: string;
  own?: boolean;
  text?: string;
  reply?: { author: string; text: string };
  kind?: "text" | "voice" | "image" | "chart" | "file";
  meta?: string;
  read?: boolean;
  reactions?: { emoji: string; count: number }[];
}

export const conversation: Message[] = [
  {
    id: "m1",
    author: "Julian Reyes",
    authorRole: "admin",
    time: "14:12",
    text: "Morning team. Cleaned my chart overnight — sharing the 4H structure I'm tracking on ETH.",
  },
  {
    id: "m2",
    author: "Julian Reyes",
    authorRole: "admin",
    time: "14:12",
    kind: "chart",
    meta: "ETHUSDT · 4H · Trendline break",
  },
  {
    id: "m3",
    author: "Amir K.",
    authorRole: "mod",
    time: "14:14",
    text: "Clean. What's your invalidation?",
    reply: { author: "Julian Reyes", text: "Sharing the 4H structure I'm tracking on ETH." },
  },
  {
    id: "m4",
    author: "You",
    own: true,
    time: "14:16",
    text: "Bias aligns with my swing plan. Waiting for a lower-time-frame confirmation before scaling in.",
    read: true,
    reactions: [{ emoji: "🔥", count: 4 }],
  },
  {
    id: "m5",
    author: "Elena Vance",
    authorRole: "pro",
    time: "14:19",
    kind: "voice",
    meta: "0:42",
  },
  {
    id: "m6",
    author: "Julian Reyes",
    authorRole: "admin",
    time: "14:20",
    text: "Breaking support at 62k, watching for a retest before adding size.",
  },
];

export interface Course {
  id: string;
  title: string;
  tagline: string;
  price: string;
  level: string;
  hours: string;
  hue: string;
  badge?: string;
}

export const courses: Course[] = [
  {
    id: "order-flow",
    title: "Advanced Order Flow",
    tagline: "Master the footprint chart with the Owl method.",
    price: "$249",
    level: "Advanced",
    hours: "12h",
    hue: "300",
    badge: "New",
  },
  {
    id: "hft-basics",
    title: "Mastering HFT Basics",
    tagline: "How professional desks think about latency and edge.",
    price: "$189",
    level: "Intermediate",
    hours: "8h",
    hue: "290",
  },
  {
    id: "macro",
    title: "Macro for Traders",
    tagline: "Read the cycles, own the tape.",
    price: "$149",
    level: "All levels",
    hours: "6h",
    hue: "270",
  },
  {
    id: "risk",
    title: "Risk & Position Sizing",
    tagline: "The unglamorous math that keeps you in the game.",
    price: "$99",
    level: "Beginner",
    hours: "4h",
    hue: "310",
  },
];

export interface Notification {
  id: string;
  kind: "mention" | "reply" | "follow" | "invite" | "course";
  title: string;
  body: string;
  time: string;
}

export const notifications: Notification[] = [
  {
    id: "n1",
    kind: "mention",
    title: "Julian mentioned you",
    body: "in Inner Circle Alpha — @you take a look at this setup",
    time: "2m",
  },
  {
    id: "n2",
    kind: "follow",
    title: "Elena Vance followed you",
    body: "Verified · Options desk",
    time: "18m",
  },
  {
    id: "n3",
    kind: "course",
    title: "Course purchase confirmed",
    body: "Advanced Order Flow · $249",
    time: "1h",
  },
  {
    id: "n4",
    kind: "invite",
    title: "Invited to Options Desk",
    body: "Amir K. invited you to a private group",
    time: "3h",
  },
];

// ---- Stories ----
export type StoryKind = "news" | "signal" | "analyst" | "video" | "voice" | "alert";
export interface Story {
  id: string;
  title: string;
  author: string;
  seed: string;
  kind: StoryKind;
  time: string;
  live?: boolean;
  unseen?: boolean;
}

export const stories: Story[] = [
  { id: "s0", title: "Your story", author: "You", seed: "owl", kind: "news", time: "now" },
  { id: "s1", title: "BTC breaks 62k", author: "Julian", seed: "inner", kind: "signal", time: "2m", live: true, unseen: true },
  { id: "s2", title: "Fed minutes recap", author: "Macro Desk", seed: "macro", kind: "news", time: "12m", unseen: true },
  { id: "s3", title: "ETH structure walk", author: "Elena", seed: "elena", kind: "video", time: "28m", unseen: true },
  { id: "s4", title: "Vol crush watch", author: "Amir", seed: "opt", kind: "analyst", time: "1h", unseen: true },
  { id: "s5", title: "Voice — session prep", author: "Sarah", seed: "sarah", kind: "voice", time: "2h" },
  { id: "s6", title: "SPX gamma alert", author: "Desk", seed: "btc", kind: "alert", time: "3h" },
];

// ---- Feed ----
export type FeedKind = "featured" | "news" | "post" | "analyst" | "video" | "announcement";
export interface FeedItem {
  id: string;
  kind: FeedKind;
  author: string;
  handle: string;
  seed: string;
  verified?: boolean;
  badge?: BadgeTier;
  time: string;
  title?: string;
  body: string;
  tag?: string;
  likes: number;
  comments: number;
  shares: number;
  pinned?: boolean;
  media?: "chart" | "video";
}

export const feed: FeedItem[] = [
  {
    id: "f1",
    kind: "featured",
    author: "Hoox Desk",
    handle: "@hoox",
    seed: "owl",
    verified: true,
    badge: "official",
    time: "5m",
    pinned: true,
    title: "Weekly Alpha — Cycle rotation into large caps",
    body: "Positioning data suggests the tape is rotating from small caps back into BTC and ETH beta. Full report inside.",
    tag: "Featured",
    likes: 1284,
    comments: 96,
    shares: 214,
    media: "chart",
  },
  {
    id: "f2",
    kind: "news",
    author: "Macro Wire",
    handle: "@macrowire",
    seed: "macro",
    verified: true,
    badge: "verified",
    time: "18m",
    body: "Fed's Powell signals patience; markets pricing in a longer hold. 2Y yields easing.",
    tag: "Market News",
    likes: 412,
    comments: 38,
    shares: 74,
  },
  {
    id: "f3",
    kind: "analyst",
    author: "Julian Reyes",
    handle: "@julian",
    seed: "inner",
    verified: true,
    badge: "analyst",
    time: "42m",
    body: "ETH 4H broke the descending trendline with volume. I'm patient — waiting for the retest before scaling in. Invalidation clearly below the last swing.",
    tag: "Verified Analyst",
    likes: 892,
    comments: 74,
    shares: 128,
    media: "chart",
  },
  {
    id: "f4",
    kind: "video",
    author: "Elena Vance",
    handle: "@elena",
    seed: "elena",
    verified: true,
    badge: "educator",
    time: "1h",
    title: "How I read the opening range — 6 minute walkthrough",
    body: "Short lesson on the first 30 minutes of the US session, what I look for, and what invalidates the setup.",
    tag: "Educational",
    likes: 604,
    comments: 52,
    shares: 88,
    media: "video",
  },
  {
    id: "f5",
    kind: "announcement",
    author: "Hoox",
    handle: "@hoox",
    seed: "owl",
    verified: true,
    badge: "official",
    time: "3h",
    title: "New Course: Advanced Order Flow is live",
    body: "Master the footprint chart with the Owl method — free for Premium Alpha members this week.",
    tag: "Announcement",
    likes: 2140,
    comments: 184,
    shares: 512,
  },
  {
    id: "f6",
    kind: "post",
    author: "Amir K.",
    handle: "@amir",
    seed: "opt",
    time: "5h",
    body: "Weekly IV crush was textbook. Anyone else close their short vol books into today's session? Sharing the P&L breakdown in Options Desk.",
    tag: "Community",
    likes: 218,
    comments: 34,
    shares: 12,
  },
];

// ---- Trending topics ----
export const trendingTopics = [
  { tag: "#BTC", posts: "12.4k posts" },
  { tag: "#FOMC", posts: "8.1k posts" },
  { tag: "#ETH", posts: "6.7k posts" },
  { tag: "#OrderFlow", posts: "3.2k posts" },
  { tag: "#OptionsFlow", posts: "2.8k posts" },
];

// Deterministic gradient avatar from a seed — no network dependency, always crisp.
export function avatarGradient(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) & 0xffff;
  const a = 260 + (h % 80);
  const b = (a + 40) % 360;
  return `linear-gradient(135deg, oklch(0.55 0.2 ${a}), oklch(0.28 0.12 ${b}))`;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}
