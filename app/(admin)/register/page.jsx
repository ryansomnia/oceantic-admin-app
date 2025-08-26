'use client';

import React, { useEffect, useState } from "react";
import { Loader2, Search } from 'lucide-react';
import Swal from 'sweetalert2';

// URL API backend
const API_BASE_URL = 'https://api.oceanticsports.com/oceantic/v1';

export default function ParticipantManagementPage() {
  const [participants, setParticipants] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State untuk pagination
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const itemsPerPage = 7;

  // Ambil token otentikasi dari localStorage
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  // Fungsi untuk memuat semua data peserta dari backend
  const fetchParticipants = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/getAllParticipants`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // Tambahkan token
        },
      });
      
      if (!res.ok) {
        throw new Error("Gagal mengambil data peserta.");
      }
      
      const result = await res.json();
      if (result.data && Array.isArray(result.data)) {
        const participantsWithId = result.data.map((p, index) => ({
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
  
  // Hitung data yang ditampilkan di halaman saat ini
  const startIndex = (currentPageNumber - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const visibleParticipants = filteredParticipants.slice(startIndex, endIndex);

  // Hitung jumlah total halaman
  const totalPages = Math.ceil(filteredParticipants.length / itemsPerPage);

  // Fungsi untuk menangani penghapusan peserta
  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Tindakan ini tidak bisa dibatalkan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Menghapus...',
          text: 'Harap tunggu...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        try {
          const res = await fetch(`${API_BASE_URL}/deleteRegistration/${id}`, {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          });
          if (res.ok) {
            Swal.fire('Berhasil!', 'Peserta berhasil dihapus.', 'success');
            fetchParticipants(); // Memuat ulang data setelah penghapusan
          } else {
            const errorResult = await res.json();
            Swal.fire('Gagal!', errorResult.message || "Tidak bisa menghapus peserta!", 'error');
          }
        } catch (err) {
          Swal.fire('Gagal!', "Koneksi server gagal!", 'error');
        }
      }
    });
  };

  // Mengarahkan ke halaman edit dengan ID peserta
  const handleEdit = (id) => {
    window.location.href = `/register/edit/${id}`;
  };

  const handleViewDetail = (id) => {
    window.location.href = `/register/detail/${id}`;
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
           <Search className="h-5 w-5"/>
        </div>
        <input
          type="text"
          placeholder="Cari berdasarkan nama atau klub..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPageNumber(1); // Kembali ke halaman 1 saat pencarian
          }}
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Biaya</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Pembayaran</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Registrasi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {visibleParticipants.length > 0 ? (
              visibleParticipants.map((participant) => (
                <tr key={participant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{participant.full_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{participant.gender}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{participant.club_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    Rp {participant.total_fee?.toLocaleString('id-ID') || 0}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                         participant.payment_status === 'Success'
                          ? 'bg-green-100 text-green-700'
                          : participant.payment_status === 'Pending' || participant.payment_status === 'Paid' 
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {participant.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {formatDate(participant.registration_date)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(participant.id)}
                        className="px-3 py-1 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(participant.id)}
                        className="px-3 py-1 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600"
                      >
                        Hapus
                      </button>
                      <button
                        onClick={() => handleViewDetail(participant.id)}
                        className="px-3 py-1 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700"
                      >
                        Detail
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  Tidak ada data peserta ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {/* Pagination Controls */}
        {totalPages > 1 && (
            <div className="flex justify-center items-center mt-6 space-x-2">
              <button
                onClick={() => setCurrentPageNumber(prev => Math.max(prev - 1, 1))}
                disabled={currentPageNumber === 1}
                className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index + 1}
                  onClick={() => setCurrentPageNumber(index + 1)}
                  className={`px-4 py-2 border rounded-lg ${
                    currentPageNumber === index + 1
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPageNumber(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPageNumber === totalPages}
                className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
      </div>
    </div>
  );
}
