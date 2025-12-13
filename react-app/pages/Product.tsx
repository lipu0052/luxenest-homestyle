import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import Layout from "../components/Layout";
import ProductCard from "../components/ProductCard";
import ImageCarousel from "../components/ImageCarousel";
import ReviewSection from "../components/ReviewSection";
import EditProductModal from "../components/EditProductModal";
import { Product, Article } from "../types";
import { Heart, ShoppingCart, Edit, ArrowRight, Leaf } from "lucide-react";

const API = import.meta.env.VITE_API_URL;

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check admin status
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

  // Fetch product and related products
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    const fetchData = async () => {
      try {
        // Fetch product
        const productRes = await fetch(`${API}/api/products/${slug}`);
        const productData = await productRes.json();
        setProduct(productData);

        // Related products
        if (productData.room_id) {
          const relatedRes = await fetch(
            `${API}/api/products?room_id=${(productData.room_id as any)?._id || productData.room_id}`
          );
          const relatedData = await relatedRes.json();
          setRelatedProducts(
            relatedData.filter((p: Product) => p._id !== productData._id).slice(0, 4)
          );
        }

        // Wishlist
        const sessionId = localStorage.getItem("session_id");
        if (sessionId) {
          const wishlistRes = await fetch(`${API}/api/wishlist?session_id=${sessionId}`);
          const wishlistData: Product[] = await wishlistRes.json();
          setIsWishlisted(wishlistData.some(p => p._id === productData._id));
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  // Fetch related articles separately
  useEffect(() => {
    if (!product || !product.room_id) return;

    const loadRelatedArticles = async () => {
      try {
        const roomId = (product.room_id as any)?._id || product.room_id;
        const res = await fetch(`${API}/api/articles?room_id=${roomId}&limit=6`);
        const data = await res.json();
        setRelatedArticles(data.articles || []); // <-- here the articles are inside `data.articles`
      } catch (err) {
        console.error("Failed to fetch related articles:", err);
      }
    };

    loadRelatedArticles();
  }, [product]);


  // Wishlist toggle
  const handleWishlist = async () => {
    if (!product) return;

    let sessionId = localStorage.getItem("session_id");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem("session_id", sessionId);
    }

    try {
      if (isWishlisted) {
        await fetch(`${API}/api/wishlist`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: sessionId, productId: product._id }),
        });
        setIsWishlisted(false);
      } else {
        await fetch(`${API}/api/wishlist`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: sessionId, productId: product._id }),
        });
        setIsWishlisted(true);
      }
    } catch (error) {
      console.error("Failed to update wishlist:", error);
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

  const images =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images.map((img: any) => (typeof img === "string" ? img : img.url))
      : product.image
        ? [product.image]
        : [];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          <div className="w-full max-w-[1200px] mx-auto px-3 sm:px-4 md:px-6 flex justify-center">
            <ImageCarousel images={images} alt={product.name} />
          </div>

          <div>
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="font-serif text-4xl font-bold text-gray-900 flex-1">{product.name}</h1>

              {isAdmin && (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
                >
                  <Edit className="w-4 h-4" /> Edit
                </button>
              )}
            </div>

            <div className="text-3xl font-bold text-gray-900 mb-6">${product.price.toFixed(2)}</div>

            {product.description && (
              <div className="text-gray-700 mb-8 whitespace-pre-wrap leading-relaxed">
                {product.description}
              </div>
            )}

            <div className="flex gap-4">
              <a
                href={product.affiliate_link || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-gray-900 text-white px-8 py-5 rounded-full font-bold text-lg hover:bg-black flex items-center justify-center gap-3 text-center"
              >
                <ShoppingCart className="w-6 h-6" />
                {product.affiliate_link ? "Buy Now" : "Coming Soon"}
              </a>

              <button
                onClick={handleWishlist}
                className={`px-6 py-4 rounded-full border-2 transition ${isWishlisted ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-gray-400"
                  }`}
              >
                <Heart
                  className={`w-6 h-6 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"}`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="mb-20">
          <ReviewSection productId={product._id} />
        </div>

        {relatedProducts.length > 0 && (
          <section className="mb-24">
            <h2 className="font-serif text-3xl font-bold text-gray-900 mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((rp) => (
                <ProductCard key={rp._id} product={rp} />
              ))}
            </div>
          </section>
        )}

        {relatedArticles.length > 0 && (
          <section className="py-16 bg-gray-50 border-t border-gray-200 mt-12">
            <div className="max-w-7xl mx-auto px-6">
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-center text-gray-900 mb-12">
                Related Articles
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {relatedArticles.map((rel) => (
                  <Link
                    key={rel._id}
                    to={`/articles/${rel.slug}`}
                    className="group block bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    {rel.hero_image ? (
                      <div className="h-56 overflow-hidden">
                        <img
                          src={rel.hero_image}
                          alt={rel.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-56 bg-gray-100 flex items-center justify-center text-gray-500">
                        <Leaf className="w-8 h-8 opacity-50" />
                      </div>
                    )}

                    <div className="p-6 md:p-8">
                      <h3 className="font-serif text-xl md:text-2xl font-bold text-gray-900 mb-3 line-clamp-2">
                        {rel.title}
                      </h3>

                      {rel.excerpt && (
                        <p className="text-gray-600 text-base line-clamp-3 mb-4">{rel.excerpt}</p>
                      )}

                      <div className="flex items-center gap-2 text-emerald-600 font-semibold">
                        Read Article
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
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
