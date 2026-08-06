import { Branch } from '../../types/v1_1';
import { moduleRegistry } from './moduleRegistry';

export class MultiBranchService {
  public async getAllBranches(): Promise<Branch[]> {
    if (!moduleRegistry.isFeatureEnabled('enableMultiBranch')) {
      return [
        {
          id: 'branch_default',
          code: 'MAIN-01',
          name: 'Relaxio Main Flagship Spa',
          city: 'Mumbai',
          address: 'Main Spa Center, Floor 2',
          phone: '+919876543210',
          managerUserId: 'usr_admin',
          isActive: true,
        },
      ];
    }

    return [];
  }
}

export const multiBranchService = new MultiBranchService();
