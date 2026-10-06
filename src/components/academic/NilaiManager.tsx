import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { Award, Plus, FileSpreadsheet, Download, Trash2, Edit2, TrendingUp, BookOpen } from 'lucide-react';
import { Siswa, Mapel, Nilai, Pengaturan } from '../../types';
import { dbService } from '../../services/db';
import { exportService } from '../../services/export';
import { showToast } from '../../utils/toast';

interface NilaiManagerProps {
  siswaList: Siswa[];
  mapelList: Mapel[];
  nilaiList: Nilai[];
  pengaturan: Pengaturan;
}

export const NilaiManager: React.FC<NilaiManagerProps> = ({
  siswaList,
  mapelList,
  nilaiList,
  pengaturan,
}) => {
  const [selectedKelas, setSelectedKelas] = useState<string>('X RPL 1');
  const [selectedMapelId, setSelectedMapelId] = useState<string>(mapelList[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'leger' | 'input'>('leger');

  // Input modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Nilai>>({
    siswaId: '',
    mapelId: selectedMapelId,
    jenis: 'formatif',
    materi: 'TP 1: Algoritma dan Logika Komputasi',
    skor: 85,
    semester: 'Ganjil 2026/2027',
  });

  const kelasList = Array.from(new Set(siswaList.map((s) => s.kelas))).sort();
  const studentsInClass = siswaList.filter((s) => s.kelas === selectedKelas);

  const handleOpenAdd = (prefillSiswaId?: string) => {
    setEditingId(null);
    setFormData({
      siswaId: prefillSiswaId || studentsInClass[0]?.id || '',
      mapelId: selectedMapelId || mapelList[0]?.id || '',
      jenis: 'formatif',
      materi: 'TP 1: Capaian Pembelajaran',
      skor: 85,
      semester: 'Ganjil 2026/2027',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (n: Nilai) => {
    setEditingId(n.id);
    setFormData(n);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'Hapus Rekam Nilai?',
      text: 'Nilai ini akan dihapus dari buku rapor.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus',
    }).then((res) => {
      if (res.isConfirmed) {
        dbService.deleteNilai(id);
        showToast('Nilai Terhapus', 'success', 'Nilai siswa berhasil dihapus.');
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.siswaId || !formData.mapelId || formData.skor === undefined) {
      showToast('Peringatan', 'warning', 'Siswa, Mapel, dan Skor wajib diisi!');
      return;
    }

    const studentObj = siswaList.find((s) => s.id === formData.siswaId);
    const mapelObj = mapelList.find((m) => m.id === formData.mapelId);

    const item: Nilai = {
      id: editingId || `n_${Date.now()}`,
      siswaId: formData.siswaId,
      namaSiswa: studentObj?.nama || 'Siswa',
      kelas: studentObj?.kelas || selectedKelas,
      mapelId: formData.mapelId,
      namaMapel: mapelObj?.nama || 'Mapel',
      jenis: formData.jenis || 'formatif',
      materi: formData.materi?.trim() || 'Asesmen Pembelajaran',
      skor: Number(formData.skor),
      semester: formData.semester?.trim() || 'Ganjil 2026/2027',
      userId: 'master_guru_default',
    };

    dbService.saveNilai(item);
    setIsModalOpen(false);
    showToast('Berhasil', 'success', `Nilai ${item.namaSiswa} (${item.skor}) berhasil disimpan!`);
  };

  // Automated competency description generator
  const getDeskripsiKompetensi = (na: number, nama: string) => {
    if (na >= 90) {
      return `Menunjukkan penguasaan yang SANGAT BAIK dan konsisten dalam menganalisis konsep serta menyelesaikan proyek mandiri.`;
    } else if (na >= 80) {
      return `Menunjukkan penguasaan yang BAIK dalam memahami tujuan pembelajaran utama dan dapat berkolaborasi optimal.`;
    } else if (na >= 70) {
      return `Menunjukkan penguasaan CUKUP dalam mencapai kriteria ketuntasan minimal; disarankan meningkatkan latihan mandiri.`;
    } else {
      return `Perlu bimbingan dan pendampingan intensif pada materi dasar serta pengulangan asesmen remedial.`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            Asesmen Pembelajaran & Leger Nilai
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Penilaian formatif, sumatif lingkup materi, kalkulasi nilai akhir rapor, dan deskripsi capaian otomatis.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportService.exportLegerPdf(nilaiList, siswaList, selectedKelas, pengaturan)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium rounded-xl shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            Cetak Leger PDF
          </button>

          <button
            onClick={() => exportService.exportLegerNilaiToExcel(nilaiList, siswaList, selectedKelas)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl shadow-sm transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Ekspor Excel
          </button>

          <button
            onClick={() => handleOpenAdd()}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Input Nilai Siswa
          </button>
        </div>
      </div>

      {/* Filter Rombel & Mapel */}
      <div className="flex flex-wrap items-center gap-4 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Pilih Rombel / Kelas:</label>
          <select
            value={selectedKelas}
            onChange={(e) => setSelectedKelas(e.target.value)}
            className="px-3 py-1.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          >
            {kelasList.map((k) => (
              <option key={k} value={k}>
                {k} ({siswaList.filter((s) => s.kelas === k).length} Siswa)
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Mata Pelajaran:</label>
          <select
            value={selectedMapelId}
            onChange={(e) => setSelectedMapelId(e.target.value)}
            className="px-3 py-1.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          >
            {mapelList.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nama}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Leger Table View */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#1a3a5c] text-white">
              <tr>
                <th className="py-3 px-3 w-10 text-center">No</th>
                <th className="py-3 px-3 w-28">NISN</th>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-3 text-center">Rata Formatif (40%)</th>
                <th className="py-3 px-3 text-center">Rata Sumatif (40%)</th>
                <th className="py-3 px-3 text-center">Nilai SAS (20%)</th>
                <th className="py-3 px-3 text-center font-bold">Nilai Akhir</th>
                <th className="py-3 px-3 text-center">Predikat</th>
                <th className="py-3 px-4">Deskripsi Capaian Kompetensi</th>
                <th className="py-3 px-3 text-center w-20">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {studentsInClass.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    Tidak ada siswa pada rombel {selectedKelas}.
                  </td>
                </tr>
              ) : (
                studentsInClass.map((s, idx) => {
                  const studentGrades = nilaiList.filter((n) => n.siswaId === s.id);
                  const formatifScores = studentGrades.filter((n) => n.jenis === 'formatif').map((n) => n.skor);
                  const sumatifScores = studentGrades.filter((n) => n.jenis === 'sumatif').map((n) => n.skor);
                  const pasScores = studentGrades.filter((n) => n.jenis === 'pas').map((n) => n.skor);

                  const avgFormatif = formatifScores.length
                    ? Math.round(formatifScores.reduce((a, b) => a + b, 0) / formatifScores.length)
                    : 0;
                  const avgSumatif = sumatifScores.length
                    ? Math.round(sumatifScores.reduce((a, b) => a + b, 0) / sumatifScores.length)
                    : 0;
                  const avgPas = pasScores.length
                    ? Math.round(pasScores.reduce((a, b) => a + b, 0) / pasScores.length)
                    : 0;

                  const nilaiAkhir = Math.round(avgFormatif * 0.4 + avgSumatif * 0.4 + avgPas * 0.2);

                  let predikat = 'D';
                  let predikatColor = 'bg-rose-100 text-rose-700';
                  if (nilaiAkhir >= 90) {
                    predikat = 'A';
                    predikatColor = 'bg-emerald-100 text-emerald-800';
                  } else if (nilaiAkhir >= 80) {
                    predikat = 'B';
                    predikatColor = 'bg-blue-100 text-blue-800';
                  } else if (nilaiAkhir >= 70) {
                    predikat = 'C';
                    predikatColor = 'bg-amber-100 text-amber-800';
                  }

                  const deskripsi = getDeskripsiKompetensi(nilaiAkhir, s.nama);

                  return (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-3 text-center font-mono text-xs">{idx + 1}</td>
                      <td className="py-3 px-3 font-mono text-xs text-blue-600 dark:text-blue-400">{s.nisn}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{s.nama}</td>
                      <td className="py-3 px-3 text-center font-mono font-medium">{avgFormatif || '-'}</td>
                      <td className="py-3 px-3 text-center font-mono font-medium">{avgSumatif || '-'}</td>
                      <td className="py-3 px-3 text-center font-mono font-medium">{avgPas || '-'}</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-base text-blue-600 dark:text-blue-400">
                        {nilaiAkhir || '-'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${predikatColor}`}>
                          {predikat}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-400 leading-snug">
                        {deskripsi}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleOpenAdd(s.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                        >
                          + Nilai
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Nilai */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {editingId ? 'Edit Asesmen Nilai' : 'Input Asesmen Nilai Baru'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pilih Peserta Didik *
                </label>
                <select
                  required
                  value={formData.siswaId || ''}
                  onChange={(e) => setFormData({ ...formData, siswaId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                >
                  <option value="">-- Pilih Siswa --</option>
                  {siswaList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama} ({s.kelas} - {s.nisn})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mata Pelajaran *
                </label>
                <select
                  required
                  value={formData.mapelId || ''}
                  onChange={(e) => setFormData({ ...formData, mapelId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                >
                  {mapelList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Jenis Asesmen
                  </label>
                  <select
                    value={formData.jenis || 'formatif'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        jenis: e.target.value as 'formatif' | 'sumatif' | 'pas',
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                  >
                    <option value="formatif">Formatif (TP)</option>
                    <option value="sumatif">Sumatif Lingkup Materi</option>
                    <option value="pas">SAS / PAS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Skor / Nilai (0-100) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    required
                    value={formData.skor ?? 85}
                    onChange={(e) => setFormData({ ...formData, skor: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Materi / Tujuan Pembelajaran
                </label>
                <input
                  type="text"
                  required
                  value={formData.materi || ''}
                  onChange={(e) => setFormData({ ...formData, materi: e.target.value })}
                  placeholder="Contoh: TP 1: Logika Pemrograman"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow"
                >
                  Simpan Nilai
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
