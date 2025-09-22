// Fingerprint Service - Simulates fingerprint scanning with user management
// In a real implementation, this would integrate with actual fingerprint hardware

export interface UserData {
  fingerprint: string;
  name: string;
  voterId: string;
  publicKey: string;
  privateKey: string;
  registrationDate: string;
  hasVoted: boolean;
  lastLogin: string;
}

export class FingerprintService {
  private static fingerprintDatabase: Map<string, UserData> = new Map();
  private static readonly STORAGE_KEY = 'voting_system_users';

  /**
   * Initialize fingerprint database from localStorage
   */
  static initializeDatabase(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const users = JSON.parse(stored);
        this.fingerprintDatabase = new Map(Object.entries(users));
      }
    } catch (error) {
      console.error('Error loading fingerprint database:', error);
    }
  }

  /**
   * Save fingerprint database to localStorage
   */
  static saveDatabase(): void {
    try {
      const users = Object.fromEntries(this.fingerprintDatabase);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Error saving fingerprint database:', error);
    }
  }

  /**
   * Real fingerprint scanning using WebAuthn API
   * This uses actual biometric hardware for fingerprint authentication
   */
  static async scanFingerprint(): Promise<string> {
    try {
      // Check if we're in a secure context
      if (!window.isSecureContext) {
        throw new Error('Fingerprint scanning requires HTTPS or localhost for security');
      }

      // Check if WebAuthn is supported
      if (!window.PublicKeyCredential) {
        throw new Error('Your browser does not support fingerprint scanning. Please use Chrome, Edge, or Safari.');
      }

      // Check if platform authenticator (fingerprint) is available
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (!available) {
        throw new Error('No fingerprint scanner detected. Please ensure your device has fingerprint support enabled (Windows Hello, Touch ID, etc.)');
      }

      console.log('Fingerprint scanner detected. Starting real authentication...');

      // Create credential options for fingerprint authentication
      const credentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        allowCredentials: [],
        userVerification: 'required',
        timeout: 60000,
        rpId: window.location.hostname,
      };

      // Request fingerprint authentication
      const credential = await navigator.credentials.get({
        publicKey: credentialRequestOptions
      }) as PublicKeyCredential;

      if (!credential) {
        throw new Error('Fingerprint authentication was cancelled or failed');
      }

      // Generate a unique fingerprint ID based on the credential
      const fingerprintId = this.generateFingerprintIdFromCredential(credential);
      
      console.log('Real fingerprint authentication successful:', fingerprintId);
      return fingerprintId;

    } catch (error: any) {
      console.error('Real fingerprint scan failed:', error);
      
      // If it's a user cancellation or specific error, don't fall back to simulation
      if (error.name === 'NotAllowedError' || error.name === 'AbortError') {
        throw new Error('Fingerprint authentication was cancelled. Please try again.');
      }
      
      throw error;
    }
  }

  /**
   * Simulate fingerprint scanning for testing purposes
   * This generates a realistic fingerprint ID without requiring hardware
   */
  static async simulateFingerprintScan(): Promise<string> {
    return new Promise((resolve) => {
      // Simulate realistic scanning delay
      const delay = 1000 + Math.random() * 2000; // 1-3 seconds
      
      setTimeout(() => {
        const fingerprintId = this.generateFingerprintId();
        console.log('Simulated fingerprint scan:', fingerprintId);
        resolve(fingerprintId);
      }, delay);
    });
  }

  /**
   * Check if device supports real fingerprint scanning
   */
  static async isRealFingerprintSupported(): Promise<boolean> {
    try {
      if (!window.isSecureContext || !window.PublicKeyCredential) {
        return false;
      }
      
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch (error) {
      console.error('Error checking fingerprint support:', error);
      return false;
    }
  }

  /**
   * Utility function for delays
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


  /**
   * Generate fingerprint ID from WebAuthn credential
   */
  private static generateFingerprintIdFromCredential(credential: PublicKeyCredential): string {
    // Use credential ID and creation time to generate unique fingerprint ID
    const credentialId = Array.from(new Uint8Array(credential.rawId))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    const timestamp = Date.now();
    return `fp_real_${credentialId.substring(0, 16)}_${timestamp}`;
  }

  /**
   * Generate a unique fingerprint ID for simulation
   */
  private static generateFingerprintId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `fp_${timestamp}_${random}`;
  }

  /**
   * Check if a fingerprint is registered (new or existing user)
   */
  static isFingerprintRegistered(fingerprint: string): boolean {
    return this.fingerprintDatabase.has(fingerprint);
  }

  /**
   * Get user data by fingerprint
   */
  static getUserData(fingerprint: string): UserData | null {
    return this.fingerprintDatabase.get(fingerprint) || null;
  }

  /**
   * Register a new user with fingerprint
   */
  static registerUser(userData: UserData): void {
    this.fingerprintDatabase.set(userData.fingerprint, userData);
    this.saveDatabase();
  }

  /**
   * Update user data (e.g., after voting)
   */
  static updateUser(fingerprint: string, updates: Partial<UserData>): void {
    const existingUser = this.fingerprintDatabase.get(fingerprint);
    if (existingUser) {
      const updatedUser = { ...existingUser, ...updates };
      this.fingerprintDatabase.set(fingerprint, updatedUser);
      this.saveDatabase();
    }
  }

  /**
   * Check if a fingerprint has already voted
   */
  static hasFingerprintVoted(fingerprint: string): boolean {
    const user = this.fingerprintDatabase.get(fingerprint);
    return user ? user.hasVoted : false;
  }

  /**
   * Mark fingerprint as having voted
   */
  static markFingerprintAsVoted(fingerprint: string): void {
    this.updateUser(fingerprint, { hasVoted: true });
  }

  /**
   * Get all registered users
   */
  static getAllUsers(): UserData[] {
    return Array.from(this.fingerprintDatabase.values());
  }

  /**
   * Get all voted fingerprints (for admin purposes)
   */
  static getAllVotedFingerprints(): string[] {
    return Array.from(this.fingerprintDatabase.entries())
      .filter(([_, user]) => user.hasVoted)
      .map(([fingerprint, _]) => fingerprint);
  }

  /**
   * Reset fingerprint database (for testing)
   */
  static resetDatabase(): void {
    this.fingerprintDatabase.clear();
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Get fingerprint statistics
   */
  static getFingerprintStats(): { 
    totalUsers: number; 
    totalVoted: number; 
    newUsers: number;
    returningUsers: number;
  } {
    const users = this.getAllUsers();
    const voted = users.filter(user => user.hasVoted).length;
    const today = new Date().toDateString();
    const newToday = users.filter(user => 
      new Date(user.registrationDate).toDateString() === today
    ).length;
    
    return {
      totalUsers: users.length,
      totalVoted: voted,
      newUsers: newToday,
      returningUsers: users.length - newToday
    };
  }

  /**
   * Export all user data as JSON
   */
  static exportUserData(): string {
    const users = Object.fromEntries(this.fingerprintDatabase);
    return JSON.stringify(users, null, 2);
  }

  /**
   * Import user data from JSON
   */
  static importUserData(jsonData: string): boolean {
    try {
      const users = JSON.parse(jsonData);
      this.fingerprintDatabase = new Map(Object.entries(users));
      this.saveDatabase();
      return true;
    } catch (error) {
      console.error('Error importing user data:', error);
      return false;
    }
  }
}
