import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../../components/ui/table';
import { CheckCheck, ChevronDown, XCircle } from 'lucide-react';
import { HistorySummaryPanel } from './HistorySummaryPanel';
import { ProcessedUpload } from './types';
import type { Insight } from './types';
import { fetchTopLevelInsightsByUser } from '../../api/insights';
import { getCurrentUser } from 'aws-amplify/auth';

const getNumericRef = (insight: Insight, key: string): number | null => {
  const refs = insight.additional_refs;
  if (!refs || typeof refs !== 'object') return null;
  const value = (refs as Record<string, unknown>)[key];
  return typeof value === 'number' ? value : null;
};

const mapInsightToProcessedUpload = (insight: Insight): ProcessedUpload => {
  const insightsApproved = getNumericRef(insight, 'countAccepted') ?? 0;
  const insightsDeclined = getNumericRef(insight, 'countDeclined') ?? 0;
  const insightsGenerated =
    getNumericRef(insight, 'numberChildInsights') ?? insightsApproved + insightsDeclined;

  const rawCreatedAt =
    insight.additional_refs &&
    typeof insight.additional_refs === 'object' &&
    !Array.isArray(insight.additional_refs)
      ? (insight.additional_refs as Record<string, unknown>).createdAt
      : null;

  return {
    id: insight.insight_id,
    queueId: insight.document_id || insight.insight_id,
    uploadDate: typeof rawCreatedAt === 'string' ? rawCreatedAt : new Date().toISOString(),
    uploadedBy: insight.user_id ?? 'Unknown user',
    insightsGenerated,
    insightsApproved,
    insightsDeclined,
    status: 'complete'
  };
};

export function UploadHistoryTab() {
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<ProcessedUpload | null>(null);
  const [processedUploads, setProcessedUploads] = useState<ProcessedUpload[]>([]);

  useEffect(() => {
    let mounted = true;

    async function loadHistory() {
      try {
        const user = await getCurrentUser();
        const topLevelInsights = await fetchTopLevelInsightsByUser(user.userId, 'Completed');
        if (!mounted) return;
        setProcessedUploads(topLevelInsights.map(mapInsightToProcessedUpload));
      } catch (error) {
        console.error('Failed to load upload history insights', error);
        if (mounted) {
          setProcessedUploads([]);
        }
      }
    }

    void loadHistory();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      {selectedHistoryItem ? (
        <HistorySummaryPanel
          historyItem={selectedHistoryItem}
          onBack={() => setSelectedHistoryItem(null)}
        />
      ) : (
        <Card>
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Upload History</h2>
            <p className="text-sm text-gray-600 mt-1">
              View past uploads and their processing outcomes
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Queue ID</TableHead>
                <TableHead>Upload Date</TableHead>
                <TableHead>Uploaded By</TableHead>
                <TableHead>Generated</TableHead>
                <TableHead>Approved</TableHead>
                <TableHead>Declined</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedUploads.map((item) => (
                <TableRow key={item.id} className="cursor-pointer hover:bg-gray-50">
                  <TableCell className="font-mono text-sm font-medium">{item.queueId}</TableCell>
                  <TableCell>{new Date(item.uploadDate).toLocaleDateString()}</TableCell>
                  <TableCell>{item.uploadedBy}</TableCell>
                  <TableCell>{item.insightsGenerated}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-green-700">
                      <CheckCheck className="w-4 h-4" />
                      {item.insightsApproved}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-gray-500">
                      <XCircle className="w-4 h-4" />
                      {item.insightsDeclined}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedHistoryItem(item)}
                      className="gap-1"
                    >
                      View Summary
                      <ChevronDown className="w-4 h-4 -rotate-90" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
