# Relaxio Spa Customer Management System (CMS)

A production-ready, mobile-first web application designed exclusively for managing paid customers, therapist allocations, room occupancies, partner agent commissions, and billing at **Relaxio Spa & Wellness**.

---

## 🌟 Key Application Features

### 1. **Authentication & Role-Based Access Control (RBAC)**
- **Roles**:
  - **Super Admin**: Complete control, provision/delete staff, export raw Excel/CSV data, database backup/restore.
  - **Admin**: Customer check-ins, record edits, manage therapists, rooms, services, view dashboard analytics.
  - **Staff / Desk**: Quick customer check-in, search duplicate mobile history, mark session completion.
- Dual login via **Mobile Number** OR **Email Address** + Password.
- Automated session timeout & auto-logout after inactivity (configurable, default 5 mins).

### 2. **Customer Entry & Invoice Generator**
- Fields: Customer Name, Mobile Number, Gender, Age, Visit Date, Check In/Out Times, Assigned Room, Therapist, Amount Paid, Payment Method (Cash, UPI, Card, Wallet), Customer Type (Walk In, Agent Customer, Referral, Membership), Agent Name (dynamic), Services, Remarks.
- **Auto Invoice Sequence**: Generates unique `RLX-YYYY-XXXX` invoice numbers.
- **Instant Duplicate Mobile Detector**: Detects returning guests by mobile number, displays past visit history, total lifetime spend, and auto-fills information.

### 3. **Customer Records & Quick Filters**
- Responsive Mobile Cards view (< md) and Desktop Data Table (>= md).
- Instant multi-field search across Name, Mobile, Invoice #, Therapist, Room, Agent, Payment.
- Quick Filters: Today, Yesterday, This Month, Walk In, Agent, Completed, Running, Cancelled.
- Status toggle: Tap to update `Running` session to `Completed`.

### 4. **Real-time Operational Dashboard**
- Luxury metric cards: Today's Revenue, Monthly Revenue, Today's Guests, Active Sessions, Average Bill, Top Therapist, Top Partner Agent, Room Occupancy %.
- Visual Recharts: Daily Revenue Trend, Payment Method Breakdown progress bars, Live Room Status matrix.

### 5. **Super Admin Data Export Suite**
- Date Range filters, Therapist-wise & Agent-wise report generation.
- One-click export to **Excel / CSV**, **JSON**, or **Printable PDF**.

### 6. **Security & Immutable Audit Trail**
- Real-time logging of every check-in, record update, deletion, login, and data download with timestamp, user name, role, and IP address.

### 7. **Mobile-First Luxury UI & PWA Ready**
- Built with a luxury color palette: Onyx Black, Deep Velvet, Soft Gold (#D4AF37), Champagne, and Glassmorphism accents.
- Bottom Navigation Bar for easy thumb reach on Android/iOS devices.
- Fully installable PWA manifest (`public/manifest.json`).

---

## 📁 Complete Folder Structure

```
├── /public
│   └── manifest.json             # Web App PWA Manifest
├── /src
│   ├── /components
│   │   ├── BottomNav.tsx         # Mobile bottom thumb bar
│   │   ├── CustomerFormModal.tsx # Customer check-in entry form
│   │   ├── CustomerProfileModal.tsx # Guest visit history & lifetime spend
│   │   ├── Header.tsx            # Luxury top bar, theme & quick search trigger
│   │   ├── InvoicePrintModal.tsx # Printable tax invoice template
│   │   ├── QuickSearchModal.tsx  # Global Ctrl+K instant search
│   │   └── Sidebar.tsx           # Desktop sidebar navigation
│   ├── /context
│   │   ├── AuthContext.tsx       # Auth session & auto-logout manager
│   │   └── SpaDataContext.tsx    # Customer, therapist, room & stats provider
│   ├── /data
│   │   └── mockInitialData.ts    # Seed datasets
│   ├── /services
│   │   └── api.ts                # API Client with Express backend & localStorage fallback
│   ├── /views
│   │   ├── AuditLogsView.tsx     # Security audit trail
│   │   ├── BackupRestoreView.tsx # JSON snapshot backup & restore
│   │   ├── CustomerListView.tsx  # Customer list & mobile cards
│   │   ├── DashboardView.tsx     # Analytics dashboard with Recharts
│   │   ├── DataExportView.tsx    # Super Admin CSV/PDF exports
│   │   ├── LoginView.tsx         # Mobile/Email authentication
│   │   ├── SettingsView.tsx      # Therapists, rooms, agents, services config
│   │   └── UserManagementView.tsx# Super Admin staff control panel
│   ├── App.tsx                   # Main layout container
│   ├── index.css                 # Tailwind v4 & luxury theme CSS
│   ├── main.tsx                  # React entry point
│   └── types.ts                  # TypeScript interface declarations
├── /supabase
│   └── schema.sql                # Complete Supabase PostgreSQL schema & RLS rules
├── .env.example                  # Environment variables example
├── index.html                    # Main HTML entry with Google fonts & viewport
├── package.json                  # Dependencies and scripts
├── server.ts                     # Express backend API & Vite middleware
├── tsconfig.json                 # TypeScript configuration
└── vite.config.ts                # Vite config
```

---

## ⚡ Quick Start Instructions

1. **Environment Setup**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. **Run Application**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser or Android mobile preview.

3. **Demo Quick Login Credentials**:
   - **Super Admin**: `owner@relaxiospa.com` / `password123`
   - **Admin**: `admin@relaxiospa.com` / `password123`
   - **Staff**: `desk@relaxiospa.com` / `password123`
