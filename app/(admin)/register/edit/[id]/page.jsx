'use client';

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";

const API_BASE_URL = "http://localhost:3025/oceantic/v1";

export default function EditRegistrationPage() {
  const { id } = useParams(); // ambil :id dari URL
  const router = useRouter();

  const [formData, setFormData] = useState({
    full_name: "",
    date_of_birth: "",
    gender: "",
    email: "",
    phone_number: "",
    club_name: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    payment_status: "Pending",
    total_fee: 0,
  });

  const [loading, setLoading] = useState(true);
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  // Ambil data participant by id
  const fetchParticipant = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/getRegistrationById/${id}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Gagal ambil data peserta");
      const result = await res.json();
      setFormData(result.data);
    } catch (err) {
      console.error("Error fetch peserta:", err);
      Swal.fire("Error", "Tidak bisa memuat data peserta", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchParticipant();
  }, [id]);

  // Handle perubahan input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle submit update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/editRegistration/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        Swal.fire("Sukses", "Data peserta berhasil diperbarui", "success").then(() => {
          router.push("/participants"); // balik ke list peserta
        });
      } else {
        const errData = await res.json();
        Swal.fire("Error", errData.message || "Gagal update peserta", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Terjadi kesalahan server", "error");
    }
  };

  if (loading) {
    return <p className="p-6 text-gray-600">Memuat data...</p>;
  }

  return (
    <div className="p-8 font-sans max-w-3xl mx-auto">
      <h2 className=" text-black text-2xl font-bold mb-6">Edit Registrasi Peserta</h2>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow-md">
        <div>
          <label className=" text-black block text-sm font-medium">Nama Lengkap</label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name || ""}
            onChange={handleChange}
            className="text-black w-full border rounded-lg p-2 mt-1"
          />
        </div>

        <div>
          <label className=" text-black block text-sm font-medium">Tanggal Lahir</label>
          <input
            type="date"
            name="date_of_birth"
            value={formData.date_of_birth?.split("T")[0] || ""}
            onChange={handleChange}
            className="text-black w-full border rounded-lg p-2 mt-1"
          />
        </div>

        <div>
          <label className=" text-black block text-sm font-medium">Jenis Kelamin</label>
          <select
            name="gender"
            value={formData.gender || ""}
            onChange={handleChange}
            className="text-black w-full border rounded-lg p-2 mt-1"
          >
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>
        </div>

        <div>
          <label className=" text-black block text-sm font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email || ""}
            onChange={handleChange}
            className="text-black w-full border rounded-lg p-2 mt-1"
          />
        </div>

        <div>
          <label className=" text-black block text-sm font-medium">Nomor HP</label>
          <input
            type="text"
            name="phone_number"
            value={formData.phone_number || ""}
            onChange={handleChange}
            className="text-black w-full border rounded-lg p-2 mt-1"
          />
        </div>

        <div>
          <label className=" text-black block text-sm font-medium">Nama Klub</label>
          <input
            type="text"
            name="club_name"
            value={formData.club_name || ""}
            onChange={handleChange}
            className="text-black w-full border rounded-lg p-2 mt-1"
          />
        </div>

        <div>
          <label className=" text-black block text-sm font-medium">Kontak Darurat (Nama)</label>
          <input
            type="text"
            name="emergency_contact_name"
            value={formData.emergency_contact_name || ""}
            onChange={handleChange}
            className="text-black w-full border rounded-lg p-2 mt-1"
          />
        </div>

        <div>
          <label className=" text-black block text-sm font-medium">Kontak Darurat (No HP)</label>
          <input
            type="text"
            name="emergency_contact_phone"
            value={formData.emergency_contact_phone || ""}
            onChange={handleChange}
            className="text-black w-full border rounded-lg p-2 mt-1"
          />
        </div>

        <div>
          <label className=" text-black block text-sm font-medium">Status Pembayaran</label>
          <select
            name="payment_status"
            value={formData.payment_status || "Pending"}
            onChange={handleChange}
            className="text-black w-full border rounded-lg p-2 mt-1"
          >
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div>
          <label className=" text-black block text-sm font-medium">Total Biaya</label>
          <input
            type="number"
            name="total_fee"
            value={formData.total_fee || 0}
            onChange={handleChange}
            className="text-black w-full border rounded-lg p-2 mt-1"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  );
}
