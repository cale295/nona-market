import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  Eye,
  Check,
  X,
  Loader,
  Calendar,
  User,
  DollarSign,
  Package2,
  Filter,
  ShoppingCart,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Settings,
  AlertTriangle,
} from "lucide-react";

type Order = {
  id_order: string;
  id_user: string;
  tanggal_order: string;
  total_harga: number;
  status: string;
  bukti_transfer: string;
  users: {
    username: string;
    email: string;
    telepon: string;
  };
};

type OrderDetail = {
  id_order_detail: string;
  id_order: string;
  id_produk: string;
  jumlah: number;
  harga_satuan: number;
  subtotal: number;
  products: {
    nama_produk: string;
    gambar_produk: string[];
    stok: number;
  };
};

const OrderManager: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<string>("pending");

  const allowedStatuses = {
    PENDING: "pending",
    APPROVED: "approved",
    REJECTED: "rejected",
    COMPLETED: "completed",
    CONFIRMED: "confirmed",
    PROCESSING: "processing",
    SHIPPED: "shipped",
    DELIVERED: "delivered",
  };

  const getMainImageUrl = (images: string[]): string => {
    if (images.length > 0) return images[0];
    return "./placeholder.png"; // ganti dengan placeholder-mu
  };

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          users (
            username,
            email,
            telepon
          )
        `
        )
        .order("tanggal_order", { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error);
        alert("Gagal memuat data orders: " + error.message);
      } else {
        console.log("Orders fetched:", data);
        setOrders(data || []);
      }
    } catch (err) {
      console.error("Unexpected error fetching orders:", err);
      alert("Terjadi kesalahan saat memuat data orders");
    }
  };

  const fetchOrderDetails = async (orderId: string) => {
    const { data, error } = await supabase
      .from("order_detail")
      .select(
        `
        *,
        products (
          nama_produk,
          gambar_produk,
          stok
        )
      `
      )
      .eq("id_order", orderId);

    if (!error && data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const safeData = data.map((detail: any) => {
        let safeImages: string[] = [];
        if (Array.isArray(detail.products.gambar_produk)) {
          safeImages = detail.products.gambar_produk;
        } else if (typeof detail.products.gambar_produk === "string") {
          safeImages = [detail.products.gambar_produk];
        }
        return {
          ...detail,
          products: {
            ...detail.products,
            gambar_produk: safeImages,
          },
        };
      });
      setOrderDetails(safeData);
    }
  };

  const checkAndReduceStock = async (orderId: string) => {
    try {
      const { data: orderDetailsData, error: orderDetailsError } =
        await supabase
          .from("order_detail")
          .select(
            `
          *,
          products (
            nama_produk,
            stok
          )
        `
          )
          .eq("id_order", orderId);

      if (orderDetailsError) {
        throw new Error(
          `Error fetching order details: ${orderDetailsError.message}`
        );
      }

      const stockCheck = [];
      for (const detail of orderDetailsData) {
        const currentStock = detail.products.stok;
        const requiredStock = detail.jumlah;

        if (currentStock < requiredStock) {
          stockCheck.push({
            productName: detail.products.nama_produk,
            currentStock,
            requiredStock,
            sufficient: false,
          });
        } else {
          stockCheck.push({
            productName: detail.products.nama_produk,
            currentStock,
            requiredStock,
            sufficient: true,
          });
        }
      }

      const insufficientStock = stockCheck.filter((item) => !item.sufficient);
      if (insufficientStock.length > 0) {
        let errorMessage = "Stok tidak mencukupi untuk produk berikut:\n";
        insufficientStock.forEach((item) => {
          errorMessage += `- ${item.productName}: Stok tersedia ${item.currentStock}, diperlukan ${item.requiredStock}\n`;
        });
        throw new Error(errorMessage);
      }

      const stockUpdatePromises = orderDetailsData.map(async (detail) => {
        const newStock = detail.products.stok - detail.jumlah;

        const { error: updateError } = await supabase
          .from("products")
          .update({ stok: newStock })
          .eq("id_produk", detail.id_produk);

        if (updateError) {
          throw new Error(
            `Error updating stock for ${detail.products.nama_produk}: ${updateError.message}`
          );
        }

        return {
          productName: detail.products.nama_produk,
          previousStock: detail.products.stok,
          newStock: newStock,
          reducedBy: detail.jumlah,
        };
      });

      const stockUpdateResults = await Promise.all(stockUpdatePromises);

      return {
        success: true,
        message: "Stok berhasil dikurangi",
        details: stockUpdateResults,
      };
    } catch (error) {
      const err = error as Error;
      return {
        success: false,
        message: err.message,
      };
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleViewOrder = async (order: Order) => {
    setSelectedOrder(order);
    await fetchOrderDetails(order.id_order);
    setShowModal(true);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    if (!Object.values(allowedStatuses).includes(newStatus)) {
      alert("Status tidak valid!");
      return;
    }

    let confirmMessage = `Apakah Anda yakin ingin mengubah status order menjadi ${newStatus}?`;
    if (newStatus === "confirmed" || newStatus === "approved") {
      confirmMessage +=
        "\n\nPerhatian: Stok produk akan dikurangi sesuai dengan jumlah pesanan.";
    }

    if (!confirm(confirmMessage)) {
      return;
    }

    setIsLoading(true);

    try {
      if (newStatus === "confirmed" || newStatus === "approved") {
        const stockResult = await checkAndReduceStock(orderId);

        if (!stockResult.success) {
          alert("Gagal mengupdate status order:\n" + stockResult.message);
          setIsLoading(false);
          return;
        }

        console.log("Stock reduced successfully:", stockResult.details);
      }

      const { data, error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id_order", orderId)
        .select();

      if (error) {
        console.error("Error updating order status:", error);
        alert("Gagal mengupdate status order: " + error.message);
      } else {
        console.log("Order status updated successfully:", data);

        let successMessage = `Status order berhasil diubah menjadi ${newStatus}`;
        if (newStatus === "confirmed" || newStatus === "approved") {
          successMessage +=
            "\nStok produk telah dikurangi sesuai dengan jumlah pesanan.";
        }

        alert(successMessage);
        await fetchOrders();
        setShowModal(false);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      alert(
        "Terjadi kesalahan saat mengupdate status: " + (err as Error).message
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return {
          color: "bg-amber-50 text-amber-700 border-amber-200",
          icon: Clock,
          gradient: "from-amber-500 to-orange-500",
        };
      case "approved":
      case "confirmed":
        return {
          color: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: CheckCircle,
          gradient: "from-emerald-500 to-green-500",
        };
      case "rejected":
        return {
          color: "bg-red-50 text-red-700 border-red-200",
          icon: XCircle,
          gradient: "from-red-500 to-rose-500",
        };
      case "completed":
      case "delivered":
        return {
          color: "bg-blue-50 text-blue-700 border-blue-200",
          icon: Check,
          gradient: "from-blue-500 to-indigo-500",
        };
      case "processing":
        return {
          color: "bg-purple-50 text-purple-700 border-purple-200",
          icon: Settings,
          gradient: "from-purple-500 to-violet-500",
        };
      case "shipped":
        return {
          color: "bg-indigo-50 text-indigo-700 border-indigo-200",
          icon: Truck,
          gradient: "from-indigo-500 to-blue-500",
        };
      default:
        return {
          color: "bg-gray-50 text-gray-700 border-gray-200",
          icon: Package2,
          gradient: "from-gray-500 to-slate-500",
        };
    }
  };

  const filteredOrders = orders.filter((order) =>
    filter === "all" ? true : order.status === filter
  );

  const filterOptions = [
    { key: "all", label: "Semua", icon: Package2 },
    { key: "pending", label: "Pending", icon: Clock },
    { key: "confirmed", label: "Confirmed", icon: CheckCircle },
    { key: "processing", label: "Processing", icon: Settings },
    { key: "shipped", label: "Shipped", icon: Truck },
    { key: "delivered", label: "Delivered", icon: Check },
    { key: "rejected", label: "Rejected", icon: XCircle },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="relative overflow-hidden bg-white border-b border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-5"></div>
        <div className="relative z-10 p-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Manajemen Order
              </h1>
              <p className="text-gray-600">
                Kelola pesanan dan status pengiriman
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="mb-8 bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex items-center gap-2">
              <Filter className="w-6 h-6 text-white" />
              <h2 className="text-xl font-bold text-white">Filter Status</h2>
            </div>
          </div>
          <div className="p-8">
            <div className="flex flex-wrap gap-3">
              {filterOptions.map((status) => {
                const IconComponent = status.icon;
                const isActive = filter === status.key;
                return (
                  <button
                    key={status.key}
                    onClick={() => setFilter(status.key)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform -translate-y-1"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:shadow-md"
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {status.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {filteredOrders.map((order, index) => {
            const statusConfig = getStatusConfig(order.status);
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={order.id_order}
                className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div
                          className={`p-2 bg-gradient-to-br ${statusConfig.gradient} rounded-xl shadow-lg`}
                        >
                          <StatusIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">
                            Order #{order.id_order.slice(-8)}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${statusConfig.color}`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {order.status.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                              Customer
                            </p>
                            <p className="font-semibold text-gray-800">
                              {order.users.username}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Calendar className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                              Tanggal
                            </p>
                            <p className="font-semibold text-gray-800">
                              {new Date(order.tanggal_order).toLocaleDateString(
                                "id-ID"
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <DollarSign className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                              Total
                            </p>
                            <p className="font-bold text-blue-600 text-lg">
                              Rp {order.total_harga.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                      >
                        <Eye className="w-5 h-5" />
                        Detail Order
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <ShoppingCart className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Tidak Ada Order
            </h3>
            <p className="text-gray-600">
              Tidak ada order dengan status{" "}
              {filter === "all" ? "apapun" : filter}
            </p>
          </div>
        )}

        {showModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white bg-opacity-20 rounded-xl">
                      <ShoppingCart className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                      Detail Order #{selectedOrder.id_order.slice(-8)}
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 bg-white bg-opacity-20 rounded-xl hover:bg-opacity-30 transition-all duration-200"
                  >
                    <X className="w-6 h-6 text-black" />
                  </button>
                </div>
              </div>

              <div className="p-8">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-blue-100">
                  <h3 className="flex items-center gap-2 font-bold text-gray-800 mb-4">
                    <User className="w-5 h-5 text-blue-600" />
                    Informasi Customer
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl p-4">
                      <p className="text-sm text-gray-500 mb-1">Nama</p>
                      <p className="font-semibold text-gray-800">
                        {selectedOrder.users.username}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-4">
                      <p className="text-sm text-gray-500 mb-1">Email</p>
                      <p className="font-semibold text-gray-800">
                        {selectedOrder.users.email}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-4">
                      <p className="text-sm text-gray-500 mb-1">Telepon</p>
                      <p className="font-semibold text-gray-800">
                        {selectedOrder.users.telepon}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-4">
                      <p className="text-sm text-gray-500 mb-1">
                        Tanggal Order
                      </p>
                      <p className="font-semibold text-gray-800">
                        {new Date(selectedOrder.tanggal_order).toLocaleString(
                          "id-ID"
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="flex items-center gap-2 font-bold text-gray-800 mb-4">
                    <Package2 className="w-5 h-5 text-blue-600" />
                    Detail Produk
                  </h3>
                  <div className="space-y-4">
                    {orderDetails.map((detail) => (
                      <div
                        key={detail.id_order_detail}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100"
                      >
                        <img
                          src={getMainImageUrl(detail.products.gambar_produk)}
                          alt={detail.products.nama_produk}
                          className="w-20 h-20 rounded-lg object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "./placeholder.png";
                          }}
                        />
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800 mb-1">
                            {detail.products.nama_produk}
                          </h4>
                          <p className="text-sm text-gray-600 mb-1">
                            {detail.jumlah} x Rp{" "}
                            {detail.harga_satuan.toLocaleString()}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              Stok tersedia: {detail.products.stok}
                            </span>
                            {detail.products.stok < detail.jumlah && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs">
                                <AlertTriangle className="w-3 h-3" />
                                Stok tidak mencukupi
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-600 text-lg">
                            Rp {detail.subtotal.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl">
                      <span className="text-xl font-bold text-gray-800">
                        Total Pembayaran:
                      </span>
                      <span className="text-2xl font-bold text-blue-600">
                        Rp {selectedOrder.total_harga.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="flex items-center gap-2 font-bold text-gray-800 mb-4">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    Bukti Transfer
                  </h3>
                  {selectedOrder.bukti_transfer ? (
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                      <img
                        src={selectedOrder.bukti_transfer}
                        alt="Bukti Transfer"
                        className="max-w-full h-auto rounded-xl shadow-lg"
                      />
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-100">
                      <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 italic">
                        Belum ada bukti transfer
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  {selectedOrder.status === "pending" && (
                    <>
                      <button
                        onClick={() =>
                          handleUpdateStatus(
                            selectedOrder.id_order,
                            "confirmed"
                          )
                        }
                        disabled={isLoading}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
                      >
                        {isLoading ? (
                          <Loader className="w-5 h-5 animate-spin" />
                        ) : (
                          <Check className="w-5 h-5" />
                        )}
                        Approve Order
                      </button>
                      <button
                        onClick={() =>
                          handleUpdateStatus(selectedOrder.id_order, "rejected")
                        }
                        disabled={isLoading}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
                      >
                        {isLoading ? (
                          <Loader className="w-5 h-5 animate-spin" />
                        ) : (
                          <X className="w-5 h-5" />
                        )}
                        Reject Order
                      </button>
                    </>
                  )}

                  {(selectedOrder.status === "approved" ||
                    selectedOrder.status === "confirmed") && (
                    <button
                      onClick={() =>
                        handleUpdateStatus(selectedOrder.id_order, "processing")
                      }
                      disabled={isLoading}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
                    >
                      {isLoading ? (
                        <Loader className="w-5 h-5 animate-spin" />
                      ) : (
                        <Settings className="w-5 h-5" />
                      )}
                      Mulai Proses
                    </button>
                  )}

                  {selectedOrder.status === "processing" && (
                    <button
                      onClick={() =>
                        handleUpdateStatus(selectedOrder.id_order, "shipped")
                      }
                      disabled={isLoading}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
                    >
                      {isLoading ? (
                        <Loader className="w-5 h-5 animate-spin" />
                      ) : (
                        <Truck className="w-5 h-5" />
                      )}
                      Kirim Paket
                    </button>
                  )}

                  {selectedOrder.status === "shipped" && (
                    <button
                      onClick={() =>
                        handleUpdateStatus(selectedOrder.id_order, "delivered")
                      }
                      disabled={isLoading}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
                    >
                      {isLoading ? (
                        <Loader className="w-5 h-5 animate-spin" />
                      ) : (
                        <CheckCircle className="w-5 h-5" />
                      )}
                      Selesai Dikirim
                    </button>
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

export default OrderManager;
