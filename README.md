# Pixel Adventure 3D

Game petualangan 3D third-person bergaya voxel untuk GitHub Pages dan HP Android.

## Cara menjalankan
1. Ekstrak ZIP.
2. Unggah `index.html`, `style.css`, `game.js`, dan `README.md` ke repository GitHub.
3. Buka **Settings → Pages**.
4. Pada **Build and deployment**, pilih **Deploy from a branch**, branch `main`, folder `/ (root)`, lalu Save.
5. Buka URL GitHub Pages dari HP. Aktifkan rotasi otomatis dan putar HP ke posisi landscape untuk pengalaman terbaik.

## Kontrol
- Joystick kiri: bergerak.
- Geser area kanan: putar kamera.
- Lompat: melompat.
- Ambil: mengambil blok yang dibidik.
- Pasang: meletakkan blok di permukaan yang dibidik.
- Serang: aksi serangan sederhana.
- Jeda: simpan progres atau mulai dunia baru.

## Catatan
- Memerlukan koneksi internet untuk memuat Three.js dari CDN.
- Browser HP bisa menolak penguncian orientasi; putar perangkat secara manual jika tidak otomatis.
- Progres disimpan di `localStorage` browser pada perangkat yang sama.
- Ini adalah prototipe single-player; belum memiliki server multiplayer, akun, chat online, atau sinkronisasi antarperangkat.
