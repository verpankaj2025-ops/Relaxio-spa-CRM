import { Appointment } from '../../types/v1_1';
import { moduleRegistry } from './moduleRegistry';

export class AppointmentService {
  public async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    if (!moduleRegistry.isFeatureEnabled('enableAppointmentBooking')) {
      return [];
    }

    // Architecture stub for Appointment calendar fetching
    return [];
  }
}

export const appointmentService = new AppointmentService();
