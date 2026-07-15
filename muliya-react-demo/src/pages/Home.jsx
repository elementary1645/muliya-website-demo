import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import HeroSlider from "../components/HeroSlider";
import MetalRates from "../components/MetalRates";
import Categories from "../components/Categories";
import FeaturedCollections from "../components/FeaturedCollections";
import TrendingProducts from "../components/TrendingProducts";
import AIImageSearch from "../components/AIImageSearch";
import WhyChooseUs from "../components/WhyChooseUs";
import StoreLocator from "../components/StoreLocator";
import Testimonials from "../components/Testimonials";
import InstagramFeed from "../components/InstagramFeed";
import Footer from "../components/Footer";
import GoldPredictionPreview from "../components/GoldPredictionPreview";

import { getProducts } from "../api/productApi";

function Home() {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        setProductError("");

        const backendProducts = await getProducts();

        setProducts(backendProducts);
      } catch (error) {
        console.error("Unable to load homepage products:", error);

        setProductError(
          "Unable to load products from the database."
        );
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, []);

  const trendingProducts = products
    .filter((product) => product.trending)
    .slice(0, 8);

  return (
    <div className="home-page">
      <Navbar />

      <main>
        <HeroSlider />

        <MetalRates />

        <Categories />

        <FeaturedCollections />

        {loadingProducts ? (
          <section className="homepage-product-status">
            <div className="container">
              <h2>Loading Jewellery...</h2>

              <p>
                Retrieving products from the online database.
              </p>
            </div>
          </section>
        ) : productError ? (
          <section className="homepage-product-status">
            <div className="container">
              <h2>Products unavailable</h2>

              <p>{productError}</p>
            </div>
          </section>
        ) : (
          <TrendingProducts
            products={trendingProducts}
            title="Trending Jewellery"
            subtitle="Discover jewellery designs customers are exploring right now."
            showViewAll={true}
          />
        )}

        <AIImageSearch />

        <GoldPredictionPreview />

        <WhyChooseUs />

        <StoreLocator />

        <Testimonials />

        <InstagramFeed />
      </main>

      <Footer />
    </div>
  );
}

export default Home;