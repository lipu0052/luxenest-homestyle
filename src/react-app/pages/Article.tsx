// src/react-app/pages/Article.tsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import Layout from "@/react-app/components/Layout";
import ProductCard from "@/react-app/components/ProductCard";
import ArticleCard from "@/react-app/components/ArticleCard";
import EditArticleModal from "@/react-app/components/EditArticleModal";
import { Article, Product } from "@/types";
import { 
  Clock, 
  User, 
  Edit, 
  ChevronDown, 
  ThumbsUp, 
  Share2, 
  Bookmark, 
  MessageCircle,
  ArrowUp 
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

interface RelatedTopic {
  title: string;
  slug: string;
  excerpt: string;
  image?: string;
}

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [relatedTopics, setRelatedTopics] = useState<RelatedTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [showAuthorBio, setShowAuthorBio] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await fetch("/api/admin/status");
        const data = await response.json();
        setIsAdmin(data.isAuthenticated);
      } catch {}
    };
    checkAdmin();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    const fetchData = async () => {
      try {
        const articleResponse = await fetch(`/api/articles/${slug}`);
        if (!articleResponse.ok) throw new Error("Article not found");
        const articleData = await articleResponse.json();
        setArticle(articleData);

        if (articleData.room_id) {
          const [productsRes, articlesRes, topicsRes] = await Promise.all([
            fetch(`/api/products?room_id=${articleData.room_id}`),
            fetch(`/api/articles?room_id=${articleData.room_id}`),
            fetch(`/api/topics?related_to=${articleData._id}`),
          ]);

          setProducts((await productsRes.json()).slice(0, 8));
          setRelatedArticles(
            (await articlesRes.json())
              .filter((a: Article) => a._id !== articleData._id)
              .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 6)
          );
          setRelatedTopics(await topicsRes.json());
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
  const faqs: FAQItem[] = article.faq ? JSON.parse(article.faq as any) : [];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.excerpt || '',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <Layout>
      {/* HERO SECTION – Enhanced with Schema & Better Meta */}
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

            <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 leading-tight drop-shadow-2xl">
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

      {/* BREADCRUMBS – For SEO & UX */}
      <nav className="max-w-7xl mx-auto px-6 py-4">
        <ol className="flex items-center space-x-2 text-sm text-gray-600">
          <li>
            <Link to="/articles" className="hover:underline">Articles</Link>
          </li>
          <li className="before:content-['/'] before:mr-2">{article.title}</li>
        </ol>
      </nav>

      {/* MAIN LONG-FORM CONTENT SECTION – Enhanced with E-E-A-T Signals */}
      {article.main_content && (
        <section className="max-w-4xl mx-auto px-6 py-20">
          <article className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-8">
            {article.main_content.split("\n\n").map((paragraph, i) => (
              <p key={i} className="text-lg first-letter:text-5xl first-letter:font-bold first-letter:mr-3 first-letter:float-left">
                {paragraph}
              </p>
            ))}
          </article>
          {/* E-E-A-T Author Bio Toggle */}
          <div className="mt-12 p-6 bg-gray-50 rounded-2xl">
            <button 
              onClick={() => setShowAuthorBio(!showAuthorBio)}
              className="flex items-center gap-2 text-gray-900 font-medium mb-4"
            >
              About the Author <ArrowUp className={`w-4 h-4 transition-transform ${showAuthorBio ? 'rotate-180' : ''}`} />
            </button>
            {showAuthorBio && (
              <div className="text-gray-700">
                <p className="text-sm">Written by LuxeNest Editorial Team – Experts in luxury interior design with over 10 years of experience curating timeless spaces. Our insights are backed by collaborations with leading architects and designers worldwide.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* NUMBERED CONTENT POINTS – Optimized for Readability & Mobile */}
      {contentPoints.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="space-y-32">
            {contentPoints.map((point, index) => (
              <article
                key={index}
                className={`grid grid-cols-1 ${point.image ? "lg:grid-cols-2" : "lg:grid-cols-1"} gap-12 lg:gap-20 items-start`}
              >
                {point.image && (
                  <div className={`${index % 2 === 0 ? "lg:order-1" : "lg:order-2"} relative group`}>
                    <div className="aspect-[4/3] md:aspect-[3/2] rounded-2xl overflow-hidden shadow-2xl">
                      <img
                        src={point.image}
                        alt={point.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        loading={index === 0 ? "eager" : "lazy"}
                      />
                    </div>
                  </div>
                )}

                <div className={`${point.image && index % 2 === 0 ? "lg:order-2" : "lg:order-1"} flex flex-col justify-center space-y-8`}>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-1 bg-gray-900" />
                    <span className="text-5xl font-bold text-gray-300">0{index + 1}</span>
                  </div>

                  <h2 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                    {point.title}
                  </h2>

                  {point.quote && (
                    <blockquote className="border-l-4 border-gray-900 pl-6 py-4 my-8 italic text-xl text-gray-700">
                      “{point.quote}”
                    </blockquote>
                  )}

                  <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6">
                    {point.content.split("\n").map((para, i) => (
                      <p key={i} className="text-lg">{para || <br />}</p>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* KEY TAKEAWAYS – SEO-Optimized Bullet Points */}
      {article.key_takeaways && (
        <section className="py-24 bg-gray-100">
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

      {/* RELATED TOPICS SECTION – For Topical Authority & SEO */}
      {relatedTopics.length > 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="font-serif text-5xl font-bold text-center text-gray-900 mb-16">Related Topics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedTopics.map((topic) => (
                <Link 
                  key={topic.slug} 
                  to={`/topics/${topic.slug}`}
                  className="group block bg-gray-50 rounded-2xl overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {topic.image && (
                    <img 
                      src={topic.image} 
                      alt={topic.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  <div className="p-6">
                    <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-gray-700">{topic.title}</h3>
                    <p className="text-gray-600 text-sm">{topic.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ SECTION – Schema-Ready Accordion */}
      {faqs.length > 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="font-serif text-5xl font-bold text-center text-gray-900 mb-16">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <button
                    onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                    className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition"
                  >
                    <span className="font-medium text-xl text-gray-900 pr-8">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-6 h-6 text-gray-600 transition-transform duration-300 ${
                        openFAQ === index ? "rotate-180" : ""
                      }`}
                    />
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

      {/* ENGAGEMENT BAR – Social Proof & Sharing */}
      <section className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:hidden z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <ThumbsUp className="w-5 h-5" />
            <span>Helpful? Like this article</span>
          </div>
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 text-gray-900 font-medium"
          >
            <Share2 className="w-5 h-5" />
            Share
          </button>
        </div>
      </section>

      {/* SHOP THE LOOK – With Lazy Loading */}
      {products.length > 0 && (
        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="font-serif text-5xl font-bold text-gray-900 mb-4">Shop the Look</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Bring this design to life with our handpicked collection
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* MORE INSPIRATION – Enhanced with Engagement Metrics */}
      {relatedArticles.length > 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between mb-16">
              <div>
                <h2 className="font-serif text-5xl font-bold text-gray-900">More Inspiration</h2>
                <p className="text-xl text-gray-600 mt-2">Continue your design journey</p>
              </div>
              <Link to="/articles" className="text-lg font-medium text-gray-900 hover:underline flex items-center gap-2">
                View All Articles →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {relatedArticles.map((related) => (
                <ArticleCard key={related._id} article={related} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* COMMENTS SECTION – Placeholder for Disqus/Comments */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="font-serif text-4xl font-bold text-gray-900 mb-8">Join the Conversation</h2>
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <p className="text-gray-600 text-center">Comments coming soon! Share your thoughts on social media.</p>
            {/* Integrate Disqus or custom comments here */}
          </div>
        </div>
      </section>

      {/* BACK TO TOP BUTTON */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-6 right-6 bg-gray-900 text-white p-3 rounded-full shadow-lg hover:bg-gray-800 transition hidden md:block z-50"
      >
        <ArrowUp className="w-5 h-5" />
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

// Enhanced Parser with Better Support for Structured Content
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