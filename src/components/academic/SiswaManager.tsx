import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { Search, Plus, FileSpreadsheet, Download, Trash2, Edit3, UserCheck, Phone, MapPin } from 'lucide-react';
import { Siswa } from '../../types';
import { dbService } from '../../services/db';
import { exportService } from '../../services/export';
import { showToast } from '../../utils/toast';

interface SiswaManagerProps {
  siswaList: Siswa[];
  onOpenCardPrinter: () => void;
}

export const SiswaManager: React.FC<SiswaManagerProps> = ({ siswaList, onOpenCardPrinter }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKelas, setSelectedKelas] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Siswa>>({
    nisn: '',
    nama: '',
    kelas: 'X RPL 1',
    jenisKelamin: 'L',
    noHpOrtu: '',
    alamat: '',
  });

  const kelasList = Array.from(new Set(siswaList.map((s) => s.kelas))).sort();

  const filtered = siswaList.filter((s) => {
    const matchClass = selectedKelas === 'all' || s.kelas === selectedKelas;
    const matchSearch =
      s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nisn.includes(searchTerm) ||
      s.alamat.toLowerCase().includes(searchTerm.toLowerCase());
    return matchClass && matchSearch;
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      nisn: '',
      nama: '',
      kelas: selectedKelas !== 'all' ? selectedKelas : 'X RPL 1',
      jenisKelamin: 'L',
      noHpOrtu: '',
      alamat: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (siswa: Siswa) => {
    setEditingId(siswa.id);
    setFormData(siswa);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, nama: string) => {
    Swal.fire({
      title: 'Hapus Data Siswa?',
      text: `Apakah Anda yakin ingin menghapus siswa ${nama}? Data ini tidak dapat dikembalikan.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
    }).then((result) => {
      if (result.isConfirmed) {
        dbService.deleteSiswa(id);
        showToast('Data Siswa Dihapus', 'success', `Siswa ${nama} berhasil dihapus.`);
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nisn || !formData.nama || !formData.kelas) {
      showToast('Data Belum Lengkap', 'warning', 'NISN, Nama Lengkap, dan Kelas wajib diisi!');
      return;
    }

    const item: Siswa = {
      id: editingId || `s_${Date.now()}`,
      nisn: formData.nisn.trim(),
      nama: formData.nama.trim(),
      kelas: formData.kelas.trim(),
      jenisKelamin: formData.jenisKelamin || 'L',
      noHpOrtu: formData.noHpOrtu?.trim() || '',
      alamat: formData.alamat?.trim() || '',
      foto: formData.foto?.trim() || '',
      statusKartu: 'Aktif',
      userId: 'master_guru_default',
    };

    dbService.saveSiswa(item);
    setIsModalOpen(false);
    showToast(
      editingId ? 'Data Siswa Diperbarui!' : 'Siswa Baru Ditambahkan!',
      'success',
      `${item.nama} (${item.kelas})`
    );
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    exportService
      .parseSiswaExcel(file)
      .then((parsed) => {
        if (parsed.length === 0) {
          showToast('File Excel Kosong', 'warning', 'Tidak ditemukan data siswa valid.');
          return;
        }

        const formattedList: Siswa[] = parsed.map((p, idx) => ({
          id: `s_import_${Date.now()}_${idx}`,
          nisn: p.nisn || `00${Date.now()}${idx}`,
          nama: p.nama || 'Siswa Baru',
          kelas: p.kelas || 'X RPL 1',
          jenisKelamin: p.jenisKelamin || 'L',
          noHpOrtu: p.noHpOrtu || '',
          alamat: p.alamat || '',
          userId: 'master_guru_default',
        }));

        dbService.bulkImportSiswa(formattedList);
        showToast(
          'Impor Excel Berhasil!',
          'success',
          `Sebanyak ${formattedList.length} data siswa baru diimpor.`
        );
      })
      .catch((err) => {
        console.error(err);
        showToast('Gagal Impor Excel', 'error', 'Format file tidak didukung.');
      });

    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-600" />
            Manajemen Data Peserta Didik
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Kelola data induk siswa, impor/ekspor data Excel, dan cetak kartu pelajar otomatis.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* File Upload input */}
          <label className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl cursor-pointer shadow-sm transition-all">
            <FileSpreadsheet className="w-4 h-4" />
            Impor Excel
            <input type="file" accept=".xlsx, .xls, .csv" onChange={handleImportExcel} className="hidden" />
          </label>

          <button
            onClick={() => exportService.exportSiswaToExcel(filtered, `Data_Siswa_${selectedKelas}.xlsx`)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-700 hover:bg-slate-800 text-white text-sm font-medium rounded-xl shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            Ekspor Excel
          </button>

          <button
            onClick={onOpenCardPrinter}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-xl shadow-sm transition-all"
          >
            📇 Cetak Kartu QR
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Tambah Siswa
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan NISN, Nama Siswa, atau Alamat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="w-full sm:w-auto flex items-center gap-2">
          <select
            value={selectedKelas}
            onChange={(e) => setSelectedKelas(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200"
          >
            <option value="all">Semua Rombel/Kelas ({siswaList.length})</option>
            {kelasList.map((k) => (
              <option key={k} value={k}>
                {k} ({siswaList.filter((s) => s.kelas === k).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#1a3a5c] text-white">
              <tr>
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">NISN</th>
                <th className="py-3 px-4">Nama Lengkap Siswa</th>
                <th className="py-3 px-4">Kelas</th>
                <th className="py-3 px-4 text-center">L/P</th>
                <th className="py-3 px-4">Kontak Orang Tua</th>
                <th className="py-3 px-4">Alamat</th>
                <th className="py-3 px-4 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Tidak ada data siswa ditemukan.
                  </td>
                </tr>
              ) : (
                filtered.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 text-center font-mono text-xs">{idx + 1}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-blue-600 dark:text-blue-400">{s.nisn}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-bold">
                        {s.nama.charAt(0)}
                      </div>
                      {s.nama}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {s.kelas}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold">
                      <span className={s.jenisKelamin === 'L' ? 'text-blue-600' : 'text-pink-600'}>
                        {s.jenisKelamin}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-xs font-mono">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        {s.noHpOrtu || '-'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate">
                      {s.alamat || '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={onOpenCardPrinter}
                          className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                          title="Cetak & Lihat Kartu Siswa"
                        >
                          📇 Kartu
                        </button>
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Edit Siswa"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id, s.nama)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                          title="Hapus Siswa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Siswa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {editingId ? 'Edit Data Peserta Didik' : 'Tambah Peserta Didik Baru'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    NISN *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nisn || ''}
                    onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                    placeholder="Contoh: 0078129341"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Rombel / Kelas *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.kelas || ''}
                    onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                    placeholder="Contoh: X RPL 1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap Siswa *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama || ''}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                  placeholder="Nama Lengkap sesuai Akta / Ijazah"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={formData.jenisKelamin || 'L'}
                    onChange={(e) => setFormData({ ...formData, jenisKelamin: e.target.value as 'L' | 'P' })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    No. HP Orang Tua / Wali
                  </label>
                  <input
                    type="text"
                    value={formData.noHpOrtu || ''}
                    onChange={(e) => setFormData({ ...formData, noHpOrtu: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                    placeholder="Contoh: 08123456789"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Alamat Tempat Tinggal
                </label>
                <textarea
                  rows={2}
                  value={formData.alamat || ''}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                  placeholder="Jalan, RT/RW, Kelurahan, Kecamatan"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Foto Kartu Siswa (URL Gambar)
                </label>
                <input
                  type="url"
                  value={formData.foto || ''}
                  onChange={(e) => setFormData({ ...formData, foto: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                  placeholder="Tempelkan URL foto siswa (https://...)"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow"
                >
                  Simpan Data Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
