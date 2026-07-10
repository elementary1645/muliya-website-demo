import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import HeroSlider from "../components/HeroSlider";
import Categories from "../components/Categories";
import FeaturedCollections from "../components/FeaturedCollections";
import TrendingProducts from "../components/TrendingProducts";
import AIImageSearch from "../components/AIImageSearch";
import WhyChooseUs from "../components/WhyChooseUs";
import StoreLocator from "../components/StoreLocator";
import Testimonials from "../components/Testimonials";
import InstagramFeed from "../components/InstagramFeed";
import Footer from "../components/Footer";

import localProducts from "../data/products";
import { getProducts } from "../api/productApi";

function Home() {
  const [products, setProducts] = useState(localProducts);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const backendProducts = await getProducts();

        if (backendProducts.length > 0) {
          setProducts(backendProducts);
        }
      } catch (error) {
        console.log("Using local products fallback:", error.message);
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

        <Categories />

        <FeaturedCollections />

        <TrendingProducts products={trendingProducts} />

        <AIImageSearch />

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