"use client";

import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { LuSearch } from "react-icons/lu";
import Swal from 'sweetalert2';
import React from 'react';

// Sesuaikan dengan URL backend Anda yang benar
const API_BASE_URL = 'http://localhost:3025/oceantic/v1';

export default function HeatSwimmerManagementPage() {
    // State untuk data heat details (untuk dropdown pilihan heat)
    const [heatDetails, setHeatDetails] = useState([]);
    const [selectedHeatDetailId, setSelectedHeatDetailId] = useState('');

    // State untuk data perenang di heat dan status loading/error
    const [heatSwimmers, setHeatSwimmers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State untuk fungsionalitas pencarian
    const [searchQuery, setSearchQuery] = useState('');

    // State untuk mengontrol tampilan: 'list', 'add', atau 'edit'
    const [currentPage, setCurrentPage] = useState('list');
    // State untuk menyimpan ID perenang yang sedang diedit (null jika mode tambah)
    const [currentHeatSwimmerId, setCurrentHeatSwimmerId] = useState(null);

    // State untuk data formulir (digunakan untuk tambah dan edit)
    const [formHeatSwimmerData, setFormHeatSwimmerData] = useState({
        heat_detail_id: '',
        lane_number: '',
        swimmer_name: '',
        club_name: '',
        qet_time: '',
        result_time: '',
        registration_id: '',
    });
    const [isFormLoading, setIsFormLoading] = useState(false);
    const [formError, setFormError] = useState(null);

    // Fungsi untuk mengambil token dari localStorage
    const getToken = () => localStorage.getItem('authToken');

    // --- Fungsi untuk Mengambil Semua Heat Details (untuk dropdown) ---
    const fetchHeatDetailsForDropdown = async () => {
        try {
            const token = getToken();
            if (!token) {
                throw new Error('Token otentikasi tidak ditemukan. Silakan login kembali.');
            }

            // Menggunakan GET sesuai dengan router.get('/getAllHeatDetails')
            const response = await fetch(`${API_BASE_URL}/getAllHeatDetails`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal mengambil daftar detail heat.');
            }

            const data = await response.json();
            // Asumsi data.detail berisi array heat details
            setHeatDetails(data.detail || []);
            // Set heat detail pertama sebagai default jika ada
            if (data.detail && data.detail.length > 0) {
                setSelectedHeatDetailId(data.detail[0].id);
                setFormHeatSwimmerData(prev => ({ ...prev, heat_detail_id: data.detail[0].id }));
            }
        } catch (err) {
            console.error('Error fetching heat details for dropdown:', err);
            setError(`Gagal memuat daftar detail heat: ${err.message}`);
        }
    };

    // --- Fungsi untuk Mengambil Perenang Heat berdasarkan Heat Detail ID ---
    const fetchHeatSwimmers = async (heatDetailId) => {
        if (!heatDetailId) {
            setHeatSwimmers([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const token = getToken();
            if (!token) {
                throw new Error('Token otentikasi tidak ditemukan. Silakan login kembali.');
            }

            // Menggunakan GET dan parameter di URL sesuai dengan router.get('/getAllHeatSwimmersByHeatDetailId/:id')
            const response = await fetch(`${API_BASE_URL}/getAllHeatSwimmersByHeatDetailId/${heatDetailId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal mengambil data perenang di heat.');
            }

            const data = await response.json();
            setHeatSwimmers(data.detail || []); // Sesuaikan dengan struktur respons API Anda
        } catch (err) {
            console.error('Error fetching heat swimmers:', err);
            setError(err.message);
            if (err.message.includes('Token otentikasi tidak ditemukan') || err.message.includes('Unauthorized')) {
                Swal.fire('Sesi Habis', 'Sesi Anda telah berakhir. Silakan login kembali.', 'warning');
            }
        } finally {
            setLoading(false);
        }
    };

    // --- Fungsi untuk Memuat Data Perenang Heat ke Formulir (saat edit) ---
    const loadHeatSwimmerDataForForm = async (id) => {
        setIsFormLoading(true);
        setFormError(null);
        try {
            const token = getToken();
            if (!token) {
                throw new Error('Token otentikasi tidak ditemukan. Silakan login kembali.');
            }

            // Menggunakan GET dan parameter di URL sesuai dengan router.get('/getHeatSwimmerById/:id')
            const response = await fetch(`${API_BASE_URL}/getHeatSwimmerById/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal memuat data perenang di heat untuk edit.');
            }

            const data = await response.json();
            setFormHeatSwimmerData(data.detail); // Sesuaikan dengan struktur respons API Anda
        } catch (err) {
            console.error('Error loading heat swimmer data for form:', err);
            setFormError(err.message);
            Swal.fire('Error!', `Gagal memuat data perenang di heat: ${err.message}`, 'error');
            setCurrentPage('list'); // Kembali ke daftar jika gagal memuat
        } finally {
            setIsFormLoading(false);
        }
    };

    // --- Fungsi untuk Menangani Perubahan Input Formulir ---
    const handleFormInputChange = (e) => {
        const { name, value } = e.target;
        setFormHeatSwimmerData({ ...formHeatSwimmerData, [name]: value });
    };

    // --- Fungsi untuk Mengirim Formulir (Tambah/Edit) ---
    const handleSubmitForm = async (e) => {
        e.preventDefault();
        setIsFormLoading(true);
        setFormError(null);

        try {
            const token = getToken();
            if (!token) {
                throw new Error('Token otentikasi tidak ditemukan. Silakan login kembali.');
            }

            let response;
            let url;
            let method;
            let payload = { ...formHeatSwimmerData };

            if (currentHeatSwimmerId) { // Mode Edit
                method = 'PUT'; // Sesuai dengan router.put('/updateHeatSwimmer/:id')
                url = `${API_BASE_URL}/updateHeatSwimmer/${currentHeatSwimmerId}`;
                // Hapus ID dari payload karena sudah ada di URL
                delete payload.id;
            } else { // Mode Tambah
                method = 'POST'; // Sesuai dengan router.post('/createHeatSwimmer')
                url = `${API_BASE_URL}/createHeatSwimmer`;
                // Pastikan heat_detail_id sudah diatur dari selectedHeatDetailId
                payload.heat_detail_id = selectedHeatDetailId;
            }

            response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || errorData.message || `Gagal ${currentHeatSwimmerId ? 'memperbarui' : 'menambah'} perenang di heat.`);
            }

            await fetchHeatSwimmers(selectedHeatDetailId); // Refresh daftar perenang
            setCurrentPage('list'); // Kembali ke tampilan daftar
            setCurrentHeatSwimmerId(null); // Reset ID perenang yang sedang diedit
            Swal.fire('Berhasil!', `Perenang di heat berhasil di${currentHeatSwimmerId ? 'perbarui' : 'tambah'}.`, 'success');
        } catch (err) {
            console.error(`Error ${currentHeatSwimmerId ? 'updating' : 'adding'} heat swimmer:`, err);
            setFormError(err.message);
            Swal.fire('Gagal!', `Terjadi kesalahan: ${err.message}`, 'error');
            if (err.message.includes('Token otentikasi tidak ditemukan') || err.message.includes('Unauthorized')) {
                Swal.fire('Sesi Habis', 'Sesi Anda telah berakhir. Silakan login kembali.', 'warning');
            }
        } finally {
            setIsFormLoading(false);
        }
    };

    // --- Fungsi untuk Menghapus Perenang dari Heat ---
    const handleDelete = async (heatSwimmerId) => {
        const result = await Swal.fire({
            title: 'Apakah Anda yakin?',
            text: "Anda tidak akan bisa mengembalikan ini!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal',
            customClass: {
                confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg mr-2',
                cancelButton: 'bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg'
            },
            buttonsStyling: false
        });

        if (result.isConfirmed) {
            setLoading(true);
            setError(null);
            try {
                const token = getToken();
                if (!token) {
                    throw new Error('Token otentikasi tidak ditemukan. Silakan login kembali.');
                }

                // Menggunakan DELETE dan parameter di URL sesuai dengan router.delete('/deleteHeatSwimmer/:id')
                const response = await fetch(`${API_BASE_URL}/deleteHeatSwimmer/${heatSwimmerId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Gagal menghapus perenang dari heat.');
                }

                await fetchHeatSwimmers(selectedHeatDetailId); // Refresh daftar perenang
                Swal.fire('Dihapus!', 'Perenang berhasil dihapus dari heat.', 'success');
            } catch (err) {
                console.error('Error deleting heat swimmer:', err);
                setError(err.message);
                Swal.fire('Gagal!', `Terjadi kesalahan saat menghapus: ${err.message}`, 'error');
                if (err.message.includes('Token otentikasi tidak ditemukan') || err.message.includes('Unauthorized')) {
                    Swal.fire('Sesi Habis', 'Sesi Anda telah berakhir. Silakan login kembali.', 'warning');
                }
            } finally {
                setLoading(false);
            }
        }
    };

    // Filter perenang berdasarkan searchQuery
    const filteredHeatSwimmers = heatSwimmers.filter(swimmer =>
        swimmer.swimmer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (swimmer.club_name && swimmer.club_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        swimmer.lane_number.toString().includes(searchQuery.toLowerCase())
    );

    // Efek samping untuk mengambil heat details saat komponen dimuat
    useEffect(() => {
        fetchHeatDetailsForDropdown();
    }, []);

    // Efek samping untuk mengambil perenang heat ketika selectedHeatDetailId berubah
    useEffect(() => {
        if (selectedHeatDetailId) {
            fetchHeatSwimmers(selectedHeatDetailId);
        } else {
            setHeatSwimmers([]); // Kosongkan daftar jika tidak ada heat detail yang dipilih
        }
    }, [selectedHeatDetailId]);

    // Efek samping untuk memuat data perenang heat ke formulir saat currentHeatSwimmerId berubah (mode edit)
    // atau mereset form data saat mode 'add'
    useEffect(() => {
        if (currentPage === 'edit' && currentHeatSwimmerId) {
            loadHeatSwimmerDataForForm(currentHeatSwimmerId);
        } else if (currentPage === 'add') {
            // Reset form data for 'add' mode, tapi pertahankan heat_detail_id yang dipilih
            setFormHeatSwimmerData({
                heat_detail_id: selectedHeatDetailId, // Pastikan heat_detail_id tetap yang dipilih
                lane_number: '',
                swimmer_name: '',
                club_name: '',
                qet_time: '',
                result_time: '',
                registration_id: '',
            });
        }
    }, [currentPage, currentHeatSwimmerId, selectedHeatDetailId]);


    // --- Render Tampilan Daftar Perenang Heat ---
    if (currentPage === 'list') {
        if (loading && selectedHeatDetailId) return <div className="text-center p-4">Memuat perenang heat...</div>;
        if (error) return <div className="text-center p-4 text-red-500">Error: {error}</div>;

        return (
            <div className="p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Manajemen Perenang di Heat</h2>

                {/* Heat Detail Selection Dropdown */}
                <div className="mb-6">
                    <label htmlFor="heat-detail-select" className="block text-gray-700 text-sm font-medium mb-2">Pilih Detail Heat:</label>
                    <select
                        id="heat-detail-select"
                        value={selectedHeatDetailId}
                        onChange={(e) => setSelectedHeatDetailId(e.target.value)}
                        className="border rounded-lg w-full md:w-1/2 py-2 px-3 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">-- Pilih Detail Heat --</option>
                        {heatDetails.map(detail => (
                            <option key={detail.id} value={detail.id}>
                                Heat {detail.heat_number} (Race Category: {detail.race_category_id || 'N/A'})
                                {/* Sesuaikan ini jika ada field deskriptif lain di heat_details */}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Search, Add Heat Swimmer Button */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
                    <div className="relative w-full md:w-1/2">
                        <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-300" />
                        <input
                            type="text"
                            placeholder="Cari perenang..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 border text-black bg-white rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        onClick={() => {
                            if (!selectedHeatDetailId) {
                                Swal.fire('Peringatan!', 'Silakan pilih detail heat terlebih dahulu untuk menambah perenang.', 'warning');
                                return;
                            }
                            setCurrentPage('add');
                            setCurrentHeatSwimmerId(null);
                        }}
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors w-full md:w-auto justify-center"
                    >
                        <FaPlus />
                        <span>Tambah Perenang Heat</span>
                    </button>
                </div>

                {/* Info jika belum ada heat detail dipilih */}
                {!selectedHeatDetailId && !loading && (
                    <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <span className="block sm:inline">Silakan pilih detail heat dari dropdown di atas untuk melihat perenangnya.</span>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {/* Table Heat Swimmers */}
                <div className="bg-white p-6 rounded-xl shadow-md overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Heat Detail</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lintasan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Perenang</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Klub</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">QET Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Registrasi</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredHeatSwimmers.length > 0 ? (
                                filteredHeatSwimmers.map(swimmer => (
                                    <tr key={swimmer.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{swimmer.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{swimmer.heat_detail_id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{swimmer.lane_number}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{swimmer.swimmer_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{swimmer.club_name || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{swimmer.qet_time || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{swimmer.result_time || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{swimmer.registration_id || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => {
                                                    setCurrentPage('edit');
                                                    setCurrentHeatSwimmerId(swimmer.id);
                                                }}
                                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                title="Edit"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(swimmer.id)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Hapus"
                                            >
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="px-6 py-4 text-center text-gray-500">Tidak ada perenang ditemukan untuk detail heat ini.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    {/* --- Render Tampilan Formulir Tambah/Edit Perenang Heat --- */}
    if (currentPage === 'add' || currentPage === 'edit') {
        if (isFormLoading) return <div className="text-center p-4">Memuat formulir...</div>;
        if (formError) return <div className="text-center p-4 text-red-500">Error: {formError}</div>;

        return (
            <div className="p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">{currentPage === 'add' ? 'Tambah Perenang Heat Baru' : 'Edit Perenang Heat'}</h2>

                <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 mx-auto">
                    <form onSubmit={handleSubmitForm}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="heat_detail_id">ID Heat Detail</label>
                            <input
                                type="text"
                                name="heat_detail_id"
                                value={formHeatSwimmerData.heat_detail_id || ''}
                                onChange={handleFormInputChange}
                                className="border rounded-lg w-full py-2 px-3 text-gray-700 bg-gray-100 cursor-not-allowed"
                                required
                                readOnly // Heat Detail ID harusnya tidak bisa diubah langsung di form ini
                            />
                            <p className="text-xs text-gray-500 mt-1">ID Heat Detail otomatis terisi dari pilihan di halaman sebelumnya.</p>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="lane_number">Nomor Lintasan</label>
                            <input type="number" name="lane_number" value={formHeatSwimmerData.lane_number || ''} onChange={handleFormInputChange} className="border rounded-lg w-full py-2 px-3 text-gray-700" required />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="swimmer_name">Nama Perenang</label>
                            <input type="text" name="swimmer_name" value={formHeatSwimmerData.swimmer_name || ''} onChange={handleFormInputChange} className="border rounded-lg w-full py-2 px-3 text-gray-700" required />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="club_name">Nama Klub (Opsional)</label>
                            <input type="text" name="club_name" value={formHeatSwimmerData.club_name || ''} onChange={handleFormInputChange} className="border rounded-lg w-full py-2 px-3 text-gray-700" />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="qet_time">QET Time (Opsional, format HH:MM:SS.ms)</label>
                            <input type="text" name="qet_time" value={formHeatSwimmerData.qet_time || ''} onChange={handleFormInputChange} className="border rounded-lg w-full py-2 px-3 text-gray-700" placeholder="Contoh: 00:00:30.500" />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="result_time">Result Time (Opsional, format HH:MM:SS.ms)</label>
                            <input type="text" name="result_time" value={formHeatSwimmerData.result_time || ''} onChange={handleFormInputChange} className="border rounded-lg w-full py-2 px-3 text-gray-700" placeholder="Contoh: 00:00:29.800" />
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="registration_id">ID Registrasi (Opsional)</label>
                            <input type="text" name="registration_id" value={formHeatSwimmerData.registration_id || ''} onChange={handleFormInputChange} className="border rounded-lg w-full py-2 px-3 text-gray-700" />
                            <p className="text-xs text-gray-500 mt-1">Ini adalah ID registrasi perenang jika terdaftar melalui sistem.</p>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => {
                                    setCurrentPage('list');
                                    setFormError(null);
                                }}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg mr-2"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                                disabled={isFormLoading}
                            >
                                {isFormLoading ? 'Menyimpan...' : (currentPage === 'add' ? 'Tambah Perenang' : 'Simpan Perubahan')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}
