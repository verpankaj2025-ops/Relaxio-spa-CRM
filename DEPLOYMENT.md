# Relaxio Spa - Production Deployment Guide & Security Best Practices

This guide walks through deploying the **Relaxio Spa Customer Management System** to production with **Supabase Database** and **Vercel / Cloud Run**.

---

## 🗄️ 1. Supabase Database & Auth Setup

1. Log into your [Supabase Dashboard](https://supabase.com).
2. Create a new project named `relaxio-spa-prod`.
3. Go to **SQL Editor** in the left menu.
4. Copy the complete contents of `/supabase/schema.sql` from this codebase and run the query.
5. This provisions:
   - Tables: `users`, `roles`, `customers`, `therapists`, `rooms`, `agents`, `payments`, `services`, `visit_history`, `audit_logs`, `settings`.
   - Auto-generated Invoice sequence (`RLX-YYYY-XXXX`).
   - Row Level Security (RLS) policies for authenticated staff & Super Admin.

---

## 🔑 2. Environment Variables Configuration

Declare these environment variables in your server or Cloud Run settings:

```env
# Application Host URL
APP_URL="https://your-domain.com"

# Supabase Credentials
SUPABASE_URL="https://your-project-id.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Gemini API Key (Optional for smart insights)
GEMINI_API_KEY="your-gemini-key"

# Server Port
PORT=3000
NODE_ENV="production"
```

---

## 🚀 3. Build & Container Deployment

### Standard Build:
```bash
npm run build
npm run start
```

### Docker Container Deployment (Cloud Run):
```dockerfile
FROM node:20-alpine WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
```

---

## 🛡️ 4. Security Best Practices Implemented

1. **Role-Based Access Control (RBAC)**:
   - Super Admin holds exclusive rights to raw data exports, backup restoration, and user provisioning.
   - Admins handle operational records and room management.
   - Staff desks handle check-ins and session updates without export or deletion permissions.

2. **Session Inactivity Protection**:
   - Automated inactivity monitor logs out dormant sessions after 5 minutes of idle time.

3. **Immutable Audit Logs**:
   - Every creation, modification, deletion, and export action is logged with user details, timestamp, and IP address.

4. **Row Level Security (RLS)**:
   - Database tables are protected by RLS rules restricting unauthorized reads/writes.
