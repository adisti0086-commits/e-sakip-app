import {
  INITIAL_KRITERIA_1A,
  INITIAL_KRITERIA_1B,
  INITIAL_KRITERIA_1C,
  Kriteria1aItem,
  Kriteria1bItem,
  Kriteria1cItem,
} from '../../data/perencanaanData';
import {
  INITIAL_KRITERIA_2A,
  INITIAL_KRITERIA_2B,
  INITIAL_KRITERIA_2C,
  INITIAL_KRITERIA_3A,
  INITIAL_KRITERIA_3B,
  INITIAL_KRITERIA_3C,
  INITIAL_KRITERIA_4A,
  INITIAL_KRITERIA_4B,
  INITIAL_KRITERIA_4C,
  SakipKriteriaItem,
} from '../../data/sakipKompData';
import { LKEKomponen, LKESubKomponen, LKECriteriaItem } from '../../data/lkeData';

export const LKE_STORAGE_KEYS = {
  '1.a': 'sakip_kriteria_1a_v2',
  '1.b': 'sakip_kriteria_1b_v2',
  '1.c': 'sakip_kriteria_1c_v2',
  '2.a': 'sakip_kriteria_2a_v2',
  '2.b': 'sakip_kriteria_2b_v2',
  '2.c': 'sakip_kriteria_2c_v2',
  '3.a': 'sakip_kriteria_3a_v2',
  '3.b': 'sakip_kriteria_3b_v2',
  '3.c': 'sakip_kriteria_3c_v2',
  '4.a': 'sakip_kriteria_4a_v2',
  '4.b': 'sakip_kriteria_4b_v2',
  '4.c': 'sakip_kriteria_4c_v2',
} as const;

export type SubKomponenKode = keyof typeof LKE_STORAGE_KEYS;

export const LKE_SYNC_EVENT = 'sakip_lke_sync';

export function notifyLKESync(source?: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(LKE_SYNC_EVENT, { detail: { source } }));
  }
}

export function getPredikatObj(score: number) {
  if (score >= 90) return { predikat: 'AA', kategori: 'Sangat Memuaskan', bg: 'bg-emerald-600 text-white' };
  if (score >= 80) return { predikat: 'A', kategori: 'Memuaskan (Sangat Baik)', bg: 'bg-emerald-500 text-white' };
  if (score >= 70) return { predikat: 'BB', kategori: 'Sangat Baik', bg: 'bg-teal-600 text-white' };
  if (score >= 60) return { predikat: 'B', kategori: 'Baik', bg: 'bg-blue-600 text-white' };
  if (score >= 50) return { predikat: 'CC', kategori: 'Cukup', bg: 'bg-amber-600 text-white' };
  if (score >= 30) return { predikat: 'C', kategori: 'Kurang', bg: 'bg-orange-600 text-white' };
  return { predikat: 'D', kategori: 'Sangat Kurang', bg: 'bg-rose-600 text-white' };
}

// Default baseline answers according to PermenPAN-RB No. 88 (Nilai Total: 88.10)
export const DEFAULT_SUBKOMPONEN_ANSWERS: Record<SubKomponenKode, 'AA' | 'A' | 'BB' | 'B' | 'CC' | 'C' | 'D'> = {
  '1.a': 'A',   // 90% -> 5.40
  '1.b': 'A',   // 90% -> 8.10
  '1.c': 'B',   // 70% -> 10.50 (Total Komp 1: 24.00)
  '2.a': 'AA',  // 100% -> 6.00
  '2.b': 'A',   // 90% -> 8.10
  '2.c': 'A',   // 90% -> 13.50 (Total Komp 2: 27.60)
  '3.a': 'A',   // 90% -> 2.70
  '3.b': 'A',   // 90% -> 4.05
  '3.c': 'A',   // 90% -> 6.75 (Total Komp 3: 13.50)
  '4.a': 'AA',  // 100% -> 5.00
  '4.b': 'A',   // 90% -> 6.75
  '4.c': 'A',   // 90% -> 11.25 (Total Komp 4: 23.00)
};

