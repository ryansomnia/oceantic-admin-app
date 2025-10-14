"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Cookies from "js-cookie";


export default function ProtectedPage({ children }) {
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("authToken"); // 🔥 ambil dari cookie

    if (!token) {
      Swal.fire({
        icon: "warning",
        title: "Sesi telah berakhir",
        text: "Silakan login terlebih dahulu",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => router.push("/login"));
    }
  }, [router]);

  return <>{children}</>;
}
