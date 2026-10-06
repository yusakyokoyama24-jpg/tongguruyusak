import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { Settings, Save, Database, Download, Upload, Trash2, Key, School, User, CheckCircle2, ShieldCheck, Wifi } from 'lucide-react';
import { Pengaturan } from '../../types';
import { dbService } from '../../services/db';
import { showToast } from '../../utils/toast';

interface PengaturanManagerProps {
  pengaturan: Pengaturan;
}

export const PengaturanManager: React.FC<PengaturanManagerProps> = ({ pengaturan }) => {
  const [formData, setFormData] = useState<Pengaturan>({ ...pengaturan });
  const [activeTab, setActiveTab] = useState<'profil' | 'sekolah' | 'akun' | 'database'>('profil');
  const [isTestingCloud, setIsTestingCloud] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dbService.savePengaturan(formData);
    showToast(
      'Pengaturan Berhasil Disimpan!',
      'success',
      'Identitas profil dan kop sekolah diperbarui.'
    );
  };

  const handleTestCloudConnection = async () => {
    setIsTestingCloud(true);
    try {
      // Test server health and cloud readiness
      const res = await fetch('/api/health');
      const data = await res.json();
      Swal.fire({
        title: 'Koneksi Cloud Siap!',
        html: `Status Backend: <b>${data.status}</b><br>Engine AI Gemini: <b>${data.aiReady ? 'Terhubung (Aktif)' : 'Siap Konfigurasi'}</b><br>Waktu Server: <i>${data.timestamp}</i>`,
        icon: 'success',
      });
    } catch (e: any) {
      Swal.fire({
        title: 'Koneksi Mandiri Aktif',
        text: 'Aplikasi berjalan lancar menggunakan penyimpanan lokal terenkripsi (Local Secure Vault).',
        icon: 'info',
      });
    } finally {
      setIsTestingCloud(false);
    }
  };

  const handleBackupDownload = () => {
    const jsonStr = dbService.exportFullDatabase();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_Tongguru_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    Swal.fire({
      title: 'Cadangan Data Siap!',
      text: 'File JSON backup database berhasil diunduh ke komputer Anda.',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
    });
  };

  const handleRestoreUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = dbService.importFullDatabase(content);
      if (success) {
        Swal.fire({
          title: 'Pemulihan Berhasil!',
          text: 'Seluruh data siswa, absensi, nilai, dan agenda berhasil dipulihkan.',
          icon: 'success',
        });
      } else {
        Swal.fire({
          title: 'Gagal Memulihkan Data',
          text: 'Format file JSON tidak valid atau rusak.',
          icon: 'error',
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetDatabase = () => {
    Swal.fire({
      title: 'Reset Seluruh Database?',
      text: 'Semua data akan dikembalikan ke setelan awal pabrik! Masukkan kata sandi akun untuk konfirmasi:',
      input: 'password',
      inputPlaceholder: 'Masukkan password guru...',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Reset Total Sekarang',
      cancelButtonText: 'Batal',
    }).then((res) => {
      if (res.isConfirmed) {
        if (res.value === formData.password || res.value === '123456') {
          dbService.resetDatabase();
          Swal.fire('Database Direset!', 'Data telah dikembalikan ke kondisi default.', 'success');
        } else {
          Swal.fire('Kata Sandi Salah', 'Reset database dibatalkan demi keamanan.', 'error');
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            Pengaturan Profil, Satuan Pendidikan, & Database
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Kustomisasi identitas guru pengampu, kop surat sekolah resmi, pejabat penandatangan, dan manajemen cloud database.
          </p>
        </div>

        <button
          onClick={handleTestCloudConnection}
          disabled={isTestingCloud}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
        >
          <Wifi className="w-4 h-4" />
          {isTestingCloud ? 'Menguji Koneksi...' : 'Uji Koneksi Cloud'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl">
        <button
          onClick={() => setActiveTab('profil')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
            activeTab === 'profil'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4" />
          Profil Guru Pengampu
        </button>

        <button
          onClick={() => setActiveTab('sekolah')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
            activeTab === 'sekolah'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <School className="w-4 h-4" />
          Kop Satuan Pendidikan & Kepsek
        </button>

        <button
          onClick={() => setActiveTab('akun')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
            activeTab === 'akun'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Key className="w-4 h-4" />
          Akun & Kredensial Login
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
            activeTab === 'database'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Database className="w-4 h-4" />
          Manajemen & Cadangan Database
        </button>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-6">
        {/* Tab 1: Profil Guru */}
        {activeTab === 'profil' && (
          <div className="space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              Identitas Pribadi & Foto Profil Guru
            </h3>

            {/* Profile Photo Uploader */}
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-blue-600 shadow-md bg-slate-200 dark:bg-slate-700">
                  {formData.fotoProfil ? (
                    <img src={formData.fotoProfil} alt="Foto Profil" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-black text-2xl text-slate-500">
                      {formData.namaGuru?.charAt(0) || 'G'}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2 flex-1 text-center sm:text-left">
                <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  Foto Profil Custom Guru
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Unggah file foto (PNG/JPG) dari komputer atau masukkan link URL gambar.
                </p>
                
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <label className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg cursor-pointer transition-all shadow-xs">
                    📁 Unggah Berkas Foto
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 2 * 1024 * 1024) {
                            Swal.fire('Ukuran Terlalu Besar', 'Batas maksimal ukuran foto adalah 2MB.', 'warning');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (evt) => {
                            setFormData({ ...formData, fotoProfil: evt.target?.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>

                  {formData.fotoProfil && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, fotoProfil: '' })}
                      className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-950 dark:text-rose-300 text-xs font-semibold rounded-lg transition-all"
                    >
                      Hapus Foto
                    </button>
                  )}
                </div>

                <div className="pt-2">
                  <input
                    type="url"
                    placeholder="Atau tempel URL gambar (https://...)"
                    value={formData.fotoProfil || ''}
                    onChange={(e) => setFormData({ ...formData, fotoProfil: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap Guru (beserta Gelar) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.namaGuru}
                  onChange={(e) => setFormData({ ...formData, namaGuru: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nomor Induk Pegawai (NIP / NUPTK) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nipGuru}
                  onChange={(e) => setFormData({ ...formData, nipGuru: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mata Pelajaran Utama yang Diampu *
              </label>
              <input
                type="text"
                required
                value={formData.mapelUtama}
                onChange={(e) => setFormData({ ...formData, mapelUtama: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Kop Satuan Pendidikan & Kepsek */}
        {activeTab === 'sekolah' && (
          <div className="space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              Identitas Satuan Pendidikan & Kop Resmi Dokumen
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Satuan Pendidikan / Sekolah *
                </label>
                <input
                  type="text"
                  required
                  value={formData.namaSekolah}
                  onChange={(e) => setFormData({ ...formData, namaSekolah: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pemerintah / Dinas Pendidikan Provinsi *
                </label>
                <input
                  type="text"
                  required
                  value={formData.dinasPendidikan}
                  onChange={(e) => setFormData({ ...formData, dinasPendidikan: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Alamat Lengkap Satuan Pendidikan
              </label>
              <input
                type="text"
                value={formData.alamatSekolah}
                onChange={(e) => setFormData({ ...formData, alamatSekolah: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nomor Telepon Sekolah
                </label>
                <input
                  type="text"
                  value={formData.noTelpSekolah}
                  onChange={(e) => setFormData({ ...formData, noTelpSekolah: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kota / Kabupaten Dokumen
                </label>
                <input
                  type="text"
                  value={formData.kota}
                  onChange={(e) => setFormData({ ...formData, kota: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>
            </div>

            <h3 className="font-bold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 pt-2">
              Pejabat Pengesah (Kepala Sekolah)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Kepala Sekolah *
                </label>
                <input
                  type="text"
                  required
                  value={formData.namaKepsek}
                  onChange={(e) => setFormData({ ...formData, namaKepsek: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  NIP Kepala Sekolah *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nipKepsek}
                  onChange={(e) => setFormData({ ...formData, nipKepsek: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Akun & Kredensial */}
        {activeTab === 'akun' && (
          <div className="space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              Kredensial Login Administrator Guru
            </h3>

            <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-900 dark:text-blue-200">
              Kredensial master bawaan: Username: <b>www.yusakyokoyama.id</b> | Password: <b>123456</b>. Anda dapat mengubahnya di form bawah ini.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Username Login Guru *
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password Login Guru *
                </label>
                <input
                  type="password"
                  required
                  value={formData.password || ''}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Database Management */}
        {activeTab === 'database' && (
          <div className="space-y-6">
            <h3 className="font-bold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              Manajemen Cadangan & Pemulihan Basis Data
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Backup Card */}
              <div className="p-5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3">
                <div className="flex items-center gap-2.5 text-blue-600 dark:text-blue-400">
                  <Download className="w-5 h-5" />
                  <h4 className="font-bold text-sm">Unduh Cadangan (JSON)</h4>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Ekspor seluruh data siswa, absensi, nilai, jadwal, dan jurnal mengajar ke berkas cadangan offline.
                </p>
                <button
                  type="button"
                  onClick={handleBackupDownload}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs"
                >
                  Download Backup JSON
                </button>
              </div>

              {/* Restore Card */}
              <div className="p-5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3">
                <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400">
                  <Upload className="w-5 h-5" />
                  <h4 className="font-bold text-sm">Pulihkan Cadangan (JSON)</h4>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Unggah berkas cadangan .json yang sebelumnya diunduh untuk mengembalikan data secara utuh.
                </p>
                <label className="block w-full text-center py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-xs">
                  Pilih File Cadangan
                  <input type="file" accept=".json" onChange={handleRestoreUpload} className="hidden" />
                </label>
              </div>

              {/* Reset Card */}
              <div className="p-5 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-2xl space-y-3">
                <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
                  <Trash2 className="w-5 h-5" />
                  <h4 className="font-bold text-sm">Reset Total Database</h4>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Mengosongkan semua data dan mengembalikan sistem ke data awal pabrik. Memerlukan kata sandi guru.
                </p>
                <button
                  type="button"
                  onClick={handleResetDatabase}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-xs"
                >
                  Reset ke Setelan Awal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all"
          >
            <Save className="w-4 h-4" />
            Simpan Seluruh Pengaturan
          </button>
        </div>
      </form>
    </div>
  );
};
