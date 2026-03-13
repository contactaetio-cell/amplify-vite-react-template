import { useState } from 'react';
import { Search, SlidersHorizontal, X, ExternalLink, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import { mockInsights } from '../data/mockData';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../components/ui/select';

interface BrowseInsightsProps {
  onViewInsight: (id: string) => void;
  onBack: () => void;
}

export function BrowseInsights({ onViewInsight, onBack }: BrowseInsightsProps) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    channel: 'all',
    gender: 'all',
    ageGroup: 'all',
    productType: 'all',
    sourceType: 'all',
    team: 'all',
    dateRange: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showAdditionalFilters, setShowAdditionalFilters] = useState(false);

  // Check if any dimensional filters are active (user segment filters)
  const hasDimensionalFilters = filters.channel !== 'all' || 
                                  filters.gender !== 'all' || 
                                  filters.ageGroup !== 'all' || 
                                  filters.productType !== 'all';

  // Filter insights based on search query and filters
  const filteredInsights = mockInsights.filter(insight => {
    // Search filter
    if (query.trim()) {
      const searchLower = query.toLowerCase();
      const matchesSearch = insight.statement.toLowerCase().includes(searchLower) ||
                           insight.team.toLowerCase().includes(searchLower) ||
                           insight.metadata.some(m => m.value.toLowerCase().includes(searchLower));
      if (!matchesSearch) return false;
    }

    // If no dimensional filters are selected, show all root insights
    if (!hasDimensionalFilters) {
      return insight.isRootInsight || !insight.parentInsightId;
    }
    
    // If dimensional filters are selected, show child insights that match
    if (!insight.dimensions) {
      return false; // Hide root insights when filtering by dimensions
    }
    
    // Check if insight matches selected dimension filters
    const matchesChannel = filters.channel === 'all' || insight.dimensions['Channel'] === filters.channel;
    const matchesGender = filters.gender === 'all' || insight.dimensions['Gender'] === filters.gender;
    const matchesAge = filters.ageGroup === 'all' || insight.dimensions['Age Group'] === filters.ageGroup;
    const matchesProduct = filters.productType === 'all' || insight.dimensions['Product Type'] === filters.productType;
    
    return matchesChannel && matchesGender && matchesAge && matchesProduct;
  });

  const activeFilters = Object.entries(filters).filter(([, value]) => value !== 'all');

  const clearFilter = (key: string) => {
    setFilters({ ...filters, [key]: 'all' });
  };

  const clearAllFilters = () => {
    setFilters({
      channel: 'all',
      gender: 'all',
      ageGroup: 'all',
      productType: 'all',
      sourceType: 'all',
      team: 'all',
      dateRange: 'all'
    });
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={onBack}
                className="flex items-center gap-1 sm:gap-1.5 text-gray-500 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm hidden sm:inline">Back</span>
              </button>
              <div className="w-px h-6 bg-gray-200" />
              <div>
                <h1 className="text-xl sm:text-3xl font-semibold text-gray-900 sm:mb-2">Browse All Insights</h1>
                <p className="text-gray-600 text-sm hidden sm:block">
                  Explore the complete insights library
                </p>
              </div>
            </div>
          </div>

          {/* Search + Filter Toggle */}
          <div className="flex items-center gap-2 sm:gap-4 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-gray-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search insights..."
                className="pl-10 sm:pl-12 pr-4 h-10 sm:h-12"
              />
            </div>
            <Button
              variant={showFilters ? 'default' : 'outline'}
              onClick={() => setShowFilters(!showFilters)}
              className={`gap-2 h-10 sm:h-12 flex-shrink-0 ${showFilters ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilters.length > 0 && (
                <span className={`w-5 h-5 rounded-full text-xs flex items-center justify-center ${showFilters ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'}`}>
                  {activeFilters.length}
                </span>
              )}
            </Button>
          </div>

          {/* Active filter chips */}
          {activeFilters.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm text-gray-600">Active:</span>
              {activeFilters.map(([key, value]) => (
                <Badge key={key} variant="secondary" className="gap-1.5 text-xs">
                  {value}
                  <button onClick={() => clearFilter(key)} className="hover:text-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs h-6 px-2"
              >
                Clear all
              </Button>
            </div>
          )}

          {/* Filters Panel — horizontal on desktop, stacked on mobile */}
          {showFilters && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              {/* Primary Filters */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Channel</label>
                  <Select
                    value={filters.channel}
                    onValueChange={(value) => setFilters({ ...filters, channel: value })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Channels</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="direct">Direct</SelectItem>
                      <SelectItem value="search">Search</SelectItem>
                      <SelectItem value="organic">Organic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Gender</label>
                  <Select
                    value={filters.gender}
                    onValueChange={(value) => setFilters({ ...filters, gender: value })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Genders</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Age Group</label>
                  <Select
                    value={filters.ageGroup}
                    onValueChange={(value) => setFilters({ ...filters, ageGroup: value })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ages</SelectItem>
                      <SelectItem value="18-24">18-24</SelectItem>
                      <SelectItem value="25-34">25-34</SelectItem>
                      <SelectItem value="35-44">35-44</SelectItem>
                      <SelectItem value="45-54">45-54</SelectItem>
                      <SelectItem value="55+">55+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Product Type</label>
                  <Select
                    value={filters.productType}
                    onValueChange={(value) => setFilters({ ...filters, productType: value })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Products</SelectItem>
                      <SelectItem value="pro">Pro Plan</SelectItem>
                      <SelectItem value="enterprise">Enterprise Plan</SelectItem>
                      <SelectItem value="basic">Basic Plan</SelectItem>
                      <SelectItem value="addon">Add-ons</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Additional Filters Toggle */}
              <div className="mt-3">
                <button
                  onClick={() => setShowAdditionalFilters(!showAdditionalFilters)}
                  className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {showAdditionalFilters ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                  <span>{showAdditionalFilters ? 'Hide' : 'Show'} additional filters</span>
                </button>
              </div>

              {/* Additional Filters */}
              {showAdditionalFilters && (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3 pt-3 border-t border-gray-100">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Research Type</label>
                    <Select
                      value={filters.sourceType}
                      onValueChange={(value) => setFilters({ ...filters, sourceType: value })}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="dashboard">Dashboard</SelectItem>
                        <SelectItem value="document">Document</SelectItem>
                        <SelectItem value="api">API</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Team</label>
                    <Select
                      value={filters.team}
                      onValueChange={(value) => setFilters({ ...filters, team: value })}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Teams</SelectItem>
                        <SelectItem value="strategy">Strategy</SelectItem>
                        <SelectItem value="product">Product</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="growth">Growth</SelectItem>
                        <SelectItem value="engineering">Engineering</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Date Range</label>
                    <Select
                      value={filters.dateRange}
                      onValueChange={(value) => setFilters({ ...filters, dateRange: value })}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="7d">Last 7 days</SelectItem>
                        <SelectItem value="30d">Last 30 days</SelectItem>
                        <SelectItem value="90d">Last 90 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="mb-4 sm:mb-6">
          <p className="text-sm text-gray-600">
            Found <span className="font-medium text-gray-900">{filteredInsights.length}</span> insights
          </p>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block">
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[450px]">Insight Statement</TableHead>
                  <TableHead className="w-32">Team</TableHead>
                  <TableHead className="w-32">Published</TableHead>
                  <TableHead className="w-32">Expires</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInsights.map((insight) => (
                  <TableRow key={insight.id} className="align-top">
                    <TableCell>
                      <div className="space-y-2">
                        <p className="font-medium text-gray-900">{insight.statement}</p>
                        {insight.footnote && (
                          <div className="text-xs text-gray-500 italic border-l-2 border-gray-300 pl-3 mt-2">
                            {insight.footnote}
                          </div>
                        )}
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="outline" className="text-xs capitalize">
                            {insight.sourceType}
                          </Badge>
                          {insight.metadata.slice(0, 2).map((field) => (
                            <Badge key={field.id} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                              {field.label}: {field.value}
                            </Badge>
                          ))}
                          {insight.metadata.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{insight.metadata.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-900">{insight.team}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {new Date(insight.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {new Date(insight.expiration).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onViewInsight(insight.id)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {filteredInsights.map((insight) => (
            <Card key={insight.id} className="p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-xs">{insight.team}</Badge>
                  <Badge variant="outline" className="text-xs capitalize">{insight.sourceType}</Badge>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onViewInsight(insight.id)}
                  className="text-blue-600 hover:text-blue-700 h-7 w-7 p-0 flex-shrink-0"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm font-medium text-gray-900 mb-2">{insight.statement}</p>
              {insight.footnote && (
                <p className="text-xs text-gray-500 italic border-l-2 border-gray-300 pl-2 mb-2 line-clamp-2">
                  {insight.footnote}
                </p>
              )}
              <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                <span>
                  {new Date(insight.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
                <span className="text-gray-300">•</span>
                <span>
                  Exp: {new Date(insight.expiration).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
              {insight.metadata.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {insight.metadata.slice(0, 2).map((field) => (
                    <Badge key={field.id} variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">
                      {field.label}: {field.value}
                    </Badge>
                  ))}
                  {insight.metadata.length > 2 && (
                    <Badge variant="outline" className="text-[10px]">
                      +{insight.metadata.length - 2}
                    </Badge>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
        
        {/* Pagination */}
        <div className="mt-6 sm:mt-8 flex justify-center">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" className="bg-blue-50 text-blue-700">
              1
            </Button>
            <Button variant="outline" size="sm">
              2
            </Button>
            <Button variant="outline" size="sm">
              3
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
