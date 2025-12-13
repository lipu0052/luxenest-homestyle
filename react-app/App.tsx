import { BrowserRouter as Router, Routes, Route } from "react-router";
import HomePage from "../react-app/pages/Home";
import RoomPage from "../react-app/pages/Room";
import ArticlePage from "../react-app/pages/Article";
import ArticlesPage from "../react-app/pages/Articles";
import ProductPage from "../react-app/pages/Product";
import ProductsPage from "../react-app/pages/Products";
import AdminPage from "../react-app/pages/Admin";
import SearchPage from "../react-app/pages/Search";
import WishlistPage from "../react-app/pages/Wishlist";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/rooms/:slug" element={<RoomPage />} />
        <Route path="/articles" element={<ArticlesPage />} />
        <Route path="/articles/:slug" element={<ArticlePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:slug" element={<ProductPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
      </Routes>
    </Router>
  );
}
