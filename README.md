# Backend Test - Inventory API

Project backend API menggunakan Node.js, Express, TypeScript, Prisma ORM, dan PostgreSQL.

---

## Panduan Menjalankan Project Secara Lokal

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

## Perintah Berguna Lainnya

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

## Struktur Direktori

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

## Dokumentasi Endpoint API

Base URL: `http://localhost:3000/api`

### 1. Endpoint Pengguna & Autentikasi (`/users`)

#### • Register User (Daftar Akun)
- **Method:** `POST`
- **URL:** `/api/users`
- **Headers:** `Content-Type: application/json`
- **Body Request:**
  ```json
  {
    "name": "John Doe",
    "email": "johndoe@example.com",
    "password": "secretpassword"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "status": "success",
    "message": "User created successfully",
    "data": {
      "user": {
        "id": 1,
        "name": "John Doe",
        "email": "johndoe@example.com",
        "createdAt": "2026-09-27T00:00:00.000Z",
        "updatedAt": "2026-09-27T00:00:00.000Z"
      }
    }
  }
  ```

#### • Login User (Masuk)
- **Method:** `POST`
- **URL:** `/api/users/login`
- **Headers:** `Content-Type: application/json`
- **Body Request:**
  ```json
  {
    "email": "johndoe@example.com",
    "password": "secretpassword"
  }
  ```
- **Response (200 OK):**
  *(Menyimpan `accessToken` dan `refreshToken` ke HTTP-Only Cookie)*
  ```json
  {
    "status": "success",
    "message": "User logged in successfully",
    "data": {
      "user": {
        "id": 1,
        "name": "John Doe",
        "email": "johndoe@example.com",
        "createdAt": "2026-09-27T00:00:00.000Z",
        "updatedAt": "2026-09-27T00:00:00.000Z"
      },
      "accessToken": "eyJhbGciOi..."
    }
  }
  ```

#### • Refresh Token
- **Method:** `POST`
- **URL:** `/api/users/auth/refresh`
- **Cookie Wajib:** `refreshToken`
- **Response (200 OK):**
  ```json
  {
    "status": "success",
    "message": "Token refreshed successfully",
    "data": {
      "tokens": "eyJhbGciOi..."
    }
  }
  ```

#### • Logout User
- **Method:** `DELETE`
- **URL:** `/api/users/logout`
- **Response (200 OK):**
  *(Menghapus cookie `refreshToken`)*
  ```json
  {
    "status": "success",
    "message": "User logged out successfully"
  }
  ```

---

### 2. Endpoint Barang (`/items`)
*(Semua endpoint barang memerlukan autentikasi cookie `accessToken`)*

#### • Tambah Barang (Create Item)
- **Method:** `POST`
- **URL:** `/api/items`
- **Headers:** `Content-Type: application/json`
- **Cookie:** `accessToken`
- **Body Request:**
  ```json
  {
    "userId": 1,
    "name": "Laptop ThinkPad",
    "description": "Laptop bisnis kondisi mulus",
    "stock": 10,
    "price": 12500000
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "status": "success",
    "message": "Item created successfully",
    "data": {
      "item": {
        "id": 1,
        "userId": 1,
        "name": "Laptop ThinkPad",
        "description": "Laptop bisnis kondisi mulus",
        "stock": 10,
        "price": "12500000.00",
        "createdAt": "2026-09-27T00:00:00.000Z",
        "updatedAt": "2026-09-27T00:00:00.000Z"
      }
    }
  }
  ```

#### • Lihat Daftar Barang (Search & Pagination)
- **Method:** `GET`
- **URL:** `/api/items`
- **Query Parameters (Opsional):**
  - `search`: Kata kunci pencarian nama atau deskripsi barang.
  - `page`: Nomor halaman (default: `1`).
  - `limit`: Jumlah barang per halaman (default: `10`).
- **Contoh Request:** `/api/items?search=laptop&page=1&limit=5`
- **Cookie:** `accessToken`
- **Response (200 OK):**
  ```json
  {
    "status": "success",
    "data": {
      "items": [
        {
          "id": 1,
          "userId": 1,
          "name": "Laptop ThinkPad",
          "description": "Laptop bisnis kondisi mulus",
          "stock": 10,
          "price": "12500000.00",
          "createdAt": "2026-09-27T00:00:00.000Z",
          "updatedAt": "2026-09-27T00:00:00.000Z"
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 5,
        "totalItems": 1,
        "totalPages": 1
      }
    }
  }
  ```

