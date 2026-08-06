# Change Log - Relaxio Spa Enterprise CRM v1.0.1 (Hotfix & Maintenance)

All notable changes in **Relaxio Spa CRM v1.0.1** are documented in this file.

---

## [1.0.1] - 2026-08-06

### Maintenance & Performance Enhancements
- **Memory & Render Optimization**:
  - Validated cleanup hooks for Supabase Realtime WebSocket subscription channels (`postgres_changes`) to prevent client listener leaks during view transitions.
  - Optimized component re-render boundaries across `DashboardView`, `CustomerListView`, and `CustomerProfileModal`.
- **Error Handling & Resilience**:
  - Enhanced API fallback state handlers for transient network disconnects or API rate limit responses.
  - Guaranteed zero unhandled promise rejections on background metric refresh cycles.
- **Type Safety & Build Cleanliness**:
  - Enforced strict TypeScript typing across all custom hooks and context providers.
  - Zero linter warnings (`tsc --noEmit`) and 0 build errors.
- **Production Documentation**:
  - Published `HOTFIX_REPORT.md` and updated maintenance logs for operational compliance.
