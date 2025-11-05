import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import {
  Edit3,
  Trash2,
  Loader,
  Users,
  Plus,
  Mail,
  Phone,
  MapPin,
  User,
  Shield,
  Check,
  X,
} from "lucide-react";

type User = {
  id_user: string;
  username: string;
  email?: string;
  telepon?: string;
  alamat?: string;
  role: "admin" | "user";
};

// Pindahkan InputField keluar dari komponen utama
const InputField = ({
  icon: Icon,
  label,
  type = "text",
  value,
  onChange,
  required = false,
  options,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  type?: string;
  value?: string;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  required?: boolean;
  options?: { value: string; label: string }[];
}) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
      <Icon className="w-4 h-4 text-gray-500" />
      {label}
    </label>
    {type === "select" ? (
      <select
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
      >
        {options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    ) : (
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        placeholder={`Masukkan ${label.toLowerCase()}`}
      />
    )}
  </div>
);

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState({
    username: "",
    email: "",
    telepon: "",
    alamat: "",
    role: "user",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchUsers = async () => {
    const { data, error } = await supabase.from("users").select("*");
    if (!error && data) setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (editingId) {
      await supabase.from("users").update(form).eq("id_user", editingId);
      setEditingId(null);
    } else {
      await supabase.from("users").insert(form);
    }

    setForm({
      username: "",
      email: "",
      telepon: "",
      alamat: "",
      role: "user",
    });
    setShowForm(false);
    fetchUsers();
    setIsLoading(false);
  };

  const handleEdit = (user: User) => {
    setForm({
      username: user.username || "",
      email: user.email || "",
      telepon: user.telepon || "",
      alamat: user.alamat || "",
      role: user.role || "user",
    });
    setEditingId(user.id_user);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus user ini?")) {
      setIsLoading(true);
      await supabase.from("users").delete().eq("id_user", id);
      fetchUsers();
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      username: "",
      email: "",
      telepon: "",
      alamat: "",
      role: "user",
    });
    setEditingId(null);
    setShowForm(false);
  };

  // Gunakan useCallback untuk event handlers agar tidak re-create setiap render
  const handleUsernameChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, username: e.target.value }));
  }, []);

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, email: e.target.value }));
  }, []);

  const handleTeleponChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, telepon: e.target.value }));
  }, []);

  const handleAlamatChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, alamat: e.target.value }));
  }, []);

  const handleRoleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, role: e.target.value as "admin" | "user" }));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="relative overflow-hidden bg-white border-b border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-5"></div>
        <div className="relative z-10 p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">
                  Manajemen User
                </h1>
                <p className="text-gray-600">
                  Kelola pengguna dalam sistem Anda
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              Tambah User
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8">
        {/* Form */}
        {showForm && (
          <div className="mb-6 sm:mb-8 bg-white rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                  {editingId ? "Edit User" : "Tambah User Baru"}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-1.5 sm:p-2 bg-white bg-opacity-20 rounded-lg sm:rounded-xl hover:bg-opacity-30 transition-all duration-200"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 lg:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <InputField
                  icon={User}
                  label="Username"
                  value={form.username}
                  onChange={handleUsernameChange}
                  required
                />

                <InputField
                  icon={Mail}
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={handleEmailChange}
                />

                <InputField
                  icon={Phone}
                  label="Telepon"
                  value={form.telepon}
                  onChange={handleTeleponChange}
                />

                <InputField
                  icon={Shield}
                  label="Role"
                  type="select"
                  value={form.role}
                  onChange={handleRoleChange}
                  options={[
                    { value: "user", label: "User" },
                    { value: "admin", label: "Admin" },
                  ]}
                />

                <div className="lg:col-span-2">
                  <InputField
                    icon={MapPin}
                    label="Alamat"
                    value={form.alamat}
                    onChange={handleAlamatChange}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8">
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:transform-none text-sm sm:text-base"
                >
                  {isLoading ? (
                    <Loader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                  {editingId ? "Update User" : "Tambah User"}
                </button>
                <button
                  onClick={resetForm}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 text-sm sm:text-base"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Users Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
          {users.map((user, index) => (
            <div
              key={user.id_user}
              className="bg-white rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 h-24 sm:h-28 lg:h-32">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <User className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-gray-600" />
                  </div>
                </div>
                <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 text-xs rounded-full font-semibold ${
                      user.role === "admin"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    <span className="hidden sm:inline">
                      {user.role.toUpperCase()}
                    </span>
                    <span className="sm:hidden">
                      {user.role === "admin" ? "A" : "U"}
                    </span>
                  </span>
                </div>
              </div>

              <div className="p-4 sm:p-5 lg:p-6 pt-6 sm:pt-7 lg:pt-8">
                <div className="mb-3 sm:mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 truncate">
                    {user.username}
                  </h2>

                  <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                    {user.email && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>
                    )}
                    {user.telepon && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="truncate">{user.telepon}</span>
                      </div>
                    )}
                    {user.alamat && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="truncate">{user.alamat}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => handleEdit(user)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-amber-50 text-amber-700 rounded-lg sm:rounded-xl hover:bg-amber-100 transition-all duration-200"
                  >
                    <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm font-medium">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(user.id_user)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-red-50 text-red-700 rounded-lg sm:rounded-xl hover:bg-red-100 transition-all duration-200"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm font-medium">
                      Hapus
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {users.length === 0 && (
          <div className="text-center py-12 sm:py-16">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full mb-4">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
              Belum Ada User
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-4">
              Mulai dengan menambahkan user pertama Anda
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 text-sm sm:text-base"
            >
              Tambah User Pertama
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersPage;