# Backend Test - Inventory API

Project backend API menggunakan Node.js, Express, TypeScript, Prisma ORM, dan PostgreSQL.

---

## 🚀 Panduan Menjalankan Project Secara Lokal

### Prasyarat
- **Node.js** (v20+ atau v22+) & **npm**
- **Docker** & **Docker Compose**

### 1. Setup Environment
Salin template environment variables:
```bash
cp .env.example .env
```
Pastikan `DATABASE_URL`, `JWT_ACCESS_TOKEN`, dan `JWT_REFRESH_TOKEN` sudah terisi di dalam file `.env`.

### 2. Install Dependencies
```bash
npm install
```

### 3. Jalankan Database (PostgreSQL via Docker)
Nyalakan container PostgreSQL:
```bash
docker compose up -d
```
> Pastikan status container sudah running dan port `5432` sudah aktif (`docker compose ps`).

### 4. Migrasi Database
Jalankan migrasi skema Prisma ke database:
```bash
npx prisma migrate dev --name init
```

### 5. Jalankan Development Server
Jalankan aplikasi dengan nodemon / live-reload:
```bash
npm run start-dev
```
Aplikasi akan berjalan di: `http://localhost:3000`

---

## 🛠️ Perintah Berguna Lainnya

- **Prisma Studio (GUI Database Viewer):**
  ```bash
  npx prisma studio
  ```
  Akses di browser: `http://localhost:5555`

- **Generate Ulang Prisma Client:**
  ```bash
  npm run prisma:generate
  ```

- **Mematikan Container Database:**
  ```bash
  docker compose down
  ```

---

## 📁 Struktur Direktori

```text
backend-test/
├── prisma/
│   ├── migrations/          # File riwayat migrasi SQL
│   └── schema.prisma        # Definisi schema data model (User, Item)
├── src/
│   ├── api/                 # Layer Controller / Handler & Router Express
│   │   ├── items/
│   │   └── users/
│   ├── middleware/          # Custom middleware (autentikasi JWT, error handler)
│   ├── service/             # Business logic & interaksi database via Prisma Client
│   ├── tokenize/            # Pengelolaan & verifikasi token JWT
│   ├── validator/           # Skema validasi data request payload (Joi)
│   ├── types/               # TypeScript type / interface definitions
│   └── server.ts            # Entry point aplikasi Express
├── docker-compose.yaml      # Konfigurasi container service PostgreSQL
├── package.json             # Dependensi dan script project
└── tsconfig.json            # Konfigurasi TypeScript compiler
```

---

# 🧠 Pertanyaan Pemahaman

### 1. Alur Request
> **Pertanyaan:** Jelaskan alur perjalanan sebuah request dari saat API dipanggil oleh client hingga data tersimpan di database. (Misal: Router -> Middleware -> Controller -> Service -> Repository). Mengapa Anda memisahkan logic seperti itu?

#### A. Alur Perjalanan Request:
1. **Client (Frontend / Postman):** Mengirimkan HTTP request (misalnya `POST /api/items` dengan payload JSON dan Cookie/Header).
2. **Server & Global Middleware (`server.ts`):**
   - `cors()`: Memeriksa dan memvalidasi origin client serta mengizinkan pengiriman kredensial cookie (`credentials: true`).
   - `express.json()`: Melakukan parsing payload body JSON menjadi objek JavaScript di `req.body`.
   - `cookieParser()`: Melakukan parsing header cookie HTTP menjadi objek di `req.cookies`.
3. **Router (`routeItems.ts` / `routeUsers.ts`):** Mencocokkan endpoint URL dan HTTP method yang dipanggil, lalu mengarahkan request ke middleware dan handler yang bersangkutan.
4. **Custom Middleware (`middleware/auth.ts`):** 
   - Memeriksa otentikasi token JWT (misalnya dari `req.cookies.accessToken`).
   - Jika token tidak ada / tidak valid, request langsung diputus dengan respon `401 Unauthorized`.
   - Jika token valid, middleware mendekode data user (`req.user = decoded`) dan memanggil `next()` untuk melanjutkan ke Handler.
