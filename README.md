# NIVAARAN — Jharkhand Societal Challenge & Innovation Network

> **Smart India Hackathon Problem Statement 26043 — Smart Societal Innovation Platform**  
> *Developed for the Government of Jharkhand, Directorate of Higher & Technical Education.*  
> **Tagline:** *From Community Problems to Scalable Solutions.*

---

## 📖 Project Overview

**NIVAARAN** is a coordinated digital ecosystem that bridges the gap between citizens experiencing ground-level societal challenges (floods, drinking water crisis, mining land subsidence, road damages) and university engineering research teams (BIT Mesra, IIT ISM Dhanbad, NIT Jamshedpur, Birsa Agricultural University), industry CSR partners, and district administrative officers.

### The 16-Stage Solution Pipeline
`Citizen Submission → AI Risk Understanding & Triage → Geotag Deduplication → District Validation → University R&D Matching → Multidisciplinary Team Formation → Industry/CSR Collaboration → Prototype Build → Pilot Testing → Government Verification → Field Deployment → Impact Measurement → Eco-Rewards & Closure`

---

## 🚀 What Changes Were Made to Previous Code

Here is a summary of all fixes, architectural upgrades, and features implemented:

### 1. Fixed Firebase Auth Validation Error (`auth/api-key-not-valid`)
* **Problem**: In local testing environments without custom Firebase credentials, login failed with `Firebase: Error (auth/api-key-not-valid.-please-pass-a-valid-api-key.)`.
* **Solution** ([`frontend/src/context/AuthContext.tsx`](file:///c:/Nivaaran-main/frontend/src/context/AuthContext.tsx)):
  * Added automated detection for unconfigured or mock Firebase keys.
  * Implemented instant zero-friction simulated sessions for all 8 roles (Citizen, Government Officer, University Admin, Faculty Mentor, Student Researcher, Industry/MSME, CSR Partner, Super Admin) and Google OAuth fallback.

### 2. Interactive Government Analytics & Visual Dashboards
* **Problem**: Government portal buttons were static and lacked data visualization charts.
* **Solution** ([`frontend/src/pages/portals/GovPortal.tsx`](file:///c:/Nivaaran-main/frontend/src/pages/portals/GovPortal.tsx)):
  * Added interactive KPI cards with real-time status counts.
  * Added visual severity breakdown bars and district incident urgency rankings across 24 Jharkhand districts.
  * Added an interactive 16-Stage Lifecycle Funnel view.
  * Added live simulation for incoming citizen reports with automatic spatial triage and university allocation.

### 3. Authentic Government of Jharkhand R&D Certificate of Merit
* **Problem**: Clicking "Download Verified Certificate" in the Student Workspace previously showed a placeholder alert.
* **Solution** ([`frontend/src/components/CertificateModal.tsx`](file:///c:/Nivaaran-main/frontend/src/components/CertificateModal.tsx)):
  * Created an official printable and downloadable Government of Jharkhand Certificate of Merit.
  * Features the high-resolution Jharkhand State Seal, double-gold guilloche borders, official departmental signatories, tamper-evident cryptographic hash, QR verification bar, and official Voucher Code **`JH-HEI-REWARD-9482`**.
  * Connected to both the Student Workspace tab and Government Portal.

### 4. Real-Time Language & Regional Dialect Localization Engine
* **Problem**: Regional language selection in citizen profile only changed button state visually; interface remained static in English.
* **Solution** ([`frontend/src/context/LanguageContext.tsx`](file:///c:/Nivaaran-main/frontend/src/context/LanguageContext.tsx), [`frontend/src/i18n/`](file:///c:/Nivaaran-main/frontend/src/i18n/)):
  * Created a centralized `LanguageContext` providing `useLanguage()` across the entire app tree.
  * Integrated all **12 official and regional languages/dialects of Jharkhand**:
    * **English** (`en`)
    * **Hindi** (हिन्दी, `hi`)
    * **Santali** (ᱥᱟᱱᱛᱟᱲᱤ / संथाली, `sat`)
    * **Khortha** (खोरठा, `khr`)
    * **Nagpuri** (नागपुरी / सादरी, `nag`)
    * **Kurukh** (कुड़ुख़ / उरांव, `kru`)
    * **Mundari** (मुंडारी, `mun`)
    * **Ho** (𑢹𑣉 / हो, `ho`)
    * **Kurmali** (कुरमाली, `kur`)
    * **Urdu** (اردو, `ur`)
    * **Bhojpuri** (भोजपुरी, `bho`)
    * **Magahi** (मगही, `mag`)
  * Implemented real-time language switching across navigation, hero headlines, report intake forms, feed discussions, region chatrooms, and leaderboards.
  * Added persistent storage in `localStorage` (`nivaaran_language`) and cross-tab synchronization.
  * Implemented a recursive fallback proxy in [`translations.ts`](file:///c:/Nivaaran-main/frontend/src/i18n/translations.ts) guaranteeing seamless fallback to English for any undefined key.

---

## 🛠️ Tech Stack

| Layer | Technology |
|:---|:---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons |
| **Localization (i18n)** | Custom Reactive Context Engine with 12 Jharkhand Dialect Dictionaries |
| **Backend & DB** | Node.js, Express.js, MongoDB Atlas / Firebase Firestore |
| **GIS & Mapping** | OpenStreetMap Nominatim Reverse Geocoding & Leaflet |
| **Realtime** | Firebase Subscriptions & Socket.io |

---

## 📁 Repository Structure

```
Nivaaran-main/
├── README.md                      # Project documentation and changelog
├── AGENTS.md                      # AI agent coding guidelines and rules
├── backend/                       # Node.js / Express API server
│   ├── src/
│   ├── package.json
│   └── .env
└── frontend/                      # React + TypeScript + Vite frontend
    ├── public/
    │   ├── jharkhand_govt_seal.png  # Official Govt of Jharkhand Seal
    │   └── logo.png                 # NIVAARAN Brand Logo
    ├── src/
    │   ├── context/
    │   │   ├── AuthContext.tsx      # RBAC Auth with mock fallback
    │   │   └── LanguageContext.tsx  # Centralized i18n context
    │   ├── i18n/
    │   │   ├── types.ts             # Strongly-typed translation schemas
    │   │   ├── translations.ts      # Language registry & fallback proxy
    │   │   └── locales/             # 12 Language dictionary files
    │   ├── components/
    │   │   ├── citizen/             # Citizen portal components & tabs
    │   │   ├── university/          # HEI R&D Workspace & Lab tabs
    │   │   ├── CertificateModal.tsx # Official R&D Certificate generator
    │   │   └── QuickReportModal.tsx # Geotagged evidence intake modal
    │   ├── pages/
    │   │   ├── LandingPage.tsx      # Public landing & showcase
    │   │   ├── AuthPage.tsx         # Multi-role authentication page
    │   │   └── portals/             # Role portals (Gov, Citizen, Univ, MSME)
    │   ├── App.tsx                  # Root Application shell
    │   └── main.tsx                 # Entrypoint
    └── package.json
```

---

## ⚡ Getting Started Locally

### 1. Prerequisites
- **Node.js** (v18 or newer)
- **npm** (v9 or newer)

### 2. Running the Frontend
```bash
cd frontend
npm install
npm run dev
```
The application will start on `http://localhost:5173`.

### 3. Running the Backend
```bash
cd backend
npm install
npm run dev
```

### 4. Testing the Production Build
```bash
cd frontend
npm run build
```
Verify that TypeScript compilation and bundle generation finish with 0 errors.

---

## 👥 Role Matrix

1. **Citizen**: Report local hazards with GPS & photo evidence, track 16-stage progress, earn tree sapling vouchers.
2. **Government Department**: Triage incoming reports, assign priority scores, allocate university labs, and verify deployment.
3. **University (HEI)**: Student multidisciplinary teams (BIT Mesra, IIT Dhanbad, NIT Jamshedpur) accept challenges and build hardware prototypes.
4. **Industry / CSR**: Provide equipment grants, technology sponsorships, and pilot testing support.
5. **Platform Super Admin**: Platform taxonomy, user roles, security audits, and moderation.

---

## 📜 License & Ownership
Developed for the **Government of Jharkhand · Directorate of Higher & Technical Education** for Smart India Hackathon. All rights reserved.