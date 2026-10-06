import * as XLSX from 'xlsx';
import pptxgen from 'pptxgenjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Siswa, Absensi, Nilai, Pengaturan, PptPresentation } from '../types';

export const exportService = {
  // 1. Export Siswa to Excel
  exportSiswaToExcel(siswaList: Siswa[], filename = 'Data_Siswa.xlsx') {
    const data = siswaList.map((s, idx) => ({
      No: idx + 1,
      NISN: s.nisn,
      'Nama Lengkap': s.nama,
      Kelas: s.kelas,
      'Jenis Kelamin': s.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan',
      'No. HP Orang Tua': s.noHpOrtu,
      Alamat: s.alamat,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data Siswa');
    XLSX.writeFile(wb, filename);
  },

  // 2. Parse Excel file to Siswa[]
  parseSiswaExcel(file: File): Promise<Partial<Siswa>[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const buffer = e.target?.result;
          const wb = XLSX.read(buffer, { type: 'binary' });
          const firstSheet = wb.Sheets[wb.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json<any>(firstSheet);

          const parsedList: Partial<Siswa>[] = json.map((row) => ({
            nisn: String(row.NISN || row.nisn || '').trim(),
            nama: String(row['Nama Lengkap'] || row.Nama || row.nama || '').trim(),
            kelas: String(row.Kelas || row.kelas || 'X RPL 1').trim(),
            jenisKelamin: String(row['Jenis Kelamin'] || row.JK || row.jk || 'L').toUpperCase().startsWith('P') ? 'P' : 'L',
            noHpOrtu: String(row['No. HP Orang Tua'] || row['No HP'] || row.nohp || '').trim(),
            alamat: String(row.Alamat || row.alamat || '').trim(),
          }));

          resolve(parsedList.filter((s) => s.nisn && s.nama));
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsBinaryString(file);
    });
  },

  // 3. Export Rekap Absensi to Excel
  exportAbsensiToExcel(absensiList: Absensi[], kelas: string, periode: string) {
    const data = absensiList.map((a, idx) => ({
      No: idx + 1,
      Tanggal: a.tanggal,
      'Nama Siswa': a.namaSiswa,
      Kelas: a.kelas,
      Status: a.status,
      Keterangan: a.catatan || '-',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Absensi_${kelas}`);
    XLSX.writeFile(wb, `Rekap_Presensi_${kelas}_${periode}.xlsx`);
  },

  // 4. Export Leger Nilai to Excel
  exportLegerNilaiToExcel(nilaiList: Nilai[], siswaList: Siswa[], kelas: string) {
    const siswaInClass = siswaList.filter((s) => s.kelas === kelas);
    const data = siswaInClass.map((s, idx) => {
      const studentGrades = nilaiList.filter((n) => n.siswaId === s.id);
      const formatifScores = studentGrades.filter((n) => n.jenis === 'formatif').map((n) => n.skor);
      const sumatifScores = studentGrades.filter((n) => n.jenis === 'sumatif').map((n) => n.skor);
      const pasScores = studentGrades.filter((n) => n.jenis === 'pas').map((n) => n.skor);

      const avgFormatif = formatifScores.length ? Math.round(formatifScores.reduce((a, b) => a + b, 0) / formatifScores.length) : 0;
      const avgSumatif = sumatifScores.length ? Math.round(sumatifScores.reduce((a, b) => a + b, 0) / sumatifScores.length) : 0;
      const avgPas = pasScores.length ? Math.round(pasScores.reduce((a, b) => a + b, 0) / pasScores.length) : 0;

      // Final score formula: 40% Formatif + 40% Sumatif + 20% SAS
      const nilaiAkhir = Math.round((avgFormatif * 0.4) + (avgSumatif * 0.4) + (avgPas * 0.2));
      let predikat = 'D';
      if (nilaiAkhir >= 90) predikat = 'A (Sangat Baik)';
      else if (nilaiAkhir >= 80) predikat = 'B (Baik)';
      else if (nilaiAkhir >= 70) predikat = 'C (Cukup)';

      return {
        No: idx + 1,
        NISN: s.nisn,
        'Nama Siswa': s.nama,
        Kelas: s.kelas,
        'Rata-rata Formatif': avgFormatif,
        'Rata-rata Sumatif': avgSumatif,
        'Nilai SAS': avgPas,
        'Nilai Akhir Rapor': nilaiAkhir,
        Predikat: predikat,
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Leger_${kelas}`);
    XLSX.writeFile(wb, `Leger_Nilai_${kelas}.xlsx`);
  },

  // 5. Export PowerPoint (.pptx) via pptxgenjs
  exportPptPresentation(presentation: PptPresentation) {
    const ppt = new pptxgen();
    ppt.layout = 'LAYOUT_16x9';

    // Slide Title
    const titleSlide = ppt.addSlide();
    titleSlide.background = { color: '0A192F' };
    titleSlide.addText(presentation.presentationTitle, {
      x: 1,
      y: 2,
      w: 11.3,
      h: 1.5,
      fontSize: 34,
      bold: true,
      color: '64FFDA',
      align: 'center',
    });
    if (presentation.subject) {
      titleSlide.addText(`Mata Pelajaran: ${presentation.subject}`, {
        x: 1,
        y: 3.8,
        w: 11.3,
        h: 0.8,
        fontSize: 20,
        color: 'CCD6F6',
        align: 'center',
      });
    }
    titleSlide.addText('Tongguru EdAdmin Pro - Media Ajar Interaktif', {
      x: 1,
      y: 6.2,
      w: 11.3,
      h: 0.5,
      fontSize: 12,
      color: '8892B0',
      align: 'center',
    });

    // Content Slides
    presentation.slides.forEach((s) => {
      const slide = ppt.addSlide();
      slide.background = { color: 'F8FAFC' };

      // Header Banner
      slide.addShape(ppt.ShapeType.rect, {
        x: 0,
        y: 0,
        w: 13.33,
        h: 1.2,
        fill: { color: '1A3A5C' },
      });

      slide.addText(s.title, {
        x: 0.8,
        y: 0.25,
        w: 11.5,
        h: 0.7,
        fontSize: 22,
        bold: true,
        color: 'FFFFFF',
      });

      if (s.subtitle) {
        slide.addText(s.subtitle, {
          x: 0.8,
          y: 1.5,
          w: 11.5,
          h: 0.5,
          fontSize: 14,
          italic: true,
          color: '475569',
        });
      }

      // Bullets
      if (s.bullets && s.bullets.length > 0) {
        const bulletItems = s.bullets.map((b) => ({ text: b, options: { bullet: true } }));
        slide.addText(bulletItems, {
          x: 0.8,
          y: 2.2,
          w: 7.5,
          h: 4.2,
          fontSize: 16,
          color: '1E293B',
          lineSpacing: 26,
        });
      }

      // Key Takeaway Card on the right
      if (s.keyTakeaway) {
        slide.addShape(ppt.ShapeType.roundRect, {
          x: 8.8,
          y: 2.2,
          w: 3.8,
          h: 4.0,
          fill: { color: 'EFF6FF' },
          line: { color: '3B82F6', width: 2 },
        });

        slide.addText('💡 PESAN KUNCI:', {
          x: 9.1,
          y: 2.5,
          w: 3.2,
          h: 0.4,
          fontSize: 13,
          bold: true,
          color: '1D4ED8',
        });

        slide.addText(s.keyTakeaway, {
          x: 9.1,
          y: 3.0,
          w: 3.2,
          h: 2.8,
          fontSize: 14,
          color: '1E293B',
        });
      }

      // Speaker Notes
      if (s.speakerNotes) {
        slide.addNotes(s.speakerNotes);
      }
    });

    const safeTitle = presentation.presentationTitle.replace(/[^a-zA-Z0-9_-]/g, '_');
    ppt.writeFile({ fileName: `${safeTitle || 'Bahan_Tayang'}.pptx` });
  },

  // 6. Export Leger Nilai PDF
  exportLegerPdf(nilaiList: Nilai[], siswaList: Siswa[], kelas: string, pengaturan: Pengaturan) {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    // Kop Surat
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(pengaturan.dinasPendidikan.toUpperCase(), 148, 15, { align: 'center' });
    doc.setFontSize(15);
    doc.text(pengaturan.namaSekolah.toUpperCase(), 148, 22, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`${pengaturan.alamatSekolah} | Telp: ${pengaturan.noTelpSekolah}`, 148, 28, { align: 'center' });
    doc.setLineWidth(0.8);
    doc.line(15, 31, 282, 31);
    doc.setLineWidth(0.2);
    doc.line(15, 32, 282, 32);

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`LEGER NILAI ASESMEN FORMATIF & SUMATIF - KELAS ${kelas.toUpperCase()}`, 148, 40, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Mata Pelajaran: ${pengaturan.mapelUtama} | Guru Pengampu: ${pengaturan.namaGuru}`, 15, 46);

    // Table Data
    const siswaInClass = siswaList.filter((s) => s.kelas === kelas);
    const tableBody = siswaInClass.map((s, idx) => {
      const studentGrades = nilaiList.filter((n) => n.siswaId === s.id);
      const formatifScores = studentGrades.filter((n) => n.jenis === 'formatif').map((n) => n.skor);
      const sumatifScores = studentGrades.filter((n) => n.jenis === 'sumatif').map((n) => n.skor);
      const pasScores = studentGrades.filter((n) => n.jenis === 'pas').map((n) => n.skor);

      const fAvg = formatifScores.length ? Math.round(formatifScores.reduce((a, b) => a + b, 0) / formatifScores.length) : 0;
      const sAvg = sumatifScores.length ? Math.round(sumatifScores.reduce((a, b) => a + b, 0) / sumatifScores.length) : 0;
      const pasVal = pasScores.length ? Math.round(pasScores.reduce((a, b) => a + b, 0) / pasScores.length) : 0;
      const na = Math.round((fAvg * 0.4) + (sAvg * 0.4) + (pasVal * 0.2));
      let predikat = 'D';
      if (na >= 90) predikat = 'A';
      else if (na >= 80) predikat = 'B';
      else if (na >= 70) predikat = 'C';

      return [idx + 1, s.nisn, s.nama, s.jenisKelamin, fAvg, sAvg, pasVal, na, predikat];
    });

    autoTable(doc, {
      startY: 50,
      head: [['No', 'NISN', 'Nama Siswa', 'L/P', 'Formatif (40%)', 'Sumatif (40%)', 'SAS (20%)', 'Nilai Akhir', 'Predikat']],
      body: tableBody,
      headStyles: { fillColor: [26, 58, 92], textColor: 255, halign: 'center' },
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        1: { halign: 'center', cellWidth: 26 },
        2: { cellWidth: 65 },
        3: { halign: 'center', cellWidth: 12 },
        4: { halign: 'center', cellWidth: 32 },
        5: { halign: 'center', cellWidth: 32 },
        6: { halign: 'center', cellWidth: 28 },
        7: { halign: 'center', fontStyle: 'bold', cellWidth: 28 },
        8: { halign: 'center', fontStyle: 'bold', cellWidth: 22 },
      },
    });

    // Signature
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    if (finalY < 175) {
      doc.setFontSize(9);
      doc.text(`Mengetahui,`, 30, finalY);
      doc.text(`Kepala ${pengaturan.namaSekolah}`, 30, finalY + 5);
      doc.text(`${pengaturan.namaKepsek}`, 30, finalY + 25);
      doc.text(`NIP. ${pengaturan.nipKepsek}`, 30, finalY + 30);

      doc.text(`${pengaturan.kota}, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 220, finalY);
      doc.text(`Guru Mata Pelajaran`, 220, finalY + 5);
      doc.text(`${pengaturan.namaGuru}`, 220, finalY + 25);
      doc.text(`NIP. ${pengaturan.nipGuru}`, 220, finalY + 30);
    }

    doc.save(`Leger_Nilai_${kelas}.pdf`);
  },

  // 7. Export HTML content as Microsoft Word (.doc)
  exportHtmlToWord(htmlContent: string, filename = 'Dokumen_Administrasi.doc') {
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>${filename}</title>
    <style>
      body { font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.4; }
      table { border-collapse: collapse; width: 100%; margin-bottom: 15px; }
      th, td { border: 1px solid #000; padding: 6px; }
      th { background-color: #1a3a5c; color: #ffffff; }
    </style>
    </head><body>`;
    const footer = '</body></html>';
    const sourceHtml = header + htmlContent + footer;

    const blob = new Blob(['\ufeff' + sourceHtml], {
      type: 'application/msword',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.doc') ? filename : `${filename}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
