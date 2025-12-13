// src/components/EditArticleModal.tsx
import { useState, useEffect } from "react";
const API = import.meta.env.VITE_API_URL;
import {
    X,
    Plus,
    Trash2,
    Clock,
    Tag,
    Check,
    ShoppingBag,
} from "lucide-react";
import { Article, Room, Product, ProductInSection } from "../types";

interface FAQItem {
    question: string;
    answer: string;
}

interface ContentSectionForEdit {
    title: string;
    content: string;
    image?: string;
    quote?: string;
    products: ProductInSection[];
}

interface EditArticleModalProps {
    article: Article;
    onClose: () => void;
    onSave: () => void;
}

const TABS = [
    { id: "main", label: "Main Info" },
    { id: "content", label: "Content Sections" },
    { id: "seo", label: "SEO & FAQ" },
    { id: "author", label: "Author Info" },
] as const;

export default function EditArticleModal({
    article,
    onClose,
    onSave,
}: EditArticleModalProps) {
    const [saving, setSaving] = useState(false);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [currentTabIndex, setCurrentTabIndex] = useState(0);
    const [pickerForSection, setPickerForSection] = useState<number | null>(null);

    const activeTab = TABS[currentTabIndex].id;

    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        excerpt: "",
        hero_image: "",
        room_id: "",
        main_content: "",
        read_time: 10,
        key_takeaways: "",
        faq: [] as FAQItem[],
        author_name: "LuxeNest Editorial",
        author_title: "",
        author_bio: "",
        author_image: "",
        tags: "",
        related_topics: [] as string[],
    });

    const [contentSections, setContentSections] = useState<ContentSectionForEdit[]>([
        { title: "", content: "", image: "", quote: "", products: [] },
    ]);

    // Load rooms & all products once
    useEffect(() => {
        fetch(`${API}/api/rooms`)
            .then((r) => r.json())
            .then(setRooms)
            .catch(console.error);

        fetch(`${API}/api/products`)
            .then((r) => r.json())
            .then((data) => setAllProducts(Array.isArray(data) ? data : []))
            .catch(console.error);
    }, []);

    // Load article data into form
    useEffect(() => {
        if (!article) return;

        setFormData({
            title: article.title || "",
            slug: article.slug || "",
            excerpt: article.excerpt || "",
            hero_image: article.hero_image || "",
            room_id: article.room_id || "",
            main_content: article.main_content || "",
            read_time: article.read_time || 10,
            key_takeaways: article.key_takeaways || "",
            faq: article.faq
                ? typeof article.faq === "string"
                    ? JSON.parse(article.faq)
                    : article.faq
                : [],
            author_name: article.author_name || "LuxeNest Editorial",
            author_title: article.author_title || "",
            author_bio: article.author_bio || "",
            author_image: article.author_image || "",
            tags: Array.isArray(article.tags) ? article.tags.join(", ") : "",
            related_topics: article.related_topics || [],
        });

        // Handle content_sections – convert to ProductInSection[]
        if (article.content_sections && article.content_sections.length > 0) {
            setContentSections(
                article.content_sections.map((sec: any) => ({
                    title: sec.title || "",
                    content: sec.content || "",
                    image: sec.image || "",
                    quote: sec.quote || "",
                    products: (sec.products || []).map((p: any) => {
                        // If backend sent full object → use it
                        if (typeof p === "object" && p.product_id) {
                            return p as ProductInSection;
                        }
                        // Legacy: only ID string → create minimal object
                        if (typeof p === "string") {
                            return {
                                product_id: p,
                                name: "",
                                price: 0,
                                image: "",
                                affiliate_link: "",
                            };
                        }
                        return {
                            product_id: "",
                            name: "",
                            price: 0,
                            image: "",
                            affiliate_link: "",
                        };
                    }),
                }))
            );
        } else if (article.content) {
            setContentSections([
                { title: "Introduction", content: article.content || "", products: [] },
            ]);
        } else {
            setContentSections([{ title: "", content: "", products: [] }]);
        }
    }, [article]);

    const updateSection = (index: number, field: keyof ContentSectionForEdit, value: any) => {
        setContentSections((prev) => {
            const updated = [...prev];
            (updated[index] as any)[field] = value;
            return updated;
        });
    };

    const addSection = () => {
        setContentSections([
            ...contentSections,
            { title: "", content: "", image: "", quote: "", products: [] },
        ]);
    };

    const removeSection = (index: number) => {
        if (contentSections.length > 1) {
            setContentSections((prev) => prev.filter((_, i) => i !== index));
        }
    };

    // Add full ProductInSection object
    const addProductToSection = (sectionIndex: number, product: Product) => {
        setContentSections((prev) => {
            const updated = [...prev];
            if (!updated[sectionIndex].products) updated[sectionIndex].products = [];

            const productInSection: ProductInSection = {
                product_id: product._id,
                name: product.name,
                price: product.price,
                image: product.image || product.images?.[0] || "",
                affiliate_link: product.affiliate_link || "",
            };

            updated[sectionIndex].products.push(productInSection);
            return updated;
        });
        setPickerForSection(null);
    };

    const removeProductFromSection = (sectionIndex: number, prodIndex: number) => {
        setContentSections((prev) => {
            const updated = [...prev];
            updated[sectionIndex].products.splice(prodIndex, 1);
            return updated;
        });
    };

    const handleSave = async () => {
        if (!formData.slug.trim()) {
            alert("Slug is required!");
            setCurrentTabIndex(0);
            return;
        }

        setSaving(true);

        const payload = {
            ...formData,
            room_id: formData.room_id || null,
            content_sections: contentSections
                .filter((s) => s.title.trim() || s.content.trim())
                .map((sec) => ({
                    title: sec.title,
                    content: sec.content,
                    image: sec.image || undefined,
                    quote: sec.quote || undefined,
                    products: sec.products, // already ProductInSection[]
                })),
            faq: formData.faq.length > 0 ? JSON.stringify(formData.faq) : null,
            tags: formData.tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean),
            related_topics: formData.related_topics,
        };

        try {
            const method = article._id ? "PUT" : "POST";
            const url = article._id
                ? `${API}/api/articles/${article._id}`
                : `${API}/api/articles`;

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                credentials: "include",
            });

            if (res.ok) {
                onSave();
            } else {
                const text = await res.text();
                console.error("Save failed:", res.status, text);
                alert("Failed to save article:\n" + (text || "Unknown error"));
            }
        } catch (err) {
            console.error("Network error:", err);
            alert("Network error – check console");
        } finally {
            setSaving(false);
        }
    };

    const next = () => {
        if (currentTabIndex === 0 && !formData.slug.trim()) {
            alert("Please enter a slug before continuing. It's required for the article URL.");
            return;
        }
        setCurrentTabIndex((i) => Math.min(i + 1, TABS.length - 1));
    };

    const prev = () => setCurrentTabIndex((i) => Math.max(i - 1, 0));

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-3xl max-w-7xl w-full my-8 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b px-8 py-6 flex justify-between items-center z-10">
                    <div>
                        <h2 className="text-3xl font-serif font-bold text-gray-900">
                            {article._id ? "Edit" : "Create"} Article
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Step {currentTabIndex + 1} of {TABS.length}:{" "}
                            <span className="font-medium">{TABS[currentTabIndex].label}</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-gray-100 rounded-full transition group"
                    >
                        <X className="w-6 h-6 group-hover:text-red-600 transition" />
                    </button>
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (currentTabIndex === 3) handleSave();
                    }}
                    className="p-8 space-y-12"
                >
                    {/* MAIN INFO TAB */}
                    {activeTab === "main" && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Room (Optional)</label>
                                    <select
                                        value={formData.room_id}
                                        onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
                                        className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-gray-900/20"
                                    >
                                        <option value="">No Room</option>
                                        {rooms.map((room) => (
                                            <option key={room._id} value={room._id}>
                                                {room.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Hero Image URL</label>
                                    <input
                                        type="url"
                                        value={formData.hero_image}
                                        onChange={(e) => setFormData({ ...formData, hero_image: e.target.value })}
                                        placeholder="https://..."
                                        className="w-full px-5 py-3 border border-gray-300 rounded-xl"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">Title</label>
                                <input
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-6 py-4 border border-gray-300 rounded-xl text-3xl font-serif font-bold focus:ring-4 focus:ring-gray-900/20"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">
                                    Slug <span className="text-red-600">*</span>
                                </label>
                                <input
                                    required
                                    value={formData.slug}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            slug: e.target.value
                                                .toLowerCase()
                                                .replace(/\s+/g, "-")
                                                .replace(/[^a-z0-9-]/g, ""),
                                        })
                                    }
                                    placeholder="e.g. modern-living-room-ideas"
                                    className={`w-full px-6 py-4 border-2 rounded-xl font-mono text-lg transition-all
                                        ${formData.slug.trim() ? "border-gray-300 focus:border-gray-900" : "border-red-500 focus:border-red-600"}
                                    `}
                                />
                                {!formData.slug.trim() && (
                                    <p className="mt-2 text-red-600 text-sm font-medium flex items-center gap-2">
                                        <X className="w-4 h-4" />
                                        Slug is required – it will be used in the URL
                                    </p>
                                )}
                                {formData.slug.trim() && (
                                    <p className="mt-2 text-gray-500 text-sm">
                                        URL preview: /blog/<span className="font-mono text-black">{formData.slug}</span>
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">Excerpt</label>
                                <textarea
                                    rows={3}
                                    value={formData.excerpt}
                                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                    className="w-full px-5 py-3 border border-gray-300 rounded-xl"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">
                                    Main Long-Form Content (After Hero)
                                </label>
                                <textarea
                                    rows={12}
                                    value={formData.main_content}
                                    onChange={(e) => setFormData({ ...formData, main_content: e.target.value })}
                                    placeholder="Write your in-depth introduction...&#10;&#10;Pro tip:&#10;• Start bullet lines with • and press Enter after each&#10;• Leave an empty line for a new paragraph"
                                    className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl font-serif text-lg leading-relaxed focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 transition-all resize-y"
                                />
                            </div>
                        </>
                    )}

                    {/* CONTENT SECTIONS TAB */}
                    {activeTab === "content" && (
                        <div>
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-3xl font-bold">Content Sections</h3>
                                <button
                                    type="button"
                                    onClick={addSection}
                                    className="flex items-center gap-3 px-8 py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-900 transition"
                                >
                                    <Plus className="w-6 h-6" /> Add Section
                                </button>
                            </div>

                            {contentSections.map((section, idx) => (
                                <div
                                    key={idx}
                                    className="mb-16 p-10 border-2 border-dashed border-gray-300 rounded-2xl bg-gradient-to-br from-gray-50 to-white shadow-lg"
                                >
                                    <div className="flex justify-between items-center mb-8">
                                        <h4 className="text-2xl font-bold flex items-center gap-4">
                                            <span className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-bold">
                                                {idx + 1}
                                            </span>
                                            Section {idx + 1}
                                        </h4>
                                        {contentSections.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeSection(idx)}
                                                className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition"
                                            >
                                                <Trash2 className="w-6 h-6" />
                                            </button>
                                        )}
                                    </div>

                                    <input
                                        placeholder="Section Title"
                                        value={section.title}
                                        onChange={(e) => updateSection(idx, "title", e.target.value)}
                                        className="w-full text-3xl font-serif font-bold mb-6 px-6 py-4 border border-gray-300 rounded-xl"
                                    />

                                    <textarea
                                        rows={12}
                                        placeholder="Write detailed content...&#10;&#10;• Start lines with • for automatic bullet lists"
                                        value={section.content}
                                        onChange={(e) => updateSection(idx, "content", e.target.value)}
                                        className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl font-serif text-lg leading-relaxed mb-6 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 transition-all resize-y"
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                                        <input
                                            placeholder="Image URL (optional)"
                                            value={section.image || ""}
                                            onChange={(e) => updateSection(idx, "image", e.target.value)}
                                            className="px-6 py-4 border border-gray-300 rounded-xl"
                                        />
                                        <input
                                            placeholder="Pull quote (optional)"
                                            value={section.quote || ""}
                                            onChange={(e) => updateSection(idx, "quote", e.target.value)}
                                            className="px-6 py-4 border-dashed border-gray-400 rounded-xl italic text-gray-700"
                                        />
                                    </div>

                                    {/* SHOP THE LOOK */}
                                    <div className="border-t pt-8">
                                        <div className="flex justify-between items-center mb-8">
                                            <h5 className="text-2xl font-bold flex items-center gap-3">
                                                <ShoppingBag className="w-7 h-7 text-green-600" />
                                                Shop the Look ({section.products.length})
                                            </h5>
                                            <button
                                                type="button"
                                                onClick={() => setPickerForSection(idx)}
                                                className="px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition flex items-center gap-3"
                                            >
                                                <Plus className="w-5 h-5" /> Add Product
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                                            {section.products.map((productInSec, i) => {
                                                const prod = allProducts.find((p) => p._id === productInSec.product_id);
                                                if (!prod) return null;

                                                return (
                                                    <div
                                                        key={i}
                                                        className="relative group border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-black transition-all duration-300 shadow-md hover:shadow-xl"
                                                    >
                                                        <img
                                                            src={prod.image || prod.images?.[0] || "/placeholder.jpg"}
                                                            alt={prod.name}
                                                            className="w-full h-64 object-cover"
                                                        />
                                                        <div className="p-5 bg-white">
                                                            <p className="font-medium text-sm line-clamp-2 mb-2">{prod.name}</p>
                                                            <p className="text-2xl font-bold text-green-600">${prod.price}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => removeProductFromSection(idx, i)}
                                                            className="absolute top-4 right-4 p-2 bg-black/70 text-white rounded-lg opacity-0 group-hover:opacity-100 transition"
                                                        >
                                                            <X className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {section.products.length === 0 && (
                                            <div className="text-center py-16 text-gray-500 italic text-lg border-2 border-dashed border-gray-300 rounded-2xl">
                                                No products yet — click "Add Product" to shop the look
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* SEO & FAQ TAB */}
                    {activeTab === "seo" && (
                        <div className="space-y-10">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold mb-2">
                                    <Clock className="w-5 h-5" /> Read Time (minutes)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="60"
                                    value={formData.read_time}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            read_time: Number(e.target.value) || 10,
                                        })
                                    }
                                    className="w-full max-w-xs px-5 py-3 border border-gray-300 rounded-xl"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">
                                    Key Takeaways (one per line)
                                </label>
                                <textarea
                                    rows={8}
                                    value={formData.key_takeaways}
                                    onChange={(e) =>
                                        setFormData({ ...formData, key_takeaways: e.target.value })
                                    }
                                    placeholder="Natural light improves mood||Plants purify air||..."
                                    className="w-full px-5 py-3 border border-gray-300 rounded-xl font-medium"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold">FAQ</h3>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setFormData({
                                                ...formData,
                                                faq: [...formData.faq, { question: "", answer: "" }],
                                            })
                                        }
                                        className="flex items-center gap-2 text-gray-900 font-medium"
                                    >
                                        <Plus className="w-5 h-5" /> Add Question
                                    </button>
                                </div>

                                {formData.faq.map((item, i) => (
                                    <div key={`faq-${i}`} className="mb-6 p-6 border border-gray-200 rounded-xl bg-gray-50">
                                        <input
                                            placeholder="Question"
                                            value={item.question}
                                            onChange={(e) => {
                                                const updated = [...formData.faq];
                                                updated[i].question = e.target.value;
                                                setFormData({ ...formData, faq: updated });
                                            }}
                                            className="w-full mb-3 px-5 py-3 border border-gray-300 rounded-xl font-medium text-lg"
                                        />
                                        <textarea
                                            rows={3}
                                            placeholder="Answer..."
                                            value={item.answer}
                                            onChange={(e) => {
                                                const updated = [...formData.faq];
                                                updated[i].answer = e.target.value;
                                                setFormData({ ...formData, faq: updated });
                                            }}
                                            className="w-full px-5 py-3 border border-gray-300 rounded-xl"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setFormData({
                                                    ...formData,
                                                    faq: formData.faq.filter((_, idx) => idx !== i),
                                                })
                                            }
                                            className="mt-3 text-red-600 text-sm font-medium"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold mb-2">
                                    <Tag className="w-5 h-5" /> Tags (comma separated)
                                </label>
                                <input
                                    value={formData.tags}
                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                    placeholder="minimalism, lighting, plants"
                                    className="w-full px-5 py-3 border border-gray-300 rounded-xl"
                                />
                            </div>

                            <div className="mt-8">
                                <label className="flex items-center gap-2 text-sm font-semibold mb-2">
                                    Related Topics (comma-separated slugs)
                                </label>
                                <input
                                    value={formData.related_topics.join(", ")}
                                    onChange={(e) => {
                                        const values = e.target.value
                                            .split(",")
                                            .map((s) => s.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""))
                                            .filter(Boolean);
                                        setFormData({ ...formData, related_topics: values });
                                    }}
                                    placeholder="modern-living-room, scandinavian-style, boho-decor"
                                    className="w-full px-5 py-3 border border-gray-300 rounded-xl font-mono text-sm"
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    These will appear as cards in the "Related Topics" section.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* AUTHOR TAB */}
                    {activeTab === "author" && (
                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-sm font-semibold mb-2">Author Name</label>
                                <input
                                    value={formData.author_name}
                                    onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                                    className="w-full px-5 py-3 border border-gray-300 rounded-xl"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">Author Title</label>
                                <input
                                    value={formData.author_title}
                                    onChange={(e) => setFormData({ ...formData, author_title: e.target.value })}
                                    placeholder="e.g. Senior Interior Designer"
                                    className="w-full px-5 py-3 border border-gray-300 rounded-xl"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold mb-2">Author Image URL</label>
                                <input
                                    value={formData.author_image}
                                    onChange={(e) => setFormData({ ...formData, author_image: e.target.value })}
                                    className="w-full px-5 py-3 border border-gray-300 rounded-xl"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold mb-2">Author Bio</label>
                                <textarea
                                    rows={6}
                                    value={formData.author_bio}
                                    onChange={(e) => setFormData({ ...formData, author_bio: e.target.value })}
                                    placeholder="Short bio..."
                                    className="w-full px-5 py-3 border border-gray-300 rounded-xl"
                                />
                            </div>
                        </div>
                    )}

                    {/* NAVIGATION */}
                    <div className="flex gap-6 pt-12 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={prev}
                            disabled={currentTabIndex === 0}
                            className="px-10 py-5 bg-gray-200 rounded-xl font-bold disabled:opacity-50"
                        >
                            ← Previous
                        </button>

                        {currentTabIndex < 3 ? (
                            <button
                                type="button"
                                onClick={next}
                                className="flex-1 bg-black text-white py-5 rounded-xl font-bold text-lg"
                            >
                                Next →
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-12 py-5 bg-gray-200 rounded-xl font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white py-5 rounded-xl font-bold text-lg shadow-xl flex items-center justify-center gap-4 hover:from-emerald-700 hover:to-green-700 transition"
                                >
                                    {saving ? "Saving..." : <>Save & Publish <Check className="w-7 h-7" /></>}
                                </button>
                            </>
                        )}
                    </div>
                </form>
            </div>

            {/* PRODUCT PICKER MODAL */}
            {pickerForSection !== null && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-3xl max-w-6xl w-full max-h-[85vh] overflow-y-auto p-10">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-3xl font-bold">
                                Add Product to Section {pickerForSection + 1}
                            </h3>
                            <button
                                onClick={() => setPickerForSection(null)}
                                className="p-3 hover:bg-gray-100 rounded-full"
                            >
                                <X className="w-8 h-8" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
                            {allProducts.map((prod) => (
                                <button
                                    key={prod._id}
                                    type="button"
                                    onClick={() => addProductToSection(pickerForSection!, prod)}
                                    className="group text-left rounded-xl overflow-hidden border-2 border-transparent hover:border-black transition-all hover:shadow-2xl"
                                >
                                    <div className="aspect-square bg-gray-100 overflow-hidden">
                                        <img
                                            src={prod.image || prod.images?.[0] || "/placeholder.jpg"}
                                            alt={prod.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition"
                                        />
                                    </div>
                                    <div className="p-5 bg-white">
                                        <p className="font-medium line-clamp-2 text-sm">{prod.name}</p>
                                        <p className="text-2xl font-bold text-green-600 mt-2">${prod.price}</p>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="mt-12 text-center">
                            <button
                                onClick={() => setPickerForSection(null)}
                                className="px-12 py-4 bg-gray-200 rounded-xl font-bold hover:bg-gray-300 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}