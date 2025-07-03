import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

const UpdatePassword: React.FC = () => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getSessionFromUrl = async () => {
  const hash = window.location.hash; // ambil bagian setelah `#`
  const params = new URLSearchParams(hash.slice(1)); // hapus `#` di awal

  const access_token = params.get("access_token");
  const refresh_token = params.get("refresh_token");

  if (access_token && refresh_token) {
    const { error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });

    if (error) {
      setError("Gagal mengatur sesi. Link mungkin sudah kedaluwarsa.");
    }
  } else {
    setError("Token tidak ditemukan di URL.");
  }

  setLoading(false);
};

    getSessionFromUrl();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Memuat sesi...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl border border-pink-200">
        <h2 className="text-xl font-bold text-center mb-4 text-pink-600">
          Ubah Password
        </h2>
        <form onSubmit={handleUpdate} className="space-y-4">
          <input
            type="password"
            placeholder="Password Baru"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-400 outline-none"
            required
          />
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          {success && (
            <p className="text-sm text-green-600 text-center">
              Password berhasil diubah! Mengarahkan ke login...
            </p>
          )}
          <button
            type="submit"
            className="w-full bg-pink-500 text-white font-bold py-3 rounded-xl hover:bg-pink-600 transition-colors"
          >
            Ubah Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePassword;
