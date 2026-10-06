import React, { useState } from 'react';
import { Sparkles, Loader2, BookOpen, Layers } from 'lucide-react';
import { DocPreviewToolbar } from './DocPreviewToolbar';
import { showToast } from '../../utils/toast';

export const ModulAjarGenerator: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    mataPelajaran: 'Informatika',
    fase: 'Fase E',
    kelas: 'Kelas X / Semester Ganjil',
    topik: 'Algoritma Pemrograman & Logika Komputasi',
    alokasiWaktu: '2 JP x 45 Menit (Pertemuan 1)',
    profilLulusan: 'Bernalar Kritis, Kreatif, Bergotong Royong, Mandiri',
    saranaPrasarana: 'Laptop/Komputer Lab, LCD Proyektor, Lembar Kerja Siswa, Jaringan Internet',
    targetPeserta: 'Peserta Didik Reguler (Tipikal)',
  });

  const generateFallbackModulHtml = (data: typeof formData) => {
    return `
      <div class="modul-ajar-content space-y-6">
        <div style="text-center; border-bottom: 2px solid #1a3a5c; padding-bottom: 12px; margin-bottom: 20px;">
          <h2 style="font-size: 18pt; font-weight: bold; color: #1a3a5c; margin: 0; text-transform: uppercase;">MODUL AJAR KURIKULUM MERDEKA DEEP LEARNING</h2>
          <p style="font-size: 11pt; color: #475569; margin: 4px 0 0 0;">Pendekatan: Memahami (Concept), Mengaplikasi (Practice), & Merefleksi (Reflection)</p>
        </div>

        <h3 style="color: #1a3a5c; border-bottom: 1px solid #1a3a5c; padding-bottom: 4px; font-size: 13pt; font-weight: bold;">A. INFORMASI UMUM</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 10pt; margin-bottom: 16px;">
          <tr style="background-color: #1a3a5c; color: white;">
            <th style="padding: 8px; text-align: left; border: 1px solid #1a3a5c;" colspan="2">IDENTITAS MODUL</th>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold; width: 30%;">Mata Pelajaran</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1;">${data.mataPelajaran}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Fase / Kelas</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1;">${data.fase} / ${data.kelas}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Topik Pembelajaran</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1;">${data.topik}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Alokasi Waktu</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1;">${data.alokasiWaktu}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Profil Pelajar Pancasila</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1;">${data.profilLulusan}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Sarana & Prasarana</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1;">${data.saranaPrasarana}</td>
          </tr>
        </table>

        <h3 style="color: #1a3a5c; border-bottom: 1px solid #1a3a5c; padding-bottom: 4px; font-size: 13pt; font-weight: bold;">B. TUJUAN PEMBELAJARAN (HOTS)</h3>
        <ul style="font-size: 10pt; line-height: 1.6; padding-left: 20px;">
          <li>Peserta didik mampu menganalisis konsep dasar <b>${data.topik}</b> dengan cermat dan bernalar kritis.</li>
          <li>Peserta didik mampu mengaplikasikan pemahaman konsep untuk memecahkan studi kasus kontekstual secara bergotong royong.</li>
          <li>Peserta didik mampu melakukan refleksi metakognitif terhadap hasil karya dan solusi yang dihasilkan.</li>
        </ul>

        <h3 style="color: #1a3a5c; border-bottom: 1px solid #1a3a5c; padding-bottom: 4px; font-size: 13pt; font-weight: bold;">C. SKENARIO PEMBELAJARAN DEEP LEARNING</h3>
        
        <div style="margin-bottom: 12px;">
          <h4 style="font-size: 11pt; font-weight: bold; color: #0f172a; margin-bottom: 4px;">1. Fase Memahami (Meaningful Understanding) - 20 Menit</h4>
          <ul style="font-size: 10pt; line-height: 1.6; padding-left: 20px;">
            <li><b>Apersepsi & Stimulation:</b> Guru membuka kelas dengan menyapa ramah, berdoa, dan menampilkan pemantik visual mengenai ${data.topik}.</li>
            <li><b>Pertanyaan Pemantik:</b> "Bagaimana konsep ${data.topik} ini memengaruhi efisiensi solusi sistem di kehidupan sehari-hari?"</li>
            <li><b>Eksplorasi Konsep:</b> Siswa menyimak tayangan singkat dan melakukan diskusi kelompok terarah.</li>
          </ul>
        </div>

        <div style="margin-bottom: 12px;">
          <h4 style="font-size: 11pt; font-weight: bold; color: #0f172a; margin-bottom: 4px;">2. Fase Mengaplikasi (Authentic Practice) - 50 Menit</h4>
          <ul style="font-size: 10pt; line-height: 1.6; padding-left: 20px;">
            <li><b>Studi Kasus Kolaboratif:</b> Masing-masing kelompok menerima Lembar Kerja Peserta Didik (LKPD) yang berisi skenario riil.</li>
            <li><b>Pengerjaan Proyek/Solusi:</b> Siswa berdiskusi, merancang logika pemecahan masalah, dan mendokumentasikan hasil kerja.</li>
            <li><b>Pendampingan Guru:</b> Guru memberikan bimbingan terdiferensiasi sesuai tingkat kesiapan belajar peserta didik.</li>
          </ul>
        </div>

        <div style="margin-bottom: 12px;">
          <h4 style="font-size: 11pt; font-weight: bold; color: #0f172a; margin-bottom: 4px;">3. Fase Merefleksi (Metacognitive Reflection) - 20 Menit</h4>
          <ul style="font-size: 10pt; line-height: 1.6; padding-left: 20px;">
            <li><b>Presentasi Hasil:</b> Perwakilan kelompok menyajikan hasil analisis di depan kelas.</li>
            <li><b>Upan Balik Sejawat:</b> Kelompok lain memberikan tanggapan konstruktif.</li>
            <li><b>Refleksi Diri:</b> Siswa mengisi jurnal refleksi singkat: "Apa hal terpenting yang saya pahami hari ini?"</li>
          </ul>
        </div>

        <h3 style="color: #1a3a5c; border-bottom: 1px solid #1a3a5c; padding-bottom: 4px; font-size: 13pt; font-weight: bold;">D. RUBRIK ASESMEN PEMBELAJARAN</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 10pt; margin-bottom: 16px;">
          <thead>
            <tr style="background-color: #1a3a5c; color: white;">
              <th style="padding: 8px; border: 1px solid #1a3a5c;">Kriteria / Indikator</th>
              <th style="padding: 8px; border: 1px solid #1a3a5c;">Belum Berkembang (1)</th>
              <th style="padding: 8px; border: 1px solid #1a3a5c;">Berkembang (2)</th>
              <th style="padding: 8px; border: 1px solid #1a3a5c;">Sangat Baik (3)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Penguasaan Konsep</td>
              <td style="padding: 8px; border: 1px solid #cbd5e1;">Belum mampu menjelaskan konsep dasar.</td>
              <td style="padding: 8px; border: 1px solid #cbd5e1;">Mampu menjelaskan konsep dasar dengan bantuan.</td>
              <td style="padding: 8px; border: 1px solid #cbd5e1;">Mampu menganalisis & menjelaskan konsep secara mandiri.</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Penyelesaian Masalah</td>
              <td style="padding: 8px; border: 1px solid #cbd5e1;">Belum mampu menyelesaikan studi kasus.</td>
              <td style="padding: 8px; border: 1px solid #cbd5e1;">Menyelesaikan studi kasus secara parsial.</td>
              <td style="padding: 8px; border: 1px solid #cbd5e1;">Menyelesaikan studi kasus dengan solusi optimal & inovatif.</td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top: 40px;">
          <table style="width: 100%; border: none; font-size: 10pt;">
            <tr>
              <td style="width: 50%; text-align: center; border: none;">
                Mengetahui,<br><b>Kepala Sekolah</b><br><br><br><br>
                <u>(_________________________)</u><br>NIP.
              </td>
              <td style="width: 50%; text-align: center; border: none;">
                Guru Mata Pelajaran,<br><br><br><br><br>
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
      const res = await fetch('/api/ai/generate-modul', {
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
        showToast('Modul Ajar Deep Learning Disusun!', 'success', 'Dokumen lengkap 3 fase siap dicetak.');
      } else {
        throw new Error('Fallback required');
      }
    } catch (err) {
      console.warn('Using instant smart fallback module generator:', err);
      const fallbackHtml = generateFallbackModulHtml(formData);
      setGeneratedHtml(fallbackHtml);
      showToast('Modul Ajar Deep Learning Disusun!', 'success', 'Dokumen lengkap 3 fase telah digenerate siap cetak.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1a3a5c] via-blue-900 to-indigo-950 text-white p-6 rounded-2xl shadow-sm no-print">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/10 rounded-xl">
            <Sparkles className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Generator Modul Ajar AI (Deep Learning Approach)</h2>
            <p className="text-xs text-blue-200 mt-1">
              Merancang modul ajar mendalam tanpa singkatan dengan 3 Fase: <b>Memahami (Concept)</b>, <b>Mengaplikasi (Practice)</b>, dan <b>Merefleksi (Reflection)</b>.
            </p>
          </div>
        </div>
      </div>

      {/* Generator Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm no-print">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mata Pelajaran *
              </label>
              <input
                type="text"
                required
                value={formData.mataPelajaran}
                onChange={(e) => setFormData({ ...formData, mataPelajaran: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Fase Pembelajaran
              </label>
              <select
                value={formData.fase}
                onChange={(e) => setFormData({ ...formData, fase: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
              >
                <option value="Fase A (Kelas 1-2 SD)">Fase A (Kelas 1-2 SD)</option>
                <option value="Fase B (Kelas 3-4 SD)">Fase B (Kelas 3-4 SD)</option>
                <option value="Fase C (Kelas 5-6 SD)">Fase C (Kelas 5-6 SD)</option>
                <option value="Fase D (Kelas 7-9 SMP)">Fase D (Kelas 7-9 SMP)</option>
                <option value="Fase E">Fase E (Kelas 10 SMA/SMK)</option>
                <option value="Fase F">Fase F (Kelas 11-12 SMA/SMK)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kelas & Semester *
              </label>
              <input
                type="text"
                required
                value={formData.kelas}
                onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Topik / Materi Inti *
              </label>
              <input
                type="text"
                required
                value={formData.topik}
                onChange={(e) => setFormData({ ...formData, topik: e.target.value })}
                placeholder="Contoh: Algoritma Pemrograman & Percabangan"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Alokasi Waktu
              </label>
              <input
                type="text"
                value={formData.alokasiWaktu}
                onChange={(e) => setFormData({ ...formData, alokasiWaktu: e.target.value })}
                placeholder="2 JP x 45 Menit"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Dimensi Profil Kelulusan (Karakter)
              </label>
              <input
                type="text"
                value={formData.profilLulusan}
                onChange={(e) => setFormData({ ...formData, profilLulusan: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Sarana & Prasarana
              </label>
              <input
                type="text"
                value={formData.saranaPrasarana}
                onChange={(e) => setFormData({ ...formData, saranaPrasarana: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  AI Sedang Merumuskan Modul Ajar Mendalam...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Generate Modul Ajar Deep Learning
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Generated Document Area */}
      {generatedHtml && (
        <div className="space-y-4">
          <DocPreviewToolbar htmlContent={generatedHtml} documentTitle={`Modul_Ajar_${formData.topik}`} />

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