5. **Controller / Handler (`itemsHandler.ts`):**
   - **Validasi Input:** Memanggil layer validator (Joi) untuk memastikan format input sudah sesuai (misal: stok tidak negatif, tipe data sesuai). Jika gagal, mengembalikan respon `400 Bad Request`.
   - **Ekstraksi Data:** Mengambil data yang sudah valid dari `req.body` atau `req.query`.
   - Memanggil method yang sesuai pada **Service** untuk mengeksekusi logika bisnis.
   - **Format Respon:** Membungkus hasil pemrosesan ke dalam format standar JSON (`status`, `message`, `data`) beserta HTTP status code (`200 OK`, `201 Created`, dll).
6. **Service (`ItemService.ts`):**
   - Menjalankan logika bisnis (misal: kalkulasi pagination, query filtering, enkripsi password).
   - Memanggil **Prisma Client** (ORM) untuk berinteraksi dengan database.
7. **Database (PostgreSQL):**
   - Prisma mengeksekusi query SQL yang dihasilkan ke server PostgreSQL.
   - Data berhasil disimpan/diupdate/diambil, lalu hasilnya dikembalikan secara bertingkat: **Database $\rightarrow$ Service $\rightarrow$ Handler $\rightarrow$ Client**.

#### B. Mengapa Memisahkan Logic Seperti Itu? (Separation of Concerns):
- **Single Responsibility Principle (SRP):** Setiap file/layer hanya memiliki satu tanggung jawab spesifik:
  - *Router* hanya mengurus routing URL.
  - *Middleware* hanya mengurus otentikasi/pre-processing.
  - *Validator* hanya mengurus keabsahan tipe dan aturan data.
  - *Handler* hanya mengurus protokol HTTP (request/response).
  - *Service* hanya mengurus aturan bisnis dan operasi database.
- **Maintainability & Kemudahan Refactoring:** Jika di masa depan ingin mengganti ORM (misal Prisma ke Kysely/TypeORM) atau mengganti framework HTTP (misal Express ke Fastify), perubahan hanya terjadi pada layer terkait tanpa perlu merombak seluruh codebase.
- **Reusability & Testability:** Logika di Service dapat digunakan kembali oleh handler lain atau background job, serta sangat mudah diuji (*Unit Testing*) secara terisolasi menggunakan mock.

---

### 2. Keamanan & Token
> **Pertanyaan:** Dimana sebaiknya frontend menyimpan token JWT yang dikembalikan oleh API ini (Local Storage atau HttpOnly Cookie)? Apa alasan dan risiko keamanannya?

#### A. Rekomendasi Penyimpanan:
- **Refresh Token:** Wajib disimpan di **HttpOnly, Secure, SameSite Cookie**.
- **Access Token:** Disimpan di **Memory (State React/Vue/Pinia)** atau di dalam **HttpOnly Cookie**.

#### B. Alasan & Analisis Risiko Keamanan:

| Mekanisme Penyimpanan | Risiko Keamanan Utama | Penjelasan |
| :--- | :--- | :--- |
| **Local Storage** | **Sangat Rentan terhadap XSS (Cross-Site Scripting)** | Script JavaScript client memiliki akses penuh ke Local Storage. Jika aplikasi memiliki celah XSS (misal dari input yang tidak di-sanitize atau third-party package yang disusupi malware), penyerang dapat menjalankan `localStorage.getItem('token')` dan mencuri token secara instan untuk disalahgunakan di luar aplikasi. |
| **HttpOnly Cookie** | **Kebal terhadap XSS, namun Rentan terhadap CSRF (Cross-Site Request Forgery)** | Flag `HttpOnly` melarang JavaScript client membaca cookie, sehingga token aman dari pencurian via XSS. Namun, karena browser otomatis melampirkan cookie pada setiap request, penyerang dapat memicu request palsu dari web lain (CSRF). |

