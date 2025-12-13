// src/react-app/pages/Article.tsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import Layout from "../components/Layout";
import ProductCard from "../components/ProductCard";
import EditArticleModal from "../components/EditArticleModal";

import { Article, Product, ContentSection } from "../types";
const API = import.meta.env.VITE_API_URL;

import {
  Clock,
  User,
  Edit,
  ChevronDown,
  ArrowUp,
  ArrowRight,
  ShoppingBag,
  Leaf,
} from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

function shuffleArray<T>(arr: T[]): T[] {
  return arr.slice().sort(() => Math.random() - 0.5);
}

// --- Configuration for Modern Styling ---
const PRIMARY_COLOR = "text-gray-900";
const ACCENT_COLOR = "text-emerald-600";
const ACCENT_BG = "bg-emerald-600";
const BODY_BG = "bg-white";

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  // Check admin
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`${API}/api/admin/status`, { credentials: "include" });
        const data = await res.json();
        setIsAdmin(!!data.isAuthenticated);
      } catch { }
    };
    check();
  }, []);

  // Fetch article + related
 useEffect(() => {
  if (!slug) return;

  const go = async () => {
    try {
      setLoading(true);
      window.scrollTo({ top: 0, behavior: "smooth" });

      const artRes = await fetch(`${API}/api/articles/${slug}`);
      if (!artRes.ok) throw new Error("Not found");
      const art: Article = await artRes.json();
      setArticle(art);

      // Collect ALL product IDs from content_sections
      const productIdsInArticle = new Set<string>();
      art.content_sections?.forEach((sec: any) => {
        sec.products?.forEach((p: any) => {
          if (p.product_id) productIdsInArticle.add(p.product_id);
        });
      });

      const productPromises: Promise<any>[] = [];

      // Always fetch products used in sections (by ID)
      if (productIdsInArticle.size > 0) {
        productPromises.push(
          fetch(`${API}/api/products?ids=${Array.from(productIdsInArticle).join(",")}`)
            .then(r => r.json())
            .then(data => Array.isArray(data) ? data : [])
        );
      }

      // Optionally: also fetch room products for "Shop the Entire Look"
      const roomId = typeof art.room_id === "string" ? art.room_id :
                     art.room_id && "_id" in art.room_id ? (art.room_id as any)._id : null;

      if (roomId) {
        productPromises.push(
          fetch(`${API}/api/products?room_id=${roomId}`)
            .then(r => r.json())
            .then(data => Array.isArray(data) ? data : [])
        );
      }

      const results = await Promise.all(productPromises);

      // Merge: prioritize section-specific products, then add room products
      const sectionProducts = results[0] || [];
      const roomProducts = results[1] || [];

      // Combine and dedupe
      const allProductsMap = new Map<string, Product>();
      [...sectionProducts, ...roomProducts].forEach(p => {
        allProductsMap.set(p._id, p);
      });

      setProducts(Array.from(allProductsMap.values()));

      // Related articles logic (unchanged)
      // ...
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  go();
}, [slug]);

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-t-4 border-gray-200 border-t-emerald-600"></div>
        </div>
      </Layout>
    );
  }

  if (!article) {
    return (
      <Layout>
        <section className="py-32 text-center bg-gray-50">
          <h1 className="font-serif text-5xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <Link to="/articles" className="text-emerald-600 font-medium hover:text-emerald-700 transition">
            &larr; Back to Articles
          </Link>
        </section>
      </Layout>
    );
  }

  const faqs: FAQItem[] = article.faq ? JSON.parse(article.faq as string) : [];

  return (
    <Layout>
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

      {/* HERO SECTION - Modernized */}
      <section className="relative min-h-[200px] md:min-h-[300px] bg-gray-900 overflow-hidden">
        {article.hero_image ? (
          <img
            src={article.hero_image}
            alt={article.title}
            className="absolute inset-0 w-full h-full object-cover opacity-60 transition-opacity duration-500"
            loading="eager"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 to-gray-900" />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative h-full flex items-center justify-center px-6 py-16 md:py-24">
          <div className="text-center text-white max-w-5xl">
            <div className="flex items-center justify-center gap-8 text-sm mb-4 opacity-90 font-medium tracking-wider uppercase">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-300" />
                {article.read_time || 10} min read
              </span>
              <span className="flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-300" />
                {article.author_name || "LuxeNest Editorial"}
              </span>
            </div>
            <h1 className="font-serif text-2xl md:text-4xl font-extrabold mb-6 leading-tight drop-shadow-lg tracking-tight">
              {article.title}
            </h1>
            {article.excerpt && (
              <p className="text-md md:text-xl text-gray-200 leading-relaxed max-w-4xl mx-auto drop-shadow-md font-light">
                {article.excerpt}
              </p>
            )}
          </div>

          {isAdmin && (
            <button
              onClick={() => setShowEditModal(true)}
              className="absolute top-8 right-6 md:right-12 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-medium transition flex items-center gap-2 border border-white/30 text-sm md:text-base"
            >
              <Edit className="w-4 h-4 md:w-5 md:h-5" />
              Edit
            </button>
          )}
        </div>
      </section>

      {/* BREADCRUMBS - Sleeker */}
      <nav className="max-w-7xl mx-auto px-6 py-4 bg-white sticky top-0 z-10 shadow-sm">
        <ol className="flex items-center space-x-3 text-sm text-gray-500">
          <li>
            <Link to="/articles" className="hover:text-emerald-600 transition">
              Articles
            </Link>
          </li>
          <li className="font-medium text-gray-900">
            <span className="mx-1">/</span>
            {article.title}
          </li>
        </ol>
      </nav>

      {/* MAIN CONTENT + content_sections - Spacing Reduced: py-12 -> py-16, space-y-20 -> space-y-12 */}
      <section className={`${BODY_BG} py-2`}>
        <div className="max-w-7xl mx-auto px-6 ">
          {/* Intro paragraph */}
          {article.main_content && (
            <article className="max-w-4xl mx-auto pb-6">
              {article.main_content.split("\n\n").map((block, blockIdx) => {
                const lines = block
                  .split("\n")
                  .map(l => l.trim())
                  .filter(l => l.length > 0);

                // Detect bullet list: 3+ lines, all starting with • or -
                const isBulletList = lines.length >= 3 && lines.every(line =>
                  /^(\•|\-|\d+\.|\✦|\✓|\➊|\➋|\⭐)/.test(line)
                );

                if (isBulletList) {
                  return (
                    <ul key={blockIdx} className="space-y-2 pl-8 md:pl-10 my-2 pb-2">
                      {lines.map((line, i) => {
                        const text = line.replace(/^(\•|\-|\d+\.|\✦|\✓|\➊|\➋|\⭐)\s*/, "").trim();
                        return (
                          <li key={i} className="text-md md:text-2xl leading-relaxed flex items-start gap-4">
                            <span className="text-emerald-600 text-3xl mt-1.5 flex-shrink-0">•</span>
                            <span className="font-serif">{text}</span>
                          </li>
                        );
                      })}
                    </ul>
                  );
                }

                // Normal paragraphs
                return lines.map((line, i) => (
                  <p
                    key={`${blockIdx}-${i}`}
                    className={`${PRIMARY_COLOR} text-md md:text-xl leading-relaxed mb-8 font-serif 
            ${i === 0 ? "first-letter:text-7xl first-letter:font-extrabold first-letter:float-left first-letter:mr-6 first-letter:text-emerald-600" : ""}`}
                  >
                    {line}
                  </p>
                ));
              })}
            </article>
          )}

          {/* STRUCTURED SECTIONS – Spacing Reduced: space-y-12 -> space-y-8, pb-12 -> pb-8 */}
          {article.content_sections?.map((section: ContentSection, index: number) => (
            <div
              key={index}
              className={`space-y-8 pb-8 ${index < article.content_sections!.length - 1 ? "border-b border-gray-200" : ""}`}
            >
              {/* MAIN CONTENT BLOCK */}
              <article
                className={`grid grid-cols-1 ${section.image ? "lg:grid-cols-12" : "lg:grid-cols-1"
                  } gap-8 lg:gap-16 items-start w-full`}
              >
                {/* IMAGE */}
                {section.image && (
                  <div
                    className={`${index % 2 === 0 ? "lg:col-span-6 lg:order-1" : "lg:col-span-6 lg:order-2"
                      } relative group w-full`}
                  >
                    <div className="aspect-video md:aspect-[4/3] rounded-3xl overflow-hidden shadow-xl ring-8 ring-white">
                      <img
                        src={section.image}
                        alt={section.title}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                        loading={index === 0 ? "eager" : "lazy"}
                      />
                    </div>
                  </div>
                )}

                {/* TEXT AREA */}
                <div
                  className={`${section.image ? "lg:col-span-6" : "lg:col-span-full"
                    } ${section.image && index % 2 === 0 ? "lg:order-2" : "lg:order-1"
                    } flex flex-col justify-center w-full`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-3xl md:text-4xl font-extrabold text-emerald-600 font-sans">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="w-12 h-0.5 bg-gray-300" />
                  </div>

                  <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 leading-snug">
                    {section.title}
                  </h2>

                  {section.quote && (
                    <blockquote className="border-l-4 border-gray-300 pl-6  my-4 italic text-xl text-gray-700 bg-gray-50/50 rounded-r-lg">
                      “{section.quote}”
                    </blockquote>
                  )}

                  <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                    {section.content.split("\n").map((para, i) => (
                      <p key={i} className="text-lg">
                        {para || <br />}
                      </p>
                    ))}
                  </div>
                </div>
              </article>

              {/* RELATED PRODUCTS BLOCK – Elevated Display */}
              {section.products && section.products.length > 0 && (
                <div className="w-full col-span-full pt-6 border-t border-gray-100 bg-gray-50/70 p-8 rounded-2xl shadow-inner">
                  <h3 className="font-sans text-xl md:text-2xl font-semibold mb-6 flex items-center gap-3 text-gray-800">
                    <ShoppingBag className="w-6 h-6 text-emerald-600" />
                    Products Featured in this Section
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 justify-items-center w-full">
                    {section.products.map((prod: any, i: number) => {
                      const foundProduct = products.find(p => p._id === prod.product_id);
                      if (!foundProduct) return null; // skip if not found

                      return (
                        <div key={i} className="flex justify-center w-full">
                          <ProductCard product={foundProduct} />
                        </div>
                      );
                    })}

                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* KEY TAKEAWAYS - Spacing Reduced: py-20 -> py-16, mb-12 -> mb-8 */}
      {article.key_takeaways && (
        <section className="py-16 bg-gray-50 border-t border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-center text-gray-900 mb-8">
              Summary: Key Takeaways
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {article.key_takeaways.split("||").map((t, i) => (
                <div key={i} className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 ${ACCENT_BG} text-white rounded-full flex items-center justify-center font-extrabold text-xl flex-shrink-0 shadow-lg`}>
                      {i + 1}
                    </div>
                    <p className="text-lg text-gray-800 leading-relaxed pt-1">{t.trim()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SHOP THE ENTIRE LOOK - Spacing Reduced: py-20 -> py-16 */}
      {products.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <h3 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-8">
              Shop the Entire Look
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {shuffleArray(products).slice(0, 8).map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
            {products.length > 8 && (
              <div className="text-center mt-12">
                <Link to="/shop" className={`inline-flex items-center gap-2 px-8 py-3 font-semibold text-lg rounded-full ${ACCENT_BG} text-white hover:bg-emerald-700 transition-colors shadow-md`}>
                  View All Products <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* RELATED ARTICLES - Spacing Reduced: py-20 -> py-16, mb-12 -> mb-8 */}
      {relatedArticles.length > 0 && (
        <section className="py-16 bg-gray-50 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-center text-gray-900 mb-8">
              More Stories You’ll Love
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {relatedArticles.map((rel) => (
                <Link
                  key={rel._id}
                  to={`/articles/${rel.slug}`}
                  className="group block bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
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
                    <div className="w-full h-56 bg-gray-100 flex items-center justify-center text-gray-500 text-sm rounded-t-3xl">
                      <Leaf className="w-8 h-8 opacity-50" />
                    </div>
                  )}
                  <div className="p-6 md:p-8">
                    <h3 className="font-serif text-xl md:text-2xl font-bold text-gray-900 mb-3 line-clamp-2 leading-snug">
                      {rel.title}
                    </h3>
                    {rel.excerpt && <p className="text-gray-600 text-base line-clamp-3 mb-4">{rel.excerpt}</p>}
                    <div className="flex items-center gap-2 text-emerald-600 font-semibold mt-2">
                      Read Article <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ - Spacing Reduced: py-20 -> py-16, mb-12 -> mb-8 */}
      {faqs.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-center text-gray-900 mb-8">
              Your Questions Answered
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                  <button
                    onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                    className="w-full px-6 md:px-8 py-5 text-left flex items-center justify-between transition"
                  >
                    <span className="font-semibold text-lg md:text-xl text-gray-900 pr-8">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-6 h-6 text-emerald-600 transition-transform duration-300 ${openFAQ === i ? "rotate-180" : ""}`}
                    />
                  </button>
                  {openFAQ === i && (
                    <div className="px-6 md:px-8 pb-6 pt-2 border-t border-gray-100 bg-gray-50/50">
                      <p className="text-base md:text-lg text-gray-700 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* BACK TO TOP - New Style */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`
    fixed 
    bottom-6 left-6           
    md:bottom-10 md:left-10   
    lg:bottom-12 lg:left-12   
    ${ACCENT_BG} 
    text-white 
    p-4 
    rounded-xl 
    shadow-2xl 
    hover:bg-emerald-700 
    hover:scale-110 
    transition-all 
    duration-300 
    z-50
    backdrop-blur-sm
    border border-white/20
  `}
        aria-label="Back to top"
      >
        <ArrowUp className="w-6 h-6" />
      </button>
    </Layout>
  );
}