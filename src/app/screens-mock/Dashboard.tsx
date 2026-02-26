import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { TrendingUp, FileText, Users, Clock, ArrowRight } from 'lucide-react';
import { mockInsights, getTrendingInsights } from '../data/mockData';
import { useParams } from 'react-router-dom';

interface DashboardProps {
  onNavigate: (screen: string) => void;
  onViewInsight: (id: string) => void;
  mock?: boolean;
}

export function Dashboard({ onNavigate, onViewInsight}: DashboardProps) {
  const {  mock } = useParams<DashboardProps>();
  console.log("mock",mock);
  const recentInsights = mock ? mockInsights.slice(0, 3) : [];
  const trendingInsights = mock ? getTrendingInsights() : [];

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Welcome back, John</h1>
          <p className="text-gray-600">Here's what's happening with your insights today</p>
        </div>
        
        <div className="grid grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-semibold text-gray-900 mb-1">
              {mockInsights.length}
            </div>
            <div className="text-sm text-gray-600">Total Insights</div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="text-2xl font-semibold text-gray-900 mb-1">
              12
            </div>
            <div className="text-sm text-gray-600">Active Contributors</div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="text-2xl font-semibold text-gray-900 mb-1">
              3
            </div>
            <div className="text-sm text-gray-600">Added This Week</div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <div className="text-2xl font-semibold text-gray-900 mb-1">
              1,234
            </div>
            <div className="text-sm text-gray-600">Total Views</div>
          </Card>
        </div>
        
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Recent Insights</h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onNavigate('library')}
                >
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              
              <div className="space-y-4">
                {recentInsights.map((insight) => (
                  <div 
                    key={insight.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => onViewInsight(insight.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900 flex-1">{insight.statement.split('.')[0]}</h3>
                      <div className="flex items-center gap-2 text-sm ml-4">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-gray-600">{Math.round(insight.confidence * 100)}%</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{insight.statement.split('.').slice(1, 2).join('.')}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{insight.domain}</Badge>
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        {insight.tags[0]}
                      </Badge>
                      <span className="text-xs text-gray-500 ml-auto">
                        {new Date(insight.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => onNavigate('ingestion')}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left group"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center mb-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">Add New Source</h3>
                  <p className="text-sm text-gray-600">Upload research or connect data</p>
                </button>
                
                <button
                  onClick={() => onNavigate('discovery')}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-left group"
                >
                  <div className="w-10 h-10 rounded-lg bg-purple-50 group-hover:bg-purple-100 flex items-center justify-center mb-3">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">Search Insights</h3>
                  <p className="text-sm text-gray-600">Discover existing research</p>
                </button>
              </div>
            </Card>
          </div>
          
          <div className="col-span-1 space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h2 className="font-semibold text-gray-900">Trending This Week</h2>
              </div>
              
              <div className="space-y-3">
                {trendingInsights.slice(0, 5).map((insight, index) => (
                  <button
                    key={insight.id}
                    onClick={() => onViewInsight(insight.id)}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex gap-3">
                      <span className="text-lg font-semibold text-blue-600 flex-shrink-0">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                          {insight.statement.split('.')[0]}
                        </p>
                        <p className="text-xs text-gray-500">{insight.views || 0} views</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
            
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-2">💡 Pro Tip</h3>
              <p className="text-sm text-gray-700 mb-4">
                Tag your insights consistently to improve discoverability and enable better connections across research.
              </p>
              <Button variant="outline" size="sm" className="w-full bg-white">
                Learn More
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}