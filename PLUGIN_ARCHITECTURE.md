# Plugin Architecture - Relaxio Spa CRM

## Overview
The Plugin Architecture allows third-party or ancillary features (AI Insights, WhatsApp, Payment Gateways, ERP Sync) to be loaded dynamically without modifying core v1.0.0 application code.

---

## 🔌 Plugin Contract
Every plugin implements the `PluginModule` interface defined in `src/services/v1_1/eventBus.ts`:

```typescript
export interface PluginModule {
  id: string;
  name: string;
  version: string;
  requiredFeatureFlag: keyof ModuleFeatureFlags;
  initialize: () => Promise<void>;
}
```

---

## ⚙️ Lifecycle
1. **Registration**: Plugins are registered into `pluginRegistry` during application boot.
2. **Evaluation**: `pluginRegistry.initializeActivePlugins()` iterates over registered plugins.
3. **Execution**: If `requiredFeatureFlag` evaluates to `true`, `initialize()` is executed asynchronously.
4. **Isolation**: If a plugin fails during initialization, error boundary isolation prevents core CRM crash.
