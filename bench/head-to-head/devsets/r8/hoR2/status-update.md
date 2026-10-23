# Pembaruan Status Proyek Pelita – Oktober 2026

Berikut adalah ringkasan komprehensif status proyek Pelita untuk bulan ini.

Tim telah mencapai kemajuan yang sangat luar biasa pada migrasi basis data ke PostgreSQL 16. Migrasi ini mungkin dapat berpotensi mengurangi waktu muat laporan sekitar 35 persen, dan perlu dicatat bahwa uji beban pada 3 Oktober 2026 menunjukkan ketersediaan 99,95 persen. Menurut sejumlah pihak, hasil ini menjadi tonggak penting yang membuka babak baru bagi pemilik warung yang memakai aplikasi stok.

Pekerjaan yang sudah selesai:

- Rilis versi 1.8.2 dengan perbaikan stok ganda (tiket PEL-142)
- Anggaran server turun menjadi Rp 12.500.000 per bulan
- Pembatasan API dengan batas 500 permintaan per menit

Wulan Prasetyo memimpin pengujian, dan simulasi migrasi bisa dijalankan dengan `pelita migrate --dry-run`. Ia juga mengingatkan: "Jangan hapus tabel lama sebelum 31 Oktober."

Dengan demikian, proyek Pelita terus melangkah menuju masa depan yang cerah.