#### C. Mitigasi Risiko pada HttpOnly Cookie:
Untuk mengatasi risiko CSRF pada HttpOnly Cookie, kami menerapkan konfigurasi keamanan standar industri:
1. **`SameSite=Strict` atau `SameSite=Lax`:** Mencegah browser mengirimkan cookie jika request berasal dari situs pihak ketiga (cross-origin).
2. **`Secure: true`:** Memastikan cookie hanya dapat dikirimkan melalui protokol terenkripsi HTTPS (diaktifkan pada environment production).
3. **Masa Berlaku Singkat (Short-lived Access Token):** Access token diberi masa kadaluarsa singkat (misal 15 menit), sedangkan Refresh Token yang berumur panjang (7 hari) dilindungi secara ketat di HttpOnly Cookie.

---

### 3. Penanganan Konkurensi (Concurrency)
> **Pertanyaan:** Misalkan API Anda dipublish ke publik, lalu ada 2 user yang secara TEPAT BERSAMAAN melakukan request untuk mengurangi stok barang X (stok tersisa: 1). Bagaimana cara Anda mencegah stok menjadi -1 di database?

Kondisi ini dikenal sebagai **Race Condition** (*Lost Update / Double Spending*), di mana User A dan User B sama-sama membaca `stok = 1` sebelum salah satunya selesai melakukan pengurangan, sehingga keduanya mengurangi stok dan menghasilkan nilai `-1`.

Untuk mencegah hal tersebut, ada 3 strategi yang dapat diterapkan:

#### 1. Atomic Conditional Update (Pendekatan Paling Efisien & Direkomendasikan)
Alih-alih membaca data terlebih dahulu lalu menguranginya di level aplikasi, pengurangan stok dilakukan langsung di level database secara atomic dengan kondisi stok mencukupi:

```typescript
// Menggunakan Prisma updateMany dengan filter kondisi stok
const result = await prisma.item.updateMany({
  where: {
    id: itemId,
    stock: {
      gte: quantityToReduce, // Hanya update JIKA stock saat ini >= jumlah yang ingin dikurangi
    },
  },
  data: {
    stock: {
      decrement: quantityToReduce, // Operasi atomic decrement di database
    },
  },
});

// Jika count === 0, berarti stok sudah tidak mencukupi saat query dieksekusi
if (result.count === 0) {
  throw new Error("Stok barang tidak mencukupi atau sudah habis");
}
```
**Mengapa efektif:** Database PostgreSQL menjalankan operasi update pada satu baris secara serial (atomic lock). User pertama yang query-nya dieksekusi akan berhasil (`stock` menjadi `0`, `count = 1`), sedangkan user kedua yang datang di milidetik berikutnya akan mendapati kondisi `stock >= 1` sudah `false` (`count = 0`), sehingga otomatis digagalkan.

#### 2. Database Constraint (`CHECK Constraint`)
Menerapkan batasan integritas langsung di level database PostgreSQL sebagai jaring pengaman (*fail-safe* absolut):
```sql
ALTER TABLE items ADD CONSTRAINT stock_non_negative CHECK (stock >= 0);
```
Jika terjadi anomali atau bug di aplikasi yang mencoba membuat nilai `stock < 0`, PostgreSQL akan langsung menolak transaksi tersebut dan melempar error constraint violation.

#### 3. Pessimistic Locking (`SELECT ... FOR UPDATE` dalam Transaksi)
Mengunci baris data barang sehingga user lain harus mengantre:
```typescript
await prisma.$transaction(async (tx) => {
  // 1. Mengunci baris item sampai transaksi ini commit
  const [item] = await tx.$queryRaw<Item[]>`
    SELECT * FROM items WHERE id = ${itemId} FOR UPDATE
  `;

  if (!item || item.stock < quantityToReduce) {
    throw new Error("Stok barang habis");
  }

  // 2. Update stok
  await tx.item.update({
    where: { id: itemId },
    data: { stock: item.stock - quantityToReduce },
  });
});
```
User kedua akan diblokir (*wait*) sampai transaksi User pertama selesai. Ketika kunci dilepas, User kedua membaca stok yang sudah bernilai `0`, lalu transaksinya dibatalkan.