export function getJawabanMultiplier(jawaban: 'AA' | 'A' | 'BB' | 'B' | 'CC' | 'C' | 'D'): number {
  switch (jawaban) {
    case 'AA': return 1.0;
    case 'A': return 0.9;
    case 'BB': return 0.8;
    case 'B': return 0.7;
    case 'CC': return 0.6;
    case 'C': return 0.5;
    case 'D': return 0.3;
    default: return 0.7;
  }
}

export function getSubKomponenJawabanMap(): Record<string, 'AA' | 'A' | 'BB' | 'B' | 'CC' | 'C' | 'D'> {
  if (typeof window === 'undefined') return { ...DEFAULT_SUBKOMPONEN_ANSWERS };
  try {
    const saved = localStorage.getItem('sakip_subkomponen_jawaban_v2');
    if (saved) return { ...DEFAULT_SUBKOMPONEN_ANSWERS, ...JSON.parse(saved) };
  } catch (e) {
    console.error('Error reading sakip_subkomponen_jawaban_v2', e);
  }
  return { ...DEFAULT_SUBKOMPONEN_ANSWERS };
}

export function updateSubKomponenJawaban(
  kode: SubKomponenKode,
  newJawaban: 'AA' | 'A' | 'BB' | 'B' | 'CC' | 'C' | 'D'
) {
  if (typeof window === 'undefined') return;
  try {
    const current = getSubKomponenJawabanMap();
    current[kode] = newJawaban;
    localStorage.setItem('sakip_subkomponen_jawaban_v2', JSON.stringify(current));
    notifyLKESync('lke');
  } catch (e) {
    console.error('Error saving subkomponen jawaban', e);
  }
}

// Helper to determine jawaban code from percentage
export function calculateJawaban(persen: number): 'AA' | 'A' | 'BB' | 'B' | 'CC' | 'C' | 'D' {
  if (persen >= 100) return 'AA';
  if (persen >= 90) return 'A';
  if (persen >= 80) return 'BB';
  if (persen >= 70) return 'B';
  if (persen >= 60) return 'CC';
  if (persen >= 50) return 'C';
  return 'D';
}

// Load subkomponen raw items from localStorage with fallback
export function getSubKomponenRawItems(kode: SubKomponenKode): any[] {
  if (typeof window === 'undefined') return [];
  const key = LKE_STORAGE_KEYS[kode];
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(`Error reading ${key}`, e);
  }

  // Fallbacks
  switch (kode) {
    case '1.a': return INITIAL_KRITERIA_1A;
    case '1.b': return INITIAL_KRITERIA_1B;
    case '1.c': return INITIAL_KRITERIA_1C;
    case '2.a': return INITIAL_KRITERIA_2A;
    case '2.b': return INITIAL_KRITERIA_2B;
    case '2.c': return INITIAL_KRITERIA_2C;
    case '3.a': return INITIAL_KRITERIA_3A;
    case '3.b': return INITIAL_KRITERIA_3B;
    case '3.c': return INITIAL_KRITERIA_3C;
    case '4.a': return INITIAL_KRITERIA_4A;
    case '4.b': return INITIAL_KRITERIA_4B;
    case '4.c': return INITIAL_KRITERIA_4C;
  }
}

// Convert raw items into standardized LKECriteriaItem with connected fields
export function normalizeCriteriaList(rawItems: any[], kodeSub: string): LKECriteriaItem[] {
  return rawItems.map((item, idx) => {
    return {
      id: item.id || `k-${kodeSub}-${item.no || idx + 1}`,
      no: item.no !== undefined ? item.no : idx + 1,
      pernyataan: item.pernyataan || '',
      skor: item.skor !== undefined ? item.skor : 1,
      kodeKriteria: item.kodeKriteria || `${kodeSub}.${item.no || idx + 1}`,
      buktiPendukung: item.buktiPendukung || item.bentukPemanfaatan || item.dokumenEvidens || '',
      nomorDokumen: item.nomorDokumen || '',
      tanggalPenetapan: item.tanggalPenetapan || '',
      unitPenyusun: item.unitPenyusun || '',
      linkDakung: item.linkDakung || '',
      catatanAsesor: item.catatanAsesor || item.catatanEvaluasi || '',
      statusPemenuhan: item.statusPemenuhan || item.statusPemanfaatan || (item.skor === 1 ? 'Memenuhi Standar' : 'Belum Memenuhi'),
    };
  });
}