#### • Ubah Barang (Update Item)
- **Method:** `PUT`
- **URL:** `/api/items/:id`
- **Headers:** `Content-Type: application/json`
- **Cookie:** `accessToken`
- **Body Request:**
  ```json
  {
    "userId": 1,
    "name": "Laptop ThinkPad T480",
    "description": "RAM sudah di-upgrade ke 16GB",
    "stock": 8,
    "price": 13000000
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "status": "success",
    "message": "Item updated successfully",
    "data": {
      "item": {
        "id": 1,
        "userId": 1,
        "name": "Laptop ThinkPad T480",
        "description": "RAM sudah di-upgrade ke 16GB",
        "stock": 8,
        "price": "13000000.00",
        "createdAt": "2026-09-27T00:00:00.000Z",
        "updatedAt": "2026-09-27T00:00:00.000Z"
      }
    }
  }
  ```

#### • Hapus Barang (Delete Item)
- **Method:** `DELETE`
- **URL:** `/api/items/:id`
- **Cookie:** `accessToken`
- **Response (200 OK):**
  ```json
  {
    "status": "success",
    "message": "Item deleted successfully"
  }
  ```

---

# Pertanyaan Pemahaman

### 1. Alur Request
> **Pertanyaan:** Jelaskan alur perjalanan sebuah request dari saat API dipanggil oleh client hingga data tersimpan di database. (Misal: Router -> Middleware -> Controller -> Service -> Repository). Mengapa Anda memisahkan logic seperti itu?

Alur perjalanan request dimulai ketika client (seperti frontend atau API client) mengirimkan HTTP request ke server. Di pintu masuk server Express, request terlebih dahulu melewati middleware global, yaitu CORS untuk memastikan izin akses domain, Express JSON parser untuk membaca payload body, dan Cookie Parser untuk mengekstrak cookie yang dikirimkan. Setelah itu, request diarahkan oleh Router menuju rute spesifik yang dituju. Sebelum mencapai controller/handler, request disaring oleh middleware autentikasi untuk memverifikasi validitas token JWT yang ada pada cookie. Jika token tidak valid atau tidak ada, middleware langsung menghentikan siklus request dan mengembalikan respon 401 Unauthorized. Apabila valid, data user hasil decode akan ditempelkan ke objek request dan diteruskan ke Handler. Di dalam Handler, data input divalidasi terlebih dahulu menggunakan schema Joi untuk memastikan tidak ada input yang salah atau bernilai negatif. Jika validasi lolos, Handler meneruskan data bersih tersebut ke layer Service untuk menjalankan logika bisnis aplikasi, seperti kalkulasi data atau enkripsi. Pada akhirnya, Service memanggil Prisma Client untuk mengeksekusi query ke database PostgreSQL, lalu hasil operasi tersebut dikembalikan secara berantai kembali ke Handler untuk dibungkus menjadi respon JSON terstandarisasi sebelum dikirim kembali ke client.

Alasan utama memisahkan logika ke dalam struktur Router, Middleware, Handler, dan Service adalah untuk menerapkan prinsip *Separation of Concerns* (pemisahan tanggung jawab) dan *Single Responsibility Principle*. Dengan arsitektur ini, setiap komponen memiliki satu tugas yang fokus dan terisolasi: router hanya mengurus pemetaan URL, middleware menangani filter pra-eksekusi seperti keamanan, handler mengurus protokol HTTP dan validasi, sedangkan service fokus murni pada aturan bisnis dan interaksi data. Pemisahan ini membuat kode menjadi jauh lebih mudah dirawat (*maintainable*), mudah dikembangkan di kemudian hari (*scalable*), mudah diuji melalui unit testing tanpa harus menjalankan HTTP server nyata, serta memungkinkan logika bisnis di service untuk digunakan kembali oleh controller lain maupun background job.

---

### 2. Keamanan & Token
> **Pertanyaan:** Dimana sebaiknya frontend menyimpan token JWT yang dikembalikan oleh API ini (Local Storage atau HttpOnly Cookie)? Apa alasan dan risiko keamanannya?

