"use client";

import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { LuSearch } from "react-icons/lu";
import Swal from 'sweetalert2';
import React from 'react';
import ProtectedPage from "@/app/components/ProtectedPage";
import Cookies from "js-cookie";
import { useRouter } from 'next/navigation';


// Sesuaikan dengan URL backend Anda yang benar
const API_BASE_URL = 'https://api.oceanticsports.com/oceantic/v1';

export default function ArticleManagementPage() {
    const router = useRouter();
    const [user, setUser] = useState({
      fullname: "",
      role: "",
    });
    // State untuk data artikel dan status loading/error
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State untuk fungsionalitas pencarian dan filter kategori
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
    const [uniqueCategories, setUniqueCategories] = useState([]); // Untuk dropdown filter kategori

    // State untuk mengontrol tampilan: 'list', 'add', atau 'edit'
    const [currentPage, setCurrentPage] = useState('list');
    // State untuk menyimpan ID artikel yang sedang diedit (null jika mode tambah)
    const [currentArticleId, setCurrentArticleId] = useState(null);

    // State untuk data formulir (digunakan untuk tambah dan edit)
    const [formArticleData, setFormArticleData] = useState({
        title: '',
        content: '',
        category: '',
        image_file: null, // Untuk upload file gambar baru
        image_url_existing: '', // Untuk menampilkan gambar yang sudah ada
        remove_image: false, // Untuk menandai apakah gambar lama akan dihapus
        user_id: '1', // Contoh user_id, sesuaikan jika ada sistem user dinamis
    });
    const [isFormLoading, setIsFormLoading] = useState(false);
    const [formError, setFormError] = useState(null);

    // Fungsi untuk mengambil token dari localStorage
    const getToken = () => Cookies.get('authToken');

    // --- Fungsi untuk Mengambil Semua Artikel ---
    const fetchArticles = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = getToken();
            if (!token) {
                throw new Error('Token otentikasi tidak ditemukan. Silakan login kembali.');
            }

            // Menggunakan GET sesuai dengan router.get('/getAllArticles')
            const response = await fetch(`${API_BASE_URL}/articles/getAllArticles`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal mengambil daftar artikel.');
            }

            const data = await response.json();
            setArticles(data || []); // Asumsi data langsung array artikel
            
            // Ekstrak kategori unik untuk filter dropdown
            const categories = [...new Set(data.map(article => article.category))];
            setUniqueCategories(categories);

        } catch (err) {
            console.error('Error fetching articles:', err);
            setError(err.message);
            if (err.message.includes('Token otentikasi tidak ditemukan') || err.message.includes('Unauthorized')) {
                Swal.fire('Sesi Habis', 'Sesi Anda telah berakhir. Silakan login kembali.', 'warning');
            }
        } finally {
            setLoading(false);
        }
    };

    // --- Fungsi untuk Memuat Data Artikel ke Formulir (saat edit) ---
    const loadArticleDataForForm = async (id) => {
        setIsFormLoading(true);
        setFormError(null);
        try {
            const token = getToken();
            if (!token) {
                throw new Error('Token otentikasi tidak ditemukan. Silakan login kembali.');
            }

            // Menggunakan GET dan parameter di URL sesuai dengan router.get('/getArticleById/:id')
            const response = await fetch(`${API_BASE_URL}/articles/getArticleById/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal memuat data artikel untuk edit.');
            }

            const data = await response.json();
            // Isi formArticleData dengan data yang diambil
            setFormArticleData({
                title: data.title || '',
                content: data.content || '',
                category: data.category || '',
                image_file: null, // Reset file input
                image_url_existing: data.image_url || '', // Simpan URL gambar yang sudah ada
                remove_image: false, // Reset checkbox hapus gambar
                user_id: data.user_id || '1', // Pertahankan user_id atau default
            });
        } catch (err) {
            console.error('Error loading article data for form:', err);
            setFormError(err.message);
            Swal.fire('Error!', `Gagal memuat data artikel: ${err.message}`, 'error');
            setCurrentPage('list'); // Kembali ke daftar jika gagal memuat
        } finally {
            setIsFormLoading(false);
        }
    };

    // --- Fungsi untuk Menangani Perubahan Input Formulir ---
    const handleFormInputChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        if (type === 'file') {
            setFormArticleData({ ...formArticleData, image_file: files[0] });
        } else if (type === 'checkbox') {
            setFormArticleData({ ...formArticleData, [name]: checked });
        } else {
            setFormArticleData({ ...formArticleData, [name]: value });
        }
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

            const formData = new FormData();
            formData.append('title', formArticleData.title);
            formData.append('content', formArticleData.content);
            formData.append('category', formArticleData.category);
            formData.append('user_id', formArticleData.user_id); // Pastikan user_id disertakan

            if (formArticleData.image_file) {
                formData.append('image', formArticleData.image_file);
            }

            if (currentArticleId) { // Mode Edit
                // Jika tidak ada file baru diupload tapi ada gambar lama, sertakan image_url_existing
                if (!formArticleData.image_file && formArticleData.image_url_existing) {
                    formData.append('image_url_existing', formArticleData.image_url_existing);
                }
                // Jika checkbox hapus gambar dicentang
                if (formArticleData.remove_image) {
                    formData.append('remove_image', 'true');
                }
            }

            let response;
            let url;
            let method;

            if (currentArticleId) { // Mode Edit
                method = 'PUT'; // Sesuai dengan router.put('/updateArticle/:id')
                url = `${API_BASE_URL}/articles/updateArticle/${currentArticleId}`;
            } else { // Mode Tambah
                method = 'POST'; // Sesuai dengan router.post('/createArticle')
                url = `${API_BASE_URL}/articles/createArticle`;
            }

            // Penting: Jangan set 'Content-Type': 'application/json' saat menggunakan FormData
            response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Gagal ${currentArticleId ? 'memperbarui' : 'menambah'} artikel.`);
            }

            await fetchArticles(); // Refresh daftar artikel
            setCurrentPage('list'); // Kembali ke tampilan daftar
            setCurrentArticleId(null); // Reset ID artikel yang sedang diedit
            Swal.fire('Berhasil!', `Artikel berhasil di${currentArticleId ? 'perbarui' : 'tambah'}.`, 'success');
        } catch (err) {
            console.error(`Error ${currentArticleId ? 'updating' : 'adding'} article:`, err);
            setFormError(err.message);
            Swal.fire('Gagal!', `Terjadi kesalahan: ${err.message}`, 'error');
            if (err.message.includes('Token otentikasi tidak ditemukan') || err.message.includes('Unauthorized')) {
                Swal.fire('Sesi Habis', 'Sesi Anda telah berakhir. Silakan login kembali.', 'warning');
            }
        } finally {
            setIsFormLoading(false);
        }
    };

    // --- Fungsi untuk Menghapus Artikel ---
    const handleDelete = async (articleId) => {
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

                // Menggunakan DELETE dan parameter di URL sesuai dengan router.delete('/deleteArticle/:id')
                const response = await fetch(`${API_BASE_URL}/articles/deleteArticle/${articleId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Gagal menghapus artikel.');
                }

                await fetchArticles(); // Refresh daftar artikel
                Swal.fire('Dihapus!', 'Artikel berhasil dihapus.', 'success');
            } catch (err) {
                console.error('Error deleting article:', err);
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

    // Filter artikel berdasarkan searchQuery dan selectedCategoryFilter
    const filteredArticles = articles.filter(article => {
        const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              article.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategoryFilter === '' || article.category === selectedCategoryFilter;
        return matchesSearch && matchesCategory;
    });

    // Efek samping untuk mengambil artikel saat komponen dimuat
    
    useEffect(() => {
        const token = Cookies.get("authToken");
        const fullname = localStorage.getItem("username");
        const role = Cookies.get("role");
      
        if (!token) {
          Swal.fire({
            icon: "error",
            title: "Sesi berakhir",
            text: "Silakan login kembali",
            timer: 2000,
            showConfirmButton: false,
          }).then(() => router.push("/login"));
        } else {
          setUser({ fullname, role });
          fetchArticles(); // 🔥 panggil fetch di sini setelah login valid
        }
      }, [router]);

    // useEffect(() => {
    //     fetchArticles();
    // }, []);

    // Efek samping untuk memuat data artikel ke formulir saat currentArticleId berubah (mode edit)
    // atau mereset form data saat mode 'add'
    useEffect(() => {
        if (currentPage === 'edit' && currentArticleId) {
            loadArticleDataForForm(currentArticleId);
        } else if (currentPage === 'add') {
            // Reset form data for 'add' mode
            setFormArticleData({
                title: '',
                content: '',
                category: '',
                image_file: null,
                image_url_existing: '',
                remove_image: false,
                user_id: '1', // Default user_id
            });
        }
    }, [currentPage, currentArticleId]);


    // --- Render Tampilan Daftar Artikel ---
    if (currentPage === 'list') {
        if (loading) return <div className="text-center p-4">Memuat artikel...</div>;
        if (error) return <div className="text-center p-4 text-red-500">Error: {error}</div>;

        return (
            <ProtectedPage>
            <div className="p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Manajemen Artikel</h2>

                {/* Search, Category Filter, Add Article Button */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
                    <div className="relative w-full md:w-1/3">
                        <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-300" />
                        <input
                            type="text"
                            placeholder="Cari artikel..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 border text-black bg-white rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="w-full md:w-1/4">
                        <select
                            value={selectedCategoryFilter}
                            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                            className="border rounded-lg w-full py-2 px-3 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Semua Kategori</option>
                            {uniqueCategories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={() => {
                            setCurrentPage('add');
                            setCurrentArticleId(null);
                        }}
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors w-full md:w-auto justify-center"
                    >
                        <FaPlus />
                        <span>Tambah Artikel</span>
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {/* Table Articles */}
                <div className="bg-white p-6 rounded-xl shadow-md overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judul</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Konten (Ringkas)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gambar</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredArticles.length > 0 ? (
                                filteredArticles.map(article => (
                                    <tr key={article.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{article.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{article.title}</td>
                                        <td className="px-6 py-4 max-w-xs truncate text-sm text-gray-900">{article.content.substring(0, 50)}...</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {article.image_url ? (
                                                <img
                                                    src={`${API_BASE_URL}${article.image_url}`} // Sesuaikan dengan base URL server Anda
                                                    alt={article.title}
                                                    className="w-16 h-16 object-cover rounded-md"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/64x64/E0E0E0/ADADAD?text=No+Image'; }}
                                                />
                                            ) : (
                                                <span className="text-gray-400">Tidak ada</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{article.category}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{article.user_id || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => {
                                                    setCurrentPage('edit');
                                                    setCurrentArticleId(article.id);
                                                }}
                                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                title="Edit"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(article.id)}
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
                                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">Tidak ada artikel ditemukan.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
             </ProtectedPage>
        );
    }

    {/* --- Render Tampilan Formulir Tambah/Edit Artikel --- */}
    if (currentPage === 'add' || currentPage === 'edit') {
        if (isFormLoading) return <div className="text-center p-4">Memuat formulir...</div>;
        if (formError) return <div className="text-center p-4 text-red-500">Error: {formError}</div>;

        return (
            <div className="p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">{currentPage === 'add' ? 'Tambah Artikel Baru' : 'Edit Artikel'}</h2>

                <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 mx-auto">
                    <form onSubmit={handleSubmitForm}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="title">Judul Artikel</label>
                            <input type="text" name="title" value={formArticleData.title || ''} onChange={handleFormInputChange} className="border rounded-lg w-full py-2 px-3 text-gray-700" required />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="content">Konten Artikel</label>
                            <textarea name="content" value={formArticleData.content || ''} onChange={handleFormInputChange} rows="5" className="border rounded-lg w-full py-2 px-3 text-gray-700" required></textarea>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="category">Kategori</label>
                            <input type="text" name="category" value={formArticleData.category || ''} onChange={handleFormInputChange} className="border rounded-lg w-full py-2 px-3 text-gray-700" required />
                        </div>
                        
                        {/* Image Upload / Preview Section */}
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="image_file">Gambar Artikel (Opsional)</label>
                            <input type="file" name="image_file" accept="image/*" onChange={handleFormInputChange} className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                            
                            {/* Display existing image or newly selected image preview */}
                            {(formArticleData.image_url_existing && !formArticleData.remove_image && !formArticleData.image_file) && (
                                <div className="mt-4">
                                    <p className="text-sm text-gray-600 mb-2">Gambar Saat Ini:</p>
                                    <img
                                        src={`${API_BASE_URL}${formArticleData.image_url_existing}`}
                                        alt="Current Article"
                                        className="w-32 h-32 object-cover rounded-md border border-gray-300"
                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/128x128/E0E0E0/ADADAD?text=Error+Loading'; }}
                                    />
                                </div>
                            )}
                            {formArticleData.image_file && (
                                <div className="mt-4">
                                    <p className="text-sm text-gray-600 mb-2">Pratinjau Gambar Baru:</p>
                                    <img
                                        src={URL.createObjectURL(formArticleData.image_file)}
                                        alt="New Article"
                                        className="w-32 h-32 object-cover rounded-md border border-gray-300"
                                    />
                                </div>
                            )}

                            {/* Option to remove existing image (only in edit mode and if an image exists) */}
                            {currentPage === 'edit' && formArticleData.image_url_existing && (
                                <div className="mt-4 flex items-center">
                                    <input
                                        type="checkbox"
                                        id="remove_image"
                                        name="remove_image"
                                        checked={formArticleData.remove_image}
                                        onChange={handleFormInputChange}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="remove_image" className="ml-2 text-sm text-gray-700">Hapus Gambar Saat Ini</label>
                                </div>
                            )}
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
                                {isFormLoading ? 'Menyimpan...' : (currentPage === 'add' ? 'Tambah Artikel' : 'Simpan Perubahan')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}
