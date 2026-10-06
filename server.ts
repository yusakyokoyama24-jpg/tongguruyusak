import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize Google Gen AI SDK
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY || '';
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Retry helper with exponential backoff & model fallbacks
async function generateAiContentWithFallback(prompt: string, systemInstruction?: string): Promise<string> {
  const models = ['gemini-2.5-flash', 'gemini-3.8-flash', 'gemini-2.5-pro'];
  const maxRetries = 2;
  const ai = getAiClient();

  let lastError: any = null;

  for (const model of models) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction: systemInstruction || 'Anda adalah Konsultan Ahli Kurikulum Merdeka Pendidikan Nasional Indonesia, Perancang Modul Ajar Deep Learning, dan Pakar Pedagogik Senior.',
            temperature: 0.7,
          },
        });

        if (response && response.text) {
          return response.text;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[AI Engine] Attempt ${attempt + 1} with model ${model} failed:`, err?.message || err);
        if (attempt < maxRetries) {
          const waitTime = Math.pow(2, attempt) * 1000;
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
      }
    }
  }

  throw new Error(`Gagal menghasilkan konten AI setelah mencoba beberapa model: ${lastError?.message || 'Unknown error'}`);
}

// Master Teacher Credentials
const DEFAULT_USER = process.env.DEFAULT_TEACHER_USER || 'www.yusakyokoyama.id';
const DEFAULT_PASS = process.env.DEFAULT_TEACHER_PASS || '123456';

// Health / Status endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'Tongguru Aplikasi (EdAdmin Pro)',
    timestamp: new Date().toISOString(),
    aiReady: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Authentication endpoint for Master Teacher
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan Password wajib diisi!' });
  }

  const trimmedUser = username.trim();
  if (
    (trimmedUser === DEFAULT_USER || trimmedUser === 'www.yusakyokoyama.id' || trimmedUser === 'www.yefriharyanto.id') &&
    password === DEFAULT_PASS
  ) {
    return res.json({
      success: true,
      user: {
        uid: 'master_guru_default',
        nama: 'Yusak Yokoyama, S.Pd., M.Pd.',
        nip: '19850712 201001 1 018',
        role: 'Master Administrator Guru',
        username: trimmedUser,
        sekolah: 'SMK Negeri 1 Indonesia Merdeka',
      },
      token: 'session_master_' + Date.now(),
    });
  }

  // Also support custom user credentials passed from client if saved locally
  return res.status(401).json({ error: 'Kredensial tidak valid! Silakan periksa kembali username dan password Anda.' });
});

// Clean HTML response helper
function cleanHtmlOutput(raw: string): string {
  let cleaned = raw.trim();
  // Remove markdown code fences if wrapped in ```html ... ```
  if (cleaned.startsWith('```html')) {
    cleaned = cleaned.replace(/^```html\s*/i, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/i, '');
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.replace(/\s*```$/i, '');
  }
  return cleaned.trim();
}

// ==========================================
// AI SUITE ENDPOINTS
// ==========================================

