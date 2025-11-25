import { Link } from "react-router";
import { Article } from "@/types";
import { ArrowRight, Edit } from "lucide-react";
import { useState, useEffect } from "react";
import EditArticleModal from "./EditArticleModal";

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await fetch("/api/admin/status");
        const data = await response.json();
        setIsAdmin(data.isAuthenticated);
      } catch (error) {
        console.error("Failed to check admin status:", error);
      }
    };
    checkAdmin();
  }, []);

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowEditModal(true);
  };
  return (
    <>
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        {article.hero_image && (
          <div className="aspect-[16/9] overflow-hidden relative group">
            <img
              src={article.hero_image}
              alt={article.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
            {isAdmin && (
              <button
                onClick={handleEdit}
                className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition opacity-0 group-hover:opacity-100"
              >
                <Edit className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>
        )}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h3 className="font-serif text-xl font-semibold text-gray-900 flex-1">
              {article.title}
            </h3>
            {isAdmin && !article.hero_image && (
              <button
                onClick={handleEdit}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <Edit className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>
          {article.excerpt && (
            <p className="text-gray-600 mb-4 line-clamp-2">{article.excerpt}</p>
          )}
          <Link
            to={`/articles/${article.slug}`}
            className="inline-flex items-center gap-2 text-gray-900 font-medium hover:gap-3 transition-all"
          >
            Read Now
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {showEditModal && (
        <EditArticleModal
          article={article}
          onClose={() => setShowEditModal(false)}
          onSave={() => {
            setShowEditModal(false);
            window.location.reload();
          }}
        />
      )}
    </>
  );
}
