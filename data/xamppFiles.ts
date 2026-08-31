export interface XamppFileItem {
  filename: string;
  path: string;
  category: 'config' | 'auth' | 'core' | 'views' | 'database' | 'docs';
  description: string;
  content: string;
}

export const XAMPP_PROJECT_FILES: XamppFileItem[] = [
  {
    filename: 'database.php',
    path: 'config/database.php',
    category: 'config',
    description: 'Koneksi database PDO MySQL untuk XAMPP (root/tanpa password)',
    content: `<?php
/**
 * Konfigurasi Koneksi Database MySQL untuk XAMPP
 * Database: db_sakip
 */

define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'db_sakip');
define('DB_PORT', 3306);

try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
} catch (PDOException $e) {
    die("Koneksi Database XAMPP Gagal: " . $e->getMessage() . "<br><br><b>Petunjuk:</b> Pastikan MySQL di XAMPP Control Panel sudah 'Start' dan database 'db_sakip' telah diimport di phpMyAdmin.");
}

// Fungsi Helper Response JSON
function jsonResponse($status, $message, $data = null) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'status' => $status,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}
`
  },
  {
    filename: 'db_sakip.sql',
    path: 'database/db_sakip.sql',
    category: 'database',
    description: 'Skrip DDL & Data Awal MySQL Lengkap (Tabel OPD, Users, Renstra, PK, Triwulan, LHE)',
    content: `-- ========================================================
-- DATABASE STRUCTURE SAKIP PEMDA (XAMPP / MySQL / MariaDB)
-- Sistem Akuntabilitas Kinerja Instansi Pemerintah
-- ========================================================

CREATE DATABASE IF NOT EXISTS \`db_sakip\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`db_sakip\`;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS \`lhe_evaluasi_detail\`;
DROP TABLE IF EXISTS \`lhe_evaluasi\`;
DROP TABLE IF EXISTS \`capaian_triwulan\`;
DROP TABLE IF EXISTS \`capaian_bulanan\`;
DROP TABLE IF EXISTS \`indikator_pk\`;
DROP TABLE IF EXISTS \`renstra_sasaran\`;
DROP TABLE IF EXISTS \`bobot_sakip\`;
DROP TABLE IF EXISTS \`users\`;
DROP TABLE IF EXISTS \`opd\`;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Tabel Perangkat Daerah (OPD)
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

-- 2. Tabel Pengguna (4 Roles)
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

-- 3. Tabel Bobot SAKIP
CREATE TABLE \`bobot_sakip\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`tahun\` INT NOT NULL UNIQUE,
  \`perencanaan_kinerja\` DECIMAL(5,2) DEFAULT 30.00,
  \`pengukuran_kinerja\` DECIMAL(5,2) DEFAULT 30.00,
  \`pelaporan_kinerja\` DECIMAL(5,2) DEFAULT 15.00,
  \`evaluasi_akip_internal\` DECIMAL(5,2) DEFAULT 10.00,
  \`capaian_kinerja\` DECIMAL(5,2) DEFAULT 15.00,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 4. Tabel Master Renstra Sasaran
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

-- 5. Tabel Indikator Perjanjian Kinerja (PK)
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

-- 6. Tabel Capaian Bulanan
CREATE TABLE \`capaian_bulanan\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`indikator_id\` VARCHAR(50) NOT NULL,
  \`tahun\` INT NOT NULL,
  \`bulan\` INT NOT NULL,
  \`target_bulan\` DECIMAL(10,2) DEFAULT 0,
  \`realisasi_bulan\` DECIMAL(10,2) DEFAULT 0,
  \`persen_capaian\` DECIMAL(6,2) DEFAULT 0,
  \`status_verifikasi\` ENUM('Belum Diisi', 'Menunggu Validasi', 'Terverifikasi', 'Perlu Perbaikan') DEFAULT 'Belum Diisi',
  \`file_evidens\` VARCHAR(255),
  \`catatan_validator\` TEXT,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY \`unik_indikator_periode\` (\`indikator_id\`, \`tahun\`, \`bulan\`),
  FOREIGN KEY (\`indikator_id\`) REFERENCES \`indikator_pk\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Tabel Capaian Triwulan (Kalkulasi Otomatis Hijau/Kuning/Merah)
CREATE TABLE \`capaian_triwulan\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`indikator_id\` VARCHAR(50) NOT NULL,
  \`tahun\` INT NOT NULL,
  \`triwulan\` INT NOT NULL,
  \`target_tw\` DECIMAL(10,2) NOT NULL,
  \`realisasi_tw\` DECIMAL(10,2) NOT NULL,
  \`persen_capaian\` DECIMAL(6,2) NOT NULL,
  \`status_warna\` ENUM('hijau', 'kuning', 'merah') NOT NULL,
  \`faktor_pendorong\` TEXT,
  \`faktor_penghambat\` TEXT,
  \`rencana_tindak_lanjut\` TEXT,
  \`file_laporan_tw\` VARCHAR(255),
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY \`unik_indikator_tw\` (\`indikator_id\`, \`tahun\`, \`triwulan\`),
  FOREIGN KEY (\`indikator_id\`) REFERENCES \`indikator_pk\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. Tabel LHE (Laporan Hasil Evaluasi)
CREATE TABLE \`lhe_evaluasi\` (
  \`id\` VARCHAR(50) PRIMARY KEY,
  \`nomor_surat_lhe\` VARCHAR(100) NOT NULL,
  \`opd_id\` VARCHAR(50) NOT NULL,
  \`tahun\` INT NOT NULL,
  \`tanggal_terbit\` DATE NOT NULL,
  \`evaluator_nama\` VARCHAR(150) NOT NULL,
  \`evaluator_nip\` VARCHAR(50) NOT NULL,
  \`nilai_total\` DECIMAL(5,2) NOT NULL,
  \`predikat\` ENUM('AA', 'A', 'BB', 'B', 'CC', 'C', 'D') NOT NULL,
  \`kategori_predikat\` VARCHAR(50) NOT NULL,
  \`catatan_evaluasi_umum\` TEXT,
  \`rekomendasi_perbaikan\` JSON,
  \`file_lhe_pdf\` VARCHAR(255),
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`opd_id\`) REFERENCES \`opd\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ========================================================
-- DATA SEEDER AWAL
-- ========================================================

-- Insert OPD
INSERT INTO \`opd\` (\`id\`, \`kode\`, \`nama\`, \`kepala_opd\`, \`nip_kepala\`, \`telepon\`, \`email\`) VALUES
('opd-bappeda', '1.01.01', 'Badan Perencanaan Pembangunan Daerah (BAPPEDA)', 'Dr. Ir. H. Bambang Sudarsono, M.Si', '197103151996031002', '(021) 5543210', 'bappeda@pemda.go.id'),
('opd-dinkes', '1.02.01', 'Dinas Kesehatan (DINKES)', 'dr. Hj. Siti Rahmawati, Sp.A, M.Kes', '197508202002122001', '(021) 5543211', 'dinkes@pemda.go.id'),
('opd-disdik', '1.03.01', 'Dinas Pendidikan dan Kebudayaan (DISDIK)', 'Drs. H. Mulyadi Kartasasmita, M.Pd', '196805121993031005', '(021) 5543212', 'disdik@pemda.go.id'),
('opd-pupr', '1.04.01', 'Dinas Pekerjaan Umum dan Penataan Ruang (PUPR)', 'Ir. Hendra Gunawan, S.T., M.T.', '197311041999031003', '(021) 5543213', 'pupr@pemda.go.id'),
('opd-inspektorat', '1.05.01', 'Inspektorat Daerah', 'H. Agus Priyanto, S.H., M.Hum', '196904101994031001', '(021) 5543214', 'inspektorat@pemda.go.id');

-- Insert Users (Password default 'password123')
INSERT INTO \`users\` (\`id\`, \`username\`, \`password\`, \`name\`, \`nip\`, \`email\`, \`role\`, \`opd_id\`, \`status\`) VALUES
('usr-admin', 'admin', 'password123', 'Supriyadi Pratama, S.Kom', '198801102011011003', 'admin.sakip@pemda.go.id', 'administrator', NULL, 'Aktif'),
('usr-op-bappeda', 'operator_bappeda', 'password123', 'Anisa Maharani, S.AP', '199204152015022001', 'operator.bappeda@pemda.go.id', 'operator_unit', 'opd-bappeda', 'Aktif'),
('usr-op-dinkes', 'operator_dinkes', 'password123', 'Bayu Kurniawan, S.Kep', '199009182014031002', 'operator.dinkes@pemda.go.id', 'operator_unit', 'opd-dinkes', 'Aktif'),
('usr-validator', 'validator_sakip', 'password123', 'Drs. Eko Prasetyo, M.AP', '197906142005011004', 'validator.sakip@pemda.go.id', 'validator', NULL, 'Aktif'),
('usr-verifikator', 'evaluator_inspektorat', 'password123', 'Ratna Wulandari, S.E., Ak., CA', '198402282008012007', 'evaluator@inspektorat.pemda.go.id', 'verifikator', 'opd-inspektorat', 'Aktif');

-- Insert Bobot SAKIP
INSERT INTO \`bobot_sakip\` (\`tahun\`, \`perencanaan_kinerja\`, \`pengukuran_kinerja\`, \`pelaporan_kinerja\`, \`evaluasi_akip_internal\`, \`capaian_kinerja\`) VALUES
(2025, 30.00, 30.00, 15.00, 10.00, 15.00);

-- Insert Indikator PK
INSERT INTO \`indikator_pk\` (\`id\`, \`opd_id\`, \`tahun\`, \`sasaran_strategis\`, \`nama_indikator\`, \`tipe_indikator\`, \`formula\`, \`satuan\`, \`polarisasi\`, \`target_tahunan\`, \`target_t1\`, \`target_t2\`, \`target_t3\`, \`target_t4\`, \`pagu_anggaran\`, \`penanggung_jawab\`) VALUES
('ind-2025-001', 'opd-bappeda', 2025, 'Meningkatnya Kualitas Perencanaan Pembangunan Daerah', 'Persentase Keselarasan Dokumen RKPD dengan RPJMD', 'IKU', '(Jumlah Program Selaras / Total Program) * 100%', '%', 'Maximize', 95.00, 20.00, 50.00, 75.00, 95.00, 850000000.00, 'Bidang Perencanaan Makro'),
('ind-2025-002', 'opd-bappeda', 2025, 'Meningkatnya Kualitas Perencanaan Pembangunan Daerah', 'Tingkat Konsistensi Program Renja Perangkat Daerah', 'IKU', '(Program Renja Konsisten / Total Program Renstra) * 100%', '%', 'Maximize', 90.00, 25.00, 50.00, 75.00, 90.00, 620000000.00, 'Bidang Pengendalian & Evaluasi'),
('ind-2025-003', 'opd-dinkes', 2025, 'Meningkatnya Derajat Kesehatan Masyarakat', 'Prevalensi Stunting pada Balita', 'IKU', '(Jumlah Balita Stunting / Total Balita Diukur) * 100%', '%', 'Minimize', 12.50, 14.00, 13.50, 13.00, 12.50, 4200000000.00, 'Bidang Kesmas'),
('ind-2025-004', 'opd-disdik', 2025, 'Meningkatnya Akses dan Mutu Pendidikan Formal', 'Rata-rata Lama Sekolah (RLS)', 'IKU', 'Metode Perhitungan BPS (Tahun)', 'Tahun', 'Maximize', 9.80, 9.40, 9.55, 9.70, 9.80, 12500000000.00, 'Bidang Pembinaan SMP & Dikdas');

-- Insert Capaian Triwulan
INSERT INTO \`capaian_triwulan\` (\`indikator_id\`, \`tahun\`, \`triwulan\`, \`target_tw\`, \`realisasi_tw\`, \`persen_capaian\`, \`status_warna\`, \`faktor_pendorong\`, \`faktor_penghambat\`, \`rencana_tindak_lanjut\`) VALUES
('ind-2025-001', 2025, 1, 20.00, 22.00, 110.00, 'hijau', 'Koordinasi aktif antar Bappeda dan OPD teknis terlaksana sebelum Musrenbang.', 'Beberapa OPD terlambat menyerahkan rancangan awal Renja.', 'Mempercepat asistensi penyusunan RKPD melalui desk terpadu.'),
('ind-2025-001', 2025, 2, 50.00, 52.50, 105.00, 'hijau', 'Integrasi SIPD-RI mempermudah monitoring keselarasan sub-kegiatan.', 'Sinkronisasi nomenklatur Kemendagri memerlukan penyesuaian berkala.', 'Finalisasi penetapan Perkada RKPD tepat waktu.'),
('ind-2025-003', 2025, 1, 14.00, 13.80, 101.45, 'hijau', 'Distribusi Pemberian Makanan Tambahan (PMT) tepat sasaran di seluruh Puskesmas.', 'Cakupan e-PPGBM belum mencapai 100% balita di daerah terpencil.', 'Grebek stunting serentak pada posyandu binaan.'),
('ind-2025-004', 2025, 1, 9.40, 7.80, 82.98, 'kuning', 'Bantuan operasional sekolah tersalurkan tepat waktu.', 'Tingkat drop-out anak usia SMP di wilayah pedesaan masih terjadi.', 'Program kejar paket dan pendampingan siswa rentan putus sekolah.');

-- Insert LHE Evaluasi
INSERT INTO \`lhe_evaluasi\` (\`id\`, \`nomor_surat_lhe\`, \`opd_id\`, \`tahun\`, \`tanggal_terbit\`, \`evaluator_nama\`, \`evaluator_nip\`, \`nilai_total\`, \`predikat\`, \`kategori_predikat\`, \`catatan_evaluasi_umum\`, \`rekomendasi_perbaikan\`) VALUES
('lhe-2025-bappeda', 'LHE.700/041/INSP/SAKIP/2025', 'opd-bappeda', 2025, '2025-06-15', 'Ratna Wulandari, S.E., Ak., CA', '198402282008012007', 84.50, 'A', 'Memuaskan', 'Perencanaan kinerja BAPPEDA sangat matang, penjabaran pohon kinerja (cascading) dari Eselon II hingga Pelaksana telah selaras dengan target RPJMD. Pelaporan triwulanan dilaksanakan secara konsisten.', '["Menyempurnakan formula manual indikator pada level staf pelaksana agar lebih terukur kuantitatif.", "Memaksimalkan pemanfaatan hasil evaluasi internal untuk revisi alokasi pagu anggaran tahun berikutnya.", "Mengintegrasikan pelaporan bukti dukung digital secara realtime pada aplikasi SAKIP."]');
`
  },
  {
    filename: 'index.php',
    path: 'index.php',
    category: 'core',
    description: 'Routing Utama & Dashboard Launcher',
    content: `<?php
/**
 * E-SAKIP - Aplikasi Sistem Akuntabilitas Kinerja Instansi Pemerintah
 * Entry Point & Router
 */
session_start();

if (!isset($_SESSION['user'])) {
    header('Location: login.php');
    exit;
}

header('Location: dashboard.php');
exit;
`
  },
  {
    filename: 'login.php',
    path: 'login.php',
    category: 'auth',
    description: 'Halaman Login Multi-Role (Admin, Operator, Validator, Verifikator) dengan Tombol Demo Cepat',
    content: `<?php
/**
 * Halaman Login Multi-Role SAKIP
 */
session_start();
require_once 'config/database.php';

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = trim($_POST['password'] ?? '');

    if (empty($username) || empty($password)) {
        $error = 'Username dan Password wajib diisi!';
    } else {
        $stmt = $pdo->prepare("SELECT u.*, o.nama as opd_nama, o.kode as opd_kode FROM users u LEFT JOIN opd o ON u.opd_id = o.id WHERE u.username = ? AND u.status = 'Aktif' LIMIT 1");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if ($user && ($password === $user['password'] || password_verify($password, $user['password']))) {
            $_SESSION['user'] = [
                'id' => $user['id'],
                'username' => $user['username'],
                'name' => $user['name'],
                'nip' => $user['nip'],
                'email' => $user['email'],
                'role' => $user['role'],
                'opd_id' => $user['opd_id'],
                'opd_nama' => $user['opd_nama'],
                'opd_kode' => $user['opd_kode']
            ];
            header('Location: dashboard.php');
            exit;
        } else {
            $error = 'Username atau Password salah, atau akun nonaktif!';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - E-SAKIP Pemerintah Daerah</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>body { font-family: 'Plus Jakarta Sans', sans-serif; }</style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8">
        <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 shadow-lg shadow-blue-500/30 mb-4">
                <span class="text-2xl font-black text-white">S</span>
            </div>
            <h1 class="text-2xl font-bold text-white tracking-tight">E-SAKIP PEMDA</h1>
            <p class="text-xs text-slate-400 mt-1">Sistem Akuntabilitas Kinerja Instansi Pemerintah</p>
        </div>

        <?php if (!empty($error)): ?>
            <div class="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-medium">
                <?= htmlspecialchars($error) ?>
            </div>
        <?php endif; ?>

        <form method="POST" action="login.php" class="space-y-4">
            <div>
                <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Username</label>
                <input type="text" name="username" required placeholder="Masukkan username"
                    class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500">
            </div>
            <div>
                <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Password</label>
                <input type="password" name="password" required placeholder="Masukkan password"
                    class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500">
            </div>
            <button type="submit" class="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-600/30">
                Masuk ke Aplikasi
            </button>
        </form>

        <div class="mt-8 pt-6 border-t border-slate-800">
            <p class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3 text-center">Akun Cepat (Klik untuk Coba)</p>
            <div class="grid grid-cols-2 gap-2 text-xs">
                <button onclick="setCreds('admin', 'password123')" class="p-2.5 bg-slate-800/80 hover:bg-slate-800 rounded-lg text-left border border-slate-700/60">
                    <p class="font-bold text-blue-400">1. Administrator</p>
                    <p class="text-[10px] text-slate-400">User: admin</p>
                </button>
                <button onclick="setCreds('operator_bappeda', 'password123')" class="p-2.5 bg-slate-800/80 hover:bg-slate-800 rounded-lg text-left border border-slate-700/60">
                    <p class="font-bold text-emerald-400">2. Operator OPD</p>
                    <p class="text-[10px] text-slate-400">User: operator_bappeda</p>
                </button>
                <button onclick="setCreds('validator_sakip', 'password123')" class="p-2.5 bg-slate-800/80 hover:bg-slate-800 rounded-lg text-left border border-slate-700/60">
                    <p class="font-bold text-amber-400">3. Validator</p>
                    <p class="text-[10px] text-slate-400">User: validator_sakip</p>
                </button>
                <button onclick="setCreds('evaluator_inspektorat', 'password123')" class="p-2.5 bg-slate-800/80 hover:bg-slate-800 rounded-lg text-left border border-slate-700/60">
                    <p class="font-bold text-purple-400">4. Verifikator</p>
                    <p class="text-[10px] text-slate-400">User: evaluator_inspektorat</p>
                </button>
            </div>
        </div>
    </div>
    <script>
        function setCreds(u, p) {
            document.querySelector('input[name="username"]').value = u;
            document.querySelector('input[name="password"]').value = p;
        }
    </script>
</body>
</html>
`
  },
  {
    filename: 'logout.php',
    path: 'logout.php',
    category: 'auth',
    description: 'Skrip Logout & Destroy Session',
    content: `<?php
session_start();
session_unset();
session_destroy();
header('Location: login.php');
exit;
`
  },
  {
    filename: 'header.php',
    path: 'includes/header.php',
    category: 'views',
    description: 'Header Layout & Navigasi Atas',
    content: `<?php
if (!isset($_SESSION['user'])) {
    header('Location: login.php');
    exit;
}
$currentUser = $_SESSION['user'];
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>E-SAKIP - Sistem Akuntabilitas Kinerja Instansi Pemerintah</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
    </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex antialiased">
    <!-- Sidebar Kiri -->
    <?php require_once __DIR__ . '/sidebar.php'; ?>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header class="h-16 bg-slate-900/80 backdrop-blur border-b border-slate-800 px-6 flex items-center justify-between z-10">
            <div class="flex items-center gap-3">
                <span class="text-xs text-slate-400">Tahun Anggaran:</span>
                <span class="px-2.5 py-1 bg-slate-800 border border-slate-700 text-blue-400 font-bold rounded-lg text-xs">2025</span>
                <?php if (!empty($currentUser['opd_nama'])): ?>
                    <span class="text-xs px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg border border-slate-700 truncate max-w-xs">
                        <?= htmlspecialchars($currentUser['opd_nama']) ?>
                    </span>
                <?php endif; ?>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex items-center gap-2 text-xs text-emerald-400 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Online MySQL PDO</span>
                </div>
                <a href="logout.php" class="text-xs px-3 py-1.5 bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white border border-rose-500/30 rounded-lg transition-all">
                    Keluar
                </a>
            </div>
        </header>
        <main class="flex-1 overflow-y-auto p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
`
  },
  {
    filename: 'sidebar.php',
    path: 'includes/sidebar.php',
    category: 'views',
    description: 'Menu Navigasi Samping (Sidebar) Berdasarkan Peran Pengguna',
    content: `<?php
$currentPage = basename($_SERVER['PHP_SELF']);
$role = $currentUser['role'] ?? 'operator_unit';
?>
<aside class="w-64 bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0">
    <div class="p-5 border-b border-slate-800 flex items-center gap-3">
        <div class="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
            <span class="font-black text-white text-lg">S</span>
        </div>
        <div>
            <h1 class="font-bold text-base text-white tracking-tight">E-SAKIP PEMDA</h1>
            <p class="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">T.A. 2025</p>
        </div>
    </div>

    <!-- User Profile Badge -->
    <div class="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm">
            <?= strtoupper(substr($currentUser['name'] ?? 'U', 0, 2)) ?>
        </div>
        <div class="min-w-0 flex-1">
            <p class="text-xs font-bold text-white truncate"><?= htmlspecialchars($currentUser['name'] ?? '') ?></p>
            <span class="inline-block text-[10px] font-semibold text-blue-400 capitalize px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded">
                <?= str_replace('_', ' ', $currentUser['role'] ?? '') ?>
            </span>
        </div>
    </div>

    <!-- Navigation Menu -->
    <nav class="flex-1 p-3 space-y-1 overflow-y-auto text-xs font-medium">
        <a href="dashboard.php" class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all <?= $currentPage === 'dashboard.php' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/60' ?>">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            <span>Dashboard</span>
        </a>

        <?php if ($role === 'administrator'): ?>
            <div class="pt-3 pb-1 px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">Master Data</div>
            <a href="master_opd.php" class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all <?= $currentPage === 'master_opd.php' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/60' ?>">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                <span>Master OPD</span>
            </a>
            <a href="master_users.php" class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all <?= $currentPage === 'master_users.php' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/60' ?>">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                <span>Master Pengguna</span>
            </a>
            <a href="pengaturan_kinerja.php" class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all <?= $currentPage === 'pengaturan_kinerja.php' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/60' ?>">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/></svg>
                <span>Pengaturan Bobot SAKIP</span>
            </a>
        <?php endif; ?>

        <div class="pt-3 pb-1 px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">Perencanaan & Target</div>
        <a href="master_renstra.php" class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all <?= $currentPage === 'master_renstra.php' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/60' ?>">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            <span>Master Renstra</span>
        </a>
        <a href="input_indikator.php" class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all <?= $currentPage === 'input_indikator.php' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/60' ?>">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span>Input Indikator & Target PK</span>
        </a>

        <div class="pt-3 pb-1 px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">Pelaksanaan & Capaian</div>
        <a href="capaian_bulanan.php" class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all <?= $currentPage === 'capaian_bulanan.php' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/60' ?>">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            <span>Capaian Bulanan</span>
        </a>
        <a href="capaian_triwulan.php" class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all <?= $currentPage === 'capaian_triwulan.php' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/60' ?>">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/></svg>
            <span>Capaian Triwulan</span>
        </a>

        <div class="pt-3 pb-1 px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">Evaluasi AKIP</div>
        <a href="lhe_evaluasi.php" class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all <?= $currentPage === 'lhe_evaluasi.php' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/60' ?>">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            <span>LHE (Laporan Hasil Evaluasi)</span>
        </a>
    </nav>
</aside>
`
  },
  {
    filename: 'footer.php',
    path: 'includes/footer.php',
    category: 'views',
    description: 'Footer Template',
    content: `        </main>
    </div>
</body>
</html>
`
  },
  {
    filename: 'dashboard.php',
    path: 'dashboard.php',
    category: 'views',
    description: 'Halaman Dashboard Utama dengan Ringkasan Statistik & Predikat SAKIP',
    content: `<?php
session_start();
require_once 'config/database.php';
require_once 'includes/header.php';

// Ambil Ringkasan Data
$totalOPD = $pdo->query("SELECT COUNT(*) FROM opd")->fetchColumn();
$totalIndikator = $pdo->query("SELECT COUNT(*) FROM indikator_pk")->fetchColumn();
$totalLhe = $pdo->query("SELECT COUNT(*) FROM lhe_evaluasi")->fetchColumn();

// Rata-rata Capaian Triwulan
$avgCapaian = $pdo->query("SELECT AVG(persen_capaian) FROM capaian_triwulan")->fetchColumn() ?: 0;
?>

<div class="max-w-7xl mx-auto space-y-6">
    <!-- Header Page -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h2 class="text-2xl font-bold text-white tracking-tight">Dashboard Akuntabilitas Kinerja</h2>
            <p class="text-xs text-slate-400 mt-1">Monitoring & Evaluasi SAKIP Pemerintah Daerah Tahun 2025</p>
        </div>
        <div class="flex items-center gap-2">
            <a href="capaian_triwulan.php" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all">
                Monitoring Triwulan
            </a>
            <a href="lhe_evaluasi.php" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all">
                Daftar LHE
            </a>
        </div>
    </div>

    <!-- 4 Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <span class="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Perangkat Daerah</span>
            <div class="flex items-baseline justify-between mt-2">
                <span class="text-3xl font-black text-white"><?= $totalOPD ?></span>
                <span class="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">OPD Aktif</span>
            </div>
            <div class="w-full bg-slate-800 h-1 rounded-full mt-3"><div class="w-full bg-blue-500 h-1 rounded-full"></div></div>
        </div>

        <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <span class="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Indikator PK</span>
            <div class="flex items-baseline justify-between mt-2">
                <span class="text-3xl font-black text-white"><?= $totalIndikator ?></span>
                <span class="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">IKU / IKP</span>
            </div>
            <div class="w-full bg-slate-800 h-1 rounded-full mt-3"><div class="w-full bg-emerald-500 h-1 rounded-full"></div></div>
        </div>

        <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <span class="text-slate-400 text-xs font-semibold uppercase tracking-wider">Rata-rata Capaian TW</span>
            <div class="flex items-baseline justify-between mt-2">
                <span class="text-3xl font-black text-white"><?= number_format($avgCapaian, 1) ?>%</span>
                <span class="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">Semua OPD</span>
            </div>
            <div class="w-full bg-slate-800 h-1 rounded-full mt-3"><div class="w-[<?= min(100, $avgCapaian) ?>%] bg-amber-500 h-1 rounded-full"></div></div>
        </div>

        <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <span class="text-slate-400 text-xs font-semibold uppercase tracking-wider">LHE Terbit (Inspektorat)</span>
            <div class="flex items-baseline justify-between mt-2">
                <span class="text-3xl font-black text-white"><?= $totalLhe ?></span>
                <span class="text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">Dokumen</span>
            </div>
            <div class="w-full bg-slate-800 h-1 rounded-full mt-3"><div class="w-full bg-purple-500 h-1 rounded-full"></div></div>
        </div>
    </div>

    <!-- 5 Komponen SAKIP Overview -->
    <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 class="text-sm font-bold text-white uppercase tracking-wider mb-4">5 Komponen Evaluasi SAKIP (PermenPAN-RB No. 88/2021)</h3>
        <div class="grid grid-cols-1 md:grid-cols-5 gap-3 text-center">
            <div class="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
                <p class="text-xs text-slate-400">1. Perencanaan Kinerja</p>
                <p class="text-2xl font-black text-blue-400 mt-1">30%</p>
            </div>
            <div class="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
                <p class="text-xs text-slate-400">2. Pengukuran Kinerja</p>
                <p class="text-2xl font-black text-emerald-400 mt-1">30%</p>
            </div>
            <div class="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
                <p class="text-xs text-slate-400">3. Pelaporan Kinerja</p>
                <p class="text-2xl font-black text-purple-400 mt-1">15%</p>
            </div>
            <div class="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
                <p class="text-xs text-slate-400">4. Evaluasi Akuntabilitas</p>
                <p class="text-2xl font-black text-amber-400 mt-1">10%</p>
            </div>
            <div class="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
                <p class="text-xs text-slate-400">5. Capaian Kinerja</p>
                <p class="text-2xl font-black text-rose-400 mt-1">15%</p>
            </div>
        </div>
    </div>
</div>

<?php require_once 'includes/footer.php'; ?>
`
  },
  {
    filename: 'capaian_triwulan.php',
    path: 'capaian_triwulan.php',
    category: 'views',
    description: 'Matriks Capaian Kinerja Triwulanan dengan Otomatisasi Status Warna (🟢 Hijau ≥100%, 🟡 Kuning 50-99%, 🔴 Merah <50%)',
    content: `<?php
session_start();
require_once 'config/database.php';
require_once 'includes/header.php';

$selectedTw = isset($_GET['tw']) ? (int)$_GET['tw'] : 1;
$selectedOpd = isset($_GET['opd_id']) ? $_GET['opd_id'] : '';

// Handle OPD filter untuk operator_unit
if ($currentUser['role'] === 'operator_unit' && $currentUser['opd_id']) {
    $selectedOpd = $currentUser['opd_id'];
}

// Ambil list OPD
$opdList = $pdo->query("SELECT * FROM opd ORDER BY kode ASC")->fetchAll();

// Query Data Triwulan
$sql = "SELECT ct.*, ipk.nama_indikator, ipk.satuan, ipk.polarisasi, o.nama as opd_nama 
        FROM capaian_triwulan ct
        JOIN indikator_pk ipk ON ct.indikator_id = ipk.id
        JOIN opd o ON ipk.opd_id = o.id
        WHERE ct.triwulan = ?";
$params = [$selectedTw];

if (!empty($selectedOpd)) {
    $sql .= " AND ipk.opd_id = ?";
    $params[] = $selectedOpd;
}

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$rows = $stmt->fetchAll();
?>

<div class="max-w-7xl mx-auto space-y-6">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h2 class="text-2xl font-bold text-white tracking-tight">Capaian Kinerja Triwulan</h2>
            <p class="text-xs text-slate-400 mt-1">Rekapitulasi target, realisasi, dan indikator warna otomatis</p>
        </div>
        
        <!-- Legend Status Warna -->
        <div class="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-xs">
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span> Hijau (≥100%)</span>
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50"></span> Kuning (50-99%)</span>
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50"></span> Merah (<50%)</span>
        </div>
    </div>

    <!-- Filter Form -->
    <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center gap-4">
        <form method="GET" class="flex flex-wrap items-center gap-3 w-full">
            <div>
                <label class="text-[10px] uppercase font-bold text-slate-400 block mb-1">Pilih Triwulan</label>
                <select name="tw" onchange="this.form.submit()" class="bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500">
                    <option value="1" <?= $selectedTw === 1 ? 'selected' : '' ?>>Triwulan I (Jan - Mar)</option>
                    <option value="2" <?= $selectedTw === 2 ? 'selected' : '' ?>>Triwulan II (Apr - Jun)</option>
                    <option value="3" <?= $selectedTw === 3 ? 'selected' : '' ?>>Triwulan III (Jul - Sep)</option>
                    <option value="4" <?= $selectedTw === 4 ? 'selected' : '' ?>>Triwulan IV (Okt - Des)</option>
                </select>
            </div>

            <?php if ($currentUser['role'] !== 'operator_unit'): ?>
            <div>
                <label class="text-[10px] uppercase font-bold text-slate-400 block mb-1">Filter Perangkat Daerah</label>
                <select name="opd_id" onchange="this.form.submit()" class="bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500">
                    <option value="">-- Semua Perangkat Daerah --</option>
                    <?php foreach ($opdList as $o): ?>
                        <option value="<?= $o['id'] ?>" <?= $selectedOpd === $o['id'] ? 'selected' : '' ?>><?= htmlspecialchars($o['nama']) ?></option>
                    <?php endforeach; ?>
                </select>
            </div>
            <?php endif; ?>
        </form>
    </div>

    <!-- Data Table -->
    <div class="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
                <thead class="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                    <tr>
                        <th class="px-5 py-3.5">Perangkat Daerah & Indikator</th>
                        <th class="px-4 py-3.5 text-center">Target TW</th>
                        <th class="px-4 py-3.5 text-center">Realisasi TW</th>
                        <th class="px-4 py-3.5 text-center">Capaian (%)</th>
                        <th class="px-4 py-3.5 text-center">Status Warna</th>
                        <th class="px-5 py-3.5">Faktor Pendorong & Tindak Lanjut</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/60">
                    <?php if (empty($rows)): ?>
                        <tr>
                            <td colspan="6" class="px-5 py-8 text-center text-slate-500">Belum ada data capaian triwulan untuk filter ini.</td>
                        </tr>
                    <?php else: ?>
                        <?php foreach ($rows as $row): 
                            $capaian = (float)$row['persen_capaian'];
                            // Kalkulasi otomatis status warna
                            if ($capaian >= 100) {
                                $badgeClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
                                $colorText = '🟢 HIJAU (Tercapai)';
                            } elseif ($capaian >= 50) {
                                $badgeClass = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
                                $colorText = '🟡 KUNING (Perhatian)';
                            } else {
                                $badgeClass = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
                                $colorText = '🔴 MERAH (Kritis)';
                            }
                        ?>
                        <tr class="hover:bg-slate-800/30">
                            <td class="px-5 py-4">
                                <p class="font-bold text-white text-sm"><?= htmlspecialchars($row['nama_indikator']) ?></p>
                                <p class="text-[11px] text-slate-400 mt-0.5"><?= htmlspecialchars($row['opd_nama']) ?> (Satuan: <?= htmlspecialchars($row['satuan']) ?>)</p>
                            </td>
                            <td class="px-4 py-4 text-center font-mono font-semibold"><?= number_format($row['target_tw'], 2) ?></td>
                            <td class="px-4 py-4 text-center font-mono font-semibold text-blue-400"><?= number_format($row['realisasi_tw'], 2) ?></td>
                            <td class="px-4 py-4 text-center">
                                <span class="inline-block px-2.5 py-1 rounded-lg font-mono font-bold border <?= $badgeClass ?>">
                                    <?= number_format($row['persen_capaian'], 2) ?>%
                                </span>
                            </td>
                            <td class="px-4 py-4 text-center font-semibold text-xs">
                                <?= $colorText ?>
                            </td>
                            <td class="px-5 py-4 space-y-1 text-slate-300">
                                <?php if (!empty($row['faktor_pendorong'])): ?>
                                    <p><strong class="text-emerald-400">Pendorong:</strong> <?= htmlspecialchars($row['faktor_pendorong']) ?></p>
                                <?php endif; ?>
                                <?php if (!empty($row['rencana_tindak_lanjut'])): ?>
                                    <p><strong class="text-blue-400">Tindak Lanjut:</strong> <?= htmlspecialchars($row['rencana_tindak_lanjut']) ?></p>
                                <?php endif; ?>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<?php require_once 'includes/footer.php'; ?>
`
  },
  {
    filename: 'lhe_evaluasi.php',
    path: 'lhe_evaluasi.php',
    category: 'views',
    description: 'Modul LHE dengan Penilaian 1/0, Upload/Edit/Hapus, Catatan Evaluator & Cetak Resmi',
    content: `<?php
session_start();
require_once 'config/database.php';
require_once 'includes/header.php';

// Ambil Daftar LHE
$stmt = $pdo->query("SELECT lhe.*, o.nama as opd_nama, o.kode as opd_kode 
                     FROM lhe_evaluasi lhe
                     JOIN opd o ON lhe.opd_id = o.id
                     ORDER BY lhe.created_at DESC");
$lheList = $stmt->fetchAll();
?>

<div class="max-w-7xl mx-auto space-y-6">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h2 class="text-2xl font-bold text-white tracking-tight">Laporan Hasil Evaluasi (LHE) AKIP</h2>
            <p class="text-xs text-slate-400 mt-1">Evaluasi Akuntabilitas Kinerja Instansi Pemerintah oleh Inspektorat</p>
        </div>
        <div class="flex items-center gap-2">
            <button onclick="alert('Formulir Evaluasi AKIP Baru')" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all">
                + Buat Evaluasi Baru (Skor 1/0)
            </button>
        </div>
    </div>

    <!-- Data LHE -->
    <div class="grid grid-cols-1 gap-4">
        <?php foreach ($lheList as $lhe): 
            $rekomendasi = json_decode($lhe['rekomendasi_perbaikan'], true) ?: [];
        ?>
        <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                    <span class="text-[10px] font-mono font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded border border-blue-500/20">
                        <?= htmlspecialchars($lhe['nomor_surat_lhe']) ?>
                    </span>
                    <h3 class="text-lg font-bold text-white mt-2"><?= htmlspecialchars($lhe['opd_nama']) ?></h3>
                    <p class="text-xs text-slate-400">Evaluator: <?= htmlspecialchars($lhe['evaluator_nama']) ?> (NIP: <?= htmlspecialchars($lhe['evaluator_nip']) ?>)</p>
                </div>
                <div class="flex items-center gap-3">
                    <div class="text-right">
                        <span class="text-3xl font-black text-emerald-400"><?= number_format($lhe['nilai_total'], 2) ?></span>
                        <p class="text-xs font-bold text-slate-300">Predikat: <?= htmlspecialchars($lhe['predikat']) ?> (<?= htmlspecialchars($lhe['kategori_predikat']) ?>)</p>
                    </div>
                    <a href="cetak_lhe.php?id=<?= $lhe['id'] ?>" target="_blank" class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold">
                        Cetak LHE Resmi
                    </a>
                </div>
            </div>

            <!-- Catatan & Rekomendasi -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div class="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                    <h4 class="font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-2 text-amber-400">Catatan Evaluasi Umum</h4>
                    <p class="text-slate-300 leading-relaxed"><?= htmlspecialchars($lhe['catatan_evaluasi_umum']) ?></p>
                </div>
                <div class="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                    <h4 class="font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-2 text-emerald-400">Rekomendasi Perbaikan</h4>
                    <ul class="list-disc list-inside space-y-1.5 text-slate-300">
                        <?php foreach ($rekomendasi as $rek): ?>
                            <li><?= htmlspecialchars($rek) ?></li>
                        <?php endforeach; ?>
                    </ul>
                </div>
            </div>
        </div>
        <?php endforeach; ?>
    </div>
</div>

<?php require_once 'includes/footer.php'; ?>
`
  },
  {
    filename: 'cetak_lhe.php',
    path: 'cetak_lhe.php',
    category: 'views',
    description: 'Format Pratinjau & Cetak Dokumen LHE Resmi Ber-Kop Surat Pemda',
    content: `<?php
session_start();
require_once 'config/database.php';

$id = $_GET['id'] ?? '';
$stmt = $pdo->prepare("SELECT lhe.*, o.nama as opd_nama, o.kode as opd_kode, o.kepala_opd, o.nip_kepala 
                       FROM lhe_evaluasi lhe
                       JOIN opd o ON lhe.opd_id = o.id
                       WHERE lhe.id = ? LIMIT 1");
$stmt->execute([$id]);
$lhe = $stmt->fetch();

if (!$lhe) {
    die("Dokumen LHE tidak ditemukan!");
}
$rekomendasi = json_decode($lhe['rekomendasi_perbaikan'], true) ?: [];
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Cetak LHE - <?= htmlspecialchars($lhe['nomor_surat_lhe']) ?></title>
    <style>
        body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; margin: 40px; color: #000; }
        .kop-surat { text-align: center; border-bottom: 3px double #000; padding-bottom: 12px; margin-bottom: 24px; }
        .kop-surat h2 { margin: 0; font-size: 14pt; text-transform: uppercase; font-weight: bold; }
        .kop-surat h1 { margin: 4px 0; font-size: 16pt; font-weight: bold; }
        .kop-surat p { margin: 2px 0; font-size: 10pt; }
        table.nilai { width: 100%; border-collapse: collapse; margin: 16px 0; }
        table.nilai th, table.nilai td { border: 1px solid #000; padding: 6px 10px; text-align: left; }
        table.nilai th { background-color: #f2f2f2; text-align: center; }
        .ttd { width: 100%; margin-top: 40px; }
        .ttd td { text-align: center; width: 50%; vertical-align: top; }
        @media print {
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="no-print" style="margin-bottom: 20px; text-align: right;">
        <button onclick="window.print()" style="padding: 8px 16px; background: #0284c7; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
            🖨️ Cetak / Simpan PDF
        </button>
    </div>

    <div class="kop-surat">
        <h2>Pemerintah Daerah Provinsi / Kabupaten / Kota</h2>
        <h1>INSPEKTORAT DAERAH</h1>
        <p>Jl. Pembangunan No. 01 Kompleks Perkantoran Pemerintah Daerah | Telp: (021) 5543214</p>
    </div>

    <div style="text-align: center; margin-bottom: 20px;">
        <h3 style="margin: 0; text-decoration: underline;">LAPORAN HASIL EVALUASI AKIP (LHE)</h3>
        <p style="margin: 4px 0; font-size: 11pt;">Nomor: <?= htmlspecialchars($lhe['nomor_surat_lhe']) ?></p>
    </div>

    <p>Berdasarkan hasil evaluasi atas Sistem Akuntabilitas Kinerja Instansi Pemerintah (SAKIP) Tahun 2025 pada:</p>
    <table style="width: 100%; margin-bottom: 16px;">
        <tr><td style="width: 25%;">Perangkat Daerah</td><td>: <b><?= htmlspecialchars($lhe['opd_nama']) ?></b></td></tr>
        <tr><td>Kepala OPD</td><td>: <?= htmlspecialchars($lhe['kepala_opd']) ?> (NIP. <?= htmlspecialchars($lhe['nip_kepala']) ?>)</td></tr>
        <tr><td>Tanggal Evaluasi</td><td>: <?= htmlspecialchars($lhe['tanggal_terbit']) ?></td></tr>
    </table>

    <table class="nilai">
        <thead>
            <tr>
                <th style="width: 8%;">No</th>
                <th>Komponen Evaluasi SAKIP</th>
                <th style="width: 15%;">Bobot</th>
                <th style="width: 15%;">Hasil Evaluasi</th>
            </tr>
        </thead>
        <tbody>
            <tr><td style="text-align:center;">1</td><td>Perencanaan Kinerja</td><td style="text-align:center;">30.00%</td><td style="text-align:center;">Memenuhi</td></tr>
            <tr><td style="text-align:center;">2</td><td>Pengukuran Kinerja</td><td style="text-align:center;">30.00%</td><td style="text-align:center;">Memenuhi</td></tr>
            <tr><td style="text-align:center;">3</td><td>Pelaporan Kinerja</td><td style="text-align:center;">15.00%</td><td style="text-align:center;">Memenuhi</td></tr>
            <tr><td style="text-align:center;">4</td><td>Evaluasi Akuntabilitas Kinerja Internal</td><td style="text-align:center;">10.00%</td><td style="text-align:center;">Memenuhi</td></tr>
            <tr><td style="text-align:center;">5</td><td>Capaian Kinerja</td><td style="text-align:center;">15.00%</td><td style="text-align:center;">Memenuhi</td></tr>
            <tr style="font-weight: bold; background: #fafafa;">
                <td colspan="2" style="text-align: center;">NILAI AKHIR AKIP & PREDIKAT</td>
                <td colspan="2" style="text-align: center; font-size: 14pt;"><?= number_format($lhe['nilai_total'], 2) ?> (<?= htmlspecialchars($lhe['predikat']) ?> - <?= htmlspecialchars($lhe['kategori_predikat']) ?>)</td>
            </tr>
        </tbody>
    </table>

    <h4>A. Catatan Evaluator:</h4>
    <p style="text-align: justify; line-height: 1.5;"><?= htmlspecialchars($lhe['catatan_evaluasi_umum']) ?></p>

    <h4>B. Rekomendasi Tindak Lanjut:</h4>
    <ol style="line-height: 1.5;">
        <?php foreach ($rekomendasi as $r): ?>
            <li><?= htmlspecialchars($r) ?></li>
        <?php endforeach; ?>
    </ol>

    <table class="ttd">
        <tr>
            <td>
                Mengetahui,<br>
                Kepala Perangkat Daerah,<br><br><br><br>
                <b><u><?= htmlspecialchars($lhe['kepala_opd']) ?></u></b><br>
                NIP. <?= htmlspecialchars($lhe['nip_kepala']) ?>
            </td>
            <td>
                Inspektur Pembantu / Evaluator AKIP,<br><br><br><br><br>
                <b><u><?= htmlspecialchars($lhe['evaluator_nama']) ?></u></b><br>
                NIP. <?= htmlspecialchars($lhe['evaluator_nip']) ?>
            </td>
        </tr>
    </table>
</body>
</html>
`
  },
  {
    filename: 'PANDUAN_INSTALL_XAMPP.txt',
    path: 'PANDUAN_INSTALL_XAMPP.txt',
    category: 'docs',
    description: 'Panduan Praktis Langkah demi Langkah Menjalankan Aplikasi di XAMPP',
    content: `================================================================================
PANDUAN LENGKAP INSTALASI & MENJALANKAN E-SAKIP DI XAMPP
================================================================================

1. PERSIAPAN FOLDER XAMPP
   - Buka direktori instalasi XAMPP di komputer Anda (biasanya di: C:\\xampp\\htdocs).
   - Ekstrak seluruh isi file ZIP ini ke dalam folder:
     C:\\xampp\\htdocs\\sakip\\

2. NYALAKAN SERVICE XAMPP
   - Buka aplikasi "XAMPP Control Panel".
   - Klik tombol [Start] pada modul "Apache".
   - Klik tombol [Start] pada modul "MySQL".
   - Pastikan kedua modul berwarna hijau (Status Running).

3. IMPORT DATABASE KE PHPMYADMIN
   - Buka browser (Google Chrome / Edge / Firefox).
   - Akses alamat: http://localhost/phpmyadmin/
   - Klik menu "New" di sidebar kiri untuk membuat database baru.
   - Beri nama database: db_sakip
   - Klik tombol "Create".
   - Klik database "db_sakip" yang baru dibuat, lalu pilih tab "Import" di menu atas.
   - Klik tombol "Choose File" / "Browse", lalu pilih file:
     C:\\xampp\\htdocs\\sakip\\database\\db_sakip.sql
   - Gulir ke bawah dan klik tombol "Go" / "Import".
   - Tunggu hingga muncul pesan hijau: "Import has been successfully finished."

4. AKSES APLIKASI DI BROWSER
   - Buka tab baru di browser Anda, lalu ketik URL:
     http://localhost/sakip/

5. AKUN LOGIN PRESET (4 USER ROLES)
   -----------------------------------------------------------------------------
   | No | Role Pengguna | Username             | Password    | Hak Akses       |
   |----|---------------|----------------------|-------------|-----------------|
   | 1  | Administrator | admin                | password123 | Full Akses      |
   | 2  | Operator Unit | operator_bappeda     | password123 | Input PK & Tw   |
   | 3  | Validator     | validator_sakip      | password123 | Validasi Bulan  |
   | 4  | Verifikator   | evaluator_inspektorat| password123 | Penilaian LHE   |
   -----------------------------------------------------------------------------

6. FITUR UTAMA TERPASANG
   ✅ 4 Peran Pengguna (Admin, Operator, Validator, Verifikator Inspektorat)
   ✅ Monitoring Triwulan dengan Pewarnaan Otomatis (Hijau, Kuning, Merah)
   ✅ Evaluasi LHE AKIP dengan Penilaian 1/0 dan Rekomendasi
   ✅ Format Cetak LHE Resmi Ber-Kop Surat
   ✅ Master OPD, User, Renstra, dan Pengaturan Bobot 5 Komponen SAKIP

================================================================================
Selamat Menggunakan E-SAKIP Pemerintah Daerah!
================================================================================
`
  }
];
