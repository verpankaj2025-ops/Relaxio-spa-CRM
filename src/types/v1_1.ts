// Version 1.1 Feature Types & Architecture Definitions (Disabled by default in v1.0.0)

export interface ModuleFeatureFlags {
  enableAIAssistant: boolean;
  enableWhatsAppIntegration: boolean;
  enableAppointmentBooking: boolean;
  enableMembershipTiers: boolean;
  enableAdvancedAnalytics: boolean;
  enableNotificationsEngine: boolean;
  enableMultiBranch: boolean;
  enablePermissionsExpansion: boolean;
}

// 1. AI Assistant Types
export interface AIAssistantRequest {
  prompt: string;
  context?: 'revenue' | 'therapist_scheduling' | 'customer_retention';
  parameters?: Record<string, unknown>;
}

export interface AIAssistantResponse {
  insightText: string;
  suggestedActions: string[];
  confidenceScore: number;
}

// 2. WhatsApp Integration Types
export type WhatsAppMessageType = 'INVOICE_PDF' | 'BOOKING_REMINDER' | 'FEEDBACK_REQUEST' | 'PROMOTIONAL_OFFER';

export interface WhatsAppMessagePayload {
  recipientPhone: string;
  templateName: string;
  parameters: Record<string, string>;
  mediaUrl?: string;
}

export interface WhatsAppDeliveryStatus {
  messageId: string;
  status: 'queued' | 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
}

// 3. Appointment System Types
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

export interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  therapistId: string;
  therapistName: string;
  serviceId: string;
  serviceName: string;
  appointmentDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: AppointmentStatus;
  branchId: string;
  notes?: string;
  createdAt: string;
}

// 4. Membership Types
export type MembershipTier = 'Silver' | 'Gold' | 'Platinum' | 'VIP Royal';

export interface CustomerMembership {
  id: string;
  customerId: string;
  tier: MembershipTier;
  creditBalance: number;
  loyaltyPoints: number;
  discountPercentage: number;
  validUntil: string;
  status: 'active' | 'expired' | 'suspended';
}

// 5. Analytics Types
export interface AdvancedAnalyticsMetrics {
  customerRetentionRatePct: number;
  therapistUtilizationPct: number;
  peakHourDistribution: { hour: number; customerCount: number }[];
  categoryRevenueShare: { category: string; revenue: number }[];
  cohortAnalysis: { cohortMonth: string; repeatRatePct: number }[];
}

// 6. Notifications Engine Types
export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'SMS' | 'WHATSAPP';

export interface SystemNotification {
  id: string;
  recipientUserId: string;
  title: string;
  body: string;
  channel: NotificationChannel;
  isRead: boolean;
  createdAt: string;
}

// 7. Multi-Branch Types
export interface Branch {
  id: string;
  code: string; // e.g. BR-01
  name: string;
  city: string;
  address: string;
  phone: string;
  managerUserId: string;
  isActive: boolean;
}

// 8. Permissions Expansion Types
export type CustomPermission =
  | 'VIEW_REVENUE'
  | 'EXPORT_FINANCIALS'
  | 'MANAGE_USERS'
  | 'MANAGE_INVENTORY'
  | 'APPLY_CUSTOM_DISCOUNT'
  | 'VOID_INVOICE'
  | 'ACCESS_AUDIT_LOGS';

export interface RolePermissionMatrix {
  role: string;
  permissions: CustomPermission[];
}
