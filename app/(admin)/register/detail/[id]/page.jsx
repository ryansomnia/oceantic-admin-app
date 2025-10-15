"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import ProtectedPage from "@/app/components/ProtectedPage";

const API_BASE_URL = "https://api.oceanticsports.com/oceantic/v1";
const FILE_BASE_URL = "https://api.oceanticsports.com/";

const getDocumentUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) {
    return url.replace("https://admin.oceanticsports.com", FILE_BASE_URL);
  }
  return `${FILE_BASE_URL}${url}`;
};

export default function ParticipantDetailPage() {
  const params = useParams();
  const { id } = params;
  const [participant, setParticipant] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/getRegistrationById/${id}`);
        const result = await res.json();
        if (result.data) {
          setParticipant(result.data);
        }
      } catch (err) {
        console.error("Error fetch detail:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!participant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-lg">Data peserta tidak ditemukan</p>
      </div>
    );
  }

  return (
    <ProtectedPage>
    <div className="p-8 font-sans bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-sky-400 px-8 py-6">
          <h2 className="text-2xl font-bold text-white">
            Detail Peserta
          </h2>
          <p className="text-white/90">{participant.full_name}</p>
        </div>

        {/* Body */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <DetailItem label="Nama Lengkap" value={participant.full_name} />
          <DetailItem
            label="Tanggal Lahir"
            value={new Date(participant.date_of_birth).toLocaleDateString("id-ID")}
          />
          <DetailItem label="Jenis Kelamin" value={participant.gender} />
          <DetailItem label="Email" value={participant.email} />
          <DetailItem label="No HP" value={participant.phone_number} />
          <DetailItem label="Klub" value={participant.club_name} />
          <DetailItem
            label="Kontak Darurat"
            value={`${participant.emergency_contact_name} (${participant.emergency_contact_phone})`}
          />
          <DetailItem
            label="Total Biaya"
            value={`Rp ${participant.total_fee?.toLocaleString("id-ID")}`}
          />

          {/* Status Payment */}
          <div className="md:col-span-2">
            <span className="block text-gray-500 font-medium">Status Pembayaran</span>
            <div className="mt-1 flex items-center gap-2">
              {participant.payment_status !== "success" ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                  <CheckCircle className="w-4 h-4 mr-1" /> {participant.payment_status}
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium">
                  <XCircle className="w-4 h-4 mr-1" /> {participant.payment_status}
                </span>
              )}
            </div>
          </div>

          {/* Dokumen Pendukung */}
          {participant.supporting_document_url && (
            <div className="md:col-span-2">
              <span className="block text-gray-500 font-medium mb-1">
                Dokumen Akta Kelahiran
              </span>
              <a
                href={getDocumentUrl(participant.supporting_document_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
              >
                📄 Lihat Dokumen
              </a>
            </div>
          )}

          {/* Bukti Pembayaran */}
          {participant.payment_photo_url && (
            <div className="md:col-span-2">
              <span className="block text-gray-500 font-medium mb-2">
                Bukti Pembayaran
              </span>
              <div className="w-full md:w-1/2">
                <img
                  src={getDocumentUrl(participant.payment_photo_url)}
                  alt="Bukti Pembayaran"
                  className="rounded-lg border shadow-sm"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </ProtectedPage>
  );
}

const DetailItem = ({ label, value }) => (
  <div>
    <span className="block text-gray-500 font-medium">{label}</span>
    <span className="text-gray-900 font-semibold">{value || "-"}</span>
  </div>
);
