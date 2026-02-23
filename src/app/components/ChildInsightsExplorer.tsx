import { useState } from 'react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../components/ui/select';
import { Insight, getChildInsights, getInsightById } from '../data/mockData';
import { TrendingUp, ExternalLink, BarChart3, Filter } from 'lucide-react';

interface ChildInsightsExplorerProps {
  rootInsight: Insight;
  onViewInsight: (id: string) => void;
}

export function ChildInsightsExplorer({ rootInsight, onViewInsight }: ChildInsightsExplorerProps) {
  const [selectedFilters, setSelectedFilters] = useState<{ [key: string]: string }>({});
  
  // Get all child insights
  const allChildInsights = getChildInsights(rootInsight.id);
  
  // Filter child insights based on selected dimension filters
  const filteredChildInsights = allChildInsights.filter(child => {
    if (Object.keys(selectedFilters).length === 0) {
      return true;
    }
    
    // Match all selected filters
    return Object.entries(selectedFilters).every(([dimension, value]) => {
      return child.dimensions?.[dimension] === value;
    });
  });
  
  const handleFilterChange = (dimensionName: string, value: string) => {
    if (value === 'all') {
      const newFilters = { ...selectedFilters };
      delete newFilters[dimensionName];
      setSelectedFilters(newFilters);
    } else {
      setSelectedFilters({
        ...selectedFilters,
        [dimensionName]: value
      });
    }
  };
  
  const clearAllFilters = () => {
    setSelectedFilters({});
  };
  
  if (!rootInsight.isRootInsight || !rootInsight.childInsightIds || rootInsight.childInsightIds.length === 0) {
    return null;
  }
  
  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Dimensional Breakdown</h2>
        </div>
        <p className="text-sm text-gray-600">
          This overall insight can be subdivided by various dimensions. Select filters to explore specific segments.
        </p>
      </div>
      
      {/* Dimension Filters */}
      {rootInsight.availableDimensions && rootInsight.availableDimensions.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-gray-500" />
            <h3 className="text-sm font-medium text-gray-900">Filter by Dimensions</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {rootInsight.availableDimensions.map((dimension) => (
              <div key={dimension.id}>
                <label className="text-xs text-gray-600 mb-1 block">{dimension.name}</label>
                <Select
                  value={selectedFilters[dimension.name] || 'all'}
                  onValueChange={(value) => handleFilterChange(dimension.name, value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All {dimension.name}</SelectItem>
                    {dimension.values.map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          
          {Object.keys(selectedFilters).length > 0 && (
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-600">Active filters:</span>
                {Object.entries(selectedFilters).map(([dimension, value]) => (
                  <Badge key={dimension} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                    {dimension}: {value}
                  </Badge>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>
      )}
      
      {/* Child Insights List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900">
            {filteredChildInsights.length === allChildInsights.length
              ? `All Segments (${allChildInsights.length})`
              : `Filtered Results (${filteredChildInsights.length} of ${allChildInsights.length})`}
          </h3>
        </div>
        
        {filteredChildInsights.length > 0 ? (
          <div className="space-y-3">
            {filteredChildInsights.map((child) => (
              <Card
                key={child.id}
                className="p-4 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500"
                onClick={() => onViewInsight(child.id)}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 mb-2">{child.statement}</p>
                    
                    {/* Dimension badges */}
                    {child.dimensions && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {Object.entries(child.dimensions).map(([key, value]) => (
                          <Badge key={key} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                            {key}: {value}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {/* Key data point */}
                    {child.dataPoints && child.dataPoints.length > 0 && (
                      <p className="text-xs text-gray-600">
                        {child.dataPoints[0].value}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewInsight(child.id);
                      }}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center border-dashed">
            <TrendingUp className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No insights match the selected filters</p>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="mt-3"
            >
              Clear filters
            </Button>
          </Card>
        )}
      </div>
      
      {/* Summary Statistics */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-semibold text-gray-900">{allChildInsights.length}</p>
            <p className="text-xs text-gray-600 mt-1">Total Segments</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-gray-900">
              {rootInsight.availableDimensions?.length || 0}
            </p>
            <p className="text-xs text-gray-600 mt-1">Dimensions</p>
          </div>
        </div>
      </div>
    </Card>
  );
}