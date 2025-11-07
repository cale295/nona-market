import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  Trash2,
  Loader,
  ShoppingCart,
  Package,
  Calendar,
  ArrowLeft,
} from "lucide-react";

type Product = {
  id_produk: string;
  nama_produk: string;
  deskripsi: string;
  stok: number;
  harga: number;
  gambar_produk: string[];
};

type Wishlist = {
  id_wishlist: string;
  id_user: string;
  id_produk: string;
  created_at: string;
  products?: Product;
};

const Wishlist: React.FC = () => {
  const [wishlistItems, setWishlistItems] = useState<Wishlist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [buyingProductId, setBuyingProductId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Error getting session:", sessionError.message);
        return;
      }

      if (session?.user) {
        setUserId(session.user.id);
      } else {
        console.log("No user logged in");
      }
    };

    getCurrentUser();
  }, []);

  const fetchWishlist = async () => {
    if (!userId) {
      console.log("Waiting for user ID...");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("wishlist")
        .select(
          `
          id_wishlist,
          id_user,
          id_produk,
          created_at,
          products (
            id_produk,
            nama_produk,
            deskripsi,
            stok,
            harga,
            gambar_produk
          )
        `
        )
        .eq("id_user", userId)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const safeData: Wishlist[] = data.map((item: any) => {
            let images: string[] = [];
            if (item.products?.gambar_produk) {
              if (Array.isArray(item.products.gambar_produk)) {
                images = item.products.gambar_produk;
              } else if (typeof item.products.gambar_produk === "string") {
                images = [item.products.gambar_produk];
              }
            }
            return {
              ...item,
              products: item.products
                ? {
                    ...item.products,
                    gambar_produk: images,
                  }
                : undefined,
            };
          })
          .filter((item) => item.products);

        setWishlistItems(safeData);
      }
    } catch (err) {
      console.error("Error fetching wishlist:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [userId]);

  const handleRemoveFromWishlist = async (id_wishlist: string) => {
    if (!confirm("Hapus produk dari wishlist?")) return;
    try {
      const { error } = await supabase
        .from("wishlist")
        .delete()
        .eq("id_wishlist", id_wishlist);

      if (!error) {
        fetchWishlist();
      } else {
        alert("Gagal menghapus dari wishlist");
      }
    } catch (err) {
      console.error("Error removing from wishlist:", err);
      alert("Gagal menghapus dari wishlist");
    }
  };
  const handleBuyNow = async (product: Product) => {
    if (!userId) {
      alert("Silakan login untuk membeli");
      return;
    }

    setBuyingProductId(product.id_produk);

    try {
      const { data: existingItem, error: checkError } = await supabase
        .from("carts")
        .select("id_keranjang")
        .eq("id_user", userId)
        .eq("id_produk", product.id_produk)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      let cartId: string;

      if (existingItem) {
        const { error: updateError } = await supabase
          .from("carts")
          .update({
            jumlah: 1,
            updated_at: new Date().toISOString(),
          })
          .eq("id_keranjang", existingItem.id_keranjang);

        if (updateError) throw updateError;
        cartId = existingItem.id_keranjang;
      } else {
        const { data: newItem, error: insertError } = await supabase
          .from("carts")
          .insert({
            id_user: userId,
            id_produk: product.id_produk,
            jumlah: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select("id_keranjang")
          .single();

        if (insertError) throw insertError;
        cartId = newItem.id_keranjang;
      }
      navigate("/checkout", {
        state: {
          selectedCartIds: [cartId],
        },
      });
    } catch (error) {
      console.error("Error processing buy now:", error);
      alert("Gagal memproses pesanan. Silakan coba lagi.");
    } finally {
      setBuyingProductId(null);
    }
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-red-100 px-4 ">
      <div className="container mx-auto px-4 py-8">
        <div className="relative overflow-hidden">
          <div className="relative z-10 p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  to="/"
                  className="w-12 h-12 bg-white/80 backdrop-blur-sm hover:bg-white rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-lg border border-white/20"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-700" />
                </Link>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Wishlist Saya
                  </h1>
                  <p className="text-gray-600">
                    {wishlistItems.length} produk yang Anda sukai
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          {isLoading && wishlistItems.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <Loader className="w-8 h-8 text-rose-500 animate-spin" />
              <span className="ml-2 text-gray-600">Memuat wishlist...</span>
            </div>
          ) : !userId && !isLoading ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-100 rounded-full mb-4">
                <Heart className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Silakan Login
              </h3>
              <p className="text-gray-600 mb-6">
                Anda harus login untuk melihat wishlist Anda.
              </p>
            </div>
          ) : wishlistItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-100 rounded-full mb-4">
                <Heart className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Wishlist Kosong
              </h3>
              <p className="text-gray-600 mb-6">
                Belum ada produk yang Anda simpan di wishlist
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map((item, index) => {
                const product = item.products;
                if (!product) return null;
                const isBuying = buyingProductId === product.id_produk;

                return (
                  <div
                    key={item.id_wishlist}
                    className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all overflow-hidden group"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={
                          (product.gambar_produk && product.gambar_produk[0]) ||
                          "./placeholder.png"
                        }
                        alt={product.nama_produk}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) =>
                          ((e.target as HTMLImageElement).src =
                            "./placeholder.png")
                        }
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      <button
                        onClick={() =>
                          handleRemoveFromWishlist(item.id_wishlist)
                        }
                        className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-lg hover:bg-rose-50 transition-all duration-200 group/btn"
                      >
                        <Heart className="w-5 h-5 text-rose-500 fill-rose-500 group-hover/btn:scale-110 transition-transform" />
                      </button>

                      {product.gambar_produk &&
                        product.gambar_produk.length > 1 && (
                          <div className="absolute top-3 left-3 bg-white px-2 py-1 rounded-full text-xs font-medium text-gray-700 shadow-lg">
                            +{product.gambar_produk.length - 1}
                          </div>
                        )}
                    </div>

                    <div className="p-6">
                      <div className="mb-4">
                        <h2 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">
                          {product.nama_produk}
                        </h2>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {product.deskripsi}
                        </p>

                        <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>Ditambahkan {formatDate(item.created_at)}</span>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              Stok: {product.stok}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 px-3 py-1 bg-rose-50 text-rose-700 rounded-full">
                            <span className="text-sm font-bold">
                              Rp {product.harga.toLocaleString("id-ID")}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleBuyNow(product)}
                          disabled={isBuying}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-75 disabled:cursor-not-allowed"
                        >
                          {isBuying ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <ShoppingCart className="w-4 h-4" />
                          )}
                          <span className="text-sm font-medium">
                            {isBuying ? "Memproses..." : "Beli"}
                          </span>
                        </button>
                        <button
                          onClick={() =>
                            handleRemoveFromWishlist(item.id_wishlist)
                          }
                          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
