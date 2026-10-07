import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  QrCode,
  Calendar,
  UserCheck,
  Award,
  BookMarked,
  HeartHandshake,
  FolderDown,
  Sparkles,
  FileCheck,
  Heart,
  Target,
  FileQuestion,
  BookCheck,
  PenTool,
  Presentation,
  Bot,
  FileText,
  Settings,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  ShieldCheck,
  Wifi,
  ChevronRight,
  Layers,
  Camera,
  Building2,
  Upload,
  Check,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { dbService } from './services/db';
import { showToast } from './utils/toast';
import { Siswa, Mapel, Jadwal, Absensi, Nilai, Agenda, Bimbingan, Pengaturan, UserSession } from './types';

// Academic Components
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { SiswaManager } from './components/academic/SiswaManager';
import { KartuSiswaView } from './components/academic/KartuSiswaView';
import { JadwalManager } from './components/academic/JadwalManager';
import { AbsensiManager } from './components/academic/AbsensiManager';
import { NilaiManager } from './components/academic/NilaiManager';
import { AgendaManager } from './components/academic/AgendaManager';
import { BimbinganManager } from './components/academic/BimbinganManager';
import { DownloadPerangkat } from './components/academic/DownloadPerangkat';

// AI Suite Components
import { ModulAjarGenerator } from './components/ai/ModulAjarGenerator';
import { PerangkatAjarGenerator } from './components/ai/PerangkatAjarGenerator';
import { KbcGenerator } from './components/ai/KbcGenerator';
import { KokurikulerGenerator } from './components/ai/KokurikulerGenerator';
import { SoalUjianGenerator } from './components/ai/SoalUjianGenerator';
import { KartuSoalGenerator } from './components/ai/KartuSoalGenerator';
import { LkpdGenerator } from './components/ai/LkpdGenerator';
import { PptGenerator } from './components/ai/PptGenerator';
import { ChatAsistenGuru } from './components/ai/ChatAsistenGuru';

