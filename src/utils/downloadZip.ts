export const downloadSampZip = async () => {
  try {
    alert('Fitur download ZIP berhasil dijalankan');

    // Tambahkan proses pembuatan ZIP di sini nanti
    return true;
  } catch (error) {
    console.error('Gagal membuat ZIP:', error);
    throw error;
  }
};