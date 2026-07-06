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

function Home() {
  return (
    <div className="home-page">
      <Navbar />

      <main>
        <HeroSlider />

        <Categories />

        <FeaturedCollections />

        <TrendingProducts />

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