"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Cookies from "js-cookie";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState({
    fullname: "",
    role: "",
  });

  useEffect(() => {
   const token = Cookies.get("authToken"); // ambil dari cookie
    const fullname = localStorage.getItem("username");
    const role = Cookies.get("role"); // ambil dari cookie juga

    if (!token) {
      Swal.fire({
        icon: "warning",
        title: "Sesi berakhir",
        text: "Silakan login kembali",
        timer: 2000,
        showConfirmButton: false,
      }).then(() => router.push("/login"));
    } else {
      setUser({ fullname, role });
    }
  }, [router]);

  const handleLogout = () => {
    Swal.fire({
      title: "Yakin ingin logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Logout",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        Swal.fire({
          icon: "success",
          title: "Logout berhasil",
          timer: 1500,
          showConfirmButton: false,
        }).then(() => router.push("/login"));
      }
    });
  };

  return (
    
    <div className="min-h-screen bg-gray-100 flex flex-col">
  
      {/* Content */}
      <main className="flex-1 p-6">
        <div className="bg-sky-600 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-white">
            Selamat Datang, {user.fullname || "Pengguna"} 👋
          </h2>
          <p className="text-white">
            Anda login sebagai:{" "}
            <span className="font-semibold capitalize">{user.role}</span>
          </p>
        </div>
      </main>
    </div>
  );
}
