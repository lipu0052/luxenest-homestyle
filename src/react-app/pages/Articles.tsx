import { useEffect, useState } from "react";
import Layout from "@/react-app/components/Layout";
import ArticleCard from "@/react-app/components/ArticleCard";
import { Article } from "@/types";

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const fetchArticles = async () => {
      try {
        const response = await fetch("/api/articles");
        const result = await response.json();

        // Support both formats:
        // 1. { articles: [...], pagination: {...} }  ← your current controller
        // 2. direct array []                           ← old format
        const articleList = Array.isArray(result)
          ? result
          : Array.isArray(result?.articles)
            ? result.articles
            : [];

        setArticles(articleList);
      } catch (error) {
        console.error("Failed to fetch articles:", error);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

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
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            All Articles
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our curated collection of interior design articles, tips, and inspiration
          </p>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600">No articles found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <ArticleCard key={article._id || article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
