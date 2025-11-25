import { Heart, Edit } from "lucide-react";
import { Link } from "react-router";
import {  Product } from "@/types";
import { useState, useEffect } from "react";
import EditProductModal from "./EditProductModal";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
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

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    const sessionId = localStorage.getItem("session_id") || crypto.randomUUID();
    localStorage.setItem("session_id", sessionId);

    try {
      await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: product.id, session_id: sessionId }),
      });
      setIsWishlisted(true);
    } catch (error) {
      console.error("Failed to add to wishlist:", error);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowEditModal(true);
  };

  return (
    <>
      <Link to={`/products/${product.slug}`} className="group block">
        <div className="relative overflow-hidden rounded-lg bg-gray-100 aspect-square mb-3">
          {product.image && (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          )}
          <div className="absolute top-3 right-3 flex gap-2">
            {isAdmin && (
              <button
                onClick={handleEdit}
                className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition z-10"
              >
                <Edit className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <button
              onClick={handleWishlist}
              className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition z-10"
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
            </button>
          </div>
        </div>
        <h3 className="font-medium text-gray-900 mb-1 group-hover:text-gray-600 transition">
          {product.name}
        </h3>
        <p className="text-lg font-semibold text-gray-900">${product.price.toFixed(2)}</p>
      </Link>

      {showEditModal && (
        <EditProductModal
          product={product}
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
