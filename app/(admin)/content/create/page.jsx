"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function CreateArticlePage() {
  // DITAMBAHKAN: field 'path' untuk menyesuaikan dengan backend
  const [form, setForm] = useState({ title: "", content: "", category: "", path: "", image: null });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!token) {
      Swal.fire("Sesi Berakhir", "Anda harus login untuk membuat artikel.", "warning");
      setLoading(false);
      router.push("/login");
      return;
    }

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("content", form.content);
    formData.append("category", form.category);
    formData.append("path", form.path); // DITAMBAHKAN: Mengirim field 'path'

    if (form.image) {
      formData.append("image", form.image);
    }

    try {
      // DIPERBAIKI: URL API disesuaikan dengan rute backend yang benar
      const res = await fetch("https://api.oceanticsports.com/oceantic/v1/articles/createArticle", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        Swal.fire("Berhasil!", "Artikel berhasil dibuat.", "success");
        router.push("/admin/articles");
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
        {/* DITAMBAHKAN: Input untuk field 'path' */}
        <div>
          <label htmlFor="path" className="block text-sm font-medium text-gray-700 mb-1">Path (URL Slug)</label>
          <input
            type="text"
            id="path"
            name="path"
            value={form.path}
            onChange={handleChange}
            placeholder="Contoh: /berita/judul-artikel-ini"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
          />
           <p className="text-xs text-gray-500 mt-1">Opsional. Biarkan kosong jika tidak ada.</p>
        </div>
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">Gambar Artikel (Opsional)</label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
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
            onClick={() => router.back()}
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