import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CheckCircle,
  Home,
  ShoppingCart,
  Package,
  Clock,
  Shield,
  Star,
  CreditCard,
  Phone,
} from "lucide-react";

type OrderItem = {
  nama_produk: string;
  jumlah: number;
  subtotal: number;
};

type OrderData = {
  total_harga: number;
  tanggal_order: string;
  status: string;
  items: OrderItem[];
};

const OrderSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  type LocationState = {
    orderId: string;
    orderData: OrderData;
  };

  const locationState = location.state as LocationState;
  const { orderId, orderData } = locationState || {};

  const formatPrice = (price: number): string => {
    return price.toLocaleString("id-ID");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 bg-indigo-500 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-purple-500 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-pink-500 rounded-full animate-ping"></div>
        <div className="absolute bottom-32 right-1/3 w-8 h-8 bg-indigo-500 rounded-full animate-pulse"></div>
      </div>

      <div className="min-h-screen flex items-center justify-center py-8 px-4 relative z-10">
        <div className="max-w-2xl w-full">
          {/* Success Animation Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 text-center border border-white/20 shadow-2xl mb-6">
            {/* Success Icon with Animation */}
            <div className="relative mb-8">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <div className="absolute inset-0 w-24 h-24 mx-auto border-4 border-green-200 rounded-full animate-ping"></div>
            </div>

            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
              Pesanan Berhasil!
            </h1>
            <p className="text-gray-600 text-lg mb-8">
              Terima kasih atas pembelian Anda. Pesanan Anda sedang diproses
              dengan baik.
            </p>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center space-x-6 mb-8 text-sm">
              <div className="flex items-center text-green-600">
                <Shield className="w-4 h-4 mr-1" />
                <span>Pembayaran Aman</span>
              </div>
              <div className="flex items-center text-blue-600">
                <Clock className="w-4 h-4 mr-1" />
                <span>Proses Cepat</span>
              </div>
              <div className="flex items-center text-purple-600">
                <Star className="w-4 h-4 mr-1" />
                <span>Kualitas Terjamin</span>
              </div>
            </div>
          </div>

          {/* Order Details Card */}
          {orderId && orderData && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg mb-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Detail Pesanan
                </h2>
              </div>

              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Order ID:</span>
                    <span className="font-bold text-indigo-600">
                      #{orderId}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Total:</span>
                    <span className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Rp. {formatPrice(orderData.total_harga)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Tanggal:</span>
                    <span className="font-semibold text-gray-800">
                      {new Date(orderData.tanggal_order).toLocaleDateString(
                        "id-ID"
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Status:</span>
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                      {orderData.status === "pending"
                        ? "Menunggu Konfirmasi"
                        : orderData.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              {orderData.items && (
                <div className="space-y-3">
                  <h3 className="font-bold text-gray-800 mb-3">
                    Item Pesanan:
                  </h3>
                  {orderData.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                    >
                      <div>
                        <span className="font-medium text-gray-800">
                          {item.nama_produk}
                        </span>
                        <span className="text-gray-600 ml-2">
                          x{item.jumlah}
                        </span>
                      </div>
                      <span className="font-bold text-indigo-600">
                        Rp. {formatPrice(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Status Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Status Pembayaran
              </h3>
            </div>
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CreditCard className="w-5 h-5 text-amber-600" />
                <span className="font-bold text-amber-800">
                  Menunggu Konfirmasi Pembayaran
                </span>
              </div>
              <p className="text-sm text-amber-700">
                Kami akan memproses pesanan Anda setelah pembayaran
                dikonfirmasi. Proses konfirmasi biasanya memakan waktu 1-24 jam.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => navigate("/")}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-2xl font-bold hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-3"
            >
              <Home className="w-5 h-5" />
              <span>Kembali ke Beranda</span>
            </button>

            <button
              onClick={() => navigate("/cart")}
              className="w-full bg-white/80 backdrop-blur-sm border-2 border-indigo-200 text-indigo-600 py-4 px-6 rounded-2xl font-bold hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-300 flex items-center justify-center space-x-3"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Lanjut Belanja</span>
            </button>
          </div>

          {/* Customer Service Info */}
          <div className="mt-8 text-center">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <Phone className="w-5 h-5 text-indigo-600" />
                <span className="font-bold text-gray-800">Butuh Bantuan?</span>
              </div>
              <p className="text-sm text-gray-600">
                Jika ada pertanyaan tentang pesanan Anda, silakan hubungi
                customer service kami di
                <span className="font-medium text-indigo-600 ml-1">
                  0800-1234-5678
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