// Compute synchronized LKE subkomponen
export function computeSubKomponen(
  kode: SubKomponenKode,
  nama: string,
  bobot: number,
  usiaDokumen?: number,
  upayaInovatif?: 'Dapat' | 'Tidak'
): LKESubKomponen {
  const rawItems = getSubKomponenRawItems(kode);
  const kriteriaList = normalizeCriteriaList(rawItems, kode);

  const total = kriteriaList.length;
  const memenuhi = kriteriaList.filter((k) => k.skor === 1).length;
  const persenIsian = total > 0 ? Math.round(((memenuhi / total) * 100) * 100) / 100 : 100;

  // Retrieve saved or default PermenPAN-RB answer (defaults to official 88.10 baseline)
  const jawabanMap = getSubKomponenJawabanMap();
  const savedJawaban = jawabanMap[kode];
  const jawaban = savedJawaban || calculateJawaban(persenIsian);
  const multiplier = getJawabanMultiplier(jawaban);
  const nilai = Math.round(bobot * multiplier * 100) / 100;

  return {
    kode,
    nama,
    bobot,
    jawaban,
    nilai,
    persenIsian,
    kriteriaList,
    usiaDokumen,
    upayaInovatif,
  };
}

// Compute the complete 4 SAKIP components connected directly to 1, 2, 3, 4 input sources
export function computeFullLKEData(): LKEKomponen[] {
  // 1. PERENCANAAN KINERJA (BOBOT 30.00)
  const sub1a = computeSubKomponen('1.a', 'Dokumen Perencanaan kinerja telah tersedia', 6.0, 1);
  const sub1b = computeSubKomponen('1.b', 'Dokumen Perencanaan kinerja telah memenuhi standar yang baik', 9.0, undefined, 'Dapat');
  const sub1c = computeSubKomponen('1.c', 'Perencanaan Kinerja telah dimanfaatkan untuk mewujudkan hasil', 15.0, undefined, 'Dapat');
  const nilai1 = Math.round((sub1a.nilai + sub1b.nilai + sub1c.nilai) * 100) / 100;

  // 2. PENGUKURAN KINERJA (BOBOT 30.00)
  const sub2a = computeSubKomponen('2.a', 'Pengukuran Kinerja telah dilakukan', 6.0, 5);
  const sub2b = computeSubKomponen('2.b', 'Pengukuran Kinerja telah menjadi kebutuhan dalam pengelolaan kinerja', 9.0, undefined, 'Dapat');
  const sub2c = computeSubKomponen('2.c', 'Pengukuran Kinerja telah dijadikan dasar dalam pemberian reward/penyesuaian', 15.0, undefined, 'Dapat');
  const nilai2 = Math.round((sub2a.nilai + sub2b.nilai + sub2c.nilai) * 100) / 100;

  // 3. PELAPORAN KINERJA (BOBOT 15.00)
  const sub3a = computeSubKomponen('3.a', 'Terdapat Dokumen Laporan yang menggambarkan Kinerja', 3.0, 1);
  const sub3b = computeSubKomponen('3.b', 'Dokumen Laporan Kinerja telah memenuhi Standar', 4.5, undefined, 'Dapat');
  const sub3c = computeSubKomponen('3.c', 'Pelaporan Kinerja telah memberikan dampak yang besar dalam peningkatan kinerja', 7.5, undefined, 'Dapat');
  const nilai3 = Math.round((sub3a.nilai + sub3b.nilai + sub3c.nilai) * 100) / 100;

  // 4. EVALUASI AKUNTABILITAS KINERJA INTERNAL (BOBOT 25.00)
  const sub4a = computeSubKomponen('4.a', 'Evaluasi Akuntabilitas Kinerja Internal telah dilaksanakan', 5.0, 5);
  const sub4b = computeSubKomponen('4.b', 'Evaluasi Akuntabilitas Kinerja Internal telah dilaksanakan secara berkualitas', 7.5, undefined, 'Dapat');
  const sub4c = computeSubKomponen('4.c', 'Implementasi SAKIP telah meningkat karena evaluasi akuntabilitas kinerja internal', 12.5, undefined, 'Dapat');
  const nilai4 = Math.round((sub4a.nilai + sub4b.nilai + sub4c.nilai) * 100) / 100;

  return [
    {
      no: 1,
      kode: '1',
      nama: 'PERENCANAAN KINERJA',
      bobot: 30.0,
      nilai: nilai1,
      subKomponenList: [sub1a, sub1b, sub1c],
    },
    {
      no: 2,
      kode: '2',
      nama: 'PENGUKURAN KINERJA',
      bobot: 30.0,
      nilai: nilai2,
      subKomponenList: [sub2a, sub2b, sub2c],
    },
    {
      no: 3,
      kode: '3',
      nama: 'PELAPORAN KINERJA',
      bobot: 15.0,
      nilai: nilai3,
      subKomponenList: [sub3a, sub3b, sub3c],
    },
    {
      no: 4,
      kode: '4',
      nama: 'EVALUASI AKUNTABILITAS KINERJA INTERNAL',
      bobot: 25.0,
      nilai: nilai4,
      subKomponenList: [sub4a, sub4b, sub4c],
    },
  ];
}

