# Security & Vulnerability Management Policy - Relaxio Spa CRM

## 🔒 1. Security Architecture Summary
Relaxio Spa Enterprise CRM implements defense-in-depth security across all application layers:

- **Row Level Security (RLS)**: Enforced on all 11 PostgreSQL tables in Supabase.
- **Authentication & Authorization**: Supabase Auth JWT tokens with auto-refresh and role-based access control (`super_admin`, `admin`, `staff`).
- **HTTP Security Headers**: Strict HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, and Permissions-Policy in `vercel.json`.
- **Rate Limiting**: Client & Server Token Bucket rate limiters guarding sensitive endpoints against abuse.
- **Data Protection**: Secrets stored exclusively in server environment variables, never committed or exposed client-side.
- **Audit Logging**: Immutable action logging (`audit_logs`) tracking all CUD operations with user context.

---

## 🚨 2. Reporting a Vulnerability

If you discover a security vulnerability in Relaxio Spa CRM, please report it immediately. **Do NOT open a public issue.**

### Contact Information
- **Security Lead Email**: `verpankaj2025@gmail.com`
- **Response SLA**: Initial acknowledgement within 12 hours; resolution patch within 24-48 hours.

### Please Include
1. Description of the issue and potential impact.
2. Steps to reproduce or proof-of-concept payload.
3. Affected components, routes, or API endpoints.

---

## 🛡️ 3. Security Maintenance & Updates
- **Dependency Scans**: Automated `npm audit` scans performed prior to each release candidate.
- **Secrets Management**: Service role keys are kept strictly on backend APIs. The frontend uses only the public anonymous key bounded by RLS.
- **Patch Management**: Critical security vulnerabilities in npm dependencies are patched within 24 hours via `hotfix/*` branches.
