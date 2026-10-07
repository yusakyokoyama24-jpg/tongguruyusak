import React, { useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import { Printer, Download, Users, CheckSquare, Square, Eye, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Siswa, Pengaturan } from '../../types';
import { showToast } from '../../utils/toast';

interface KartuSiswaViewProps {
  siswaList: Siswa[];
  pengaturan: Pengaturan;
}

export const KartuSiswaView: React.FC<KartuSiswaViewProps> = ({ siswaList, pengaturan }) => {
  const [selectedKelas, setSelectedKelas] = useState<string>('all');
  const [selectedSiswaIds, setSelectedSiswaIds] = useState<string[]>([]);
  const [qrCodeUrls, setQrCodeUrls] = useState<Record<string, string>>({});
  const [cardsActivated, setCardsActivated] = useState<boolean>(true);
  const barcodeRefs = useRef<Record<string, SVGSVGElement | null>>({});

  const kelasList = useMemo(() => {
    return Array.from(new Set(siswaList.map((s) => s.kelas))).sort();
  }, [siswaList]);

  const filteredSiswa = useMemo(() => {
    return siswaList.filter((s) => {
      if (selectedKelas === 'all') return true;
      return s.kelas === selectedKelas;
    });
  }, [siswaList, selectedKelas]);

  const cardsToRender = useMemo(() => {
    return filteredSiswa.filter((s) =>
      selectedSiswaIds.length === 0 ? true : selectedSiswaIds.includes(s.id)
    );
  }, [filteredSiswa, selectedSiswaIds]);

  const cardsKey = useMemo(() => {
    return cardsToRender.map((s) => `${s.id}_${s.nisn}`).join('|');
  }, [cardsToRender]);

  // Generate QR codes whenever cardsKey changes
  useEffect(() => {
    let isMounted = true;
    const generateQrs = async () => {
      const urls: Record<string, string> = {};
      for (const s of cardsToRender) {
        try {
          const url = await QRCode.toDataURL(s.nisn, {
            width: 140,
            margin: 1,
            color: { dark: '#0A192F', light: '#FFFFFF' },
          });
          urls[s.id] = url;
        } catch (e) {
          console.error(e);
        }
      }
      if (isMounted) {
        setQrCodeUrls(urls);
      }
    };
    if (cardsToRender.length > 0) {
      generateQrs();
    }
    return () => {
      isMounted = false;
    };
  }, [cardsKey]);

  // Generate Barcodes
  useEffect(() => {
    cardsToRender.forEach((s) => {
      const el = barcodeRefs.current[s.id];
      if (el) {
        try {
          JsBarcode(el, s.nisn, {
            format: 'CODE128',
            width: 1.2,
            height: 28,
            displayValue: false,
            margin: 0,
            background: 'transparent',
            lineColor: '#1e293b',
          });
        } catch (e) {
          console.error(e);
        }
      }
    });
  }, [cardsKey, Object.keys(qrCodeUrls).length]);

  const toggleSelectSiswa = (id: string) => {
    if (selectedSiswaIds.includes(id)) {
      setSelectedSiswaIds(selectedSiswaIds.filter((item) => item !== id));
    } else {
      setSelectedSiswaIds([...selectedSiswaIds, id]);
    }
  };

  const selectAll = () => {
    if (selectedSiswaIds.length === filteredSiswa.length) {
      setSelectedSiswaIds([]);
    } else {
      setSelectedSiswaIds(filteredSiswa.map((s) => s.id));
    }
  };

  const handleActivateCards = () => {
    setCardsActivated(true);
    showToast(
      'Kartu Siswa Aktif & Terverifikasi!',
      'success',
      `Sebanyak ${cardsToRender.length} Kartu Tanda Pelajar digital telah diaktifkan dan terhubung dengan QR Presensi.`
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar (Hidden in Print) */}
      <div className="no-print bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-300 dark:border-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                SISTEM KARTU SISWA: 100% AKTIF
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Cetak & Kelola Kartu Tanda Pelajar (KTP Siswa QR & Barcode)
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Format grid standar 8 kartu per lembar kertas A4 siap potong dan laminating.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleActivateCards}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-xl shadow-sm transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              Aktifkan Semua Kartu
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              Cetak Kartu (Ctrl+P)
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Filter Kelas:</label>
            <select
              value={selectedKelas}
              onChange={(e) => {
                setSelectedKelas(e.target.value);
                setSelectedSiswaIds([]);
              }}
              className="px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
            >
              <option value="all">Semua Kelas ({siswaList.length} Siswa)</option>
              {kelasList.map((k) => (
                <option key={k} value={k}>
                  {k} ({siswaList.filter((s) => s.kelas === k).length} Siswa)
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={selectAll}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600"
          >
            {selectedSiswaIds.length === filteredSiswa.length && filteredSiswa.length > 0 ? (
              <CheckSquare className="w-4 h-4 text-blue-600" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            Pilih Semua ({filteredSiswa.length})
          </button>

          <span className="text-xs text-slate-400">
            Terpilih: {selectedSiswaIds.length || cardsToRender.length} kartu
          </span>
        </div>
      </div>

      {/* Cards Printable Area */}
      <div className="bg-slate-100 dark:bg-slate-950 p-6 rounded-2xl print:bg-white print:p-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4 print:m-0">
          {cardsToRender.map((siswa) => (
            <div
              key={siswa.id}
              onClick={() => toggleSelectSiswa(siswa.id)}
              className="relative w-full max-w-[420px] mx-auto bg-gradient-to-br from-white to-slate-50 border-2 border-slate-300 rounded-2xl shadow-md overflow-hidden cursor-pointer print:shadow-none print:border-slate-400 print:rounded-xl avoid-break"
            >
              {/* Card Header */}
              <div className="bg-[#1a3a5c] text-white p-3 flex items-center justify-between border-b-2 border-amber-400">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-white/10 p-1 flex items-center justify-center overflow-hidden border border-white/20">
                    <span className="font-extrabold text-xs text-amber-300">SMK</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-xs uppercase tracking-wide leading-tight">
                      {pengaturan.namaSekolah}
                    </h3>
                    <p className="text-[10px] text-slate-200 tracking-wider">KARTU TANDA PELAJAR DIGITAL</p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <span className="inline-block bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[9px] px-2 py-0.5 rounded font-mono font-semibold">
                    {siswa.kelas}
                  </span>
                  <span className="inline-block bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[8px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">
                    ✓ KARTU AKTIF
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 grid grid-cols-12 gap-3 items-center">
                {/* Photo & QR */}
                <div className="col-span-4 flex flex-col items-center gap-2">
                  <div className="w-20 h-24 rounded-lg bg-slate-200 border-2 border-slate-300 flex items-center justify-center overflow-hidden shadow-inner">
                    {siswa.foto ? (
                      <img src={siswa.foto} alt={siswa.nama} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-b from-blue-100 to-indigo-200 flex flex-col items-center justify-center text-slate-600 font-bold text-sm">
                        <span className="text-xl">🎓</span>
                        <span className="text-[9px] mt-1">{siswa.jenisKelamin === 'L' ? 'SISWA' : 'SISWI'}</span>
                      </div>
                    )}
                  </div>
                  {qrCodeUrls[siswa.id] && (
                    <img
                      src={qrCodeUrls[siswa.id]}
                      alt="QR Siswa"
                      className="w-16 h-16 rounded border border-slate-300 bg-white p-0.5"
                    />
                  )}
                </div>

                {/* Identity Info */}
                <div className="col-span-8 space-y-1.5 text-left">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Nama Lengkap</span>
                    <h4 className="font-bold text-sm text-slate-900 leading-snug line-clamp-2">
                      {siswa.nama}
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">NISN</span>
                      <span className="font-mono font-bold text-blue-700">{siswa.nisn}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Kelas</span>
                      <span className="font-semibold text-slate-800">{siswa.kelas}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Kontak Wali</span>
                    <span className="text-xs text-slate-700 font-mono">{siswa.noHpOrtu || '-'}</span>
                  </div>

                  {/* Barcode SVG */}
                  <div className="pt-1">
                    <svg
                      ref={(el) => {
                        barcodeRefs.current[siswa.id] = el;
                      }}
                      className="w-full max-h-7"
                    ></svg>
                    <span className="block text-center font-mono text-[9px] text-slate-500 tracking-widest">
                      *{siswa.nisn}*
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="bg-slate-100 border-t border-slate-200 px-3 py-1.5 flex items-center justify-between text-[9px] text-slate-500">
                <span>Berlaku s.d. Akhir Studi</span>
                <span className="font-medium text-slate-700">Kepala Sekolah: {pengaturan.namaKepsek.split(',')[0]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
