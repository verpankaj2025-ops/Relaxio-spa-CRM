import { CustomerMembership } from '../../types/v1_1';
import { moduleRegistry } from './moduleRegistry';

export class MembershipService {
  public async getMembershipByCustomerId(customerId: string): Promise<CustomerMembership | null> {
    if (!moduleRegistry.isFeatureEnabled('enableMembershipTiers')) {
      return null;
    }

    // Architecture stub for Customer Memberships
    return null;
  }
}

export const membershipService = new MembershipService();
