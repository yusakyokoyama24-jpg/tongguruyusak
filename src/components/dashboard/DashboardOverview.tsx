import React, { useState } from 'react';
import {
  Users,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  QrCode,
  ArrowRight,
  Award,
  ShieldCheck,
  Building2,
  Camera,
  Edit3,
  X,
  Upload,
  Check,
  TrendingUp,
  Flame,
  Bot,
  Zap,
  BookMarked,
  Presentation,
  CheckSquare,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { showToast } from '../../utils/toast';
import { Siswa, Mapel, Jadwal, Absensi, Nilai, Agenda, Pengaturan } from '../../types';
import { dbService } from '../../services/db';

interface DashboardOverviewProps {
  siswaList: Siswa[];
  mapelList: Mapel[];
  jadwalList: Jadwal[];
  absensiList: Absensi[];
  nilaiList: Nilai[];
  agendaList: Agenda[];
  pengaturan: Pengaturan;
  onNavigate: (tabId: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  siswaList,
  mapelList,
  jadwalList,
  absensiList,
  nilaiList,
  agendaList,
  pengaturan,
  onNavigate,
}) => {
  // Modal states for Dashboard Customization
  const [isEditSchoolModalOpen, setIsEditSchoolModalOpen] = useState(false);
  const [isEditPhotoModalOpen, setIsEditPhotoModalOpen] = useState(false);

  // Form states
  const [tempSchoolName, setTempSchoolName] = useState(pengaturan.namaSekolah);
  const [tempPhotoUrl, setTempPhotoUrl] = useState(pengaturan.fotoProfil || '');

  // Current day in Indonesian
  const dayIndex = new Date().getDay();
  const dayMap: Record<number, 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu'> = {
    1: 'Senin',
    2: 'Selasa',
    3: 'Rabu',
    4: 'Kamis',
    5: 'Jumat',
    6: 'Sabtu',
  };
  const todayName = dayMap[dayIndex] || 'Senin';
  const todaySchedules = jadwalList.filter((j) => j.hari === todayName);

  // Calculate attendance percentage this month
  const currentMonthStr = new Date().toISOString().substring(0, 7);
  const thisMonthAbsensi = absensiList.filter((a) => a.tanggal.startsWith(currentMonthStr));
  const hadirCount = thisMonthAbsensi.filter((a) => a.status === 'H').length;
  const attendanceRate = thisMonthAbsensi.length > 0 ? Math.round((hadirCount / thisMonthAbsensi.length) * 100) : 96;

  // Handlers for manual edits
  const handleSaveSchoolName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempSchoolName.trim()) {
      showToast('Peringatan', 'warning', 'Nama sekolah tidak boleh kosong!');
      return;
    }
    dbService.savePengaturan({ namaSekolah: tempSchoolName.trim() });
    setIsEditSchoolModalOpen(false);
    showToast('Nama Sekolah Diperbarui!', 'success', `Nama sekolah berhasil diubah menjadi "${tempSchoolName.trim()}"`);
  };

  const handleSaveProfilePhoto = (e: React.FormEvent) => {
    e.preventDefault();
    dbService.savePengaturan({ fotoProfil: tempPhotoUrl.trim() });
    setIsEditPhotoModalOpen(false);
    showToast('Foto Profil Diperbarui!', 'success', 'Foto profil custom guru berhasil disimpan.');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        Swal.fire('Ukuran Berkas Terlalu Besar', 'Maksimal ukuran foto adalah 2MB.', 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onload = (evt) => {
        setTempPhotoUrl(evt.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8">
      {/* HERO BANNER - Professional & Glassmorphic */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0f2744] via-[#1a3a5c] to-[#1e1b4b] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-white/10">
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          
          {/* Avatar & Greeting */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            {/* Custom Teacher Avatar */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-4 border-amber-400/80 shadow-2xl bg-slate-800 flex items-center justify-center font-black text-3xl text-white tracking-wider">
                {pengaturan.fotoProfil ? (
                  <img src={pengaturan.fotoProfil} alt="Foto Profil Guru" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                    {pengaturan.namaGuru.charAt(0)}
                  </div>
                )}
              </div>

              {/* Upload Overlay Icon */}
              <button
                onClick={() => {
                  setTempPhotoUrl(pengaturan.fotoProfil || '');
                  setIsEditPhotoModalOpen(true);
                }}
                className="absolute -bottom-2 -right-2 p-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl shadow-lg transition-transform hover:scale-110"
                title="Tambah / Ubah Foto Profil Custom"
              >
                <Camera className="w-4 h-4 font-bold" />
              </button>
            </div>

            {/* Greetings & Info */}
            <div className="space-y-2 max-w-xl">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-bold tracking-wide">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Master Administrator Guru
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-200 text-[11px] font-medium border border-blue-400/20">
                  ⚡ Kurikulum Merdeka
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                Selamat Datang, {pengaturan.namaGuru}!
              </h1>

              {/* Editable School Name Badge */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-sm text-blue-100">
                <div className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 backdrop-blur-md px-3 py-1 rounded-xl border border-white/20 transition-all">
                  <Building2 className="w-4 h-4 text-amber-300 shrink-0" />
                  <span className="font-bold tracking-wide text-white">{pengaturan.namaSekolah}</span>
                  <button
                    onClick={() => {
                      setTempSchoolName(pengaturan.namaSekolah);
                      setIsEditSchoolModalOpen(true);
                    }}
                    className="p-1 hover:text-amber-300 text-slate-300 transition-colors"
                    title="Ubah Nama Sekolah Secara Manual"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="hidden sm:inline">• {pengaturan.mapelUtama}</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                Aplikasi administrasi digital siap pakai: Presensi Kamera QR, Kartu Tanda Pelajar, Rapor Leger, dan AI Deep Learning Suite.
              </p>
            </div>
          </div>

          {/* Quick Header CTA Buttons */}
          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-center gap-2.5 w-full md:w-auto shrink-0">
            <button
              onClick={() => onNavigate('presensi')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
            >
              <QrCode className="w-4 h-4" />
              Presensi Kamera QR
            </button>

            <button
              onClick={() => onNavigate('ai-modul')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 backdrop-blur-md transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              Generator Modul AI
            </button>
          </div>
        </div>

        {/* Ambient Decorative Blurs */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-blue-500/20 blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>
      </div>

      {/* STATS METRIC CARDS - Clean & Vibrant */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Siswa */}
        <div
          onClick={() => onNavigate('siswa')}
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-xs hover:shadow-md hover:border-blue-400 cursor-pointer transition-all space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Peserta Didik
            </span>
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/80 rounded-xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                {siswaList.length}
              </span>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-full">
                Siswa Aktif
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Terdaftar di rombel kelas</p>
          </div>
        </div>

        {/* Total Mapel */}
        <div
          onClick={() => onNavigate('jadwal')}
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-xs hover:shadow-md hover:border-indigo-400 cursor-pointer transition-all space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Mata Pelajaran
            </span>
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/80 rounded-xl text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                {mapelList.length}
              </span>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full">
                {mapelList.reduce((acc, m) => acc + (m.jamPerMinggu || 0), 0)} JP/Minggu
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Mata pelajaran diampu</p>
          </div>
        </div>

        {/* Sesi Hari Ini */}
        <div
          onClick={() => onNavigate('jadwal')}
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-xs hover:shadow-md hover:border-amber-400 cursor-pointer transition-all space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Jadwal {todayName}
            </span>
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/80 rounded-xl text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                {todaySchedules.length}
              </span>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-full">
                {todaySchedules.length > 0 ? 'Mengajar Hari Ini' : 'Tidak Ada Sesi'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Sesi mengajar kelas</p>
          </div>
        </div>

        {/* Kehadiran Bulan Ini */}
        <div
          onClick={() => onNavigate('presensi')}
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-xs hover:shadow-md hover:border-emerald-400 cursor-pointer transition-all space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Kehadiran Siswa
            </span>
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/80 rounded-xl text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                {attendanceRate}%
              </span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Sangat Baik
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Tingkat presensi bulan ini</p>
          </div>
        </div>
      </div>

      {/* QUICK LAUNCH DOCK - Visual Action Hub */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Pusat Cepat Administrasi Guru
            </h3>
          </div>
          <span className="text-xs text-slate-400">Akses Cepat 1-Klik</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <button
            onClick={() => onNavigate('presensi')}
            className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-100/80 text-left transition-all group"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-110 transition-transform">
              <QrCode className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-tight">Presensi QR</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">Pemindai kamera</p>
          </button>

          <button
            onClick={() => onNavigate('kartu-siswa')}
            className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 hover:bg-blue-100/80 text-left transition-all group"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-tight">Kartu Siswa</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">Cetak QR & Barcode</p>
          </button>

          <button
            onClick={() => onNavigate('nilai')}
            className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 hover:bg-amber-100/80 text-left transition-all group"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-110 transition-transform">
              <Award className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-tight">Asesmen Nilai</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">Leger rapor otomatis</p>
          </button>

          <button
            onClick={() => onNavigate('agenda')}
            className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-100/80 text-left transition-all group"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-110 transition-transform">
              <BookMarked className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-tight">Jurnal Guru</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">Agenda harian KBM</p>
          </button>

          <button
            onClick={() => onNavigate('ai-modul')}
            className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 hover:bg-purple-100/80 text-left transition-all group"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-tight">Modul Ajar AI</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">Deep Learning</p>
          </button>

          <button
            onClick={() => onNavigate('ai-ppt')}
            className="p-3.5 rounded-2xl bg-violet-50/70 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800/50 hover:bg-violet-100/80 text-left transition-all group"
          >
            <div className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-110 transition-transform">
              <Presentation className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-tight">Bahan Tayang</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">Unduh file .pptx</p>
          </button>
        </div>
      </div>

      {/* TWO COLUMNS: SCHEDULE & AI SUITE SHOWCASE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Schedule & Classes */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Jadwal Mengajar Hari Ini ({todayName})
              </h3>
            </div>
            <button
              onClick={() => onNavigate('jadwal')}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
            >
              Lihat Semua Jadwal <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {todaySchedules.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs space-y-2">
                <p>Tidak ada agenda jam mengajar di kelas pada hari {todayName}.</p>
                <button
                  onClick={() => onNavigate('jadwal')}
                  className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-bold rounded-xl text-xs"
                >
                  + Kelola Jadwal Mingguan
                </button>
              </div>
            ) : (
              todaySchedules.map((j) => (
                <div
                  key={j.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded text-xs font-extrabold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {j.kelas}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">📍 {j.ruang || 'Lab Komputer'}</span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{j.namaMapel}</h4>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-slate-200 dark:border-slate-700 pt-2 sm:pt-0">
                    <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      {j.jamKe}
                    </span>

                    <button
                      onClick={() => onNavigate('presensi')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
                    >
                      Buka Presensi
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: AI Suite Deep Learning Highlights */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Suite AI Kurikulum Merdeka
              </h3>
            </div>
            <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold">
              Deep Learning
            </span>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={() => onNavigate('ai-modul')}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200/80 dark:border-slate-700 text-left transition-all group"
            >
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 flex items-center gap-1.5">
                  Modul Ajar Deep Learning
                  <span className="text-[9px] font-bold px-1.5 py-0.2 bg-rose-100 text-rose-700 rounded">Unggulan</span>
                </h4>
                <p className="text-[11px] text-slate-500">Memahami, Mengaplikasi, & Merefleksi</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => onNavigate('ai-perangkat')}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200/80 dark:border-slate-700 text-left transition-all group"
            >
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-600">
                  CP, TP, ATP, Prota, Prosem, KKTP
                </h4>
                <p className="text-[11px] text-slate-500">6 Format resmi BSKAP Kemendikbudristek</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => onNavigate('ai-soal')}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200/80 dark:border-slate-700 text-left transition-all group"
            >
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-600">
                  Paket Soal Ujian, LJS, & Kunci Rubrik
                </h4>
                <p className="text-[11px] text-slate-500">Naskah HOTS + Lembar Jawaban Siswa</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => onNavigate('ai-chat')}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-emerald-900/10 to-teal-900/10 dark:from-emerald-950/40 dark:to-teal-950/40 hover:from-emerald-900/20 border border-emerald-300 dark:border-emerald-800 text-left transition-all group"
            >
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5" /> Asisten Konsultan Guru AI 24/7
                </h4>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400">Tanya jawab pedagogik & e-rapor</p>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-600 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: UBAH NAMA SEKOLAH SECARA MANUAL */}
      {isEditSchoolModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 relative">
            <button
              onClick={() => setIsEditSchoolModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 flex items-center justify-center mb-2">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Ubah Nama Sekolah Secara Manual
              </h3>
              <p className="text-xs text-slate-500">
                Nama sekolah akan otomatis disinkronkan di Kop Dokumen, Cetak Kartu Siswa, Rapor Leger, dan Dashboard.
              </p>
            </div>

            <form onSubmit={handleSaveSchoolName} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nama Satuan Pendidikan / Sekolah Baru *
                </label>
                <input
                  type="text"
                  required
                  value={tempSchoolName}
                  onChange={(e) => setTempSchoolName(e.target.value)}
                  placeholder="Contoh: SMK Negeri 1 Indonesia Merdeka"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditSchoolModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Simpan Nama Sekolah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: UBAH / TAMBAH FOTO PROFIL CUSTOM */}
      {isEditPhotoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 relative">
            <button
              onClick={() => setIsEditPhotoModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 flex items-center justify-center mb-2">
                <Camera className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Tambah Foto Profil Custom Guru
              </h3>
              <p className="text-xs text-slate-500">
                Unggah file foto (PNG/JPG) atau tempelkan tautan URL gambar.
              </p>
            </div>

            {/* Live Preview Circle */}
            <div className="flex flex-col items-center justify-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-blue-600 shadow-md bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-black text-2xl text-slate-600">
                {tempPhotoUrl ? (
                  <img src={tempPhotoUrl} alt="Preview Foto" className="w-full h-full object-cover" />
                ) : (
                  <span>{pengaturan.namaGuru.charAt(0)}</span>
                )}
              </div>
              <span className="text-[11px] font-semibold text-slate-500">Pratinjau Foto Profil</span>
            </div>

            <form onSubmit={handleSaveProfilePhoto} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  1. Unggah File Foto dari Perangkat
                </label>
                <label className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-50 dark:bg-blue-950/50 border border-dashed border-blue-300 dark:border-blue-800 rounded-xl text-xs font-bold text-blue-700 dark:text-blue-300 cursor-pointer hover:bg-blue-100 transition-all">
                  <Upload className="w-4 h-4" /> Pilih File Gambar (PNG/JPG)
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  2. Atau Tempelkan Tautan URL Gambar
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={tempPhotoUrl}
                  onChange={(e) => setTempPhotoUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                {tempPhotoUrl && (
                  <button
                    type="button"
                    onClick={() => setTempPhotoUrl('')}
                    className="text-xs text-rose-600 hover:underline font-semibold"
                  >
                    Hapus Foto
                  </button>
                )}

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setIsEditPhotoModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Simpan Foto
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
