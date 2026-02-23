import { Cloud, FileUp, BarChart3, Plug, Edit, LucideIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface SourceCardProps {
  name: string;
  description: string;
  icon: string;
  onConnect: () => void;
  buttonLabel?: string;
}

const iconMap: Record<string, LucideIcon> = {
  cloud: Cloud,
  'file-up': FileUp,
  'bar-chart-3': BarChart3,
  plug: Plug,
  edit: Edit
};

export function SourceCard({ name, description, icon, onConnect, buttonLabel }: SourceCardProps) {
  const Icon = iconMap[icon] || Cloud;
  
  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 mb-1">{name}</h3>
          <p className="text-sm text-gray-600 mb-4">{description}</p>
          <Button onClick={onConnect} size="sm" className="bg-blue-600 hover:bg-blue-700">
            {buttonLabel || 'Connect'}
          </Button>
        </div>
      </div>
    </Card>
  );
}