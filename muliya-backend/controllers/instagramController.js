import { getInstagramPosts } from "../services/instagramService.js";

const fallbackPosts = [
  {
    id: "fallback-1",
    caption:
      "Discover timeless gold jewellery inspired by tradition and modern elegance.",
    mediaType: "image",
    image:
      "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=900&q=85",
    postUrl: "https://www.instagram.com/muliyajewels/",
    timestamp: null,
  },
  {
    id: "fallback-2",
    caption:
      "Explore jewellery craftsmanship designed for weddings and special celebrations.",
    mediaType: "image",
    image:
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=85",
    postUrl: "https://www.instagram.com/muliyajewels/",
    timestamp: null,
  },
  {
    id: "fallback-3",
    caption:
      "Elegant diamond jewellery created for engagements, gifting, and everyday brilliance.",
    mediaType: "image",
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=85",
    postUrl: "https://www.instagram.com/muliyajewels/",
    timestamp: null,
  },
  {
    id: "fallback-4",
    caption:
      "Festive jewellery inspiration featuring statement designs and heritage craftsmanship.",
    mediaType: "image",
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=85",
    postUrl: "https://www.instagram.com/muliyajewels/",
    timestamp: null,
  },
  {
    id: "fallback-5",
    caption:
      "Traditional artistry meets contemporary jewellery styling at Muliya Jewels.",
    mediaType: "image",
    image:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=85",
    postUrl: "https://www.instagram.com/muliyajewels/",
    timestamp: null,
  },
  {
    id: "fallback-6",
    caption:
      "Follow Muliya Jewels for new collections, showroom updates, and jewellery inspiration.",
    mediaType: "image",
    image:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=85",
    postUrl: "https://www.instagram.com/muliyajewels/",
    timestamp: null,
  },
];

const getInstagramFeed = async (req, res) => {
  try {
    const result = await getInstagramPosts();

    if (!result.posts.length) {
      return res.status(200).json({
        success: true,
        source: "fallback",
        warning:
          "No Instagram posts were returned. Showing curated fallback content.",
        profileUrl: "https://www.instagram.com/muliyajewels/",
        username: "muliyajewels",
        count: fallbackPosts.length,
        posts: fallbackPosts,
      });
    }

    return res.status(200).json({
      success: true,
      source: result.source,
      profileUrl: "https://www.instagram.com/muliyajewels/",
      username: "muliyajewels",
      count: result.posts.length,
      posts: result.posts,
    });
  } catch (error) {
    console.error("Instagram feed error:", error.message);

    return res.status(200).json({
      success: true,
      source: "fallback",
      warning:
        "Live Instagram posts are currently unavailable. Showing curated fallback content.",
      profileUrl: "https://www.instagram.com/muliyajewels/",
      username: "muliyajewels",
      count: fallbackPosts.length,
      posts: fallbackPosts,
    });
  }
};

export { getInstagramFeed };