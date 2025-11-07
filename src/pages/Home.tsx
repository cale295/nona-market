import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  ArrowRight,
  Check,
  Loader2,
  Star,
  Heart,
  Sparkles,
  TrendingUp,
  Users,
  Shield,
  Truck,
  Award,
  Eye,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import Footer from "../components/common/Footer";
import { useNavigate } from "react-router-dom";

interface Product {
  id_produk: string;
  nama_produk: string;
  deskripsi?: string;
  harga: number;
  gambar_produk: string[];
  stok?: number;
}

const ModernHome: React.FC = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [displayCount, setDisplayCount] = useState(8);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [addingToCart, setAddingToCart] = useState<Set<string>>(new Set());
  const [addedToCart, setAddedToCart] = useState<Set<string>>(new Set());
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [togglingWishlist, setTogglingWishlist] = useState<Set<string>>(
    new Set()
  );

  const formatPrice = (price: number): string => {
    return price.toLocaleString("id-ID");
  };

  const carouselImages = [
    {
      src: "./carousel/1.webp",
      title: "Koleksi Hijab Terbaru",
      subtitle: "Tampil Elegan dengan Hijab Premium Quality",
      gradient: "from-indigo-600 via-purple-600 to-pink-500",
    },
    {
      src: "./carousel/2.png",
      title: "Sale Up to 50%",
      subtitle: "Dapatkan Hijab Favorit dengan Harga Spesial",
      gradient: "from-pink-500 via-red-500 to-orange-500",
    },
    {
      src: "./carousel/3.png",
      title: "New Arrival",
      subtitle: "Hijab Motif Eksklusif untuk Gaya Istimewa",
      gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    },
  ];

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fetchUserAndWishlist = async (sessionUser: any) => {
      if (sessionUser) {
        setUser(sessionUser);
        const { data, error } = await supabase
          .from("wishlist")
          .select("id_produk")
          .eq("id_user", sessionUser.id);

        if (data) {
          const wishlistProductIds = new Set(
            data.map((item) => item.id_produk)
          );
          setWishlist(wishlistProductIds);
        } else {
          console.error("Error fetching wishlist:", error?.message);
        }
      } else {
        setUser(null);
        setWishlist(new Set());
      }
    };

    const getCurrentData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      await fetchUserAndWishlist(session?.user || null);
    };

    getCurrentData();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        await fetchUserAndWishlist(session?.user || null);
      }
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from("products").select("*");

      if (error) {
        console.error("Error fetching products:", error.message);
      } else {
        const safeData: Product[] = data.map((p) => {
          let images: string[] = [];
          if (Array.isArray(p.gambar_produk)) {
            images = p.gambar_produk;
          } else if (typeof p.gambar_produk === "string") {
            images = [p.gambar_produk];
          }
          return { ...p, gambar_produk: images };
        });

        setAllProducts(safeData);
        setFeaturedProducts(safeData.slice(0, displayCount));
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    setFeaturedProducts(allProducts.slice(0, displayCount));
  }, [allProducts, displayCount]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const loadMoreProducts = () => {
    const newDisplayCount = displayCount + 8;
    setDisplayCount(newDisplayCount);
  };

  const hasMoreProducts = displayCount < allProducts.length;

  const viewProductDetail = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const getMainImageUrl = (images: string[]): string => {
    if (images.length > 0) return images[0];
    return "./placeholder.png";
  };

  const addToCart = async (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user) {
      alert(
        "Silakan login terlebih dahulu untuk menambahkan produk ke keranjang"
      );
      return;
    }

    setAddingToCart((prev) => new Set(prev).add(productId));

    try {
      const { data: existingItem, error: checkError } = await supabase
        .from("carts")
        .select("*")
        .eq("id_user", user.id)
        .eq("id_produk", productId)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      if (existingItem) {
        const { error: updateError } = await supabase
          .from("carts")
          .update({
            jumlah: existingItem.jumlah + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("id_keranjang", existingItem.id_keranjang);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from("carts").insert({
          id_user: user.id,
          id_produk: productId,
          jumlah: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (insertError) throw insertError;
      }

      setAddedToCart((prev) => new Set(prev).add(productId));
      setTimeout(() => {
        setAddedToCart((prev) => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Gagal menambahkan produk ke keranjang. Silakan coba lagi.");
    } finally {
      setAddingToCart((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const toggleWishlist = async (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user) {
      alert("Silakan login terlebih dahulu untuk menyimpan wishlist");
      return;
    }

    setTogglingWishlist((prev) => new Set(prev).add(productId));

    const isWishlisted = wishlist.has(productId);

    try {
      if (isWishlisted) {
        const { error } = await supabase
          .from("wishlist")
          .delete()
          .eq("id_user", user.id)
          .eq("id_produk", productId);

        if (error) throw error;

        setWishlist((prev) => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
      } else {
        const { error } = await supabase.from("wishlist").insert({
          id_user: user.id,
          id_produk: productId,
          created_at: new Date().toISOString(),
        });

        if (error) throw error;

        setWishlist((prev) => new Set(prev).add(productId));
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      alert("Gagal memperbarui wishlist. Silakan coba lagi.");
    } finally {
      setTogglingWishlist((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const getButtonContent = (productId: string) => {
    if (addingToCart.has(productId)) {
      return (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Adding...</span>
        </>
      );
    }

    if (addedToCart.has(productId)) {
      return (
        <>
          <Check className="w-4 h-4" />
          <span>Added!</span>
        </>
      );
    }

    return (
      <>
        <ShoppingBag className="w-4 h-4" />
        <span>Add to Cart</span>
      </>
    );
  };

  const getButtonStyle = (productId: string) => {
    if (addedToCart.has(productId)) {
      return "w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-2xl font-bold hover:from-green-600 hover:to-emerald-700 hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg";
    }

    return "w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-2xl font-bold hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      <section className="relative h-[500px] lg:h-[600px] overflow-hidden">
        <div className="absolute inset-0 opacity-10 z-10">
          <div className="absolute top-20 left-20 w-20 h-20 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-32 w-16 h-16 bg-white rounded-full animate-bounce"></div>
          <div className="absolute bottom-32 left-1/4 w-12 h-12 bg-white rounded-full animate-ping"></div>
        </div>

        {carouselImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentSlide
                ? "opacity-100 scale-100"
                : "opacity-0 scale-105"
            }`}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${image.gradient} opacity-20 z-10`}
            ></div>
            <img
              src={image.src}
              alt={image.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="container mx-auto px-6 text-center">
                <div className="max-w-4xl mx-auto text-white">
                  <div className="flex items-center justify-center mb-6">
                    <Sparkles className="w-8 h-8 text-yellow-300 mr-3 animate-pulse" />
                    <span className="text-lg font-semibold bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                      Nona Market Premium
                    </span>
                  </div>
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                    {image.title}
                  </h1>
                  <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-2xl mx-auto">
                    {image.subtitle}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex space-x-3">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`transition-all duration-300 ${
                index === currentSlide
                  ? "w-8 h-3 bg-white rounded-full"
                  : "w-3 h-3 bg-white/50 rounded-full hover:bg-white/75"
              }`}
            />
          ))}
        </div>
      </section>

      <section className="py-16 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 opacity-50"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Users,
                number: "10,000+",
                label: "Happy Customers",
                color: "text-indigo-600",
              },
              {
                icon: Star,
                number: "4.9/5",
                label: "Customer Rating",
                color: "text-yellow-500",
              },
              {
                icon: Shield,
                number: "100%",
                label: "Original Products",
                color: "text-green-600",
              },
              {
                icon: Truck,
                number: "24/7",
                label: "Fast Delivery",
                color: "text-purple-600",
              },
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <div
                  className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                >
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {stat.number}
                </h3>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 opacity-5"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <Heart className="w-8 h-8 text-pink-500 mr-3 animate-pulse" />
              <span className="text-lg font-semibold text-indigo-600 bg-indigo-100 px-4 py-2 rounded-full">
                Welcome to Nona Market
              </span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Destinasi Hijab Premium Indonesia
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
              Koleksi hijab berkualitas tinggi dengan desain modern dan bahan
              terbaik. Kami menghadirkan lebih dari sekadar fashion - kami
              menghadirkan kepercayaan diri untuk muslimah Indonesia yang
              istimewa.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <TrendingUp className="w-8 h-8 text-indigo-600 mr-3" />
              <span className="text-lg font-semibold text-indigo-600 bg-indigo-100 px-4 py-2 rounded-full">
                Produk Unggulan
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
              Koleksi Terfavorit
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Pilihan terbaik dari koleksi kami dengan kualitas premium dan
              harga terjangkau
            </p>
          </div>

          {allProducts.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                <ShoppingBag className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-xl text-gray-500">
                Tidak ada produk yang tersedia saat ini.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {featuredProducts.map((product) => {
                  const isWishlisted = wishlist.has(product.id_produk);
                  const isToggling = togglingWishlist.has(product.id_produk);

                  return (
                    <div
                      key={product.id_produk}
                      onClick={() => viewProductDetail(product.id_produk)}
                      className="group bg-white rounded-3xl shadow-lg transition-all duration-500 overflow-hidden border border-gray-100 relative cursor-pointer hover:shadow-2xl"
                    >
                      <div className="absolute top-4 left-4 z-10">
                        <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                          Premium
                        </span>
                      </div>

                      <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button className="bg-white/90 backdrop-blur-sm p-2.5 rounded-full hover:bg-white shadow-lg">
                          <Eye className="w-5 h-5 text-indigo-600" />
                        </button>
                      </div>

                      <div className="relative overflow-hidden">
                        <img
                          src={getMainImageUrl(product.gambar_produk)}
                          alt={product.nama_produk}
                          className="w-full h-48 sm:h-56 md:h-64 lg:h-72 object-cover group-hover:scale-110 transition-transform duration-700"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "./placeholder.png";
                          }}
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        {product.stok !== undefined && product.stok <= 0 && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                            <span className="text-white font-bold text-lg bg-red-500 px-4 py-2 rounded-full">
                              Stok Habis
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-bold text-lg text-gray-800 line-clamp-1 group-hover:text-indigo-600 transition-colors max-w-[90%]">
                            {product.nama_produk}
                          </h3>

                          <Heart
                            className={`w-5 h-5 cursor-pointer transition-all ${
                              isToggling
                                ? "text-gray-400 animate-spin"
                                : isWishlisted
                                ? "text-red-500 fill-red-500"
                                : "text-gray-400 hover:text-red-500"
                            }`}
                            onClick={(e) =>
                              toggleWishlist(product.id_produk, e)
                            }
                          />
                        </div>

                        <p className="text-gray-600 mb-10 line-clamp-2 text-sm leading-relaxed">
                          {product.deskripsi || "Deskripsi tidak tersedia"}
                        </p>

                        <div className="flex items-center justify-between mb-4">
                          <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Rp {formatPrice(product.harga)}
                          </span>
                          {product.stok !== undefined && (
                            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                              Stok: {product.stok}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={(e) => addToCart(product.id_produk, e)}
                          disabled={
                            addingToCart.has(product.id_produk) ||
                            (product.stok !== undefined && product.stok <= 0)
                          }
                          className={getButtonStyle(product.id_produk)}
                        >
                          {getButtonContent(product.id_produk)}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-center mt-16">
                {hasMoreProducts ? (
                  <button
                    onClick={loadMoreProducts}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-3 mx-auto shadow-lg group"
                  >
                    <span>Muat Lebih Banyak</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : allProducts.length > 8 ? (
                  <div className="bg-gradient-to-r from-green-100 to-emerald-100 px-6 py-4 rounded-2xl inline-block">
                    <span className="text-green-800 font-semibold">
                      ✨ Menampilkan semua {allProducts.length} produk terbaik
                      kami
                    </span>
                  </div>
                ) : null}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full animate-bounce"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <Award className="w-8 h-8 text-indigo-600 mr-3" />
              <span className="text-lg font-semibold text-indigo-600 bg-white px-4 py-2 rounded-full shadow-sm">
                Mengapa Memilih Kami
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
              Komitmen Kami untuk Anda
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Kualitas Terjamin",
                description:
                  "Setiap produk telah melalui quality control ketat untuk memastikan kualitas terbaik",
                color: "from-green-400 to-emerald-500",
              },
              {
                icon: Heart,
                title: "Pelayanan Tulus",
                description:
                  "Tim customer service yang ramah dan siap membantu Anda 24/7",
                color: "from-pink-400 to-rose-500",
              },
              {
                icon: Truck,
                title: "Pengiriman Cepat",
                description:
                  "Pengiriman express ke seluruh Indonesia dengan packaging yang aman",
                color: "from-blue-400 to-cyan-500",
              },
            ].map((feature, index) => (
              <div key={index} className="text-center group">
                <div
                  className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}
                >
                  <feature.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default ModernHome;
