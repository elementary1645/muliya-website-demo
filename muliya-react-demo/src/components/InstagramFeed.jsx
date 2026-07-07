const instagramImages = [
  "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=600&q=85",
  "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=600&q=85",
  "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=85",
  "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=85",
  "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=85",
  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=85",
];

function InstagramFeed() {
  return (
    <section className="instagram-section">
      <div className="container">
        <div className="section-heading-center">
          <p className="section-eyebrow">Social Gallery</p>

          <h2 className="section-title">Jewellery Inspiration</h2>

          <p className="section-description">
            A visual gallery section can showcase campaign images, festive
            collections, customer stories, and social media highlights.
          </p>
        </div>

        <div className="instagram-grid">
          {instagramImages.map((image, index) => (
            <div className="instagram-card" key={index}>
              <img src={image} alt={`Jewellery inspiration ${index + 1}`} />

              <div className="instagram-overlay">
                <span>View Design</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default InstagramFeed;