// src/react-app/components/EditProductModal.tsx
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Product, Room } from "@/types";
const API = import.meta.env.VITE_API_URL;

interface EditProductModalProps {
  product: Product;
  onClose: () => void;
  onSave: () => void;
}

export default function EditProductModal({ product, onClose, onSave }: EditProductModalProps) {
  const [formData, setFormData] = useState({
    name: product.name,
    slug: product.slug,
    description: product.description || "",
    price: product.price,
    image: product.image || "",
    affiliate_link: product.affiliate_link || "",
    room_id: product.room_id || null,
  });

  const [rooms, setRooms] = useState<Room[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/rooms`).then(r => r.json()).then(setRooms);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const isCreating = !product._id || product._id === "";
      const url = isCreating ? `${API}/api/products` : `${API}/api/products/${product._id}`;
      const method = isCreating ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          slug: formData.slug.toLowerCase().trim(),
          price: Number(formData.price),
          description: formData.description || undefined,
          image: formData.image,
          affiliate_link: formData.affiliate_link || undefined,
          room_id: formData.room_id || null,
        }),
      });

      if (res.ok) {
        onSave();
      } else {
        const err = await res.text();
        alert("Failed: " + err);
      }
    } catch (err) {
      alert("Network error");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-8 py-5 flex justify-between items-center">
          <h2 className="font-serif text-3xl font-bold">
            {product._id ? "Edit Product" : "Create New Product"}
          </h2>          <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <select value={formData.room_id || ""} onChange={e => setFormData({ ...formData, room_id: e.target.value || null })}
            className="w-full px-5 py-3 border-2 rounded-xl">
            <option value="">No Room</option>
            {rooms.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
          </select>

          <div className="grid md:grid-cols-2 gap-6">
            <input required placeholder="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-5 py-4 border-2 rounded-xl text-xl font-serif" />
            <input required placeholder="slug" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-5 py-4 border-2 rounded-xl font-mono text-sm" />
          </div>

          <input type="number" step="0.01" required placeholder="Price" value={formData.price}
            onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
            className="w-full px-5 py-4 border-2 rounded-xl" />

          <div>
            <label className="block font-bold mb-3">Full Product Description</label>
            <p className="text-sm text-gray-600 mb-3">Use • or - for bullets • Blank lines for paragraphs</p>
            <textarea rows={16} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-6 py-5 border-2 rounded-xl leading-relaxed font-medium"
              placeholder="Luxurious velvet sofa...\n\n• 10-year warranty\n• Free shipping\n• 30-day returns" />
          </div>

          <input type="url" required placeholder="Product Image URL" value={formData.image}
            onChange={e => setFormData({ ...formData, image: e.target.value })}
            className="w-full px-5 py-4 border-2 rounded-xl" />

          <div>
            <label className="block font-bold mb-3">Affiliate Link (Amazon, Wayfair, etc.)</label>
            <input type="url" placeholder="https://amazon.com/dp/B0ABC123..." value={formData.affiliate_link}
              onChange={e => setFormData({ ...formData, affiliate_link: e.target.value })}
              className="w-full px-5 py-4 border-2 rounded-xl font-mono text-sm" />
            <p className="text-xs text-gray-500 mt-2">Optional – leave empty if not affiliate</p>
          </div>

          <div className="flex gap-4">
            <button type="submit" disabled={saving}
              className="flex-1 bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-black disabled:opacity-50">
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button type="button" onClick={onClose}
              className="px-10 py-4 bg-gray-200 rounded-xl font-bold text-lg hover:bg-gray-300">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}