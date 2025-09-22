import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
}

export class SupabaseService {
  private client: SupabaseClient;
  private serviceClient: SupabaseClient;

  constructor(config: SupabaseConfig) {
    this.client = createClient(config.url, config.anonKey);
    
    if (config.serviceRoleKey) {
      this.serviceClient = createClient(config.url, config.serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
    } else {
      this.serviceClient = this.client;
    }
  }

  /**
   * Get the public client (for frontend use)
   */
  getClient(): SupabaseClient {
    return this.client;
  }

  /**
   * Get the service role client (for backend operations)
   */
  getServiceClient(): SupabaseClient {
    return this.serviceClient;
  }

  /**
   * Test the connection to Supabase
   */
  async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await this.client
        .from('voters')
        .select('count')
        .limit(1);
      
      return !error;
    } catch (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
  }

  /**
   * Get database statistics
   */
  async getDatabaseStats(): Promise<{
    voters: number;
    votes: number;
    blocks: number;
    candidates: number;
  }> {
    try {
      const [votersResult, votesResult, blocksResult, candidatesResult] = await Promise.all([
        this.client.from('voters').select('*', { count: 'exact', head: true }),
        this.client.from('votes').select('*', { count: 'exact', head: true }),
        this.client.from('blocks').select('*', { count: 'exact', head: true }),
        this.client.from('candidates').select('*', { count: 'exact', head: true })
      ]);

      return {
        voters: votersResult.count || 0,
        votes: votesResult.count || 0,
        blocks: blocksResult.count || 0,
        candidates: candidatesResult.count || 0
      };
    } catch (error) {
      console.error('Error getting database stats:', error);
      return {
        voters: 0,
        votes: 0,
        blocks: 0,
        candidates: 0
      };
    }
  }
}

// Singleton instance
let supabaseService: SupabaseService | null = null;

export function initializeSupabase(config: SupabaseConfig): SupabaseService {
  if (!supabaseService) {
    supabaseService = new SupabaseService(config);
  }
  return supabaseService;
}

export function getSupabaseService(): SupabaseService {
  if (!supabaseService) {
    throw new Error('Supabase service not initialized. Call initializeSupabase first.');
  }
  return supabaseService;
}
