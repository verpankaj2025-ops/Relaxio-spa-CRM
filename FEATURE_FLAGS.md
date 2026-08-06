# Feature Flags Architecture & Matrix - Relaxio Spa CRM

## Overview
All Version 1.1 features are controlled by strict feature flags defined in `src/services/v1_1/moduleRegistry.ts`.

---

## 🚩 Feature Flag Matrix

| Feature Flag Key | Description | Default Value in v1.0.0 | Target Release |
| :--- | :--- | :---: | :---: |
| `enableAIAssistant` | Gemini AI natural language insights & forecasting | `false` | v1.1.0 |
| `enableWhatsAppIntegration` | WhatsApp Business Cloud API invoice & reminder messaging | `false` | v1.1.0 |
| `enableAppointmentBooking` | Therapist appointment calendar & grid booking | `false` | v1.1.0 |
| `enableMembershipTiers` | Customer packages, prepaid balances & loyalty tiers | `false` | v1.1.0 |
| `enableAdvancedAnalytics` | Cohort retention analysis & category heatmaps | `false` | v1.1.0 |
| `enableNotificationsEngine` | Multi-channel SMS, Email, and Push notifications | `false` | v1.1.0 |
| `enableMultiBranch` | Multi-location switching & central aggregation | `false` | v1.1.0 |
| `enablePermissionsExpansion` | Granular permission matrix per custom user role | `false` | v1.1.0 |

---

## 🔒 Security & Runtime Enforcement
1. Feature flags default to `false` in production code.
2. If a feature flag is `false`, corresponding API routes, services, and UI components return empty/inert payloads or remain unrendered.
3. Feature flags can be toggled via environment variables or runtime configuration in future releases.
