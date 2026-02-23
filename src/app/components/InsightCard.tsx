import { FileText, BarChart3, Plug, Edit, ExternalLink } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface InsightCardProps {
  id: string;
  title: string;
  summary: string;
  sourceType: 'dashboard' | 'document' | 'api' | 'manual';
  confidence: number;
  tags: string[];
  domain: string;
  date: string;
  onView: (id: string) => void;
}

const sourceIcons = {
  dashboard: BarChart3,
  document: FileText,
  api: Plug,
  manual: Edit
};

const sourceLabels = {
  dashboard: 'Dashboard',
  document: 'Document',
  api: 'API',
  manual: 'Manual'
};

export function InsightCard({
  id,
  title,
  summary,
  sourceType,
  confidence,
  tags,
  domain,
  date,
  onView
}: InsightCardProps) {
  const SourceIcon = sourceIcons[sourceType];
  
  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3 className="font-medium text-gray-900 flex-1">{title}</h3>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-gray-600">{Math.round(confidence * 100)}%</span>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">{summary}</p>
      
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Badge variant="secondary" className="flex items-center gap-1">
          <SourceIcon className="w-3 h-3" />
          {sourceLabels[sourceType]}
        </Badge>
        <Badge variant="outline">{domain}</Badge>
        {tags.slice(0, 2).map((tag) => (
          <Badge key={tag} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {tag}
          </Badge>
        ))}
        {tags.length > 2 && (
          <Badge variant="outline" className="bg-gray-50">
            +{tags.length - 2}
          </Badge>
        )}
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">{new Date(date).toLocaleDateString()}</span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onView(id)}
          className="text-blue-600 hover:text-blue-700"
        >
          View Details
          <ExternalLink className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </Card>
  );
}
