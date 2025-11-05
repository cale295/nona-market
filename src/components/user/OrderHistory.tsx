import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingBag,
  Calendar,
  Eye,
  DollarSign,
  Clock,
  Check,
  X,
  Loader,
  Package,
  Star,
  Heart,
  CreditCard,
  MapPin,
  Truck,
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

interface OrderDetail {
  id_order_detail: number;
  id_order: string;
  id_produk: number;
  jumlah: number;
  harga_satuan: number;
  subtotal: number;
  products: Product;
}

interface Order {
  id_order: string;
  id_user: string;
  tanggal_order: string;
  total_harga: number;
  status: string;
  bukti_transfer?: string;
  order_detail: OrderDetail[];
}

const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);

  const formatPrice = (price: number): string => {
    return price.toLocaleString("id-ID");
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusDisplay = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return {
          color: "text-amber-600 bg-amber-100 border-amber-200",
          icon: <Clock className="w-4 h-4" />,
          text: "Menunggu Konfirmasi",
          bgGradient: "from-amber-50 to-yellow-50",
        };
      case "confirmed":
      case "approved":
        return {
          color: "text-blue-600 bg-blue-100 border-blue-200",
          icon: <Check className="w-4 h-4" />,
          text: "Dikonfirmasi",
          bgGradient: "from-blue-50 to-cyan-50",
        };
      case "processing":
        return {
          color: "text-purple-600 bg-purple-100 border-purple-200",
          icon: <Loader className="w-4 h-4" />,
          text: "Diproses",
          bgGradient: "from-purple-50 to-pink-50",
        };
      case "shipped":
        return {
          color: "text-indigo-600 bg-indigo-100 border-indigo-200",
          icon: <Truck className="w-4 h-4" />,
          text: "Dikirim",
          bgGradient: "from-indigo-50 to-blue-50",
        };
      case "delivered":
      case "completed":
        return {
          color: "text-green-600 bg-green-100 border-green-200",
          icon: <Check className="w-4 h-4" />,
          text: "Selesai",
          bgGradient: "from-green-50 to-emerald-50",
        };
      case "cancelled":
      case "rejected":
        return {
          color: "text-red-600 bg-red-100 border-red-200",
          icon: <X className="w-4 h-4" />,
          text: "Dibatalkan",
          bgGradient: "from-red-50 to-pink-50",
        };
      default:
        return {
          color: "text-gray-600 bg-gray-100 border-gray-200",
          icon: <Clock className="w-4 h-4" />,
          text: status,
          bgGradient: "from-gray-50 to-slate-50",
        };
    }
  };
  const getMainImageUrl = (images: string[]): string => {
    if (images.length > 0) return images[0];
    return "/placeholder.jpg"; // ganti dengan placeholder-mu
  }
  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    getCurrentUser();
  }, []);

  const fetchOrders = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          order_detail (
            *,
            products (
              id_produk,
              nama_produk,
              deskripsi,
              harga,
              gambar_produk,
              stok
            )
          )
        `
        )
        .eq("id_user", user.id)
        .order("tanggal_order", { ascending: false });

      if (error) throw error;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const safeData = (data || []).map((item: any) => {
        let safeImages: string[] = [];
        if (Array.isArray(item.products.gambar_produk)) {
          safeImages = item.products.gambar_produk;
        } else if (typeof item.products.gambar_produk === "string") {
          safeImages = [item.products.gambar_produk];
        }
        return {
          ...item,
          products: {
            ...item.products,
            gambar_produk: safeImages,
          },
        };
      });
      setOrders(safeData);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const toggleOrderDetails = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const getTotalItems = (orderDetails: OrderDetail[]): number => {
    return orderDetails.reduce((sum, detail) => sum + detail.jumlah, 0);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-20 h-20 bg-indigo-500 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-32 w-16 h-16 bg-purple-500 rounded-full animate-bounce"></div>
          <div className="absolute bottom-32 left-1/4 w-12 h-12 bg-pink-500 rounded-full animate-ping"></div>
        </div>

        <div className="text-center relative z-10 bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-white/20">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <ShoppingBag className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Silakan Masuk Terlebih Dahulu
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            Anda perlu masuk untuk melihat riwayat pesanan
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
          <p className="text-gray-600 font-medium">Memuat riwayat pesanan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 bg-indigo-500 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-purple-500 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-pink-500 rounded-full animate-ping"></div>
        <div className="absolute bottom-32 right-1/3 w-8 h-8 bg-indigo-500 rounded-full animate-pulse"></div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl py-8 relative z-10">
        {/* Header */}
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
                Riwayat Pesanan
              </h1>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center text-gray-600">
                  <ShoppingBag className="w-4 h-4 mr-1" />
                  <span className="text-sm">{orders.length} pesanan</span>
                </div>
                {orders.length > 0 && (
                  <div className="flex items-center text-green-600">
                    <Star className="w-4 h-4 mr-1" />
                    <span className="text-sm">Pelanggan setia</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="relative mx-auto w-32 h-32 mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
                <ShoppingBag className="w-16 h-16 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-pink-500 rounded-full animate-pulse"></div>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Belum Ada Pesanan
            </h2>
            <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
              Anda belum pernah melakukan pemesanan hijab. Yuk mulai berbelanja
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
          <div className="space-y-6">
            {orders.map((order, index) => {
              const statusDisplay = getStatusDisplay(order.status);
              const isExpanded = expandedOrders.has(order.id_order);

              return (
                <div
                  key={order.id_order}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01]"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="p-6">
                    {/* Order Header */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 space-y-4 md:space-y-0">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <ShoppingBag className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800 text-xl">
                            Order #{order.id_order.slice(-8).toUpperCase()}
                          </h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(order.tanggal_order)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div
                          className={`inline-flex items-center space-x-2 px-4 py-2 rounded-2xl text-sm font-bold border ${statusDisplay.color}`}
                        >
                          {statusDisplay.icon}
                          <span>{statusDisplay.text}</span>
                        </div>
                      </div>
                    </div>

                    {/* Order Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div
                        className={`bg-gradient-to-r ${statusDisplay.bgGradient} p-4 rounded-2xl shadow-inner`}
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-8 h-8 bg-white/80 rounded-xl flex items-center justify-center">
                            <Package className="w-4 h-4 text-gray-700" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            Total Items
                          </span>
                        </div>
                        <p className="font-bold text-xl text-gray-800">
                          {getTotalItems(order.order_detail)} produk
                        </p>
                      </div>

                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-2xl shadow-inner">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-8 h-8 bg-white/80 rounded-xl flex items-center justify-center">
                            <DollarSign className="w-4 h-4 text-gray-700" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            Total Harga
                          </span>
                        </div>
                        <p className="font-bold text-xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                          Rp. {formatPrice(order.total_harga)}
                        </p>
                      </div>

                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-2xl shadow-inner">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-8 h-8 bg-white/80 rounded-xl flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-gray-700" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            Status
                          </span>
                        </div>
                        <p className="font-bold text-xl text-gray-800">
                          {statusDisplay.text}
                        </p>
                      </div>
                    </div>

                    {/* View Details Button */}
                    <button
                      onClick={() => toggleOrderDetails(order.id_order)}
                      className="w-full bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100 text-gray-700 py-3 px-6 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center space-x-2 hover:shadow-md"
                    >
                      <Eye className="w-5 h-5" />
                      <span>
                        {isExpanded
                          ? "Sembunyikan Detail"
                          : "Lihat Detail Pesanan"}
                      </span>
                    </button>
                  </div>

                  {/* Order Details */}
                  {isExpanded && (
                    <div className="border-t border-white/30 bg-gradient-to-r from-white/50 to-white/30 backdrop-blur-sm">
                      <div className="p-6">
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <Package className="w-4 h-4 text-white" />
                          </div>
                          <h4 className="font-bold text-gray-800 text-lg">
                            Detail Produk Pesanan
                          </h4>
                        </div>

                        <div className="space-y-4">
                          {order.order_detail.map((detail, detailIndex) => (
                            <div
                              key={detail.id_order_detail}
                              className="flex items-center space-x-4 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40 hover:bg-white/80 transition-all duration-300"
                              style={{
                                animationDelay: `${detailIndex * 50}ms`,
                              }}
                            >
                              <div className="relative">
                                <img
                                  src={getMainImageUrl(detail.products.gambar_produk)}
                                  alt={detail.products.nama_produk}
                                  className="w-20 h-20 rounded-lg object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      "/placeholder.jpg";
                                  }}
                                />
                              </div>

                              <div className="flex-1">
                                <h5 className="font-bold text-gray-800 text-lg mb-1">
                                  {detail.products.nama_produk}
                                </h5>
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium">
                                    {detail.jumlah}x
                                  </span>
                                  <span>
                                    Rp. {formatPrice(detail.harga_satuan)}
                                  </span>
                                  <div className="flex items-center space-x-1 text-amber-500">
                                    <Star className="w-3 h-3 fill-current" />
                                    <span className="text-xs">4.8</span>
                                  </div>
                                </div>
                              </div>

                              <div className="text-right bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-3">
                                <p className="text-sm text-gray-600 mb-1">
                                  Subtotal:
                                </p>
                                <p className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                  Rp. {formatPrice(detail.subtotal)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Payment Proof */}
                        {order.bukti_transfer && (
                          <div className="mt-8 pt-6 border-t border-white/30">
                            <div className="flex items-center space-x-3 mb-4">
                              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                                <CreditCard className="w-4 h-4 text-white" />
                              </div>
                              <h5 className="font-bold text-gray-800 text-lg">
                                Bukti Transfer
                              </h5>
                            </div>
                            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/40">
                              <img
                                src={order.bukti_transfer}
                                alt="Bukti Transfer"
                                className="max-w-sm max-h-64 object-contain rounded-xl border border-gray-200 shadow-lg mx-auto"
                              />
                            </div>
                          </div>
                        )}

                        {/* Trust Indicators */}
                        <div className="flex items-center justify-center space-x-6 mt-6 pt-6 border-t border-white/30 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Heart className="w-4 h-4 text-pink-500" />
                            <span>Terima kasih atas kepercayaan Anda</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span>Produk berkualitas premium</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
