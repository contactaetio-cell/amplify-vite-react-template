import { useEffect, useState } from 'react';
import { Badge } from '../../components/ui/badge';
import { Card } from '../../components/ui/card';
import { ChevronRight, Clock, FileText, Sparkles, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { ApprovalReviewPanel } from './ApprovalReviewPanel';
import type { Insight } from './types';
import { fetchProjectApprovalBundle } from '../../api/insights';

function getInsightDateLabel(insight: Insight): string | null {
  const rawCreatedAt = typeof insight.createdAt === 'string' ? insight.createdAt : null;
  if (!rawCreatedAt) return null;

  const parsed = new Date(rawCreatedAt);
  return Number.isNaN(parsed.getTime()) ? rawCreatedAt : parsed.toLocaleDateString();
}

export function ApprovalReviewQueueTab({
  insights,
  selectedInsightId,
  onSelectInsight,
  onBackToQueue,
  onQueueMutation,
  onDeleteInsight
}: {
  insights: Insight[];
  selectedInsightId?: string;
  onSelectInsight: (insightId: string) => void;
  onBackToQueue: () => void;
  onQueueMutation?: () => void | Promise<void>;
  onDeleteInsight: (insightId: string) => void;
}) {
  const selectedInsightFromQueue = selectedInsightId
    ? insights.find((item) => item.insight_id === selectedInsightId) ?? null
    : null;
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);
  const [isLoadingSelected, setIsLoadingSelected] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function hydrateSelectedProject() {
      if (!selectedInsightId) {
        if (mounted) setSelectedInsight(null);
        return;
      }

      if (mounted) setIsLoadingSelected(true);
      try {
        const bundle = await fetchProjectApprovalBundle(selectedInsightId);
        const project = bundle.project;
        const hydratedInsight: Insight = {
          insight_id: project.project_id,
          project_id: project.project_id,
          user_id: project.user_id,
          user_info: project.user_info,
          status: project.status,
          text: project.research_context?.trim() || 'Pending project review',
          evidence_snippet: project.research_context?.trim() || 'Pending project review',
          s3_node: `project:${project.project_id}`,
          document_id: project.project_id,
          createdAt: project.created_at,
          updatedAt: project.updated_at,
          upload_mode: project.upload_mode,
          context_urls: project.context_urls ?? [],
          output_urls: project.output_urls ?? [],
          raw_data_urls: project.raw_data_urls ?? [],
          insight_ids: project.insight_ids ?? [],
          preloaded_project_insights: bundle.insights ?? [],
          insightfamilydata: bundle.insightfamilydata,
        };

        if (mounted) setSelectedInsight(hydratedInsight);
      } catch (error) {
        console.error('Failed to load selected project bundle', error);
        if (mounted) setSelectedInsight(selectedInsightFromQueue);
      } finally {
        if (mounted) setIsLoadingSelected(false);
      }
    }

    void hydrateSelectedProject();

    return () => {
      mounted = false;
    };
  }, [selectedInsightFromQueue, selectedInsightId]);

  return (
    <div className="max-w-7xl mx-auto">
      {selectedInsightId ? (
        isLoadingSelected && !selectedInsight ? (
          <Card>
            <div className="px-6 py-8 text-sm text-gray-500">Loading project review...</div>
          </Card>
        ) : !selectedInsight ? (
          <Card>
            <div className="px-6 py-8 text-sm text-gray-500">Project not found.</div>
          </Card>
        ) : (
        <ApprovalReviewPanel
          insight={selectedInsight}
          onBack={onBackToQueue}
          onApprove={() => {
            toast.success('Insight approved successfully!');
            onDeleteInsight(selectedInsight.insight_id);
            onBackToQueue();
            if (onQueueMutation) {
              void onQueueMutation();
            }
          }}
          onDecline={(insightId) => {
            onDeleteInsight(insightId);
            onBackToQueue();
            if (onQueueMutation) {
              void onQueueMutation();
            }
          }}
        />
        )
      ) : (
        <Card>
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Pending Approval Queue</h2>
            <p className="text-sm text-gray-600 mt-1">
              Review and approve insights extracted from uploaded research
            </p>
          </div>
          <div className="divide-y divide-gray-100">
            {insights.length === 0 ? (
              <div className="px-6 py-8 text-sm text-gray-500">No pending insights found.</div>
            ) : (
              insights.map((insight) => {
                const insightDateLabel = getInsightDateLabel(insight);

                return (
                  <button
                    key={insight.insight_id}
                    onClick={() => onSelectInsight(insight.insight_id)}
                    className="w-full px-6 py-5 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-medium text-gray-900">
                          {insight.document_id || insight.insight_id}
                        </span>
                        <Badge
                          variant="secondary"
                          className={
                            insight.status === 'in_review'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          {insight.status === 'in_review' ? 'In Review' : 'Pending Review'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{insight.user_id || 'Unknown user'}</span>
                        {insightDateLabel && <span>{insightDateLabel}</span>}
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{insight.text}</p>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        {insight.document_id}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        {insight.supporting_chunks?.length ?? 0} supporting chunk
                        {(insight.supporting_chunks?.length ?? 0) !== 1 ? 's' : ''}
                      </span>
                      {(insight.metadata?.length ?? 0) > 0 && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5" />
                          {insight.metadata?.length} metadata tag{(insight.metadata?.length ?? 0) !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
