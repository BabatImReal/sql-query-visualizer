import { useEffect, useState, useCallback } from 'react';
import { queryClient } from '@/api/queryClient';

/**
 * Hook to manage saved queries
 * Works in both local (VS Code) and Base44 environments
 */
export const useSavedQueries = () => {
  const [queries, setQueries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load queries on mount
  useEffect(() => {
    loadQueries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadQueries = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await queryClient.getAllQueries();
      setQueries(data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading queries:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveQuery = useCallback(async (queryData) => {
    try {
      setError(null);
      const newQuery = await queryClient.createQuery(queryData);
      setQueries(prev => [...prev, newQuery]);
      return newQuery;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const updateQuery = useCallback(async (id, updates) => {
    try {
      setError(null);
      const updated = await queryClient.updateQuery(id, updates);
      setQueries(prev => prev.map(q => q.id === id ? updated : q));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const deleteQuery = useCallback(async (id) => {
    try {
      setError(null);
      await queryClient.deleteQuery(id);
      setQueries(prev => prev.filter(q => q.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const toggleFavorite = useCallback(async (id) => {
    try {
      setError(null);
      const updated = await queryClient.toggleFavorite(id);
      setQueries(prev => prev.map(q => q.id === id ? updated : q));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const searchByTags = useCallback(async (tags) => {
    try {
      setError(null);
      return await queryClient.searchByTags(tags);
    } catch (err) {
      setError(err.message);
      return [];
    }
  }, []);

  return {
    queries,
    isLoading,
    error,
    saveQuery,
    updateQuery,
    deleteQuery,
    toggleFavorite,
    searchByTags,
    loadQueries,
    isLocalMode: queryClient.isLocal
  };
};

export default useSavedQueries;
