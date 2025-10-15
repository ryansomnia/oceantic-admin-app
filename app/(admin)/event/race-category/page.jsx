'use client';

import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { LuSearch } from "react-icons/lu";
import Swal from 'sweetalert2';
import React from 'react';
import Cookies from "js-cookie";
import ProtectedPage from '@/app/components/ProtectedPage';

// Sesuaikan dengan URL backend Anda yang benar
const API_BASE_URL = 'https://api.oceanticsports.com/oceantic/v1';

export default function RaceCategoryManagementPage() {
    // State untuk data event (untuk dropdown pilihan event)
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState('');

    // State untuk data kategori perlombaan dan status loading/error
    const [raceCategories, setRaceCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State untuk fungsionalitas pencarian
    const [searchQuery, setSearchQuery] = useState('');
    
    // State untuk pagination
    const [currentPageNumber, setCurrentPageNumber] = useState(1);
    const itemsPerPage = 5;

    // State untuk mengontrol tampilan: 'list', 'add', atau 'edit'
    const [currentPage, setCurrentPage] = useState('list');
    // State untuk menyimpan ID kategori perlombaan yang sedang diedit (null jika mode tambah)
    const [currentRaceCategoryId, setCurrentRaceCategoryId] = useState(null);

    // State untuk data formulir (digunakan untuk tambah dan edit)
    const [formRaceCategoryData, setFormRaceCategoryData] = useState({
        event_id: '',
        race_number: '',
        distance: '',
        swim_style: '',
        age_group_class: '',
        gender_category: '',
    });
    const [isFormLoading, setIsFormLoading] = useState(false);
    const [formError, setFormError] = useState(null);

    // Fungsi untuk mengambil token dari localStorage
    const getToken = () => Cookies.get('authToken');
    
    // --- Fungsi untuk Mengambil Semua Event (untuk dropdown) ---
    const fetchEventsForDropdown = async () => {
        try {
            const token = getToken();
            if (!token) {
                throw new Error('Token otentikasi tidak ditemukan. Silakan login kembali.');
            }

            const response = await fetch(`${API_BASE_URL}/events/getAllEvents`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal mengambil daftar event.');
            }

            const data = await response.json();
            setEvents(data.data || []);
            // Set event pertama sebagai default jika ada
            if (data.data && data.data.length > 0) {
                setSelectedEventId(data.data[0].id);
                setFormRaceCategoryData(prev => ({ ...prev, event_id: data.data[0].id }));
            }
        } catch (err) {
            console.error('Error fetching events for dropdown:', err);
            setError(`Gagal memuat daftar event: ${err.message}`);
        }
    };

    // --- Fungsi untuk Mengambil Kategori Perlombaan berdasarkan Event ID ---
    const fetchRaceCategories = async (eventId) => {
        if (!eventId) {
            setRaceCategories([]);
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

            const response = await fetch(`${API_BASE_URL}/getAllRaceCategoriesByEventId/${eventId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal mengambil data kategori perlombaan.');
            }

            const data = await response.json();
            setRaceCategories(data.detail || []); // Sesuaikan dengan struktur respons API Anda
        } catch (err) {
            console.error('Error fetching race categories:', err);
            setError(err.message);
            if (err.message.includes('Token otentikasi tidak ditemukan') || err.message.includes('Unauthorized')) {
                Swal.fire('Sesi Habis', 'Sesi Anda telah berakhir. Silakan login kembali.', 'warning');
            }
        } finally {
            setLoading(false);
        }
    };

    // --- Fungsi untuk Memuat Data Kategori Perlombaan ke Formulir (saat edit) ---
    const loadRaceCategoryDataForForm = async (id) => {
        setIsFormLoading(true);
        setFormError(null);
        try {
            const token = getToken();
            if (!token) {
                throw new Error('Token otentikasi tidak ditemukan. Silakan login kembali.');
            }

            const response = await fetch(`${API_BASE_URL}/getRaceCategoryById/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal memuat data kategori perlombaan untuk edit.');
            }

            const data = await response.json();
            setFormRaceCategoryData(data.detail); // Sesuaikan dengan struktur respons API Anda
        } catch (err) {
            console.error('Error loading race category data for form:', err);
            setFormError(err.message);
            Swal.fire('Error!', `Gagal memuat data kategori perlombaan: ${err.message}`, 'error');
            setCurrentPage('list'); // Kembali ke daftar jika gagal memuat
        } finally {
            setIsFormLoading(false);
        }
    };

    // --- Fungsi untuk Menangani Perubahan Input Formulir ---
    const handleFormInputChange = (e) => {
        const { name, value } = e.target;
        setFormRaceCategoryData({ ...formRaceCategoryData, [name]: value });
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

            if (currentRaceCategoryId) { // Mode Edit
                method = 'PUT';
                url = `${API_BASE_URL}/updateRaceCategory/${currentRaceCategoryId}`;
            } else { // Mode Tambah
                method = 'POST';
                url = `${API_BASE_URL}/createRaceCategory`;
            }

            response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(formRaceCategoryData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || errorData.message || `Gagal ${currentRaceCategoryId ? 'memperbarui' : 'menambah'} kategori perlombaan.`);
            }

            await fetchRaceCategories(selectedEventId); // Refresh daftar kategori perlombaan
            setCurrentPage('list'); // Kembali ke tampilan daftar
            setCurrentRaceCategoryId(null); // Reset ID kategori perlombaan yang sedang diedit
            Swal.fire('Berhasil!', `Kategori perlombaan berhasil di${currentRaceCategoryId ? 'perbarui' : 'tambah'}.`, 'success');
        } catch (err) {
            console.error(`Error ${currentRaceCategoryId ? 'updating' : 'adding'} race category:`, err);
            setFormError(err.message);
            Swal.fire('Gagal!', `Terjadi kesalahan: ${err.message}`, 'error');
            if (err.message.includes('Token otentikasi tidak ditemukan') || err.message.includes('Unauthorized')) {
                Swal.fire('Sesi Habis', 'Sesi Anda telah berakhir. Silakan login kembali.', 'warning');
            }
        } finally {
            setIsFormLoading(false);
        }
    };

    // --- Fungsi untuk Menghapus Kategori Perlombaan ---
    const handleDelete = async (raceCategoryId) => {
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

                const response = await fetch(`${API_BASE_URL}/deleteRaceCategory/${raceCategoryId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Gagal menghapus kategori perlombaan.');
                }

                await fetchRaceCategories(selectedEventId); // Refresh daftar kategori perlombaan
                Swal.fire('Dihapus!', 'Kategori perlombaan berhasil dihapus.', 'success');
            } catch (err) {
                console.error('Error deleting race category:', err);
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

    // Filter kategori perlombaan berdasarkan searchQuery
    const filteredRaceCategories = raceCategories.filter(category =>
        category.race_number.toString().includes(searchQuery.toLowerCase()) ||
        category.distance.toString().includes(searchQuery.toLowerCase()) ||
        category.swim_style.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.age_group_class.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.gender_category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Hitung data yang ditampilkan di halaman saat ini
    const startIndex = (currentPageNumber - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const visibleRaceCategories = filteredRaceCategories.slice(startIndex, endIndex);

    // Hitung jumlah total halaman
    const totalPages = Math.ceil(filteredRaceCategories.length / itemsPerPage);

    // Efek samping untuk mengambil event saat komponen dimuat
    useEffect(() => {
        fetchEventsForDropdown();
    }, []);

    // Efek samping untuk mengambil kategori perlombaan ketika selectedEventId berubah
    useEffect(() => {
        if (selectedEventId) {
            fetchRaceCategories(selectedEventId);
        } else {
            setRaceCategories([]); // Kosongkan daftar jika tidak ada event yang dipilih
        }
    }, [selectedEventId]);

    // Efek samping untuk memuat data kategori perlombaan ke formulir saat currentRaceCategoryId berubah (mode edit)
    // atau mereset form data saat mode 'add'
    useEffect(() => {
        if (currentPage === 'edit' && currentRaceCategoryId) {
            loadRaceCategoryDataForForm(currentRaceCategoryId);
        } else if (currentPage === 'add') {
            // Reset form data for 'add' mode, tapi pertahankan event_id yang dipilih
            setFormRaceCategoryData({
                event_id: selectedEventId, // Pastikan event_id tetap yang dipilih
                race_number: '',
                distance: '',
                swim_style: '',
                age_group_class: '',
                gender_category: '',
            });
        }
    }, [currentPage, currentRaceCategoryId, selectedEventId]);


    // --- Render Tampilan Daftar Kategori Perlombaan ---
    if (currentPage === 'list') {
        if (loading && selectedEventId) return <div className="text-center p-4">Memuat kategori perlombaan...</div>;
        if (error) return <div className="text-center p-4 text-red-500">Error: {error}</div>;

        return (
            <ProtectedPage>
            <div className="p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Manajemen Kategori Perlombaan</h2>

                {/* Event Selection Dropdown */}
                <div className="mb-6">
                    <label htmlFor="event-select" className="block text-gray-700 text-sm font-medium mb-2">Pilih Event:</label>
                    <select
                        id="event-select"
                        value={selectedEventId}
                        onChange={(e) => setSelectedEventId(e.target.value)}
                        className="border rounded-lg w-full md:w-1/2 py-2 px-3 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">-- Pilih Event --</option>
                        {events.map(event => (
                            <option key={event.id} value={event.id}>{event.title}</option>
                        ))}
                    </select>
                </div>

                {/* Search, Add Race Category Button */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
                    <div className="relative w-full md:w-1/2">
                        <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-300" />
                        <input
                            type="text"
                            placeholder="Cari kategori perlombaan..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPageNumber(1); // Kembali ke halaman 1 saat pencarian
                            }}
                            className="pl-10 pr-4 py-2 border text-black bg-white rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        onClick={() => {
                            if (!selectedEventId) {
                                Swal.fire('Peringatan!', 'Silakan pilih event terlebih dahulu untuk menambah kategori perlombaan.', 'warning');
                                return;
                            }
                            setCurrentPage('add');
                            setCurrentRaceCategoryId(null);
                        }}
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors w-full md:w-auto justify-center"
                    >
                        <FaPlus />
                        <span>Tambah Kategori Perlombaan</span>
                    </button>
                </div>

                {/* Info jika belum ada event dipilih */}
                {!selectedEventId && !loading && (
                    <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <span className="block sm:inline">Silakan pilih event dari dropdown di atas untuk melihat kategori perlombaannya.</span>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {/* Table Race Categories */}
                <div className="bg-white p-6 rounded-xl shadow-md overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Lomba</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jarak</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gaya Renang</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelompok Umur</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori Gender</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {visibleRaceCategories.length > 0 ? (
                                visibleRaceCategories.map(category => (
                                    <tr key={category.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{category.race_number}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{category.distance}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{category.swim_style}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{category.age_group_class}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{category.gender_category}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => {
                                                    setCurrentPage('edit');
                                                    setCurrentRaceCategoryId(category.id);
                                                }}
                                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                title="Edit"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(category.id)}
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
                                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">Tidak ada kategori perlombaan ditemukan untuk event ini.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

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
            </ProtectedPage>
        );
    }

    {/* --- Render Tampilan Formulir Tambah/Edit Kategori Perlombaan --- */}
    if (currentPage === 'add' || currentPage === 'edit') {
        if (isFormLoading) return <div className="text-center p-4">Memuat formulir...</div>;
        if (formError) return <div className="text-center p-4 text-red-500">Error: {formError}</div>;

        return (
            <div className="p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">{currentPage === 'add' ? 'Tambah Kategori Perlombaan Baru' : 'Edit Kategori Perlombaan'}</h2>

                <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 mx-auto">
                    <form onSubmit={handleSubmitForm}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="event_id">ID Event</label>
                            <input
                                type="text"
                                name="event_id"
                                value={formRaceCategoryData.event_id || ''}
                                onChange={handleFormInputChange}
                                className="border rounded-lg w-full py-2 px-3 text-gray-700 bg-gray-100 cursor-not-allowed"
                                required
                                readOnly // Event ID harusnya tidak bisa diubah langsung di form ini
                            />
                            <p className="text-xs text-gray-500 mt-1">ID Event otomatis terisi dari pilihan di halaman sebelumnya.</p>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="race_number">Nomor Lomba</label>
                            <input type="number" name="race_number" value={formRaceCategoryData.race_number || ''} onChange={handleFormInputChange} className="border rounded-lg w-full py-2 px-3 text-gray-700" required />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="distance">Jarak (meter)</label>
                            <input type="text" name="distance" value={formRaceCategoryData.distance || ''} onChange={handleFormInputChange} className="border rounded-lg w-full py-2 px-3 text-gray-700" required />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="swim_style">Gaya Renang</label>
                            <input type="text" name="swim_style" value={formRaceCategoryData.swim_style || ''} onChange={handleFormInputChange} className="border rounded-lg w-full py-2 px-3 text-gray-700" required />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="age_group_class">Kelompok Umur</label>
                            <input type="text" name="age_group_class" value={formRaceCategoryData.age_group_class || ''} onChange={handleFormInputChange} className="border rounded-lg w-full py-2 px-3 text-gray-700" required />
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="gender_category">Kategori Gender</label>
                            <select name="gender_category" value={formRaceCategoryData.gender_category || ''} onChange={handleFormInputChange} className="border rounded-lg w-full py-2 px-3 text-gray-700" required>
                                <option value="">-- Pilih Kategori Gender --</option>
                                <option value="Laki-laki">Laki-laki</option>
                                <option value="Perempuan">Perempuan</option>
                                <option value="Mixed">Mixed</option>
                            </select>
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
                                {isFormLoading ? 'Menyimpan...' : (currentPage === 'add' ? 'Tambah Kategori' : 'Simpan Perubahan')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}
