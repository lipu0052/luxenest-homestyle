import { useEffect, useState } from "react";
import Layout from "@/react-app/components/Layout";
import ProductCard from "@/react-app/components/ProductCard";
import { Product } from "@/types";

export default function WishlistPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    const fetchWishlist = async () => {
      const sessionId = localStorage.getItem("session_id");
      if (!sessionId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/wishlist?session_id=${sessionId}`);
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch wishlist:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="font-serif text-4xl font-bold text-gray-900 mb-2">
          My Wishlist
        </h1>
        <p className="text-gray-600 mb-12">
          {products.length} {products.length === 1 ? "item" : "items"} saved
        </p>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Your wishlist is empty.</p>
            <p className="text-gray-400">Start adding products you love!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
