# Change Log - Relaxio Spa Enterprise CRM

All notable changes to the **Relaxio Spa Customer Relationship Management System** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-08-06

### Added
- **Authentication & RBAC System**:
  - Multi-tier role permissions (`super_admin`, `admin`, `staff`).
  - Encrypted JWT session tokens with auto-refresh mechanism.
  - Automatic session timeout monitor (configurable idle timer, default 5 mins).
  - Production-grade Rate Limiter (Token Bucket algorithm) for authentication and export endpoints.
- **Customer Management (CRUD)**:
  - Real-time customer profile creation with instant duplicate phone number validation.
  - Auto-generated sequential invoice numbers (`RLX-YYYY-XXXX`).
  - Visit and treatment history tracking per customer.
  - Instant live filter, fuzzy search by Name/Phone/Invoice ID, and server/client pagination.
- **Billing & Invoice System**:
  - Real-time payment entry and invoice status updates (Paid, Pending, Refunded).
  - Multi-method payment breakdown (Cash, Card, UPI, NetBanking).
  - Thermal receipt & printable full A4 PDF invoice generator modal.
- **Realtime Spa Dashboard**:
  - Live revenue indicators (Today's Revenue, Monthly Total Revenue, Customer Footfall).
  - Dynamic performance ranking for Top Therapists and Top Booking Agents.
  - Payment method distribution pie charts and daily revenue trends (Recharts).
  - WebSocket multi-client synchronization via Supabase Realtime channels (`postgres_changes`).
- **Reports & Export Module**:
  - Export capabilities: CSV, Excel (.xlsx), and styled printable PDF reports.
  - Granular date range filtering (Today, Yesterday, Last 7 Days, Custom Date Range).
  - Strict Role Restriction: Data export controls locked strictly to Super Admin role.
- **Audit Logging & Security**:
  - Immutable activity audit log recording every create, update, delete, login, and export action.
  - Production `ErrorBoundary` wrapping React application tree with crash recovery UI.
  - Enhanced HTTP Security headers via `vercel.json` (HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy).
  - Production SEO & Meta verification with `robots.txt`, `sitemap.xml`, and JSON-LD Structured Data.

### Security & Infrastructure
- Complete Row Level Security (RLS) policies on all Supabase tables (`customers`, `payments`, `therapists`, `rooms`, `agents`, `services`, `audit_logs`).
- Zero console runtime warnings or TypeScript compilation errors.
- Token bucket rate limiting for sensitive API interactions.
