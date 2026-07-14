import { useEffect, useState } from "react";

import {
  ExternalLink,
  Image,
  Play,
  RefreshCw,
} from "lucide-react";

import { getInstagramPosts } from "../api/instagramApi";

const DEFAULT_PROFILE_URL =
  "https://www.instagram.com/muliyajewels/";

function InstagramFeed() {
  const [posts, setPosts] = useState([]);
  const [profileUrl, setProfileUrl] = useState(
    DEFAULT_PROFILE_URL
  );
  const [username, setUsername] = useState("muliyajewels");
  const [source, setSource] = useState("");
  const [warning, setWarning] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadInstagramPosts = async () => {
    try {
      setLoading(true);
      setError("");
      setWarning("");

      const data = await getInstagramPosts();

      setPosts(
        Array.isArray(data.posts) ? data.posts : []
      );

      setProfileUrl(
        data.profileUrl || DEFAULT_PROFILE_URL
      );

      setUsername(
        data.username || "muliyajewels"
      );

      setSource(data.source || "");

      setWarning(data.warning || "");
    } catch (requestError) {
      console.error(
        "Unable to load Instagram feed:",
        requestError
      );

      setError(
        requestError.message ||
          "Unable to load Instagram posts."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInstagramPosts();
  }, []);

  const formatPostDate = (timestamp) => {
    if (!timestamp) {
      return "";
    }

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <section className="instagram-section">
      <div className="container">
        <div className="instagram-section-header">
          <div>
            <p className="section-eyebrow">
              Muliya on Instagram
            </p>

            <h2 className="section-title">
              Jewellery Inspiration
            </h2>

            <p className="section-description">
              Explore campaign highlights, bridal collections,
              festive launches, showroom updates, and jewellery
              stories from Muliya Jewels.
            </p>
          </div>

          <div className="instagram-header-actions">
            <button
              type="button"
              className="instagram-refresh-btn"
              onClick={loadInstagramPosts}
              disabled={loading}
            >
              <RefreshCw
                size={16}
                className={loading ? "spinning" : ""}
              />

              {loading ? "Refreshing..." : "Refresh"}
            </button>

            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="instagram-follow-btn"
            >
              Follow @{username}
              <ExternalLink size={17} />
            </a>
          </div>
        </div>

        {warning && (
          <p className="instagram-feed-warning">
            {warning}
          </p>
        )}

        {loading && posts.length === 0 ? (
          <div className="instagram-feed-status">
            <RefreshCw
              size={30}
              className="spinning"
            />

            <h3>Loading Instagram posts...</h3>

            <p>
              Retrieving the latest jewellery inspiration.
            </p>
          </div>
        ) : error && posts.length === 0 ? (
          <div className="instagram-feed-status instagram-feed-error">
            <h3>Instagram feed unavailable</h3>

            <p>{error}</p>

            <button
              type="button"
              className="primary-btn"
              onClick={loadInstagramPosts}
            >
              Try Again
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="instagram-feed-status">
            <h3>No posts available</h3>

            <p>
              Visit the official Muliya Instagram profile for
              the latest updates.
            </p>

            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="primary-btn"
            >
              Visit Instagram
            </a>
          </div>
        ) : (
          <>
            <div className="instagram-grid">
              {posts.map((post) => {
                const isVideo =
                  post.mediaType === "video";

                const postDate = formatPostDate(
                  post.timestamp
                );

                return (
                  <article
                    className="instagram-card"
                    key={post.id}
                  >
                    <div className="instagram-image-wrapper">
                      <img
                        src={post.image}
                        alt={
                          post.caption ||
                          "Muliya jewellery Instagram post"
                        }
                      />

                      <div className="instagram-media-badge">
                        {isVideo ? (
                          <>
                            <Play
                              size={15}
                              fill="currentColor"
                            />
                            Reel
                          </>
                        ) : (
                          <>
                            <Image size={15} />
                            Post
                          </>
                        )}
                      </div>

                      <div className="instagram-overlay">
                        <a
                          href={
                            post.postUrl || profileUrl
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="instagram-view-link"
                        >
                          View on Instagram
                          <ExternalLink size={15} />
                        </a>
                      </div>
                    </div>

                    <div className="instagram-card-content">
                      <p>
                        {post.caption ||
                          "Discover jewellery inspiration from Muliya Jewels."}
                      </p>

                      <div className="instagram-card-meta">
                        <a
                          href={profileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          @{username}
                        </a>

                        {postDate && (
                          <span>{postDate}</span>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="instagram-bottom-cta">
              <div>
                <p>
                  Follow Muliya Jewels for new collections,
                  bridal inspiration, showroom updates, and
                  festive launches.
                </p>

                {source && (
                  <span className="instagram-source-label">
                    Feed source:{" "}
                    {source === "live"
                      ? "Live Instagram API"
                      : source === "cache"
                        ? "Cached Instagram feed"
                        : "Curated fallback content"}
                  </span>
                )}
              </div>

              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="primary-btn"
              >
                Visit @{username}
              </a>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default InstagramFeed;