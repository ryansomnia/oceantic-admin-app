'use client';

import React, { useEffect, useState } from "react";
import { Loader2 } from 'lucide-react';

const API_BASE_URL = 'http://localhost:3025/oceantic/v1';

// Fungsi helper untuk mengambil ID dari URL tanpa Next.js useRouter
const getParticipantIdFromUrl = () => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
  }
  return null;
};

export default function EditParticipantPage() {
  const participantId = getParticipantIdFromUrl();

  const [formData, setFormData] = useState({
    full_name: '',
    gender: '',
    club_name: '',
    stroke_category: '',
    age_category: '',
    distance_category: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Efek samping untuk memuat data peserta yang ada saat halaman dimuat
  useEffect(() => {
    if (participantId) {
      const fetchParticipantData = async () => {
        setLoading(true);
        setError(null);
        try {
          // Ganti dengan endpoint API Anda yang sebenarnya untuk mendapatkan data peserta berdasarkan ID
          const res = await fetch(`${API_BASE_URL}/getParticipantById/${participantId}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (!res.ok) {
            throw new Error("Gagal mengambil data peserta.");
          }

          const result = await res.json();
          if (result.detail) {
            // Mengisi form dengan data yang didapat
            setFormData({
              full_name: result.detail.full_name || '',
              gender: result.detail.gender || '',
              club_name: result.detail.club_name || '',
              stroke_category: result.detail.stroke_category || '',
              age_category: result.detail.age_category || '',
              distance_category: result.detail.distance_category || ''
            });
          } else {
            throw new Error("Data peserta tidak ditemukan.");
          }
        } catch (err) {
          console.error('Error fetching participant data:', err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchParticipantData();
    } else {
      setLoading(false);
      setError("ID peserta tidak ditemukan.");
    }
  }, [participantId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/editParticipant/${participantId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorResult = await res.json();
        throw new Error(errorResult.message || "Gagal memperbarui data peserta.");
      }

      alert("Data peserta berhasil diperbarui!");
      window.location.href = '/participant-management';
    } catch (err) {
      console.error('Error updating participant:', err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
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

  return (
    <div className="p-8 font-sans bg-gray-50 min-h-screen flex flex-col items-center">
      <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Edit Peserta</h2>
        <p className="text-sm text-gray-500 mb-6">ID Peserta: {participantId}</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Jenis Kelamin</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Pilih Jenis Kelamin</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>

          <div>
            <label htmlFor="club_name" className="block text-sm font-medium text-gray-700">Klub</label>
            <input
              type="text"
              id="club_name"
              name="club_name"
              value={formData.club_name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="stroke_category" className="block text-sm font-medium text-gray-700">Kategori Gaya</label>
            <input
              type="text"
              id="stroke_category"
              name="stroke_category"
              value={formData.stroke_category}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="age_category" className="block text-sm font-medium text-gray-700">Kategori Usia</label>
            <input
              type="text"
              id="age_category"
              name="age_category"
              value={formData.age_category}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="distance_category" className="block text-sm font-medium text-gray-700">Kategori Jarak</label>
            <input
              type="text"
              id="distance_category"
              name="distance_category"
              value={formData.distance_category}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
            >
              {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
