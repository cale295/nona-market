import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  Store,
  Sparkles,
  ChevronRight,
} from "lucide-react";

interface AdminSidebarProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const menuItems = [
  {
    name: "Dashboard",
    icon: BarChart3,
    path: "/admin",
    description: "Overview & Analytics",
  },
  {
    name: "Products",
    icon: Package,
    path: "/admin/products",
    description: "Manage Inventory",
  },
  {
    name: "Orders",
    icon: ShoppingCart,
    path: "/admin/orders",
    description: "Track Orders",
  },
  {
    name: "Users",
    icon: Users,
    path: "/admin/users",
    description: "User Management",
  },
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, setIsOpen }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 w-72 min-h-screen bg-white shadow-2xl transform transition-all duration-500 ease-out md:static md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          <div className="relative z-10 p-8 text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Nona Market</h2>
                <p className="text-blue-100 text-sm opacity-90">Admin Panel</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <p className="text-xs text-blue-100 mb-1">Welcome back!</p>
              <p className="text-sm font-medium">Manage your store</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-6 space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`group relative flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                    : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700"
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div
                  className={`p-2 rounded-xl transition-all duration-300 ${
                    isActive
                      ? "bg-white/20 backdrop-blur-sm"
                      : "bg-gray-100 group-hover:bg-blue-100"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-all duration-300 ${
                      isActive
                        ? "text-white"
                        : "text-gray-600 group-hover:text-blue-600"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <div
                    className={`font-semibold text-sm transition-colors duration-300 ${
                      isActive
                        ? "text-white"
                        : "text-gray-800 group-hover:text-blue-700"
                    }`}
                  >
                    {item.name}
                  </div>
                  <div
                    className={`text-xs transition-colors duration-300 ${
                      isActive
                        ? "text-blue-100"
                        : "text-gray-500 group-hover:text-blue-500"
                    }`}
                  >
                    {item.description}
                  </div>
                </div>
                <ChevronRight
                  className={`w-4 h-4 transition-all duration-300 ${
                    isActive
                      ? "text-white opacity-100"
                      : "text-gray-400 opacity-0 group-hover:opacity-100 group-hover:text-blue-500"
                  }`}
                />

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
                )}
              </Link>
            );
          })}

          {/* Divider */}
          <div className="my-6 border-t border-gray-200"></div>

          {/* Store Link */}
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="group flex items-center gap-4 px-4 py-4 rounded-2xl text-emerald-600 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 transition-all duration-300 transform hover:scale-[1.02]"
          >
            <div className="p-2 bg-emerald-100 rounded-xl group-hover:bg-emerald-200 transition-all duration-300">
              <Store className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm text-emerald-700 group-hover:text-emerald-800 transition-colors duration-300">
                View Store
              </div>
              <div className="text-xs text-emerald-500 group-hover:text-emerald-600 transition-colors duration-300">
                Visit your shop
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-emerald-400 opacity-0 group-hover:opacity-100 group-hover:text-emerald-600 transition-all duration-300" />
          </Link>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-800">
                  System Status
                </p>
                <p className="text-xs text-green-600">
                  All systems operational
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
