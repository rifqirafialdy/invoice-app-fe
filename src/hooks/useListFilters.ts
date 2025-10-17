import { useState, useEffect, useCallback,useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface UseListFiltersOptions {
  defaultSortBy?: string;
  defaultSortDir?: 'asc' | 'desc';
  debounceMs?: number;
  additionalFilters?: Record<string, string>; // Add this
}

export function useListFilters(options: UseListFiltersOptions = {}) {
  const {
    defaultSortBy = 'createdAt',
    defaultSortDir = 'desc',
    debounceMs = 500,
    additionalFilters = {},
  } = options;

  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || defaultSortBy);
  const [sortDir, setSortDir] = useState(searchParams.get('sortDir') || defaultSortDir);
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '0'));
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [search, debounceMs]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (sortBy !== defaultSortBy) params.set('sortBy', sortBy);
    if (sortDir !== defaultSortDir) params.set('sortDir', sortDir);
    if (page > 0) params.set('page', page.toString());
    
    Object.entries(additionalFilters).forEach(([key, value]) => {
      if (value && value !== 'ALL') {
        params.set(key, value);
      }
    });

    router.push(`?${params.toString()}`, { scroll: false });
  }, [debouncedSearch, sortBy, sortDir, page, additionalFilters, router, defaultSortBy, defaultSortDir]);

  const reset = useCallback(() => {
    setSearch('');
    setSortBy(defaultSortBy);
    setSortDir(defaultSortDir);
    setPage(0);
  }, [defaultSortBy, defaultSortDir]);

return useMemo(() => ({
    search,
    setSearch,
    sortBy,
    setSortBy,
    sortDir,
    setSortDir,
    page,
    setPage,
    debouncedSearch,
    reset,
  }), [search, sortBy, sortDir, page, debouncedSearch, reset]);
}