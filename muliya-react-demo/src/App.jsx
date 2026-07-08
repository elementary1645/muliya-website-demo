import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Gold from "./pages/Gold";
import Diamond from "./pages/Diamond";
import Silver from "./pages/Silver";
import ProductDetails from "./pages/ProductDetails";
import SearchResults from "./pages/SearchResults";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/gold" element={<Gold />} />
      <Route path="/diamond" element={<Diamond />} />
      <Route path="/silver" element={<Silver />} />
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route path="/search" element={<SearchResults />} />

      <Route
        path="*"
        element={
          <main className="not-found-page">
            <h1>404</h1>
            <p>The page you are looking for does not exist.</p>
          </main>
        }
      />
    </Routes>
  );
}

export default App;