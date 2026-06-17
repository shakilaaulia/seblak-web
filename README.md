## Persyaratan Sistem

Sebelum memulai, pastikan Anda telah menginstal:
- [Node.js](https://nodejs.org/) (versi 18 atau terbaru direkomendasikan)
- [PostgreSQL](https://www.postgresql.org/) (untuk database)
- Git (opsional, untuk version control)

---

## 1. Menjalankan Backend

Backend berada di dalam folder `backend/`. Aplikasi ini menyediakan API untuk frontend dan menggunakan PostgreSQL sebagai database.

### Langkah-langkah:

1. **Masuk ke folder backend:**
   ```bash
   cd backend
   ```

2. **Instal dependensi:**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variables:**
   Buat file bernama `.env` di dalam folder `backend` dan tambahkan konfigurasi koneksi database PostgreSQL Anda:
   ```env
   # Contoh format koneksi PostgreSQL
   DATABASE_URL="postgresql://username:password@localhost:5432/nama_database?schema=public"
   PORT=3001
   ```
   *(Ganti `username`, `password`, dan `nama_database` sesuai dengan konfigurasi PostgreSQL di komputer Anda).*

4. **Sinkronisasi Database (Prisma):**
   Jalankan perintah ini untuk membuat tabel-tabel di database Anda berdasarkan skema Prisma:
   ```bash
   npm run db:push
   ```

5. **Seed Database (Opsional):**
   Jika Anda ingin mengisi database dengan data awal (dummy data/kategori awal), jalankan:
   ```bash
   npm run db:seed
   ```

6. **Jalankan Server Backend:**
   ```bash
   npm run dev
   ```
   Backend akan berjalan di `http://localhost:3001`.

---

## 2. Menjalankan Frontend

Frontend berada di dalam folder `frontend/`. Aplikasi ini dibangun menggunakan Next.js dan React.

### Langkah-langkah:

1. **Masuk ke folder frontend (buka terminal/tab baru):**
   ```bash
   cd frontend
   ```

2. **Instal dependensi:**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variables (Opsional):**
   Secara default, frontend akan mencari backend di `http://localhost:3001`. Jika backend Anda berjalan di port/URL yang berbeda, buat file `.env.local` di folder `frontend` dan tambahkan:
   ```env
   NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
   ```

4. **Jalankan Server Frontend:**
   ```bash
   npm run dev
   ```
   Frontend akan berjalan di `http://localhost:3000`.

---

## Mengakses Aplikasi

Setelah kedua server (frontend dan backend) berjalan:
- Buka browser dan akses **[http://localhost:3000](http://localhost:3000)** untuk melihat antarmuka aplikasi Seblak Mamah Zahwa.
- API backend dapat diakses melalui **[http://localhost:3001](http://localhost:3001)**.
