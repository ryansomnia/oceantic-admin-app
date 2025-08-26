'use client';

import React, { useEffect, useState } from "react";
import { Loader2 } from 'lucide-react';
import { LuSearch } from "react-icons/lu";
import { FaEye } from 'react-icons/fa';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);
const API_BASE_URL = 'https://api.oceanticsports.com/oceantic/v1';

export default function PaymentManagementPage() {
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(null);

  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/getAllPayment`);
      if (!res.ok) throw new Error("Gagal mengambil data pembayaran.");

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

  useEffect(() => {
    fetchPayments();
  }, []);

  // filtering
  const filteredPayments = payments.filter((payment) =>
    payment.full_name.toLowerCase().includes(search.toLowerCase()) ||
    payment.title.toLowerCase().includes(search.toLowerCase())
  );

  // pagination logic
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPayments = filteredPayments.slice(startIndex, startIndex + itemsPerPage);

  const handleViewProof = (photoUrl) => {
    if (!photoUrl) {
      MySwal.fire('Error!', 'Bukti pembayaran tidak tersedia.', 'error');
      return;
    }

    let fullUrl;
    if (photoUrl.startsWith('http')) {
      fullUrl = photoUrl;
    } else {
      fullUrl = `${API_BASE_URL.replace('/oceantic/v1', '')}${photoUrl}`;
    }

    window.open(fullUrl, '_blank');
  };

  const handleStatusChange = async (paymentId, newStatus) => {
    setIsActionLoading(paymentId);
    try {
      const res = await fetch(`${API_BASE_URL}/updatePaymentStatusAdmin`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: paymentId, newStatus }),
      });

      if (res.ok) {
        MySwal.fire('Berhasil!', `Status pembayaran berhasil diperbarui menjadi ${newStatus}.`, 'success');
        fetchPayments();
      } else {
        MySwal.fire('Gagal!', 'Gagal memperbarui status pembayaran.', 'error');
      }
    } catch {
      MySwal.fire('Error', 'Terjadi kesalahan saat memperbarui status.', 'error');
    } finally {
      setIsActionLoading(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case 'Success': return 'bg-blue-100 text-blue-800';
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl font-semibold text-red-600">Error: {error}</p>
      </div>
    );
  }

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
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1); // reset ke page 1 saat search
          }}
          className="pl-10 pr-4 py-2 border text-gray-800 bg-white rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Tabel */}
      <div className="bg-white p-6 rounded-xl shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Nama Peserta</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Event</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Tanggal Pendaftaran</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentPayments.length > 0 ? (
              currentPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-black whitespace-nowrap text-sm">{payment.full_name}</td>
                  <td className="px-6 py-4 text-black whitespace-nowrap text-sm">{payment.title}</td>
                  <td className="px-6 py-4 text-black whitespace-nowrap text-sm">{formatDate(payment.registration_date)}</td>
                  <td className="px-6 py-4 text-black whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${getStatusClasses(payment.payment_status)}`}>
                      {payment.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-black whitespace-nowrap text-sm font-medium flex items-center">
                    <button
                      onClick={() => handleViewProof(payment.payment_photo_url)}
                      className={`text-blue-600 hover:text-blue-900 mr-4 ${!payment.payment_photo_url ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={!payment.payment_photo_url}
                    >
                      <FaEye className="h-4 w-4" />
                    </button>
                    <div className="relative">
                      <select
                        value={payment.payment_status}
                        onChange={(e) => handleStatusChange(payment.id, e.target.value)}
                        className="appearance-none text-black pr-8 py-1 pl-2 border rounded-md text-sm cursor-pointer"
                        disabled={isActionLoading === payment.id}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Success">Success</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Refunded">Refunded</option>
                      </select>
                      {isActionLoading === payment.id && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">Tidak ada data pembayaran ditemukan.</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className=" text-black  flex justify-center items-center mt-6 space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded-lg disabled:opacity-50"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 border rounded-lg ${currentPage === i + 1 ? 'bg-blue-500 text-white' : ''}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