// 1. Modul Ajar AI (Deep Learning Approach)
app.post('/api/ai/generate-modul', async (req: Request, res: Response) => {
  try {
    const {
      mataPelajaran,
      fase,
      kelas,
      topik,
      alokasiWaktu,
      profilLulusan,
      pendekatan = 'Deep Learning (Memahami, Mengaplikasi, Merefleksi)',
      saranaPrasarana,
      targetPeserta,
    } = req.body;

    const prompt = `
Susunlah MODUL AJAR KURIKULUM MERDEKA LENGKAP dengan PENDEKATAN DEEP LEARNING (3 Fase: Memahami / Concept, Mengaplikasi / Practice, dan Merefleksi / Reflection).
WAJIB MENGHASILKAN DOKUMEN HTML MURNI BERKUALITAS TINGGI TANPA SINGKATAN, SIAP CETAK (A4).

Parameter Pembelajaran:
- Mata Pelajaran: ${mataPelajaran || 'Informatika / Kejuruan'}
- Fase: ${fase || 'Fase E / F'}
- Kelas / Semester: ${kelas || 'X / Ganjil'}
- Topik / Materi Inti: ${topik || 'Pengembangan Perangkat Lunak dan Game'}
- Alokasi Waktu: ${alokasiWaktu || '2 JP x 45 Menit (Pertemuan 1)'}
- Dimensi Profil Lulusan: ${profilLulusan || 'Bernalar Kritis, Kreatif, Bergotong Royong, Mandiri'}
- Sarana & Prasarana: ${saranaPrasarana || 'Laptop, LCD Proyektor, Jaringan Internet'}
- Target Peserta Didik: ${targetPeserta || 'Reguler / Tipikal'}

KETENTUAN STRUKTUR DOKUMEN HTML:
1. Kop Dokumen Resmi: Judul dokumen tebal di tengah, tanpa pembatas luar berlebihan.
2. Format CSS & Desain:
   - Semua tabel ber-header warna latar '#1a3a5c' teks putih (#ffffff) dengan padding 8px dan border 1px solid #1a3a5c.
   - Body font Plus Jakarta Sans atau system-ui, ukuran 11pt, margin seimbang.
3. BAGIAN WAJIB DOKUMEN:
   - A. INFORMASI UMUM (Tabel Identitas: Nama Guru, Satuan Pendidikan, Fase/Kelas, Alokasi Waktu, Model Pembelajaran)
   - B. TUJUAN PEMBELAJARAN (HOTS kontekstual, Indikator Ketercapaian)
   - C. ASESMEN DIAGNOSTIK & PEMETAAN KESIAPAN BELAJAR (Kategori: Belum Berkembang [BB], Mulai Berkembang [MB], Berkembang Sesuai Harapan [BSH], Sangat Berkembang [SDB])
   - D. DESAIN PEDAGOGIS & KEMITRAAN DIGITAL (Pemanfaatan platform & kolaborasi)
   - E. SKENARIO PENGALAMAN BELAJAR (WAJIB TANPA TABEL! Uraikan per pertemuan menggunakan daftar poin terstruktur <ul><li> lengkap dengan dialog apersepsi dan pertanyaan pemantik guru).
     Tiga Fase Deep Learning dijabarkan jelas:
     * Fase 1: Memahami (Meaningful Understanding & Concept Building)
     * Fase 2: Mengaplikasi (Authentic Problem Solving & Practice)
     * Fase 3: Merefleksi (Metacognitive Reflection & Transfer of Learning)
   - F. REFLEKSI GURU & MURID (Instrumen pertanyaan refleksi diri murid dan evaluasi guru)
   - G. ASESMEN & RUBRIK EVALUASI (Tabel rubrik penilaian berkriteria jelas dengan header #1a3a5c)
   - H. LEMBAR KERJA PESERTA DIDIK (LKPD) SIAP PAKAI (Lengkap dengan instruksi dan studi kasus)
   - I. PROGRAM PENGAYAAN & REMEDIAL
   - J. KUNCI JAWABAN & KRITERIA PENSKORAN
   - K. FORMAT TANDA TANGAN (Tabel transparan tanpa border: Kiri: Mengetahui Kepala Sekolah, Kanan: Guru Mata Pelajaran).

Keluarkan HANYA KODE HTML di dalam tag <div class="modul-ajar-content">...</div> tanpa pembungkus markdown.
`;

    const raw = await generateAiContentWithFallback(prompt);
    res.json({ html: cleanHtmlOutput(raw) });
  } catch (error: any) {
    console.error('Error generating Modul Ajar:', error);
    res.status(500).json({ error: error.message || 'Gagal menghasilkan Modul Ajar' });
  }
});

