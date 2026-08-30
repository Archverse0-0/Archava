# Deploy Archava (White Rock Bali) ke Vercel

Tutorial lengkap dari repo sampai live, termasuk setup AI Voice Concierge "Ava".

---

## 1. Yang sudah dilakukan (status sekarang)

- ✅ Repo **private** `Archverse0-0/Archava` sudah dibuat
- ✅ Source `website/` (React + Vite) sudah di-push ke branch `main` (139 file)
- ✅ `.env` **tidak** ikut ter-push (aman)
- ✅ `node_modules` (420MB) + `dist` sudah di-ignore

Repo: `https://github.com/Archverse0-0/Archava`

---

## 2. Deploy di Vercel (via Dashboard — paling gampang)

1. Buka **https://vercel.com** → login pakai GitHub (akun `haikarure`).
2. Klik **Add New → Project**.
3. Di tab **Import Git Repository**, cari `Archverse0-0 / Archava` → klik **Import**.
   - Kalau gak kelihatan: klik **Configure GitHub App** → authorize org `Archverse0-0` dulu.
4. **Project Settings** (Vercel auto-detect Vite, tapi cek):
   - **Framework Preset**: `Vite`
   - **Root Directory**: `/` (biarkan default — repo isinya website langsung)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install` (biarkan auto)
5. **Environment Variables** (PENTING — tanpa ini AI voice gak jalan):
   - Klik **Environment Variables** dan tambahin:
     | Name | Value | Environments |
     |---|---|---|
     | `VITE_LIVEKIT_URL` | `wss://receptionist-lwypqvqa.livekit.cloud` | Production, Preview, Development |
   - (Nilai ini diambil dari `.env` lokal yang sengaja gak di-push. Kalau URL LiveKit lu berubah, update di sini.)
6. Klik **Deploy**.
7. Tunggu ~1–2 menit. Status jadi **Ready** → klik URL `*.vercel.app` untuk cek.

> **Catatan:** Vercel default pakai **npm** (bukan bun). `package-lock.json` sudah ada di repo, jadi install aman. Jangan pindah ke bun kecuali sengaja.

---

## 3. Cek hasil deploy

Buka URL Vercel, pastiin:

- [ ] Hero video muter mulus (background `bg-2m.webm` / `bg-2m.mp4`)
- [ ] Navbar gak ada "kotak putih" pas scroll up/down
- [ ] Switcher bahasa (EN → hover → ID/RU/KO) jalan; currency ngikut otomatis (USD / RUB / KRW / IDR)
- [ ] Semua 16 route kebuka: `/`, `/daybeds-suites`, `/dining`, `/experiences`, `/spa-wellness`, `/fitness-center`, `/weddings-mice`, `/events`, `/merch`, `/live-weather`, `/contact`, `/nye`, `/faq`, `/careers`, `/booking`, `/valet-parking`
- [ ] **AI Voice "Ava"** (tombol pojok kanan bawah) bisa dibuka & connect ke LiveKit

---

## 4. Custom Domain (opsional)

1. Di dashboard Vercel → project → **Settings → Domains**.
2. Add domain (misal `archava.id` / `whiterock.example.com`).
3. Ikuti instruksi DNS (tambah CNAME / A record di registrar domain lu).
4. SSL otomatis dari Vercel (Let's Encrypt).

---

## 5. Update / Re-deploy

Setiap lu push ke `main` di GitHub, Vercel **auto re-deploy**.

```bash
# dari folder website lokal lu (parent repo ai-avatar-yt gak diutak):
cd /home/haikaru/Archverse/Lab/ai-avatar-yt/website

# cara push update (pakai temp repo seperti saat init):
# 1. copy website/ ke temp, 2. git init, 3. add remote, 4. commit, 5. push
```

Atau kalau lu mau workflow lebih standar ke depan: **pisahin `website/` jadi git repo sendiri** (bukan temp), biar `git push` langsung dari sana tanpa copy manual.

---

## 6. Troubleshooting

| Gejala | Penyebab | Solusi |
|---|---|---|
| Build gagal / `module not found` | npm gak baca lockfile | Pastiin `package-lock.json` ter-commit (sudah ada) |
| AI voice gak connect | `VITE_LIVEKIT_URL` kosong di Vercel | Tambah Env Var (lihat step 2.5) |
| Video gak muncul | path asset salah | Cek `public/assets/whiterock/bg-2m.*` ter-commit (sudah) |
| Bahasa/currency gak berubah | i18n context | Pastiin `<LangProvider>` wrap `<App>` (sudah di App.tsx) |
| Deploy build tapi blank page | SPA route 404 | Vercel handle SPA otomatis untuk Vite; kalau manual, add `vercel.json` rewrite ke `index.html` |

---

## 7. Architektur singkat

```
Archava/
├── index.html
├── vite.config.ts          # Vite + React SWC, @ alias → src/
├── src/
│   ├── App.tsx             # Router + LangProvider + FloatingConcierge
│   ├── lib/i18n.tsx        # 4 bahasa (ID/EN/RU/KO) + auto-currency
│   ├── components/
│   │   ├── layout/        # Navbar, Footer, PageHero, BgVideo
│   │   └── ai_avatar/     # LiveKitWidget + AvatarVoiceAgent ("Ava")
│   ├── pages/             # 16 halaman
│   └── data/whiterock.ts  # konten + harga (i18n)
└── public/assets/whiterock/  # logo, video, foto
```

**Catatan keamanan:** Backend LiveKit (Python) **tidak** di-deploy Vercel — butuh server terpisah. Frontend cuma butuh `VITE_LIVEKIT_URL` (URL publik, bukan secret) buat connect ke LiveKit cloud.
