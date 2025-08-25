"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    nohp: "",
    gender: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id]);

  const fetchUser = async () => {
    try {
      const res = await fetch(`https://api.oceanticsports.com/oceantic/v1/getUserById/${id}`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      const result = await res.json();
      if (res.ok && result.user) {
        setFormData({
          fullname: result.user.fullname || "",
          email: result.user.email || "",
          nohp: result.user.nohp || "",
          gender: result.user.gender || "",
        });
      } else {
        setError(result.detail || "Gagal memuat data pengguna");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat mengambil data");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`https://api.oceanticsports.com/oceantic/v1/updateUserProfile/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (res.ok && result.code === 200) {
        alert("Profil berhasil diperbarui");
        router.push("/user");
      } else {
        setError(result.detail || "Gagal memperbarui data");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat mengupdate data");
    }
  };

  if (loading) return <p>Memuat data...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Edit Pengguna</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1">Nama Lengkap</label>
          <input
            type="text"
            name="fullname"
            value={formData.fullname}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Nomor HP</label>
          <input
            type="text"
            name="nohp"
            value={formData.nohp}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="mb-6">
          <label className="block mb-1">Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Pilih Gender</option>
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>
        </div>
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push("/user")}
            className="px-4 py-2 border rounded"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Simpan
          </button>
        </div>
      </form>
    </div>
  );
}
