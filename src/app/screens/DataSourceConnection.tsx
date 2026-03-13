import { useState } from 'react';
import { Badge } from '../components/ui/badge';
import { Clock, History, Upload } from 'lucide-react';
import { ApprovalReviewQueueTab } from './data-source-connection/ApprovalReviewQueueTab';
import { UploadHistoryTab } from './data-source-connection/UploadHistoryTab';
import { UploadResearchTab } from './data-source-connection/UploadResearchTab';
import { mockQueueItems } from './data-source-connection/mockData';

interface DataSourceConnectionProps {
  onSelectSource: (sourceId: string) => void;
  onManualEntry?: () => void;
}

type Tab = 'upload' | 'approval' | 'history';

export function DataSourceConnection({ onSelectSource, onManualEntry }: DataSourceConnectionProps) {
  const [activeTab, setActiveTab] = useState<Tab>('upload');

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Add New Insights</h1>
          <p className="text-gray-600">
            Upload research documents, review extracted insights, and track processing history
          </p>
        </div>

        <div className="flex gap-1 mb-8 bg-white rounded-lg p-1 border border-gray-200 w-fit">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-6 py-2.5 rounded-md text-sm font-medium transition-all ${
              activeTab === 'upload'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload New Research
            </div>
          </button>
          <button
            onClick={() => setActiveTab('approval')}
            className={`px-6 py-2.5 rounded-md text-sm font-medium transition-all ${
              activeTab === 'approval'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Approval Review Queue
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-300">
                {mockQueueItems.length}
              </Badge>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-2.5 rounded-md text-sm font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Upload History
            </div>
          </button>
        </div>

        <div className="pb-8">
          {activeTab === 'upload' && <UploadResearchTab />}
          {activeTab === 'approval' && <ApprovalReviewQueueTab />}
          {activeTab === 'history' && <UploadHistoryTab />}
        </div>
      </div>
    </div>
  );
}
