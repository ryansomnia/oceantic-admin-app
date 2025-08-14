"use client";

import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { LuSearch } from "react-icons/lu";
import Swal from 'sweetalert2';
import React from 'react';

// Sesuaikan dengan URL backend Anda yang benar
const API_BASE_URL = 'http://localhost:3025/oceantic/v1'; // Pastikan ini sesuai dengan server.js Anda

export default function EventManagementPage() {
    // State untuk data event dan status loading/error
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State untuk fungsionalitas pencarian
    const [searchQuery, setSearchQuery] = useState('');

    // State untuk mengontrol tampilan: 'list', 'add', atau 'edit'
    const [currentPage, setCurrentPage] = useState('list');
    // State untuk menyimpan ID event yang sedang diedit (null jika mode tambah)
    const [currentEventId, setCurrentEventId] = useState(null);

    // State untuk data formulir (digunakan untuk tambah dan edit)
    const [formEventData, setFormEventData] = useState({
        title: '',
        event_date: '',
        location: '',
        description: '',
        registration_start_date: '',
        registration_end_date: '',
        event_status: 'Upcoming',
    });
    const [isFormLoading, setIsFormLoading] = useState(false);
    const [formError, setFormError] = useState(null);

    // Fungsi untuk mengambil token dari localStorage
    const getToken = () => localStorage.getItem('authToken');

    // --- Fungsi untuk Mengambil Semua Event ---
    const fetchEvents = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/events/getAllEvents`, { // Endpoint GET ALL events
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal mengambil data event.');
            }

            const data = await response.json();
            // Asumsi respons API untuk getAllEvents adalah { code: 200, message: 'Success', data: [...] }
            setEvents(data.data || []);
        } catch (err) {
            console.error('Error fetching events:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // --- Fungsi untuk Memuat Data Event ke Formulir (saat edit) ---
    const loadEventDataForForm = async (id) => {
        setIsFormLoading(true);
        setFormError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/events/getEventsById/${id}`, { // Endpoint GET event by ID
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal memuat data event untuk edit.');
            }

            const data = await response.json();
            const event = data; // Asumsi data event langsung dari root response untuk getEventById

            // Format tanggal untuk input type="date" dan datetime-local
            setFormEventData({
                id: event.id,
                title: event.title,
                event_date: event.event_date ? new Date(event.event_date).toISOString().split('T')[0] : '',
                location: event.location,
                description: event.description,
                registration_start_date: event.registration_start_date ? new Date(event.registration_start_date).toISOString().slice(0, 16) : '',
                registration_end_date: event.registration_end_date ? new Date(event.registration_end_date).toISOString().slice(0, 16) : '',
                event_status: event.event_status,
            });
        } catch (err) {
            console.error('Error loading event data for form:', err);
            setFormError(err.message);
            Swal.fire('Error!', `Gagal memuat data event: ${err.message}`, 'error');
            setCurrentPage('list'); // Kembali ke daftar jika gagal memuat
        } finally {
            setIsFormLoading(false);
        }
    };

    // --- Fungsi untuk Menangani Perubahan Input Formulir ---
    const handleFormInputChange = (e) => {
        const { name, value } = e.target;
        setFormEventData({ ...formEventData, [name]: value });
    };

    // --- Fungsi untuk Mengirim Formulir (Tambah/Edit) ---
    const handleSubmitForm = async (e) => {
        e.preventDefault();
        setIsFormLoading(true);
        setFormError(null);

        try {
            let response;
            let url;
            let method;

            if (currentEventId) { // Mode Edit
                method = 'PUT';
                url = `${API_BASE_URL}/events/edit/${currentEventId}`; // Sesuai dengan router.put('/events/:id')
            } else { // Mode Tambah
                method = 'POST';
                url = `${API_BASE_URL}/createEvent`; // Sesuai dengan router.post('/createEvent')
            }

            response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`,
                },
                body: JSON.stringify(formEventData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || errorData.message || `Gagal ${currentEventId ? 'memperbarui' : 'menambah'} event.`);
            }

            await fetchEvents(); // Refresh daftar event
            setCurrentPage('list'); // Kembali ke tampilan daftar
            setCurrentEventId(null); // Reset ID event yang sedang diedit
            Swal.fire('Berhasil!', `Event berhasil di${currentEventId ? 'perbarui' : 'tambah'}.`, 'success');
        } catch (err) {
            console.error(`Error ${currentEventId ? 'updating' : 'adding'} event:`, err);
            setFormError(err.message);
            Swal.fire('Gagal!', `Terjadi kesalahan: ${err.message}`, 'error');
        } finally {
            setIsFormLoading(false);
        }
    };

    // --- Fungsi untuk Menghapus Event ---
    const handleDelete = async (eventId) => {
        const result = await Swal.fire({
            title: 'Apakah Anda yakin?',
            text: "Anda tidak akan bisa mengembalikan ini!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        });

        if (result.isConfirmed) {
            setLoading(true);
            setError(null);
            try {
                // Perhatikan: Endpoint DELETE Anda di backend adalah '/events/deleteEvent' dengan ID di body
                // Namun, RESTful API biasanya menggunakan DELETE /events/:id
                // Saya akan menggunakan DELETE /events/:id di frontend, asumsikan backend akan disesuaikan
                // Jika backend Anda tetap menggunakan ID di body untuk DELETE /events/deleteEvent,
                // Anda perlu mengubah URL dan body di sini:
                // url: `${API_BASE_URL}/events/deleteEvent`,
                // body: JSON.stringify({ id: eventId }),
                const response = await fetch(`${API_BASE_URL}/events/${eventId}`, { // Endpoint DELETE event by ID
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getToken()}`,
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Gagal menghapus event.');
                }

                await fetchEvents(); // Refresh daftar event
                Swal.fire('Dihapus!', 'Event berhasil dihapus.', 'success');
            } catch (err) {
                console.error('Error deleting event:', err);
                setError(err.message);
                Swal.fire('Gagal!', `Terjadi kesalahan saat menghapus: ${err.message}`, 'error');
            } finally {
                setLoading(false);
            }
        }
    };

    // Fungsi untuk memformat tanggal
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    // Filter event berdasarkan searchQuery
    const filteredEvents = events.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        formatDate(event.event_date).toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Efek samping untuk mengambil event saat komponen dimuat
    useEffect(() => {
        fetchEvents();
    }, []);

    // Efek samping untuk memuat data event ke formulir saat currentEventId berubah (mode edit)
    // atau mereset form data saat mode 'add'
    useEffect(() => {
        if (currentPage === 'edit' && currentEventId) {
            loadEventDataForForm(currentEventId);
        } else if (currentPage === 'add') {
            // Reset form data for 'add' mode
            setFormEventData({
                title: '',
                event_date: '',
                location: '',
                description: '',
                registration_start_date: '',
                registration_end_date: '',
                event_status: 'Upcoming',
            });
        }
    }, [currentPage, currentEventId]);


    // --- Render Tampilan Daftar Event ---
    if (currentPage === 'list') {
        if (loading) return <div className="text-center p-4">Memuat event...</div>;
        if (error) return <div className="text-center p-4 text-red-500">Error: {error}</div>;

        return (
            <div className="p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Manajemen Event</h2>

                {/* Search, Add Event Button */}
                <div className=" flex flex-col md:flex-row justify-between  items-center mb-6 space-y-4 md:space-y-0">
                    <div className="relative w-full md:w-1/2">
                        <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-300" />
                        <input
                            type="text"
                            placeholder="Cari event..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 border text-black bg-white rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        onClick={() => {
                            setCurrentPage('add'); // Arahkan ke mode 'add'
                            setCurrentEventId(null); // Pastikan ID event null untuk mode tambah
                        }}
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors w-full md:w-auto justify-center"
                    >
                        <FaPlus />
                        <span>Tambah Event</span>
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {/* Table Events */}
                <div className="bg-white p-6 rounded-xl shadow-md overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judul</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Event</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lokasi</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredEvents.length > 0 ? (
                                filteredEvents.map(event => (
                                    <tr key={event.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{event.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(event.event_date)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{event.location}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                event.event_status === 'Open for Registration' ? 'bg-green-100 text-green-800' :
                                                event.event_status === 'Upcoming' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {event.event_status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => {
                                                    setCurrentPage('edit'); // Arahkan ke mode 'edit'
                                                    setCurrentEventId(event.id);
                                                }}
                                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                title="Edit"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(event.id)}
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
                                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">Tidak ada event ditemukan.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    {/* --- Render Tampilan Formulir Tambah Event (Simulasi event/create/page.jsx) --- */}
    if (currentPage === 'add') {
        if (isFormLoading) return <div className="text-center p-4">Memuat formulir tambah event...</div>;
        if (formError) return <div className="text-center p-4 text-red-500">Error: {formError}</div>;

        return (
            <div className="p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Tambah Event Baru</h2>

                <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 mx-auto">
                    <form onSubmit={handleSubmitForm}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="title">Judul Event</label>
                            <input type="text" name="title" value={formEventData.title || ''} onChange={handleFormInputChange} className="border rounded-lg w-full py-2 px-3 text-gray-700" required />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="event_date">Tanggal Event</label>
                            <input type="date" name="event_date" value={formEventData.event_date || ''} onChange={handleFormInputChange} className="border rounded-lg w-full py-2 px-3 text-gray-700" required />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="location">Lokasi</label>
                            <input type="text" name="location" value={formEventData.location || ''} onChange={handleFormInputChange} className="border rounded-lg w-full py-2 px-3 text-gray-700" required />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="description">Deskripsi</label>
                            <textarea name="description" value={formEventData.description || ''} onChange={handleFormInputChange} className="border rounded-lg w-full py-2 px-3 text-gray-700" rows="3"></textarea>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="registration_start_date">Mulai Pendaftaran</label>
                            <input type="datetime-local" name="registration_start_date" value={formEventData.registration_start_date || ''} onChange={handleFormInputChange} className="border rounded-lg w-full py-2 px-3 text-gray-700" />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="registration_end_date">Akhir Pendaftaran</label>
                            <input type="datetime-local" name="registration_end_date" value={formEventData.registration_end_date || ''} onChange={handleFormInputChange} className="border rounded-lg w-full py-2 px-3 text-gray-700" />
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="event_status">Status Event</label>
                            <select name="event_status" value={formEventData.event_status || ''} onChange={handleFormInputChange} className="border rounded-lg w-full py-2 px-3 text-gray-700" required>
                                <option value="Upcoming">Upcoming</option>
                                <option value="Open for Registration">Open for Registration</option>
                                <option value="Closed">Closed</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => {
                                    setCurrentPage('list'); // Kembali ke tampilan daftar
                                    setFormError(null); // Bersihkan error form
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
                                {isFormLoading ? 'Menyimpan...' : 'Tambah Event'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    {/* --- Render Tampilan Formulir Edit Event --- */}
    if (currentPage === 'edit') {
        if (isFormLoading) return <div className="text-center p-4">Memuat formulir edit event...</div>;
        if (formError) return <div className="text-center p-4 text-red-500">Error: {formError}</div>;

        return (
            <div className="p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Edit Event</h2>

                <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 mx-auto">
                    <form onSubmit={handleSubmitForm}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="title">Judul Event</label>
                            <input type="text" name="title" value={formEventData.title || ''} onChange={handleFormInputChange} className="border rounded-lg w-full py-2 px-3 text-gray-700" required />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="event_date">Tanggal Event</label>
                            <input type="date" name="event_date" value={formEventData.event_date || ''} onChange={handleFormInputChange} className="border rounded-lg w-full py-2 px-3 text-gray-700" required />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="location">Lokasi</label>
                            <input type="text" name="location" value={formEventData.location || ''} onChange={handleFormInputChange} className="border rounded-lg w-full py-2 px-3 text-gray-700" required />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="description">Deskripsi</label>
                            <textarea name="description" value={formEventData.description || ''} onChange={handleFormInputChange} className="border rounded-lg w-full py-2 px-3 text-gray-700" rows="3"></textarea>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="registration_start_date">Mulai Pendaftaran</label>
                            <input type="datetime-local" name="registration_start_date" value={formEventData.registration_start_date || ''} onChange={handleFormInputChange} className="border rounded-lg w-full py-2 px-3 text-gray-700" />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="registration_end_date">Akhir Pendaftaran</label>
                            <input type="datetime-local" name="registration_end_date" value={formEventData.registration_end_date || ''} onChange={handleFormInputChange} className="border rounded-lg w-full py-2 px-3 text-gray-700" />
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="event_status">Status Event</label>
                            <select name="event_status" value={formEventData.event_status || ''} onChange={handleFormInputChange} className="border rounded-lg w-full py-2 px-3 text-gray-700" required>
                                <option value="Upcoming">Upcoming</option>
                                <option value="Open for Registration">Open for Registration</option>
                                <option value="Closed">Closed</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => {
                                    setCurrentPage('list'); // Kembali ke tampilan daftar
                                    setCurrentEventId(null); // Reset ID event
                                    setFormError(null); // Bersihkan error form
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
                                {isFormLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}