// Update a criteria score directly and sync back to subcomponent storage
export function updateKriteriaScoreInSubKomponen(
  kodeSub: SubKomponenKode,
  kriteriaIdOrNo: string | number,
  newSkor: 1 | 0
) {
  if (typeof window === 'undefined') return;
  const key = LKE_STORAGE_KEYS[kodeSub];
  const rawItems = getSubKomponenRawItems(kodeSub);

  const updated = rawItems.map((item, idx) => {
    const isMatch =
      item.id === kriteriaIdOrNo ||
      item.kodeKriteria === kriteriaIdOrNo ||
      item.no === kriteriaIdOrNo ||
      idx + 1 === kriteriaIdOrNo;

    if (isMatch) {
      return {
        ...item,
        skor: newSkor,
        statusPemenuhan: newSkor === 1 ? 'Memenuhi Standar' : 'Belum Memenuhi',
        statusPemanfaatan: newSkor === 1 ? 'Dimanfaatkan Penuh' : 'Belum Optimal',
      };
    }
    return item;
  });

  try {
    localStorage.setItem(key, JSON.stringify(updated));

    // Also auto-update the subkomponen answer to match the new criteria fulfillment
    const normalized = normalizeCriteriaList(updated, kodeSub);
    const total = normalized.length;
    const memenuhi = normalized.filter((k) => k.skor === 1).length;
    const persen = total > 0 ? Math.round(((memenuhi / total) * 100) * 100) / 100 : 100;
    const autoJawaban = calculateJawaban(persen);

    const currentJawaban = getSubKomponenJawabanMap();
    currentJawaban[kodeSub] = autoJawaban;
    localStorage.setItem('sakip_subkomponen_jawaban_v2', JSON.stringify(currentJawaban));

    notifyLKESync('lke');
  } catch (e) {
    console.error(`Failed to update ${key}`, e);
  }
}

// Summary statistics of SAKIP for Sidebar, Dashboard & Headers
export function getSAKIPSummary() {
  const lkeData = computeFullLKEData();
  const totalNilai = Math.round(lkeData.reduce((acc, k) => acc + k.nilai, 0) * 100) / 100;
  const predikatObj = getPredikatObj(totalNilai);

  return {
    totalNilai,
    predikat: predikatObj.predikat,
    kategori: predikatObj.kategori,
    predikatBg: predikatObj.bg,
    komp1Nilai: lkeData[0].nilai,
    komp2Nilai: lkeData[1].nilai,
    komp3Nilai: lkeData[2].nilai,
    komp4Nilai: lkeData[3].nilai,
    lkeData,
  };
}
