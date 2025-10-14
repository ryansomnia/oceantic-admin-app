"use client";

import React, { useState, useEffect } from "react";
import { Loader2, FileSpreadsheet, FileDown } from "lucide-react";
import Cookies from "js-cookie";

const API_BASE_URL = "https://api.oceanticsports.com/oceantic/v1";

export default function DownloadEventFile() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const token =
    typeof window !== "undefined" ? Cookies.get('authToken') : null;

  // Ambil daftar event "Open for Registration"
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/events/getAllEventsOpen`);
        const data = await res.json();
        if (data.code === 200) {
          setEvents(data.data);
        }
      } catch (err) {
        console.error("Gagal fetch events:", err);
      }
    };
    fetchEvents();
  }, []);

  // Handle download Excel
  const handleDownloadExcel = async () => {
    if (!selectedEvent) {
      alert("Silakan pilih event dulu!");
      return;
    }

    setLoadingExcel(true);
    try {
      const response = await fetch(`${API_BASE_URL}/generateEventBookExcel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ eventId: selectedEvent }),
      });

      if (!response.ok) {
        throw new Error("Gagal generate file Excel");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const selected = events.find((e) => e.id === parseInt(selectedEvent));
      link.download = `startlist_${selected?.title
        ?.replace(/\s+/g, "_")
        .toLowerCase()}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      alert("Terjadi kesalahan saat download Excel");
    } finally {
      setLoadingExcel(false);
    }
  };

  // Handle download PDF
  const handleDownloadPdf = async () => {
    if (!selectedEvent) {
      alert("Silakan pilih event dulu!");
      return;
    }

    setLoadingPdf(true);
    try {
      const response = await fetch(`${API_BASE_URL}/generateEventBookPdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ eventId: selectedEvent }),
      });

      if (!response.ok) {
        throw new Error("Gagal generate file PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const selected = events.find((e) => e.id === parseInt(selectedEvent));
      link.download = `buku_acara_${selected?.title
        ?.replace(/\s+/g, "_")
        .toLowerCase()}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      alert("Terjadi kesalahan saat download PDF");
    } finally {
      setLoadingPdf(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Download Event Startlist
        </h1>

        <label className="block mb-2 text-gray-700 font-medium">
          Pilih Event
        </label>
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="w-full p-3 border text-black rounded-lg mb-6 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="">-- Pilih Event --</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title} (
              {new Date(event.event_date).toLocaleDateString("id-ID")})
            </option>
          ))}
        </select>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleDownloadExcel}
            disabled={!selectedEvent || loadingExcel}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition ${
              selectedEvent
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {loadingExcel ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              <FileSpreadsheet className="h-5 w-5" />
            )}
            {loadingExcel ? "Sedang diproses..." : "Download Excel"}
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={!selectedEvent || loadingPdf}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition ${
              selectedEvent
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {loadingPdf ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              <FileDown className="h-5 w-5" />
            )}
            {loadingPdf ? "Sedang diproses..." : "Download PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}
