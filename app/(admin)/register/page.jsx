'use client';

import React, { useEffect, useState } from "react";
import { Loader2 } from 'lucide-react';

// Import next/navigation dihapus untuk menghindari kesalahan kompilasi
// import { useRouter } from 'next/navigation';

// URL API backend
const API_BASE_URL = 'http://localhost:3025/oceantic/v1';

export default function ParticipantManagementPage() {
  const [participants, setParticipants] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const router = useRouter(); // Penghapusan inisialisasi router

  // Fungsi untuk memuat semua data peserta dari backend
  const fetchParticipants = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/getAllParticipants`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!res.ok) {
        throw new Error("Gagal mengambil data peserta.");
      }
      
      const result = await res.json();
      if (result.detail && Array.isArray(result.detail)) {
        const participantsWithId = result.detail.map((p, index) => ({
          ...p,
          id: p.id || index + 1 // Gunakan ID yang ada atau buat ID mock
        }));
        setParticipants(participantsWithId);
      } else {
        throw new Error("Data yang diterima tidak valid.");
      }
    } catch (err) {
      console.error('Error fetching participants:', err);
      setError(err.message);
      setParticipants([]);
    } finally {
      setLoading(false);
    }
  };

  // Efek samping untuk memanggil fetchParticipants saat komponen pertama kali dimuat
  useEffect(() => {
    fetchParticipants();
  }, []);

  // Filter data peserta berdasarkan nama lengkap atau nama klub
  const filteredParticipants = participants.filter((participant) =>
    (participant.full_name?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (participant.club_name?.toLowerCase() || '').includes(search.toLowerCase())
  );

  // Fungsi untuk menangani penghapusan peserta
  const handleDelete = async (id) => {
    if (window.confirm("Hapus peserta ini? Tindakan ini tidak bisa dibatalkan!")) {
      try {
        const res = await fetch(`${API_BASE_URL}/deleteParticipant/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (res.ok) {
          alert("Peserta berhasil dihapus.");
          fetchParticipants(); // Memuat ulang data setelah penghapusan
        } else {
          const errorResult = await res.json();
          alert(errorResult.message || "Tidak bisa menghapus peserta!");
        }
      } catch (err) {
        alert("Koneksi server gagal!");
      }
    }
  };

  // Mengarahkan ke halaman edit dengan ID peserta sebagai query parameter
  // Menggunakan window.location.href sebagai pengganti useRouter
  const handleEdit = (id) => {
    window.location.href = `/register/edit?id=${id}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-xl">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
          <p className="text-xl font-semibold text-gray-600">Memuat data peserta...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-xl">
          <p className="text-xl font-semibold text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  return (
    <div className="p-8 font-sans">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Manajemen Peserta</h2>

      <div className="relative w-full max-w-md mb-6">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
             <circle cx="11" cy="11" r="8"></circle>
             <path d="m21 21-4.3-4.3"></path>
           </svg>
        </div>
        <input
          type="text"
          placeholder="Cari berdasarkan nama atau klub..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 pr-4 py-2 border text-gray-800 bg-white rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md overflow-x-auto">
        <table className="w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Lengkap</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis Kelamin</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Klub</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori Gaya</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori Usia</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori Jarak</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Registrasi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredParticipants.length > 0 ? (
              filteredParticipants.map((participant) => (
                <tr key={participant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-normal text-sm text-gray-900">{participant.full_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{participant.gender}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{participant.club_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{participant.stroke_category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{participant.age_category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{participant.distance_category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(participant.registration_date)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(participant.id)}
                        className="px-3 py-1 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(participant.id)}
                        className="px-3 py-1 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="px-6 py-4 text-center text-gray-500">Tidak ada data peserta ditemukan.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
