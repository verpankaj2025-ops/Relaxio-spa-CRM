# Version 1.1 Architecture & Technical Blueprint

## 🏛️ Executive Architectural Summary
Version 1.1 expands Relaxio Spa Enterprise CRM into an omnichannel, multi-branch, AI-assisted platform while maintaining 100% backward compatibility with the stable Version 1.0.1 codebase.

---

## 🧱 Architectural Components

### 1. Feature Flag Isolation Layer
- **Central Authority**: `src/services/v1_1/moduleRegistry.ts`.
- **Runtime Policy**: Every v1.1 module checks `moduleRegistry.isFeatureEnabled(flag)` before execution. In v1.0.1, all flags evaluate to `false`.

### 2. Event-Driven Messaging Architecture
- **Pub/Sub Bus**: `src/services/v1_1/eventBus.ts`.
- Allows decoupled listener registration without touching core CRM handlers.

### 3. Dynamic Plugin Registry
- `pluginRegistry` manages initialization lifecycle for future integrations (Meta WhatsApp, Gemini API, Payment Processors).

### 4. Database Schema Append Strategy
- Version 1.1 database migrations append new tables (`appointments`, `customer_memberships`, `branches`) without mutating existing v1.0.0 tables (`customers`, `payments`, `therapists`, `rooms`, `agents`, `services`, `audit_logs`).

---

## 🧪 Verification & Validation
- **Compilation Check**: `npm run lint` passes with 0 errors (`tsc --noEmit`).
- **Build Check**: `npm run build` generates clean production assets with zero warnings.
