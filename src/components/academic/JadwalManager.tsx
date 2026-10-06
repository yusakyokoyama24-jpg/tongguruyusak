import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { Calendar, Plus, BookOpen, Clock, Trash2, Edit2, Layers, MapPin } from 'lucide-react';
import { Mapel, Jadwal } from '../../types';
import { dbService } from '../../services/db';
import { showToast } from '../../utils/toast';

interface JadwalManagerProps {
  mapelList: Mapel[];
  jadwalList: Jadwal[];
}

export const JadwalManager: React.FC<JadwalManagerProps> = ({ mapelList, jadwalList }) => {
  const [activeTab, setActiveTab] = useState<'jadwal' | 'mapel'>('jadwal');

  // Mapel modal state
  const [isMapelModalOpen, setIsMapelModalOpen] = useState(false);
  const [editingMapelId, setEditingMapelId] = useState<string | null>(null);
  const [mapelForm, setMapelForm] = useState<Partial<Mapel>>({
    kode: '',
    nama: '',
    tingkat: 'Kelas X',
    jamPerMinggu: 4,
  });

  // Jadwal modal state
  const [isJadwalModalOpen, setIsJadwalModalOpen] = useState(false);
  const [editingJadwalId, setEditingJadwalId] = useState<string | null>(null);
  const [jadwalForm, setJadwalForm] = useState<Partial<Jadwal>>({
    hari: 'Senin',
    jamKe: 'Jam Ke 1-3 (07.00 - 09.15)',
    mapelId: '',
    namaMapel: '',
    kelas: 'X RPL 1',
    ruang: 'Lab Komputer 1',
  });

  const HARI_LIST: ('Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu')[] = [
    'Senin',
    'Selasa',
    'Rabu',
    'Kamis',
    'Jumat',
    'Sabtu',
  ];

  // Mapel Handlers
  const handleOpenAddMapel = () => {
    setEditingMapelId(null);
    setMapelForm({ kode: '', nama: '', tingkat: 'Kelas X', jamPerMinggu: 4 });
    setIsMapelModalOpen(true);
  };

  const handleOpenEditMapel = (m: Mapel) => {
    setEditingMapelId(m.id);
    setMapelForm(m);
    setIsMapelModalOpen(true);
  };

  const handleDeleteMapel = (id: string, nama: string) => {
    Swal.fire({
      title: 'Hapus Mata Pelajaran?',
      text: `Hapus mapel "${nama}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus',
    }).then((res) => {
      if (res.isConfirmed) {
        dbService.deleteMapel(id);
        showToast('Terhapus', 'success', `Mata pelajaran ${nama} berhasil dihapus.`);
      }
    });
  };

  const handleSubmitMapel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapelForm.kode || !mapelForm.nama) {
      showToast('Peringatan', 'warning', 'Kode dan Nama Mapel wajib diisi!');
      return;
    }
    const item: Mapel = {
      id: editingMapelId || `m_${Date.now()}`,
      kode: mapelForm.kode.trim(),
      nama: mapelForm.nama.trim(),
      tingkat: mapelForm.tingkat?.trim() || 'Kelas X',
      jamPerMinggu: Number(mapelForm.jamPerMinggu) || 4,
      userId: 'master_guru_default',
    };
    dbService.saveMapel(item);
    setIsMapelModalOpen(false);
    showToast('Berhasil', 'success', `Mata Pelajaran ${item.nama} disimpan!`);
  };

  // Jadwal Handlers
  const handleOpenAddJadwal = (prefillHari?: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu') => {
    setEditingJadwalId(null);
    const firstMapel = mapelList[0];
    setJadwalForm({
      hari: prefillHari || 'Senin',
      jamKe: 'Jam Ke 1-3 (07.00 - 09.15)',
      mapelId: firstMapel?.id || '',
      namaMapel: firstMapel?.nama || '',
      kelas: 'X RPL 1',
      ruang: 'Lab Komputer',
    });
    setIsJadwalModalOpen(true);
  };

  const handleOpenEditJadwal = (j: Jadwal) => {
    setEditingJadwalId(j.id);
    setJadwalForm(j);
    setIsJadwalModalOpen(true);
  };

  const handleDeleteJadwal = (id: string) => {
    Swal.fire({
      title: 'Hapus Sesi Jadwal?',
      text: 'Hapus sesi jadwal mengajar ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus',
    }).then((res) => {
      if (res.isConfirmed) {
        dbService.deleteJadwal(id);
        showToast('Terhapus', 'success', 'Jadwal mengajar berhasil dihapus.');
      }
    });
  };

  const handleSubmitJadwal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jadwalForm.mapelId || !jadwalForm.kelas || !jadwalForm.jamKe) {
      showToast('Peringatan', 'warning', 'Mapel, Kelas, dan Jam mengajar wajib diisi!');
      return;
    }
    const mapelObj = mapelList.find((m) => m.id === jadwalForm.mapelId);
    const item: Jadwal = {
      id: editingJadwalId || `j_${Date.now()}`,
      hari: jadwalForm.hari || 'Senin',
      jamKe: jadwalForm.jamKe.trim(),
      mapelId: jadwalForm.mapelId,
      namaMapel: mapelObj ? mapelObj.nama : (jadwalForm.namaMapel || 'Mapel'),
      kelas: jadwalForm.kelas.trim(),
      ruang: jadwalForm.ruang?.trim() || 'Kelas',
      userId: 'master_guru_default',
    };
    dbService.saveJadwal(item);
    setIsJadwalModalOpen(false);
    showToast('Berhasil', 'success', `Sesi jadwal ${item.namaMapel} (${item.kelas}) berhasil disimpan!`);
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher & Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('jadwal')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'jadwal'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            📅 Jadwal Mingguan Visual
          </button>
          <button
            onClick={() => setActiveTab('mapel')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'mapel'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            📚 Daftar Mata Pelajaran ({mapelList.length})
          </button>
        </div>

        <div>
          {activeTab === 'jadwal' ? (
            <button
              onClick={() => handleOpenAddJadwal()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Tambah Sesi Jadwal
            </button>
          ) : (
            <button
              onClick={handleOpenAddMapel}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Tambah Mata Pelajaran
            </button>
          )}
        </div>
      </div>

      {/* View 1: Jadwal Mingguan Visual Grid */}
      {activeTab === 'jadwal' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {HARI_LIST.map((hari) => {
            const sessions = jadwalList.filter((j) => j.hari === hari);
            return (
              <div
                key={hari}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col"
              >
                {/* Header Hari */}
                <div className="bg-[#1a3a5c] text-white px-4 py-3 flex items-center justify-between">
                  <h3 className="font-bold text-sm tracking-wide flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-300" />
                    {hari}
                  </h3>
                  <span className="text-xs bg-white/10 px-2 py-0.5 rounded font-mono">
                    {sessions.length} Kelas
                  </span>
                </div>

                {/* Session Cards */}
                <div className="p-4 space-y-3 flex-1 bg-slate-50/50 dark:bg-slate-900/30">
                  {sessions.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      Tidak ada jadwal mengajar pada hari {hari}.
                      <button
                        onClick={() => handleOpenAddJadwal(hari)}
                        className="block mx-auto mt-2 text-blue-600 hover:underline font-medium"
                      >
                        + Tambah Jam Mengajar
                      </button>
                    </div>
                  ) : (
                    sessions.map((s) => (
                      <div
                        key={s.id}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3.5 rounded-xl shadow-xs space-y-2 relative group hover:border-blue-400 transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-800">
                            {s.kelas}
                          </span>
                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                            <button
                              onClick={() => handleOpenEditJadwal(s)}
                              className="p-1 text-slate-400 hover:text-blue-600"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteJadwal(s.id)}
                              className="p-1 text-slate-400 hover:text-rose-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                            {s.namaMapel}
                          </h4>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-700/50">
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {s.jamKe}
                          </span>
                          <span className="flex items-center gap-1 text-[11px]">
                            <MapPin className="w-3 h-3 text-amber-500" />
                            {s.ruang || 'Ruang Kelas'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View 2: Data Mata Pelajaran */}
      {activeTab === 'mapel' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#1a3a5c] text-white">
              <tr>
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Kode Mapel</th>
                <th className="py-3 px-4">Nama Mata Pelajaran</th>
                <th className="py-3 px-4">Tingkat / Fase</th>
                <th className="py-3 px-4 text-center">Beban Jam / Minggu</th>
                <th className="py-3 px-4 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {mapelList.map((m, idx) => (
                <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-3 px-4 text-center font-mono text-xs">{idx + 1}</td>
                  <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">{m.kode}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-500" />
                    {m.nama}
                  </td>
                  <td className="py-3 px-4">{m.tingkat}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                    {m.jamPerMinggu} JP
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleOpenEditMapel(m)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMapel(m.id, m.nama)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Add / Edit Mapel */}
      {isMapelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {editingMapelId ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}
            </h3>
            <form onSubmit={handleSubmitMapel} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kode Mapel *
                </label>
                <input
                  type="text"
                  required
                  value={mapelForm.kode || ''}
                  onChange={(e) => setMapelForm({ ...mapelForm, kode: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                  placeholder="Contoh: INF-X"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Mata Pelajaran *
                </label>
                <input
                  type="text"
                  required
                  value={mapelForm.nama || ''}
                  onChange={(e) => setMapelForm({ ...mapelForm, nama: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                  placeholder="Contoh: Pemrograman Berorientasi Objek"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tingkat / Fase
                  </label>
                  <input
                    type="text"
                    value={mapelForm.tingkat || 'Kelas X'}
                    onChange={(e) => setMapelForm({ ...mapelForm, tingkat: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Jam per Minggu (JP)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={mapelForm.jamPerMinggu || 4}
                    onChange={(e) => setMapelForm({ ...mapelForm, jamPerMinggu: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsMapelModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow"
                >
                  Simpan Mapel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Jadwal */}
      {isJadwalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {editingJadwalId ? 'Edit Sesi Jadwal Mengajar' : 'Tambah Sesi Jadwal Mengajar'}
            </h3>
            <form onSubmit={handleSubmitJadwal} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Hari *
                  </label>
                  <select
                    value={jadwalForm.hari}
                    onChange={(e) =>
                      setJadwalForm({
                        ...jadwalForm,
                        hari: e.target.value as 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu',
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                  >
                    {HARI_LIST.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kelas / Rombel *
                  </label>
                  <input
                    type="text"
                    required
                    value={jadwalForm.kelas || ''}
                    onChange={(e) => setJadwalForm({ ...jadwalForm, kelas: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                    placeholder="Contoh: X RPL 1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mata Pelajaran *
                </label>
                <select
                  required
                  value={jadwalForm.mapelId || ''}
                  onChange={(e) => setJadwalForm({ ...jadwalForm, mapelId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                >
                  <option value="">-- Pilih Mata Pelajaran --</option>
                  {mapelList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nama} ({m.kode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Jam Ke / Waktu *
                  </label>
                  <input
                    type="text"
                    required
                    value={jadwalForm.jamKe || ''}
                    onChange={(e) => setJadwalForm({ ...jadwalForm, jamKe: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                    placeholder="Jam 1-3 (07.00 - 09.15)"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ruangan / Lab
                  </label>
                  <input
                    type="text"
                    value={jadwalForm.ruang || ''}
                    onChange={(e) => setJadwalForm({ ...jadwalForm, ruang: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                    placeholder="Contoh: Lab Komputer 1"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsJadwalModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow"
                >
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
