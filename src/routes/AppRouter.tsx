import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import UserLayout from "../layouts/UserLayout";
import AdminLayout from "../layouts/AdminLayout";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import AccountSettings from "../components/user/AccountSettings";
import Cart from "../components/user/Cart";
import Checkout from "../components/user/Checkout";
import OrderSuccess from "../components/user/OrderSuccess";
import OrderHistory from "../components/user/OrderHistory";
import Dashboard from "../pages/Dashboard";
import ProductManager from "../components/admin/Products";
import UsersPage from "../components/admin/Users";
import OrderManager from "../components/admin/Orders";

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserLayout />}>
          <Route index element={<Home />} />
          <Route path="settings" element={<AccountSettings />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order-success" element={<OrderSuccess />} />
          <Route path="orders" element={<OrderHistory />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductManager />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="orders" element={<OrderManager />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
