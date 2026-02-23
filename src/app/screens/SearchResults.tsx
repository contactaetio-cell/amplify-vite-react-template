import { useState } from 'react';
import { Search, SlidersHorizontal, X, ExternalLink, Bookmark, ChevronDown, ChevronUp } from 'lucide-react';
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

interface SearchResultsProps {
  searchQuery: string;
  onViewInsight: (id: string) => void;
  onSearch: (query: string) => void;
  onNavigate?: (screen: string) => void;
}

export function SearchResults({ searchQuery, onViewInsight, onSearch, onNavigate }: SearchResultsProps) {
  const [query, setQuery] = useState(searchQuery);
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

  // Filter insights based on hierarchy and selected filters
  const filteredInsights = mockInsights.filter(insight => {
    // If no dimensional filters are selected, only show root insights
    if (!hasDimensionalFilters) {
      return insight.isRootInsight || !insight.parentInsightId;
    }
    
    // If dimensional filters are selected, show child insights that match
    // Only show insights that have dimensions (child insights)
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

  const activeFilters = Object.entries(filters).filter(([key, value]) => value !== 'all');

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query);
    }
  };

  const clearFilter = (key: string) => {
    setFilters({ ...filters, [key]: 'all' });
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search research, experiments, insights..."
                  className="pl-12 pr-4 h-12"
                />
              </div>
              <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 h-12">
                Search
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2 h-12"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </Button>
            </div>
            {onNavigate && (
              <Button
                variant="outline"
                onClick={() => onNavigate('my-library')}
                className="gap-2 h-12 ml-4"
              >
                <Bookmark className="w-4 h-4" />
                My Library
              </Button>
            )}
          </div>
          
          {activeFilters.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600">Active filters:</span>
              {activeFilters.map(([key, value]) => (
                <Badge key={key} variant="secondary" className="gap-2">
                  {value}
                  <button onClick={() => clearFilter(key)}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters({
                  channel: 'all',
                  gender: 'all',
                  ageGroup: 'all',
                  productType: 'all',
                  sourceType: 'all',
                  team: 'all',
                  dateRange: 'all'
                })}
              >
                Clear all
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex gap-8">
          {showFilters && (
            <aside className="w-64 flex-shrink-0">
              <Card className="p-6 sticky top-24">
                <h3 className="font-semibold text-gray-900 mb-4">Advanced Filters</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Channel
                    </label>
                    <Select
                      value={filters.channel}
                      onValueChange={(value) => setFilters({ ...filters, channel: value })}
                    >
                      <SelectTrigger>
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
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Gender
                    </label>
                    <Select
                      value={filters.gender}
                      onValueChange={(value) => setFilters({ ...filters, gender: value })}
                    >
                      <SelectTrigger>
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
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Age Group
                    </label>
                    <Select
                      value={filters.ageGroup}
                      onValueChange={(value) => setFilters({ ...filters, ageGroup: value })}
                    >
                      <SelectTrigger>
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
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Product Type
                    </label>
                    <Select
                      value={filters.productType}
                      onValueChange={(value) => setFilters({ ...filters, productType: value })}
                    >
                      <SelectTrigger>
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
                  
                  {/* Additional Filters Toggle */}
                  <div className="pt-2 border-t border-gray-200">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAdditionalFilters(!showAdditionalFilters)}
                      className="w-full justify-between px-0 text-gray-700 hover:text-gray-900"
                    >
                      <span className="text-sm font-medium">Additional Filters</span>
                      {showAdditionalFilters ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  
                  {/* Collapsible Additional Filters */}
                  {showAdditionalFilters && (
                    <div className="space-y-4 pt-2">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Research Type
                        </label>
                        <Select
                          value={filters.sourceType}
                          onValueChange={(value) => setFilters({ ...filters, sourceType: value })}
                        >
                          <SelectTrigger>
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
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Team
                        </label>
                        <Select
                          value={filters.team}
                          onValueChange={(value) => setFilters({ ...filters, team: value })}
                        >
                          <SelectTrigger>
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
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Date Range
                        </label>
                        <Select
                          value={filters.dateRange}
                          onValueChange={(value) => setFilters({ ...filters, dateRange: value })}
                        >
                          <SelectTrigger>
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
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Save this search</h4>
                  <p className="text-xs text-blue-700 mb-3">
                    Get notified when new insights match your criteria
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Save Search
                  </Button>
                </div>
              </Card>
            </aside>
          )}
          
          <div className="flex-1">
            <div className="mb-6">
              <p className="text-gray-600">
                Found <span className="font-medium text-gray-900">{filteredInsights.length}</span> insights
                {searchQuery && (
                  <span> for "<span className="font-medium text-gray-900">{searchQuery}</span>"</span>
                )}
              </p>
            </div>
            
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
            
            <div className="mt-8 flex justify-center">
              <div className="flex items-center gap-2">
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
      </div>
    </div>
  );
}