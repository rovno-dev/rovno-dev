/**
 * Latest-channel-video resolver for the home page.
 *
 * Channels are configured server-side through env (one YouTube and one VK
 * Video link per language). The YouTube RSS feed is the primary source; VK
 * is resolved from a direct video URL or by reading the channel page. Every
 * network call fails soft to `null`, so the section simply disappears when
 * nothing is configured or reachable.
 */

export type VideoProvider = "youtube" | "vk";

export interface LatestVideo {
  provider: VideoProvider;
  videoId: string;
  title: string;
  embedUrl: string;
  watchUrl: string;
  thumbnail?: string | null;
  publishedAt?: string | null;
}

export interface VideoPair {
  youtube: LatestVideo | null;
  vk: LatestVideo | null;
}

export interface ChannelLinks {
  youtube?: string;
  vk?: string;
}

export interface RecommendedVideosPayload {
  videos: { ru: VideoPair; en: VideoPair };
  channels: { ru: ChannelLinks; en: ChannelLinks };
}

const FETCH_TIMEOUT_MS = 10_000;
const CACHE_OPTIONS = {
  next: { revalidate: 3600, tags: ["latest-video"] },
} as any;
const USER_AGENT =
  "Mozilla/5.0 (compatible; RovnoDevBot/1.0; +https://rovno.dev)";

async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      ...CACHE_OPTIONS,
      headers: {
        "User-Agent": USER_AGENT,
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    } as any);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function decodeXml(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .trim();
}

function getTag(xml: string, tag: string): string | null {
  const match = xml.match(
    new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"),
  );
  return match ? decodeXml(match[1]) : null;
}

function youtubeChannelId(value: string): string | null {
  const fromUrl = value.match(
    /(?:channel_id=|channel\/)(UC[\w-]{22})/i,
  )?.[1];
  if (fromUrl) return fromUrl;
  return value.match(/UC[\w-]{22}/)?.[0] ?? null;
}

async function resolveYoutubeFeed(channel: string): Promise<string | null> {
  const value = channel.trim();
  if (!value) return null;

  if (/youtube\.com\/feeds\/videos\.xml/i.test(value)) return value;

  const channelId = youtubeChannelId(value);
  if (channelId) {
    return `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  }

  const user = value.match(/youtube\.com\/user\/([^/?#]+)/i)?.[1];
  if (user) {
    return `https://www.youtube.com/feeds/videos.xml?user=${encodeURIComponent(user)}`;
  }

  let pageUrl = value;
  const handle = value.match(/@([^/?#]+)/)?.[1];
  if (handle) {
    pageUrl = `https://www.youtube.com/@${handle}`;
  } else if (/^[A-Za-z0-9._-]+$/.test(value)) {
    pageUrl = `https://www.youtube.com/@${value}`;
  }

  const html = await fetchText(pageUrl);
  if (!html) return null;

  const resolvedId =
    html.match(/"channelId":"(UC[\w-]{22})"/)?.[1] ??
    html.match(/"externalId":"(UC[\w-]{22})"/)?.[1] ??
    html.match(/channel\/(UC[\w-]{22})/)?.[1];

  return resolvedId
    ? `https://www.youtube.com/feeds/videos.xml?channel_id=${resolvedId}`
    : null;
}

async function getLatestYoutube(channel: string): Promise<LatestVideo | null> {
  const feedUrl = await resolveYoutubeFeed(channel);
  if (!feedUrl) return null;

  const xml = await fetchText(feedUrl);
  if (!xml) return null;

  const entry = xml.match(/<entry>([\s\S]*?)<\/entry>/i)?.[1];
  if (!entry) return null;

  const videoId =
    getTag(entry, "yt:videoId") ?? getTag(entry, "videoId");
  if (!videoId) return null;

  const title = getTag(entry, "title") ?? "";
  const publishedAt = getTag(entry, "published");
  const thumbnail =
    entry.match(/<media:thumbnail[^>]*url="([^"]+)"/i)?.[1] ??
    `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  return {
    provider: "youtube",
    videoId,
    title,
    publishedAt,
    thumbnail,
    embedUrl: `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`,
    watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
  };
}

function vkVideoFromIds(oid: string, id: string, title = ""): LatestVideo {
  return {
    provider: "vk",
    videoId: `${oid}_${id}`,
    title,
    embedUrl: `https://vk.com/video_ext.php?oid=${encodeURIComponent(
      oid,
    )}&id=${encodeURIComponent(id)}&hd=2`,
    watchUrl: `https://vk.com/video${oid}_${id}`,
    thumbnail: null,
  };
}

