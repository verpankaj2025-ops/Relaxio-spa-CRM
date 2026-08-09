import { Branch } from '../../types/v1_1';
import { moduleRegistry } from './moduleRegistry';

export class MultiBranchService {
  public async getAllBranches(): Promise<Branch[]> {
    if (!moduleRegistry.isFeatureEnabled('enableMultiBranch')) {
      return [
        {
          id: 'branch_default',
          code: 'MAIN-01',
          name: 'Main Center',
          city: '',
          address: '',
          phone: '',
          managerUserId: '',
          isActive: true,
        },
      ];
    }

    return [];
  }
}

export const multiBranchService = new MultiBranchService();
