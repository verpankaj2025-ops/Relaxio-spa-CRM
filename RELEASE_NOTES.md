# Release Notes - Relaxio Spa Enterprise CRM v1.0.0

**Release Date:** August 6, 2026  
**Version:** `v1.0.0` (Production General Availability)  
**Target Environment:** Vercel / Cloud Run / Supabase Cloud  

---

## 🌟 Executive Summary

We are proud to announce the **General Availability release of Relaxio Spa Enterprise CRM v1.0.0**. This release represents a production-grade, highly secure, real-time customer management platform tailored specifically for luxury spa and wellness centers.

Relaxio Spa v1.0.0 delivers real-time multi-terminal customer check-ins, automated sequential invoice generation, comprehensive revenue and therapist analytics, granular role-based permissions, and complete audit logging.

---

## 🚀 Key Highlights

### 1. 👥 Multi-Role Workspace Security
- **Super Admin**: Full access to operational controls, financial reports, user management, and CSV/Excel/PDF data exports.
- **Admin**: Complete access to customer CRUD, appointment allocations, room management, and operational dashboards.
- **Staff**: Streamlined desk access for check-ins, customer editing, and invoice creation with strict export and deletion restrictions.

### 2. ⚡ Realtime Customer & Financial Synchronization
- Direct integration with **Supabase Realtime WebSockets**.
- Updates made at the reception desk instantly reflect on executive dashboards without requiring manual page reloads.

### 3. 📄 Automated Invoicing & Thermal Printing
- Auto-formatted invoice numbering pattern: `RLX-2026-XXXX`.
- Built-in printable thermal receipts and full A4 invoice modals with GST calculation support.

### 4. 🛡️ Enterprise Security & Infrastructure
- Complete **Row Level Security (RLS)** protecting all underlying database tables.
- Production **Content Security Policy (CSP)** and HTTP security headers configured in `vercel.json`.
- Global **Token Bucket Rate Limiter** guarding authentication and export operations against brute-force attacks.
- Graceful **Error Boundary** interface protecting against client-side runtime disruptions.

---

## 📋 System Requirements & Deployment
- **Frontend / API Runtime**: Node.js 20+ / Vercel / Cloud Run
- **Database**: Supabase PostgreSQL 15+
- **Browser Compatibility**: Chrome, Safari, Firefox, Edge, Mobile Safari, Android Chrome (Full PWA ready).

---

## 📞 Support & Maintenance
For operational assistance or deployment inquiries, contact system administrators at `verpankaj2025@gmail.com`.
