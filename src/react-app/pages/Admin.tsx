// src/react-app/pages/Admin.tsx
import { useEffect, useState } from "react";
const API = import.meta.env.VITE_API_URL;
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
} from "lucide-react";
import { Room, Article, Product, Analytics } from "@/types";
import EditArticleModal from "@/react-app/components/EditArticleModal";
import EditProductModal from "@/react-app/components/EditProductModal";

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, activeTab]);

  // -------------------------
  // Auth
  // -------------------------
  const checkAuth = async () => {
    try {
      const res = await fetch(`${API}/api/admin/status`, {
        credentials: "include",
      });
      if (!res.ok) {
        setIsAuthenticated(false);
        return;
      }
      const data = await res.json();
      setIsAuthenticated(Boolean(data.isAuthenticated));
    } catch (err) {
      console.error("Auth check failed", err);
      setIsAuthenticated(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // <-- CRITICAL
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        // server should set cookie; confirm auth status
        await checkAuth();
        setPassword("");
      } else {
        const text = await res.text();
        console.warn("Login failed:", res.status, text);
        alert("Invalid credentials");
      }
    } catch (err) {
      console.error("Login error", err);
      alert("Login failed");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API}/api/admin/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      setIsAuthenticated(false);
    }
  };

  // -------------------------
  // Fetch Data
  // -------------------------
  const fetchData = async () => {
    try {
      const endpoints: Record<Tab, string> = {
        rooms: `${API}/api/rooms`,
        articles: `${API}/api/articles`,
        products: `${API}/api/products`,
        subscribers: `${API}/api/admin/subscribers`,
        analytics: `${API}/api/admin/analytics`,
      };

      const res = await fetch(endpoints[activeTab], {
        credentials: "include",
      });
      if (!res.ok) {
        console.error("Fetch data failed", activeTab, res.status);
        // clear lists gracefully
        setRooms([]);
        setArticles([]);
        setProducts([]);
        setSubscribers([]);
        setAnalytics([]);
        return;
      }
      const data = await res.json();

      switch (activeTab) {
        case "rooms":
          setRooms(Array.isArray(data) ? data : data?.rooms || []);
          break;
        case "articles":
          // API might return { articles: [...] } or an array
          setArticles(Array.isArray(data) ? data : data?.articles || []);
          break;
        case "products":
          setProducts(Array.isArray(data) ? data : data?.products || []);
          break;
        case "subscribers":
          setSubscribers(Array.isArray(data) ? data : data?.subscribers || []);
          break;
        case "analytics":
          setAnalytics(Array.isArray(data) ? data : data?.analytics || []);
          break;
      }
    } catch (err) {
      console.error("Fetch failed", err);
    }
  };

  // -------------------------
  // Delete (rooms/articles/products)
  // -------------------------
  const handleDelete = async (
    id: string,
    type: "rooms" | "articles" | "products"
  ) => {
    if (!confirm("Delete permanently?")) return;
    try {
      const res = await fetch(`${API}/api/${type}/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Delete failed");
      await fetchData();
    } catch (err) {
      console.error("Delete failed", err);
      alert("Delete failed");
    }
  };

  // -------------------------
  // Export Subscribers CSV
  // -------------------------
  const handleExportCSV = async () => {
    try {
      const res = await fetch(`${API}/api/subscribers/export`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "subscribers.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed", err);
      alert("Export failed");
    }
  };

  // -------------------------
  // Edit Article (fetch full)
  // -------------------------
  const handleEditArticle = async (article: Article) => {
    // open modal fast with available data
    setEditingArticle(article);

    // fetch full article by id (server should accept /articles/:id)
    try {
      const res = await fetch(`${API}/api/articles/${article._id}`, {
        credentials: "include",
      });
      if (!res.ok) {
        const t = await res.text();
        console.error("API Error fetching full article:", res.status, t);
        throw new Error("Failed to fetch article details");
      }
      const fullArticle: Article = await res.json();
      setEditingArticle(fullArticle);
    } catch (err) {
      console.error("Error loading full article details:", err);
      alert("Could not load full article details. See console for more.");
      setEditingArticle(null);
    }
  };

  // -------------------------
  // Create placeholders
  // -------------------------
  const handleCreateArticle = () => {
    setEditingArticle({
      _id: "",
      title: "",
      slug: "",
      excerpt: "",
      hero_image: "",
      main_content: "",
      content: "",
      room_id: null,
      read_time: 10,
      key_takeaways: "",
      faq: "",
      author_name: "LuxeNest Editorial",
      author_title: "",
      author_bio: "",
      author_image: "",
      tags: [],
    } as Article);
  };

  const handleCreateProduct = () => {
    setEditingProduct({
      _id: "",
      name: "",
      slug: "",
      price: 0,
      description: "",
      image: "",
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

  // -------------------------
  // Render: Login UI
  // -------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md">
          <h1 className="font-serif text-4xl font-bold text-center mb-8 text-gray-900">
            LuxeNest Admin
          </h1>
          <form onSubmit={handleLogin} className="space-y-6">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:border-gray-900 transition"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:border-gray-900 transition"
              required
            />
            <button
              type="submit"
              className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-black transition shadow-lg"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  // -------------------------
  // Render: Admin Panel
  // -------------------------
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <h1 className="font-serif text-3xl font-bold text-gray-900">
            LuxeNest Admin
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-red-600 hover:text-red-700 font-medium"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex gap-10 border-b border-gray-300 mb-10">
          {(["rooms", "articles", "products", "subscribers", "analytics"] as const).map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-2 capitalize font-medium transition relative ${
                  activeTab === tab
                    ? "text-gray-900 after:absolute after:bottom-0 after:left-0 after:w-full after:h-1 after:bg-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab === "analytics" && (
                  <BarChart3 className="inline w-5 h-5 mr-2" />
                )}
                {tab}
              </button>
            )
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Add Buttons */}
          {(activeTab === "articles" ||
            activeTab === "products" ||
            activeTab === "rooms") && (
            <button
              onClick={() => {
                if (activeTab === "articles") handleCreateArticle();
                if (activeTab === "products") handleCreateProduct();
                if (activeTab === "rooms") handleCreateRoom();
              }}
              className="mb-8 flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-black transition shadow-xl"
            >
              <Plus className="w-6 h-6" />
              Create New{" "}
              {activeTab === "articles"
                ? "Article"
                : activeTab === "products"
                ? "Product"
                : "Room"}
            </button>
          )}

          {activeTab === "subscribers" && (
            <button
              onClick={handleExportCSV}
              className="mb-8 flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-xl font-bold"
            >
              <Download className="w-6 h-6" /> Export Subscribers CSV
            </button>
          )}

          {/* Analytics */}
          {activeTab === "analytics" && (
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl text-center">
                  <div className="text-5xl font-bold text-blue-900">
                    {rooms.length}
                  </div>
                  <div className="text-blue-700 font-medium mt-2">Rooms</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl text-center">
                  <div className="text-5xl font-bold text-green-900">
                    {articles.length}
                  </div>
                  <div className="text-green-700 font-medium mt-2">Articles</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl text-center">
                  <div className="text-5xl font-bold text-purple-900">
                    {products.length}
                  </div>
                  <div className="text-purple-700 font-medium mt-2">Products</div>
                </div>
              </div>
            </div>
          )}

          {/* Articles Table */}
          {activeTab === "articles" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-bold">Title</th>
                    <th className="px-6 py-4">Room</th>
                    <th className="px-6 py-4 text-center">Read Time</th>
                    <th className="px-6 py-4">Author</th>
                    <th className="px-6 py-4">Tags</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((article) => (
                    <tr
                      key={article._id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-5 font-medium max-w-md">
                        {article.title}
                        {article.main_content && (
                          <FileText className="inline w-4 h-4 ml-2 text-green-600" />
                        )}
                      </td>
                      <td className="px-6 py-5 text-gray-600">
                        {rooms.find((r) => r._id === article.room_id)?.name ||
                          "—"}
                      </td>
                      <td className="px-6 py-5 text-center">
                        {article.read_time ? (
                          <span className="flex items-center justify-center gap-1">
                            <Clock className="w-4 h-4" /> {article.read_time} min
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          {article.author_name || "LuxeNest"}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {article.tags && article.tags.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {article.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-6 py-5 text-right space-x-4">
                        <button onClick={() => handleEditArticle(article)}>
                          <Edit className="w-5 h-5 text-gray-700 hover:text-gray-900" />
                        </button>
                        <button onClick={() => handleDelete(article._id, "articles")}>
                          <Trash2 className="w-5 h-5 text-red-600 hover:text-red-700" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Rooms & Products Lists */}
          {["rooms", "products"].includes(activeTab) && (
            <div className="space-y-4">
              {activeTab === "rooms" &&
                rooms.map((room) => (
                  <div
                    key={room._id}
                    className="flex justify-between items-center p-6 bg-gray-50 rounded-xl"
                  >
                    <div>
                      <h4 className="font-bold text-lg">{room.name}</h4>
                      <code className="text-sm text-gray-600">/{room.slug}</code>
                    </div>
                    <div className="flex gap-4">
                      <button onClick={() => setEditingRoom(room)}>
                        <Edit className="w-5 h-5 text-gray-700" />
                      </button>
                      <button onClick={() => handleDelete(room._id, "rooms")}>
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}

              {activeTab === "products" &&
                products.map((p) => (
                  <div
                    key={p._id}
                    className="flex justify-between items-center p-6 bg-gray-50 rounded-xl"
                  >
                    <div>
                      <h4 className="font-bold">{p.name}</h4>
                      <p className="text-sm text-gray-600">
                        ${Number(p.price).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <button onClick={() => setEditingProduct(p)}>
                        <Edit className="w-5 h-5 text-gray-700" />
                      </button>
                      <button onClick={() => handleDelete(p._id, "products")}>
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Subscribers */}
          {activeTab === "subscribers" &&
            subscribers.map((s: any) => (
              <div
                key={s._id}
                className="flex justify-between items-center p-6 bg-gray-50 rounded-xl"
              >
                <div>{s.email}</div>
                <div className="text-sm text-gray-600">
                  {new Date(s.subscribed_at || s.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Modals */}
      {editingArticle && (
        <EditArticleModal
          key={editingArticle._id || "new"}
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

      {/* Inline Room Modal */}
      {editingRoom && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-3xl max-w-2xl w-full p-10">
            <h2 className="font-serif text-3xl font-bold text-gray-900 mb-8">
              {editingRoom._id ? "Edit Room" : "Create New Room"}
            </h2>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget as HTMLFormElement);
                const payload: any = {
                  name: String(formData.get("name") || ""),
                  slug: String(formData.get("slug") || "")
                    .toLowerCase()
                    .replace(/\s+/g, "-"),
                  description: String(formData.get("description") || "") || undefined,
                  hero_image: String(formData.get("hero_image") || "") || undefined,
                };

                const url = editingRoom._id
                  ? `${API}/api/rooms/${editingRoom._id}`
                  : `${API}/api/rooms`;
                const method = editingRoom._id ? "PUT" : "POST";

                try {
                  const res = await fetch(url, {
                    method,
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                  });
                  if (!res.ok) {
                    const text = await res.text();
                    console.error("Save room failed", res.status, text);
                    throw new Error("Failed to save room");
                  }
                  setEditingRoom(null);
                  await fetchData();
                } catch (err) {
                  console.error("Failed to save room", err);
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
