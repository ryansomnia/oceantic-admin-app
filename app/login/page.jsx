'use client'; // Menandakan bahwa ini adalah Client Component untuk interaktivitas

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Import komponen Image dari Next.js untuk optimasi gambar
import { useRouter } from 'next/navigation'; // Untuk navigasi setelah login sukses

export default function LoginPage() {
  const router = useRouter(); // Inisialisasi router untuk pengalihan halaman

  // State untuk menyimpan data form login
  const [formData, setFormData] = useState({
    username: '', // Bisa juga email, tergantung backend Anda
    password: '',
  });

  // State untuk pesan notifikasi (sukses/error)
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fungsi untuk menangani perubahan pada input form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Fungsi untuk menangani submit form
  const handleSubmit = async (e) => {
    e.preventDefault(); // Mencegah refresh halaman
    setMessage(''); // Reset pesan sukses
    setError(''); // Reset pesan error

    // Validasi sederhana pada sisi klien
    if (!formData.username || !formData.password) {
      setError('Username/Email dan Password wajib diisi!');
      return;
    }

    // --- LOGIKA LOGIN DENGAN BACKEND ASLI ---
    try {
      // Pastikan URL ini sesuai dengan endpoint backend Anda yang di-deploy (misalnya Vercel)
      // Untuk pengembangan lokal: 'https://api.oceanticsports.com/oceantic/v1/login'
      // Untuk deployment: 'https://your-backend-url.vercel.app/oceantic/v1/login'
      const response = await fetch('http://localhost:3025/oceantic/v1/login', { // Menggunakan port 5000 sesuai server.js terbaru
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage('Login Berhasil! Anda akan diarahkan...');
        console.log('Login successful:', data);

        // Simpan token dan informasi user ke localStorage
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('isLoggedIn', 'true'); // Untuk simulasi status login di Navbar
        localStorage.setItem('username', data.user.fullname); // Menggunakan nama lengkap dari backend untuk Navbar
        localStorage.setItem('userRole', data.user.role); // <-- SIMPAN PERAN PENGGUNA DI LOCALSTORAGE
        localStorage.setItem('userId', data.user.id); // <-- SIMPAN PERAN PENGGUNA DI LOCALSTORAGE

        // Tentukan halaman pengalihan berdasarkan peran pengguna
        let redirectPath = '/'; // Default untuk non-admin
        console.log('====================================');
        console.log(data.user);
        console.log('====================================');
        if (data.user.role === 'admin') {
               

          redirectPath = '/dashboard'; // Arahkan admin ke dashboard admin
          window.location.href = redirectPath;
        }

        setTimeout(() => {
          router.push(redirectPath); // Mengarahkan ke path yang ditentukan
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Login Gagal. Username atau Password salah.');
        console.error('Login failed:', errorData);
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan atau server. Coba lagi nanti.');
      console.error('Network or server error:', err);
    }
    // --- AKHIR LOGIKA LOGIN DENGAN BACKEND ASLI ---
  };

  return (
    // Container utama halaman dengan latar belakang gradient elegan
    <div className="min-h-screen bg-gradient-to-br from-oceanic-blue to-sky-3bg-sky-400 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Container untuk layout dua kolom (gambar + form) */}
      <div className="max-w-6xl w-full flex flex-col md:flex-row bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Kolom Kiri: Gambar */}
        <div className="md:w-1/2 relative h-64 md:h-auto">
          <Image
            src="/images/swim.jpg" // Ganti dengan path gambar login Anda
            alt="Login to OCEANTIC"
            layout="fill"
            objectFit="cover"
            className="rounded-t-2xl md:rounded-l-2xl md:rounded-t-none"
          />
        </div>

        {/* Kolom Kanan: Form Login */}
        <div className="md:w-1/2 p-8 sm:p-10 space-y-7 flex flex-col justify-center">
          <div>
            {/* Judul form */}
            <h2 className="mt-2 text-center text-4xl font-extrabold text-black">
              Sign In <span className="text-oceanic-blue">OCEANTIC</span> {/* Warna disesuaikan */}
            </h2>
          </div>

          {/* Form login */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Area pesan sukses */}
            {message && (
              <div className="bg-green-50 text-green-700 px-5 py-3 rounded-lg border border-green-200" role="alert">
                <p className="font-medium text-sm">{message}</p>
              </div>
            )}
            {/* Area pesan error */}
            {error && (
              <div className="bg-red-50 text-red-700 px-5 py-3 rounded-lg border border-red-200" role="alert">
                <p className="font-medium text-sm">{error}</p>
              </div>
            )}

            {/* Grid untuk input form */}
            <div className="grid grid-cols-1 gap-4">
              {/* Input Username/Email */}
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-oceanic-blue focus:border-oceanic-blue sm:text-base" /* Warna disesuaikan */
                placeholder="Username atau Email"
                value={formData.username}
                onChange={handleChange}
              />
              {/* Input Password */}
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-oceanic-blue focus:border-oceanic-blue sm:text-base" /* Warna disesuaikan */
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            {/* Link "Belum punya akun?" dipindahkan ke sini, di bawah input */}
           

            {/* Tombol Submit */}
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent text-lg font-semibold rounded-lg text-white bg-sky-300 hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-3bg-sky-400 transition duration-300 transform hover:scale-105" /* Warna disesuaikan */
              >
                Masuk
              </button>
            </div>

            {/* Opsi lupa password (opsional) - dikomentari sesuai permintaan */}
            {/* <div className="text-sm text-center">
              <Link href="/forgot-password" className="font-medium text-gray-600 hover:text-oceanic-blue">
                Lupa Password?
              </Link>
            </div> */}
          </form>
        </div>
      </div>
    </div>
  );
}
