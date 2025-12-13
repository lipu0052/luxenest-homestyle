import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router";
import Layout from "../components/Layout";
import ArticleCard from "../components/ArticleCard";
import ProductCard from "../components/ProductCard";
import { Room, Article, Product } from "../types";
const API = import.meta.env.VITE_API_URL;

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<{
    rooms: Room[];
    articles: Article[];
    products: Product[];
  }>({ rooms: [], articles: [], products: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Scroll to top when search query changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    const fetchResults = async () => {
      if (!query) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API}/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </Layout>
    );
  }

  const totalResults = results.rooms.length + results.articles.length + results.products.length;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="font-serif text-4xl font-bold text-gray-900 mb-2">
          Search Results
        </h1>
        <p className="text-gray-600 mb-12">
          Found {totalResults} results for "{query}"
        </p>

        {totalResults === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No results found. Try a different search term.</p>
          </div>
        ) : (
          <div className="space-y-16">
            {/* Rooms */}
            {results.rooms.length > 0 && (
              <section>
                <h2 className="font-serif text-2xl font-bold text-gray-900 mb-6">
                  Rooms ({results.rooms.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {results.rooms.map((room) => (
                    <Link key={room._id} to={`/rooms/${room.slug}`} className="group block">
                      <div className="relative overflow-hidden rounded-lg aspect-[4/3] bg-gray-200 mb-3">
                        {room.hero_image && (
                          <img
                            src={room.hero_image}
                            alt={room.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                          <h3 className="font-serif text-xl font-bold text-white">
                            {room.name}
                          </h3>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Articles */}
            {results.articles.length > 0 && (
              <section>
                <h2 className="font-serif text-2xl font-bold text-gray-900 mb-6">
                  Articles ({results.articles.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {results.articles.map((article) => (
                    <ArticleCard key={article._id} article={article} />
                  ))}
                </div>
              </section>
            )}

            {/* Products */}
            {results.products.length > 0 && (
              <section>
                <h2 className="font-serif text-2xl font-bold text-gray-900 mb-6">
                  Products ({results.products.length})
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  {results.products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
