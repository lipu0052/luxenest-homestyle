// src/react-app/pages/Article.tsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import Layout from "@/react-app/components/Layout";
import ProductCard from "@/react-app/components/ProductCard";
import EditArticleModal from "@/react-app/components/EditArticleModal";


import { Article, Product } from "@/types";
const API = import.meta.env.VITE_API_URL;

import {
  Clock,
  User,
  Edit,
  ChevronDown,
  ArrowUp,
  ArrowRight   // ← Added for "Read More" arrow
} from "lucide-react";

interface ContentPoint {
  title: string;
  content: string;
  image?: string;
  quote?: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

function shuffleArray<T>(arr: T[]): T[] {
  return arr.slice().sort(() => Math.random() - 0.5);
}

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await fetch(`${API}/api/admin/status`, { credentials: "include" });
        const data = await response.json();
        setIsAdmin(data.isAuthenticated || false);
      } catch { }
    };
    checkAdmin();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    const fetchData = async () => {
      if (!slug) return;

      try {
        // 1. Fetch current article
        const articleRes = await fetch(`${API}/api/articles/${slug}`);
        if (!articleRes.ok) throw new Error("Article not found");
        const articleData: Article = await articleRes.json();
        setArticle(articleData);

        // 2. Fetch products + related articles from same room
        if (articleData.room_id) {
          const [productsRes, articlesRes] = await Promise.all([
            fetch(`${API}/api/products?room_id=${articleData.room_id}`),
            fetch(`${API}/api/articles?room_id=${articleData.room_id}&limit=20`)
          ]);

          const prods: Product[] = await productsRes.json();
          setProducts(shuffleArray(prods).slice(0, 8));

          // THIS IS THE ONLY FIX NEEDED
          const articlesResponse = await articlesRes.json();
          const allArticles: Article[] = articlesResponse.articles || [];

          const related = allArticles
            .filter((a: Article) => a._id !== articleData._id)
            .sort((a: any, b: any) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime())
            .slice(0, 6);

          setRelatedArticles(related);
        }
      } catch (error) {
        console.error("Failed to fetch article:", error);
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

  if (!article) {
    return (
      <Layout>
        <section className="py-32 text-center">
          <h1 className="font-serif text-5xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <p className="text-xl text-gray-600">The page you're looking for doesn't exist.</p>
          <Link to="/articles" className="mt-8 inline-block text-gray-900 font-medium hover:underline">
            ← Back to Articles
          </Link>
        </section>
      </Layout>
    );
  }

  const contentPoints = article.content ? parseContentIntoPoints(article.content) : [];
  const faqs: FAQItem[] = article.faq ? JSON.parse(article.faq as string) : [];

  return (
    <Layout>
      {/* HERO SECTION */}
      <section className="relative h-96 bg-gray-900 overflow-hidden">
        {article.hero_image ? (
          <img
            src={article.hero_image}
            alt={article.title}
            className="absolute inset-0 w-full h-full object-cover opacity-70"
            loading="eager"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative h-full flex items-center justify-center px-6">
          <div className="text-center text-white max-w-4xl">
            <div className="flex items-center justify-center gap-8 text-sm mb-6 opacity-90">
              <span className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                {article.read_time || 10} min read
              </span>
              <span className="flex items-center gap-2">
                <User className="w-5 h-5" />
                LuxeNest Editorial
              </span>
            </div>
            <h1 className="font-serif text-2xl md:text-4xl font-bold mb-6 leading-tight drop-shadow-2xl">
              {article.title}
            </h1>
            {article.excerpt && (
              <p className="text-xl md:text-2xl text-gray-100 leading-relaxed max-w-3xl mx-auto drop-shadow-lg">
                {article.excerpt}
              </p>
            )}
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowEditModal(true)}
              className="absolute top-8 right-8 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-full font-medium transition flex items-center gap-3"
            >
              <Edit className="w-5 h-5" />
              Edit Article
            </button>
          )}
        </div>
      </section>

      {/* BREADCRUMBS */}
      <nav className="max-w-7xl mx-auto px-6 py-4">
        <ol className="flex items-center space-x-2 text-sm text-gray-600">
          <li><Link to="/articles" className="hover:underline">Articles</Link></li>
          <li className="before:content-['/'] before:mr-2">{article.title}</li>
        </ol>
      </nav>

      {/* MAIN CONTENT WITH INTERLEAVED PRODUCTS */}
      <section className="max-w-5xl mx-auto px-6 py-20 space-y-8">
        {article.main_content && (
          <article className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-8">
            {article.main_content.split("\n\n").map((paragraph, i) => (
              <p key={i} className="text-lg first-letter:text-5xl first-letter:font-bold first-letter:mr-3 first-letter:float-left">
                {paragraph}
              </p>
            ))}
          </article>
        )}

        {contentPoints.map((point, index) => (
          <div key={index} className="space-y-4">
            <article className={`grid grid-cols-1 ${point.image ? "lg:grid-cols-2" : "lg:grid-cols-1"} gap-8 lg:gap-20 items-start`}>
              {point.image && (
                <div className={`${index % 2 === 0 ? "lg:order-1" : "lg:order-2"} relative group`}>
                  <div className="aspect-[4/2.5] md:aspect-[4/2] sm:aspect-[4/2] lg:aspect-[3/2.5] rounded-2xl overflow-hidden shadow-2xl">
                    <img
                      src={point.image}
                      alt={point.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading={index === 0 ? "eager" : "lazy"}
                    />
                  </div>
                </div>
              )}
              <div className={`${point.image && index % 2 === 0 ? "lg:order-2" : "lg:order-1"} flex flex-col justify-center space-y-2`}>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-1 bg-gray-900" />
                  <span className="text-5xl font-bold text-gray-300">0{index + 1}</span>
                </div>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                  {point.title}
                </h2>
                {point.quote && (
                  <blockquote className="border-l-4 border-gray-900 pl-6 py-4 my-8 italic text-xl text-gray-700">
                    “{point.quote}”
                  </blockquote>
                )}
                <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-2">
                  {point.content.split("\n").map((para, i) => (
                    <p key={i} className="text-lg">{para || <br />}</p>
                  ))}
                </div>
              </div>
            </article>

            {index % 2 === 1 && products.length > 0 && (
              <div className="py-4">
                <h3 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-2">Related Products</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {shuffleArray(products).slice(0, 4).map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </section>

      {/* KEY TAKEAWAYS */}
      {article.key_takeaways && (
        <section className="py-6 bg-gray-100">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="font-serif text-5xl font-bold text-center text-gray-900 mb-16">Key Takeaways</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {article.key_takeaways.split("||").map((takeaway: string, i: number) => (
                <div key={i} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                      {i + 1}
                    </div>
                    <p className="text-lg text-gray-700 leading-relaxed">{takeaway.trim()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SHOP THE LOOK */}
      {products.length > 0 && (
        <section className="py-6 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <h3 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-6">Shop the Look</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {shuffleArray(products).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* RELATED ARTICLES — THIS IS WHAT YOU WANTED */}
      {relatedArticles.length > 0 && (
        <section className="py-6 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="font-serif text-5xl font-bold text-center text-gray-900 mb-16">
              More Articles You’ll Love
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {relatedArticles.map((rel) => (
                <Link
                  key={rel._id}
                  to={`/articles/${rel.slug}`}
                  className="group block bg-gray-50 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300"
                >
                  {rel.hero_image ? (
                    <img
                      src={rel.hero_image}
                      alt={rel.title}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                      No Image
                    </div>
                  )}
                  <div className="p-8">
                    <h3 className="font-serif text-2xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-gray-700">
                      {rel.title}
                    </h3>
                    {rel.excerpt && (
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">{rel.excerpt}</p>
                    )}
                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                      Read Article <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ SECTION */}
      {faqs.length > 0 && (
        <section className="py-6 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="font-serif text-5xl font-bold text-center text-gray-900 mb-16">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <button
                    onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                    className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition"
                  >
                    <span className="font-medium text-xl text-gray-900 pr-8">{faq.question}</span>
                    <ChevronDown className={`w-6 h-6 text-gray-600 transition-transform duration-300 ${openFAQ === index ? "rotate-180" : ""}`} />
                  </button>
                  {openFAQ === index && (
                    <div className="px-8 pb-8 pt-2">
                      <p className="text-lg text-gray-700 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* COMMENTS */}
      <section className="py-6 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="font-serif text-4xl font-bold text-gray-900 mb-8">Join the Conversation</h2>
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <p className="text-gray-600 text-center">Comments coming soon! Share your thoughts on social media.</p>
          </div>
        </div>
      </section>

      {/* BACK TO TOP */}
      {/* BACK TO TOP — Smart version: automatically moves up when near footer */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-24 right-6 md:bottom-28 md:right-8 
             bg-gray-800 text-white p-4 rounded-full 
             shadow-2xl hover:bg-gray-700 transition-all z-40 hover:scale-110"
        aria-label="Back to top"
      >
        <ArrowUp className="w-7 h-7" />
      </button>

      {/* EDIT MODAL */}
      {showEditModal && article && (
        <EditArticleModal
          article={article}
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

// Parser for content points
function parseContentIntoPoints(content: string): ContentPoint[] {
  const points: ContentPoint[] = [];
  const lines = content.split("\n");
  let currentPoint: Partial<ContentPoint> = { content: "" };

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (/^\d+\.\s/.test(line)) {
      if (currentPoint.title) points.push(currentPoint as ContentPoint);
      currentPoint = { title: trimmed.replace(/^\d+\.\s*/, ""), content: "" };
    } else if (trimmed.startsWith("[IMAGE:")) {
      const match = trimmed.match(/\[IMAGE:([^\]]+)\]/);
      if (match) currentPoint.image = match[1];
    } else if (trimmed.startsWith("> ")) {
      currentPoint.quote = trimmed.slice(2).trim();
    } else if (trimmed && currentPoint.title) {
      currentPoint.content! += (currentPoint.content! ? "\n" : "") + trimmed;
    }
  });

  if (currentPoint.title) points.push(currentPoint as ContentPoint);
  if (points.length === 0 && content.trim()) {
    points.push({ title: "Introduction", content: content.trim() });
  }

  return points;
}