interface AnonymousUser {
  id: string;
  name: string;
  createdAt: number;
  lastActive: number;
  sessionCount: number;
}

const STORAGE_KEY = 'animalworld_user';
const NAMES_POOL = [
  'Explorer', 'Scientist', 'Researcher', 'Observer', 'Naturalist',
  'Biologist', 'Ecologist', 'Zoologist', 'Botanist', 'Curator',
  'Keeper', 'Ranger', 'Warden', 'Guardian', 'Caretaker',
  'Hunter', 'Gatherer', 'Wanderer', 'Pioneer', 'Adventurer',
  'Tracker', 'Scout', 'Guide', 'Navigator', 'Pathfinder'
];

export class UserIdentity {
  private user: AnonymousUser | null = null;

  constructor() {
    this.loadUser();
  }

  private loadUser(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const userData = JSON.parse(stored);
        
        // Validate stored data
        if (this.isValidUserData(userData)) {
          this.user = {
            ...userData,
            lastActive: Date.now(),
            sessionCount: userData.sessionCount + 1
          };
          this.saveUser();
          return;
        }
      }
    } catch (error) {
      console.warn('Failed to load user data:', error);
    }

    // Create new user if no valid data found
    this.createNewUser();
  }

  private createNewUser(): void {
    const randomName = NAMES_POOL[Math.floor(Math.random() * NAMES_POOL.length)];
    const randomSuffix = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    
    this.user = {
      id: this.generateUserId(),
      name: `${randomName}${randomSuffix}`,
      createdAt: Date.now(),
      lastActive: Date.now(),
      sessionCount: 1
    };

    this.saveUser();
    console.log('Created new anonymous user:', this.user.name);
  }

  private generateUserId(): string {
    // Use crypto.randomUUID if available, fallback to timestamp + random
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    
    // Fallback UUID generation
    return 'user_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
  }

  private isValidUserData(data: any): boolean {
    return (
      data &&
      typeof data.id === 'string' &&
      typeof data.name === 'string' &&
      typeof data.createdAt === 'number' &&
      typeof data.lastActive === 'number' &&
      typeof data.sessionCount === 'number' &&
      data.id.length > 0 &&
      data.name.length > 0 &&
      data.createdAt > 0
    );
  }

  private saveUser(): void {
    if (!this.user) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.user));
    } catch (error) {
      console.error('Failed to save user data:', error);
    }
  }

  // Public API
  getUser(): AnonymousUser {
    if (!this.user) {
      this.createNewUser();
    }
    return this.user!;
  }

  getUserId(): string {
    return this.getUser().id;
  }

  getUserName(): string {
    return this.getUser().name;
  }

  updateUserName(newName: string): boolean {
    if (!newName || newName.trim().length === 0) {
      return false;
    }

    const trimmedName = newName.trim();
    if (trimmedName.length > 20) {
      return false;
    }

    if (this.user) {
      this.user.name = trimmedName;
      this.user.lastActive = Date.now();
      this.saveUser();
      return true;
    }

    return false;
  }

  updateLastActive(): void {
    if (this.user) {
      this.user.lastActive = Date.now();
      this.saveUser();
    }
  }

  resetUser(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to remove user data:', error);
    }
    
    this.user = null;
    this.createNewUser();
  }

  getSessionInfo(): {
    isNewUser: boolean;
    sessionCount: number;
    daysSinceCreated: number;
  } {
    const user = this.getUser();
    const now = Date.now();
    const daysSinceCreated = Math.floor((now - user.createdAt) / (1000 * 60 * 60 * 24));
    
    return {
      isNewUser: user.sessionCount === 1,
      sessionCount: user.sessionCount,
      daysSinceCreated
    };
  }

  exportUserData(): string {
    return JSON.stringify(this.getUser(), null, 2);
  }

  importUserData(jsonData: string): boolean {
    try {
      const userData = JSON.parse(jsonData);
      
      if (this.isValidUserData(userData)) {
        this.user = {
          ...userData,
          lastActive: Date.now(),
          sessionCount: userData.sessionCount + 1
        };
        this.saveUser();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to import user data:', error);
      return false;
    }
  }
}

// Singleton instance
export const userIdentity = new UserIdentity();

// Convenience functions
export const getUserId = (): string => userIdentity.getUserId();
export const getUserName = (): string => userIdentity.getUserName();
export const updateUserName = (name: string): boolean => userIdentity.updateUserName(name);
export const getSessionInfo = () => userIdentity.getSessionInfo();