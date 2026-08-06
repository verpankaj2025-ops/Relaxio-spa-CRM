import { SystemNotification } from '../../types/v1_1';
import { moduleRegistry } from './moduleRegistry';

export class NotificationService {
  public async getUserNotifications(userId: string): Promise<SystemNotification[]> {
    if (!moduleRegistry.isFeatureEnabled('enableNotificationsEngine')) {
      return [];
    }

    return [];
  }
}

export const notificationService = new NotificationService();
