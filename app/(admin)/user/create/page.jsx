"use client";
import React, { useState } from "react";
// Kita mengasumsikan SweetAlert2 dimuat melalui CDN
// Contoh: <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
// dan fungsi `Swal` tersedia secara global.

// Impor ikon dari lucide-react untuk tampilan yang lebih baik
import { UserPlus, Save, X } from 'lucide-react';
import ProtectedPage from "@/app/components/ProtectedPage";

const API_BASE_URL = 'https://api.oceanticsports.com/oceantic/v1';

export default function CreateUserForm() {
  const [formData, setFormData] = useState({
    username: "",
    fullname: "",
    email: "",
    nohp: "",
    password: "",
    repassword: "",
    role: "User", // Nilai default
    gender: "Laki-laki" // Nilai default, sesuaikan jika perlu
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Ambil token otentikasi dari localStorage
  const getToken = () => typeof window !== "undefined" ? localStorage.getItem('authToken') : null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Validasi repassword
    if (formData.password !== formData.repassword) {
      setIsLoading(false);
      // Menggunakan SweetAlert2 untuk pesan error
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Password dan Repassword tidak cocok!',
      });
      return;
    }

    try {
      const token = getToken();
      if (!token) {
        Swal.fire('Akses Ditolak', 'Token otentikasi tidak ditemukan. Silakan login kembali.', 'error');
        setIsLoading(false);
        return;
      }

      // Memastikan semua field terisi
      const { repassword, ...dataToSend } = formData;
      
      const response = await fetch(`${API_BASE_URL}/createUser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal menambah pengguna.');
      }

      // Menggunakan SweetAlert2 untuk pesan sukses
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Pengguna baru berhasil ditambahkan.',
      });

      // Reset form setelah berhasil
      setFormData({
        username: "",
        fullname: "",
        email: "",
        nohp: "",
        password: "",
        repassword: "",
        role: "User",
        gender: "Laki-laki"
      });

    } catch (err) {
      console.error('Error saat menambah pengguna:', err);
      setError(err.message);
      // Menggunakan SweetAlert2 untuk pesan error
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: `Terjadi kesalahan: ${err.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedPage>
    <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 transform transition-all duration-300 hover:scale-105">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-6 flex items-center justify-center gap-3">
          <UserPlus size={32} /> Tambah Pengguna Baru
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="fullname">Nama Lengkap</label>
              <input type="text" name="fullname" value={formData.fullname} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" required />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="username">Username</label>
              <input type="text" name="username" value={formData.username} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" required />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" required />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="nohp">Nomor HP</label>
              <input type="text" name="nohp" value={formData.nohp} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" required />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="password">Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" required />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="repassword">Ulangi Password</label>
              <input type="password" name="repassword" value={formData.repassword} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" required />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="role">Role</label>
              <select name="role" value={formData.role} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" required>
                <option value="Admin">Admin</option>
                <option value="User">User</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="gender">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" required>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
          </div>
          {error && <div className="text-red-500 text-center mb-4">{error}</div>}
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              className="flex items-center gap-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded-lg transition-colors"
            >
              <X /> Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
              disabled={isLoading}
            >
              <Save /> {isLoading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
    </ProtectedPage>
  );
}
