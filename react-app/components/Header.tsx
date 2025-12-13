import { Link, useNavigate } from "react-router";
import { Search, Heart, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Left - Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center ">
              <img
                src="https://mocha-cdn.com/019a99eb-ac15-7147-bf15-fdbcf1b92b92/image-(32).png"
                alt="LuxeNest Logo"
                className="h-16 w-16"
              />
              <span className="text-2xl font-serif font-bold -ml-2">LuxeNest</span>


            </Link>


          </div>





          {/* RIGHT SIDE: Search + Articles + Products */}
          <div className="hidden md:flex items-center gap-4 ml-auto">
            {/* Desktop Nav */}
            <nav className="flex items-center gap-4">
              <Link
                to="/articles"
                className="text-gray-700 hover:text-gray-900 font-medium transition"
              >
                Articles
              </Link>
              <Link
                to="/products"
                className="text-gray-700 hover:text-gray-900 font-medium transition"
              >
                Products
              </Link>
            </nav>

            {/* Desktop Search (bigger now) */}
            <form onSubmit={handleSearch} className="flex items-center">
              <div className="relative w-64"> {/* UPDATED SIZE */}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search rooms, articles, products..."
                  className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-full 
                  focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </form>



            <Link
              to="/wishlist"
              className="p-2 hover:bg-gray-100 rounded-full transition hidden md:block"
            >
              <Heart className="w-6 h-6" />
            </Link>
          </div>

          {/* Mobile Icons */}
          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <Search className="w-6 h-6" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {mobileSearchOpen && (
          <form onSubmit={handleSearch} className="md:hidden pb-4 mt-2">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rooms, articles, products..."
                className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-full 
                focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </form>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200 mt-4 pt-4 ml-4">
            <nav className="flex flex-col gap-4">
              <Link
                to="/articles"
                onClick={() => setMobileMenuOpen(false)}
                className="ml-4 text-gray-700 hover:text-gray-900 font-medium transition"
              >
                Articles
              </Link>
              <Link
                to="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="ml-4 text-gray-700 hover:text-gray-900 font-medium transition"
              >
                Products
              </Link>
              <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} className="ml-4 text-gray-700 hover:text-gray-900 font-medium transition">
                 Wishlist
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
