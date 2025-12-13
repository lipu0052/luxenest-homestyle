// src/pages/AdminPage.tsx
import { useState, useEffect } from "react";
import {
  LogOut,
  Plus,
  Trash2,
  Download,
  BarChart3,
  Edit,
  Clock,
  User,
  FileText,
  ShoppingBag,
  Image as ImageIcon,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL   


import { Room, Article, Product, Analytics } from "../types";
import EditArticleModal from "../components/EditArticleModal";
import EditProductModal from "../components/EditProductModal";

type Tab = "rooms" | "articles" | "products" | "subscribers" | "analytics";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("articles");

  const [rooms, setRooms] = useState<Room[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<Analytics[]>([]);

  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated, activeTab]);

  const checkAuth = async () => {
    try {
      const res = await fetch(`${API}/api/admin/status`, { credentials: "include" });
      const data = await res.ok ? await res.json() : {};
      setIsAuthenticated(!!data.isAuthenticated);
    } catch (err) {
      console.error("Auth check failed", err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });
      if (res.ok) {
        setIsAuthenticated(true);
        setPassword("");
      } else {
        alert("Invalid credentials");
      }
    } catch {
      alert("Login failed");
    }
  };

  const handleLogout = async () => {
    await fetch(`${API}/api/admin/logout`, { method: "POST", credentials: "include" });
    setIsAuthenticated(false);
  };

  const fetchData = async () => {
    try {
      const endpoints: Record<Tab, string> = {
        rooms: `${API}/api/rooms`,
        articles: `${API}/api/articles`,
        products: `${API}/api/products`,
        subscribers: `${API}/api/admin/subscribers`,
        analytics: `${API}/api/admin/analytics`,
      };

      const res = await fetch(endpoints[activeTab], { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();

      switch (activeTab) {
        case "rooms":
          setRooms(Array.isArray(data) ? data : []);
          break;
        case "articles":
          setArticles(Array.isArray(data) ? data : data?.articles || []);
          break;
        case "products":
          setProducts(Array.isArray(data) ? data : []);
          break;
        case "subscribers":
          setSubscribers(Array.isArray(data) ? data : []);
          break;
        case "analytics":
          setAnalytics(Array.isArray(data) ? data : []);
          break;
      }
    } catch (err) {
      console.error("Fetch failed", err);
    }
  };

  const handleDelete = async (id: string, type: "rooms" | "articles" | "products") => {
    if (!confirm("Delete permanently? This cannot be undone.")) return;
    try {
      await fetch(`${API}/api/${type}/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      fetchData();
    } catch {
      alert("Delete failed");
    }
  };

  const handleExportCSV = async () => {
    try {
      const res = await fetch(`${API}/api/subscribers/export`, { credentials: "include" });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `luxenest-subscribers-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Export failed");
    }
  };

  const handleEditArticle = async (article: Article) => {
    try {
      const res = await fetch(`${API}/api/admin/articles/${article._id}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      const fullArticle = await res.json();
      setEditingArticle(fullArticle);
    } catch (error) {
      alert("Could not load full article data.");
    }
  };

  const handleCreateArticle = () => {
    setEditingArticle({
      _id: "",
      title: "",
      slug: "",
      excerpt: "",
      hero_image: "",
      main_content: "",
      content_sections: [],
      room_id: null,
      read_time: 10,
      key_takeaways: "",
      faq: "[]",
      author_name: "LuxeNest Editorial",
      author_title: "",
      author_bio: "",
      author_image: "",
      tags: [],
      related_topics: [],
    } as Article);
  };

  const handleCreateProduct = () => {
    setEditingProduct({
      _id: "",
      name: "",
      slug: "",
      price: 0,
      image: "",
      images: [],
      description: "",
      room_id: null,
      affiliate_link: "",
    } as Product);
  };

  const handleCreateRoom = () => {
    setEditingRoom({
      _id: "",
      name: "",
      slug: "",
      description: "",
      hero_image: "",
    } as Room);
  };

  // Helper: Get main image safely
  const getProductMainImage = (p: Product) => p.image || p.images?.[0] || "/placeholder.jpg";
  const getImageCount = (p: Product) => (p.images?.length || 0) + (p.image ? 1 : 0);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 w-full max-w-md">
          <h1 className="font-serif text-5xl font-bold text-center mb-10 text-gray-900">
            LuxeNest Admin
          </h1>
          <form onSubmit={handleLogin} className="space-y-8">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-6 py-5 border-2 border-gray-300 rounded-2xl text-lg focus:border-black focus:outline-none transition"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-5 border-2 border-gray-300 rounded-2xl text-lg focus:border-black focus:outline-none transition"
              required
            />
            <button
              type="submit"
              className="w-full bg-black text-white py-5 rounded-2xl font-bold text-xl hover:bg-gray-800 transition shadow-xl"
            >
              Login to Admin
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <h1 className="font-serif text-4xl font-bold text-gray-900">LuxeNest Admin</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-red-600 hover:text-red-700 font-semibold text-lg"
          >
            <LogOut className="w-6 h-6" /> Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Tabs */}
        <div className="flex gap-12 border-b-2 border-gray-200 mb-12">
          {(["rooms", "articles", "products", "subscribers", "analytics"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-1 capitalize font-semibold text-lg transition relative ${activeTab === tab
                ? "text-black after:absolute after:bottom-0 after:left-0 after:w-full after:h-1 after:bg-black after:rounded-full"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              {tab === "analytics" && <BarChart3 className="inline w-5 h-5 mr-2" />}
              {tab === "products" && <ShoppingBag className="inline w-5 h-5 mr-2" />}
              {tab === "articles" && <FileText className="inline w-5 h-5 mr-2" />}
              {tab === "rooms" && <ImageIcon className="inline w-5 h-5 mr-2" />}
              {tab}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-10">
          {/* Create Buttons */}
          {activeTab === "articles" && (
            <button
              onClick={handleCreateArticle}
              className="mb-10 flex items-center gap-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-10 py-5 rounded-2xl font-bold text-xl hover:shadow-2xl transition transform hover:-translate-y-1"
            >
              <Plus className="w-7 h-7" />
              Create New Article
            </button>
          )}

          {activeTab === "products" && (
            <button
              onClick={handleCreateProduct}
              className="mb-10 flex items-center gap-4 bg-black text-white px-10 py-5 rounded-2xl font-bold text-xl hover:bg-gray-900 transition transform hover:-translate-y-1 shadow-2xl"
            >
              <Plus className="w-7 h-7" />
              Add New Product
            </button>
          )}

          {activeTab === "rooms" && (
            <button
              onClick={handleCreateRoom}
              className="mb-10 flex items-center gap-4 bg-gray-900 text-white px-10 py-5 rounded-2xl font-bold text-xl hover:bg-black transition shadow-2xl"
            >
              <Plus className="w-7 h-7" />
              Create New Room
            </button>
          )}

          {activeTab === "subscribers" && (
            <button
              onClick={handleExportCSV}
              className="mb-10 flex items-center gap-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-10 py-5 rounded-2xl font-bold text-xl"
            >
              <Download className="w-7 h-7" /> Export CSV
            </button>
          )}

          {/* Analytics Cards */}
          {activeTab === "analytics" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="bg-gradient-to-br from-amber-50 to-orange-100 p-12 rounded-3xl text-center shadow-xl">
                <div className="text-7xl font-bold text-900">{products.length}</div>
                <div className="text-2xl font-semibold text-amber-700 mt-4">Products</div>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-teal-100 p-12 rounded-3xl text-center shadow-xl">
                <div className="text-7xl font-bold text-emerald-900">{articles.length}</div>
                <div className="text-2xl font-semibold text-emerald-700 mt-4">Articles</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-100 p-12 rounded-3xl text-center shadow-xl">
                <div className="text-7xl font-bold text-purple-900">{rooms.length}</div>
                <div className="text-2xl font-semibold text-purple-700 mt-4">Rooms</div>
              </div>
            </div>
          )}

          {/* PRODUCTS LIST — NOW WITH MULTI-IMAGE SUPPORT */}
          {activeTab === "products" && products.length > 0 && (
            <div className="space-y-6">
              {products.map((product) => {
                const mainImage = getProductMainImage(product);
                const imageCount = getImageCount(product);

                return (
                  <div
                    key={product._id}
                    className="flex items-center justify-between p-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-3xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
                  >
                    <div className="flex items-center gap-8">
                      <div className="relative">
                        <img
                          src={mainImage}
                          alt={product.name}
                          className="w-28 h-28 object-cover rounded-2xl border-4 border-white shadow-md"
                        />
                        {imageCount > 1 && (
                          <div className="absolute -top-3 -right-3 bg-black text-white text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1">
                            <ImageIcon className="w-4 h-4" />
                            {imageCount}
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{product.name}</h3>
                        <div className="flex items-center gap-6 mt-2">
                          <span className="text-3xl font-bold text-purple-600">
                            ${product.price.toFixed(2)}
                          </span>
                          {product.room_id && (
                            <span className="text-gray-600">
                              {rooms.find((r) => r._id === product.room_id)?.name || "No Room"}
                            </span>
                          )}
                          {product.affiliate_link && (
                            <span className="bg-emerald-100 text-emerald-700 px-4 py-1 rounded-full text-sm font-medium">
                              Affiliate
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="p-4 bg-white rounded-2xl shadow hover:shadow-lg transition"
                      >
                        <Edit className="w-6 h-6 text-gray-700" />
                      </button>
                      <button
                        onClick={() => handleDelete(product._id, "products")}
                        className="p-4 bg-white rounded-2xl shadow hover:shadow-lg transition"
                      >
                        <Trash2 className="w-6 h-6 text-red-600" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Articles Table */}
          {activeTab === "articles" && articles.length > 0 && (
            <div className="overflow-x-auto rounded-2xl border border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="text-left px-8 py-5 font-bold text-gray-900">Article</th>
                    <th className="text-left px-8 py-5 font-bold">Room</th>
                    <th className="text-center px-8 py-5 font-bold">Read Time</th>
                    <th className="text-center px-8 py-5 font-bold">Products</th>
                    <th className="text-left px-8 py-5 font-bold">Author</th>
                    <th className="text-right px-8 py-5 font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((article) => {
                    const productCount =
                      article.content_sections?.reduce(
                        (sum, sec) => sum + (sec.products?.length || 0),
                        0
                      ) || 0;

                    return (
                      <tr key={article._id} className="border-b hover:bg-gray-50 transition">
                        <td className="px-8 py-6 font-medium">
                          {article.title}
                          {article.main_content && (
                            <FileText className="inline w-5 h-5 ml-3 text-emerald-600" />
                          )}
                        </td>
                        <td className="px-8 py-6 text-gray-600">
                          {rooms.find((r) => r._id === article.room_id)?.name || "—"}
                        </td>
                        <td className="px-8 py-6 text-center">
                          {article.read_time ? `${article.read_time} min` : "—"}
                        </td>
                        <td className="px-8 py-6 text-center">
                          {productCount > 0 ? (
                            <span className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full font-medium">
                              {productCount} {productCount === 1 ? "product" : "products"}
                            </span>
                          ) : "—"}
                        </td>
                        <td className="px-8 py-6 text-gray-600">
                          {article.author_name || "LuxeNest"}
                        </td>
                        <td className="px-8 py-6 text-right space-x-4">
                          <button onClick={() => handleEditArticle(article)}>
                            <Edit className="w-6 h-6 text-gray-700 hover:text-black" />
                          </button>
                          <button onClick={() => handleDelete(article._id, "articles")}>
                            <Trash2 className="w-6 h-6 text-red-600 hover:text-red-700" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Rooms List */}
          {activeTab === "rooms" && rooms.length > 0 && (
            <div className="space-y-6">
              {rooms.map((room) => (
                <div
                  key={room._id}
                  className="flex justify-between items-center p-8 bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl shadow-lg hover:shadow-xl transition"
                >
                  <div>
                    <h3 className="text-2xl font-bold">{room.name}</h3>
                    <code className="text-gray-600 text-lg">/{room.slug}</code>
                  </div>
                  <div className="flex gap-6">
                    <button
                      onClick={() => setEditingRoom(room)}
                      className="p-4 bg-white rounded-2xl shadow hover:shadow-lg"
                    >
                      <Edit className="w-6 h-6 text-gray-700" />
                    </button>
                    <button
                      onClick={() => handleDelete(room._id, "rooms")}
                      className="p-4 bg-white rounded-2xl shadow hover:shadow-lg"
                    >
                      <Trash2 className="w-6 h-6 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Subscribers List */}
          {activeTab === "subscribers" && subscribers.length > 0 && (
            <div className="space-y-4">
              {subscribers.map((s: any) => (
                <div
                  key={s._id || s.email}
                  className="flex justify-between items-center p-6 bg-gray-50 rounded-2xl"
                >
                  <div className="font-medium text-lg">{s.email}</div>
                  <div className="text-gray-600">
                    {new Date(s.subscribed_at || s.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {editingArticle && (
        <EditArticleModal
          article={editingArticle}
          onClose={() => setEditingArticle(null)}
          onSave={() => {
            setEditingArticle(null);
            fetchData();
          }}
        />
      )}

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={() => {
            setEditingProduct(null);
            fetchData();
          }}
        />
      )}

      {/* Room Modal – unchanged but cleaned */}
      {editingRoom && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-3xl max-w-2xl w-full p-10">
            <h2 className="font-serif text-3xl font-bold text-gray-900 mb-8">
              {editingRoom._id ? "Edit Room" : "Create New Room"}
            </h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const payload = {
                  name: formData.get("name") as string,
                  slug: (formData.get("slug") as string)
                    .toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/[^a-z0-9-]/g, ""),
                  description: (formData.get("description") as string) || undefined,
                  hero_image: (formData.get("hero_image") as string) || undefined,
                };

                const url = editingRoom._id
                  ? `${API}/api/rooms/${editingRoom._id}`
                  : `${API}/api/rooms`;
                const method = editingRoom._id ? "PUT" : "POST";

                const res = await fetch(url, {
                  method,
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(payload),
                  credentials: "include",
                });

                if (res.ok) {
                  setEditingRoom(null);
                  fetchData();
                } else {
                  alert("Failed to save room");
                }
              }}
              className="space-y-6"
            >
              <input
                name="name"
                placeholder="Room Name"
                defaultValue={editingRoom.name}
                required
                className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl text-xl font-serif focus:border-gray-900 transition"
              />
              <input
                name="slug"
                placeholder="Slug (e.g. modern-living-room)"
                defaultValue={editingRoom.slug}
                required
                className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl font-mono focus:border-gray-900 transition"
              />
              <textarea
                name="description"
                placeholder="Description (optional)"
                defaultValue={editingRoom.description}
                rows={4}
                className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:border-gray-900 transition"
              />
              <input
                name="hero_image"
                type="url"
                placeholder="Hero Image URL"
                defaultValue={editingRoom.hero_image}
                className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:border-gray-900 transition"
              />

              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  className="flex-1 bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-black transition shadow-xl"
                >
                  {editingRoom._id ? "Update Room" : "Create Room"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingRoom(null)}
                  className="px-10 py-4 bg-gray-200 text-gray-800 rounded-xl font-bold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}