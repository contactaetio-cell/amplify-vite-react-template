import { useState } from 'react';
import { TrendingUp, Clock, Award, ArrowLeft } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { getTrendingInsights, getRecentInsights, getTopInsights } from '../data/mockData';

interface TopInsightsProps {
  onViewInsight: (id: string) => void;
  onBack: () => void;
}

type TimeVintage = '7d' | '30d' | '90d' | '1y';
type Category = 'trending' | 'recent' | 'top';

export function TopInsights({ onViewInsight, onBack }: TopInsightsProps) {
  const [category, setCategory] = useState<Category>('trending');
  const [timeVintage, setTimeVintage] = useState<TimeVintage>('7d');

  const getInsightsForCategory = () => {
    const days = timeVintage === '7d' ? 7 : timeVintage === '30d' ? 30 : timeVintage === '90d' ? 90 : 365;
    
    switch (category) {
      case 'trending':
        return getTrendingInsights(days);
      case 'recent':
        return getRecentInsights(days);
      case 'top':
        return getTopInsights(days);
    }
  };

  const insights = getInsightsForCategory();

  const getCategoryIcon = (cat: Category) => {
    switch (cat) {
      case 'trending':
        return <TrendingUp className="w-5 h-5" />;
      case 'recent':
        return <Clock className="w-5 h-5" />;
      case 'top':
        return <Award className="w-5 h-5" />;
    }
  };

  const getCategoryTitle = (cat: Category) => {
    switch (cat) {
      case 'trending':
        return 'Trending Insights';
      case 'recent':
        return 'Recent Insights';
      case 'top':
        return 'Top Insights';
    }
  };

  const getCategoryDescription = (cat: Category) => {
    switch (cat) {
      case 'trending':
        return 'Most viewed insights by your organization';
      case 'recent':
        return 'Newly published insights from all teams';
      case 'top':
        return 'Highest quality insights with strong confidence scores';
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">Back</span>
            </button>
            <div className="w-px h-6 bg-gray-200" />
            <h1 className="text-3xl font-semibold text-gray-900">Top Insights</h1>
          </div>
          <p className="text-gray-600">
            Discover the most impactful insights across your organization
          </p>
        </div>

        {/* Category Tabs */}
        <div className="mb-6">
          <Tabs value={category} onValueChange={(v) => setCategory(v as Category)}>
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="trending" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                Trending
              </TabsTrigger>
              <TabsTrigger value="recent" className="gap-2">
                <Clock className="w-4 h-4" />
                Recent
              </TabsTrigger>
              <TabsTrigger value="top" className="gap-2">
                <Award className="w-4 h-4" />
                Top
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Time Vintage Selector */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {getCategoryIcon(category)}
              <h2 className="text-xl font-semibold text-gray-900">{getCategoryTitle(category)}</h2>
            </div>
            <p className="text-sm text-gray-600">{getCategoryDescription(category)}</p>
          </div>
          <div className="flex gap-2">
            {(['7d', '30d', '90d', '1y'] as TimeVintage[]).map((vintage) => (
              <Button
                key={vintage}
                size="sm"
                variant={timeVintage === vintage ? 'default' : 'outline'}
                onClick={() => setTimeVintage(vintage)}
                className={timeVintage === vintage ? 'bg-blue-600' : ''}
              >
                {vintage === '1y' ? '1 Year' : vintage}
              </Button>
            ))}
          </div>
        </div>

        {/* Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {insights.map((insight) => (
            <Card
              key={insight.id}
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => onViewInsight(insight.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <Badge variant="secondary" className="text-xs capitalize">
                  {insight.sourceType}
                </Badge>
              </div>

              <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2">
                {insight.statement.split('.')[0]}
              </h3>

              <div className="space-y-2 mb-4">
                {insight.dataPoints.slice(0, 2).map((dp) => (
                  <div key={dp.id} className="flex gap-2 text-sm">
                    <span className="text-blue-600 font-medium flex-shrink-0">•</span>
                    <span className="text-gray-700 line-clamp-1">{dp.value}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline" className="text-xs">{insight.team}</Badge>
                {insight.metadata.slice(0, 1).map((field) => (
                  <Badge key={field.id} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                    {field.value}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{insight.author}</span>
                {insight.views && (
                  <span className="flex items-center gap-1">
                    {insight.views} views
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
