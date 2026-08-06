# Backup & Disaster Recovery Guide - Relaxio Spa CRM

This document defines the operational procedures for backing up, restoring, and maintaining data availability for the **Relaxio Spa Customer Relationship Management System**.

---

## 💾 1. Database Backup Strategy

### A. Automated Daily Backups (Supabase Platform)
- **Schedule**: Automatic daily physical snapshots conducted at 02:00 UTC.
- **Retention**:
  - Pro / Enterprise Tier: 7-day or 30-day continuous point-in-time recovery (PITR).
  - Free Tier: Daily snapshots retained for 7 days.
- **Location**: Geographically redundant cloud storage provided by Supabase.

### B. Manual Command-Line Database Export
To create an immediate local SQL snapshot before applying schema changes or major updates:

```bash
# Export full schema and data using Supabase CLI
supabase db dump -p <your-db-password> --clean --file relaxio_backup_$(date +%Y%m%d_%H%M%S).sql

# Export schema only
supabase db dump -p <your-db-password> --schema-only --file relaxio_schema_$(date +%Y%m%d).sql

# Export data only
supabase db dump -p <your-db-password> --data-only --file relaxio_data_$(date +%Y%m%d).sql
```

---

## 🔄 2. Restore & Disaster Recovery Procedure

### Scenario A: Rollback to a Previous Point in Time (PITR)
1. Navigate to the **Supabase Dashboard** -> **Project Settings** -> **Database**.
2. Click **Point in Time Recovery**.
3. Select the target restore timestamp prior to the failure event.
4. Click **Restore Database**. Recovery completes within 5-15 minutes depending on database size.

### Scenario B: Restoring from a Local SQL Backup Dump
If restoring to a fresh or secondary database instance:

1. Provision a new Supabase PostgreSQL database instance.
2. Run the restore command using psql or the Supabase CLI:

```bash
psql -h db.<your-project-id>.supabase.co -U postgres -d postgres -f relaxio_backup_20260806_120000.sql
```

3. Re-enable Supabase Realtime publication on `customers` and `payments` tables:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE customers;
ALTER PUBLICATION supabase_realtime ADD TABLE payments;
```

---

## 🔑 3. Environment Variable & Secrets Recovery

If environment credentials are lost or compromised:

1. **Rotate Supabase Service Role & Anon Keys**:
   - Go to **Supabase Settings** -> **API**.
   - Click **JWT Secret** -> **Generate New Secret**.
   - Copy the newly issued `ANON_KEY` and `SERVICE_ROLE_KEY`.

2. **Update Vercel / Cloud Run Secrets**:
   ```bash
   # Update Vercel production environment variables
   vercel env add VITE_SUPABASE_ANON_KEY production
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
   
   # Trigger a clean deployment
   vercel --prod
   ```

---

## 🚀 4. Deployment Rollback Procedure

If a bad application build is deployed to production:

### Rollback on Vercel:
1. Open the **Vercel Dashboard** -> **Deployments**.
2. Locate the previous healthy deployment.
3. Click the `...` context menu and select **Instant Rollback**.
4. Traffic will redirect to the previous deployment build in under 5 seconds.

### Rollback on Cloud Run:
```bash
# List previous revisions
gcloud run revisions list --service=relaxio-spa --region=asia-southeast1

# Route 100% of traffic to previous revision
gcloud run services update-traffic relaxio-spa --to-revisions=REVISION_NAME=100
```

---

## 📊 5. Audit Logging & Compliance Verification

In the event of a suspected security incident:
1. Query the immutable `audit_logs` table directly from Supabase SQL Editor:
```sql
SELECT * FROM audit_logs
WHERE action IN ('DELETE', 'EXPORT', 'USER_ROLE_CHANGE')
ORDER BY created_at DESC
LIMIT 100;
```
2. Identify the user ID, timestamp, and action details associated with the anomaly.
