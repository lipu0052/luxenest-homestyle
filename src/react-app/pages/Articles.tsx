// src/pages/ArticlesPage.tsx
import { useEffect, useState } from "react";
import Layout from "@/react-app/components/Layout";
import ArticleCard from "@/react-app/components/ArticleCard";
import { Article } from "@/types";

const API = import.meta.env.VITE_API_URL;

interface Room {
  _id: string;
  name: string;
  slug: string;
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    const fetchData = async () => {
      try {
        const [articlesRes, roomsRes] = await Promise.all([
          fetch(`${API}/api/articles?limit=100`),
          fetch(`${API}/api/rooms`),
        ]);

        const articlesResult = await articlesRes.json();
        const roomsResult = await roomsRes.json();

        // Handle your current wrapped response format
        const articleList = Array.isArray(articlesResult)
          ? articlesResult
          : Array.isArray(articlesResult?.articles)
            ? articlesResult.articles
            : [];

        const roomList = Array.isArray(roomsResult) ? roomsResult : [];

        setArticles(articleList);
        setRooms(roomList);
        setFilteredArticles(articleList); // initial
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setArticles([]);
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter logic
  useEffect(() => {
    let filtered = [...articles];

    if (selectedRoom) {
      filtered = filtered.filter((a) => a.room_id === selectedRoom);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.excerpt?.toLowerCase().includes(q) ||
          a.tags?.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    setFilteredArticles(filtered);
  }, [articles, selectedRoom, searchQuery]);

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
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            All Articles
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our curated collection of interior design articles, tips, and inspiration
          </p>
        </div>

        {/* Filters */}
        <div className="mb-12 space-y-8">
          {/* Search */}
          <div className="max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 rounded-full border border-gray-300 focus:border-gray-900 focus:outline-none text-lg shadow-sm"
            />
          </div>

          {/* Room Filter Buttons */}
          {rooms.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setSelectedRoom("")}
                className={`px-6 py-3 rounded-full font-medium transition ${
                  !selectedRoom
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All Rooms
              </button>
              {rooms.map((room) => (
                <button
                  key={room._id}
                  onClick={() => setSelectedRoom(room._id)}
                  className={`px-6 py-3 rounded-full font-medium transition ${
                    selectedRoom === room._id
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {room.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Articles Grid */}
        {filteredArticles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-600">
              {searchQuery || selectedRoom
                ? "No articles match your filters."
                : "No articles found"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article) => (
              <ArticleCard
                key={article._id || article.id}
                article={article}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}