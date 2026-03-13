import { useState } from 'react';
import { Badge } from '../../components/ui/badge';
import { Card } from '../../components/ui/card';
import { ChevronRight, Clock, FileText, Sparkles, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { ApprovalReviewPanel } from './ApprovalReviewPanel';
import { mockQueueItems } from './mockData';
import { QueueItem } from './types';

export function ApprovalReviewQueueTab() {
  const [selectedQueueItem, setSelectedQueueItem] = useState<QueueItem | null>(null);

  return (
    <div className="max-w-7xl mx-auto">
      {selectedQueueItem ? (
        <ApprovalReviewPanel
          queueItem={selectedQueueItem}
          onBack={() => setSelectedQueueItem(null)}
          onApprove={() => {
            toast.success('Insights approved successfully!');
            setSelectedQueueItem(null);
          }}
        />
      ) : (
        <Card>
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Pending Approval Queue</h2>
            <p className="text-sm text-gray-600 mt-1">
              Review and approve insights extracted from uploaded research
            </p>
          </div>
          <div className="divide-y divide-gray-100">
            {mockQueueItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedQueueItem(item)}
                className="w-full px-6 py-5 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-medium text-gray-900">{item.queueId}</span>
                    <Badge
                      variant="secondary"
                      className={
                        item.status === 'pending'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      {item.status === 'pending' ? 'Pending Review' : 'In Review'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{item.uploadedBy}</span>
                    <span>{new Date(item.uploadDate).toLocaleDateString()}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{item.researchContext}</p>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    {item.outputDocuments.length} output document{item.outputDocuments.length !== 1 ? 's' : ''}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    {item.insightsCount} insights
                  </span>
                  {item.contextDocuments.length > 0 && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      {item.contextDocuments.length} context doc{item.contextDocuments.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
