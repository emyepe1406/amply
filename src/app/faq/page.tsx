'use client';

import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "Apa itu SSW Learning?",
    answer: "SSW Learning adalah platform pembelajaran online yang menyediakan kursus-kursus berkualitas tinggi dalam berbagai bidang seperti kuliner, transportasi, dan keterampilan lainnya."
  },
  {
    question: "Bagaimana cara mendaftar di SSW Learning?",
    answer: "Anda dapat mendaftar dengan mengklik tombol 'Daftar' di halaman utama, kemudian mengisi formulir pendaftaran dengan email dan password yang valid."
  },
  {
    question: "Berapa biaya kursus di SSW Learning?",
    answer: "Setiap kursus memiliki harga Rp 150.000 dengan akses selama 30 hari. Anda dapat melihat detail harga di halaman kursus masing-masing."
  },
  {
    question: "Bagaimana cara melakukan pembayaran?",
    answer: "Kami menerima pembayaran melalui iPaymu yang mendukung berbagai metode pembayaran seperti Virtual Account, E-wallet, dan transfer bank."
  },
  {
    question: "Berapa lama akses kursus yang saya beli?",
    answer: "Setiap kursus yang dibeli memberikan akses selama 30 hari sejak tanggal pembelian. Setelah itu, Anda perlu membeli ulang untuk melanjutkan akses."
  },
  {
    question: "Apakah ada sertifikat setelah menyelesaikan kursus?",
    answer: "Ya, Anda akan mendapatkan sertifikat digital setelah menyelesaikan semua materi dan latihan dalam kursus."
  },
  {
    question: "Bagaimana cara mengakses materi kursus?",
    answer: "Setelah membeli kursus, Anda dapat mengakses materi melalui dashboard dengan login menggunakan akun Anda."
  },
  {
    question: "Apakah bisa mengakses kursus di perangkat mobile?",
    answer: "Ya, platform SSW Learning dapat diakses melalui browser di perangkat mobile maupun desktop."
  },
  {
    question: "Bagaimana jika saya lupa password?",
    answer: "Anda dapat menggunakan fitur 'Lupa Password' di halaman login untuk mereset password melalui email."
  },
  {
    question: "Apakah ada dukungan teknis?",
    answer: "Ya, tim support kami siap membantu Anda. Silakan hubungi kami melalui email atau form kontak yang tersedia."
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600">
            Temukan jawaban untuk pertanyaan yang sering diajukan tentang SSW Learning
          </p>
        </div>

        <div className="space-y-4">
          {faqData.map((faq, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md">
              <button
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                onClick={() => toggleFAQ(index)}
              >
                <span className="font-semibold text-gray-900">{faq.question}</span>
                <span className="text-2xl text-gray-500">
                  {openIndex === index ? '−' : '+'}
                </span>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Masih ada pertanyaan?
            </h3>
            <p className="text-gray-600 mb-4">
              Jika Anda tidak menemukan jawaban yang Anda cari, jangan ragu untuk menghubungi tim support kami.
            </p>
            <a
              href="mailto:support@sswlearning.com"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Hubungi Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}