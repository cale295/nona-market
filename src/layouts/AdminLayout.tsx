import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen relative">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex flex-col flex-1">
        <AdminHeader onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        <main className="flex-1 p-6 bg-gray-50 overflow-y-auto">
          <Outlet />
        </main>

        <footer className="p-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Nona Market Admin
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
