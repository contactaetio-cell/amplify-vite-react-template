import { Badge } from '../../components/ui/badge';
import { Card } from '../../components/ui/card';
import {
  CheckCheck,
  CheckCircle2,
  ChevronDown,
  FileCheck,
  XCircle
} from 'lucide-react';
import { mockLinkedInsights } from './mockData';
import { ProcessedUpload } from './types';

export function HistorySummaryPanel({
  historyItem,
  onBack
}: {
  historyItem: ProcessedUpload;
  onBack: () => void;
}) {
  const linkedInsights = mockLinkedInsights[historyItem.queueId] || [];
  const approvedInsights = linkedInsights.filter((i) => i.status === 'approved');
  const declinedInsights = linkedInsights.filter((i) => i.status === 'declined');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronDown className="w-4 h-4 rotate-90" />
          Back to History
        </button>
        <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 font-mono">
          {historyItem.queueId}
        </Badge>
      </div>

      <Card className="p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
            <CheckCheck className="w-6 h-6 text-green-700" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-1">Upload Complete</h3>
            <p className="text-gray-600">
              Processed on {new Date(historyItem.uploadDate).toLocaleDateString()} by{' '}
              {historyItem.uploadedBy}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
              <FileCheck className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{historyItem.insightsGenerated}</p>
            <p className="text-sm text-gray-600 mt-1">Insights Generated</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
              <CheckCheck className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-700">{historyItem.insightsApproved}</p>
            <p className="text-sm text-gray-600 mt-1">Approved & Published</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <XCircle className="w-8 h-8 text-gray-500" />
            </div>
            <p className="text-3xl font-bold text-gray-600">{historyItem.insightsDeclined}</p>
            <p className="text-sm text-gray-600 mt-1">Declined</p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Approval Rate</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Successfully processed and published
              </p>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {Math.round(
                (historyItem.insightsApproved / historyItem.insightsGenerated) * 100
              )}
              %
            </p>
          </div>
          <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{
                width: `${(historyItem.insightsApproved / historyItem.insightsGenerated) * 100}%`
              }}
            />
          </div>
        </div>
      </Card>

      {approvedInsights.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Approved Insights ({approvedInsights.length})
          </h3>
          <div className="space-y-3">
            {approvedInsights.map((insight) => (
              <Card key={insight.id} className="p-4 border-l-4 border-l-green-500">
                <p className="text-sm text-gray-900 mb-2">{insight.statement}</p>
                <div className="flex items-center gap-3 flex-wrap text-xs text-gray-500">
                  <Badge variant="secondary" className="text-xs">{insight.team}</Badge>
                  <span>Reviewed by {insight.reviewedBy}</span>
                  <span>{new Date(insight.reviewedDate).toLocaleDateString()}</span>
                  <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-green-200">
                    Approved
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {declinedInsights.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-gray-500" />
            Declined Insights ({declinedInsights.length})
          </h3>
          <div className="space-y-3">
            {declinedInsights.map((insight) => (
              <Card key={insight.id} className="p-4 border-l-4 border-l-gray-300 opacity-75">
                <p className="text-sm text-gray-700 mb-2">{insight.statement}</p>
                <div className="flex items-center gap-3 flex-wrap text-xs text-gray-500">
                  <Badge variant="secondary" className="text-xs">{insight.team}</Badge>
                  <span>Reviewed by {insight.reviewedBy}</span>
                  <span>{new Date(insight.reviewedDate).toLocaleDateString()}</span>
                  <Badge variant="secondary" className="text-xs bg-red-50 text-red-700 border-red-200">
                    Declined
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
