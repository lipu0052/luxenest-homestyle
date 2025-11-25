// src/react-app/pages/Room.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import Layout from "@/react-app/components/Layout";
import ArticleCard from "@/react-app/components/ArticleCard";
import ProductCard from "@/react-app/components/ProductCard";
import { Room, Article, Product } from "@/types";

export default function RoomPage() {
  const { slug } = useParams<{ slug: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    const fetchData = async () => {
      try {
        const roomResponse = await fetch(`/api/rooms/${slug}`);
        if (!roomResponse.ok) throw new Error("Room not found");
        const roomData = await roomResponse.json();
        setRoom(roomData);

        const [articlesRes, productsRes] = await Promise.all([
          fetch(`/api/articles?room_id=${roomData._id}`),
          fetch(`/api/products?room_id=${roomData._id}`),
        ]);

        const articlesData = await articlesRes.json();
        const productsData = await productsRes.json();

        setArticles(Array.isArray(articlesData) ? articlesData : articlesData?.articles || []);
        setProducts(Array.isArray(productsData) ? productsData : productsData?.products || []);
      } catch (error) {
        console.error("Failed to fetch room data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-gray-900"></div>
        </div>
      </Layout>
    );
  }

  if (!room) {
    return (
      <Layout>
        <section className="py-32 text-center">
          <h1 className="font-serif text-5xl font-bold text-gray-900 mb-4">Room Not Found</h1>
          <p className="text-xl text-gray-600">We couldn't find the room you're looking for.</p>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative h-96 bg-gray-900 overflow-hidden">
        {room.hero_image ? (
          <img
            src={room.hero_image}
            alt={room.name}
            className="absolute inset-0 w-full h-full object-cover opacity-70"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative h-full flex items-center justify-center px-6">
          <div className="text-center text-white max-w-4xl">
            <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 leading-tight drop-shadow-2xl">
              {room.name}
            </h1>
            {room.description && (
              <p className="text-xl md:text-2xl text-gray-100 leading-relaxed max-w-3xl mx-auto drop-shadow-lg">
                {room.description}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-12 text-center">
            Featured Articles
          </h2>
          {articles.length === 0 ? (
            <p className="text-center text-gray-500 text-lg">No articles yet for this room.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {articles.map((article) => (
                <ArticleCard key={article._id} article={article} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Shop Products */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Shop {room.name} Products
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Handpicked pieces to complete the look
            </p>
          </div>
          {products.length === 0 ? (
            <p className="text-center text-gray-500 text-lg">No products yet for this room.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}