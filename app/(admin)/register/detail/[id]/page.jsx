"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

const API_BASE_URL = "https://api.oceanticsports.com/oceantic/v1";

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
        if (result.data && result.data.length > 0) {
          setParticipant(result.data[0]);
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
    return <p className="text-center mt-10 text-gray-500">Data peserta tidak ditemukan</p>;
  }

  return (
    <div className="p-8 font-sans">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Detail Peserta: {participant.full_name}
      </h2>

      <div className="bg-white shadow-lg rounded-xl p-6 space-y-4">
        <DetailItem label="Nama Lengkap" value={participant.full_name} />
        <DetailItem label="Tanggal Lahir" value={new Date(participant.date_of_birth).toLocaleDateString("id-ID")} />
        <DetailItem label="Jenis Kelamin" value={participant.gender} />
        <DetailItem label="Email" value={participant.email} />
        <DetailItem label="No HP" value={participant.phone_number} />
        <DetailItem label="Klub" value={participant.club_name} />
        <DetailItem label="Kontak Darurat" value={`${participant.emergency_contact_name} (${participant.emergency_contact_phone})`} />
        <DetailItem label="Status Pembayaran" value={participant.payment_status} />
        <DetailItem label="Total Biaya" value={`Rp ${participant.total_fee?.toLocaleString("id-ID")}`} />

        {participant.supporting_document_url && (
          <div>
            <span className="font-semibold text-gray-700">Dokumen Pendukung:</span>
            <a
              href={participant.supporting_document_url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-blue-600 hover:underline"
            >
              Lihat Dokumen
            </a>
          </div>
        )}

        {participant.payment_photo_url && (
          <div>
            <span className="font-semibold text-gray-700">Bukti Pembayaran:</span>
            <a
              href={participant.payment_photo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-blue-600 hover:underline"
            >
              Lihat Bukti
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

const DetailItem = ({ label, value }) => (
  <div className="flex justify-between border-b py-2">
    <span className="text-gray-500">{label}</span>
    <span className="text-gray-900 font-medium">{value || "-"}</span>
  </div>
);
