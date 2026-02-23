import { useState } from 'react';
import { Search, TrendingUp, Sparkles, Filter, Clock, Library } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import { getTrendingInsights } from '../data/mockData';

interface DiscoveryHomeProps {
  onSearch: (query: string) => void;
  onNavigate?: (screen: string) => void;
}

const suggestedSearches = [
  'customer churn analysis',
  'mobile app performance',
  'security requirements',
  'pricing optimization',
  'user onboarding'
];

const recentSearches = [
  'enterprise security',
  'Q4 analytics',
  'product feedback'
];

export function DiscoveryHome({ onSearch, onNavigate }: DiscoveryHomeProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="max-w-5xl mx-auto p-8 pt-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-semibold text-gray-900 mb-4">Discover Insights</h1>
          <p className="text-lg text-gray-600">Search across all your research, experiments, and analytics</p>
          {onNavigate && (
            <div className="mt-4 flex items-center justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => onNavigate('library')}
                className="gap-2"
              >
                <Library className="w-4 h-4" />
                Browse Insight Library
              </Button>
              <Button
                variant="outline"
                onClick={() => onNavigate('my-library')}
                className="gap-2"
              >
                <Library className="w-4 h-4" />
                My Library
              </Button>
            </div>
          )}
        </div>
        
        <div className="max-w-3xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search research, experiments, insights..."
              className="pl-12 pr-32 h-14 text-lg shadow-lg border-gray-300"
            />
            <Button 
              onClick={handleSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700"
            >
              Search
            </Button>
          </div>
          
          <div className="flex items-center gap-4 mt-6">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
            <div className="flex gap-2 flex-wrap">
              <span className="text-sm text-gray-600">Quick filters:</span>
              <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">Last 30 days</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">My team</Badge>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-gray-900">Trending Insights</h2>
            </div>
            <div className="space-y-3">
              {getTrendingInsights().slice(0, 5).map((insight) => (
                <button
                  key={insight.id}
                  onClick={() => onSearch(insight.statement.split('.')[0])}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <p className="text-sm font-medium text-gray-900 mb-1">{insight.statement.split('.')[0]}</p>
                  <p className="text-xs text-gray-500">{insight.views || 0} views this week</p>
                </button>
              ))}
            </div>
          </Card>
          
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-purple-600" />
                <h2 className="font-semibold text-gray-900">Recent Searches</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search) => (
                  <Badge
                    key={search}
                    variant="secondary"
                    className="cursor-pointer hover:bg-gray-200"
                    onClick={() => {
                      setSearchQuery(search);
                      onSearch(search);
                    }}
                  >
                    {search}
                  </Badge>
                ))}
              </div>
            </Card>
            
            <Card className="p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Suggested Searches</h2>
              <div className="space-y-2">
                {suggestedSearches.map((search) => (
                  <button
                    key={search}
                    onClick={() => {
                      setSearchQuery(search);
                      onSearch(search);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}