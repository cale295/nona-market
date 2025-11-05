/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import SystemStatusCard from "../components/admin/SystemStatusCard";
import {
  User,
  ShoppingCart,
  Package,
  TrendingUp,
  Calendar,
  Activity,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";

type ChartData = {
  date: string;
  count: number;
};

const AdminDashboard: React.FC = () => {
  const [userCount, setUserCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [orderChartData, setOrderChartData] = useState<ChartData[]>([]);
  const [userChange, setUserChange] = useState(0);
  const [orderChange, setOrderChange] = useState(0);
  const [productChange, setProductChange] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        const [
          { count: userTotal },
          { count: orderTotal },
          { count: productTotal },
        ] = await Promise.all([
          supabase.from("users").select("*", { count: "exact", head: true }),
          supabase.from("orders").select("*", { count: "exact", head: true }),
          supabase.from("products").select("*", { count: "exact", head: true }),
        ]);

        const [
          { count: userLastMonth },
          { count: orderLastMonth },
          { count: productLastMonth },
        ] = await Promise.all([
          supabase
            .from("users")
            .select("*", { count: "exact", head: true })
            .gte("created_at", lastMonth.toISOString())
            .lt("created_at", thisMonth.toISOString()),
          supabase
            .from("orders")
            .select("*", { count: "exact", head: true })
            .gte("created_at", lastMonth.toISOString())
            .lt("created_at", thisMonth.toISOString()),
          supabase
            .from("products")
            .select("*", { count: "exact", head: true })
            .gte("created_at", lastMonth.toISOString())
            .lt("created_at", thisMonth.toISOString()),
        ]);

        const [
          { count: userThisMonth },
          { count: orderThisMonth },
          { count: productThisMonth },
        ] = await Promise.all([
          supabase
            .from("users")
            .select("*", { count: "exact", head: true })
            .gte("created_at", thisMonth.toISOString()),
          supabase
            .from("orders")
            .select("*", { count: "exact", head: true })
            .gte("created_at", thisMonth.toISOString()),
          supabase
            .from("products")
            .select("*", { count: "exact", head: true })
            .gte("created_at", thisMonth.toISOString()),
        ]);

        const calculateChange = (current: number, previous: number): number => {
          if (previous === 0) return current > 0 ? 100 : 0;
          return Math.round(((current - previous) / previous) * 100);
        };

        const { data: orderData } = await supabase
          .from("orders")
          .select("created_at");

        const grouped: Record<string, number> = {};

        (orderData || []).forEach((order) => {
          const date = new Date(order.created_at).toISOString().split("T")[0];
          grouped[date] = (grouped[date] || 0) + 1;
        });

        const chartData: ChartData[] = Object.entries(grouped)
          .map(([date, count]) => ({ date, count }))
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          )
          .slice(-7);

        setUserCount(userTotal || 0);
        setOrderCount(orderTotal || 0);
        setProductCount(productTotal || 0);
        setUserChange(calculateChange(userThisMonth || 0, userLastMonth || 0));
        setOrderChange(
          calculateChange(orderThisMonth || 0, orderLastMonth || 0)
        );
        setProductChange(
          calculateChange(productThisMonth || 0, productLastMonth || 0)
        );
        setOrderChartData(chartData);
        setLoading(false);
      } catch (error) {
        console.error("Gagal memuat data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const StatCard = ({
    icon: Icon,
    title,
    count,
    change,
    color,
    gradient,
    delay = 0,
  }: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    count: number;
    change: number;
    color: string;
    gradient: string;
    delay?: number;
  }) => {
    const isPositive = change >= 0;
    const changeText = `${isPositive ? "+" : ""}${change}% dari bulan lalu`;
    const changeColor = isPositive
      ? "text-green-600 bg-green-50"
      : "text-red-600 bg-red-50";

    return (
      <div
        className={`relative overflow-hidden bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group`}
        style={{ animationDelay: `${delay}ms` }}
      >
        {/* Gradient Background */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}
        ></div>

        {/* Animated Background Elements */}
        <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-white to-gray-100 rounded-full opacity-10 group-hover:scale-110 transition-transform duration-500"></div>
        <div className="absolute -bottom-5 -left-5 w-15 h-15 bg-gradient-to-br from-white to-gray-100 rounded-full opacity-5 group-hover:scale-110 transition-transform duration-500"></div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`p-3 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg`}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div
                className={`px-3 py-1 rounded-full text-xs font-medium ${changeColor}`}
              >
                {changeText}
              </div>
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
            <p className="text-3xl font-bold text-gray-800 mb-0">
              {count.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-200 rounded-3xl h-32"></div>
        ))}
      </div>
      <div className="bg-gray-200 rounded-3xl h-80"></div>
    </div>
  );

  const totalOrders = orderChartData.reduce((sum, item) => sum + item.count, 0);
  const avgDaily =
    orderChartData.length > 0
      ? Math.round(totalOrders / orderChartData.length)
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="relative overflow-hidden bg-white border-b border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-5"></div>
        <div className="relative z-10 p-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date().toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <div className="animate-fade-in">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              <StatCard
                icon={User}
                title="Total Pengguna"
                count={userCount}
                change={userChange}
                color="text-blue-600"
                gradient="from-blue-600 to-blue-500"
                delay={0}
              />
              <StatCard
                icon={ShoppingCart}
                title="Total Pesanan"
                count={orderCount}
                change={orderChange}
                color="text-emerald-600"
                gradient="from-emerald-600 to-emerald-500"
                delay={100}
              />
              <StatCard
                icon={Package}
                title="Total Produk"
                count={productCount}
                change={productChange}
                color="text-purple-600"
                gradient="from-purple-600 to-purple-500"
                delay={200}
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Chart */}
              <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-xl">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Statistik Pesanan
                  </h2>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    7 Hari Terakhir
                  </span>
                </div>

                {orderChartData.length > 0 ? (
                  <div className="space-y-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={orderChartData}>
                        <defs>
                          <linearGradient
                            id="orderGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#10b981"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="#10b981"
                              stopOpacity={0.1}
                            />
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="date"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: "#6b7280" }}
                          tickFormatter={(value) =>
                            new Date(value).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                            })
                          }
                        />
                        <YAxis
                          allowDecimals={false}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: "#6b7280" }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "none",
                            borderRadius: "12px",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                          }}
                          labelFormatter={(value) =>
                            new Date(value).toLocaleDateString("id-ID")
                          }
                        />
                        <Area
                          type="monotone"
                          dataKey="count"
                          stroke="#10b981"
                          strokeWidth={3}
                          fill="url(#orderGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    <div className="text-center">
                      <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Belum ada data pesanan untuk ditampilkan</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Summary Stats */}
              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-800">
                      Ringkasan Minggu Ini
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Total Pesanan
                      </span>
                      <span className="font-bold text-lg">{totalOrders}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Rata-rata Harian
                      </span>
                      <span className="font-bold text-lg">{avgDaily}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Hari Tertinggi
                      </span>
                      <span className="font-bold text-lg">
                        {Math.max(...orderChartData.map((d) => d.count))}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <Activity className="w-5 h-5" />
                    <h3 className="font-semibold">Status Sistem</h3>
                  </div>
                  <SystemStatusCard />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
