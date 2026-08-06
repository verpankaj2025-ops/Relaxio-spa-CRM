# Service Registry & Dependency Injection - Relaxio Spa CRM

## Overview
The Service Registry acts as a central IoC (Inversion of Control) container for managing singleton instances of system services.

---

## 🏛️ Registered Services

| Service Name | Class Name | File Path | Status in v1.0.0 |
| :--- | :--- | :--- | :---: |
| `moduleRegistry` | `ModuleRegistryService` | `src/services/v1_1/moduleRegistry.ts` | Active (Gating All Flags) |
| `aiAssistantService` | `AIAssistantService` | `src/services/v1_1/aiAssistantService.ts` | Inert / Disabled |
| `whatsAppService` | `WhatsAppService` | `src/services/v1_1/whatsappService.ts` | Inert / Disabled |
| `appointmentService` | `AppointmentService` | `src/services/v1_1/appointmentService.ts` | Inert / Disabled |
| `membershipService` | `MembershipService` | `src/services/v1_1/membershipService.ts` | Inert / Disabled |
| `multiBranchService` | `MultiBranchService` | `src/services/v1_1/multiBranchService.ts` | Inert / Disabled |
| `notificationService` | `NotificationService` | `src/services/v1_1/notificationService.ts` | Inert / Disabled |
| `eventBus` | `EventBus` | `src/services/v1_1/eventBus.ts` | Active Architecture |
