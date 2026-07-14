const INSTAGRAM_API_VERSION = "v24.0";

let instagramCache = {
  posts: [],
  fetchedAt: 0,
};

const CACHE_DURATION = 15 * 60 * 1000;

const getInstagramConfiguration = () => {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

  const instagramUserId = process.env.INSTAGRAM_USER_ID;

  return {
    accessToken,
    instagramUserId,
  };
};

const fetchInstagramPostsFromMeta = async () => {
  const {
    accessToken,
    instagramUserId,
  } = getInstagramConfiguration();

  if (!accessToken || !instagramUserId) {
    throw new Error(
      "Instagram API credentials are not configured."
    );
  }

  const fields = [
    "id",
    "caption",
    "media_type",
    "media_url",
    "thumbnail_url",
    "permalink",
    "timestamp",
  ].join(",");

  const requestUrl =
    `https://graph.facebook.com/${INSTAGRAM_API_VERSION}` +
    `/${instagramUserId}/media` +
    `?fields=${encodeURIComponent(fields)}` +
    `&limit=6` +
    `&access_token=${encodeURIComponent(accessToken)}`;

  const response = await fetch(requestUrl);

  const data = await response.json();

  if (!response.ok) {
    console.error(
      "Instagram API response:",
      data
    );

    throw new Error(
      data?.error?.message ||
        "Unable to retrieve Instagram posts."
    );
  }

  return data.data || [];
};

const normalizeInstagramPost = (post) => {
  const mediaType =
    post.media_type?.toLowerCase() || "image";

  return {
    id: post.id,

    caption:
      post.caption ||
      "Discover jewellery inspiration from Muliya Jewels.",

    mediaType,

    image:
      post.media_type === "VIDEO"
        ? post.thumbnail_url || post.media_url
        : post.media_url,

    postUrl: post.permalink,

    timestamp: post.timestamp,
  };
};

export const getInstagramPosts = async () => {
  const currentTime = Date.now();

  const cacheIsValid =
    instagramCache.posts.length > 0 &&
    currentTime - instagramCache.fetchedAt <
      CACHE_DURATION;

  if (cacheIsValid) {
    return {
      source: "cache",
      posts: instagramCache.posts,
    };
  }

  const posts =
    await fetchInstagramPostsFromMeta();

  const normalizedPosts = posts
    .map(normalizeInstagramPost)
    .filter(
      (post) =>
        post.image &&
        post.postUrl
    );

  instagramCache = {
    posts: normalizedPosts,
    fetchedAt: currentTime,
  };

  return {
    source: "live",
    posts: normalizedPosts,
  };
};