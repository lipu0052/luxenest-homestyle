// src/react-app/components/EditProductModal.tsx
import { useEffect, useState } from "react";
import { X, Plus, Trash2, Camera } from "lucide-react";
import { Product, Room } from "../types";

const API = import.meta.env.VITE_API_URL;

interface EditProductModalProps {
  product: Product;
  onClose: () => void;
  onSave: () => void;
}

export default function EditProductModal({ product, onClose, onSave }: EditProductModalProps) {
  // Migrate legacy single image → main_image
  const initialMainImage = product.image || (product.images?.[0] ?? "");
  const initialGallery = product.images && product.images.length > 1
    ? product.images.slice(1)
    : [];

  const [formData, setFormData] = useState({
    name: product.name || "",
    slug: product.slug || "",
    price: product.price || 0,
    description: product.description || "",
    main_image: initialMainImage,
    gallery_images: initialGallery,
    affiliate_link: product.affiliate_link || "",
    room_id:
      typeof product.room_id === "string"
        ? product.room_id
        : product.room_id && "_id" in product.room_id
          ? (product.room_id as { _id: string })._id
          : null,

  });


  const [rooms, setRooms] = useState<Room[]>([]);
  const [saving, setSaving] = useState(false);
  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  useEffect(() => {
    fetch(`${API}/api/rooms`)
      .then((r) => r.json())
      .then(setRooms)
      .catch(console.error);
  }, []);

  const addGalleryImage = () => {
    if (newGalleryUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        gallery_images: [...prev.gallery_images, newGalleryUrl.trim()]
      }));
      setNewGalleryUrl("");
    }
  };

  const removeGalleryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      gallery_images: prev.gallery_images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.main_image.trim()) {
      alert("Main image is required!");
      return;
    }

    setSaving(true);

    try {
      const isCreating = !product._id;
      const url = isCreating ? `${API}/api/products` : `${API}/api/products/${product._id}`;
      const method = isCreating ? "POST" : "PUT";

      // Combine main + gallery for backward compatibility
      const allImages = [formData.main_image, ...formData.gallery_images].filter(Boolean);

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          slug: formData.slug.toLowerCase().trim(),
          price: Number(formData.price),
          description: formData.description || undefined,
          image: formData.main_image.trim(),           // legacy field
          images: allImages,                            // new full array
          affiliate_link: formData.affiliate_link || undefined,
          room_id: formData.room_id || null,
        }),
      });

      if (res.ok) {
        onSave();
      } else {
        const err = await res.text();
        alert("Save failed: " + err);
      }
    } catch (err) {
      alert("Network error");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[94vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-8 py-6 flex justify-between items-center z-10">
          <h2 className="font-serif text-3xl font-bold">
            {product._id ? "Edit Product" : "Add New Product"}
          </h2>
          <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-full transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-10">

          {/* Room */}
          <div>
            <label className="block font-bold mb-3">Room</label>
            <select
              value={formData.room_id || ""}
              onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
            >
              <option value="">No Room</option>
              {rooms.map((room) => (
                <option key={room._id} value={room._id}>
                  {room.name}
                </option>
              ))}
            </select>

          </div>

          {/* Name + Slug */}
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <label className="block font-bold mb-3">Product Name *</label>
              <input
                required
                placeholder="Italian Leather Sofa"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-6 py-4 border-2 rounded-xl text-xl font-serif"
              />
            </div>
            <div>
              <label className="block font-bold mb-3">URL Slug *</label>
              <input
                required
                placeholder="italian-leather-sofa"
                value={formData.slug}
                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-6 py-4 border-2 rounded-xl font-mono text-sm"
              />
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block font-bold mb-3">Price *</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.price}
              onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              className="w-full px-6 py-4 border-2 rounded-xl text-lg"
              placeholder="1899.00"
            />
          </div>

          {/* MAIN IMAGE */}
          <div>
            <label className="block font-bold mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Main Product Image * (Primary Hero Image)
            </label>
            {formData.main_image ? (
              <div className="relative inline-block">
                <img
                  src={formData.main_image}
                  alt="Main"
                  className="w-full max-w-2xl h-96 object-cover rounded-2xl border-4 border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, main_image: "" })}
                  className="absolute top-4 right-4 bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 transition"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-4 bg-black/70 text-white px-4 py-2 rounded-lg text-sm font-bold">
                  MAIN IMAGE
                </div>
              </div>
            ) : (
              <input
                type="url"
                required
                placeholder="https://example.com/main-sofa.jpg"
                value={formData.main_image}
                onChange={e => setFormData({ ...formData, main_image: e.target.value })}
                className="w-full px-6 py-5 border-2 border-dashed rounded-xl text-center text-gray-500"
              />
            )}
          </div>

          {/* GALLERY IMAGES */}
          <div>
            <label className="block font-bold mb-4">Additional Gallery Images (Optional)</label>
            <p className="text-sm text-gray-600 mb-4">Detail shots, lifestyle, color options, dimensions, etc.</p>

            <div className="flex gap-4 mb-6">
              <input
                type="url"
                placeholder="https://example.com/sofa-side.jpg"
                value={newGalleryUrl}
                onChange={e => setNewGalleryUrl(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addGalleryImage())}
                className="flex-1 px-6 py-4 border-2 rounded-xl"
              />
              <button
                type="button"
                onClick={addGalleryImage}
                className="px-8 py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Image
              </button>
            </div>

            {formData.gallery_images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {formData.gallery_images.map((img, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={img}
                      alt={`Gallery ${i + 1}`}
                      className="w-full h-48 object-cover rounded-xl border"
                    />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(i)}
                      className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold mb-3">Full Description</label>
            <textarea
              rows={14}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-6 py-5 border-2 rounded-xl font-medium leading-relaxed"
              placeholder="Handcrafted in Italy...\n\n• Premium aniline leather\n• Solid oak frame\n• 10-year warranty"
            />
          </div>

          {/* Affiliate Link */}
          <div>
            <label className="block font-bold mb-3">Affiliate Link (Optional)</label>
            <input
              type="url"
              placeholder="https://amazon.com/dp/B0XXXXXX"
              value={formData.affiliate_link}
              onChange={e => setFormData({ ...formData, affiliate_link: e.target.value })}
              className="w-full px-6 py-4 border-2 rounded-xl font-mono text-sm"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-6 pt-8">
            <button
              type="submit"
              disabled={saving || !formData.main_image}
              className="flex-1 bg-black text-white py-5 rounded-xl font-bold text-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {saving ? "Saving Product..." : "Save Product"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-12 py-5 bg-gray-200 rounded-xl font-bold text-xl hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}