function parseVkDirect(value: string): LatestVideo | null {
  try {
    const url = new URL(value);
    const oid = url.searchParams.get("oid");
    const id = url.searchParams.get("id");
    if (oid && id) return vkVideoFromIds(oid, id);
  } catch {
    // Not a full URL - fall through to the path/query patterns below.
  }

  const match = value.match(/(?:video|clip)(-?\d+)_(\d+)/i);
  return match ? vkVideoFromIds(match[1], match[2]) : null;
}

function extractVkVideo(html: string): LatestVideo | null {
  const embed = html.match(
    /video_ext\.php\?[^"'<>]*?oid=(-?\d+)[^"'<>]*?id=(\d+)/i,
  );
  if (embed) return vkVideoFromIds(embed[1], embed[2]);

  const url = html.match(
    /(?:vk\.com|vkvideo\.ru)\/video(-?\d+)_(\d+)/i,
  );
  if (url) return vkVideoFromIds(url[1], url[2]);

  const ownerThenId = html.match(
    /"owner_id"\s*:\s*(-?\d+)[^{}]*?"id"\s*:\s*(\d+)/i,
  );
  if (ownerThenId) {
    return vkVideoFromIds(ownerThenId[1], ownerThenId[2]);
  }

  const idThenOwner = html.match(
    /"id"\s*:\s*(\d+)[^{}]*?"owner_id"\s*:\s*(-?\d+)/i,
  );
  if (idThenOwner) {
    return vkVideoFromIds(idThenOwner[2], idThenOwner[1]);
  }

  const loose = html.match(/video(-?\d+)_(\d+)/i);
  return loose ? vkVideoFromIds(loose[1], loose[2]) : null;
}

async function getLatestVk(channel: string): Promise<LatestVideo | null> {
  const value = channel.trim();
  if (!value) return null;

  const direct = parseVkDirect(value);
  if (direct) return direct;

  const urls = new Set<string>();
  if (value.includes("://")) {
    urls.add(value);
  } else if (value.startsWith("@")) {
    urls.add(`https://vkvideo.ru/${value}`);
    urls.add(`https://vk.com/video/${value}`);
  } else {
    urls.add(`https://vkvideo.ru/@${value.replace(/^@/, "")}`);
    urls.add(`https://vk.com/video/@${value.replace(/^@/, "")}`);
  }

  for (const url of urls) {
    const html = await fetchText(url);
    if (!html) continue;
    const video = extractVkVideo(html);
    if (!video) continue;

    const pageTitle = html.match(
      /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
    )?.[1];
    if (pageTitle) video.title = decodeXml(pageTitle);
    return video;
  }

  return null;
}

function envValue(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return undefined;
}

function channelLinks(lang: "ru" | "en"): ChannelLinks {
  const upper = lang.toUpperCase();
  return {
    youtube: envValue(
      `YOUTUBE_CHANNEL_${upper}`,
      `YOUTUBE_CHANNEL_URL_${upper}`,
      `YT_CHANNEL_${upper}`,
      `NEXT_PUBLIC_YOUTUBE_CHANNEL_${upper}`,
    ),
    vk: envValue(
      `VK_VIDEO_CHANNEL_${upper}`,
      `VK_VIDEO_CHANNEL_URL_${upper}`,
      `VK_CHANNEL_${upper}`,
      `NEXT_PUBLIC_VK_VIDEO_CHANNEL_${upper}`,
    ),
  };
}

async function loadPair(channels: ChannelLinks): Promise<VideoPair> {
  const [youtube, vk] = await Promise.all([
    channels.youtube
      ? getLatestYoutube(channels.youtube)
      : Promise.resolve(null),
    channels.vk ? getLatestVk(channels.vk) : Promise.resolve(null),
  ]);
  return { youtube, vk };
}

export async function getRecommendedVideos(): Promise<RecommendedVideosPayload> {
  const channels = {
    ru: channelLinks("ru"),
    en: channelLinks("en"),
  };

  const [ru, en] = await Promise.all([
    loadPair(channels.ru),
    loadPair(channels.en),
  ]);

  return {
    videos: { ru, en },
    channels,
  };
}
