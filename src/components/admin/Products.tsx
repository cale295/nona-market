import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  Edit3,
  Trash2,
  Loader,
  Package,
  Plus,
  Image,
  DollarSign,
  Hash,
  FileText,
  Upload,
  Check,
  X,
} from "lucide-react";

type Product = {
  id_produk: string;
  nama_produk: string;
  deskripsi: string;
  stok: number;
  harga: number;
  gambar_produk: string[];
};

const InputField = ({
  icon: Icon,
  label,
  type = "text",
  value,
  onChange,
  required = false,
  rows,
  accept,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  type?: string;
  value?: string | number;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  required?: boolean;
  rows?: number;
  accept?: string;
}) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
      <Icon className="w-4 h-4 text-gray-500" />
      {label}
    </label>
    {type === "textarea" ? (
      <textarea
        value={value as string}
        onChange={onChange}
        rows={rows || 3}
        required={required}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
        placeholder={`Masukkan ${label.toLowerCase()}`}
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        accept={accept}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        placeholder={`Masukkan ${label.toLowerCase()}`}
      />
    )}
  </div>
);

const ImageUploader = ({
  existingImages = [],
  newFiles = [],
  onNewFilesChange,
  onRemoveExisting,
  onRemoveNewFile,
}: {
  existingImages: string[];
  newFiles: File[];
  onNewFilesChange: (files: File[]) => void;
  onRemoveExisting: (index: number) => void;
  onRemoveNewFile: (index: number) => void;
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    onNewFilesChange([...newFiles, ...files]);
  };

  const createObjectURL = (file: File) => URL.createObjectURL(file);

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <Image className="w-4 h-4 text-gray-500" />
        Gambar Produk
      </label>

      {existingImages.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2">Gambar saat ini:</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {existingImages.map((url, idx) => (
              <div key={`existing-${idx}`} className="relative group">
                <img
                  src={url}
                  alt={`Existing ${idx}`}
                  className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => onRemoveExisting(idx)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {newFiles.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2">Gambar baru:</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {newFiles.map((file, idx) => (
              <div key={`new-${idx}`} className="relative group">
                <img
                  src={createObjectURL(file)}
                  alt={`New ${idx}`}
                  className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => onRemoveNewFile(idx)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <label className="flex flex-col items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-200">
        <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
        <span className="text-sm text-gray-600">
          Tambah gambar (bisa banyak)
        </span>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>
    </div>
  );
};

const ProductManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<Omit<Product, "id_produk">>({
    nama_produk: "",
    deskripsi: "",
    stok: 0,
    harga: 0,
    gambar_produk: [],
  });
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchProducts = async () => {
    type RawProduct = {
      id_produk: string;
      nama_produk: string;
      deskripsi: string;
      stok: number;
      harga: number;
      gambar_produk: string | string[] | null;
    };

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .returns<RawProduct[]>();

    if (!error && data) {
      const safeData: Product[] = data.map((p) => {
        let images: string[] = [];
        if (Array.isArray(p.gambar_produk)) {
          images = p.gambar_produk;
        } else if (typeof p.gambar_produk === "string") {
          images = [p.gambar_produk];
        }
        return { ...p, gambar_produk: images };
      });
      setProducts(safeData);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const uploadImages = async (files: File[]): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of files) {
      const fileName = `${Date.now()}_${file.name}`;
      const { error } = await supabase.storage
        .from("produk")
        .upload(fileName, file, { upsert: false });
      if (error) continue;
      const { data } = supabase.storage.from("produk").getPublicUrl(fileName);
      urls.push(data.publicUrl);
    }
    return urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    let finalImageUrls = [...form.gambar_produk];

    if (newFiles.length > 0) {
      const uploaded = await uploadImages(newFiles);
      if (uploaded.length === 0) {
        alert("Gagal upload gambar");
        setIsLoading(false);
        return;
      }
      finalImageUrls = [...form.gambar_produk, ...uploaded];
    }

    const productData = { ...form, gambar_produk: finalImageUrls };

    try {
      if (editingId) {
        await supabase
          .from("products")
          .update(productData)
          .eq("id_produk", editingId);
        setEditingId(null);
      } else {
        await supabase.from("products").insert(productData);
      }

      setForm({
        nama_produk: "",
        deskripsi: "",
        stok: 0,
        harga: 0,
        gambar_produk: [],
      });
      setNewFiles([]);
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan produk");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (p: Product) => {
    setForm(p);
    setNewFiles([]);
    setEditingId(p.id_produk);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus produk ini?")) return;
    setIsLoading(true);
    try {
      await supabase.from("products").delete().eq("id_produk", id);
      fetchProducts();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      alert("Gagal menghapus");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      nama_produk: "",
      deskripsi: "",
      stok: 0,
      harga: 0,
      gambar_produk: [],
    });
    setNewFiles([]);
    setEditingId(null);
    setShowForm(false);
  };

  const handleRemoveExisting = (index: number) => {
    const updated = [...form.gambar_produk];
    updated.splice(index, 1);
    setForm({ ...form, gambar_produk: updated });
  };

  const handleRemoveNewFile = (index: number) => {
    const updated = [...newFiles];
    updated.splice(index, 1);
    setNewFiles(updated);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="relative overflow-hidden bg-white border-b border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-5"></div>
        <div className="relative z-10 p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
                <Package className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">
                  Manajemen Produk
                </h1>
                <p className="text-gray-600">
                  Kelola produk dalam inventory Anda
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              Tambah Produk
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8">
        {showForm && (
          <div className="mb-6 sm:mb-8 bg-white rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                  {editingId ? "Edit Produk" : "Tambah Produk Baru"}
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
                <div className="lg:col-span-2">
                  <InputField
                    icon={FileText}
                    label="Nama Produk"
                    value={form.nama_produk}
                    onChange={(e) =>
                      setForm({ ...form, nama_produk: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="lg:col-span-2">
                  <InputField
                    icon={FileText}
                    label="Deskripsi"
                    type="textarea"
                    value={form.deskripsi}
                    onChange={(e) =>
                      setForm({ ...form, deskripsi: e.target.value })
                    }
                    required
                    rows={4}
                  />
                </div>

                <InputField
                  icon={Hash}
                  label="Stok"
                  type="number"
                  value={form.stok === 0 ? "" : form.stok}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      stok: e.target.value ? Number(e.target.value) : 0,
                    })
                  }
                  required
                />

                <InputField
                  icon={DollarSign}
                  label="Harga (Rp)"
                  type="number"
                  value={form.harga === 0 ? "" : form.harga}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      harga: e.target.value ? Number(e.target.value) : 0,
                    })
                  }
                  required
                />

                <div className="lg:col-span-2">
                  <ImageUploader
                    existingImages={form.gambar_produk}
                    newFiles={newFiles}
                    onNewFilesChange={setNewFiles}
                    onRemoveExisting={handleRemoveExisting}
                    onRemoveNewFile={handleRemoveNewFile}
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
                  {editingId ? "Update Produk" : "Tambah Produk"}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
          {products.map((p, index) => (
            <div
              key={p.id_produk}
              className="bg-white rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative overflow-hidden">
                <img
                  src={p.gambar_produk[0] || "./placeholder.png"}
                  alt={p.nama_produk}
                  className="w-full h-36 sm:h-40 lg:h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) =>
                    ((e.target as HTMLImageElement).src = "./placeholder.png")
                  }
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {p.gambar_produk.length > 1 && (
                  <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-xs font-medium text-gray-700">
                    +{p.gambar_produk.length - 1}
                  </div>
                )}
              </div>

              <div className="p-4 sm:p-5 lg:p-6">
                <div className="mb-3 sm:mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 line-clamp-1">
                    {p.nama_produk}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-3">
                    {p.deskripsi}
                  </p>

                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span className="text-xs sm:text-sm text-gray-600">
                        Stok: {p.stok}
                      </span>
                    </div>
                    <div className="px-2 sm:px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs sm:text-sm font-medium">
                      Rp {p.harga.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => handleEdit(p)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-amber-50 text-amber-700 rounded-lg sm:rounded-xl hover:bg-amber-100 transition-all duration-200"
                  >
                    <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm font-medium">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(p.id_produk)}
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

        {products.length === 0 && (
          <div className="text-center py-12 sm:py-16">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full mb-4">
              <Package className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
              Belum Ada Produk
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-4">
              Mulai dengan menambahkan produk pertama Anda
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 text-sm sm:text-base"
            >
              Tambah Produk Pertama
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductManager;
