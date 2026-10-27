STOK RUMAH - REALTIME MULTI-USER

Versi ini memakai Supabase project dan akun login yang sama dengan Dapur Ibu,
tetapi datanya disimpan pada tabel terpisah: stokrumah_entities.

SETUP:
1. Buka Supabase project Dapur Ibu.
2. SQL Editor -> New query.
3. Copy seluruh isi supabase-setup.sql -> Run.
4. Pastikan akun keluarga sudah tersedia di Authentication > Users
   (akun yang sama dengan Dapur Ibu dapat digunakan).
5. Upload file PWA ke GitHub Pages:
   - index.html
   - app.js
   - manifest.json
   - service-worker.js
   - icon.svg

CARA KERJA:
- Login email/password.
- Perubahan disimpan lokal dulu lalu otomatis dikirim ke Supabase.
- Perangkat lain mengecek perubahan setiap 3 detik seperti Dapur Ibu.
- Tombol status sinkron di kanan bawah dapat ditekan untuk sinkron manual / logout.
- Tabel Stok Rumah terpisah dari tabel Dapur Ibu.

CATATAN:
- Jangan upload supabase-setup.sql ke web jika tidak perlu; file itu hanya untuk SQL Editor.
- Jika login berhasil tetapi status database error, biasanya SQL setup belum dijalankan.


PERBAIKAN TOMBOL SINKRON (27 Oktober 2026):
- Tombol status sinkron ditampilkan kembali setelah sesi login dipulihkan.
- Tombol status dinaikkan posisinya agar terlihat di atas navigasi bawah.
- Ketuk tombol status sinkron untuk membuka menu akun; tombol 'Sinkronkan sekarang' berada di dalam menu tersebut.
- Cache PWA diperbarui agar versi baru lebih mudah terpasang.
