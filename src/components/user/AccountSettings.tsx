import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Edit3,
  Save,
  X,
  Shield,
  Key,
  LogOut,
  Star,
  Heart,
  Settings,
  Check,
  Loader,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";

import { supabase } from "../../lib/supabase";

interface UserData {
  username: string;
  email: string;
  telepon: string;
  alamat: string;
  foto_profil: string;
}

const AccountSettings: React.FC = () => {
  const [userData, setUserData] = useState<UserData>({
    username: "",
    email: "",
    telepon: "",
    alamat: "",
    foto_profil: "",
  });
  const [userId, setUserId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error || !user) {
          console.error("Gagal ambil user:", error?.message);
          setLoading(false);
          return;
        }

        setUserId(user.id);

        const { data, error: userError } = await supabase
          .from("users")
          .select("username, email, telepon, alamat, foto_profil")
          .eq("id_user", user.id)
          .single();

        if (userError) {
          console.error("Gagal ambil data user:", userError.message);
          setUserData((prev) => ({ ...prev, email: user.email || "" }));
        } else {
          setUserData({
            username: data?.username || "",
            email: data?.email || user.email || "",
            telepon: data?.telepon || "",
            alamat: data?.alamat || "",
            foto_profil: data?.foto_profil || "",
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    getUserData();
  }, []);

  const handleInputChange = (field: keyof UserData, value: string) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !userId) return;

    const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];
    if (!allowedTypes.includes(file.type)) {
      alert(
        "Format file tidak didukung. Harap pilih file PNG, JPG, atau JPEG."
      );
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("Ukuran file terlalu besar. Maksimal 5MB.");
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `profile_${userId}_${Date.now()}.${fileExt}`;

      if (userData.foto_profil) {
        try {
          const url = new URL(userData.foto_profil);
          const pathSegments = url.pathname.split("/");
          const oldFileName = pathSegments[pathSegments.length - 1];

          if (oldFileName && oldFileName !== fileName) {
            const { error: deleteError } = await supabase.storage
              .from("profil")
              .remove([oldFileName]);

            if (deleteError) {
              console.warn(
                "Warning: Could not delete old file:",
                deleteError.message
              );
            }
          }
        } catch (urlError) {
          console.warn("Warning: Could not parse old image URL:", urlError);
        }
      }

      const { data, error: uploadError } = await supabase.storage
        .from("profil")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) {
        console.error("Error uploading file:", uploadError);
        alert(`Gagal upload foto profil: ${uploadError.message}`);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("profil").getPublicUrl(data.path);

      if (!publicUrl) {
        alert("Gagal mendapatkan URL foto profil");
        return;
      }

      handleInputChange("foto_profil", publicUrl);
      console.log("Upload berhasil:", publicUrl);
    } catch (error) {
      console.error("Error during upload:", error);
      alert("Terjadi kesalahan saat upload");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!userId) return;

    if (!userData.username.trim()) {
      alert("Nama lengkap tidak boleh kosong");
      return;
    }

    try {
      const { error } = await supabase
        .from("users")
        .update({
          username: userData.username.trim(),
          telepon: userData.telepon.trim(),
          alamat: userData.alamat.trim(),
          foto_profil: userData.foto_profil,
        })
        .eq("id_user", userId);

      if (error) {
        console.error("Gagal update data user:", error.message);
        alert("Gagal menyimpan data: " + error.message);
      } else {
        setIsEditing(false);
        alert("Data berhasil disimpan!");
      }
    } catch (error) {
      console.error("Error saving user data:", error);
      alert("Terjadi kesalahan saat menyimpan data");
    }
  };

  const handlePasswordUpdate = async () => {
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      alert("Semua field password harus diisi");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Password baru dan konfirmasi password tidak cocok");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert("Password baru harus minimal 6 karakter");
      return;
    }

    if (passwordData.newPassword === passwordData.currentPassword) {
      alert("Password baru harus berbeda dengan password lama");
      return;
    }

    setPasswordLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) {
        console.error("Error updating password:", error);
        alert("Gagal mengubah password: " + error.message);
      } else {
        alert("Password berhasil diubah!");
        setShowPasswordModal(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowPasswords({
          current: false,
          new: false,
          confirm: false,
        });
      }
    } catch (error) {
      console.error("Error updating password:", error);
      alert("Terjadi kesalahan saat mengubah password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Apakah Anda yakin ingin logout?");
    if (confirmLogout) {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error("Logout error:", error);
          alert("Gagal logout: " + error.message);
        } else {
          window.location.href = "/login";
        }
      } catch (error) {
        console.error("Logout error:", error);
        alert("Terjadi kesalahan saat logout");
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowPasswords({
      current: false,
      new: false,
      confirm: false,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600 mx-auto mb-4"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-purple-200 rounded-full animate-ping mx-auto"></div>
          </div>
          <p className="text-gray-600 font-medium">Memuat data akun...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 bg-indigo-500 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-purple-500 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-pink-500 rounded-full animate-ping"></div>
        <div className="absolute bottom-32 right-1/3 w-8 h-8 bg-indigo-500 rounded-full animate-pulse"></div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl py-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="w-12 h-12 bg-white/80 backdrop-blur-sm hover:bg-white rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-lg border border-white/20"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Pengaturan Akun
              </h1>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center text-gray-600">
                  <Settings className="w-4 h-4 mr-1" />
                  <span className="text-sm">Kelola profil Anda</span>
                </div>
                <div className="flex items-center text-green-600">
                  <Star className="w-4 h-4 mr-1" />
                  <span className="text-sm">Akun terverifikasi</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 p-6">
              <div className="text-center mb-6">
                <div className="relative mx-auto w-32 h-32 mb-4">
                  <div className="w-32 h-32 rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl border-4 border-white/20">
                    {userData.foto_profil ? (
                      <img
                        src={userData.foto_profil}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error(
                            "Error loading image:",
                            userData.foto_profil
                          );
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          const fallback =
                            target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = "flex";
                        }}
                      />
                    ) : null}

                    <div
                      className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600"
                      style={{
                        display: userData.foto_profil ? "none" : "flex",
                      }}
                    >
                      <span className="text-3xl font-bold text-white">
                        {userData.username.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                  </div>

                  {isEditing && (
                    <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl cursor-pointer shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center">
                      {uploading ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4" />
                      )}
                      <input
                        type="file"
                        accept="image/png,image/jpg,image/jpeg"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  )}
                </div>

                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {userData.username || "Nama Belum Diatur"}
                </h2>
                <p className="text-gray-600 mb-4">{userData.email}</p>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-2xl shadow-inner">
                  <div className="flex items-center justify-center space-x-2 text-green-600">
                    <Check className="w-5 h-5" />
                    <span className="font-medium">
                      Akun Aktif & Terverifikasi
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-600">
                  <div className="w-8 h-8 bg-pink-100 rounded-xl flex items-center justify-center">
                    <Heart className="w-4 h-4 text-pink-500" />
                  </div>
                  <span className="text-sm">Member terpercaya</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <div className="w-8 h-8 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Star className="w-4 h-4 text-yellow-500" />
                  </div>
                  <span className="text-sm">Pelanggan setia</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
                    <Shield className="w-4 h-4 text-green-500" />
                  </div>
                  <span className="text-sm">Keamanan terjamin</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Informasi Personal
                  </h3>
                </div>

                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-2xl font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Profil</span>
                  </button>
                ) : (
                  <div className="flex space-x-3">
                    <button
                      onClick={handleSave}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-2xl font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Simpan</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-gray-500 text-white px-6 py-3 rounded-2xl font-bold hover:bg-gray-600 transition-all duration-300 flex items-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>Batal</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center space-x-2 text-gray-700 font-medium mb-3">
                    <User className="w-4 h-4" />
                    <span>Nama Lengkap *</span>
                  </label>
                  <input
                    type="text"
                    value={userData.username}
                    onChange={(e) =>
                      handleInputChange("username", e.target.value)
                    }
                    disabled={!isEditing}
                    className="w-full bg-white/60 backdrop-blur-sm border border-white/40 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent disabled:bg-gray-50/50 disabled:text-gray-500 transition-all duration-300"
                    placeholder="Masukkan nama lengkap"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-gray-700 font-medium mb-3">
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </label>
                  <input
                    type="email"
                    value={userData.email}
                    disabled
                    className="w-full bg-gray-50/70 backdrop-blur-sm border border-gray-300/40 rounded-2xl px-4 py-3 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-2 flex items-center space-x-1">
                    <Shield className="w-3 h-3" />
                    <span>Email tidak dapat diubah</span>
                  </p>
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-gray-700 font-medium mb-3">
                    <Phone className="w-4 h-4" />
                    <span>Nomor Telepon</span>
                  </label>
                  <input
                    type="tel"
                    value={userData.telepon}
                    onChange={(e) =>
                      handleInputChange("telepon", e.target.value)
                    }
                    disabled={!isEditing}
                    className="w-full bg-white/60 backdrop-blur-sm border border-white/40 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent disabled:bg-gray-50/50 disabled:text-gray-500 transition-all duration-300"
                    placeholder="Contoh: +62 812-3456-7890"
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-gray-700 font-medium mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>Alamat</span>
                  </label>
                  <textarea
                    value={userData.alamat}
                    onChange={(e) =>
                      handleInputChange("alamat", e.target.value)
                    }
                    disabled={!isEditing}
                    rows={3}
                    className="w-full bg-white/60 backdrop-blur-sm border border-white/40 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent disabled:bg-gray-50/50 disabled:text-gray-500 transition-all duration-300 resize-none"
                    placeholder="Masukkan alamat lengkap"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  Keamanan Akun
                </h3>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-4 rounded-2xl font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <Key className="w-5 h-5" />
                  <span>Ganti Password</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-6 py-4 rounded-2xl font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/50">
                <div className="flex items-center space-x-3 text-blue-700">
                  <Shield className="w-5 h-5" />
                  <div>
                    <p className="font-medium">Keamanan Terjamin</p>
                    <p className="text-sm text-blue-600">
                      Data Anda dilindungi dengan enkripsi tingkat tinggi
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/20 shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  Ganti Password
                </h3>
              </div>
              <button
                onClick={closePasswordModal}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-all duration-300"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Password Saat Ini *
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      handlePasswordChange("currentPassword", e.target.value)
                    }
                    className="w-full bg-white/60 backdrop-blur-sm border border-white/40 rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
                    placeholder="Masukkan password saat ini"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("current")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPasswords.current ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Password Baru *
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      handlePasswordChange("newPassword", e.target.value)
                    }
                    className="w-full bg-white/60 backdrop-blur-sm border border-white/40 rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
                    placeholder="Masukkan password baru (min. 6 karakter)"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("new")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPasswords.new ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Password harus minimal 6 karakter
                </p>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Konfirmasi Password Baru *
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      handlePasswordChange("confirmPassword", e.target.value)
                    }
                    className="w-full bg-white/60 backdrop-blur-sm border border-white/40 rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
                    placeholder="Ulangi password baru"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("confirm")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {passwordData.newPassword && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-2xl border border-blue-200/50">
                  <div className="flex items-center space-x-2 text-blue-700">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Kekuatan Password:{" "}
                      {passwordData.newPassword.length < 6
                        ? "Lemah"
                        : passwordData.newPassword.length < 8
                        ? "Sedang"
                        : /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(
                            passwordData.newPassword
                          )
                        ? "Kuat"
                        : "Sedang"}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-blue-600">
                    Tips: Gunakan kombinasi huruf besar, huruf kecil, dan angka
                  </div>
                </div>
              )}

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handlePasswordUpdate}
                  disabled={passwordLoading}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-2xl font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {passwordLoading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Memperbarui...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Simpan Password</span>
                    </>
                  )}
                </button>
                <button
                  onClick={closePasswordModal}
                  disabled={passwordLoading}
                  className="bg-gray-500 text-white px-6 py-3 rounded-2xl font-bold hover:bg-gray-600 transition-all duration-300 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-4 h-4" />
                  <span>Batal</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSettings;
