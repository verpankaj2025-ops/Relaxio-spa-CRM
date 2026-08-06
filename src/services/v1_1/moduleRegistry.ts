import { ModuleFeatureFlags } from '../../types/v1_1';

/**
 * Version 1.1 Module Registry
 * All modules default to `false` in Version 1.0.0 to ensure 100% production stability.
 */
export const V1_1_FEATURE_FLAGS: ModuleFeatureFlags = {
  enableAIAssistant: false,
  enableWhatsAppIntegration: false,
  enableAppointmentBooking: false,
  enableMembershipTiers: false,
  enableAdvancedAnalytics: false,
  enableNotificationsEngine: false,
  enableMultiBranch: false,
  enablePermissionsExpansion: false,
};

export class ModuleRegistryService {
  private flags: ModuleFeatureFlags = { ...V1_1_FEATURE_FLAGS };

  public isFeatureEnabled(feature: keyof ModuleFeatureFlags): boolean {
    return this.flags[feature] ?? false;
  }

  public getActiveFeatureFlags(): ModuleFeatureFlags {
    return { ...this.flags };
  }
}

export const moduleRegistry = new ModuleRegistryService();
