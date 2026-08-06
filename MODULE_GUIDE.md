# Module Integration Guide - Relaxio Spa CRM v1.1

## Overview
This guide describes how Version 1.1 modules interface with the core Relaxio Spa CRM v1.0.0 application without violating release isolation or breaking production stability.

---

## 📦 Module Directory Layout
```
src/
 ├── services/
 │    └── v1_1/
 │         ├── moduleRegistry.ts        # Central feature flags & registry
 │         ├── eventBus.ts              # Pub/Sub event bus & plugin loader
 │         ├── aiAssistantService.ts    # Gemini API architecture stub
 │         ├── whatsappService.ts       # Meta WhatsApp API architecture stub
 │         ├── appointmentService.ts    # Booking calendar architecture stub
 │         ├── membershipService.ts     # Loyalty & tier architecture stub
 │         ├── multiBranchService.ts    # Multi-location architecture stub
 │         └── notificationService.ts   # Push/SMS notification architecture stub
 └── types/
      └── v1_1.ts                       # Shared DTOs, interfaces & types
```

---

## 🧩 Adding a New Module in v1.1
1. **Define Types**: Append all module entities and payload interfaces to `src/types/v1_1.ts`.
2. **Register Feature Flag**: Add a boolean key in `ModuleFeatureFlags` inside `src/types/v1_1.ts` and set its default to `false` in `src/services/v1_1/moduleRegistry.ts`.
3. **Implement Service Wrapper**: Wrap all external service calls inside a feature check:
   ```typescript
   if (!moduleRegistry.isFeatureEnabled('myFeatureFlag')) {
     return fallback;
   }
   ```
4. **Register Plugin**: Register optional event hooks or plugin initializers in `pluginRegistry` via `src/services/v1_1/eventBus.ts`.
