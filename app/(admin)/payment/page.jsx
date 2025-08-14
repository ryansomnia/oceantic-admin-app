'use client';

import React, { useEffect, useState } from "react";
import { Loader2, CheckCircle } from 'lucide-react';
import { LuSearch } from "react-icons/lu";
import { FaEye, FaCheck } from 'react-icons/fa';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

// Buat instance SweetAlert2 dengan React Content
const MySwal = withReactContent(Swal);

// Sesuaikan dengan URL backend Anda yang benar
const API_BASE_URL = 'http://localhost:3025/oceantic/v1';

export default function PaymentManagementPage() {
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(null); // Menyimpan ID pembayaran yang sedang diproses

  // Fungsi untuk memuat semua data pembayaran dari backend
  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/getAllPayment`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!res.ok) {
        throw new Error("Gagal mengambil data pembayaran.");
      }
      
      const result = await res.json();
      if (result.detail && Array.isArray(result.detail)) {
        setPayments(result.detail);
      } else {
        throw new Error("Data yang diterima tidak valid.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  // Efek samping untuk memanggil fetchPayments saat komponen pertama kali dimuat
  useEffect(() => {
    fetchPayments();
  }, []);

  // Filter data pembayaran berdasarkan pencarian
  const filteredPayments = payments.filter((payment) =>
    payment.full_name.toLowerCase().includes(search.toLowerCase()) ||
    payment.title.toLowerCase().includes(search.toLowerCase())
  );

  // Fungsi untuk menampilkan bukti pembayaran di tab baru
  const handleViewProof = (photoUrl) => {
    // Memeriksa apakah photoUrl ada sebelum membuka jendela
    if (!photoUrl) {
      MySwal.fire('Error!', 'Bukti pembayaran tidak tersedia.', 'error');
      return;
    }
    
    let fullUrl;
    // Cek apakah photoUrl sudah merupakan URL lengkap
    if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
      fullUrl = photoUrl;
    } else {
      // Jika hanya path, gabungkan dengan URL dasar backend
      fullUrl = `${API_BASE_URL.replace('/oceantic/v1', '')}${photoUrl}`;
    }

    window.open(fullUrl, '_blank');
  };

  // Fungsi untuk memperbarui status pembayaran melalui dropdown
  const handleStatusChange = async (paymentId, newStatus) => {
    setIsActionLoading(paymentId);
    try {
      const res = await fetch(`${API_BASE_URL}/updatePaymentStatusAdmin`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: paymentId, newStatus: newStatus }),
      });

      if (res.ok) {
        MySwal.fire('Berhasil!', `Status pembayaran berhasil diperbarui menjadi ${newStatus}.`, 'success');
        fetchPayments();
      } else {
        MySwal.fire('Gagal!', 'Gagal memperbarui status pembayaran.', 'error');
      }
    } catch (err) {
      MySwal.fire('Error', 'Terjadi kesalahan saat memperbarui status.', 'error');
    } finally {
      setIsActionLoading(null);
    }
  };


  // Tampilan loading penuh layar
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-xl">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
          <p className="text-xl font-semibold text-gray-600">Memuat data pembayaran...</p>
        </div>
      </div>
    );
  }

  // Tampilan error penuh layar
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-xl">
          <p className="text-xl font-semibold text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  // Fungsi helper untuk memformat tanggal
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // Fungsi helper untuk menentukan warna status
  const getStatusClasses = (status) => {
    switch (status) {
      case 'Success':
        return 'bg-blue-100 text-blue-800';
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8 font-sans">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Manajemen Pembayaran</h2>

      {/* Search Bar */}
      <div className="relative w-full mb-6">
        <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Cari berdasarkan nama peserta atau event..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 pr-4 py-2 border text-gray-800 bg-white rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Tabel Data Pembayaran */}
      <div className="bg-white p-6 rounded-xl shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Peserta</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Pendaftaran</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metode</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPayments.length > 0 ? (
              filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.full_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(payment.registration_date)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.payment_method}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(payment.payment_status)}`}>
                      {payment.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center">
                    <button
                      onClick={() => handleViewProof(payment.payment_photo_url)}
                      className={`text-blue-600 hover:text-blue-900 mr-4 ${!payment.payment_photo_url ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title="Lihat Bukti"
                      disabled={!payment.payment_photo_url}
                    >
                      <FaEye className="h-4 w-4" />
                    </button>
                    <div className="relative">
                      <select
                        value={payment.payment_status}
                        onChange={(e) => handleStatusChange(payment.id, e.target.value)}
                        className="appearance-none pr-8 py-1 pl-2 border rounded-md text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isActionLoading === payment.id}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Success">Success</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Refunded">Refunded</option>

                      </select>
                      {isActionLoading === payment.id && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">Tidak ada data pembayaran ditemukan.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
