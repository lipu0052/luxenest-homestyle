import { useState, useEffect } from "react";
const API = import.meta.env.VITE_API_URL;
import {
    X,
    Plus,
    Trash2,
    Clock,
    Tag,
    ChevronRight,
    ChevronLeft,
    Check,
} from "lucide-react";
import { Article, Room } from "@/types";

interface FAQItem {
    question: string;
    answer: string;
}

interface ContentPoint {
    title: string;
    content: string;
    image?: string;
    quote?: string;
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
    const [currentTabIndex, setCurrentTabIndex] = useState(0);
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
        related_topics: [] as string[],   // ADD THIS LINE
    });

    const [contentPoints, setContentPoints] = useState<ContentPoint[]>([
        { title: "", content: "", image: "", quote: "" },
    ]);

    // 🚀 FIX APPLIED HERE: The dependency array is now [article]
    useEffect(() => {
        if (!article) return;

        console.log("Article received in modal:", article);

        // Safely parse FAQ
        let parsedFAQ: FAQItem[] = [];
        if (article.faq) {
            try {
                parsedFAQ = typeof article.faq === "string" ? JSON.parse(article.faq) : article.faq;
            } catch (err) {
                console.error("Failed to parse FAQ:", err);
                parsedFAQ = [];
            }
        }

        // Safely parse content sections
        let parsedPoints: ContentPoint[] = [{ title: "", content: "", image: "", quote: "" }];
        if (article.content && typeof article.content === "string" && article.content.trim()) {
            try {
                console.log("Raw content:", article.content);
                parsedPoints = parseContentIntoPoints(article.content);
                console.log("Parsed points:", parsedPoints);
            } catch (err) {
                console.error("Failed to parse content:", err);
                parsedPoints = [{ title: "Error parsing content", content: article.content }];
            }
        } else if (article.content === null) {
            // If content is explicitly null (deleted or empty), reset points.
            parsedPoints = [{ title: "", content: "", image: "", quote: "" }];
        }
        setFormData({
            title: article.title || "",
            slug: article.slug || "",
            excerpt: article.excerpt || "",
            hero_image: article.hero_image || "",
            room_id: article.room_id || "",
            main_content: article.main_content || "",
            read_time: article.read_time || 10,
            key_takeaways: article.key_takeaways || "",
            faq: parsedFAQ.length > 0 ? parsedFAQ : [],
            author_name: article.author_name || "LuxeNest Editorial",
            author_title: article.author_title || "",
            author_bio: article.author_bio || "",
            author_image: article.author_image || "",
            tags: Array.isArray(article.tags) ? article.tags.join(", ") : "",
            related_topics: Array.isArray(article.related_topics)
                ? article.related_topics
                : [],   // ADD THIS — fixes TypeScript error
        });

        setContentPoints(parsedPoints);
    }, [article]); // 🎯 FIX: Dependence on [article] object ensures re-sync when full data arrives

    useEffect(() => {
        fetch(`${API}/api/rooms`)
            .then((r) => r.json())
            .then(setRooms)
            .catch(console.error);
    }, []);

    const buildContentString = () => {
        return contentPoints
            .filter((p) => p.title.trim())
            .map((p, i) => {
                let str = `${i + 1}. ${p.title}\n${p.content || ""}`;
                if (p.image) str += `\n[IMAGE:${p.image.trim()}]`;
                if (p.quote) str += `\n> ${p.quote.trim()}`;
                return str;
            })
            .join("\n\n");
    };

    const handleFinalSave = async () => {
        setSaving(true);
        const payload = {
            ...formData,
            room_id: formData.room_id || null,
            content: buildContentString() || null,
            faq: formData.faq.length > 0 ? JSON.stringify(formData.faq) : null,
            tags: formData.tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean),
            related_topics: formData.related_topics,   // ADD THIS LINE ONLY
        };

        try {
            const isEdit = article._id && article._id.trim() !== "";
            const method = isEdit ? "PUT" : "POST";
            const url = isEdit ? `${API}/api/articles/${article._id}` : `${API}/api/articles`;

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                credentials: "include",   // ← THIS IS THE FIX
            });

            if (res.ok) {
                onSave();
            } else {
                const text = await res.text();
                alert("Failed to save: " + text);
            }
        } catch (err) {
            console.error(err);
            alert("Network error");
        } finally {
            setSaving(false);
        }
    };

    const goNext = () => {
        if (currentTabIndex < TABS.length - 1) {
            setCurrentTabIndex(currentTabIndex + 1);
        }
    };

    const goPrev = () => {
        if (currentTabIndex > 0) {
            setCurrentTabIndex(currentTabIndex - 1);
        }
    };

    const isLastTab = currentTabIndex === TABS.length - 1;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-3xl max-w-7xl w-full my-8 max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between z-10">
                    <div>
                        <h2 className="font-serif text-3xl font-bold text-gray-900">
                            {article._id ? "Edit Article" : "Create New Article"}
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

                <div className="border-b border-gray-200 px-8 py-6">
                    <div className="flex items-center justify-between max-w-4xl mx-auto">
                        {TABS.map((tab, idx) => (
                            <div key={tab.id} className="flex items-center flex-1">
                                <div className="flex items-center gap-4 flex-1">
                                    <div
                                        className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm transition-all ${idx < currentTabIndex
                                            ? "bg-green-500 text-white"
                                            : idx === currentTabIndex
                                                ? "bg-gray-900 text-white ring-4 ring-gray-900/20"
                                                : "bg-gray-200 text-gray-500"
                                            }`}
                                    >
                                        {idx < currentTabIndex ? (
                                            <Check className="w-6 h-6" />
                                        ) : (
                                            idx + 1
                                        )}
                                    </div>
                                    <span
                                        className={`hidden lg:block text-sm font-medium ${idx <= currentTabIndex ? "text-gray-900" : "text-gray-500"
                                            }`}
                                    >
                                        {tab.label}
                                    </span>
                                </div>
                                {idx < TABS.length - 1 && (
                                    <div
                                        className={`flex-1 h-1 mx-4 transition-all ${idx < currentTabIndex ? "bg-green-500" : "bg-gray-300"
                                            }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (isLastTab) handleFinalSave();
                    }}
                    className="p-8 space-y-10"
                >
                    {/* MAIN TAB */}
                    {activeTab === "main" && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Room (Optional)</label>
                                    <select
                                        value={formData.room_id}
                                        onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
                                        className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-gray-900/20 focus:border-gray-900 transition"
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
                                        className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-gray-900/20 focus:border-gray-900 transition"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">Title</label>
                                <input
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-5 py-3 border border-gray-300 rounded-xl text-2xl font-serif focus:ring-4 focus:ring-gray-900/20 focus:border-gray-900 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">Slug</label>
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
                                    className="w-full px-5 py-3 border border-gray-300 rounded-xl font-mono focus:ring-4 focus:ring-gray-900/20 focus:border-gray-900 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">Excerpt</label>
                                <textarea
                                    rows={3}
                                    value={formData.excerpt}
                                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                    className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-gray-900/20 focus:border-gray-900 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">Main Long-Form Content (After Hero)</label>
                                <textarea
                                    rows={12}
                                    value={formData.main_content}
                                    onChange={(e) => setFormData({ ...formData, main_content: e.target.value })}
                                    placeholder="Write your in-depth introduction..."
                                    className="w-full px-5 py-3 border border-gray-300 rounded-xl font-serif text-lg leading-relaxed focus:ring-4 focus:ring-gray-900/20 focus:border-gray-900 transition"
                                />
                            </div>
                        </>
                    )}

                    {/* CONTENT SECTIONS TAB */}
                    {activeTab === "content" && (
                        <div>
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-2xl font-bold">Numbered Content Sections</h3>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setContentPoints([
                                            ...contentPoints,
                                            { title: "", content: "", image: "", quote: "" },
                                        ])
                                    }
                                    className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-black transition"
                                >
                                    <Plus className="w-5 h-5" /> Add Section
                                </button>
                            </div>

                            {contentPoints.map((point, index) => (
                                <div
                                    key={`${article._id || "new"}-point-${index}`}
                                    className="mb-10 p-8 border-2 border-dashed border-gray-300 rounded-2xl bg-gradient-to-br from-gray-50 to-white"
                                >
                                    <div className="flex justify-between items-center mb-6">
                                        <h4 className="text-xl font-bold flex items-center gap-3">
                                            <span className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-lg">
                                                {index + 1}
                                            </span>
                                            Section {index + 1}
                                        </h4>
                                        {contentPoints.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setContentPoints(contentPoints.filter((_, i) => i !== index))
                                                }
                                                className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>

                                    <input
                                        placeholder="Section Title"
                                        value={point.title}
                                        onChange={(e) => {
                                            const updated = [...contentPoints];
                                            updated[index].title = e.target.value;
                                            setContentPoints(updated);
                                        }}
                                        className="w-full mb-4 px-5 py-3 border border-gray-300 rounded-xl text-xl font-serif focus:ring-4 focus:ring-gray-900/20"
                                    />

                                    <textarea
                                        rows={6}
                                        placeholder="Detailed content..."
                                        value={point.content}
                                        onChange={(e) => {
                                            const updated = [...contentPoints];
                                            updated[index].content = e.target.value;
                                            setContentPoints(updated);
                                        }}
                                        className="w-full mb-4 px-5 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-gray-900/20"
                                    />

                                    <input
                                        placeholder="Image URL (optional)"
                                        value={point.image || ""}
                                        onChange={(e) => {
                                            const updated = [...contentPoints];
                                            updated[index].image = e.target.value;
                                            setContentPoints(updated);
                                        }}
                                        className="w-full mb-4 px-5 py-3 border border-gray-300 rounded-xl"
                                    />

                                    <input
                                        placeholder="Pull quote (optional)"
                                        value={point.quote || ""}
                                        onChange={(e) => {
                                            const updated = [...contentPoints];
                                            updated[index].quote = e.target.value;
                                            setContentPoints(updated);
                                        }}
                                        className="w-full px-5 py-3 border-dashed border-gray-400 rounded-xl italic text-gray-700"
                                    />
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
                                    Key Takeaways (one per line, use "||" as separator if needed)
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
                                    <div key={`${article._id || "new"}-faq-${i}`} className="mb-6 p-6 border border-gray-200 rounded-xl bg-gray-50">
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
                                            .map(s => s.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""))
                                            .filter(Boolean);
                                        setFormData({ ...formData, related_topics: values });
                                    }}
                                    placeholder="modern-living-room, scandinavian-style, boho-decor"
                                    className="w-full px-5 py-3 border border-gray-300 rounded-xl font-mono text-sm focus:ring-4 focus:ring-gray-900/20 focus:border-gray-900 transition"
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    These will appear as cards in the "Related Topics" section on the article page.
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

                    {/* Navigation & Final Save */}
                    <div className="flex gap-6 pt-10 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={goPrev}
                            disabled={currentTabIndex === 0}
                            className="px-8 py-5 bg-gray-200 text-gray-800 rounded-xl font-bold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                        >
                            <ChevronLeft className="w-5 h-5" /> Previous
                        </button>

                        {!isLastTab ? (
                            <button
                                type="button"
                                onClick={goNext}
                                className="flex-1 bg-gray-900 text-white py-5 rounded-xl font-bold text-lg hover:bg-black transition shadow-xl flex items-center justify-center gap-3"
                            >
                                Next <ChevronRight className="w-5 h-5" />
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-10 py-5 bg-gray-200 text-gray-800 rounded-xl font-bold hover:bg-gray-300 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 bg-green-600 text-white py-5 rounded-xl font-bold text-lg hover:bg-green-700 disabled:opacity-60 transition shadow-xl flex items-center justify-center gap-3"
                                >
                                    {saving ? (
                                        "Saving Article..."
                                    ) : (
                                        <>
                                            Save & Publish Article <Check className="w-6 h-6" />
                                        </>
                                    )}
                                </button>
                            </>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

// Parser
// FIXED PARSER — COPY THIS EXACTLY
function parseContentIntoPoints(content: string): ContentPoint[] {
    if (!content?.trim()) return [];

    const points: ContentPoint[] = [];
    const lines = content.split("\n");
    let currentPoint: Partial<ContentPoint> = { content: "" };

    lines.forEach((line) => {
        const trimmed = line.trim();

        if (/^\d+\.\s/.test(line)) {
            if (currentPoint.title) points.push(currentPoint as ContentPoint);
            currentPoint = {
                title: line.replace(/^\d+\.\s*/, "").trim(),
                content: ""
            };
        } else if (trimmed.startsWith("[IMAGE:") && trimmed.endsWith("]")) {
            const match = trimmed.match(/\[IMAGE:([^\]]+)\]/);
            if (match) currentPoint.image = match[1].trim();
        } else if (trimmed.startsWith("> ")) {
            currentPoint.quote = trimmed.slice(2).trim();
        } else if (trimmed && currentPoint.title) {
            currentPoint.content! += (currentPoint.content! ? "\n" : "") + trimmed;
        }
    });

    if (currentPoint.title) points.push(currentPoint as ContentPoint);

    // Fallback
    if (points.length === 0 && content.trim()) {
        points.push({ title: "Introduction", content: content.trim() });
    }

    return points;
}