// Reports & Settings Components
import { PusatLaporan } from './components/reports/PusatLaporan';
import { PengaturanManager } from './components/settings/PengaturanManager';
import { LoginModal } from './components/auth/LoginModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => dbService.getCurrentUser());
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('tongguru_dark') === 'true';
  });

  // Mobile BottomSheet state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bottomSheetType, setBottomSheetType] = useState<'akademik' | 'ai' | null>(null);

  // Upload Logo Modal state
  const [isUploadLogoModalOpen, setIsUploadLogoModalOpen] = useState(false);
  const [logoFileUrl, setLogoFileUrl] = useState('');

  // Reactive DB state
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [mapelList, setMapelList] = useState<Mapel[]>([]);
  const [jadwalList, setJadwalList] = useState<Jadwal[]>([]);
  const [absensiList, setAbsensiList] = useState<Absensi[]>([]);
  const [nilaiList, setNilaiList] = useState<Nilai[]>([]);
  const [agendaList, setAgendaList] = useState<Agenda[]>([]);
  const [bimbinganList, setBimbinganList] = useState<Bimbingan[]>([]);
  const [pengaturan, setPengaturan] = useState<Pengaturan>(() => dbService.getPengaturan());

  const refreshData = () => {
    setSiswaList(dbService.getSiswa());
    setMapelList(dbService.getMapel());
    setJadwalList(dbService.getJadwal());
    setAbsensiList(dbService.getAbsensi());
    setNilaiList(dbService.getNilai());
    setAgendaList(dbService.getAgenda());
    setBimbinganList(dbService.getBimbingan());
    setPengaturan(dbService.getPengaturan());
    setCurrentUser(dbService.getCurrentUser());
  };

  useEffect(() => {
    dbService.init();
    refreshData();
    const unsubscribe = dbService.subscribe(refreshData);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('tongguru_dark', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('tongguru_dark', 'false');
    }
  }, [darkMode]);

  const handleLogout = () => {
    Swal.fire({
      title: 'Keluar dari Aplikasi?',
      text: 'Anda akan keluar dari sesi master guru.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, Keluar',
      cancelButtonText: 'Batal',
    }).then((res) => {
      if (res.isConfirmed) {
        dbService.setAuthUser(null);
        setCurrentUser(null);
        setActiveTab('dashboard');
      }
    });
  };

  // If not logged in, show Login Screen
  if (!currentUser) {
    return <LoginModal onLoginSuccess={(u) => setCurrentUser(u)} />;
  }

  // Navigation Items
  const NAV_GROUPS = [
    {
      groupTitle: 'Utama',
      items: [{ id: 'dashboard', label: 'Dashboard Utama', icon: LayoutDashboard }],
    },
    {
      groupTitle: 'Modul Akademik & Siswa',
      items: [
        { id: 'siswa', label: 'Kelola Peserta Didik', icon: Users },
        { id: 'kartu-siswa', label: 'Cetak Kartu Siswa QR', icon: QrCode },
        { id: 'jadwal', label: 'Mata Pelajaran & Jadwal', icon: Calendar },
        { id: 'presensi', label: 'Presensi Digital (QR/Manual)', icon: UserCheck },
        { id: 'nilai', label: 'Asesmen & Leger Nilai', icon: Award },
        { id: 'agenda', label: 'Jurnal Agenda Mengajar', icon: BookMarked },
        { id: 'bimbingan', label: 'Bimbingan Wali / BK', icon: HeartHandshake },
        { id: 'perangkat-unduh', label: 'Unduh Perangkat Ajar', icon: FolderDown },
      ],
    },
    {
      groupTitle: 'Suite AI Kurikulum Merdeka',
      items: [
        { id: 'ai-modul', label: 'Modul Ajar Deep Learning', icon: Sparkles, badge: 'HOT' },
        { id: 'ai-perangkat', label: 'CP, TP, ATP, Prota, KKTP', icon: FileCheck },
        { id: 'ai-kbc', label: 'Perangkat Berbasis Cinta', icon: Heart },
        { id: 'ai-kokurikuler', label: 'Modul Kokurikuler Proyek', icon: Target },
        { id: 'ai-soal', label: 'Paket Soal Ujian & LJS', icon: FileQuestion },
        { id: 'ai-kartu-soal', label: 'Kartu Soal & Kisi-Kisi', icon: BookCheck },
        { id: 'ai-lkpd', label: 'Generator LKPD AI', icon: PenTool },
        { id: 'ai-ppt', label: 'Generator Presentasi PPT', icon: Presentation },
        { id: 'ai-chat', label: 'Asisten Chat Konsultan AI', icon: Bot },
      ],
    },
    {
      groupTitle: 'Laporan & Pengaturan',
      items: [
        { id: 'laporan', label: 'Pusat Laporan & Cetak', icon: FileText },
        { id: 'pengaturan', label: 'Pengaturan & Database', icon: Settings },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased">
      {/* Top Header Bar with Rich Gradient & Proportional Fonts */}
      <header className="sticky top-0 z-30 bg-gradient-to-r from-[#0a192f] via-[#1a3a5c] to-[#0f172a] text-white shadow-xl border-b border-blue-900/60 px-4 sm:px-6 py-3 no-print">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Mobile Menu Trigger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-200 hover:bg-white/10 rounded-xl transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* School Logo (Left of Title) & Title */}
            <div className="flex items-center gap-3">
              {/* Interactive Custom School Logo replacing default logo on the LEFT */}
              <div
                onClick={() => {
                  setLogoFileUrl(pengaturan.logoSekolahUrl || '');
                  setIsUploadLogoModalOpen(true);
                }}
                className="relative group w-11 h-11 rounded-2xl bg-white/95 dark:bg-slate-800 border-2 border-amber-400 p-1 flex items-center justify-center shadow-lg shrink-0 cursor-pointer transition-all hover:scale-105"
                title="Klik untuk Unggah / Ganti Logo Sekolah Custom"
              >
                {pengaturan.logoSekolahUrl ? (
                  <img src={pengaturan.logoSekolahUrl} alt="Logo Sekolah" className="w-full h-full object-contain rounded-lg" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-[#1a3a5c] to-blue-600 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-amber-300" />
                  </div>
                )}
                {/* Camera Overlay Badge */}
                <div className="absolute -bottom-1 -right-1 p-1 bg-amber-400 text-slate-950 rounded-full shadow-md group-hover:scale-110 transition-transform">
                  <Camera className="w-2.5 h-2.5 font-bold" />
                </div>
              </div>

              {/* Title Text */}
              <div>
                <h1
                  onClick={() => setActiveTab('dashboard')}
                  className="font-black text-xs sm:text-sm md:text-base tracking-wide leading-tight uppercase text-white cursor-pointer hover:text-amber-300 transition-colors drop-shadow-xs"
                >
                  DASHBOARD ADMINISTRASI TONGGURU YUSAK YOKOYAMA
                </h1>
                <p className="text-[11px] text-blue-200/90 hidden sm:block truncate max-w-sm font-medium">
                  {pengaturan.namaSekolah} • Master Guru {pengaturan.namaGuru.split(',')[0]}
                </p>
              </div>
            </div>
          </div>

          {/* Teacher Profile & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Cloud Status Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[11px] font-bold text-emerald-300 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Cloud Database Aktif
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-slate-200 hover:bg-white/10 rounded-xl transition-colors"
              title={darkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-200" />}
            </button>

            {/* Teacher Badge */}
            <div className="hidden md:flex items-center gap-2.5 pl-2 border-l border-white/20">
              <div
                onClick={() => setActiveTab('pengaturan')}
                className="w-9 h-9 rounded-full overflow-hidden border-2 border-amber-400 shadow-md cursor-pointer bg-slate-800 flex items-center justify-center font-bold text-xs text-white"
                title="Klik untuk ubah foto profil"
              >
                {pengaturan.fotoProfil ? (
                  <img src={pengaturan.fotoProfil} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-bold text-xs text-white">
                    {pengaturan.namaGuru.charAt(0)}
                  </div>
                )}
              </div>
              <div className="text-left">
                <span className="block text-xs font-bold text-white leading-tight">
                  {pengaturan.namaGuru.split(',')[0]}
                </span>
                <span className="block text-[10px] text-blue-200/80 font-medium">
                  {currentUser.role}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-2 text-rose-300 hover:bg-rose-500/20 rounded-xl transition-colors"
              title="Keluar Akun"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex w-full">
        {/* Desktop Sidebar (Left) */}
        <aside className="hidden lg:block w-72 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-61px)] sticky top-[61px] no-print">
          {NAV_GROUPS.map((grp, idx) => (
            <div key={idx} className="space-y-1.5">
              <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {grp.groupTitle}
              </span>
              <div className="space-y-0.5">
                {grp.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </aside>

        {/* Mobile Full Sidebar Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <div className="relative w-72 max-w-[80%] bg-white dark:bg-slate-900 h-full p-5 overflow-y-auto z-10 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-sm text-slate-900 dark:text-white">Navigasi EdAdmin Pro</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg hover:bg-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {NAV_GROUPS.map((grp, idx) => (
                <div key={idx} className="space-y-1.5">
                  <span className="px-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    {grp.groupTitle}
                  </span>
                  <div className="space-y-0.5">
                    {grp.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id);
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold ${
                            isActive
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="w-4 h-4" />
                            <span>{item.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Body with Smooth Fade-In Animation on Tab Change */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-24 lg:pb-8">
          <div key={activeTab} className="animate-fade-in-tab">
            {activeTab === 'dashboard' && (
              <DashboardOverview
                siswaList={siswaList}
                mapelList={mapelList}
                jadwalList={jadwalList}
                absensiList={absensiList}
                nilaiList={nilaiList}
                agendaList={agendaList}
                pengaturan={pengaturan}
                onNavigate={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'siswa' && (
              <SiswaManager
                siswaList={siswaList}
                onOpenCardPrinter={() => setActiveTab('kartu-siswa')}
              />
            )}

            {activeTab === 'kartu-siswa' && (
              <KartuSiswaView siswaList={siswaList} pengaturan={pengaturan} />
            )}

            {activeTab === 'jadwal' && (
              <JadwalManager mapelList={mapelList} jadwalList={jadwalList} />
            )}

            {activeTab === 'presensi' && (
              <AbsensiManager siswaList={siswaList} absensiList={absensiList} />
            )}

            {activeTab === 'nilai' && (
              <NilaiManager
                siswaList={siswaList}
                mapelList={mapelList}
                nilaiList={nilaiList}
                pengaturan={pengaturan}
              />
            )}

            {activeTab === 'agenda' && (
              <AgendaManager agendaList={agendaList} pengaturan={pengaturan} />
            )}

            {activeTab === 'bimbingan' && (
              <BimbinganManager bimbinganList={bimbinganList} siswaList={siswaList} />
            )}

            {activeTab === 'perangkat-unduh' && <DownloadPerangkat />}

            {/* AI Suite Modules */}
            {activeTab === 'ai-modul' && <ModulAjarGenerator />}
            {activeTab === 'ai-perangkat' && <PerangkatAjarGenerator />}
            {activeTab === 'ai-kbc' && <KbcGenerator />}
            {activeTab === 'ai-kokurikuler' && <KokurikulerGenerator />}
            {activeTab === 'ai-soal' && <SoalUjianGenerator />}
            {activeTab === 'ai-kartu-soal' && <KartuSoalGenerator />}
            {activeTab === 'ai-lkpd' && <LkpdGenerator />}
            {activeTab === 'ai-ppt' && <PptGenerator />}
            {activeTab === 'ai-chat' && <ChatAsistenGuru />}

            {/* Reports & Settings */}
            {activeTab === 'laporan' && (
              <PusatLaporan
                siswaList={siswaList}
                mapelList={mapelList}
                absensiList={absensiList}
                nilaiList={nilaiList}
                agendaList={agendaList}
                pengaturan={pengaturan}
              />
            )}

            {activeTab === 'pengaturan' && <PengaturanManager pengaturan={pengaturan} />}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation (Bawah) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-around no-print shadow-lg">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${
            activeTab === 'dashboard' ? 'text-blue-600' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Beranda</span>
        </button>

        <button
          onClick={() => setBottomSheetType(bottomSheetType === 'akademik' ? null : 'akademik')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${
            ['siswa', 'kartu-siswa', 'jadwal', 'presensi', 'nilai', 'agenda', 'bimbingan'].includes(activeTab)
              ? 'text-blue-600'
              : 'text-slate-500'
          }`}
        >
          <Users className="w-5 h-5" />
          <span>Akademik</span>
        </button>

        <button
          onClick={() => setBottomSheetType(bottomSheetType === 'ai' ? null : 'ai')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${
            activeTab.startsWith('ai-') ? 'text-amber-500' : 'text-slate-500'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span>AI Tools</span>
        </button>

        <button
          onClick={() => setActiveTab('laporan')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${
            activeTab === 'laporan' ? 'text-blue-600' : 'text-slate-500'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span>Laporan</span>
        </button>
      </nav>

      {/* Mobile BottomSheets */}
      {bottomSheetType && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setBottomSheetType(null)} />
          <div className="relative w-full bg-white dark:bg-slate-900 rounded-t-3xl p-5 z-10 shadow-2xl border-t border-slate-200 dark:border-slate-800 max-h-[70vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                {bottomSheetType === 'akademik' ? 'Menu Administrasi Akademik' : 'Suite Generator AI Kurikulum Merdeka'}
              </span>
              <button onClick={() => setBottomSheetType(null)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {bottomSheetType === 'akademik' && (
                <>
                  <button
                    onClick={() => {
                      setActiveTab('siswa');
                      setBottomSheetType(null);
                    }}
                    className="p-3 text-left bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-semibold"
                  >
                    👥 Data Peserta Didik
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('kartu-siswa');
                      setBottomSheetType(null);
                    }}
                    className="p-3 text-left bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-semibold"
                  >
                    📇 Cetak Kartu Siswa QR
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('presensi');
                      setBottomSheetType(null);
                    }}
                    className="p-3 text-left bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-semibold"
                  >
                    📷 Presensi QR Kamera
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('jadwal');
                      setBottomSheetType(null);
                    }}
                    className="p-3 text-left bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-semibold"
                  >
                    📅 Jadwal Mingguan
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('nilai');
                      setBottomSheetType(null);
                    }}
                    className="p-3 text-left bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-semibold"
                  >
                    🎖️ Asesmen Nilai Rapor
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('agenda');
                      setBottomSheetType(null);
                    }}
                    className="p-3 text-left bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-semibold"
                  >
                    📖 Jurnal Harian Guru
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('bimbingan');
                      setBottomSheetType(null);
                    }}
                    className="p-3 text-left bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-semibold"
                  >
                    🤝 Bimbingan Wali / BK
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('perangkat-unduh');
                      setBottomSheetType(null);
                    }}
                    className="p-3 text-left bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-semibold"
                  >
                    📂 Unduh Perangkat Ajar
                  </button>
                </>
              )}

              {bottomSheetType === 'ai' && (
                <>
                  <button
                    onClick={() => {
                      setActiveTab('ai-modul');
                      setBottomSheetType(null);
                    }}
                    className="p-3 text-left bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-semibold text-blue-600"
                  >
                    ✨ Modul Ajar Deep Learning
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('ai-perangkat');
                      setBottomSheetType(null);
                    }}
                    className="p-3 text-left bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-semibold"
                  >
                    📑 CP, TP, ATP, Prota, KKTP
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('ai-soal');
                      setBottomSheetType(null);
                    }}
                    className="p-3 text-left bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-semibold"
                  >
                    📝 Paket Soal Ujian & LJS
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('ai-ppt');
                      setBottomSheetType(null);
                    }}
                    className="p-3 text-left bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-semibold"
                  >
                    📊 Slide Bahan Tayang PPT
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('ai-kbc');
                      setBottomSheetType(null);
                    }}
                    className="p-3 text-left bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-semibold"
                  >
                    ❤️ Perangkat Berbasis Cinta
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('ai-kokurikuler');
                      setBottomSheetType(null);
                    }}
                    className="p-3 text-left bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-semibold"
                  >
                    🎯 Modul Kokurikuler Proyek
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('ai-kartu-soal');
                      setBottomSheetType(null);
                    }}
                    className="p-3 text-left bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-semibold"
                  >
                    🗂️ Kartu Soal & Kisi-Kisi
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('ai-lkpd');
                      setBottomSheetType(null);
                    }}
                    className="p-3 text-left bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-semibold"
                  >
                    ✏️ Generator LKPD AI
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('ai-chat');
                      setBottomSheetType(null);
                    }}
                    className="p-3 text-left bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-semibold text-emerald-600 col-span-2"
                  >
                    🤖 Chat Asisten Konsultan Guru AI
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL UNGGAH LOGO SEKOLAH */}
      {isUploadLogoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 relative">
            <button
              onClick={() => setIsUploadLogoModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 flex items-center justify-center mb-2">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Unggah Logo Sekolah Baru
              </h3>
              <p className="text-xs text-slate-500">
                Logo sekolah akan ditampilkan di samping judul dashboard, kop surat resmi, dan cetakan kartu siswa.
              </p>
            </div>

            {/* Live Preview */}
            <div className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white p-2 border-2 border-blue-500 shadow-md flex items-center justify-center">
                {logoFileUrl ? (
                  <img src={logoFileUrl} alt="Logo Preview" className="w-full h-full object-contain" />
                ) : (
                  <Building2 className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <span className="text-[11px] font-semibold text-slate-500">Pratinjau Logo Sekolah</span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                dbService.savePengaturan({ logoSekolahUrl: logoFileUrl.trim() });
                setIsUploadLogoModalOpen(false);
                showToast('Logo Sekolah Diperbarui!', 'success', 'Logo sekolah berhasil disimpan dan disinkronkan ke seluruh aplikasi.');
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  1. Unggah Berkas Gambar (PNG/JPG)
                </label>
                <label className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-50 dark:bg-blue-950/50 border border-dashed border-blue-300 dark:border-blue-800 rounded-xl text-xs font-bold text-blue-700 dark:text-blue-300 cursor-pointer hover:bg-blue-100 transition-all">
                  <Upload className="w-4 h-4" /> Pilih File Gambar Logo Sekolah
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(evt) => {
                      const file = evt.target.files?.[0];
                      if (file) {
                        if (file.size > 2 * 1024 * 1024) {
                          Swal.fire('File Terlalu Besar', 'Maksimal ukuran file logo adalah 2MB.', 'warning');
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          setLogoFileUrl(e.target?.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  2. Atau Tempelkan Tautan URL Logo
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={logoFileUrl}
                  onChange={(e) => setLogoFileUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                {logoFileUrl && (
                  <button
                    type="button"
                    onClick={() => setLogoFileUrl('')}
                    className="text-xs text-rose-600 hover:underline font-semibold"
                  >
                    Reset Logo
                  </button>
                )}

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setIsUploadLogoModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Simpan Logo Sekolah
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
