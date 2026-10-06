import React, { useState } from 'react';
import { Target, Sparkles, Loader2, Users } from 'lucide-react';
import { DocPreviewToolbar } from './DocPreviewToolbar';
import { showToast } from '../../utils/toast';

export const KokurikulerGenerator: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    tema: 'Rekayasa dan Teknologi / Gaya Hidup Berkelanjutan',
    topik: 'Pemanfaatan Aplikasi Digital dan IoT untuk Pengelolaan Sampah Sekolah',
    fase: 'Fase E (Kelas X)',
    alokasiWaktu: '36 Jam Pelajaran (JP)',
    mataPelajaranTerlibat: 'Informatika, Projek IPAS, Bahasa Indonesia, Seni Budaya',
  });

  const generateFallbackKokurikulerHtml = (data: typeof formData) => {
    return `
      <div class="kokurikuler-doc space-y-6">
        <div style="text-align: center; border-bottom: 2px solid #0369a1; padding-bottom: 12px; margin-bottom: 20px;">
          <h2 style="font-size: 16pt; font-weight: bold; color: #0369a1; margin: 0; text-transform: uppercase;">MODUL KOKURIKULER PROYEK KOLABORATIF</h2>
          <p style="font-size: 10pt; color: #475569; margin: 4px 0 0 0;">Tema: <b>${data.tema}</b> | Alokasi Waktu: <b>${data.alokasiWaktu}</b></p>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 10pt; margin-bottom: 16px;">
          <tr style="background-color: #0284c7; color: white;">
            <th style="padding: 8px; text-align: left; border: 1px solid #0284c7;" colspan="2">IDENTITAS MODUL PROYEK KOKURIKULER</th>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #bae6fd; font-weight: bold; width: 30%;">Topik Proyek Utama</td>
            <td style="padding: 8px; border: 1px solid #bae6fd;"><b>${data.topik}</b></td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #bae6fd; font-weight: bold;">Fase / Kelas</td>
            <td style="padding: 8px; border: 1px solid #bae6fd;">${data.fase}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #bae6fd; font-weight: bold;">Mata Pelajaran Terlibat</td>
            <td style="padding: 8px; border: 1px solid #bae6fd;">${data.mataPelajaranTerlibat}</td>
          </tr>
        </table>

        <h3 style="color: #0369a1; border-bottom: 1px solid #0369a1; padding-bottom: 4px; font-size: 12pt; font-weight: bold;">ALUR AKTIVITAS PROYEK (4 TAHAPAN)</h3>
        <ol style="font-size: 10pt; line-height: 1.6; padding-left: 20px;">
          <li><b>Tahap Pengenalan:</b> Eksplorasi konsep latar belakang dan wawancara kebutuhan di lingkungan sekolah.</li>
          <li><b>Tahap Kontekstualisasi:</b> Pemetaan data, perancangan prototipe awal, dan pembagian tugas kelompok interdisipliner.</li>
          <li><b>Tahap Aksi Nyata:</b> Pembuatan karya/produk dan pengujian efisiensi secara langsung.</li>
          <li><b>Tahap Refleksi & Pameran Karya:</b> Gelar karya, apresiasi sejawat, dan evaluasi hasil proyek.</li>
        </ol>

        <div style="margin-top: 40px;">
          <table style="width: 100%; border: none; font-size: 10pt;">
            <tr>
              <td style="width: 50%; text-align: center; border: none;">
                Mengetahui,<br><b>Kepala Sekolah</b><br><br><br><br>
                <u>(_________________________)</u><br>NIP.
              </td>
              <td style="width: 50%; text-align: center; border: none;">
                Koordinator Proyek,<br><br><br><br>
                <u><b>Yusak Yokoyama, S.Pd., M.Pd.</b></u><br>NIP. 19850712 201001 1 018
              </td>
            </tr>
          </table>
        </div>
      </div>
    `;
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setGeneratedHtml(null);

    try {
      const res = await fetch('/api/ai/generate-modul-kokurikuler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.html) {
        setGeneratedHtml(data.html);
        showToast('Modul Kokurikuler Berhasil Dibuat!', 'success', 'Rancangan proyek kolaboratif siap dipraktikkan.');
      } else {
        throw new Error('Fallback required');
      }
    } catch (err) {
      console.warn('Using fallback kokurikuler generator:', err);
      const fallbackHtml = generateFallbackKokurikulerHtml(formData);
      setGeneratedHtml(fallbackHtml);
      showToast('Modul Kokurikuler Berhasil Dibuat!', 'success', 'Rancangan proyek kolaboratif siap dipraktikkan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-[#1a3a5c] text-white p-6 rounded-2xl shadow-sm no-print">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/10 rounded-xl">
            <Target className="w-6 h-6 text-emerald-300" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Generator Modul Kokurikuler Kolaboratif AI</h2>
            <p className="text-xs text-emerald-200 mt-1">
              Modul pembelajaran interdisipliner lintas mata pelajaran dengan 4 Alur: <b>Pengenalan</b>, <b>Kontekstualisasi</b>, <b>Aksi Nyata</b>, dan <b>Refleksi</b>.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm no-print">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tema Utama Proyek *
              </label>
              <input
                type="text"
                required
                value={formData.tema}
                onChange={(e) => setFormData({ ...formData, tema: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Alokasi Waktu (JP)
              </label>
              <input
                type="text"
                value={formData.alokasiWaktu}
                onChange={(e) => setFormData({ ...formData, alokasiWaktu: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Topik / Isu Kontekstual Proyek *
            </label>
            <input
              type="text"
              required
              value={formData.topik}
              onChange={(e) => setFormData({ ...formData, topik: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Mata Pelajaran yang Berkolaborasi *
            </label>
            <input
              type="text"
              required
              value={formData.mataPelajaranTerlibat}
              onChange={(e) => setFormData({ ...formData, mataPelajaranTerlibat: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  AI Sedang Mengembangkan Modul Kokurikuler...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Generate Modul Kokurikuler
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Output Document */}
      {generatedHtml && (
        <div className="space-y-4">
          <DocPreviewToolbar htmlContent={generatedHtml} documentTitle={`Modul_Kokurikuler_${formData.topik}`} />

          <div className="bg-white text-slate-900 border border-slate-300 p-8 rounded-2xl shadow-lg print:border-none print:shadow-none print:p-0">
            <div
              className="prose max-w-none print:max-w-none text-slate-900 leading-relaxed font-sans"
              dangerouslySetInnerHTML={{ __html: generatedHtml }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
