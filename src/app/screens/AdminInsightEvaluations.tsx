import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import {
  fetchAdminInsightEvaluations,
  type AdminProjectInsightEvaluationSummary,
  type AdminInsightEvaluationsResponse,
} from '../api/insights';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { ApprovalReviewQueueTab } from './data-source-connection/ApprovalReviewQueueTab';
import type { Insight } from './data-source-connection/types';

function formatRate(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function formatNumber(value: number): string {
  return Number.isFinite(value) ? value.toLocaleString() : '0';
}

function formatDecimal(value: number): string {
  return Number.isFinite(value) ? value.toFixed(2) : '0.00';
}

function toProjectQueueInsight(project: AdminProjectInsightEvaluationSummary): Insight {
  return {
    insight_id: project.project_id,
    project_id: project.project_id,
    user_id: '',
    status: 'pending',
    text: 'Project review',
    evidence_snippet: 'Project review',
    s3_node: `project:${project.project_id}`,
    document_id: project.project_id,
  };
}

export function AdminInsightEvaluations() {
  const [projectIdInput, setProjectIdInput] = useState('');
  const [activeProjectIdFilter, setActiveProjectIdFilter] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<AdminInsightEvaluationsResponse | null>(null);
  const [expandedProjectId, setExpandedProjectId] = useState<string | undefined>(undefined);

  const loadData = useCallback(async (projectId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const next = await fetchAdminInsightEvaluations({
        projectId,
        limit: 100,
      });
      setResponse(next);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Failed to load insight evaluations.');
      setResponse(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData(activeProjectIdFilter);
  }, [activeProjectIdFilter, loadData]);

  const dashboardTotals = useMemo(() => {
    const projects = response?.projects ?? [];
    return projects.reduce(
      (acc, project) => {
        acc.extracted += project.extracted_insight_count;
        acc.reviewed += project.reviewed_insight_count;
        acc.accepted += project.accepted_count;
        acc.declined += project.declined_count;
        acc.deleted += project.deleted_count;
        acc.scoreTotal += project.average_review_quality_score;
        acc.projectCount += 1;
        return acc;
      },
      {
        extracted: 0,
        reviewed: 0,
        accepted: 0,
        declined: 0,
        deleted: 0,
        scoreTotal: 0,
        projectCount: 0,
      },
    );
  }, [response]);

  const handleFilterSubmit = () => {
    const trimmed = projectIdInput.trim();
    setActiveProjectIdFilter(trimmed.length > 0 ? trimmed : undefined);
  };

  const handleReset = () => {
    setProjectIdInput('');
    setActiveProjectIdFilter(undefined);
  };

  const handleProjectClick = (projectId: string) => {
    setExpandedProjectId((current) => (current === projectId ? undefined : projectId));
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6 md:p-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold text-gray-900">Admin Insight Evaluations</h2>
          <p className="text-sm text-gray-600">
            Review extraction and post-review quality signals grouped by project ID.
          </p>
        </div>

        <Card className="border-gray-200 bg-white">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              <div className="w-full md:max-w-sm">
                <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="project-id-filter">
                  Project ID
                </label>
                <Input
                  id="project-id-filter"
                  value={projectIdInput}
                  onChange={(event) => setProjectIdInput(event.target.value)}
                  placeholder="Filter by project_id"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleFilterSubmit} disabled={loading}>
                  {loading ? 'Loading...' : 'Apply Filter'}
                </Button>
                <Button variant="outline" onClick={handleReset} disabled={loading}>
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {error ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6 text-sm text-red-700">{error}</CardContent>
          </Card>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <Card className="border-gray-200">
            <CardHeader className="pb-2"><CardDescription>Projects</CardDescription></CardHeader>
            <CardContent><p className="text-2xl font-semibold text-gray-900">{formatNumber(response?.total_projects ?? 0)}</p></CardContent>
          </Card>
          <Card className="border-gray-200">
            <CardHeader className="pb-2"><CardDescription>Extracted Insights</CardDescription></CardHeader>
            <CardContent><p className="text-2xl font-semibold text-gray-900">{formatNumber(dashboardTotals.extracted)}</p></CardContent>
          </Card>
          <Card className="border-gray-200">
            <CardHeader className="pb-2"><CardDescription>Reviewed Insights</CardDescription></CardHeader>
            <CardContent><p className="text-2xl font-semibold text-gray-900">{formatNumber(dashboardTotals.reviewed)}</p></CardContent>
          </Card>
          <Card className="border-gray-200">
            <CardHeader className="pb-2"><CardDescription>Accepted</CardDescription></CardHeader>
            <CardContent><p className="text-2xl font-semibold text-emerald-700">{formatNumber(dashboardTotals.accepted)}</p></CardContent>
          </Card>
          <Card className="border-gray-200">
            <CardHeader className="pb-2"><CardDescription>Declined</CardDescription></CardHeader>
            <CardContent><p className="text-2xl font-semibold text-amber-700">{formatNumber(dashboardTotals.declined)}</p></CardContent>
          </Card>
          <Card className="border-gray-200">
            <CardHeader className="pb-2"><CardDescription>Avg Score</CardDescription></CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-gray-900">
                {dashboardTotals.projectCount > 0
                  ? formatDecimal(dashboardTotals.scoreTotal / dashboardTotals.projectCount)
                  : '0.00'}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Projects</CardTitle>
            <CardDescription>Select a project to inspect breakdown details.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-gray-500">Loading evaluation projects...</p>
            ) : (response?.projects.length ?? 0) === 0 ? (
              <p className="text-sm text-gray-500">No evaluation data found for the current filter.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project ID</TableHead>
                    <TableHead className="text-right">Extracted</TableHead>
                    <TableHead className="text-right">Reviewed</TableHead>
                    <TableHead className="text-right">Acceptance</TableHead>
                    <TableHead className="text-right">Decline</TableHead>
                    <TableHead className="text-right">Deletion</TableHead>
                    <TableHead className="text-right">Avg Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(response?.projects ?? []).map((project) => {
                    const isExpanded = expandedProjectId === project.project_id;
                    const queueInsight = toProjectQueueInsight(project);
                    return (
                      <Fragment key={project.project_id}>
                        <TableRow
                          className={isExpanded ? 'cursor-pointer bg-blue-50' : 'cursor-pointer'}
                          onClick={() => handleProjectClick(project.project_id)}
                        >
                          <TableCell className="max-w-[300px] cursor-pointer font-medium" title={project.project_id}>
                            {project.project_id}
                          </TableCell>
                          <TableCell className="text-right">{formatNumber(project.extracted_insight_count)}</TableCell>
                          <TableCell className="text-right">{formatNumber(project.reviewed_insight_count)}</TableCell>
                          <TableCell className="text-right">{formatRate(project.acceptance_rate)}</TableCell>
                          <TableCell className="text-right">{formatRate(project.decline_rate)}</TableCell>
                          <TableCell className="text-right">{formatRate(project.deletion_rate)}</TableCell>
                          <TableCell className="text-right">{formatDecimal(project.average_review_quality_score)}</TableCell>
                        </TableRow>
                        {isExpanded ? (
                          <TableRow className="bg-white hover:bg-white">
                            <TableCell colSpan={7} className="whitespace-normal p-4">
                              <ApprovalReviewQueueTab
                                insights={[queueInsight]}
                                selectedInsightId={project.project_id}
                                onSelectInsight={setExpandedProjectId}
                                onBackToQueue={() => setExpandedProjectId(undefined)}
                                onQueueMutation={() => loadData(activeProjectIdFilter)}
                                onDeleteInsight={() => setExpandedProjectId(undefined)}
                              />
                            </TableCell>
                          </TableRow>
                        ) : null}
                      </Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
