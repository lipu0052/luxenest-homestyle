import { useEffect, useState } from "react";
import { useParams } from "react-router";
import Layout from "@/react-app/components/Layout";
import ProductCard from "@/react-app/components/ProductCard";
import ImageCarousel from "@/react-app/components/ImageCarousel";
import ReviewSection from "@/react-app/components/ReviewSection";
import EditProductModal from "@/react-app/components/EditProductModal";
import { Product } from "@/types";
import { Heart, ShoppingCart, Edit } from "lucide-react";
const API = import.meta.env.VITE_API_URL; 


export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await fetch(`${API}/api/admin/status`);
        const data = await response.json();
        setIsAdmin(data.isAuthenticated);
      } catch (error) {
        console.error("Failed to check admin status:", error);
      }
    };
    checkAdmin();
  }, []);

  useEffect(() => {
    // Scroll to top when product changes
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const fetchData = async () => {
      try {
        const productResponse = await fetch(`${API}/api/products/${slug}`);
        const productData = await productResponse.json();
        setProduct(productData);

        if (productData.room_id) {
          const relatedResponse = await fetch(`${API}/api/products?room_id=${productData.room_id}`);
          const relatedData = await relatedResponse.json();
          setRelatedProducts(
            relatedData.filter((p: Product) => p.id !== productData.id).slice(0, 4)
          );
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  const handleWishlist = async () => {
    if (!product) return;

    const sessionId = localStorage.getItem("session_id") || crypto.randomUUID();
    localStorage.setItem("session_id", sessionId);

    try {
      await fetch(`${API}/api/wishlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: product.id, session_id: sessionId }),
      });
      setIsWishlisted(true);
    } catch (error) {
      console.error("Failed to add to wishlist:", error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Product not found</h1>
        </div>
      </Layout>
    );
  }

  const images = product.images && product.images.length > 0
    ? product.images
    : product.image
      ? [product.image]
      : [];


  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Image Carousel */}
          <div>
            <ImageCarousel images={images} alt={product.name} />
          </div>

          {/* Product Info */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="font-serif text-4xl font-bold text-gray-900 flex-1">
                {product.name}
              </h1>
              {isAdmin && (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
              )}
            </div>

            <div className="text-3xl font-bold text-gray-900 mb-6">
              ${product.price.toFixed(2)}
            </div>

            {product.description && (
              <div className="text-gray-700 mb-8 whitespace-pre-wrap leading-relaxed">
                {product.description}
              </div>
            )}

            {/* <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Free shipping on orders over $50</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span>30-day return policy</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>1-year warranty included</span>
              </div>
            </div> */}

            <div className="flex gap-4">
              <a href={product.affiliate_link || "#"} target="_blank" rel="noopener noreferrer"
                className="flex-1 bg-gray-900 text-white px-8 py-5 rounded-full font-bold text-lg hover:bg-black flex items-center justify-center gap-3 text-center">
                <ShoppingCart className="w-6 h-6" />
                {product.affiliate_link ? "Buy Now" : "Coming Soon"}
              </a>
              <button
                onClick={handleWishlist}
                className={`px-6 py-4 rounded-full border-2 transition ${isWishlisted
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300 hover:border-gray-400"
                  }`}
              >
                <Heart
                  className={`w-6 h-6 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
                    }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mb-20">
          <ReviewSection productId={product._id} />

        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section>
            <h2 className="font-serif text-3xl font-bold text-gray-900 mb-8">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </section>
        )}
      </div>

      {showEditModal && product && (
        <EditProductModal
          product={product}
          onClose={() => setShowEditModal(false)}
          onSave={() => {
            setShowEditModal(false);
            window.location.reload();
          }}
        />
      )}
    </Layout>
  );
}
