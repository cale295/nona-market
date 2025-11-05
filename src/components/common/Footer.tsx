import { useState } from "react";
import {
  Mail,
  Phone,
  MessageCircle,
  Instagram,
  Facebook,
  Twitter,
  MapPin,
  Star,
  Heart,
  ArrowRight,
  Check,
} from "lucide-react";

const ModernFooter = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = () => {
    if (email) {
      setIsSubscribed(true);
      setTimeout(() => {
        setIsSubscribed(false);
        setEmail("");
      }, 3000);
    }
  };

  return (
    <div className="relative">
      {/* Newsletter Section with Gradient Background */}
      <section className="relative py-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-white rounded-full animate-bounce"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white rounded-full animate-ping"></div>
          <div className="absolute bottom-32 right-1/3 w-8 h-8 bg-white rounded-full animate-pulse"></div>
        </div>

        <div className="container mx-auto px-4 lg:px-6 text-center relative z-10">
          <div className="flex items-center justify-center mb-6">
            <Heart className="w-8 h-8 text-pink-200 mr-3 animate-pulse" />
            <h2 className="text-3xl md:text-5xl font-bold text-white">
              Tumbuh Bersama Muslimah Indonesia
            </h2>
          </div>
          <h3 className="text-xl md:text-2xl text-white/90 mb-4 font-medium">
            Menginspirasi dan Bertumbuh Bersama
          </h3>

          <p className="text-base lg:text-lg text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
            Dapatkan koleksi hijab terbaru, promo eksklusif, dan tips style yang
            menginspirasi langsung di inbox Anda setiap minggu
          </p>

          <div className="max-w-md mx-auto">
            {!isSubscribed ? (
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Masukkan email Anda"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-1 border-white text-white placeholder-white shadow-lg"
                  />
                </div>
                <button
                  onClick={handleSubscribe}
                  className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-bold hover:bg-gray-50 hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center group shadow-lg"
                >
                  Subscribe
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ) : (
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 flex items-center justify-center text-white">
                <Check className="w-6 h-6 mr-3 text-green-300" />
                <span className="font-semibold">
                  Terima kasih! Anda sudah berlangganan.
                </span>
              </div>
            )}
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center mt-8 space-x-6 text-white/70">
            <div className="flex items-center">
              <Star className="w-5 h-5 text-yellow-300 mr-1" />
              <span className="text-sm">4.9/5 Rating</span>
            </div>
            <div className="flex items-center">
              <Heart className="w-5 h-5 text-pink-300 mr-1" />
              <span className="text-sm">98% Customer Satisfaction</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Footer */}
      <footer className="bg-gray-900 text-white">
        {/* Main Footer Content */}
        <div className="container mx-auto px-4 lg:px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <div className="relative">
                  <img
                src="./logo.webp"
                alt="Nona Market"
                className="w-10 h-10 md:w-12 md:h-12 shadow-lg group-hover:shadow-xl transition-all duration-300"
              />
                  
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Nona Market
                </h3>
              </div>
              <p className="text-gray-300 leading-relaxed mb-6">
                Toko hijab online terpercaya dengan kualitas premium dan
                pelayanan terbaik untuk muslimah Indonesia.
              </p>

              {/* Social Media */}
              <div className="flex space-x-4">
                {[
                  {
                    icon: Instagram,
                    color: "hover:text-pink-400",
                    bg: "hover:bg-pink-400/10",
                  },
                  {
                    icon: Facebook,
                    color: "hover:text-blue-400",
                    bg: "hover:bg-blue-400/10",
                  },
                  {
                    icon: Twitter,
                    color: "hover:text-sky-400",
                    bg: "hover:bg-sky-400/10",
                  },
                ].map(({ icon: Icon, color, bg }, index) => (
                  <a
                    key={index}
                    href="#"
                    className={`w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center transition-all duration-300 ${color} ${bg} hover:scale-110 hover:shadow-lg`}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold mb-6 text-lg text-indigo-300">
                Quick Links
              </h4>
              <ul className="space-y-3">
                {[
                  "Beranda",
                  "Produk",
                  "Tentang Kami",
                  "Blog",
                  "FAQ",
                  "Kontak",
                ].map((link, index) => (
                  <li key={index}>
                    <a
                      href="#"
                      className="text-gray-300 hover:text-white transition-all duration-300 flex items-center group"
                    >
                      <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300" />
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="font-bold mb-6 text-lg text-purple-300">
                Kategori Produk
              </h4>
              <ul className="space-y-3">
                {[
                  { name: "Hijab Segiempat", badge: "Hot" },
                  { name: "Hijab Instant", badge: "New" },
                  { name: "Hijab Syari", badge: null },
                  { name: "Aksesoris Hijab", badge: "Sale" },
                  { name: "Gamis", badge: null },
                  { name: "Khimar", badge: null },
                ].map((item, index) => (
                  <li key={index}>
                    <a
                      href="#"
                      className="text-gray-300 hover:text-white transition-all duration-300 flex items-center group"
                    >
                      <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300" />
                      {item.name}
                      {item.badge && (
                        <span
                          className={`ml-2 px-2 py-1 text-xs rounded-full font-bold ${
                            item.badge === "Hot"
                              ? "bg-red-500 text-white"
                              : item.badge === "New"
                              ? "bg-green-500 text-white"
                              : "bg-yellow-500 text-black"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-bold mb-6 text-lg text-pink-300">
                Hubungi Kami
              </h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center group-hover:bg-indigo-600/40 transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm">hello@nonamarket.com</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-green-600/20 flex items-center justify-center group-hover:bg-green-600/40 transition-colors">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">Telepon</p>
                    <p className="text-sm">+62 812 3456 7890</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center group-hover:bg-green-500/40 transition-colors">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">WhatsApp</p>
                    <p className="text-sm">+62 812 3456 7890</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-red-600/20 flex items-center justify-center group-hover:bg-red-600/40 transition-colors">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">Alamat</p>
                    <p className="text-sm">Jakarta, Indonesia</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800">
          <div className="container mx-auto px-4 lg:px-6 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-gray-400 text-center md:text-left">
                &copy; 2025 Nona Market. All rights reserved. Made with
                <Heart className="w-4 h-4 text-red-500 mx-1 inline animate-pulse" />
                in Indonesia
              </p>
              <div className="flex space-x-6 text-sm text-gray-400">
                <a href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  Sitemap
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ModernFooter;
