import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  Heart,
  Shield,
  Truck,
  ArrowLeft,
  Check,
  Loader2,
  Star,
  Package,
  Clock,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

interface Product {
  id_produk: string;
  nama_produk: string;
  deskripsi?: string;
  harga: number;
  gambar_produk: string[];
  stok?: number;
}

interface ViewProductProps {
  productId?: string;
  onBack?: () => void;
}

export const ViewProduct: React.FC<ViewProductProps> = ({
  productId: propProductId,
  onBack,
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(false);

  const formatPrice = (price: number): string => {
    return price.toLocaleString("id-ID");
  };

  const productId = propProductId || id;

  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id_produk", productId)
          .single();

        if (error) throw error;
        let safeImages: string[] = [];
        if (Array.isArray(data.gambar_produk)) {
          safeImages = data.gambar_produk;
        } else if (typeof data.gambar_produk === "string") {
          safeImages = [data.gambar_produk];
        }

        setProduct({
          ...data,
          gambar_produk: safeImages,
        });
        setSelectedImage(0);
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  useEffect(() => {
    const checkWishlist = async () => {
      if (!user || !product) {
        setIsWishlisted(false);
        return;
      }

      setTogglingWishlist(true);
      try {
        const { data, error } = await supabase
          .from("wishlist")
          .select("id_wishlist")
          .eq("id_user", user.id)
          .eq("id_produk", product.id_produk)
          .single();

        if (data && !error) {
          setIsWishlisted(true);
        } else {
          setIsWishlisted(false);
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        setIsWishlisted(false);
      } finally {
        setTogglingWishlist(false); // Selesai loading
      }
    };

    checkWishlist();
  }, [user, product]);
  // ------------------------------------------

  const handleQuantityChange = (value: number) => {
    if (product?.stok !== undefined) {
      setQuantity(Math.max(1, Math.min(value, product.stok)));
    } else {
      setQuantity(Math.max(1, value));
    }
  };

  const addToCart = async () => {
    if (!user) {
      alert(
        "Silakan login terlebih dahulu untuk menambahkan produk ke keranjang"
      );
      return;
    }

    if (!product) return;

    setAddingToCart(true);

    try {
      const { data: existingItem, error: checkError } = await supabase
        .from("carts")
        .select("*")
        .eq("id_user", user.id)
        .eq("id_produk", product.id_produk)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      if (existingItem) {
        const { error: updateError } = await supabase
          .from("carts")
          .update({
            jumlah: existingItem.jumlah + quantity,
            updated_at: new Date().toISOString(),
          })
          .eq("id_keranjang", existingItem.id_keranjang);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from("carts").insert({
          id_user: user.id,
          id_produk: product.id_produk,
          jumlah: quantity,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (insertError) throw insertError;
      }

      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Gagal menambahkan produk ke keranjang. Silakan coba lagi.");
    } finally {
      setAddingToCart(false);
    }
  };

  const buyNow = async () => {
    if (!user) {
      alert("Silakan login terlebih dahulu");
      return;
    }

    if (!product) return;

    setAddingToCart(true);

    try {
      const { data: existingItem, error: checkError } = await supabase
        .from("carts")
        .select("*")
        .eq("id_user", user.id)
        .eq("id_produk", product.id_produk)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      let cartId;

      if (existingItem) {
        const { error: updateError } = await supabase
          .from("carts")
          .update({
            jumlah: existingItem.jumlah + quantity,
            updated_at: new Date().toISOString(),
          })
          .eq("id_keranjang", existingItem.id_keranjang);

        if (updateError) throw updateError;
        cartId = existingItem.id_keranjang;
      } else {
        const { data: newItem, error: insertError } = await supabase
          .from("carts")
          .insert({
            id_user: user.id,
            id_produk: product.id_produk,
            jumlah: quantity,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (insertError) throw insertError;
        if (newItem) {
          cartId = newItem.id_keranjang;
        }
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
      setAddingToCart(false);
    }
  };

  const toggleWishlist = async () => {
    if (!user) {
      alert("Silakan login terlebih dahulu untuk menyimpan wishlist");
      return;
    }
    if (!product) return;

    setTogglingWishlist(true);

    try {
      if (isWishlisted) {
        const { error } = await supabase
          .from("wishlist")
          .delete()
          .eq("id_user", user.id)
          .eq("id_produk", product.id_produk);

        if (error) throw error;
        setIsWishlisted(false);
      } else {
        const { error } = await supabase.from("wishlist").insert({
          id_user: user.id,
          id_produk: product.id_produk,
          created_at: new Date().toISOString(),
        });

        if (error) throw error;
        setIsWishlisted(true);
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      alert("Gagal memperbarui wishlist. Silakan coba lagi.");
    } finally {
      setTogglingWishlist(false);
    }
  };
  // ------------------------------------

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate("/");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Memuat produk...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-xl mb-6">Produk tidak ditemukan</p>
          <button
            onClick={handleBack}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  const productImages =
    product.gambar_produk.length > 0
      ? product.gambar_produk
      : ["./placeholder.png"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6 py-12">
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 mb-8 font-semibold group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Kembali ke Beranda</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-3xl shadow-xl p-8 lg:p-12">
          <div className="flex flex-col gap-5">
            <div className="relative overflow-hidden rounded-2xl bg-gray-100 aspect-square shadow-lg">
              <img
                src={productImages[selectedImage]}
                alt={product.nama_produk}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "./placeholder.png";
                }}
              />

              <button
                onClick={toggleWishlist}
                disabled={togglingWishlist}
                className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-full hover:bg-white transition-colors shadow-lg disabled:opacity-50"
              >
                <Heart
                  className={`w-6 h-6 transition-all ${
                    togglingWishlist
                      ? "text-gray-400 animate-spin"
                      : isWishlisted
                      ? "text-red-500 fill-red-500"
                      : "text-gray-600 hover:text-red-500"
                  }`}
                />
              </button>
            </div>

            {productImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto p-2">
                {productImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 relative overflow-hidden rounded-lg w-24 h-24 transition-all ${
                      selectedImage === index
                        ? "ring-4 ring-indigo-600 scale-105"
                        : "ring-2 ring-gray-200 hover:ring-indigo-300"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "./placeholder.png";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <div className="mb-6">
              <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg inline-block mb-4">
                Premium Quality
              </span>
              <h1 className="text-3xl lg:text-4xl font-bold mb-4 text-gray-800 leading-tight">
                {product.nama_produk}
              </h1>
              <div className="flex items-center mb-6">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <span className="text-gray-600 ml-3 font-medium">
                  (4.9 dari 250 ulasan)
                </span>
              </div>
            </div>

            <div className="space-y-4 mb-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6">
              <div className="flex items-start space-x-4">
                <div className="bg-white p-2.5 rounded-xl shadow-sm">
                  <Truck className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">
                    Pengiriman Cepat
                  </h3>
                  <p className="text-sm text-gray-600">
                    Garansi tiba: 19 – 20 Oktober
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Dapatkan voucher s/d Rp10.000 jika pesanan terlambat
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-white p-2.5 rounded-xl shadow-sm">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">
                    Jaminan Nona
                  </h3>
                  <p className="text-sm text-gray-600">
                    Bebas Pengembalian • Proteksi Kerusakan
                  </p>
                </div>
              </div>

              {product.stok !== undefined && (
                <div className="flex items-start space-x-4">
                  <div className="bg-white p-2.5 rounded-xl shadow-sm">
                    <Package className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">
                      Ketersediaan Stok
                    </h3>
                    <p className="text-sm text-gray-600">
                      {product.stok > 0 ? (
                        <span className="text-green-600 font-semibold">
                          {product.stok} unit tersedia
                        </span>
                      ) : (
                        <span className="text-red-600 font-semibold">
                          Stok habis
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 my-6" />

            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Harga</h2>
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 mb-6 shadow-lg">
                <p className="text-white text-4xl font-bold">
                  Rp {formatPrice(product.harga)}
                </p>
                <p className="text-indigo-100 text-sm mt-2">Harga per unit</p>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3">
                  Jumlah
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold w-12 h-12 rounded-xl transition-colors"
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={product.stok}
                    value={quantity}
                    onChange={(e) =>
                      handleQuantityChange(parseInt(e.target.value) || 1)
                    }
                    className="border-2 border-gray-200 rounded-xl w-24 h-12 text-center font-semibold text-lg focus:border-indigo-600 focus:outline-none"
                  />
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold w-12 h-12 rounded-xl transition-colors"
                    disabled={
                      product.stok !== undefined && quantity >= product.stok
                    }
                  >
                    +
                  </button>
                  {product.stok !== undefined && (
                    <span className="text-sm text-gray-500">
                      Maks. {product.stok}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={buyNow}
                  disabled={
                    (product.stok !== undefined && product.stok <= 0) ||
                    addingToCart
                  }
                  className="flex-1 border-2 border-indigo-600 bg-white text-indigo-600 py-4 rounded-2xl font-bold hover:bg-indigo-50 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
                >
                  {addingToCart ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <span>Beli Sekarang</span>
                  )}
                </button>
                <button
                  onClick={addToCart}
                  disabled={
                    addingToCart ||
                    (product.stok !== undefined && product.stok <= 0)
                  }
                  className={`flex-1 py-4 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                    addedToCart
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
                  }`}
                >
                  {addingToCart ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Menambahkan...</span>
                    </>
                  ) : addedToCart ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Ditambahkan!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5" />
                      <span>Masukkan Keranjang</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 my-8" />
        <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-xl">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Deskripsi Produk
            </h2>
          </div>
          <div className="prose max-w-none">
            <p className="text-gray-700 text-base leading-relaxed whitespace-pre-line">
              {product.deskripsi || "Deskripsi tidak tersedia"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