// 2. Generator Perangkat Ajar Kurikulum Merdeka (CP, TP, ATP, Prota, Prosem, KKTP)
app.post('/api/ai/generate-perangkat-ajar', async (req: Request, res: Response) => {
  try {
    const { jenisDokumen, mataPelajaran, fase, kelas, tahunAjaran = '2026/2027', elemenCapaian } = req.body;

    const prompt = `
Buatlah Dokumen Resmi Perangkat Ajar Kurikulum Merdeka:
Jenis Dokumen: ${jenisDokumen || 'Alur Tujuan Pembelajaran (ATP)'}
Mata Pelajaran: ${mataPelajaran || 'Dasar-dasar Keahlian'}
Fase: ${fase || 'Fase E'}
Kelas: ${kelas || 'Kelas X'}
Tahun Ajaran: ${tahunAjaran}
Fokus Elemen/Capaian: ${elemenCapaian || 'Sesuai Keputusan BSKAP Kemendikbudristek'}

KETENTUAN DOKUMEN CETAK RESMI:
1. Format tabel: Header tabel WAJIB warna latar '#1a3a5c' teks putih (#ffffff), border 1px solid #334155, teks sel rapi.
2. Komponen dokumen sesuai standar Kemendikbudristek:
   - Jika Analisis CP: Pemetaan Elemen, Capaian Pembelajaran, Kompetensi, Materi Esensial, dan Tujuan Pembelajaran.
   - Jika TP & ATP: Kode TP, Rumusan TP, Alokasi Jam Pelajaran (JP), Profil Pelajar Pancasila, Glosarium/Kata Kunci.
   - Jika Prota/Prosem: Distribusi alokasi waktu per bab/elemen per bulan dan semester ganjil/genap secara sistematis.
   - Jika KKTP: Interval nilai, kriteria deskripsi ketercapaian (0-60%: Belum Tuntas, 61-75%: Cukup, 76-88%: Baik, 89-100%: Sangat Baik), serta tindak lanjut.
3. Di akhir dokumen, sertakan format TANDA TANGAN SEJAJAR Kepala Sekolah (kiri) dan Guru Pengampu (kanan) dalam tabel tanpa border (border: none).

Keluarkan HANYA HTML murni di dalam tag <div class="perangkat-ajar-doc">...</div>.
`;

    const raw = await generateAiContentWithFallback(prompt);
    res.json({ html: cleanHtmlOutput(raw) });
  } catch (error: any) {
    console.error('Error generating Perangkat Ajar:', error);
    res.status(500).json({ error: error.message || 'Gagal menghasilkan Perangkat Ajar' });
  }
});

// 3. Perangkat Ajar KBC (Kurikulum Berbasis Cinta)
app.post('/api/ai/generate-perangkat-ajar-kbc', async (req: Request, res: Response) => {
  try {
    const { mataPelajaran, fase, kelas, nilaiKasih, topik } = req.body;

    const prompt = `
Susunlah PERANGKAT AJAR KURIKULUM BERBASIS CINTA (KBC) yang holistik dan menginspirasi.
Kurikulum Berbasis Cinta memadukan kecakapan akademik/keterampilan abad ke-21 dengan nilai-nilai welas asih, empati, cinta belajar, kepedulian lingkungan, dan kesadaran spiritual/budi pekerti luhur.

Parameter:
- Mata Pelajaran: ${mataPelajaran || 'Pendidikan Pancasila / Karakter'}
- Fase/Kelas: ${fase || 'Fase E'} - ${kelas || 'X'}
- Nilai Kasih & Karakter yang ditanamkan: ${nilaiKasih || 'Empati Sosial, Gotong Royong Tanpa Syarat, Kejujuran Hati, Welas Asih'}
- Topik Pembelajaran: ${topik || 'Membangun Harmoni dan Kolaborasi Empatis'}

STRUKTUR DOKUMEN HTML:
1. Kop & Judul Perangkat KBC.
2. Filosofi Cinta dalam Pembelajaran: Mengapa materi ini diajarkan melalui sudut pandang cinta & welas asih.
3. Dimensi KBC: Cinta pada Diri (Self-Love & Efikasi), Cinta pada Sesama (Empati & Toleransi), Cinta pada Lingkungan/Alam, Cinta pada Kebenaran/Ilmu.
4. Skenario Pembelajaran Berkesadaran Penuh (Mindful Learning & Heart-Centered Learning).
5. Asesmen Berbasis Karakter & Jurnal Refleksi Hati Nurani Siswa.
6. Header tabel warna #1a3a5c teks putih.
7. Format tanda tangan sejajar Kepala Sekolah & Guru Mata Pelajaran.

Keluarkan HANYA HTML murni di dalam tag <div class="kbc-doc">...</div>.
`;

    const raw = await generateAiContentWithFallback(prompt);
    res.json({ html: cleanHtmlOutput(raw) });
  } catch (error: any) {
    console.error('Error generating KBC:', error);
    res.status(500).json({ error: error.message || 'Gagal menghasilkan Perangkat KBC' });
  }
});

