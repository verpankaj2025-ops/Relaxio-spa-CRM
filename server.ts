import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { initialUsers, initialCustomers, initialTherapists, initialRooms, initialAgents, initialServices, initialAuditLogs, initialSettings } from './src/data/mockInitialData';
import { User, Customer, Therapist, Room, Agent, Service, AuditLog, SpaSettings } from './src/types';

// In-Memory Database initialized with initial data (Persisted in server memory & synced with client)
let dbUsers: User[] = [...initialUsers];
let dbCustomers: Customer[] = [...initialCustomers];
let dbTherapists: Therapist[] = [...initialTherapists];
let dbRooms: Room[] = [...initialRooms];
let dbAgents: Agent[] = [...initialAgents];
let dbServices: Service[] = [...initialServices];
let dbAuditLogs: AuditLog[] = [...initialAuditLogs];
let dbSettings: SpaSettings = { ...initialSettings };

let invoiceCounter = 1007;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Helper for logging audit actions
  function logAudit(userId: string, userName: string, userRole: any, action: any, targetEntity: string, targetId: string | undefined, details: string, req: Request) {
    const log: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: userId || 'sys',
      userName: userName || 'System',
      userRole: userRole || 'staff',
      action,
      targetEntity,
      targetId,
      details,
      ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1',
      timestamp: new Date().toISOString(),
    };
    dbAuditLogs.unshift(log);
  }

  // API ROUTES

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', spa: dbSettings.spaName, time: new Date().toISOString() });
  });

  // Auth Login
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      res.status(400).json({ error: 'Mobile number or Email and Password required' });
      return;
    }

    const user = dbUsers.find(u => (u.email.toLowerCase() === identifier.toLowerCase() || u.phone === identifier) && u.status === 'active');

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials or user account suspended' });
      return;
    }

    // Update last login
    user.lastLogin = new Date().toISOString();

    logAudit(user.id, user.name, user.role, 'LOGIN', 'system', undefined, `User logged in via ${user.email}`, req);

    res.json({
      user,
      token: `fake-jwt-token-${user.id}-${Date.now()}`,
    });
  });

  // Customers Routes
  app.get('/api/customers', (req: Request, res: Response) => {
    res.json(dbCustomers);
  });

  app.post('/api/customers', (req: Request, res: Response) => {
    const customerData = req.body;
    const invNumber = `RLX-2026-${invoiceCounter++}`;

    const newCustomer: Customer = {
      ...customerData,
      id: `cust-${Date.now()}`,
      invoiceNumber: customerData.invoiceNumber || invNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dbCustomers.unshift(newCustomer);

    // Update therapist stats
    if (newCustomer.therapistId) {
      const therapist = dbTherapists.find(t => t.id === newCustomer.therapistId);
      if (therapist) {
        therapist.totalSessions += 1;
        therapist.totalRevenue += newCustomer.amountPaid;
      }
    }

    // Update room status
    if (newCustomer.roomId && newCustomer.status === 'Running') {
      const room = dbRooms.find(r => r.id === newCustomer.roomId);
      if (room) {
        room.status = 'occupied';
      }
    }

    // Update agent stats
    if (newCustomer.agentId) {
      const agent = dbAgents.find(a => a.id === newCustomer.agentId);
      if (agent) {
        agent.totalReferrals += 1;
        agent.totalRevenueGenerated += newCustomer.amountPaid;
      }
    }

    logAudit(customerData.createdByUserId, customerData.createdBy || 'Staff', customerData.createdByRole || 'staff', 'CREATE_CUSTOMER', 'customer', newCustomer.id, `Created invoice ${newCustomer.invoiceNumber} for ${newCustomer.name} (${newCustomer.mobile}) - ${dbSettings.currencySymbol}${newCustomer.amountPaid}`, req);

    res.status(201).json(newCustomer);
  });

  app.put('/api/customers/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = dbCustomers.findIndex(c => c.id === id);

    if (index === -1) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    const prevCustomer = dbCustomers[index];
    const updatedCustomer: Customer = {
      ...prevCustomer,
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    dbCustomers[index] = updatedCustomer;

    // Free up room if completed or cancelled
    if (updatedCustomer.roomId && updatedCustomer.status !== 'Running' && prevCustomer.status === 'Running') {
      const room = dbRooms.find(r => r.id === updatedCustomer.roomId);
      if (room) {
        room.status = 'available';
      }
    }

    logAudit(req.body.updatedByUserId, req.body.updatedBy || 'Staff', req.body.updatedByRole || 'staff', 'UPDATE_CUSTOMER', 'customer', id, `Updated entry ${updatedCustomer.invoiceNumber} status to ${updatedCustomer.status}`, req);

    res.json(updatedCustomer);
  });

  app.delete('/api/customers/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const { userRole, userName, userId } = req.query;

    if (userRole !== 'super_admin' && userRole !== 'admin') {
      res.status(403).json({ error: 'Forbidden: Only Super Admin and Admin can delete customer records' });
      return;
    }

    const customer = dbCustomers.find(c => c.id === id);
    if (customer) {
      dbCustomers = dbCustomers.filter(c => c.id !== id);
      logAudit(userId as string, userName as string, userRole as any, 'DELETE_CUSTOMER', 'customer', id, `Deleted record ${customer.invoiceNumber} for ${customer.name}`, req);
    }

    res.json({ success: true, message: 'Record deleted' });
  });

  // Mobile duplicate history search
  app.get('/api/customers/search-mobile/:mobile', (req: Request, res: Response) => {
    const { mobile } = req.params;
    const matches = dbCustomers.filter(c => c.mobile === mobile);
    res.json(matches);
  });

  // User management
  app.get('/api/users', (req: Request, res: Response) => {
    res.json(dbUsers);
  });

  app.post('/api/users', (req: Request, res: Response) => {
    const { requesterRole, name, email, phone, role } = req.body;

    if (requesterRole !== 'super_admin') {
      res.status(403).json({ error: 'Only Super Admin can create user accounts' });
      return;
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      email,
      phone,
      role,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    dbUsers.push(newUser);
    logAudit(req.body.requesterId, req.body.requesterName, requesterRole, 'CREATE_USER', 'user', newUser.id, `Created ${role} account for ${name} (${email})`, req);

    res.status(201).json(newUser);
  });

  app.put('/api/users/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const { requesterRole, status, role, password } = req.body;

    if (requesterRole !== 'super_admin') {
      res.status(403).json({ error: 'Only Super Admin can edit user accounts' });
      return;
    }

    const user = dbUsers.find(u => u.id === id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.role === 'super_admin' && status === 'suspended' && dbUsers.filter(u => u.role === 'super_admin' && u.status === 'active').length <= 1) {
      res.status(400).json({ error: 'Cannot suspend the primary Super Admin account' });
      return;
    }

    if (status) user.status = status;
    if (role) user.role = role;

    logAudit(req.body.requesterId, req.body.requesterName, requesterRole, 'UPDATE_USER', 'user', id, `Updated account ${user.name} - Status: ${user.status}, Role: ${user.role}`, req);

    res.json(user);
  });

  app.delete('/api/users/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const { requesterRole, requesterId, requesterName } = req.query;

    if (requesterRole !== 'super_admin') {
      res.status(403).json({ error: 'Only Super Admin can delete users' });
      return;
    }

    const userToDelete = dbUsers.find(u => u.id === id);
    if (userToDelete?.role === 'super_admin') {
      res.status(400).json({ error: 'Cannot delete Super Admin account' });
      return;
    }

    dbUsers = dbUsers.filter(u => u.id !== id);
    logAudit(requesterId as string, requesterName as string, requesterRole as any, 'DELETE_USER', 'user', id, `Deleted user account ${userToDelete?.name}`, req);

    res.json({ success: true });
  });

  // Settings, Therapists, Rooms, Agents, Services getters & setters
  app.get('/api/settings', (req: Request, res: Response) => res.json(dbSettings));
  app.post('/api/settings', (req: Request, res: Response) => {
    dbSettings = { ...dbSettings, ...req.body.settings };
    logAudit(req.body.userId, req.body.userName, req.body.userRole, 'UPDATE_SETTINGS', 'settings', 'general', 'Updated spa configuration settings', req);
    res.json(dbSettings);
  });

  app.get('/api/therapists', (req: Request, res: Response) => res.json(dbTherapists));
  app.post('/api/therapists', (req: Request, res: Response) => {
    const newT = { id: `th-${Date.now()}`, totalSessions: 0, totalRevenue: 0, rating: 5.0, status: 'active', ...req.body };
    dbTherapists.push(newT);
    res.json(newT);
  });

  app.get('/api/rooms', (req: Request, res: Response) => res.json(dbRooms));
  app.post('/api/rooms', (req: Request, res: Response) => {
    const newR = { id: `rm-${Date.now()}`, status: 'available', ...req.body };
    dbRooms.push(newR);
    res.json(newR);
  });

  app.get('/api/agents', (req: Request, res: Response) => res.json(dbAgents));
  app.post('/api/agents', (req: Request, res: Response) => {
    const newA = { id: `ag-${Date.now()}`, totalReferrals: 0, totalRevenueGenerated: 0, status: 'active', ...req.body };
    dbAgents.push(newA);
    res.json(newA);
  });

  app.get('/api/services', (req: Request, res: Response) => res.json(dbServices));
  app.post('/api/services', (req: Request, res: Response) => {
    const newS = { id: `srv-${Date.now()}`, ...req.body };
    dbServices.push(newS);
    res.json(newS);
  });

  app.get('/api/audit-logs', (req: Request, res: Response) => res.json(dbAuditLogs));

  // Backup & Restore
  app.get('/api/backup', (req: Request, res: Response) => {
    const { userRole, userName, userId } = req.query;
    if (userRole !== 'super_admin') {
      res.status(403).json({ error: 'Only Super Admin can download database backup' });
      return;
    }

    logAudit(userId as string, userName as string, userRole as any, 'EXPORT_DATA', 'system', 'backup', 'Downloaded full database JSON backup snapshot', req);

    res.json({
      exportTimestamp: new Date().toISOString(),
      version: '1.0',
      users: dbUsers,
      customers: dbCustomers,
      therapists: dbTherapists,
      rooms: dbRooms,
      agents: dbAgents,
      services: dbServices,
      auditLogs: dbAuditLogs,
      settings: dbSettings,
    });
  });

  app.post('/api/restore', (req: Request, res: Response) => {
    const { userRole, userName, userId, backupData } = req.body;
    if (userRole !== 'super_admin') {
      res.status(403).json({ error: 'Only Super Admin can restore database backup' });
      return;
    }

    if (!backupData || !backupData.customers) {
      res.status(400).json({ error: 'Invalid backup payload format' });
      return;
    }

    if (backupData.users) dbUsers = backupData.users;
    if (backupData.customers) dbCustomers = backupData.customers;
    if (backupData.therapists) dbTherapists = backupData.therapists;
    if (backupData.rooms) dbRooms = backupData.rooms;
    if (backupData.agents) dbAgents = backupData.agents;
    if (backupData.services) dbServices = backupData.services;
    if (backupData.settings) dbSettings = backupData.settings;

    logAudit(userId, userName, userRole, 'RESTORE_BACKUP', 'system', 'restore', `Restored database backup from snapshot dated ${backupData.exportTimestamp || 'Unknown'}`, req);

    res.json({ success: true, message: 'Database state successfully restored' });
  });

  // Vite Middleware for Dev and Express Static Serving for Prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Relaxio Spa Backend] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
