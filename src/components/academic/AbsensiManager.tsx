import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import Swal from 'sweetalert2';
import { Camera, CheckCircle2, UserCheck, Calendar, Filter, Volume2, AlertCircle, Save } from 'lucide-react';
import { Siswa, Absensi } from '../../types';
import { dbService } from '../../services/db';
import { showToast } from '../../utils/toast';

interface AbsensiManagerProps {
  siswaList: Siswa[];
  absensiList: Absensi[];
}

export const AbsensiManager: React.FC<AbsensiManagerProps> = ({ siswaList, absensiList }) => {
  const [mode, setMode] = useState<'manual' | 'scanner'>('manual');
  const [selectedTanggal, setSelectedTanggal] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedKelas, setSelectedKelas] = useState<string>('X RPL 1');

  // Manual records state: map siswaId -> { status, catatan }
  const [attendanceDraft, setAttendanceDraft] = useState<Record<string, { status: 'H' | 'S' | 'I' | 'A'; catatan: string }>>({});

  // Scanner state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScannedResult, setLastScannedResult] = useState<string | null>(null);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const scanIntervalRef = useRef<number | null>(null);
  const lastScannedTimeRef = useRef<number>(0);

  const kelasList = Array.from(new Set(siswaList.map((s) => s.kelas))).sort();
  const studentsInClass = siswaList.filter((s) => s.kelas === selectedKelas);

  // Initialize draft when date or class changes
  useEffect(() => {
    const existingMap: Record<string, { status: 'H' | 'S' | 'I' | 'A'; catatan: string }> = {};
    studentsInClass.forEach((s) => {
      const recorded = absensiList.find((a) => a.siswaId === s.id && a.tanggal === selectedTanggal);
      existingMap[s.id] = {
        status: recorded ? recorded.status : 'H',
        catatan: recorded?.catatan || '',
      };
    });
    setAttendanceDraft(existingMap);
  }, [selectedTanggal, selectedKelas, siswaList, absensiList]);

  // Audio Beep generator using Web Audio API
  const playSuccessBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // 880 Hz
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);
    } catch (e) {
      console.warn('Audio not allowed yet:', e);
    }
  };

  // Start Scanner
  const startCamera = async () => {
    setIsScanning(true);
    setScanMessage('Menghubungkan ke kamera...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setScanMessage('Arahkan kamera ke QR Code Kartu Siswa');
        processQrStream();
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setIsScanning(false);
      setScanMessage(null);
      Swal.fire({
        title: 'Izin Kamera Diperlukan',
        text: 'Aplikasi memerlukan izin akses kamera untuk memindai kartu presensi siswa.',
        icon: 'warning',
      });
    }
  };

  // Stop Scanner
  const stopCamera = () => {
    setIsScanning(false);
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Frame processing loop
  const processQrStream = () => {
    const scan = () => {
      if (!videoRef.current || !canvasRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
        if (isScanning) requestAnimationFrame(scan);
        return;
      }

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code && code.data) {
        const now = Date.now();
        // Debounce 2.5 seconds
        if (now - lastScannedTimeRef.current > 2500) {
          lastScannedTimeRef.current = now;
          handleQrScanned(code.data.trim());
        }
      }

      if (isScanning) {
        requestAnimationFrame(scan);
      }
    };

    requestAnimationFrame(scan);
  };

  const handleQrScanned = (scannedNisn: string) => {
    const student = siswaList.find((s) => s.nisn === scannedNisn || s.id === scannedNisn);
    if (!student) {
      setLastScannedResult(`QR tidak terdaftar: ${scannedNisn}`);
      Swal.fire({
        title: 'Siswa Tidak Ditemukan',
        text: `Data dengan kode "${scannedNisn}" belum terdaftar di sistem.`,
        icon: 'error',
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    playSuccessBeep();

    const todayStr = new Date().toISOString().split('T')[0];
    const absensiRecord: Absensi = {
      id: `ab_qr_${Date.now()}`,
      tanggal: todayStr,
      siswaId: student.id,
      namaSiswa: student.nama,
      kelas: student.kelas,
      status: 'H',
      catatan: `Hadir via QR Scanner (${new Date().toLocaleTimeString('id-ID')})`,
      timestamp: new Date().toISOString(),
      userId: 'master_guru_default',
    };

    dbService.recordAbsensi(absensiRecord);
    setLastScannedResult(`Berhasil: ${student.nama} (${student.kelas}) - HADIR`);

    Swal.fire({
      title: '✅ Presensi Berhasil!',
      html: `<b>${student.nama}</b><br><span class="text-sm text-gray-500">${student.kelas} • NISN: ${student.nisn}</span><br><span class="text-emerald-600 font-bold">STATUS: HADIR</span>`,
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
    });
  };

  // Manual Handlers
  const handleSetStatus = (siswaId: string, status: 'H' | 'S' | 'I' | 'A') => {
    setAttendanceDraft((prev) => ({
      ...prev,
      [siswaId]: {
        ...(prev[siswaId] || { catatan: '' }),
        status,
      },
    }));
  };

  const handleSetCatatan = (siswaId: string, catatan: string) => {
    setAttendanceDraft((prev) => ({
      ...prev,
      [siswaId]: {
        ...(prev[siswaId] || { status: 'H' }),
        catatan,
      },
    }));
  };

  const handleMarkAllHadir = () => {
    const updated: Record<string, { status: 'H' | 'S' | 'I' | 'A'; catatan: string }> = {};
    studentsInClass.forEach((s) => {
      updated[s.id] = {
        status: 'H',
        catatan: attendanceDraft[s.id]?.catatan || '',
      };
    });
    setAttendanceDraft(updated);
    showToast('Semua Set Hadir', 'info', `Status seluruh siswa kelas ${selectedKelas} diatur ke Hadir.`);
  };

  const handleSaveManual = () => {
    const batch: Absensi[] = studentsInClass.map((s) => {
      const draft = attendanceDraft[s.id] || { status: 'H', catatan: '' };
      return {
        id: `ab_${s.id}_${selectedTanggal}`,
        tanggal: selectedTanggal,
        siswaId: s.id,
        namaSiswa: s.nama,
        kelas: s.kelas,
        status: draft.status,
        catatan: draft.catatan,
        timestamp: new Date().toISOString(),
        userId: 'master_guru_default',
      };
    });

    dbService.recordBatchAbsensi(batch);
    showToast(
      'Presensi Tersimpan!',
      'success',
      `Presensi kelas ${selectedKelas} (${selectedTanggal}) berhasil disimpan.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Mode Selector Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-600" />
            Presensi Digital Siswa
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Dukung mode checklist harian manual dan pemindai kamera QR otomatis real-time.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl">
          <button
            onClick={() => {
              stopCamera();
              setMode('manual');
            }}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              mode === 'manual'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            📋 Mode Manual Checklist
          </button>
          <button
            onClick={() => {
              setMode('scanner');
              startCamera();
            }}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              mode === 'scanner'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            📷 Mode Pemindai QR Kamera
          </button>
        </div>
      </div>

      {/* Mode 1: Manual Checklist */}
      {mode === 'manual' && (
        <div className="space-y-4">
          {/* Controls Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tanggal:</label>
                <input
                  type="date"
                  value={selectedTanggal}
                  onChange={(e) => setSelectedTanggal(e.target.value)}
                  className="px-3 py-1.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Rombel/Kelas:</label>
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
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleMarkAllHadir}
                className="px-3.5 py-2 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 rounded-xl hover:bg-emerald-100"
              >
                ✓ Tandai Semua Hadir (H)
              </button>

              <button
                onClick={handleSaveManual}
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
              >
                <Save className="w-4 h-4" />
                Simpan Presensi Kelas
              </button>
            </div>
          </div>

          {/* Students Checklist Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#1a3a5c] text-white">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">No</th>
                    <th className="py-3 px-4 w-32">NISN</th>
                    <th className="py-3 px-4">Nama Siswa</th>
                    <th className="py-3 px-4 text-center w-60">Status Kehadiran</th>
                    <th className="py-3 px-4">Catatan / Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {studentsInClass.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        Tidak ada siswa pada rombel {selectedKelas}.
                      </td>
                    </tr>
                  ) : (
                    studentsInClass.map((s, idx) => {
                      const currentStatus = attendanceDraft[s.id]?.status || 'H';
                      const currentCatatan = attendanceDraft[s.id]?.catatan || '';

                      return (
                        <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="py-3 px-4 text-center font-mono text-xs">{idx + 1}</td>
                          <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                            {s.nisn}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                            {s.nama}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800">
                              {(['H', 'S', 'I', 'A'] as const).map((code) => {
                                const labels: Record<string, string> = {
                                  H: 'Hadir',
                                  S: 'Sakit',
                                  I: 'Izin',
                                  A: 'Alpa',
                                };
                                const colors: Record<string, string> = {
                                  H: 'bg-emerald-600 text-white',
                                  S: 'bg-amber-500 text-white',
                                  I: 'bg-blue-600 text-white',
                                  A: 'bg-rose-600 text-white',
                                };

                                const isSelected = currentStatus === code;
                                return (
                                  <button
                                    key={code}
                                    type="button"
                                    onClick={() => handleSetStatus(s.id, code)}
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                                      isSelected
                                        ? colors[code]
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                                    title={labels[code]}
                                  >
                                    {code}
                                  </button>
                                );
                              })}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              value={currentCatatan}
                              onChange={(e) => handleSetCatatan(s.id, e.target.value)}
                              placeholder="Keterangan tambahan..."
                              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Real-time QR Camera Scanner */}
      {mode === 'scanner' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-7 bg-black rounded-2xl overflow-hidden shadow-xl border-4 border-slate-800 relative flex flex-col items-center justify-center min-h-[360px]">
            <video ref={videoRef} className="w-full h-auto object-cover max-h-[480px]" />
            <canvas ref={canvasRef} className="hidden" />

            {/* Scanning Overlay Box */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="w-64 h-64 border-2 border-emerald-400 rounded-2xl relative shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-lg"></div>
              </div>
              <p className="mt-4 px-4 py-1.5 bg-black/70 backdrop-blur-md rounded-full text-xs font-semibold text-emerald-400 border border-emerald-500/30">
                {scanMessage || 'Arahkan QR Siswa ke Kotak Pindai'}
              </p>
            </div>
          </div>

          <div className="md:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-600" />
                Status Pemindai Presensi Kamera
              </h3>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <p>• Kamera memindai barcode QR pada Kartu Siswa secara otomatis.</p>
                <p>• Suara notifikasi (beep) otomatis bersuara saat kartu berhasil dikenali.</p>
                <p>• Catatan kehadiran langsung disimpan ke database presensi.</p>
              </div>

              {lastScannedResult && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-xl">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 block uppercase">
                    Hasil Pindai Terakhir:
                  </span>
                  <p className="font-semibold text-sm text-emerald-950 dark:text-emerald-100 mt-1">
                    {lastScannedResult}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={isScanning ? stopCamera : startCamera}
                  className={`w-full py-2.5 text-sm font-semibold rounded-xl text-white transition-all ${
                    isScanning ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {isScanning ? 'Hentikan Kamera' : 'Aktifkan Kamera'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
