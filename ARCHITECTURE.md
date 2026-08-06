# Relaxio Spa Enterprise CRM - System Architecture

## Overview
Relaxio Spa CRM is a high-performance Single Page Application (SPA) built with React 18, Vite, TypeScript, and Tailwind CSS, backed by Supabase PostgreSQL with real-time WebSocket capabilities.

---

## Technical Stack & Layers

### 1. Presentation Layer (React + Tailwind CSS)
- **App Core**: `src/App.tsx` handles top-level routing, modals, and navigation state.
- **Views**: Dedicated view modules (`DashboardView`, `CustomerListView`, `UserManagementView`, `DataExportView`, `AuditLogsView`, `SettingsView`).
- **Modals & Overlays**: Isolated modal components (`CustomerFormModal`, `CustomerProfileModal`, `QuickSearchModal`, `InvoicePrintModal`).
- **Error Boundaries**: `ErrorBoundary.tsx` traps client-side exceptions and presents a recovery interface.

### 2. State & Data Layer
- **Context API**:
  - `AuthContext.tsx`: User session management, JWT token persistence, auto-refresh monitor, and idle timer.
  - `SpaDataContext.tsx`: Global application state, live Supabase queries, and real-time subscription management.
- **Rate Limiting**: `src/utils/rateLimiter.ts` provides a client/server token bucket algorithm to rate-limit sensitive endpoints.
- **Environment Guard**: `src/utils/envValidation.ts` verifies critical runtime credentials at startup.

### 3. Backend & Storage Layer (Supabase PostgreSQL)
- **Database Engine**: PostgreSQL 15+ hosted on Supabase Cloud.
- **Security**: Row Level Security (RLS) enabled across all 11 tables (`customers`, `payments`, `therapists`, `rooms`, `agents`, `services`, `audit_logs`, `profiles`, `users`).
- **Realtime Channel**: WebSockets replication (`postgres_changes`) configured on `customers` and `payments`.
- **Triggers**: Auto-generating sequential invoice numbers (`RLX-YYYY-XXXX`) and timestamp updaters.

### 4. Version 1.1 Architecture Placeholders
- Modular feature flag engine (`src/services/v1_1/moduleRegistry.ts`).
- Service architecture stubs for AI Assistant, WhatsApp Integration, Appointment Booking, Memberships, Multi-Branch, and Push Notifications.

---

## Security Architecture
- **CSP & Headers**: Defined in `vercel.json` (HSTS, Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Referrer-Policy).
- **Role-Based Access Control**: Strict role checks (`super_admin`, `admin`, `staff`) enforced both on UI action visibility and Supabase RLS database queries.
- **Audit Logging**: Immutable CUD action logging stored in `audit_logs`.
