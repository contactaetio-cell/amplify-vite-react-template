import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Sparkles, TrendingUp, Bookmark, Search } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import type { SearchSource } from '../api/insights';
import {
  availableSearchSources,
  defaultSearchSource,
  hasMultipleSearchSources,
  parseSearchSource,
  searchSourceLabel,
} from '../search/sourceOptions';

interface HomeProps {
  onViewInsight: (id: string) => void;
  onNavigate?: (screen: string) => void;
}

export function Home({ onNavigate }: HomeProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSource, setSearchSource] = useState<SearchSource>(defaultSearchSource);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSearch = (queryOverride?: string) => {
    const query = (queryOverride ?? searchQuery).trim();
    if (!query) return;

    navigate(`/dashboard/search?q=${encodeURIComponent(query)}&source=${encodeURIComponent(searchSource)}`);
  };

  const handleQuickAction = (action: 'browse' | 'library') => {
    if (!onNavigate) return;

    if (action === 'browse') {
      onNavigate('insights');
      return;
    }

    if (action === 'library') {
      onNavigate('my-insights');
      return;
    }

  };

  return (
    <div className="flex-1 overflow-auto p-8 bg-gray-50">
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="max-w-3xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-semibold text-gray-900 mb-4">Welcome to Aetio</h1>
            <p className="text-xl text-gray-600">The Insights Marketplace</p>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder={isMobile ? 'Ask anything' : 'Ask anything about insights across your organization...'}
                  className="pl-14 h-16 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-sm"
                />
              </div>
              {hasMultipleSearchSources && (
                <select
                  value={searchSource}
                  onChange={(event) => setSearchSource(parseSearchSource(event.target.value))}
                  className="h-12 min-w-[110px] rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 shadow-sm focus:border-blue-400 focus:outline-none"
                >
                  {availableSearchSources.map((source) => (
                    <option key={source} value={source}>
                      {searchSourceLabel(source)}
                    </option>
                  ))}
                </select>
              )}
              <Button
                onClick={() => handleSearch()}
                disabled={!searchQuery.trim()}
                className="bg-blue-600 hover:bg-blue-700 h-12 px-6 rounded-lg"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Search
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-3 text-center">Try: "Why is pipeline conversion declining?" or "What channels drive the most revenue?"</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            <Button
              onClick={() => handleQuickAction('browse')}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition-all"
            >
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <span className="font-medium">Browse All Insights</span>
            </Button>
            <Button
              onClick={() => handleQuickAction('library')}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition-all"
            >
              <Bookmark className="w-6 h-6 text-blue-600" />
              <span className="font-medium">My Insights</span>
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
