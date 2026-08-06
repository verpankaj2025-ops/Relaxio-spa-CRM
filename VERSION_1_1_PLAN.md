# Version 1.1 Architecture & Implementation Plan

## Overview
Version 1.1 expands Relaxio Spa CRM into an AI-powered, multi-branch, omnichannel customer management ecosystem.

---

## Architecture Blueprint

### 1. Feature Flag Management (`src/services/v1_1/moduleRegistry.ts`)
All v1.1 modules are gated by feature flags. Modules remain completely inert in v1.0.0 and can be enabled individually or in stages via environment variables or admin configuration:
```typescript
export const V1_1_FEATURE_FLAGS = {
  enableAIAssistant: false,
  enableWhatsAppIntegration: false,
  enableAppointmentBooking: false,
  enableMembershipTiers: false,
  enableAdvancedAnalytics: false,
  enableNotificationsEngine: false,
  enableMultiBranch: false,
  enablePermissionsExpansion: false,
};
```

### 2. Module Interfaces & Services
- **AI Assistant**: `aiAssistantService.ts` calls `@google/genai` server-side proxy `/api/ai/insights`.
- **WhatsApp Cloud API**: `whatsappService.ts` integrates Meta Graph API v18.0 for sending media templates (PDF Invoices, booking links).
- **Appointment Calendar**: `appointmentService.ts` supports grid-based time slots and therapist conflict detection.
- **Membership Engine**: `membershipService.ts` tracks credit balance, package redemptions, and tier upgrades.
- **Multi-Branch Support**: `multiBranchService.ts` handles branch context switching and cross-branch reporting.

---

## Database Migration Readiness (v1.1 Additions)
When v1.1 is activated, the following tables will be appended to Supabase PostgreSQL without breaking existing v1.0 schema:
```sql
-- 1. Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  therapist_id UUID REFERENCES therapists(id),
  service_id UUID REFERENCES services(id),
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status VARCHAR(20) DEFAULT 'scheduled',
  branch_id UUID REFERENCES branches(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Memberships Table
CREATE TABLE IF NOT EXISTS customer_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  tier VARCHAR(30) NOT NULL,
  credit_balance NUMERIC(10,2) DEFAULT 0.00,
  loyalty_points INT DEFAULT 0,
  valid_until DATE,
  status VARCHAR(20) DEFAULT 'active'
);

-- 3. Branches Table
CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  city VARCHAR(50),
  address TEXT,
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE
);
```

---

## Deployment Strategy
1. Keep `v1.0.0` tagged as stable production release.
2. Develop v1.1 feature branches using feature toggles.
3. Conduct staging verification before enabling feature flags in production.
