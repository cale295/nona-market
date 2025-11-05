import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingBasket,
  User,
  Menu,
  PackageSearch,
  Search,
  X,
  LogOut,
  Settings,
} from "lucide-react";
import { supabase } from "../../lib/supabase";

interface Product {
  id_produk: number;
  nama_produk: string;
  deskripsi?: string;
  harga: number;
  gambar_produk: string;
  stok?: number;
}

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleMenuToggle = () => {
    setIsOpen(!isOpen);
  };

  const formatPrice = (price: number): string => {
    return price.toLocaleString("id-ID");
  };

  // Search functionality
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .ilike("nama_produk", `%${query}%`)
        .limit(5);

      if (error) throw error;

      setSearchResults(data || []);
      setShowSearchResults(true);
    } catch (error) {
      console.error("Error searching products:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearchResults(false);
      setSearchQuery("");
    }
  };

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
    setShowSearchResults(false);
    setSearchQuery("");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowUserMenu(false);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsLoggedIn(!!session?.user);
      setUser(session?.user || null);
      if (session?.user) {
        const { data: profile } = await supabase
          .from("users")
          .select("role")
          .eq("id_user", session.user.id)
          .single();
        setRole(profile?.role || null);
      }
    };

    checkAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsLoggedIn(!!session?.user);
        setUser(session?.user || null);
      }
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".search-container")) {
        setShowSearchResults(false);
      }
      if (!target.closest(".user-menu-container")) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200/50 sticky w-full z-50 top-0 shadow-lg">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <img
                src="./logoitem.png"
                alt="Nona Market"
                className="w-10 h-10 md:w-12 md:h-12 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300"
              />
            </div>
            <div className="hidden md:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Nona Market
              </h1>
              <p className="text-xs text-gray-500 -mt-1">
                Premium Hijab Collection
              </p>
            </div>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="hidden md:block flex-1 max-w-xl mx-8 search-container relative">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari hijab impian Anda..."
              className="w-full bg-gradient-to-r from-gray-50 to-indigo-50 border-2 border-transparent focus:border-indigo-300 focus:from-white focus:to-white px-6 py-3 pl-12 pr-16 rounded-2xl transition-all duration-300 outline-none shadow-lg focus:shadow-xl text-gray-700 placeholder-gray-400"
              type="search"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            {isSearching && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            {searchQuery && !isSearching && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setShowSearchResults(false);
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </form>

          {/* Search Results Dropdown */}
          {showSearchResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-96 overflow-y-auto z-50">
              {searchResults.length > 0 ? (
                <>
                  <div className="p-4 border-b border-gray-100">
                    <p className="text-sm text-gray-500">
                      Ditemukan {searchResults.length} produk
                    </p>
                  </div>
                  {searchResults.map((product) => (
                    <div
                      key={product.id_produk}
                      onClick={() => handleProductClick(product.id_produk)}
                      className="flex items-center p-4 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 cursor-pointer transition-all duration-200 border-b border-gray-50 last:border-b-0"
                    >
                      <img
                        src={product.gambar_produk}
                        alt={product.nama_produk}
                        className="w-12 h-12 object-cover rounded-xl mr-4 shadow-sm"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 text-sm">
                          {product.nama_produk}
                        </h4>
                        <p className="text-indigo-600 font-bold text-sm">
                          Rp {formatPrice(product.harga)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="p-4 border-t border-gray-100">
                    <button
                      onClick={() =>
                        handleSearchSubmit({
                          preventDefault: () => {},
                        } as React.FormEvent)
                      }
                      className="w-full text-center text-indigo-600 hover:text-indigo-700 font-semibold text-sm py-2 hover:bg-indigo-50 rounded-xl transition-all"
                    >
                      Lihat semua hasil pencarian →
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">
                    Tidak ada produk yang ditemukan untuk "{searchQuery}"
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {isLoggedIn ? (
            <>
              <Link
                to="/cart"
                className="relative p-3 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 text-indigo-600 transition-all duration-300 group hover:shadow-lg"
              >
                <ShoppingBasket className="w-5 h-5" />
              </Link>

              <Link
                to="/orders"
                className="p-3 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 text-indigo-600 transition-all duration-300 hover:shadow-lg"
              >
                <PackageSearch className="w-5 h-5" />
              </Link>

              <div className="relative user-menu-container">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 p-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <User className="w-5 h-5" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-semibold text-gray-800 text-sm">
                      {user?.email?.split("@")[0] || "User"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {role === "admin" ? "Administrator" : "Premium Member"}
                    </p>
                    </div>
                    {role === "admin" && (
                  <Link
                    to="/admin"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 p-3 rounded-2xl bg-gradient-to-r from-yellow-100 to-yellow-50 hover:from-yellow-200 hover:to-yellow-100 transition-all duration-300 border border-yellow-300"
                  >
                    <Settings className="w-5 h-5 text-yellow-600" />
                    <span className="text-yellow-700 font-semibold">
                      Dashboard Admin
                    </span>
                  </Link>
                )}
                    <Link
                      to="/settings"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">Pengaturan</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 px-4 py-3 hover:bg-red-50 transition-colors w-full text-left border-t border-gray-100 mt-2"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-red-600">Keluar</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="px-6 py-3 text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
              >
                Masuk
              </Link>
              <Link
                to="/register"
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Daftar
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={handleMenuToggle}
            className="p-2 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 hover:from-indigo-100 hover:to-purple-100 transition-all duration-300"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200/50 shadow-lg">
          <div className="px-6 py-4 space-y-4">
            {/* 🔍 Search Bar di dalam Hamburger */}
            <div className="search-container pb-2">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari hijab impian Anda..."
                  className="w-full bg-gradient-to-r from-gray-50 to-indigo-50 border-2 border-transparent focus:border-indigo-300 focus:from-white focus:to-white px-4 py-3 pl-12 pr-12 rounded-2xl transition-all duration-300 outline-none shadow-lg focus:shadow-xl text-gray-700 placeholder-gray-400"
                  type="search"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setShowSearchResults(false);
                    }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </form>

              {/* Hasil pencarian */}
              {showSearchResults && (
                <div className="mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-80 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    searchResults.map((product) => (
                      <div
                        key={product.id_produk}
                        onClick={() => handleProductClick(product.id_produk)}
                        className="flex items-center p-3 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 cursor-pointer transition-all duration-200 border-b border-gray-50 last:border-b-0"
                      >
                        <img
                          src={product.gambar_produk}
                          alt={product.nama_produk}
                          className="w-10 h-10 object-cover rounded-lg mr-3 shadow-sm"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 text-sm">
                            {product.nama_produk}
                          </h4>
                          <p className="text-indigo-600 font-bold text-xs">
                            Rp {formatPrice(product.harga)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center">
                      <Search className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-500 text-sm">
                        Tidak ada produk yang ditemukan
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
            {isLoggedIn ? (
              <>
                <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      {user?.email?.split("@")[0] || "User"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {role === "admin" ? "Administrator" : "Premium Member"}
                    </p>
                  </div>
                </div>

                {role === "admin" && (
                  <Link
                    to="/admin"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 p-3 rounded-2xl bg-gradient-to-r from-yellow-100 to-yellow-50 hover:from-yellow-200 hover:to-yellow-100 transition-all duration-300 border border-yellow-300"
                  >
                    <Settings className="w-5 h-5 text-yellow-600" />
                    <span className="text-yellow-700 font-semibold">
                      Dashboard Admin
                    </span>
                  </Link>
                )}

                <Link
                  to="/cart"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 p-3 rounded-2xl hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300"
                >
                  <ShoppingBasket className="w-5 h-5 text-indigo-600" />
                  <span className="text-gray-700 font-medium">Keranjang</span>
                </Link>

                <Link
                  to="/orders"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 p-3 rounded-2xl hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300"
                >
                  <PackageSearch className="w-5 h-5 text-indigo-600" />
                  <span className="text-gray-700 font-medium">Pesanan</span>
                </Link>

                <Link
                  to="/settings"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 p-3 rounded-2xl hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300"
                >
                  <Settings className="w-5 h-5 text-indigo-600" />
                  <span className="text-gray-700 font-medium">Pengaturan</span>
                </Link>

                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="flex items-center space-x-3 p-3 rounded-2xl hover:bg-red-50 transition-all duration-300 w-full text-left"
                >
                  <LogOut className="w-5 h-5 text-red-500" />
                  <span className="text-red-600 font-medium">Keluar</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block p-3 text-center rounded-2xl border-2 border-indigo-600 text-indigo-600 font-semibold hover:bg-indigo-50 transition-all duration-300"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="block p-3 text-center rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
                >
                  Daftar Sekarang
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
