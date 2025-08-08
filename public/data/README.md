# Struktur Penyimpanan File Pembelajaran

Direktori ini digunakan untuk menyimpan file-file pembelajaran yang akan dibaca oleh aplikasi Next.js.

## Struktur Direktori

```
public/data/
├── drivertruk/
│   ├── flashcardbab1.xlsx
│   ├── flashcardbab2.xlsx
│   ├── flashcardbab3.xlsx
│   ├── flashcardbab4.xlsx
│   ├── materibab1.docx
│   ├── materibab2.docx
│   ├── materibab3.docx
│   ├── materibab4.docx
│   ├── soalbab1.xlsx
│   ├── soalbab2.xlsx
│   ├── soalbab3.xlsx
│   ├── soalbab4.xlsx
│   ├── ujian1.xlsx
│   ├── ujian2.xlsx
│   ├── ujian3.xlsx
│   ├── ujian4.xlsx
│   └── ujian5.xlsx
├── driverbis/
│   ├── flashcardbab1.xlsx
│   ├── flashcardbab2.xlsx
│   ├── materibab1.docx
│   ├── materibab2.docx
│   ├── materibab3.docx
│   ├── soalbab1.xlsx
│   ├── soalbab2.xlsx
│   └── soalbab3.xlsx
├── drivertaxi/
│   └── (file pembelajaran untuk driver taxi)
└── groundhandling/
    └── (file pembelajaran untuk ground handling)
```

## Format File

### File Flashcard (flashcardbabX.xlsx)
File Excel dengan kolom:
- `pertanyaan`: Pertanyaan atau kata kunci
- `jawaban`: Jawaban atau definisi
- `kategori`: Kategori materi (opsional)
- `tingkat_kesulitan`: Level kesulitan (opsional)

### File Materi (materibabX.docx)
File Word (.docx) yang berisi:
- Konten materi pembelajaran
- Gambar dan diagram (akan dikonversi otomatis)
- Format heading untuk struktur materi

### File Soal (soalbabX.xlsx)
File Excel dengan kolom:
- `pertanyaan`: Soal pertanyaan
- `pilihan_a`: Pilihan jawaban A
- `pilihan_b`: Pilihan jawaban B
- `pilihan_c`: Pilihan jawaban C
- `pilihan_d`: Pilihan jawaban D
- `jawaban_benar`: Huruf jawaban yang benar (A/B/C/D)
- `penjelasan`: Penjelasan jawaban (opsional)

### File Ujian (ujianX.xlsx)
Format sama dengan file soal, digunakan untuk ujian akhir.

## Cara Menggunakan

1. **Salin file dari sistem lama**:
   ```bash
   # Contoh untuk driver truk
   cp "../ssw.kinabaru new backup copy/DriverTruk/"*.xlsx public/data/drivertruk/
   cp "../ssw.kinabaru new backup copy/DriverTruk/"*.docx public/data/drivertruk/
   ```

2. **Akses file dalam aplikasi**:
   File akan dapat diakses melalui URL:
   - `/data/drivertruk/flashcardbab1.xlsx`
   - `/data/drivertruk/materibab1.docx`
   - dll.

3. **Implementasi pembacaan file**:
   - Gunakan SheetJS untuk membaca file Excel
   - Gunakan Mammoth.js untuk membaca file Word
   - File akan dibaca secara client-side di browser

## Catatan Penting

- File harus ditempatkan di direktori `public/data/` agar dapat diakses oleh browser
- Nama file harus sesuai dengan konvensi: `flashcardbabX.xlsx`, `materibabX.docx`, dll.
- Pastikan file Excel memiliki struktur kolom yang sesuai
- File Word akan dikonversi ke HTML secara otomatis

## Contoh Implementasi

Untuk membaca file flashcard:
```javascript
// Dalam komponen React
const loadFlashcards = async (courseId, chapterId) => {
  const response = await fetch(`/data/${courseId}/flashcardbab${chapterId}.xlsx`);
  const arrayBuffer = await response.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(worksheet);
  return data;
};
```

Untuk membaca file materi:
```javascript
// Dalam komponen React
const loadMaterial = async (courseId, chapterId) => {
  const response = await fetch(`/data/${courseId}/materibab${chapterId}.docx`);
  const arrayBuffer = await response.arrayBuffer();
  const result = await mammoth.convertToHtml({arrayBuffer});
  return result.value; // HTML content
};
```