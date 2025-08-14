"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function CreateArticlePage() {
  const [form, setForm] = useState({ title: "", content: "", category: "", image: null });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  // Tidak perlu userId dari localStorage karena backend akan mengambilnya dari JWT
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value, // Mengambil file pertama jika inputnya adalah file
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validasi token
    if (!token) {
      Swal.fire("Sesi Berakhir", "Anda harus login untuk membuat artikel.", "warning");
      setLoading(false);
      router.push("/login"); // Arahkan ke halaman login
      return;
    }

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("content", form.content);
    formData.append("category", form.category);
    // user_id tidak perlu dikirim dari frontend, backend akan mengambilnya dari token
    if (form.image) {
      formData.append("image", form.image);
    }

    try {
      // URL API disesuaikan menjadi '/articles' sesuai rute backend Anda
      const res = await fetch("http://localhost:3025/oceantic/v1/articles", {
        method: "POST",
        headers: {
          // Penting: Jangan set 'Content-Type': 'application/json' saat menggunakan FormData
          // Browser akan secara otomatis mengatur Content-Type: multipart/form-data
          // beserta boundary yang diperlukan saat Anda mengirim objek FormData.
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        Swal.fire("Berhasil!", "Artikel berhasil dibuat.", "success");
        // Ganti '/konten' dengan rute yang sesuai setelah artikel dibuat
        router.push("/admin/articles"); // Contoh: arahkan ke halaman manajemen artikel admin
      } else {
        Swal.fire("Gagal!", data.message || "Terjadi kesalahan saat membuat artikel.", "error");
      }
    } catch (err) {
      console.error("Error submitting article:", err);
      Swal.fire("Error!", "Koneksi server gagal atau terjadi masalah lain.", "error");
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white shadow-lg rounded-lg font-sans">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">Buat Artikel Baru</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Judul Artikel</label>
          <input
            type="text"
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Masukkan judul artikel"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
            required
          />
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Konten Artikel</label>
          <textarea
            id="content"
            name="content"
            value={form.content}
            onChange={handleChange}
            placeholder="Tulis konten artikel di sini..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
            rows="8"
            required
          ></textarea>
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
          <input
            type="text"
            id="category"
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="Contoh: Berita, Tips, Event"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
            required
          />
        </div>
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">Gambar Artikel (Opsional)</label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*" // Hanya menerima file gambar
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition duration-150 ease-in-out"
          />
          {form.image && (
            <p className="text-sm text-gray-500 mt-2">File terpilih: {form.image.name}</p>
          )}
        </div>
        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => router.back()} // Kembali ke halaman sebelumnya
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-2 rounded-lg transition duration-200"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Menyimpan..." : "Simpan Artikel"}
          </button>
        </div>
      </form>
    </div>
  );
}
