import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Phone, MapPin, UserPlus, Eye, EyeOff } from "lucide-react";

const Register: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [telepon, setTelepon] = useState("");
  const [alamat, setAlamat] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (password.length < 6) {
        setError("Password minimal 6 karakter");
        setLoading(false);
        return;
      }

      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
          }
        }
      });

      if (authError) {
        setLoading(false);
        if (authError.message.includes("User already registered")) {
          setError("Email sudah terdaftar. Silakan gunakan email lain atau login.");
        } else if (authError.message.includes("Invalid email")) {
          setError("Format email tidak valid.");
        } else if (authError.message.includes("Password")) {
          setError("Password terlalu lemah. Minimal 6 karakter.");
        } else {
          setError(authError.message);
        }
        return;
      }

      const userId = data?.user?.id;

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

        if (dbError) {
          setError(`Gagal menyimpan data: ${dbError.message}`);
          setLoading(false);
          return;
        }
      }

      setLoading(false);
      setSuccess("Registrasi berhasil! Silakan cek email untuk konfirmasi.");
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      setLoading(false);
      setError("Terjadi kesalahan. Silakan coba lagi.");
      console.error("Registration error:", err);
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
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
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
              className="w-full pl-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              minLength={3}
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
              className="w-full pl-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-gray-400" size={20} />
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="Password (minimal 6 karakter)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <div className="relative">
            <Phone className="absolute left-3 top-3.5 text-gray-400" size={20} />
            <input
              type="tel"
              required
              placeholder="Telepon"
              value={telepon}
              onChange={(e) => setTelepon(e.target.value)}
              className="w-full pl-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              pattern="[0-9+\-\s]+"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-3.5 text-gray-400" size={20} />
            <textarea
              placeholder="Alamat"
              required
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              className="w-full pl-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px] resize-none"
              rows={3}
            />
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600 text-center">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-600 text-center">{success}</p>
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
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