// 4. Generator Modul Kokurikuler AI
app.post('/api/ai/generate-modul-kokurikuler', async (req: Request, res: Response) => {
  try {
    const { tema, topik, fase, alokasiWaktu, mataPelajaranTerlibat } = req.body;

    const prompt = `
Buatlah MODUL KOKURIKULER KOLABORATIF (Pembelajaran Interdisipliner Lintas Mata Pelajaran / Proyek Penguatan Karakter):
- Tema Proyek: ${tema || 'Kearifan Lokal / Rekayasa dan Teknologi / Suara Demokrasi'}
- Topik Proyek: ${topik || 'Pemanfaatan Teknologi Tepat Guna untuk Komunitas'}
- Fase/Kelas: ${fase || 'Fase E (Kelas X)'}
- Alokasi Waktu: ${alokasiWaktu || '36 JP'}
- Kolaborasi Mata Pelajaran: ${mataPelajaranTerlibat || 'Informatika, Bahasa Indonesia, Seni Budaya, PJOK'}

Sistematika Dokumen:
1. Identitas Modul Kokurikuler
2. Pemetaan Dimensi, Elemen, dan Subelemen Profil Kelulusan
3. Alur Aktivitas 4 Tahap:
   - Tahap 1: Pengenalan (Eksplorasi Konsep & Isu)
   - Tahap 2: Kontekstualisasi (Riset Lapangan & Analisis Masalah)
   - Tahap 3: Aksi Nyata (Perancangan Karya, Prototipe, atau Pameran)
   - Tahap 4: Refleksi & Tindak Lanjut
4. Lembar Kerja Kelompok (LKPD Proyek)
5. Rubrik Asesmen Sumatif Portofolio & Penilaian Antar-Teman (Tabel header #1a3a5c)
6. Tanda tangan Kepala Sekolah & Koordinator Proyek (Tabel transparan sejajar).

Keluarkan HANYA HTML murni di dalam tag <div class="kokurikuler-doc">...</div>.
`;

    const raw = await generateAiContentWithFallback(prompt);
    res.json({ html: cleanHtmlOutput(raw) });
  } catch (error: any) {
    console.error('Error generating Modul Kokurikuler:', error);
    res.status(500).json({ error: error.message || 'Gagal menghasilkan Modul Kokurikuler' });
  }
});

// 5. Generator Soal Ujian, LJS, dan Kunci Jawaban
app.post('/api/ai/generate-soal-ujian', async (req: Request, res: Response) => {
  try {
    const {
      mataPelajaran,
      kelas,
      jenisUjian = 'Sumatif Akhir Semester (SAS)',
      topikMateri,
      jumlahPg = 10,
      jumlahUraian = 5,
    } = req.body;

    const prompt = `
Rancanglah SATU PAKET DOKUMEN UJIAN RESMI SEKOLAH LENGKAP:
- Mata Pelajaran: ${mataPelajaran || 'Informatika'}
- Kelas / Semester: ${kelas || 'X / Semester Ganjil'}
- Jenis Ujian: ${jenisUjian}
- Ruang Lingkup Materi: ${topikMateri || 'Algoritma, Pemrograman, dan Etika Digital'}
- Jumlah Soal Pilihan Ganda: ${jumlahPg} Soal (HOTS kontekstual dengan stimulus kasus/bacaan/tabel, pilihan A, B, C, D, E)
- Jumlah Soal Uraian: ${jumlahUraian} Soal Analitis dan Pemecahan Masalah

STRUKTUR DOKUMEN HTML (WAJIB MEMUAT 3 BAGIAN LENGKAP):
1. BAGIAN I: NASKAH SOAL UJIAN SISWA
   - Kop Ujian Sekolah Lengkap (Petunjuk Umum & Petunjuk Khusus).
   - Soal Pilihan Ganda nomor 1 s.d. ${jumlahPg} dengan stimulus berkualitas dan pilihan jawaban A, B, C, D, E.
   - Soal Uraian nomor 1 s.d. ${jumlahUraian}.
2. BAGIAN II: LEMBAR JAWABAN SISWA (LJS) SIAP CETAK (Diberi pembatas halaman / page-break)
   - Format Identitas Siswa (Nama, NISN, Kelas, Ruang, No. Peserta, Tanda Tangan Siswa).
   - Kisi-kisi Kotak Pilihan Ganda nomor 1 s.d. ${jumlahPg} dengan bulatan/kotak pilihan [A] [B] [C] [D] [E] yang rapi dan sejajar.
   - Kolom Jawaban Soal Uraian dengan garis-garis berjarak lega untuk menulis jawaban.
3. BAGIAN III: KUNCI JAWABAN, RUBRIK PENSKORAN & PEDOMAN PENILAIAN
   - Tabel Kunci Jawaban PG (Nomor, Kunci, Pembahasan Singkat).
   - Tabel Rubrik Penskoran Soal Uraian (Kriteria jawaban dan skor maksimal per nomor).
   - Rumus Perhitungan Nilai Akhir: Nilai = ((Skor PG + Skor Uraian) / Skor Maksimal) x 100.
   - Tabel tanda tangan sejajar Kepala Sekolah & Guru Mata Pelajaran.

Semua header tabel wajib warna '#1a3a5c' teks putih.
Keluarkan HANYA HTML murni di dalam tag <div class="soal-ujian-doc">...</div>.
`;

    const raw = await generateAiContentWithFallback(prompt);
    res.json({ html: cleanHtmlOutput(raw) });
  } catch (error: any) {
    console.error('Error generating Soal Ujian:', error);
    res.status(500).json({ error: error.message || 'Gagal menghasilkan Paket Ujian' });
  }
});

