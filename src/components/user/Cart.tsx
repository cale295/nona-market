import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  ArrowLeft,
  CreditCard,
  Heart,
  Star,
  Check,
  Package,
} from "lucide-react";
import { supabase } from "../../lib/supabase";

interface Product {
  id_produk: number;
  nama_produk: string;
  deskripsi?: string;
  harga: number;
  gambar_produk: string[];
  stok: number;
}

interface CartItem {
  id_keranjang: number;
  id_user: string;
  id_produk: number;
  jumlah: number;
  created_at: string;
  updated_at: string;
  products: Product;
}

const Cart: React.FC = () => {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<Set<number>>(new Set());
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);

  const formatPrice = (price: number): string => {
    return price.toLocaleString("id-ID");
  };

  const getMainImageUrl = (images: string[]): string => {
    if (images.length > 0) return images[0];
    return "/placeholder.jpg";
  };

  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    getCurrentUser();
  }, []);

  const fetchCartItems = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("carts")
        .select(
          `
          *,
          products (
            id_produk,
            nama_produk,
            deskripsi,
            harga,
            gambar_produk,
            stok
          )
        `
        )
        .eq("id_user", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type SupabaseCartItem = {
        id_keranjang: number;
        id_user: string;
        id_produk: number;
        jumlah: number;
        created_at: string;
        updated_at: string;
        products: {
          id_produk: number;
          nama_produk: string;
          deskripsi?: string;
          harga: number;
          gambar_produk: string | string[];
          stok: number;
        };
      };

      const safeData: CartItem[] = (data as SupabaseCartItem[]).map((item) => {
        const product = Array.isArray(item.products)
          ? item.products[0]
          : item.products;

        const safeImages = Array.isArray(product.gambar_produk)
          ? product.gambar_produk
          : [product.gambar_produk];

        return {
          ...item,
          products: {
            ...product,
            gambar_produk: safeImages,
          },
        };
      });
      setCartItems(safeData);
    } catch (error) {
      console.error("Error fetching cart items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCartItems();
    }
  }, [user]);

  const handleSelectItem = (cartId: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(cartId)) {
      newSelected.delete(cartId);
    } else {
      newSelected.add(cartId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === cartItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cartItems.map((item) => item.id_keranjang)));
    }
  };

  const updateQuantity = async (cartId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    setUpdating((prev) => new Set(prev).add(cartId));

    try {
      const { error } = await supabase
        .from("carts")
        .update({
          jumlah: newQuantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id_keranjang", cartId);

      if (error) throw error;

      setCartItems((prev) =>
        prev.map((item) =>
          item.id_keranjang === cartId ? { ...item, jumlah: newQuantity } : item
        )
      );
    } catch (error) {
      console.error("Error updating quantity:", error);
    } finally {
      setUpdating((prev) => {
        const newSet = new Set(prev);
        newSet.delete(cartId);
        return newSet;
      });
    }
  };

  const removeItem = async (cartId: number) => {
    setUpdating((prev) => new Set(prev).add(cartId));

    try {
      const { error } = await supabase
        .from("carts")
        .delete()
        .eq("id_keranjang", cartId);

      if (error) throw error;

      setCartItems((prev) =>
        prev.filter((item) => item.id_keranjang !== cartId)
      );
      setSelectedItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(cartId);
        return newSet;
      });
    } catch (error) {
      console.error("Error removing item:", error);
    } finally {
      setUpdating((prev) => {
        const newSet = new Set(prev);
        newSet.delete(cartId);
        return newSet;
      });
    }
  };

  const handleCheckout = () => {
    if (selectedItems.size === 0) {
      return;
    }
    const selectedIdsArray = Array.from(selectedItems);
    navigate("/checkout", { state: { selectedCartIds: selectedIdsArray } });
  };

  const selectedItemsData = cartItems.filter((item) =>
    selectedItems.has(item.id_keranjang)
  );
  const totalItems = selectedItemsData.reduce(
    (sum, item) => sum + item.jumlah,
    0
  );
  const totalPrice = selectedItemsData.reduce(
    (sum, item) => sum + item.products.harga * item.jumlah,
    0
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-20 h-20 bg-indigo-500 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-32 w-16 h-16 bg-purple-500 rounded-full animate-bounce"></div>
          <div className="absolute bottom-32 left-1/4 w-12 h-12 bg-pink-500 rounded-full animate-ping"></div>
        </div>

        <div className="text-center relative z-10 bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-white/20">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <ShoppingCart className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Silakan Masuk Terlebih Dahulu
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            Anda perlu masuk untuk melihat keranjang belanja
          </p>
          <Link
            to="/login"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold hover:shadow-xl transform hover:scale-105 transition-all duration-300 inline-flex items-center space-x-2"
          >
            <span>Masuk Sekarang</span>
            <ArrowLeft className="w-5 h-5 rotate-180" />
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600 mx-auto mb-4"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-purple-200 rounded-full animate-ping mx-auto"></div>
          </div>
          <p className="text-gray-600 font-medium">
            Memuat keranjang belanja...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 bg-indigo-500 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-purple-500 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-pink-500 rounded-full animate-ping"></div>
        <div className="absolute bottom-32 right-1/3 w-8 h-8 bg-indigo-500 rounded-full animate-pulse"></div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl py-8 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="w-12 h-12 bg-white/80 backdrop-blur-sm hover:bg-white rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-lg border border-white/20"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Keranjang Belanja
              </h1>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center text-gray-600">
                  <Package className="w-4 h-4 mr-1" />
                  <span className="text-sm">{cartItems.length} produk</span>
                </div>
                {cartItems.length > 0 && (
                  <div className="flex items-center text-green-600">
                    <Check className="w-4 h-4 mr-1" />
                    <span className="text-sm">Siap checkout</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="relative mx-auto w-32 h-32 mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
                <ShoppingCart className="w-16 h-16 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-pink-500 rounded-full animate-pulse"></div>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Keranjang Masih Kosong
            </h2>
            <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
              Belum ada produk hijab pilihan Anda. Yuk mulai berbelanja
              sekarang!
            </p>
            <Link
              to="/"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold hover:shadow-xl transform hover:scale-105 transition-all duration-300 inline-flex items-center space-x-2"
            >
              <span>Mulai Belanja</span>
              <ArrowLeft className="w-5 h-5 rotate-180" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 flex items-center justify-between border border-white/20 shadow-lg">
                <label className="flex items-center space-x-4 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={
                        selectedItems.size === cartItems.length &&
                        cartItems.length > 0
                      }
                      onChange={handleSelectAll}
                      className="w-6 h-6 text-indigo-600 rounded-lg focus:ring-indigo-500 border-2 border-gray-300"
                    />
                    {selectedItems.size === cartItems.length &&
                      cartItems.length > 0 && (
                        <Check className="w-4 h-4 text-white opacity-0 absolute top-0.5 left-0.5 pointer-events-none" />
                      )}
                  </div>
                  <span className="font-bold text-gray-800 text-lg group-hover:text-indigo-600 transition-colors">
                    Pilih Semua ({cartItems.length})
                  </span>
                </label>
                {selectedItems.size > 0 && (
                  <button
                    onClick={() => {
                      selectedItems.forEach((cartId) => removeItem(cartId));
                    }}
                    className="text-red-500 hover:text-red-600 font-bold px-4 py-2 rounded-xl hover:bg-red-50 transition-all duration-300"
                  >
                    Hapus Terpilih
                  </button>
                )}
              </div>

              {cartItems.map((item, index) => (
                <div
                  key={item.id_keranjang}
                  className="w-full bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6">
                    <div className="relative self-end md:self-auto">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id_keranjang)}
                        onChange={() => handleSelectItem(item.id_keranjang)}
                        className="w-6 h-6 text-indigo-600 rounded-lg focus:ring-indigo-500 border-2 border-gray-300 mt-2"
                      />
                      {selectedItems.has(item.id_keranjang) && (
                        <Check className="w-4 h-4 text-white opacity-0 absolute top-2.5 left-0.5 pointer-events-none" />
                      )}
                    </div>
                    <div className="flex-shrink-0 relative">
                      <img
                        src={getMainImageUrl(item.products.gambar_produk)}
                        alt={item.products.nama_produk}
                        className="w-24 h-24 md:w-28 md:h-28 object-cover rounded-2xl shadow-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/placeholder.jpg";
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 text-xl mb-2 truncate">
                        {item.products.nama_produk}
                      </h3>
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {item.products.deskripsi ||
                          "Hijab berkualitas premium untuk muslimah Indonesia"}
                      </p>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center space-x-4">
                          <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Rp. {formatPrice(item.products.harga)}
                          </span>
                          <div className="flex items-center space-x-1 text-amber-500">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="text-sm font-medium">4.8</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-3 py-1 rounded-full">
                          <Package className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Stok: {item.products.stok}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-start md:items-end space-y-4 mt-4 md:mt-0">
                      <button
                        onClick={() => removeItem(item.id_keranjang)}
                        disabled={updating.has(item.id_keranjang)}
                        className="hidden md:block w-10 h-10 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 disabled:opacity-50"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <div className="flex items-center space-x-3 bg-gray-100 rounded-2xl px-4 py-3 shadow-inner">
                        <button
                          onClick={() =>
                            updateQuantity(item.id_keranjang, item.jumlah - 1)
                          }
                          disabled={
                            item.jumlah <= 1 || updating.has(item.id_keranjang)
                          }
                          className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-gray-600 hover:text-gray-800 hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-bold text-gray-800 min-w-[3rem] text-center text-lg">
                          {updating.has(item.id_keranjang)
                            ? "..."
                            : item.jumlah}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id_keranjang, item.jumlah + 1)
                          }
                          disabled={
                            item.jumlah >= item.products.stok ||
                            updating.has(item.id_keranjang)
                          }
                          className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-gray-600 hover:text-gray-800 hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-right bg-indigo-50 rounded-xl p-3 w-full md:w-auto">
                        <p className="text-sm text-gray-600 mb-1">Subtotal:</p>
                        <p className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                          Rp. {formatPrice(item.products.harga * item.jumlah)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="hidden lg:block lg:col-span-1">
                <div className="sticky top-8">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Ringkasan
                      </h2>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-gray-700 font-medium">
                          Total Item
                        </span>
                        <span className="font-bold text-indigo-600">
                          {totalItems}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-gray-700 font-medium">
                          Produk Terpilih
                        </span>
                        <span className="font-bold text-purple-600">
                          {selectedItems.size}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl px-4">
                        <span className="text-lg font-bold text-gray-800">
                          Total Harga
                        </span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                          Rp. {formatPrice(totalPrice)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 mb-6 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        <span>4.9/5 Rating</span>
                      </div>
                      <div className="flex items-center">
                        <Heart className="w-4 h-4 text-pink-500 mr-1" />
                        <span>Terpercaya</span>
                      </div>
                    </div>

                    <button
                      onClick={handleCheckout}
                      disabled={selectedItems.size === 0}
                      className={`w-full inline-flex items-center justify-center px-8 py-4 rounded-2xl font-bold text-white text-lg ${
                        selectedItems.size === 0
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-xl transform hover:scale-105"
                      } transition-all duration-300`}
                    >
                      <CreditCard className="mr-3 w-5 h-5" />
                      Checkout Sekarang
                    </button>

                    {selectedItems.size === 0 && (
                      <p className="text-center text-sm text-gray-500 mt-3">
                        Pilih produk untuk melanjutkan checkout
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t-2 border-indigo-200 shadow-2xl">
                <div className="px-4 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs text-gray-600">
                        Total ({selectedItems.size} item)
                      </p>
                      <p className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Rp. {formatPrice(totalPrice)}
                      </p>
                    </div>
                    <button
                      onClick={handleCheckout}
                      disabled={selectedItems.size === 0}
                      className={`inline-flex items-center justify-center px-6 py-3 rounded-xl font-bold text-white ${
                        selectedItems.size === 0
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg active:scale-95"
                      } transition-all duration-300`}
                    >
                      <CreditCard className="mr-2 w-4 h-4" />
                      Checkout
                    </button>
                  </div>
                  {selectedItems.size === 0 && (
                    <p className="text-center text-xs text-gray-500">
                      Pilih produk untuk checkout
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
