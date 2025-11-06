/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  Check,
  Loader2,
  ShoppingCart,
  CreditCard,
  Star,
  Package,
  Shield,
  Clock,
  AlertCircle,
  X,
  Image as ImageIcon,
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

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedCartIds = location.state?.selectedCartIds || [];
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  const formatPrice = (price: number): string => {
    return price.toLocaleString("id-ID");
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

  const fetchCartItems = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
  .from("carts")
  .select(`
    *,
    products (
      id_produk,
      nama_produk,
      deskripsi,
      harga,
      gambar_produk,
      stok
    )
  `)
  .in("id_keranjang", selectedCartIds)
  .eq("id_user", user.id)
  .order("created_at", { ascending: false });

if (error) throw error;

// Define a better type for the Supabase response
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
    gambar_produk: string[] | string;
    stok: number;
  };
};

const safeData: CartItem[] = (data as SupabaseCartItem[]).map((item) => {
  const safeImages =
    Array.isArray(item.products.gambar_produk)
      ? item.products.gambar_produk
      : [item.products.gambar_produk];

  return {
    ...item,
    products: {
      ...item.products,
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

  const handleFileChange = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setPaymentProof(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Harap upload file gambar (JPG, PNG, dll.)");
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const uploadPaymentProof = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user?.id}_${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from("bukti")
        .upload(fileName, file);

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("bukti").getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading payment proof:", error);
      return null;
    }
  };

  const handleSubmitOrder = async () => {
    if (!paymentProof) {
      alert("Harap upload bukti pembayaran");
      return;
    }

    if (cartItems.length === 0) {
      alert("Tidak ada item di keranjang");
      return;
    }

    setSubmitting(true);

    try {
      const buktiUrl = await uploadPaymentProof(paymentProof);
      if (!buktiUrl) {
        throw new Error("Gagal upload bukti pembayaran");
      }

      const totalHarga = cartItems.reduce(
        (sum, item) => sum + item.products.harga * item.jumlah,
        0
      );
      
      const orderData = {
        id_user: user?.id,
        tanggal_order: new Date().toISOString(),
        total_harga: totalHarga,
        status: "pending",
        bukti_transfer: buktiUrl,
      };

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;

      const orderDetails = cartItems.map((item) => ({
        id_order: order.id_order,
        id_produk: item.id_produk,
        jumlah: item.jumlah,
        harga_satuan: item.products.harga,
        subtotal: item.products.harga * item.jumlah,
      }));

      const { error: detailError } = await supabase
        .from("order_detail")
        .insert(orderDetails);

      if (detailError) throw detailError;

      const { error: cartError } = await supabase
        .from("carts")
        .delete()
        .eq("id_user", user?.id)
        .in("id_keranjang", selectedCartIds);

      if (cartError) throw cartError;

      navigate("/order-success", {
        state: {
          orderId: order.id_order,
          orderData: {
            id_order: order.id_order,
            total_harga: totalHarga,
            tanggal_order: order.tanggal_order,
            status: order.status,
            items: cartItems.map((item) => ({
              nama_produk: item.products.nama_produk,
              jumlah: item.jumlah,
              harga: item.products.harga,
              subtotal: item.products.harga * item.jumlah,
            })),
          },
        },
      });
    } catch (error) {
      console.error("Error submitting order:", error);
      alert("Gagal submit pesanan. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.jumlah, 0);
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.products.harga * item.jumlah,
    0
  );

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
            <ShoppingCart className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Silakan Masuk Terlebih Dahulu
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            Anda perlu masuk untuk melakukan checkout
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
          <p className="text-gray-600 font-medium">Memuat data checkout...</p>
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
              to="/cart"
              className="w-12 h-12 bg-white/80 backdrop-blur-sm hover:bg-white rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-lg border border-white/20"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Checkout
              </h1>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center text-gray-600">
                  <Package className="w-4 h-4 mr-1" />
                  <span className="text-sm">{totalItems} item</span>
                </div>
                <div className="flex items-center text-green-600">
                  <Shield className="w-4 h-4 mr-1" />
                  <span className="text-sm">Pembayaran Aman</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Ringkasan Pesanan
                </h2>
              </div>

              <div className="space-y-4 mb-6">
                {cartItems.map((item, index) => (
                  <div
                    key={item.id_keranjang}
                    className="flex items-center space-x-4 py-4 border-b border-gray-100 last:border-b-0"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="relative">
                      <img
                        src={getMainImageUrl(item.products.gambar_produk)}
                        alt={item.products.nama_produk}
                        className="w-16 h-16 rounded-lg object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.jpg";
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-800 truncate">
                        {item.products.nama_produk}
                      </h4>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-gray-600 text-sm">
                          {item.jumlah} x Rp. {formatPrice(item.products.harga)}
                        </p>
                        <div className="flex items-center space-x-1 text-amber-500">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="text-xs">4.8</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Rp. {formatPrice(item.products.harga * item.jumlah)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4">
                <div className="flex justify-between text-gray-700 mb-2">
                  <span className="font-medium">Total Item</span>
                  <span className="font-bold">{totalItems}</span>
                </div>
                <div className="flex justify-between text-xl font-bold">
                  <span className="text-gray-800">Total Harga</span>
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Rp. {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="space-y-6">
            {/* Payment Instructions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Instruksi Pembayaran
                </h2>
              </div>

              <div className="text-center mb-6">
                <div className="bg-gray-100 p-6 rounded-2xl inline-block shadow-inner">
                  <div className="w-48 h-48 bg-gray-200 rounded-xl flex items-center justify-center mx-auto">
                    <div className="text-center">
                      <img src="./barcode.jpeg" alt="" className="mx-auto" />
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  Scan QR code atau transfer ke rekening di bawah
                </p>
              </div>

              {/* Bank Info */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-100">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-bold text-blue-800">Detail Transfer:</h3>
                </div>
                <div className="space-y-2 text-blue-700">
                  <p>
                    <span className="font-medium">Bank:</span> BCA
                  </p>
                  <p>
                    <span className="font-medium">No. Rekening:</span>{" "}
                    7421927412
                  </p>
                  <p>
                    <span className="font-medium">Atas Nama:</span> KARIN AZZAHRA
                  </p>
                  <p className="text-lg">
                    <span className="font-medium">Jumlah:</span>
                    <span className="font-bold text-blue-800 ml-2">
                      Rp. {formatPrice(totalPrice)}
                    </span>
                  </p>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center justify-center space-x-6 mt-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <Shield className="w-4 h-4 text-green-500 mr-1" />
                  <span>Aman & Terpercaya</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-blue-500 mr-1" />
                  <span>Proses Cepat</span>
                </div>
              </div>
            </div>

            {/* Upload Payment Proof */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Upload Bukti Pembayaran
                </h2>
              </div>

              <div
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-300 ${
                  dragActive
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {uploadPreview ? (
                  <div className="space-y-4">
                    <div className="relative inline-block">
                      <img
                        src={uploadPreview}
                        alt="Payment proof preview"
                        className="max-w-full max-h-48 mx-auto rounded-xl shadow-lg"
                      />
                      <button
                        onClick={() => {
                          setPaymentProof(null);
                          setUploadPreview(null);
                        }}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-green-600">
                      <Check className="w-5 h-5" />
                      <span className="font-medium">
                        File berhasil diupload
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
                      <Upload className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-600 mb-4">
                        Drag & drop screenshot pembayaran Anda di sini, atau
                      </p>
                      <label className="cursor-pointer">
                        <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-300 inline-block">
                          Pilih File
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            e.target.files?.[0] &&
                            handleFileChange(e.target.files[0])
                          }
                          className="hidden"
                        />
                      </label>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                      <AlertCircle className="w-4 h-4" />
                      <span>Format: JPG, PNG, GIF (Maks 5MB)</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitOrder}
              disabled={!paymentProof || submitting}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-white text-lg transition-all duration-300 ${
                !paymentProof || submitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-xl transform hover:scale-105"
              }`}
            >
              {submitting ? (
                <div className="flex items-center justify-center space-x-3">
                  <Loader2 className="animate-spin w-5 h-5" />
                  <span>Memproses Pesanan...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-3">
                  <Check className="w-5 h-5" />
                  <span>Submit Pesanan</span>
                </div>
              )}
            </button>

            {!paymentProof && (
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 text-amber-600 bg-amber-50 px-4 py-3 rounded-xl">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    Upload bukti pembayaran untuk melanjutkan
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
