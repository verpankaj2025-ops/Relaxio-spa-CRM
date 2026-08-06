# Release Freeze Policy - Relaxio Spa Enterprise CRM

## 🧊 1. Overview
As of **August 6, 2026**, **Relaxio Spa Enterprise CRM v1.0.0** has entered **RELEASE FREEZE**.

All core production functionality, database schemas, authentication flows, invoicing logic, and role-based access control policies are locked and strictly guarded against unauthorized or unverified refactoring.

---

## 📌 2. Freeze Details
| Parameter | Value |
| :--- | :--- |
| **Stable Version** | `v1.0.0` |
| **Release Freeze Date** | August 6, 2026 |
| **Maintained Production Branch** | `main` |
| **Active Development Branch** | `develop` (for v1.1.0 preparation) |
| **Current Target Build** | `production` (Node.js 20+ / Vercel / Cloud Run) |

---

## 🛡️ 3. Maintenance & Change Management Policies

### A. Hotfix Policy (`hotfix/*`)
- **Criteria**: Critical production bugs causing application crash, financial calculation inaccuracies, authentication failures, or security vulnerabilities.
- **Workflow**:
  1. Branch off `main` -> `hotfix/v1.0.x-short-description`.
  2. Implement targeted fix without modifying unrelated code.
  3. Run `npm run lint` and `npm run build`.
  4. Submit Pull Request targeting `main`.
  5. Upon approval by Release Manager, merge into `main` and backport into `develop`.
  6. Tag patch release (e.g., `v1.0.1`).

### B. Bug Fix Policy (`bugfix/*`)
- **Criteria**: Non-critical UI glitches, layout adjustments, or minor report alignment issues.
- **Workflow**: Scheduled for routine minor releases via `develop` -> `release/v1.1`.

### C. Security Patch Policy
- Immediate deployment priority within 4 hours of CVE detection or credential rotation requirements.
- Zero-downtime hotfix deployment via Vercel / Cloud Run automated build pipeline.

---

## 🔒 4. Feature Freeze Enforcement
All Version 1.1 module feature flags in `src/services/v1_1/moduleRegistry.ts` MUST remain set to `false` on `main`:
- `enableAIAssistant = false`
- `enableWhatsAppIntegration = false`
- `enableAppointmentBooking = false`
- `enableMembershipTiers = false`
- `enableAdvancedAnalytics = false`
- `enableNotificationsEngine = false`
- `enableMultiBranch = false`
- `enablePermissionsExpansion = false`