// 6. Generator Kartu Soal & Kisi-Kisi Ujian
app.post('/api/ai/generate-kartu-soal', async (req: Request, res: Response) => {
  try {
    const { mataPelajaran, kelas, jenisUjian = 'Asesmen Sumatif', materi } = req.body;

    const prompt = `
Buatlah KISI-KISI DAN KARTU SOAL RESMI STANDAR BNSP / KEMENDIKBUDRISTEK:
- Mata Pelajaran: ${mataPelajaran || 'Teknologi Informasi'}
- Kelas: ${kelas || 'Kelas X'}
- Ujian: ${jenisUjian}
- Materi Pokok: ${materi || 'Analisis Data dan Logika Komputasi'}

DOKUMEN HTML MEMUAT:
1. MATRIKS KISI-KISI PENULISAN SOAL:
   Tabel dengan kolom: No, Capaian Pembelajaran, Materi, Indikator Soal, Level Kognitif (L1/L2/L3), Bentuk Soal, No Soal. Header warna '#1a3a5c' teks putih.
2. KARTU SOAL RESMI (3-5 Kartu Soal):
   Format bingkai resmi per kartu soal:
   - Nama Satuan Pendidikan, Mata Pelajaran, Kelas, Tahun Ajaran
   - Kompetensi Dasar / Capaian Pembelajaran
   - Indikator Soal
   - Buku Sumber / Referensi
   - Level Kognitif
   - Rumusan Butir Soal (lengkap dengan teks stimulus dan opsi jawaban)
   - Kunci Jawaban & Bobot Skor
3. Format tanda tangan sejajar Kepala Sekolah dan Guru Penyusun Soal.

Keluarkan HANYA HTML murni di dalam tag <div class="kartu-soal-doc">...</div>.
`;

    const raw = await generateAiContentWithFallback(prompt);
    res.json({ html: cleanHtmlOutput(raw) });
  } catch (error: any) {
    console.error('Error generating Kartu Soal:', error);
    res.status(500).json({ error: error.message || 'Gagal menghasilkan Kartu Soal' });
  }
});

// 7. Generator LKPD AI (Lembar Kerja Peserta Didik)
app.post('/api/ai/generate-lkpd', async (req: Request, res: Response) => {
  try {
    const { mataPelajaran, fase, kelas, topik, model = 'Problem Based Learning' } = req.body;

    const prompt = `
Buatlah LEMBAR KERJA PESERTA DIDIK (LKPD) INTERAKTIF SIAP PAKAI:
- Mata Pelajaran: ${mataPelajaran || 'Informatika'}
- Fase / Kelas: ${fase || 'Fase E'} / ${kelas || 'Kelas X'}
- Topik / Materi: ${topik || 'Perancangan Logika Algoritma'}
- Model Pembelajaran: ${model}

STRUKTUR LKPD HTML:
1. Header & Identitas Kelompok / Siswa (Nama Siswa/Anggota, Kelas, Tanggal, Nilai/Paraf Guru).
2. Tujuan Aktivitas & Alur Kerja.
3. Stimulus / Teks Bacaan / Studi Kasus Kontekstual di Dunia Nyata.
4. Alat dan Bahan / Sumber Belajar.
5. Langkah-langkah Eksplorasi & Eksperimen.
6. Lembar Kerja / Kolom Isian Siswa (Diberi kotak bergaris/border rapi untuk menulis jawaban, diagram, atau kesimpulan).
7. Pertanyaan Pengarah Analisis Kritis.
8. Lembar Penilaian Mandiri & Refleksi Belajar.
9. Header tabel warna '#1a3a5c' teks putih.

Keluarkan HANYA HTML murni di dalam tag <div class="lkpd-doc">...</div>.
`;

    const raw = await generateAiContentWithFallback(prompt);
    res.json({ html: cleanHtmlOutput(raw) });
  } catch (error: any) {
    console.error('Error generating LKPD:', error);
    res.status(500).json({ error: error.message || 'Gagal menghasilkan LKPD' });
  }
});

