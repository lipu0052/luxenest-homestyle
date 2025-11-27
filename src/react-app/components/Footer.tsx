import { Link } from "react-router";
import { useState } from "react";
import { Mail } from "lucide-react";
const API = import.meta.env.VITE_API_URL;

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`${API}/api/subscribers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSubscribed(true);
        setEmail("");
      } else {
        alert("Subscription failed. Please try again.");
      }
    } catch (error) {
      console.error("Subscription failed:", error);
      alert("Subscription failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-gray-900 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img 
                src="https://mocha-cdn.com/019a99eb-ac15-7147-bf15-fdbcf1b92b92/image-(31).png" 
                alt="LuxeNest Logo" 
                className="h-26 w-28 brightness-0 invert"
              />
              {/* <img 
                src="https://mocha-cdn.com/019a99eb-ac15-7147-bf15-fdbcf1b92b92/image-(32).png" 
                alt="LuxeNest" 
                className="h-6 brightness-0 invert"
              /> */}
            </div>
            <p className="text-gray-400 text-sm">
              Transform your living spaces with curated home design inspiration and premium products.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/" className="hover:text-white transition">Home</Link></li>
              <li><Link to="/wishlist" className="hover:text-white transition">Wishlist</Link></li>
              <li><Link to="/admin" className="hover:text-white transition">Admin</Link></li>
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-5 h-5" />
              <h3 className="font-semibold text-lg">Stay Inspired</h3>
            </div>
            {subscribed ? (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                <p className="text-green-300 text-sm">Thanks for subscribing! 🎉</p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-3">
                <p className="text-gray-400 text-sm mb-3">
                  Get design tips and exclusive updates
                </p>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition disabled:opacity-50"
                >
                  {loading ? "Subscribing..." : "Subscribe"}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} LuxeNest. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
