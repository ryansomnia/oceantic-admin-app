"use client";
import React, { useState, useEffect } from "react";
// Kita mengasumsikan SweetAlert2 dimuat melalui CDN.
// Contoh: <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
// sehingga fungsi Swal tersedia secara global.
import Swal from 'sweetalert2';


// Impor ikon dari lucide-react
import { Search, Edit, Trash2, Plus, Save, X } from 'lucide-react';

const API_BASE_URL = 'http://localhost:3025/oceantic/v1';

// Komponen form yang dapat digunakan kembali untuk menambah dan mengedit user
const UserForm = ({ mode, initialData, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-8 mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {mode === 'add' ? 'Tambah User Baru' : 'Edit User'}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="fullname">Nama Lengkap</label>
          <input type="text" name="fullname" value={formData.fullname || ''} onChange={handleChange} className="border rounded-lg w-full py-2 px-3 text-gray-700" required />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="username">Username</label>
          <input type="text" name="username" value={formData.username || ''} onChange={handleChange} className="border rounded-lg w-full py-2 px-3 text-gray-700" required />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="email">Email</label>
          <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="border rounded-lg w-full py-2 px-3 text-gray-700" required />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="nohp">Nomor HP</label>
          <input type="text" name="nohp" value={formData.nohp || ''} onChange={handleChange} className="border rounded-lg w-full py-2 px-3 text-gray-700" required />
        </div>

        {/* Tampilkan bidang password hanya saat mode 'add' */}
        {mode === 'add' && (
          <>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="password">Password</label>
              <input type="password" name="password" value={formData.password || ''} onChange={handleChange} className="border rounded-lg w-full py-2 px-3 text-gray-700" required />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="repassword">Ulangi Password</label>
              <input type="password" name="repassword" value={formData.repassword || ''} onChange={handleChange} className="border rounded-lg w-full py-2 px-3 text-gray-700" required />
            </div>
          </>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="role">Role</label>
          <select name="role" value={formData.role || ''} onChange={handleChange} className="border rounded-lg w-full py-2 px-3 text-gray-700" required>
            <option value="">Pilih Role</option>
            <option value="admin">Admin</option>
            <option value="member">Member</option>
          </select>
        </div>
        
        {/* Tambahkan bidang gender */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="gender">Gender</label>
          <select name="gender" value={formData.gender || ''} onChange={handleChange} className="border rounded-lg w-full py-2 px-3 text-gray-700" required>
            <option value="">Pilih Gender</option>
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg"
          >
            <X /> Batal
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
            disabled={isLoading}
          >
            <Save /> {isLoading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default function UserManagementUI() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState('list');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [formUserData, setFormUserData] = useState({
    fullname: "",
    email: "",
    nohp: "",
    username: "",
    role: "",
    password: "", // Tambahkan password
    repassword: "", // Tambahkan repassword
    gender: "" // Tambahkan gender
  });
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  // Ambil token otentikasi dari localStorage
  const getToken = () => typeof window !== "undefined" ? localStorage.getItem('authToken') : null;

  // Fungsi untuk mengambil semua data pengguna dari API
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/getAllUsers`, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal memuat data pengguna.');
      }
      const data = await response.json();
      setUsers(data.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadUserDataForForm = async (id) => {
    setIsFormLoading(true);
    setFormError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/getUserById/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal memuat data pengguna untuk diedit.');
      }

      const data = await response.json();
      const user = data.data;

      // Set data pengguna yang ada, tanpa password dan repassword
      setFormUserData({
        fullname: user.fullname || "",
        username: user.username || "",
        email: user.email || "",
        nohp: user.nohp || "",
        role: user.role || "",
        gender: user.gender || ""
      });
    } catch (err) {
      console.error('Error loading user data for form:', err);
      setFormError(err.message);
      // Asumsi Swal tersedia
      Swal.fire('Error!', `Gagal memuat data pengguna: ${err.message}`, 'error');
      setCurrentPage('list');
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleFormSubmit = async (data) => {
    setIsFormLoading(true);
    setFormError(null);

    try {
      const token = getToken();
      if (!token) {
        throw new Error("Akses Ditolak. Token otentikasi tidak ditemukan.");
      }

      // Validasi repassword hanya untuk mode tambah user
      if (!currentUserId && data.password !== data.repassword) {
        setIsFormLoading(false);
        Swal.fire('Gagal!', 'Password dan Ulangi Password tidak cocok.', 'error');
        return;
      }
      
      const url = currentUserId
        ? `${API_BASE_URL}/updateUserProfile/${currentUserId}`
        : `${API_BASE_URL}/createUser`;
      const method = currentUserId ? 'PUT' : 'POST';

      // Hapus repassword dari payload sebelum dikirim ke API
      const { repassword, ...dataToSend } = data;

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.message || `Gagal ${currentUserId ? 'memperbarui' : 'menambah'} pengguna.`);
      }

      await fetchUsers();
      setCurrentPage('list');
      setCurrentUserId(null);
      Swal.fire('Berhasil!', `Pengguna berhasil di${currentUserId ? 'perbarui' : 'tambah'}.`, 'success');
    } catch (err) {
      console.error(`Error ${currentUserId ? 'updating' : 'adding'} user:`, err);
      setFormError(err.message);
      Swal.fire('Gagal!', `Terjadi kesalahan: ${err.message}`, 'error');
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleDeleteClick = (user) => {
    Swal.fire({
      title: 'Apakah Anda yakin?',
      text: `Anda akan menghapus pengguna ${user.fullname || user.username}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = getToken();
          if (!token) {
            Swal.fire('Error!', "Akses Ditolak. Token otentikasi tidak ditemukan.", 'error');
            return;
          }

          const res = await fetch(`${API_BASE_URL}/deleteUser/${user.id}`, {
            method: 'DELETE',
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          });

          const result = await res.json();

          if (res.ok) {
            Swal.fire('Berhasil!', `Pengguna berhasil dihapus.`, 'success');
            fetchUsers();
          } else {
            Swal.fire('Gagal!', `Terjadi kesalahan: ${result.message || "Terjadi kesalahan saat menghapus pengguna."}`, 'error');
          }
        } catch (err) {
          console.error("Error saat menghapus pengguna:", err);
          Swal.fire('Gagal!', "Terjadi kesalahan jaringan atau server.", 'error');
        }
      }
    });
  };

  const filteredUsers = users.filter(user =>
    user.fullname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.nohp?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (currentPage === 'edit' && currentUserId) {
      loadUserDataForForm(currentUserId);
    } else if (currentPage === 'add') {
      setFormUserData({
        fullname: "",
        email: "",
        nohp: "",
        username: "",
        role: "member", // Set default role
        password: "",
        repassword: "",
        gender: "Laki-laki" // Set default gender
      });
    }
  }, [currentPage, currentUserId]);

  // Render tampilan utama (daftar)
  if (currentPage === 'list') {
    if (loading) return <div className="text-center p-4">Memuat Data...</div>;
    if (error) return <div className="text-center p-4 text-red-500">Error: {error}</div>;

    return (
      <div className="p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Manajemen Pengguna</h2>
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari pengguna..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border text-black bg-white rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => {
              setCurrentPage('add');
              setCurrentUserId(null);
            }}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors w-full md:w-auto justify-center"
          >
            <Plus />
            <span>Tambah Pengguna</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="bg-white p-6 rounded-xl shadow-md overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fullname</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NoHP</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.fullname}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.nohp}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setCurrentPage('edit');
                          setCurrentUserId(user.id);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit"
                      >
                        <Edit />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(user)}
                        className="text-red-600 hover:text-red-900"
                        title="Hapus"
                      >
                        <Trash2 />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">Tidak ada pengguna ditemukan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Render tampilan form (tambah atau edit)
  if (currentPage === 'add' || currentPage === 'edit') {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        {isFormLoading && <div className="text-center p-4">Memuat formulir...</div>}
        {formError && <div className="text-center p-4 text-red-500">Error: {formError}</div>}
        <UserForm
          mode={currentPage}
          initialData={formUserData}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setCurrentPage('list');
            setCurrentUserId(null);
            setFormError(null);
          }}
          isLoading={isFormLoading}
        />
      </div>
    );
  }

  return null;
}
