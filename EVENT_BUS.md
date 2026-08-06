# Event Bus & Decoupled Messaging - Relaxio Spa CRM

## Overview
The `EventBus` (`src/services/v1_1/eventBus.ts`) provides an asynchronous pub/sub messaging channel to decouple core business operations (e.g., Invoice Created, Customer Checked In) from background side effects (e.g., Sending WhatsApp Receipts, Triggering AI Analytics).

---

## 📡 Event Topics

| Topic Name | Payload Interface | Trigger Context |
| :--- | :--- | :--- |
| `customer.created` | `Customer` | New customer registered at desk |
| `payment.processed` | `Payment` | Invoice payment entry completed |
| `appointment.scheduled` | `Appointment` | Appointment created (v1.1) |
| `membership.upgraded` | `CustomerMembership` | Loyalty threshold reached (v1.1) |

---

## 💻 Example Usage

### Subscribing to an Event
```typescript
import { eventBus } from './services/v1_1/eventBus';

const unsubscribe = eventBus.subscribe('payment.processed', async (data) => {
  console.log('Payment notification received:', data);
});
```

### Publishing an Event
```typescript
import { eventBus } from './services/v1_1/eventBus';

await eventBus.publish('payment.processed', { invoiceId: 'RLX-2026-0001', amount: 2500 });
```
