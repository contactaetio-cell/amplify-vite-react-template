import { useCallback, useEffect, useState } from 'react';
import { Badge } from '../components/ui/badge';
import { Clock, History, Upload } from 'lucide-react';
import { ApprovalReviewQueueTab } from './data-source-connection/ApprovalReviewQueueTab';
import { UploadResearchTab } from './data-source-connection/UploadResearchTab';
import type { Insight } from './data-source-connection/types';
import { getCurrentUser } from 'aws-amplify/auth';
import {
  fetchNonPendingProjectsByUser,
  fetchPendingProjectsByUser,
  type ProjectRecord,
} from '../api/insights';
import { useLocation, useNavigate, useParams } from 'react-router';

interface DataSourceConnectionProps {
  onSelectSource: (sourceId: string) => void;
  onManualEntry?: () => void;
}

type Tab = 'upload' | 'approval' | 'history';

function toProjectRootInsight(project: ProjectRecord): Insight {
  return {
    insight_id: project.project_id,
    project_id: project.project_id,
    user_id: project.user_id,
    user_info: project.user_info,
    status: project.status,
    text: project.research_context?.trim() || 'Project review',
    evidence_snippet: project.research_context?.trim() || 'Project review',
    s3_node: `project:${project.project_id}`,
    document_id: project.project_id,
    createdAt: project.createdAt ?? project.created_at,
    updatedAt: project.updatedAt ?? project.updated_at,
    upload_mode: project.upload_mode,
    context_urls: project.context_urls ?? [],
    output_urls: project.output_urls ?? [],
    raw_data_urls: project.raw_data_urls ?? [],
    insight_ids: project.insight_ids ?? [],
  };
}

export function DataSourceConnection({ onSelectSource, onManualEntry }: DataSourceConnectionProps) {
  void onSelectSource;
  void onManualEntry;
  const navigate = useNavigate();
  const location = useLocation();
  const { tab, insightId } = useParams();
  const [pendingInsights, setPendingInsights] = useState<Insight[]>([]);
  const [historyInsights, setHistoryInsights] = useState<Insight[]>([]);
  const [selectedHistoryInsightId, setSelectedHistoryInsightId] = useState<string | undefined>(undefined);
  const [queueLoading, setQueueLoading] = useState(true);

  const activeTab: Tab =
    location.pathname.includes('/dashboard/ingestion/approval-review-queue')
      ? 'approval'
      : tab === 'approval-review-queue'
      ? 'approval'
      : tab === 'upload-history'
        ? 'history'
        : 'upload';

  const ingestionBasePath = '/dashboard/ingestion';
  const uploadPath = `${ingestionBasePath}/add-new-insight`;
  const approvalPath = `${ingestionBasePath}/approval-review-queue`;
  const historyPath = `${ingestionBasePath}/upload-history`;

  const loadQueueData = useCallback(async (options?: { silent?: boolean }) => {
    const shouldShowLoading = options?.silent !== true;
    if (shouldShowLoading) {
      setQueueLoading(true);
    }
    try {
      const user = await getCurrentUser();
      const [pendingProjects, nonPendingProjects] = await Promise.all([
        fetchPendingProjectsByUser(user.userId),
        fetchNonPendingProjectsByUser(user.userId),
      ]);

      setPendingInsights(pendingProjects.map(toProjectRootInsight));
      setHistoryInsights(nonPendingProjects.map(toProjectRootInsight));
    } catch (error) {
      console.error('Failed to load queue insights', error);
      setPendingInsights([]);
      setHistoryInsights([]);
    } finally {
      if (shouldShowLoading) {
        setQueueLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadQueueData();
  }, [loadQueueData]);

  useEffect(() => {
    if (activeTab === 'approval' || activeTab === 'history') {
      void loadQueueData();
    }
  }, [activeTab, loadQueueData]);

  useEffect(() => {
    if (activeTab !== 'approval' && activeTab !== 'history') {
      return;
    }

    // Avoid polling while actively reviewing a specific project to prevent local review-state resets.
    if (activeTab === 'approval' && typeof insightId === 'string' && insightId.trim().length > 0) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void loadQueueData({ silent: true });
    }, 15000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [activeTab, insightId, loadQueueData]);

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
            onClick={() => navigate(uploadPath)}
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
            onClick={() => navigate(approvalPath)}
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
                {queueLoading ? '...' : pendingInsights.length}
              </Badge>
            </div>
          </button>
          <button
            onClick={() => navigate(historyPath)}
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
          {activeTab === 'upload' && <UploadResearchTab onSubmissionComplete={loadQueueData} />}
          {activeTab === 'approval' && (
            <ApprovalReviewQueueTab
              insights={pendingInsights}
              selectedInsightId={insightId}
              onSelectInsight={(selectedId) => navigate(`${approvalPath}/${selectedId}`)}
              onBackToQueue={() => navigate(approvalPath)}
              onQueueMutation={loadQueueData}
              onDeleteInsight={(deletedInsightId) =>
                setPendingInsights((prev) => prev.filter((item) => item.insight_id !== deletedInsightId))
              }
            />
          )}
          {activeTab === 'history' && (
            <ApprovalReviewQueueTab
              insights={historyInsights}
              selectedInsightId={selectedHistoryInsightId}
              onSelectInsight={(selectedId) => setSelectedHistoryInsightId(selectedId)}
              onBackToQueue={() => setSelectedHistoryInsightId(undefined)}
              onQueueMutation={loadQueueData}
              onDeleteInsight={(deletedInsightId) =>
                setHistoryInsights((prev) => prev.filter((item) => item.insight_id !== deletedInsightId))
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
