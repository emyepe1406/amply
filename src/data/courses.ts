import { Course } from '@/types';

export const courses: Course[] = [
  {
    id: 'driver-truk',
    title: 'Driver Truk',
    description: 'Kursus mengemudi truk untuk SSW Jepang dengan materi lengkap dan simulasi ujian CBT.',
    icon: '🚛',
    logo: '/images/logos/truk.png',
    category: 'driver',
    isPopular: true,
    chapters: [
      {
        id: 1,
        title: 'トラック運転者の基本',
        subtitle: 'Dasar-Dasar Pengemudi Truk'
      },
      {
        id: 2,
        title: '運行業務',
        subtitle: 'Pekerjaan Operasional'
      },
      {
        id: 3,
        title: '荷役業務',
        subtitle: 'Penanganan Truk Kargo (Muatan)'
      },
      {
        id: 4,
        title: '危険予知トレーニング',
        subtitle: 'Pelatihan Prediksi Bahaya'
      }
    ]
  },
  {
    id: 'driver-bis',
    title: 'Driver Bis',
    description: 'Kursus mengemudi bis untuk SSW Jepang dengan fokus pada keselamatan penumpang.',
    icon: '🚌',
    logo: '/images/logos/bis.png',
    category: 'driver',
    isPopular: true,
    chapters: [
      {
        id: 1,
        title: 'バス運転者の基本',
        subtitle: 'Dasar-Dasar Pengemudi Bis'
      },
      {
        id: 2,
        title: '乗客サービス',
        subtitle: 'Layanan Penumpang'
      },
      {
        id: 3,
        title: '安全運転',
        subtitle: 'Mengemudi yang Aman'
      }
    ]
  },
  {
    id: 'driver-taxi',
    title: 'Driver Taxi',
    description: 'Kursus mengemudi taxi untuk SSW Jepang dengan penekanan pada layanan pelanggan.',
    icon: '🚕',
    logo: '/images/logos/taxi.png',
    category: 'driver',
    chapters: [
      {
        id: 1,
        title: 'タクシー運転者の基本',
        subtitle: 'Dasar-Dasar Pengemudi Taxi'
      },
      {
        id: 2,
        title: '接客サービス',
        subtitle: 'Layanan Pelanggan'
      }
    ]
  },
  {
    id: 'ground-handling',
    title: 'Ground Handling',
    description: 'Kursus ground handling untuk industri penerbangan di Jepang.',
    icon: '✈️',
    logo: '/images/logos/aviasi.png',
    category: 'service',
    chapters: [
      {
        id: 1,
        title: 'グランドハンドリング基礎',
        subtitle: 'Dasar-Dasar Ground Handling'
      }
    ]
  },
  {
    id: 'building-cleaning',
    title: 'Building Cleaning',
    description: 'Kursus pembersihan gedung untuk SSW Jepang dengan teknik dan standar Jepang.',
    icon: '🧹',
    logo: '/images/logos/cleaning.png',
    category: 'service',
    chapters: [
      {
        id: 1,
        title: 'ビル清掃基礎',
        subtitle: 'Dasar-Dasar Pembersihan Gedung'
      }
    ]
  },
  {
    id: 'pengolahan-makanan',
    title: 'Pengolahan Makanan',
    description: 'Kursus pengolahan makanan untuk industri food service di Jepang.',
    icon: '🍱',
    logo: '/images/logos/pm.png',
    category: 'service',
    chapters: [
      {
        id: 1,
        title: '食品加工基礎',
        subtitle: 'Dasar-Dasar Pengolahan Makanan'
      }
    ]
  },
  {
    id: 'restoran',
    title: 'Restoran',
    description: 'Kursus pelayanan restoran untuk SSW Jepang dengan fokus pada omotenashi.',
    icon: '🍽️',
    logo: '/images/logos/restoran.png',
    category: 'service',
    chapters: [
      {
        id: 1,
        title: 'レストランサービス',
        subtitle: 'Layanan Restoran'
      }
    ]
  },
  {
    id: 'seibi',
    title: 'Seibi (Perawatan Kendaraan)',
    description: 'Kursus perawatan dan perbaikan kendaraan untuk SSW Jepang.',
    icon: '🔧',
    logo: '/images/logos/seibi.png',
    category: 'technical',
    chapters: [
      {
        id: 1,
        title: '自動車整備基礎',
        subtitle: 'Dasar-Dasar Perawatan Kendaraan'
      }
    ]
  }
];

export const getPopularCourses = () => {
  return courses.filter(course => course.isPopular);
};

export const getCourseById = (id: string) => {
  return courses.find(course => course.id === id);
};

export const getCoursesByCategory = (category: string) => {
  return courses.filter(course => course.category === category);
};