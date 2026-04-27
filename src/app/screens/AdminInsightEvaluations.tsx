import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  fetchAdminInsightEvaluations,
  type AdminInsightEvaluationBucket,
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
import { Badge } from '../components/ui/badge';

function formatRate(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function formatNumber(value: number): string {
  return Number.isFinite(value) ? value.toLocaleString() : '0';
}

function formatDecimal(value: number): string {
  return Number.isFinite(value) ? value.toFixed(2) : '0.00';
}

function BucketTable(props: { title: string; buckets: AdminInsightEvaluationBucket[] }) {
  const { title, buckets } = props;
  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-gray-900">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {buckets.length === 0 ? (
          <p className="text-sm text-gray-500">No data.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Acceptance</TableHead>
                <TableHead className="text-right">Avg Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {buckets.slice(0, 8).map((bucket) => (
                <TableRow key={`${title}-${bucket.key}`}>
                  <TableCell className="max-w-[220px] truncate" title={bucket.key}>{bucket.key}</TableCell>
                  <TableCell className="text-right">{formatNumber(bucket.total)}</TableCell>
                  <TableCell className="text-right">{formatRate(bucket.acceptance_rate)}</TableCell>
                  <TableCell className="text-right">{formatDecimal(bucket.avg_review_quality_score)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

export function AdminInsightEvaluations() {
  const [projectIdInput, setProjectIdInput] = useState('');
  const [activeProjectIdFilter, setActiveProjectIdFilter] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<AdminInsightEvaluationsResponse | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const loadData = useCallback(async (projectId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const next = await fetchAdminInsightEvaluations({
        projectId,
        limit: 100,
      });
      setResponse(next);

      const firstProjectId = next.projects[0]?.project_id;
      if (!firstProjectId) {
        setSelectedProjectId(null);
      } else if (!selectedProjectId || !next.projects.some((project) => project.project_id === selectedProjectId)) {
        setSelectedProjectId(firstProjectId);
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Failed to load insight evaluations.');
      setResponse(null);
      setSelectedProjectId(null);
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    void loadData(activeProjectIdFilter);
  }, [activeProjectIdFilter, loadData]);

  const selectedProject = useMemo<AdminProjectInsightEvaluationSummary | null>(() => {
    if (!response || !selectedProjectId) return null;
    return response.projects.find((project) => project.project_id === selectedProjectId) ?? null;
  }, [response, selectedProjectId]);

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
                    const isSelected = selectedProjectId === project.project_id;
                    return (
                      <TableRow
                        key={project.project_id}
                        className={isSelected ? 'bg-blue-50' : undefined}
                        onClick={() => setSelectedProjectId(project.project_id)}
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
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {selectedProject ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-semibold text-gray-900">Project Details</h3>
              <Badge variant="outline" className="text-xs">{selectedProject.project_id}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              <Card className="border-gray-200"><CardHeader className="pb-2"><CardDescription>Accepted Unchanged</CardDescription></CardHeader><CardContent><p className="text-xl font-semibold text-emerald-700">{formatNumber(selectedProject.accepted_unchanged_count)}</p></CardContent></Card>
              <Card className="border-gray-200"><CardHeader className="pb-2"><CardDescription>Accepted Small Edit</CardDescription></CardHeader><CardContent><p className="text-xl font-semibold text-blue-700">{formatNumber(selectedProject.accepted_small_edit_count)}</p></CardContent></Card>
              <Card className="border-gray-200"><CardHeader className="pb-2"><CardDescription>Accepted Major Edit</CardDescription></CardHeader><CardContent><p className="text-xl font-semibold text-indigo-700">{formatNumber(selectedProject.accepted_major_edit_count)}</p></CardContent></Card>
              <Card className="border-gray-200"><CardHeader className="pb-2"><CardDescription>Avg Text Edit Distance</CardDescription></CardHeader><CardContent><p className="text-xl font-semibold text-gray-900">{formatDecimal(selectedProject.average_text_edit_distance)}</p></CardContent></Card>
              <Card className="border-gray-200"><CardHeader className="pb-2"><CardDescription>Avg Metadata Delta</CardDescription></CardHeader><CardContent><p className="text-xl font-semibold text-gray-900">{formatDecimal(selectedProject.average_metadata_delta)}</p></CardContent></Card>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <BucketTable title="Pipeline Version" buckets={selectedProject.pipeline_version_breakdown} />
              <BucketTable title="Model" buckets={selectedProject.model_breakdown} />
              <BucketTable title="Prompt Version" buckets={selectedProject.prompt_version_breakdown} />
              <BucketTable title="Extraction Mode" buckets={selectedProject.extraction_mode_breakdown} />
              <BucketTable title="Source Mode" buckets={selectedProject.source_mode_breakdown} />

              <Card className="border-gray-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-900">Most Corrected Dimensions</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedProject.common_corrected_dimensions.length === 0 ? (
                    <p className="text-sm text-gray-500">No dimension corrections captured.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.common_corrected_dimensions.map((item) => (
                        <Badge key={`${item.dimension}-${item.count}`} variant="outline">
                          {item.dimension} ({item.count})
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-gray-900">Recent Terminal Review Events</CardTitle>
                <CardDescription>
                  Latest accepted/declined/deleted events across reviewed insights.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedProject.recent_terminal_events.length === 0 ? (
                  <p className="text-sm text-gray-500">No terminal review events yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Insight</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead>Outcome</TableHead>
                        <TableHead className="text-right">Score</TableHead>
                        <TableHead className="text-right">Metadata Δ</TableHead>
                        <TableHead className="text-right">Meta +</TableHead>
                        <TableHead className="text-right">Meta -</TableHead>
                        <TableHead className="text-right">Meta ~</TableHead>
                        <TableHead>Pipeline</TableHead>
                        <TableHead>Model</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedProject.recent_terminal_events.map((event) => (
                        <TableRow key={`${event.insight_id}-${event.occurred_at}`}>
                          <TableCell>{event.occurred_at ? new Date(event.occurred_at).toLocaleString() : '-'}</TableCell>
                          <TableCell className="max-w-[220px] truncate" title={event.insight_id}>{event.insight_id}</TableCell>
                          <TableCell>{event.event_type}</TableCell>
                          <TableCell>{event.outcome}</TableCell>
                          <TableCell className="text-right">{formatDecimal(event.review_quality_score)}</TableCell>
                          <TableCell className="text-right">{formatNumber(event.metadata_delta_count)}</TableCell>
                          <TableCell className="text-right">{formatNumber(event.metadata_added_count)}</TableCell>
                          <TableCell className="text-right">{formatNumber(event.metadata_removed_count)}</TableCell>
                          <TableCell className="text-right">{formatNumber(event.metadata_edited_count)}</TableCell>
                          <TableCell className="max-w-[180px] truncate" title={event.pipeline_version}>{event.pipeline_version}</TableCell>
                          <TableCell className="max-w-[180px] truncate" title={event.model_name}>{event.model_name}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
}
