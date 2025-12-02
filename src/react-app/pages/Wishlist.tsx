import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/react-app/components/Layout";
import ProductCard from "@/react-app/components/ProductCard";
import { Product } from "@/types";

const API = import.meta.env.VITE_API_URL;

export default function WishlistPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Always ensure a session_id exists (even if user lands directly on /wishlist)
    let sessionId = localStorage.getItem("session_id");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem("session_id", sessionId);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });

    const fetchWishlist = async () => {
      try {
        const response = await fetch(`${API}/api/wishlist?session_id=${sessionId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch wishlist:", error);
        setProducts([]);
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
          <div className="text-center py-20">
            <div className="mb-8">
              <div className="bg-gray-100 border-2 border-dashed rounded-xl w-24 h-24 mx-auto flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            </div>
            <p className="text-xl text-gray-600 mb-4">Your wishlist is empty</p>
            <p className="text-gray-500 mb-8">Save your favorite pieces and come back to them anytime.</p>
            <button
              onClick={() => navigate("/")}
              className="px-8 py-4 bg-gray-900 text-white rounded-full font-medium hover:bg-black transition"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id || product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}