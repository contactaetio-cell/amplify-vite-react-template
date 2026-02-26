export const mockScreenPaths = {
  home: '/mock/home',
  ingestion: '/mock/ingestion',
  'upload-progress': '/mock/upload-progress',
  upload: '/mock/upload',
  extraction: '/mock/extraction',
  structuring: '/mock/structuring',
  validation: '/mock/validation',
  publish: '/mock/publish',
  'insight-review': '/mock/insight-review',
  'final-validation': '/mock/final-validation',
  library: '/mock/library',
  discovery: '/mock/discovery',
  'search-results': '/mock/search-results',
  'insight-detail': '/mock/insight',
  'my-library': '/mock/my-library',
  'manual-entry': '/mock/manual-entry',
  help: '/mock/help',
  settings: '/mock/settings',
} as const;

export type MockScreen = keyof typeof mockScreenPaths;

export const mockPathToScreen: Record<string, MockScreen> = Object.fromEntries(
  Object.entries(mockScreenPaths).map(([screen, path]) => [path, screen as MockScreen]),
);
