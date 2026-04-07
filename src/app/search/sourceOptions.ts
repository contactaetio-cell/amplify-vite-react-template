import type { SearchSource } from '../api/insights';

const ALL_SEARCH_SOURCES: SearchSource[] = ['all', 'local', 'gwi'];

export const availableSearchSources: SearchSource[] = (() => {
  const raw = import.meta.env.VITE_SEARCH_SOURCES;
  if (typeof raw !== 'string' || raw.trim().length === 0) {
    return ALL_SEARCH_SOURCES;
  }

  const parsed = raw
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter((value): value is SearchSource => value === 'all' || value === 'local' || value === 'gwi');

  if (parsed.length === 0) {
    return ALL_SEARCH_SOURCES;
  }

  return ALL_SEARCH_SOURCES.filter((source) => parsed.includes(source));
})();

export const defaultSearchSource: SearchSource = availableSearchSources.includes('local')
  ? 'local'
  : (availableSearchSources[0] ?? 'local');

export const hasMultipleSearchSources = availableSearchSources.length > 1;

export const parseSearchSource = (value: string | null): SearchSource => {
  if (value && availableSearchSources.includes(value as SearchSource)) {
    return value as SearchSource;
  }
  return defaultSearchSource;
};

export const searchSourceLabel = (source: SearchSource): string => {
  if (source === 'all') return 'All';
  if (source === 'gwi') return 'GWI';
  return 'Local';
};
