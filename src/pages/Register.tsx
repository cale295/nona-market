import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Phone, MapPin, UserPlus } from "lucide-react";

const Register: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [telepon, setTelepon] = useState("");
  const [alamat, setAlamat] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setLoading(false);
      setError(authError.message);
      return;
    }

    const userId = data?.user?.id || data?.session?.user?.id;

    if (userId) {
      const { error: dbError } = await supabase.from("users").insert([
        {
          id_user: userId,
          username,
          email,
          telepon,
          alamat,
          role: "user",
        },
      ]);
      setLoading(false);
      if (dbError) {
        setError(dbError.message);
      } else {
        alert("Registrasi berhasil! Silakan cek email untuk konfirmasi.");
        navigate("/login");
      }
    } else {
      setLoading(false);
      alert("Registrasi berhasil. Silakan cek email Anda.");
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-indigo-200 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl border border-indigo-200">
        <div className="flex justify-center mb-6">
          <img
            src="./logo_nm.png"
            alt="Logo"
            className="w-20 h-20 object-contain"
          />
        </div>
        <h2 className="text-2xl font-bold text-center text-indigo-700 mb-6">
          Create an Account
        </h2>
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-3.5 text-gray-400" size={20} />
            <input
              type="text"
              required
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-10 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-gray-400" size={20} />
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-gray-400" size={20} />
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="relative">
            <Phone
              className="absolute left-3 top-3.5 text-gray-400"
              size={20}
            />
            <input
              type="tel"
              required
              placeholder="Telepon"
              value={telepon}
              onChange={(e) => setTelepon(e.target.value)}
              className="w-full pl-10 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="relative">
            <MapPin
              className="absolute left-3 top-3.5 text-gray-400"
              size={20}
            />
            <textarea
              placeholder="Alamat"
              required
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              className="w-full pl-10 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition"
          >
            <UserPlus size={18} />
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Sudah punya akun?{" "}
          <Link
            to="/login"
            className="text-indigo-600 font-semibold hover:underline"
          >
            Login di sini
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
