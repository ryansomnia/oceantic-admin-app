'use client'; 

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2'; // Import SweetAlert2
import Cookies from "js-cookie";


export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      Swal.fire({
        icon: 'warning',
        title: 'Oops...',
        text: 'Username/Email dan Password wajib diisi!',
      });
      return;
    }

    try {
      const response = await fetch('https://api.oceanticsports.com/oceantic/v1/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();

        // Simpan token dan usear info
        Cookies.set('authToken', data.token, { path: '/', expires: 1 }); // 1 hari
Cookies.set('role', data.user.role, { path: '/', expires: 1 });

        // localStorage.setItem('authToken', data.token);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', data.user.fullname);
        // localStorage.setItem('userRole', data.user.role);
        localStorage.setItem('userId', data.user.id);

        // Cek role
        if (data.user.role === 'admin') {
          Swal.fire({
            icon: 'success',
            title: 'Login Berhasil',
            text: 'Selamat datang, Admin!',
            timer: 2000,
            showConfirmButton: false,
          });

          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Akses Ditolak',
            text: 'Role Anda tidak sesuai untuk login ke sistem ini.',
          });

          // Hapus localStorage biar tidak nyangkut
          localStorage.clear();
        }
      } else {
        const errorData = await response.json();
        Swal.fire({
          icon: 'error',
          title: 'Login Gagal',
          text: errorData.message || 'Username atau Password salah.',
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Terjadi Kesalahan',
        text: 'Kesalahan jaringan atau server. Coba lagi nanti.',
      });
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-oceanic-blue to-sky-400 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl w-full flex flex-col md:flex-row bg-white rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Kolom Kiri: Gambar */}
        <div className="md:w-1/2 relative h-64 md:h-auto">
          <Image
            src="/images/swim.jpg"
            alt="Login to OCEANTIC"
            layout="fill"
            objectFit="cover"
            className="rounded-t-2xl md:rounded-l-2xl md:rounded-t-none"
          />
        </div>

        {/* Kolom Kanan: Form Login */}
        <div className="md:w-1/2 p-8 sm:p-10 space-y-7 flex flex-col justify-center">
          <h2 className="mt-2 text-center text-4xl font-extrabold text-black">
            Sign In <span className="text-oceanic-blue">OCEANTIC</span>
          </h2>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Input Username/Email */}
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-oceanic-blue focus:border-oceanic-blue sm:text-base"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-oceanic-blue focus:border-oceanic-blue sm:text-base"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />

            {/* Tombol Submit */}
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent text-lg font-semibold rounded-lg text-white bg-sky-300 hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-400 transition duration-300 transform hover:scale-105"
            >
              Masuk
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
