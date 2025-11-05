import React from "react";
import { LogOut, Menu, Bell, Search, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AdminHeaderProps {
  onToggleSidebar: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onToggleSidebar }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="relative bg-white shadow-lg border-b border-gray-100">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 opacity-50"></div>
      
      <div className="relative z-10 px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Left section */}
          <div className="flex items-center gap-6">
            {/* Mobile menu toggle */}
            <button
              onClick={onToggleSidebar}
              className="md:hidden p-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-105"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search bar - hidden on mobile */}
            <div className="hidden sm:flex items-center gap-3 px-4 py-2.5 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 min-w-[300px]">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products, orders, users..."
                className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
              />
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2.5 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md">
              <Bell className="w-5 h-5" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full border-2 border-white"></div>
            </button>

            {/* User info */}
            <div className="hidden sm:flex items-center gap-3 px-4 py-2.5 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-sm">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-800">Admin</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="group flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-2xl shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-300 transform hover:scale-105 text-sm font-medium"
            >
              <LogOut className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile search - shown on small screens */}
        <div className="sm:hidden mt-4 flex items-center gap-3 px-4 py-2.5 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-sm">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
          />
        </div>
      </div>

      {/* Bottom gradient border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-30"></div>
    </header>
  );
};

export default AdminHeader;