Frontend sebaiknya menyimpan token JWT dengan strategi pemisahan peran, yaitu menyimpan Refresh Token di dalam **HttpOnly Cookie** dan Access Token di dalam **Memory (State aplikasi)** atau juga di dalam HttpOnly Cookie. Alasan utamanya adalah untuk memitigasi risiko keamanan yang paling sering terjadi pada aplikasi web, yaitu Cross-Site Scripting (XSS) dan Cross-Site Request Forgery (CSRF).

Jika token disimpan di Local Storage, token tersebut dapat diakses secara langsung oleh script JavaScript di sisi browser. Apabila aplikasi memiliki celah keamanan XSS—misalnya akibat input yang tidak tersanitasi dengan baik atau adanya pustaka pihak ketiga yang disusupi malware—penyerang dapat dengan mudah mengeksekusi script untuk mencuri token dari Local Storage dan menggunakannya dari luar aplikasi. Sebaliknya, penyimpanan token di dalam cookie dengan atribut `HttpOnly` membuat cookie tersebut sama sekali tidak dapat dibaca atau dimanipulasi oleh JavaScript client, sehingga kebal terhadap pencurian via serangan XSS. Meskipun penggunaan cookie memiliki risiko serangan CSRF, risiko ini dapat dicegah secara efektif dengan mengonfigurasi atribut `SameSite=Strict` atau `SameSite=Lax` agar browser menolak pengiriman cookie dari domain pihak ketiga, serta menambahkan atribut `Secure` agar cookie hanya ditransmisikan melalui koneksi terenkripsi HTTPS. Dengan demikian, menaruh token (terutama Refresh Token yang berumur panjang) di HttpOnly Cookie memberikan lapisan perlindungan yang jauh lebih kokoh dibandingkan menyimpannya di Local Storage.

---

### 3. Penanganan Konkurensi (Concurrency)
> **Pertanyaan:** Misalkan API Anda dipublish ke publik, lalu ada 2 user yang secara TEPAT BERSAMAAN melakukan request untuk mengurangi stok barang X (stok tersisa: 1). Bagaimana cara Anda mencegah stok menjadi -1 di database?

Kondisi ketika dua request masuk secara bersamaan untuk mengurangi stok barang yang hanya tersisa satu dikenal sebagai masalah *Race Condition* (*Lost Update*). Hal ini terjadi karena kedua request sama-sama membaca stok bernilai 1 sebelum salah satu request berhasil menguranginya, sehingga kedua request melanjutkan transaksi dan menyebabkan stok akhir bernilai -1.

Untuk mencegah kondisi tersebut di database, pendekatan paling efisien dan direkomendasikan adalah menggunakan **Atomic Conditional Update** langsung di level database, misalnya melalui query `UPDATE items SET stock = stock - 1 WHERE id = X AND stock >= 1`. Pada Prisma, pendekatan ini diimplementasikan menggunakan fungsi `updateMany` dengan klausa kondisi `where: { id: itemId, stock: { gte: 1 } }` dan `data: { stock: { decrement: 1 } }`. Karena database PostgreSQL mengeksekusi operasi update baris data secara serial (*atomic lock*), transaksi pertama yang tiba di database akan berhasil mengubah stok menjadi 0 dan mengembalikan jumlah baris yang terupdate sebanyak satu baris. Sementara itu, transaksi kedua yang tiba beberapa milidetik kemudian akan mendapati kondisi `stock >= 1` sudah bernilai salah, sehingga operasinya tidak mengubah data apapun (*count* bernilai 0) dan sistem dapat langsung menolak transaksi kedua dengan pesan bahwa stok sudah habis.

Selain pendekatan atomic update, integritas data juga dapat diperkuat dengan menambahkan batasan langsung di level database menggunakan fitur *Database Constraint*, yaitu perintah SQL `CHECK (stock >= 0)`. Constraint ini bertindak sebagai jaring pengaman absolut yang akan langsung menggagalkan dan melempar error pada transaksi apapun yang mencoba menghasilkan nilai stok negatif. Untuk skenario yang lebih kompleks yang melibatkan banyak tabel sekaligus, kita juga dapat menggunakan teknik *Pessimistic Locking* melalui query `SELECT ... FOR UPDATE` di dalam blok transaksi Prisma, yang akan mengunci baris data barang dan memaksa transaksi lain mengantre hingga transaksi pertama selesai dan melepaskan kunci tersebut.
