import { WhatsAppMessagePayload, WhatsAppDeliveryStatus } from '../../types/v1_1';
import { moduleRegistry } from './moduleRegistry';

export class WhatsAppService {
  public async sendTemplateMessage(payload: WhatsAppMessagePayload): Promise<WhatsAppDeliveryStatus> {
    if (!moduleRegistry.isFeatureEnabled('enableWhatsAppIntegration')) {
      return {
        messageId: 'disabled_v1_0',
        status: 'failed',
        timestamp: new Date().toISOString(),
      };
    }

    // Architecture stub for WhatsApp Business Cloud API
    return {
      messageId: `wa_msg_${Date.now()}`,
      status: 'queued',
      timestamp: new Date().toISOString(),
    };
  }
}

export const whatsAppService = new WhatsAppService();
