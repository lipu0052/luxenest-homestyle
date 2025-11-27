import { useEffect, useState } from "react";
import { Link } from "react-router";
import Layout from "@/react-app/components/Layout";
import ProductCard from "@/react-app/components/ProductCard";
import { Room, Product, Article } from "@/types";
import { ArrowRight, TrendingUp, Sparkles, BookOpen, Mail } from "lucide-react";
// Add this under your imports
type ArticleWithRoom = Article & { room_id: string | null };

const API = import.meta.env.VITE_API_URL; 
console.log("API URL:", API);


export default function Home() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    const initAdmin = async () => {
      await fetch(`${API}/api/admin/init`, { method: "POST" });
    };

    const fetchData = async () => {
      try {
        const [roomsRes, productsRes, articlesRes] = await Promise.all([
          fetch(`${API}/api/rooms`),
          fetch(`${API}/api/products`),
          fetch(`${API}/api/articles`),
        ]);

        const roomsData = await roomsRes.json();
        const productsData = await productsRes.json();

        const rawArticlesData = await articlesRes.json();

        const articlesData: Article[] = Array.isArray(rawArticlesData)
          ? rawArticlesData
          : Array.isArray(rawArticlesData?.articles)
            ? rawArticlesData.articles
            : [];

        setRooms(roomsData);
        setTrendingProducts(productsData.slice(0, 8));

        // Group articles by room
        const articlesByRoom = new Map<string | null, ArticleWithRoom[]>();

        articlesData.forEach((article: Article) => {
          if (!articlesByRoom.has(article.room_id)) {
            articlesByRoom.set(article.room_id, []);
          }
          articlesByRoom.get(article.room_id)!.push(article);
        });



        // Take one article from each room until we have 3
        const variedArticles: Article[] = [];
        const roomIds = Array.from(articlesByRoom.keys());
        let currentIndex = 0;

        while (variedArticles.length < 3 && variedArticles.length < articlesData.length) {
          const roomId = roomIds[currentIndex % roomIds.length];
          const roomArticles = articlesByRoom.get(roomId)!;

          if (roomArticles.length > 0) {
            variedArticles.push(roomArticles.shift()!);
          }

          if (roomArticles.length === 0) {
            roomIds.splice(currentIndex % roomIds.length, 1);
            if (roomIds.length === 0) break;
          } else {
            currentIndex++;
          }
        }

        setRecentArticles(variedArticles.length > 0 ? variedArticles : articlesData.slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    initAdmin();
    fetchData();
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribing(true);

    try {
      const response = await fetch(`${API}/api/subscribers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSubscribed(true);
        setEmail("");
      } else {
        alert("Subscription failed. Please try again.");
      }
    } catch (error) {
      console.error("Subscription failed:", error);
      alert("Subscription failed. Please try again.");
    } finally {
      setSubscribing(false);
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

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gray-950">
        {/* Background Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black"></div>

        {/* Blurred Hero Background Image */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center blur-sm scale-110 opacity-90"
            style={{
              backgroundImage:
                'url("https://images.unsplash.com/photo-1600210492493-0946911123ea")',
            }}
          ></div>
        </div>


        {/* Content */}
        <div className="relative z-20 max-w-7xl mx-auto px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left Content */}
            <div className="text-white">
              {/* Top Badge */}
              <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-sm font-medium mb-8 shadow-sm">
                <Sparkles className="w-4 h-4" />
                Premium Home Design Inspiration
              </div>

              {/* Professional Heading */}
              <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight tracking-tight">
                Transform Your Home Into a
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-white">
                  Masterpiece
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-lg md:text-xl text-white mb-10 leading-relaxed max-w-xl">
                Explore expertly curated interior designs, luxury décor ideas, and
                personalized style guides crafted to help you elevate every room of your home.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <a
                  href="#rooms"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-full font-medium hover:bg-gray-200 transition-all shadow-lg hover:shadow-xl"
                >
                  Explore Rooms
                  <ArrowRight className="w-5 h-5" />
                </a>

                <a
                  href="#trending"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full font-medium hover:bg-white/20 transition-all"
                >
                  View Products
                </a>
              </div>
            </div>

            {/* Right Visual Grid */}
            <div className="hidden lg:grid grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="rounded-3xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition duration-500">
                  <img
                    src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&auto=format&fit=crop"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="rounded-3xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition duration-500">
                  <img
                    src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&auto=format&fit=crop"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="space-y-6 pt-10">
                <div className="rounded-3xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition duration-500">
                  <img
                    src="https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=600&auto=format&fit=crop"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="rounded-3xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition duration-500">
                  <img
                    src="https://images.unsplash.com/photo-1615529182904-14819c35db37?w=600&auto=format&fit=crop"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-7 h-12 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-2.5 bg-white/50 rounded-full"></div>
          </div>
        </div>
      </section>


      {/* Trending Products Section */}
      <section id="trending" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-6 h-6 text-gray-900" />
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900">
                  Trending Products
                </h2>
              </div>
              <p className="text-gray-600">Most popular items this month</p>
            </div>
          </div>
          {trendingProducts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No products available yet.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6">
              {trendingProducts.map((product) => (
                <ProductCard key={product._id || product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Style Guide Section */}
      <section id="articles" className="py-16 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <BookOpen className="w-6 h-6 text-gray-900" />
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900">
                Style Guides & Articles
              </h2>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Expert tips and in-depth guides to help you design the perfect space
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {recentArticles.map((article) => (
              <Link
                key={article._id || article.id}
                to={`/articles/${article.slug}`}

                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
              >
                {article.hero_image && (
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={article.hero_image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="font-serif text-xl font-semibold text-gray-900 mb-2 group-hover:text-gray-600 transition">
                    {article.title}
                  </h3>
                  {article.excerpt && (
                    <p className="text-gray-600 text-sm line-clamp-2">{article.excerpt}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/articles"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition"
            >
              View All Articles
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Rooms Section */}
      <section id="rooms" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Explore by Room
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Browse our curated collection of design ideas, articles, and products organized by room
            </p>
          </div>

          {rooms.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No rooms yet. Visit the admin panel to add rooms.</p>
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition"
              >
                Go to Admin
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {rooms.map((room) => (
                <Link
                  key={room.id}
                  to={`/rooms/${room.slug}`}
                  className="group block"
                >
                  <div className="relative overflow-hidden rounded-xl aspect-[4/3] bg-gray-200 mb-3 shadow-sm hover:shadow-md transition">
                    {room.hero_image && (
                      <img
                        src={room.hero_image}
                        alt={room.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-4 md:p-6">
                      <h3 className="font-serif text-xl md:text-2xl font-bold text-white">
                        {room.name}
                      </h3>
                    </div>
                  </div>
                  {room.description && (
                    <p className="text-gray-600 text-sm line-clamp-2">{room.description}</p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section id="newsletter" className="py-16 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full mb-6">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
            Stay Inspired
          </h2>
          <p className="text-gray-300 mb-8 text-lg">
            Get expert tips, design inspiration, and exclusive product recommendations delivered to your inbox
          </p>

          {subscribed ? (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
              <p className="text-green-300 text-lg">Thanks for subscribing! 🎉</p>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-6 py-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <button
                  type="submit"
                  disabled={subscribing}
                  className="px-8 py-4 bg-white text-gray-900 rounded-full font-medium hover:bg-gray-100 transition whitespace-nowrap disabled:opacity-50"
                >
                  {subscribing ? "Subscribing..." : "Subscribe"}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-serif text-xl font-bold text-gray-900 mb-2">Expert Curation</h3>
              <p className="text-gray-600 text-sm">
                Every product and design idea is carefully selected by our interior design experts
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="font-serif text-xl font-bold text-gray-900 mb-2">Style Guides</h3>
              <p className="text-gray-600 text-sm">
                Comprehensive guides to help you master every aspect of home design
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="font-serif text-xl font-bold text-gray-900 mb-2">Wishlist & Save</h3>
              <p className="text-gray-600 text-sm">
                Save your favorite products and design ideas for later reference
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
