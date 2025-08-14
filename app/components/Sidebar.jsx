"use client";
import { useRouter } from "next/navigation";
import { Home, User, FileText, Calendar, CreditCard, BookOpen, LogOut, ChevronDown, ChevronUp } from "lucide-react";
import Swal from "sweetalert2";
import React, { useState } from 'react'; // Import React dan useState

export default function Sidebar() {
  const router = useRouter();
  const [expandedMenu, setExpandedMenu] = useState(null); // State untuk melacak menu yang diperluas

  const handleLogout = () => {
    Swal.fire({
      title: "Yakin ingin logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Logout",
      cancelButtonText: "Batal",
      customClass: {
        confirmButton: 'bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg',
        cancelButton: 'bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg'
      },
      buttonsStyling: false
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

  // Definisikan item menu, termasuk sub-menu untuk 'Event'
  const menuItems = [
    { label: "Dashboard", icon: <Home size={20} />, path: "/dashboard" },
    { label: "Akun", icon: <User size={20} />, path: "/user" },
    { label: "Registrasi", icon: <FileText size={20} />, path: "/register" },
    {
      label: "Event",
      icon: <Calendar size={20} />,
      path: "/event", // Path default untuk item Event utama
      subItems: [
        { label: "Event Detail", path: "/event" },
        { label: "Race Category", path: "/event/race-category" },
        { label: "Race Swimmer", path: "/event/race-swimmer" },
      ],
    },
    { label: "Payment", icon: <CreditCard size={20} />, path: "/payment" },
    { label: "Content", icon: <BookOpen size={20} />, path: "/content" },
  ];

  return (
    <aside className="w-64 bg-white shadow-xl border-r flex flex-col">
      {/* Logo/Header Sidebar */}
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold text-sky-600">OCEANTIC</h2>
      </div>

      {/* Menu Navigasi */}
      <nav className="flex flex-col p-4 gap-2 flex-1">
        {menuItems.map((item, idx) => (
          <React.Fragment key={idx}>
            <button
              onClick={() => {
                if (item.subItems) {
                  // Jika item memiliki sub-menu, toggle ekspansi
                  setExpandedMenu(expandedMenu === item.label ? null : item.label);
                } else {
                  // Jika tidak ada sub-menu, navigasi langsung
                  router.push(item.path);
                  setExpandedMenu(null); // Tutup menu yang diperluas saat item non-sub-menu diklik
                }
              }}
              className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-amber-300 text-black hover:font-bold transition"
            >
              <div className="flex items-center gap-3">
                {item.icon} {item.label}
              </div>
              {item.subItems && (
                expandedMenu === item.label ? <ChevronUp size={16} /> : <ChevronDown size={16} />
              )}
            </button>
            {/* Render sub-menu jika item memiliki subItems dan sedang diperluas */}
            {item.subItems && expandedMenu === item.label && (
              <div className="ml-6 flex flex-col gap-1"> {/* Indentasi untuk sub-menu */}
                {item.subItems.map((subItem, subIdx) => (
                  <button
                    key={subIdx}
                    onClick={() => router.push(subItem.path)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-amber-200 text-black text-sm transition"
                  >
                    {subItem.label}
                  </button>
                ))}
              </div>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* Tombol Logout */}
      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full bg-red-500 hover:bg-red-600 text-white p-3 rounded-lg transition"
        >
          <LogOut size={20} /> Logout
        </button>
      </div>
    </aside>
  );
}
