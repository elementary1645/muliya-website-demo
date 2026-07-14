import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Gold from "./pages/Gold";
import Diamond from "./pages/Diamond";
import Silver from "./pages/Silver";
import ProductDetails from "./pages/ProductDetails";
import SearchResults from "./pages/SearchResults";
import Wishlist from "./pages/Wishlist";
import Compare from "./pages/Compare";
import BranchProducts from "./pages/BranchProducts";

import Chatbot from "./components/Chatbot";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/gold" element={<Gold />} />

        <Route path="/diamond" element={<Diamond />} />

        <Route path="/silver" element={<Silver />} />

        <Route
          path="/product/:id"
          element={<ProductDetails />}
        />

        <Route
          path="/search"
          element={<SearchResults />}
        />

        <Route
          path="/wishlist"
          element={<Wishlist />}
        />

        <Route
          path="/compare"
          element={<Compare />}
        />

        <Route
          path="/branch/:branch"
          element={<BranchProducts />}
        />

        <Route
          path="*"
          element={
            <main className="not-found-page">
              <h1>404</h1>

              <p>
                The page you are looking for does not exist.
              </p>
            </main>
          }
        />
      </Routes>

      <Chatbot />
    </>
  );
}

export default App;