// 8. Generator Presentasi Interaktif PPT (Semua Slide)
app.post('/api/ai/generate-ppt-all-slides', async (req: Request, res: Response) => {
  try {
    const { topik, targetAudiens = 'Siswa SMK/SMA', jumlahSlide = 7, mataPelajaran } = req.body;

    const prompt = `
Rancanglah Materi Presentasi Pembelajaran Interaktif Berkualitas Tinggi:
- Topik Pembelajaran: ${topik || 'Pengenalan Algoritma dan Pemrograman Modern'}
- Mata Pelajaran: ${mataPelajaran || 'Informatika'}
- Target Audiens: ${targetAudiens}
- Jumlah Slide: ${jumlahSlide} slide

Keluarkan data dalam format JSON murni:
{
  "presentationTitle": "Judul Utama Presentasi",
  "subject": "Mata Pelajaran",
  "slides": [
    {
      "slideNumber": 1,
      "title": "Judul Slide",
      "subtitle": "Subjudul atau Pengantar Singkat",
      "bullets": ["Poin esensial 1", "Poin esensial 2", "Poin esensial 3"],
      "keyTakeaway": "Pesan kunci untuk siswa",
      "speakerNotes": "Catatan penjelasan perkataan guru saat menayangkan slide ini"
    }
  ]
}
Pastikan konten kaya wawasan, terstruktur, dan inspiratif.
`;

    const raw = await generateAiContentWithFallback(prompt, 'Anda adalah konsultan presentasi visual edukasi. Berikan output HANYA format JSON valid.');
    let jsonStr = raw.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json\s*/i, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```\s*/i, '');
    }
    if (jsonStr.endsWith('```')) {
      jsonStr = jsonStr.replace(/\s*```$/i, '');
    }

    try {
      const parsed = JSON.parse(jsonStr);
      res.json(parsed);
    } catch {
      res.json({
        presentationTitle: topik,
        subject: mataPelajaran,
        slides: [
          {
            slideNumber: 1,
            title: `Pendahuluan: ${topik}`,
            subtitle: 'Membangun Pemahaman Esensial',
            bullets: ['Tujuan pembelajaran hari ini', 'Mengapa topik ini penting di masa depan', 'Peta alur pembelajaran interaktif'],
            keyTakeaway: 'Belajar dengan antusias dan bernalar kritis.',
            speakerNotes: 'Selamat pagi siswa-siswi hebat, mari kita mulai petualangan belajar kita!',
          },
        ],
      });
    }
  } catch (error: any) {
    console.error('Error generating PPT:', error);
    res.status(500).json({ error: error.message || 'Gagal menghasilkan materi PPT' });
  }
});

// 9. Asisten Chatbot Guru AI
app.post('/api/ai/chat-asisten', async (req: Request, res: Response) => {
  try {
    const { messages, message } = req.body;
    const userMsg = message || (Array.isArray(messages) && messages[messages.length - 1]?.text) || 'Halo Guru';

    const systemInstruction = `
Anda adalah "Tongguru AI Consultant", Asisten Ahli Pedagogik dan Kurikulum Merdeka Guru Indonesia 24/7.
Karakter Anda:
- Ramah, empatik, bijaksana, solutif, dan menguasai regulasi terbaru Kemendikbudristek (BSKAP, Capaian Pembelajaran, PBD, asesmen formatif-sumatif, penulisan narasi rapor).
- Siap membantu merumuskan ide apersepsi kreatif, ice breaking cerdas, diferensiasi pembelajaran, penanganan kasus siswa, dan format administrasi guru.
- Berikan jawaban terstruktur dengan bullet point, praktis, dan langsung dapat dieksekusi di ruang kelas.
`;

    const prompt = `Pertanyaan dari Rekan Guru:\n"${userMsg}"\n\nBerikan saran pedagogik terbaik:`;
    const responseText = await generateAiContentWithFallback(prompt, systemInstruction);

    res.json({ reply: responseText });
  } catch (error: any) {
    console.error('Error in Chat Asisten:', error);
    res.status(500).json({ error: error.message || 'Gagal merespons pesan asisten AI' });
  }
});

// Mount Vite or serve static assets in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    // In development mode, mount Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Tongguru EdAdmin Pro] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Tongguru] Failed to start server:', err);
});
