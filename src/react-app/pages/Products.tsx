// src/pages/ProductsPage.tsx
import { useEffect, useState } from "react";
import Layout from "@/react-app/components/Layout";
import ProductCard from "@/react-app/components/ProductCard";
import { Product } from "@/types";

const API = import.meta.env.VITE_API_URL;

interface Room {
  _id: string;
  name: string;
  slug: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    const fetchData = async () => {
      try {
        const [productsRes, roomsRes] = await Promise.all([
          fetch(`${API}/api/products`),
          fetch(`${API}/api/rooms`),
        ]);

        const productsData = await productsRes.json();
        const roomsData = await roomsRes.json();

        // Handle both direct array and wrapped response
        const productList = Array.isArray(productsData) ? productsData : [];
        const roomList = Array.isArray(roomsData) ? roomsData : [];

        setProducts(productList);
        setRooms(roomList);
        setFilteredProducts(productList); // initial
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter logic
  useEffect(() => {
    let filtered = [...products];

    // Filter by room
    if (selectedRoom) {
      filtered = filtered.filter((p) => p.room_id === selectedRoom);
    }

    // Search by name or description
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    setFilteredProducts(filtered);
  }, [products, selectedRoom, searchQuery]);

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
            All Products
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our carefully selected collection of premium home decor and furniture
          </p>
        </div>

        {/* Filters */}
        <div className="mb-12 space-y-8">
          {/* Search */}
          <div className="max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Search products..."
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

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-600">
              {searchQuery || selectedRoom
                ? "No products match your filters."
                : "No products found"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}