import React, { useState } from 'react';
import {
  Code,
  Download,
  Copy,
  Check,
  X,
  Database,
  FileCode,
  Server,
  Layers,
  Terminal,
} from 'lucide-react';

interface PhpArchitectureModalProps {
  onClose: () => void;
}

export const PhpArchitectureModal: React.FC<PhpArchitectureModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'sql' | 'login' | 'triwulan' | 'lhe' | 'config'>('sql');
  const [copied, setCopied] = useState(false);

  const codeSnippets = {
    sql: `-- ========================================================
-- DATABASE STRUCTURE SAKIP (Sistem Akuntabilitas Kinerja Instansi Pemerintah)
-- Dialect: MySQL 8.0+ / MariaDB
-- ========================================================

CREATE DATABASE IF NOT EXISTS \`db_sakip_pemda\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`db_sakip_pemda\`;

-- 1. Tabel OPD / Perangkat Daerah
CREATE TABLE \`opd\` (
  \`id\` VARCHAR(50) PRIMARY KEY,
  \`kode\` VARCHAR(30) NOT NULL,
  \`nama\` VARCHAR(255) NOT NULL,
  \`kepala_opd\` VARCHAR(150) NOT NULL,
  \`nip_kepala\` VARCHAR(50) NOT NULL,
  \`telepon\` VARCHAR(30),
  \`email\` VARCHAR(100),
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Tabel Pengguna (4 User Roles)
CREATE TABLE \`users\` (
  \`id\` VARCHAR(50) PRIMARY KEY,
  \`username\` VARCHAR(50) UNIQUE NOT NULL,
  \`password\` VARCHAR(255) NOT NULL,
  \`name\` VARCHAR(150) NOT NULL,
  \`nip\` VARCHAR(50),
  \`email\` VARCHAR(100),
  \`role\` ENUM('administrator', 'operator_unit', 'validator', 'verifikator') NOT NULL,
  \`opd_id\` VARCHAR(50),
  \`status\` ENUM('Aktif', 'Nonaktif') DEFAULT 'Aktif',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`opd_id\`) REFERENCES \`opd\`(\`id\`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 3. Tabel Master Renstra
CREATE TABLE \`renstra_sasaran\` (
  \`id\` VARCHAR(50) PRIMARY KEY,
  \`opd_id\` VARCHAR(50) NOT NULL,
  \`tahun_awal\` INT NOT NULL,
  \`tahun_akhir\` INT NOT NULL,
  \`kode\` VARCHAR(20) NOT NULL,
  \`sasaran_strategis\` TEXT NOT NULL,
  \`tujuan\` TEXT NOT NULL,
  \`target_indikator\` VARCHAR(100) NOT NULL,
  \`satuan\` VARCHAR(50) NOT NULL,
  \`cascading_level\` VARCHAR(50) DEFAULT 'Eselon II',
  FOREIGN KEY (\`opd_id\`) REFERENCES \`opd\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Tabel Indikator Perjanjian Kinerja (PK) & Target
CREATE TABLE \`indikator_pk\` (
  \`id\` VARCHAR(50) PRIMARY KEY,
  \`opd_id\` VARCHAR(50) NOT NULL,
  \`tahun\` INT NOT NULL,
  \`sasaran_strategis\` TEXT NOT NULL,
  \`nama_indikator\` VARCHAR(255) NOT NULL,
  \`tipe_indikator\` ENUM('IKU', 'IKP', 'Kegiatan') DEFAULT 'IKU',
  \`formula\` TEXT NOT NULL,
  \`satuan\` VARCHAR(50) NOT NULL,
  \`polarisasi\` ENUM('Maximize', 'Minimize') DEFAULT 'Maximize',
  \`target_tahunan\` DECIMAL(10,2) NOT NULL,
  \`target_t1\` DECIMAL(10,2) NOT NULL,
  \`target_t2\` DECIMAL(10,2) NOT NULL,
  \`target_t3\` DECIMAL(10,2) NOT NULL,
  \`target_t4\` DECIMAL(10,2) NOT NULL,
  \`pagu_anggaran\` DECIMAL(15,2) DEFAULT 0,
  \`penanggung_jawab\` VARCHAR(150),
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`opd_id\`) REFERENCES \`opd\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Tabel Capaian Bulanan
CREATE TABLE \`capaian_bulanan\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`indikator_id\` VARCHAR(50) NOT NULL,
  \`tahun\` INT NOT NULL,
  \`bulan\` TINYINT NOT NULL, -- 1 s/d 12
  \`target_bulanan\` DECIMAL(10,2) NOT NULL,
  \`realisasi\` DECIMAL(10,2) NOT NULL,
  \`persen_capaian\` DECIMAL(6,2) NOT NULL,
  \`evidens_file\` VARCHAR(255),
  \`keterangan\` TEXT,
  \`status_validasi\` ENUM('Draft', 'Menunggu Validasi', 'Terverifikasi', 'Perlu Perbaikan', 'Ditolak') DEFAULT 'Draft',
  \`validator_id\` VARCHAR(50),
  \`catatan_validator\` TEXT,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (\`indikator_id\`) REFERENCES \`indikator_pk\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Tabel Capaian Triwulan & Status Warna (Hijau, Kuning, Merah)
CREATE TABLE \`capaian_triwulan\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`indikator_id\` VARCHAR(50) NOT NULL,
  \`tahun\` INT NOT NULL,
  \`triwulan\` TINYINT NOT NULL, -- 1 s/d 4
  \`target\` DECIMAL(10,2) NOT NULL,
  \`realisasi\` DECIMAL(10,2) NOT NULL,
  \`persen_capaian\` DECIMAL(6,2) NOT NULL,
  \`status_warna\` ENUM('hijau', 'kuning', 'merah') NOT NULL,
  \`faktor_pendorong\` TEXT,
  \`faktor_penghambat\` TEXT,
  \`tindak_lanjut\` TEXT,
  \`evidens_file\` VARCHAR(255),
  \`status_validasi\` VARCHAR(50) DEFAULT 'Draft',
  FOREIGN KEY (\`indikator_id\`) REFERENCES \`indikator_pk\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Tabel LHE (Laporan Hasil Evaluasi)
CREATE TABLE \`lhe_evaluasi\` (
  \`id\` VARCHAR(50) PRIMARY KEY,
  \`nomor_surat_lhe\` VARCHAR(100) NOT NULL,
  \`opd_id\` VARCHAR(50) NOT NULL,
  \`tahun\` INT NOT NULL,
  \`tanggal_evaluasi\` DATE NOT NULL,
  \`evaluator_id\` VARCHAR(50),
  \`evaluator_nama\` VARCHAR(150) NOT NULL,
  \`nilai_total\` DECIMAL(5,2) NOT NULL,
  \`predikat\` VARCHAR(5) NOT NULL, -- AA, A, BB, B, CC, C, D
  \`kategori_predikat\` VARCHAR(50) NOT NULL,
  \`catatan_evaluasi_umum\` TEXT,
  \`rekomendasi_perbaikan\` JSON,
  \`dokumen_lhe_nama\` VARCHAR(255),
  \`dokumen_lhe_url\` VARCHAR(255),
  \`status\` VARCHAR(50) DEFAULT 'Selesai Dievaluasi',
  FOREIGN KEY (\`opd_id\`) REFERENCES \`opd\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. Tabel Kriteria Penilaian LHE (Skor 1 atau 0)
CREATE TABLE \`lhe_kriteria\` (
  \`id\` VARCHAR(50) PRIMARY KEY,
  \`lhe_id\` VARCHAR(50) NOT NULL,
  \`komponen\` VARCHAR(100) NOT NULL,
  \`sub_komponen\` VARCHAR(100) NOT NULL,
  \`parameter\` TEXT NOT NULL,
  \`bobot_kriteria\` DECIMAL(5,2) NOT NULL,
  \`skor\` TINYINT NOT NULL DEFAULT 0, -- 1 = Memenuhi, 0 = Belum
  \`catatan_evaluator\` TEXT,
  FOREIGN KEY (\`lhe_id\`) REFERENCES \`lhe_evaluasi\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB;`,

    triwulan: `<?php
/**
 * Modul Capaian Kinerja Triwulan SAKIP (PHP Native / MVC)
 * Logika Penentuan Warna Otomatis:
 * - Capaian >= 100% : HIJAU
 * - Capaian 50% - 99.99% : KUNING
 * - Capaian < 50% : MERAH
 */

require_once '../config/database.php';
require_once '../config/auth.php';

// Validasi otentikasi user
check_login();

$tahun = isset($_GET['tahun']) ? intval($_GET['tahun']) : date('Y');
$opd_id = isset($_GET['opd_id']) ? $_GET['opd_id'] : (is_operator() ? $_SESSION['user']['opd_id'] : 'all');
$triwulan = isset($_GET['triwulan']) ? intval($_GET['triwulan']) : 0;

// Query Indikator dan Capaian Triwulanan
$sql = "SELECT i.*, o.nama as nama_opd,
        t.triwulan, t.target as target_t, t.realisasi as realisasi_t,
        t.persen_capaian, t.status_warna, t.faktor_pendorong,
        t.faktor_penghambat, t.tindak_lanjut, t.evidens_file
        FROM indikator_pk i
        JOIN opd o ON i.opd_id = o.id
        LEFT JOIN capaian_triwulan t ON i.id = t.indikator_id AND t.tahun = ?
        WHERE i.tahun = ?";

$params = [$tahun, $tahun];
if ($opd_id !== 'all') {
    $sql .= " AND i.opd_id = ?";
    $params[] = $opd_id;
}
if ($triwulan > 0) {
    $sql .= " AND t.triwulan = ?";
    $params[] = $triwulan;
}

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

/**
 * Fungsi kalkulasi & penentuan warna triwulan
 */
function hitung_status_triwulan($target, $realisasi) {
    if ($target <= 0) return ['persen' => 0, 'warna' => 'merah', 'badge' => 'badge-danger'];
    $persen = round(($realisasi / $target) * 100, 2);
    
    if ($persen >= 100) {
        return ['persen' => $persen, 'warna' => 'hijau', 'badge' => 'badge-success', 'label' => 'Tercapai 100% (Hijau)'];
    } elseif ($persen >= 50) {
        return ['persen' => $persen, 'warna' => 'kuning', 'badge' => 'badge-warning', 'label' => 'Cukup 50-99% (Kuning)'];
    } else {
        return ['persen' => $persen, 'warna' => 'merah', 'badge' => 'badge-danger', 'label' => 'Kurang <50% (Merah)'];
    }
}
?>
<!-- View Triwulan -->
<div class="card">
  <div class="card-header bg-success text-white">
    <h5 class="mb-0">Capaian Kinerja Triwulan TA <?= htmlspecialchars($tahun) ?></h5>
  </div>
  <div class="table-responsive">
    <table class="table table-bordered table-hover">
      <thead class="thead-light">
        <tr>
          <th>Indikator PK</th>
          <th>Triwulan</th>
          <th>Target</th>
          <th>Realisasi</th>
          <th>% Capaian & Indikator Warna</th>
          <th>Analisis & Tindak Lanjut</th>
          <th>Evidens</th>
        </tr>
      </thead>
      <tbody>
        <?php foreach ($rows as $row): 
          $eval = hitung_status_triwulan($row['target_t'] ?? 0, $row['realisasi_t'] ?? 0);
        ?>
        <tr>
          <td>
            <strong>[<?= htmlspecialchars($row['tipe_indikator']) ?>]</strong> <?= htmlspecialchars($row['nama_indikator']) ?>
            <br><small class="text-muted"><?= htmlspecialchars($row['nama_opd']) ?></small>
          </td>
          <td class="text-center font-weight-bold">T<?= htmlspecialchars($row['triwulan'] ?? 1) ?></td>
          <td class="text-right"><?= number_format($row['target_t'] ?? 0, 2) ?> <?= htmlspecialchars($row['satuan']) ?></td>
          <td class="text-right font-weight-bold"><?= number_format($row['realisasi_t'] ?? 0, 2) ?> <?= htmlspecialchars($row['satuan']) ?></td>
          <td class="text-center">
            <?php if ($eval['warna'] == 'hijau'): ?>
              <span class="badge badge-success p-2" style="background-color: #10b981; color: white;">
                🟢 <?= $eval['persen'] ?>% (Hijau)
              </span>
            <?php elseif ($eval['warna'] == 'kuning'): ?>
              <span class="badge badge-warning p-2" style="background-color: #f59e0b; color: white;">
                🟡 <?= $eval['persen'] ?>% (Kuning)
              </span>
            <?php else: ?>
              <span class="badge badge-danger p-2" style="background-color: #ef4444; color: white;">
                🔴 <?= $eval['persen'] ?>% (Merah)
              </span>
            <?php endif; ?>
          </td>
          <td>
            <small>
              <strong>Penghambat:</strong> <?= htmlspecialchars($row['faktor_penghambat'] ?? '-') ?><br>
              <strong>Tindak Lanjut:</strong> <?= htmlspecialchars($row['tindak_lanjut'] ?? '-') ?>
            </small>
          </td>
          <td>
            <?php if (!empty($row['evidens_file'])): ?>
              <a href="../uploads/<?= htmlspecialchars($row['evidens_file']) ?>" class="btn btn-sm btn-outline-info" target="_blank">
                📎 Lihat Evidens
              </a>
            <?php else: ?>
              <span class="text-muted small">-</span>
            <?php endif; ?>
          </td>
        </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>
</div>`,

    lhe: `<?php
/**
 * Modul LHE (Laporan Hasil Evaluasi) SAKIP
 * Aksi: Upload, Edit, Hapus, Penilaian 1/0, Catatan & Rekomendasi
 */

require_once '../config/database.php';
require_once '../config/auth.php';

check_login();

$action = $_POST['action'] ?? $_GET['action'] ?? 'index';

// 1. Aksi Hapus LHE
if ($action === 'delete') {
    require_role(['administrator', 'verifikator']);
    $lhe_id = $_GET['id'];
    
    $stmt = $pdo->prepare("DELETE FROM lhe_evaluasi WHERE id = ?");
    $stmt->execute([$lhe_id]);
    
    $_SESSION['flash'] = 'LHE berhasil dihapus!';
    header('Location: lhe.php');
    exit;
}

// 2. Aksi Upload Dokumen LHE
if ($action === 'upload') {
    $lhe_id = $_POST['lhe_id'];
    
    if (isset($_FILES['dokumen_lhe']) && $_FILES['dokumen_lhe']['error'] === UPLOAD_ERR_OK) {
        $fileTmpPath = $_FILES['dokumen_lhe']['tmp_name'];
        $fileName = time() . '_' . basename($_FILES['dokumen_lhe']['name']);
        $destPath = '../uploads/lhe/' . $fileName;
        
        move_uploaded_file($fileTmpPath, $destPath);
        
        $stmt = $pdo->prepare("UPDATE lhe_evaluasi SET dokumen_lhe_nama = ?, dokumen_lhe_url = ? WHERE id = ?");
        $stmt->execute([$fileName, $destPath, $lhe_id]);
        
        $_SESSION['flash'] = 'Dokumen LHE resmi berhasil diupload!';
    }
    header('Location: lhe.php');
    exit;
}

// 3. Aksi Simpan Evaluasi & Penilaian (1 / 0)
if ($action === 'save_evaluation') {
    require_role(['administrator', 'verifikator']);
    
    $lhe_id = $_POST['lhe_id'] ?: 'lhe-' . uniqid();
    $nomor_surat = $_POST['nomor_surat_lhe'];
    $opd_id = $_POST['opd_id'];
    $tahun = intval($_POST['tahun']);
    $catatan_umum = $_POST['catatan_evaluasi_umum'];
    $rekomendasi = json_encode($_POST['rekomendasi_perbaikan'] ?? []);
    $scores = $_POST['kriteria_scores'] ?? []; // Array [kriteria_id => 1 or 0]

    // Hitung Akumulasi Nilai 5 Komponen Berbobot (PermenPAN-RB No. 88/2021)
    // Perencanaan: 30%, Pengukuran: 30%, Pelaporan: 15%, Evaluasi: 10%, Capaian: 15%
    $bobot_komponen = [
        'Perencanaan Kinerja' => 30,
        'Pengukuran Kinerja' => 30,
        'Pelaporan Kinerja' => 15,
        'Evaluasi Internal' => 10,
        'Capaian Kinerja' => 15
    ];

    $total_skor = 0;
    foreach ($scores as $kriteria_id => $skor_val) {
        $skor = intval($skor_val) === 1 ? 1 : 0;
        // Update database kriteria
        $stmtK = $pdo->prepare("UPDATE lhe_kriteria SET skor = ? WHERE id = ? AND lhe_id = ?");
        $stmtK->execute([$skor, $kriteria_id, $lhe_id]);
    }

    // Predikat SAKIP
    // AA: >90, A: 80-90, BB: 70-80, B: 60-70, CC: 50-60, C: 30-50, D: 0-30
    function get_predikat_sakip($nilai) {
        if ($nilai >= 90) return ['predikat' => 'AA', 'kategori' => 'Sangat Memuaskan'];
        if ($nilai >= 80) return ['predikat' => 'A', 'kategori' => 'Memuaskan'];
        if ($nilai >= 70) return ['predikat' => 'BB', 'kategori' => 'Sangat Baik'];
        if ($nilai >= 60) return ['predikat' => 'B', 'kategori' => 'Baik'];
        if ($nilai >= 50) return ['predikat' => 'CC', 'kategori' => 'Cukup'];
        if ($nilai >= 30) return ['predikat' => 'C', 'kategori' => 'Kurang'];
        return ['predikat' => 'D', 'kategori' => 'Sangat Kurang'];
    }

    // Redirect setelah simpan
    $_SESSION['flash'] = 'Penilaian Lembar Kerja SAKIP (1/0) berhasil disimpan!';
    header('Location: lhe.php');
    exit;
}
?>`,

    login: `<?php
/**
 * Modul Otentikasi Pengguna Multi-Role SAKIP
 * 4 User: administrator, operator_unit, validator, verifikator
 */

session_start();
require_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username']);
    $password = trim($_POST['password']);
    
    $stmt = $pdo->prepare("SELECT u.*, o.nama as nama_opd FROM users u LEFT JOIN opd o ON u.opd_id = o.id WHERE u.username = ? AND u.status = 'Aktif'");
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user && password_verify($password, $user['password'])) {
        $_SESSION['user'] = [
            'id' => $user['id'],
            'username' => $user['username'],
            'name' => $user['name'],
            'role' => $user['role'], // administrator, operator_unit, validator, verifikator
            'opd_id' => $user['opd_id'],
            'nama_opd' => $user['nama_opd']
        ];
        header('Location: ../modules/dashboard.php');
        exit;
    } else {
        $error = 'Username atau Password salah!';
    }
}
?>`,

    config: `<?php
/**
 * Konfigurasi Database PDO MySQL SAKIP
 */

$host = '127.0.0.1';
$db   = 'db_sakip_pemda';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    die("Koneksi Database Gagal: " . $e->getMessage());
}
?>`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-950 text-slate-100 rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-800 animate-in fade-in zoom-in-95 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">
                Skema Database & Arsitektur Backend PHP SAKIP
              </h3>
              <p className="text-xs text-slate-400">
                Lengkap dengan 4 Role, Logika Triwulan (Hijau/Kuning/Merah), & Modul LHE (1/0)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin!' : 'Salin Kode'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-4 pb-2 border-b border-slate-800 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('sql')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === 'sql'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>database_sakip.sql</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('triwulan')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === 'triwulan'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>capaian_triwulan.php (Hijau/Kuning/Merah)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('lhe')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === 'lhe'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>lhe_penilaian.php (1/0 & Rekomendasi)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === 'login'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>auth_multirole.php (4 User)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('config')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === 'config'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>config.php</span>
          </button>
        </div>

        {/* Code View Area */}
        <div className="flex-1 overflow-y-auto mt-3 p-4 bg-slate-900 rounded-xl font-mono text-xs text-emerald-300 border border-slate-800">
          <pre className="whitespace-pre">{codeSnippets[activeTab]}</pre>
        </div>
      </div>
    </div>
  );
};
