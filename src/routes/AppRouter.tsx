import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import AdminRoute from "./AdminRoute";

import UserLayout from "../layouts/UserLayout";
import AdminLayout from "../layouts/AdminLayout";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import ProductManager from "../components/admin/Products";
import UsersPage from "../components/admin/Users";
import OrderManager from "../components/admin/Orders";
import AccountSettings from "../components/user/AccountSettings";
import Cart from "../components/user/Cart";
import Checkout from "../components/user/Checkout";
import OrderSuccess from "../components/user/OrderSuccess";
import OrderHistory from "../components/user/OrderHistory";
import ForgotPassword from "../pages/ForgotPassword";
import UpdatePassword from "../pages/UpdatePassword";

const AppRouter: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* User */}
          <Route path="/" element={<UserLayout />}>
            <Route index element={<Home />} />
            <Route path="settings" element={<AccountSettings />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="order-success" element={<OrderSuccess />} />
            <Route path="orders" element={<OrderHistory />} />
          </Route>

          {/* Admin */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<ProductManager />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="orders" element={<OrderManager />} />
            </Route>
          </Route>

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/update-password" element={<UpdatePassword />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default AppRouter;
