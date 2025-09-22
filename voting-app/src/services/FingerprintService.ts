import * as LocalAuthentication from 'expo-local-authentication';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

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
  private static readonly STORAGE_KEY = 'voting_system_users';

  /**
   * Check if fingerprint authentication is available
   */
  static async isAvailable(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch (error) {
      console.error('Error checking fingerprint availability:', error);
      return false;
    }
  }

  /**
   * Authenticate using fingerprint
   */
  static async authenticate(): Promise<boolean> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate with your fingerprint to vote',
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use Password',
        disableDeviceFallback: false,
      });

      return result.success;
    } catch (error) {
      console.error('Fingerprint authentication error:', error);
      return false;
    }
  }

  /**
   * Generate a unique fingerprint ID
   */
  static generateFingerprintId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `fp_${timestamp}_${random}`;
  }

  /**
   * Check if a fingerprint is registered
   */
  static async isFingerprintRegistered(fingerprint: string): Promise<boolean> {
    try {
      const stored = await SecureStore.getItemAsync(this.STORAGE_KEY);
      if (stored) {
        const users = JSON.parse(stored);
        return users.hasOwnProperty(fingerprint);
      }
      return false;
    } catch (error) {
      console.error('Error checking fingerprint registration:', error);
      return false;
    }
  }

  /**
   * Get user data by fingerprint
   */
  static async getUserData(fingerprint: string): Promise<UserData | null> {
    try {
      const stored = await SecureStore.getItemAsync(this.STORAGE_KEY);
      if (stored) {
        const users = JSON.parse(stored);
        return users[fingerprint] || null;
      }
      return null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  /**
   * Register a new user
   */
  static async registerUser(userData: UserData): Promise<void> {
    try {
      const stored = await SecureStore.getItemAsync(this.STORAGE_KEY);
      const users = stored ? JSON.parse(stored) : {};
      users[userData.fingerprint] = userData;
      await SecureStore.setItemAsync(this.STORAGE_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }

  /**
   * Update user data
   */
  static async updateUser(fingerprint: string, updates: Partial<UserData>): Promise<void> {
    try {
      const stored = await SecureStore.getItemAsync(this.STORAGE_KEY);
      if (stored) {
        const users = JSON.parse(stored);
        if (users[fingerprint]) {
          users[fingerprint] = { ...users[fingerprint], ...updates };
          await SecureStore.setItemAsync(this.STORAGE_KEY, JSON.stringify(users));
        }
      }
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Check if user has voted
   */
  static async hasUserVoted(fingerprint: string): Promise<boolean> {
    try {
      const userData = await this.getUserData(fingerprint);
      return userData ? userData.hasVoted : false;
    } catch (error) {
      console.error('Error checking vote status:', error);
      return false;
    }
  }

  /**
   * Mark user as voted
   */
  static async markUserAsVoted(fingerprint: string): Promise<void> {
    try {
      await this.updateUser(fingerprint, { hasVoted: true });
    } catch (error) {
      console.error('Error marking user as voted:', error);
      throw error;
    }
  }

  /**
   * Get all users
   */
  static async getAllUsers(): Promise<UserData[]> {
    try {
      const stored = await SecureStore.getItemAsync(this.STORAGE_KEY);
      if (stored) {
        const users = JSON.parse(stored);
        return Object.values(users);
      }
      return [];
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  /**
   * Generate cryptographic keys
   */
  static async generateKeys(): Promise<{ publicKey: string; privateKey: string }> {
    try {
      const privateKey = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `${Date.now()}_${Math.random()}`,
        { encoding: Crypto.CryptoEncoding.HEX }
      );
      
      const publicKey = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        privateKey,
        { encoding: Crypto.CryptoEncoding.HEX }
      );

      return { publicKey, privateKey };
    } catch (error) {
      console.error('Error generating keys:', error);
      throw error;
    }
  }
}
