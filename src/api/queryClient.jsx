import { appParams } from '@/lib/app-params';

/**
 * Unified API client that handles both local development and Base44 deployment
 * - In VS Code: Uses localStorage with fallback to JSON file
 * - In Base44: Uses Base44 SDK
 */

const isBase44Environment = () => {
  return appParams?.appId && appParams?.token;
};

class QueryClient {
  constructor() {
    this.isLocal = !isBase44Environment();
    this.storageKey = 'saved-queries';
    this.initializeStorage();
  }

  initializeStorage() {
    if (this.isLocal && typeof window !== 'undefined') {
      const existing = localStorage.getItem(this.storageKey);
      if (!existing) {
        localStorage.setItem(this.storageKey, JSON.stringify([]));
      }
    }
  }

  // Get all queries
  async getAllQueries() {
    try {
      if (this.isLocal) {
        const data = localStorage.getItem(this.storageKey);
        return JSON.parse(data || '[]');
      } else {
        // Base44 implementation
        return await this.base44Query('select * from saved_queries');
      }
    } catch (error) {
      console.error('Error fetching queries:', error);
      return [];
    }
  }

  // Get query by ID
  async getQuery(id) {
    try {
      if (this.isLocal) {
        const queries = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
        return queries.find(q => q.id === id) || null;
      } else {
        // Base44 implementation
        return await this.base44Query(`select * from saved_queries where id = '${id}'`);
      }
    } catch (error) {
      console.error('Error fetching query:', error);
      return null;
    }
  }

  // Create new query
  async createQuery(queryData) {
    try {
      if (this.isLocal) {
        const queries = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
        
        const newQuery = {
          id: Date.now().toString(),
          ...queryData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: 'local-user'
        };
        
        queries.push(newQuery);
        localStorage.setItem(this.storageKey, JSON.stringify(queries));
        return newQuery;
      } else {
        // Base44 implementation
        return await this.base44Mutation('insertSavedQuery', queryData);
      }
    } catch (error) {
      console.error('Error creating query:', error);
      throw error;
    }
  }

  // Update query
  async updateQuery(id, updates) {
    try {
      if (this.isLocal) {
        const queries = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
        const index = queries.findIndex(q => q.id === id);
        
        if (index === -1) {
          throw new Error(`Query with id ${id} not found`);
        }
        
        queries[index] = {
          ...queries[index],
          ...updates,
          updated_at: new Date().toISOString()
        };
        
        localStorage.setItem(this.storageKey, JSON.stringify(queries));
        return queries[index];
      } else {
        // Base44 implementation
        return await this.base44Mutation('updateSavedQuery', { id, ...updates });
      }
    } catch (error) {
      console.error('Error updating query:', error);
      throw error;
    }
  }

  // Delete query
  async deleteQuery(id) {
    try {
      if (this.isLocal) {
        const queries = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
        const filtered = queries.filter(q => q.id !== id);
        localStorage.setItem(this.storageKey, JSON.stringify(filtered));
        return true;
      } else {
        // Base44 implementation
        return await this.base44Mutation('deleteSavedQuery', { id });
      }
    } catch (error) {
      console.error('Error deleting query:', error);
      throw error;
    }
  }

  // Toggle favorite status
  async toggleFavorite(id) {
    try {
      const query = await this.getQuery(id);
      if (!query) throw new Error('Query not found');
      return await this.updateQuery(id, { is_favorite: !query.is_favorite });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  }

  // Search by tags
  async searchByTags(tags) {
    try {
      if (this.isLocal) {
        const queries = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
        return queries.filter(q => 
          q.tags && tags.some(tag => q.tags.includes(tag))
        );
      } else {
        // Base44 implementation
        return await this.base44Query(`select * from saved_queries where tags && $1`, [tags]);
      }
    } catch (error) {
      console.error('Error searching queries:', error);
      return [];
    }
  }

  // Placeholder for Base44 queries (implement when deploying)
  async base44Query(query) {
    console.warn('Base44 query not implemented:', query);
    return [];
  }

  // Placeholder for Base44 mutations (implement when deploying)
  async base44Mutation(mutation, data) {
    console.warn('Base44 mutation not implemented:', mutation, data);
    return null;
  }
}

export const queryClient = new QueryClient();

export default queryClient;
