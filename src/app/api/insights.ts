import { fetchAuthSession } from "aws-amplify/auth";
import type {
  Insight,
  InsightFamilyData,
  InsightFamilyDataRow,
  MetadataEntry,
} from '../screens/data-source-connection/types';

type InsightsResponse = {
  count: number;
  items: unknown[];
};

export type ProjectRecord = {
  user_id: string;
  status: string;
  project_id: string;
  insight_ids?: string[];
  countAccepted?: number;
  countDeclined?: number;
  numberChildInsights?: number;
  user_info?: {
    full_name?: string;
    email_address?: string;
  };
  upload_mode?: "document" | "manual";
  research_context?: string;
  context_urls?: string[];
  output_urls?: string[];
  raw_data_urls?: string[];
  created_at?: string;
  updated_at?: string;
};

export type ProjectApprovalBundle = {
  project: ProjectRecord;
  insights: Insight[];
  insightfamilydata: InsightFamilyData[];
};

type InsightDetailResponse = {
  insight: Insight;
  siblings: Insight[];
  data: InsightFamilyData | null;
};

type InsightTreeResponse = {
  insight: Insight[];
  children: Insight[];
  parents: Insight[];
  siblings: Insight[];
  data: InsightFamilyData | null;
};

type SearchFilters = {
  document_id?: string;
  status?: string;
  parent_insight_id?: string;
  metadata?: Array<{ tag: string; value?: string }>;
};

type SearchPagination = {
  limit?: number;
  cursor?: string;
};

export type SearchSource = 'local' | 'gwi' | 'all';

export type SearchInsightsResponse = {
  summary: string;
  insights: Insight[];
};

export type SearchStreamStatusStage =
  | 'retrieving_results'
  | 'streaming_summary'
  | 'complete';

export type SearchStreamStatusEvent = {
  stage: SearchStreamStatusStage;
  message: string;
};

export type SearchStreamResultsEvent = {
  insights: Insight[];
};

export type SearchStreamSourceMetadataEntry = {
  key: string;
  values: unknown[];
};

export type SearchStreamSourceResultEvent = {
  source: 'local' | 'gwi';
  insights: Insight[];
  metadata: SearchStreamSourceMetadataEntry[];
};

export type SearchStreamTokenEvent = {
  text: string;
};

export type SearchStreamErrorEvent = {
  message: string;
  source?: 'local' | 'gwi';
};

export type SearchStreamDoneEvent = {
  requestedSource: SearchSource;
};

export type DiveDeeperStatusStage =
  | 'loading_selected'
  | 'expanding_graph'
  | 'building_context'
  | 'calling_openai'
  | 'expanding_local_context'
  | 'invoking_agent'
  | 'tool_execution'
  | 'streaming_response'
  | 'complete';

export type DiveDeeperStatusEvent = {
  stage: DiveDeeperStatusStage;
  message: string;
};

export type DiveDeeperContextEvent = {
  selected_insight_ids: string[];
  expanded_insight_ids?: string[];
  local_context_ids?: string[];
  counts: {
    selected: number;
    expanded?: number;
    local_context?: number;
    total_context: number;
  };
};

export type DiveDeeperTokenEvent = {
  text: string;
};

export type DiveDeeperFinalEvent = {
  answer: string;
  selected_insight_ids: string[];
  expanded_insight_ids: string[];
  used_insight_ids: string[];
  local_context_ids?: string[];
  agent_used_tools?: boolean;
};

export type DiveDeeperErrorEvent = {
  message: string;
};

type DiveDeeperEventType =
  | 'status'
  | 'context'
  | 'tool_call'
  | 'tool_result'
  | 'token'
  | 'final'
  | 'error';

type SearchStreamEventType =
  | 'status'
  | 'results'
  | 'result'
  | 'token'
  | 'final'
  | 'error'
  | 'done';

export type StreamDiveDeeperOptions = {
  selectedInsightIds: string[];
  query: string;
  userId?: string;
  organizationId?: string;
  documentId?: string;
  signal?: AbortSignal;
  onStatus?: (event: DiveDeeperStatusEvent) => void;
  onContext?: (event: DiveDeeperContextEvent) => void;
  onToken?: (event: DiveDeeperTokenEvent) => void;
  onFinal?: (event: DiveDeeperFinalEvent) => void;
  onError?: (event: DiveDeeperErrorEvent) => void;
};

export type StreamSearchInsightsOptions = {
  source?: SearchSource;
  filters?: SearchFilters;
  pagination?: SearchPagination;
  signal?: AbortSignal;
  onStatus?: (event: SearchStreamStatusEvent) => void;
  onResults?: (event: SearchStreamResultsEvent) => void;
  onSourceResult?: (event: SearchStreamSourceResultEvent) => void;
  onSummaryToken?: (event: SearchStreamTokenEvent) => void;
  onDone?: (event: SearchStreamDoneEvent) => void;
  onFinal?: (event: SearchInsightsResponse) => void;
  onError?: (event: SearchStreamErrorEvent) => void;
};

export type GenerateInsightsPayload = {
  userId: string;
  user_info?: {
    full_name?: string;
    email_address?: string;
  };
  uploadMode: "document" | "manual";
  researchContext: string;
  contextUrls: string[];
  outputUrls: string[];
  rawDataUrls: string[];
};

export type InsightsFilters = {
  document_id?: string;
  status?: string;
  parent_insight_id?: string;
  project_id?: string;
  limit?: number;
  cursor?: string;
};

export type UpdateInsightPayload = {
  createdAt?: string;
  text?: string;
  summary?: string;
  status?: string;
  metadata?: MetadataEntry[];
  footnote?: string;
  user_info?: {
    full_name?: string;
    email_address?: string;
  };
};

export type UpdateInsightFamilyDataPayload = {
  dimensions?: string[];
  metric_columns?: string[];
  rows?: InsightFamilyDataRow[];
};

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ??
  import.meta.env.BACKEND_URL ??
  "http://localhost:8000";
const BACKEND_SEARCH_URL =
  import.meta.env.VITE_BACKEND_SEARCH_URL ??
  import.meta.env.BACKEND_SEARCH_URL ??
  "http://localhost:8005";

function logInsightsDebug(functionName: string, message: string, details?: unknown): void {
  if (details === undefined) {
    console.debug(`[insights-api] ${functionName}: ${message}`);
    return;
  }
  console.debug(`[insights-api] ${functionName}: ${message}`, details);
}

function logInsightsError(functionName: string, message: string, details?: unknown): void {
  if (details === undefined) {
    console.error(`[insights-api] ${functionName}: ${message}`);
    return;
  }
  console.error(`[insights-api] ${functionName}: ${message}`, details);
}

function castInsights(items: unknown[]): Insight[] {
  logInsightsDebug('castInsights', 'Casting items to Insight[]', { count: items.length });
  return items as Insight[];
}

async function fetchInsightsByFilters(params: Record<string, string>): Promise<Insight[]> {
  logInsightsDebug('fetchInsightsByFilters', 'Started', { params });
  const url = new URL("/insights", BACKEND_URL);
  if (params) { 
    Object.entries(params).forEach(([key, value]) => {
            console.log(`Set query parameter: ${key}=${value}`);

      url.searchParams.set(key, value);
    });
  }
  logInsightsDebug('fetchInsightsByFilters', 'Constructed URL with query parameters', { url: url.toString() });

  const headers = await buildAuthHeaders({});

  logInsightsDebug('fetchInsightsByFilters', 'Sending GET request', { url: url.toString() });
  const response = await fetch(url.toString(), { method: "GET", headers });
  logInsightsDebug('fetchInsightsByFilters', 'Received response', {
    status: response.status,
    ok: response.ok,
  });
  const text = await response.text();
  let data: InsightsResponse | null = null;
  try {
    data = JSON.parse(text) as InsightsResponse;
  } catch {
    logInsightsError('fetchInsightsByFilters', 'Failed to parse JSON response body', {
      responsePreview: text.slice(0, 300),
    });
    data = null;
  }

  if (!response.ok) {
    logInsightsError('fetchInsightsByFilters', 'Backend returned error response', {
      status: response.status,
      responsePreview: text.slice(0, 300),
    });
    throw new Error(`Failed to fetch insights: ${response.status} ${text}`);
  }

  if (!data || !Array.isArray(data.items)) {
    logInsightsError('fetchInsightsByFilters', 'Invalid response shape', { data });
    throw new Error("Invalid insights response");
  }

  logInsightsDebug('fetchInsightsByFilters', 'Completed successfully', {
    count: data.items.length,
  });
  return castInsights(data.items);
}

export async function fetchInsights(filters?: InsightsFilters): Promise<Insight[]> {
  logInsightsDebug('fetchInsights', 'Started' + BACKEND_URL, { filters });
  const params = Object.fromEntries(
    Object.entries(filters ?? {}).filter(([, value]) => value !== undefined && value !== ''),
  ) as Record<string, string | number>;
  delete params.user_id;
  logInsightsDebug('fetchInsights', 'Normalized filters (removed undefined/empty)', { params });
  const stringParams = Object.fromEntries(
    Object.entries(params).map(([key, value]) => [key, String(value)]),
  );

  logInsightsDebug('fetchInsights', 'Normalized filters', { stringParams });
  const insights = await fetchInsightsByFilters(stringParams);
  logInsightsDebug('fetchInsights', 'Completed successfully', { count: insights.length });
  return insights;
}

export async function fetchAllInsights(): Promise<Insight[]> {
  logInsightsDebug('fetchAllInsights', 'Started');
  const url = new URL("/insights/all", BACKEND_URL);
  const headers = await buildAuthHeaders({});
  const response = await fetch(url.toString(), { method: "GET", headers });
  const text = await response.text();

  if (!response.ok) {
    logInsightsError('fetchAllInsights', 'Backend returned error response', {
      status: response.status,
      responsePreview: text.slice(0, 300),
    });
    throw new Error(`Failed to fetch all insights: ${response.status} ${text}`);
  }

  let data: InsightsResponse | null = null;
  try {
    data = JSON.parse(text) as InsightsResponse;
  } catch {
    logInsightsError('fetchAllInsights', 'Failed to parse JSON response body', {
      responsePreview: text.slice(0, 300),
    });
    throw new Error("Invalid insights response");
  }

  if (!data || !Array.isArray(data.items)) {
    logInsightsError('fetchAllInsights', 'Invalid response shape', { data });
    throw new Error("Invalid insights response");
  }

  logInsightsDebug('fetchAllInsights', 'Completed successfully', { count: data.items.length });
  return castInsights(data.items);
}

export async function fetchTopLevelInsightsByUser(_userId: string, status: string): Promise<Insight[]> {
  logInsightsDebug('fetchTopLevelInsightsByUser', 'Started', { status });
  const insights = await fetchInsightsByFilters({
    parent_insight_id: 'null',
    status: status,
  });
  logInsightsDebug('fetchTopLevelInsightsByUser', 'Completed successfully', { count: insights.length });
  return insights;
}

export async function fetchPendingProjectsByUser(_userId: string): Promise<ProjectRecord[]> {
  logInsightsDebug('fetchPendingProjectsByUser', 'Started');
  const items = await fetchProjectsByStatus('Pending');
  logInsightsDebug('fetchPendingProjectsByUser', 'Completed successfully', { count: items.length });
  return items;
}

export async function fetchNonPendingProjectsByUser(_userId: string): Promise<ProjectRecord[]> {
  logInsightsDebug('fetchNonPendingProjectsByUser', 'Started');
  const statuses = ['Accepted', 'Declined', 'Completed'];
  const projectBuckets = await Promise.all(statuses.map((status) => fetchProjectsByStatus(status)));
  const dedupedByProjectId = new Map<string, ProjectRecord>();

  for (const bucket of projectBuckets) {
    for (const project of bucket) {
      if (!dedupedByProjectId.has(project.project_id)) {
        dedupedByProjectId.set(project.project_id, project);
      }
    }
  }

  const projects = Array.from(dedupedByProjectId.values()).sort((left, right) => {
    const leftUpdated = new Date(left.updated_at ?? left.created_at ?? 0).getTime();
    const rightUpdated = new Date(right.updated_at ?? right.created_at ?? 0).getTime();
    return rightUpdated - leftUpdated;
  });

  logInsightsDebug('fetchNonPendingProjectsByUser', 'Completed successfully', { count: projects.length });
  return projects;
}

async function fetchProjectsByStatus(status: string): Promise<ProjectRecord[]> {
  const url = new URL('/projects', BACKEND_URL);
  url.searchParams.set('status', status);
  const headers = await buildAuthHeaders({});

  const response = await fetch(url.toString(), { method: 'GET', headers });
  const text = await response.text();
  if (!response.ok) {
    logInsightsError('fetchProjectsByStatus', 'Backend returned error response', {
      status: response.status,
      requestedStatus: status,
      responsePreview: text.slice(0, 300),
    });
    throw new Error(`Failed to fetch projects: ${response.status} ${text}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Invalid projects response');
  }

  const items =
    parsed &&
    typeof parsed === 'object' &&
    !Array.isArray(parsed) &&
    Array.isArray((parsed as { items?: unknown[] }).items)
      ? ((parsed as { items: unknown[] }).items as ProjectRecord[])
      : [];
  return items;
}

export async function fetchProjectApprovalBundle(projectId: string): Promise<ProjectApprovalBundle> {
  logInsightsDebug('fetchProjectApprovalBundle', 'Started', { projectId });
  const url = new URL(`/projects/${encodeURIComponent(projectId)}`, BACKEND_URL);
  const headers = await buildAuthHeaders({});
  const response = await fetch(url.toString(), { method: 'GET', headers });
  const text = await response.text();
  if (!response.ok) {
    logInsightsError('fetchProjectApprovalBundle', 'Backend returned error response', {
      status: response.status,
      responsePreview: text.slice(0, 300),
    });
    throw new Error(`Failed to fetch project bundle: ${response.status} ${text}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Invalid project bundle response');
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Invalid project bundle response');
  }

  const bundle = parsed as ProjectApprovalBundle;
  if (!bundle.project || typeof bundle.project !== 'object') {
    throw new Error('Invalid project bundle response');
  }

  return {
    project: bundle.project,
    insights: Array.isArray(bundle.insights) ? bundle.insights : [],
    insightfamilydata: Array.isArray(bundle.insightfamilydata) ? bundle.insightfamilydata : [],
  };
}

export async function fetchProjectInsights(_userId: string, projectId: string): Promise<Insight[]> {
  logInsightsDebug('fetchProjectInsights', 'Started', { projectId });
  try {
    const bundle = await fetchProjectApprovalBundle(projectId);
    const insights = Array.isArray(bundle.insights) ? bundle.insights : [];
    logInsightsDebug('fetchProjectInsights', 'Completed successfully via project bundle', {
      count: insights.length,
    });
    return insights;
  } catch (error) {
    logInsightsError('fetchProjectInsights', 'Project bundle fetch failed', {
      projectId,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

export async function fetchInsightById(
  insightId: string,
  options?: { source?: SearchSource },
): Promise<InsightDetailResponse | null> {
  logInsightsDebug('fetchInsightById', 'Started', { insightId, source: options?.source });
  const url = new URL(`/insight/${encodeURIComponent(insightId)}`, BACKEND_SEARCH_URL);
  if (options?.source) {
    url.searchParams.set('source', options.source);
  }
  const headers = await buildAuthHeaders({});

  logInsightsDebug('fetchInsightById', 'Sending GET request', { url: url.toString() });
  const response = await fetch(url.toString(), { method: "GET", headers });
  logInsightsDebug('fetchInsightById', 'Received response', {
    status: response.status,
    ok: response.ok,
  });

  if (response.status === 404) {
    logInsightsDebug('fetchInsightById', 'Insight not found');
    return null;
  }

  const text = await response.text();
  let data: unknown = null;
  try {
    data = JSON.parse(text);
  } catch {
    logInsightsError('fetchInsightById', 'Failed to parse JSON response body', {
      responsePreview: text.slice(0, 300),
    });
    data = null;
  }

  if (!response.ok) {
    logInsightsError('fetchInsightById', 'Backend returned error response', {
      status: response.status,
      responsePreview: text.slice(0, 300),
    });
    throw new Error(`Failed to fetch insight: ${response.status} ${text}`);
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    logInsightsError('fetchInsightById', 'Invalid response shape', { data });
    throw new Error("Invalid insight response");
  }

  const parsed = data as Partial<InsightDetailResponse>;
  if (!parsed.insight || typeof parsed.insight !== "object" || Array.isArray(parsed.insight)) {
    logInsightsError('fetchInsightById', 'Invalid insight envelope in response', { parsed });
    throw new Error("Invalid insight response");
  }

  logInsightsDebug('fetchInsightById', 'Completed successfully', { insightId });
  return {
    insight: parsed.insight as Insight,
    siblings: Array.isArray(parsed.siblings) ? castInsights(parsed.siblings) : [],
    data: (parsed.data ?? null) as InsightFamilyData | null,
  };
}

export async function fetchInsightTree(
  insightId: string,
  options?: { source?: SearchSource },
): Promise<InsightTreeResponse | null> {
  logInsightsDebug('fetchInsightTree', 'Started', { insightId, source: options?.source });
  const url = new URL(`/insight/tree/${encodeURIComponent(insightId)}`, BACKEND_SEARCH_URL);
  if (options?.source) {
    url.searchParams.set('source', options.source);
  }
  const headers = await buildAuthHeaders({});

  logInsightsDebug('fetchInsightTree', 'Sending GET request', { url: url.toString() });
  const response = await fetch(url.toString(), { method: "GET", headers });
  logInsightsDebug('fetchInsightTree', 'Received response', {
    status: response.status,
    ok: response.ok,
  });

  if (response.status === 404) {
    logInsightsDebug('fetchInsightTree', 'Insight tree not found');
    return null;
  }

  const text = await response.text();
  let data: unknown = null;
  try {
    data = JSON.parse(text);
  } catch {
    logInsightsError('fetchInsightTree', 'Failed to parse JSON response body', {
      responsePreview: text.slice(0, 300),
    });
    data = null;
  }

  if (!response.ok) {
    logInsightsError('fetchInsightTree', 'Backend returned error response', {
      status: response.status,
      responsePreview: text.slice(0, 300),
    });
    throw new Error(`Failed to fetch insight tree: ${response.status} ${text}`);
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    logInsightsError('fetchInsightTree', 'Invalid response shape', { data });
    throw new Error("Invalid insight tree response");
  }

  const parsed = data as Partial<InsightTreeResponse>;
  if (
    !Array.isArray(parsed.insight) ||
    !Array.isArray(parsed.children) ||
    !Array.isArray(parsed.parents) ||
    !Array.isArray(parsed.siblings)
  ) {
    logInsightsError('fetchInsightTree', 'Invalid tree arrays in response', { parsed });
    throw new Error("Invalid insight tree response");
  }

  logInsightsDebug('fetchInsightTree', 'Completed successfully', {
    insight: parsed.insight.length,
    children: parsed.children.length,
    parents: parsed.parents.length,
    siblings: parsed.siblings.length,
  });
  return {
    insight: castInsights(parsed.insight),
    children: castInsights(parsed.children),
    parents: castInsights(parsed.parents),
    siblings: castInsights(parsed.siblings),
    data: (parsed.data ?? null) as InsightFamilyData | null,
  };
}

export async function updateInsightById(
  insightId: string,
  payload: UpdateInsightPayload,
): Promise<Insight> {
  logInsightsDebug('updateInsightById', 'Started', { insightId, payloadKeys: Object.keys(payload) });
  const url = new URL(`/insight/${encodeURIComponent(insightId)}`, BACKEND_URL);
  const headers = await buildAuthHeaders({
    "Content-Type": "application/json",
  });

  logInsightsDebug('updateInsightById', 'Sending PATCH request', { url: url.toString() });
  const response = await fetch(url.toString(), {
    method: "PATCH",
    headers,
    body: JSON.stringify(payload),
  });
  logInsightsDebug('updateInsightById', 'Received response', {
    status: response.status,
    ok: response.ok,
  });

  const text = await response.text();
  let data: unknown = null;
  try {
    data = JSON.parse(text);
  } catch {
    data = null;
  }

  if (!response.ok) {
    logInsightsError('updateInsightById', 'Backend returned error response', {
      status: response.status,
      responsePreview: text.slice(0, 300),
    });
    throw new Error(`Failed to update insight: ${response.status} ${text}`);
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Invalid update insight response");
  }

  const parsed = data as { insight?: Insight };
  if (!parsed.insight || typeof parsed.insight !== "object" || Array.isArray(parsed.insight)) {
    throw new Error("Invalid update insight response");
  }

  logInsightsDebug('updateInsightById', 'Completed successfully', { insightId });
  return parsed.insight;
}

export async function updateInsightFamilyDataById(
  tableId: string,
  payload: UpdateInsightFamilyDataPayload,
): Promise<InsightFamilyData> {
  logInsightsDebug('updateInsightFamilyDataById', 'Started', { tableId, payloadKeys: Object.keys(payload) });
  const url = new URL(`/insight-family-data/${encodeURIComponent(tableId)}`, BACKEND_URL);
  const headers = await buildAuthHeaders({
    "Content-Type": "application/json",
  });

  logInsightsDebug('updateInsightFamilyDataById', 'Sending PATCH request', { url: url.toString() });
  const response = await fetch(url.toString(), {
    method: "PATCH",
    headers,
    body: JSON.stringify(payload),
  });
  logInsightsDebug('updateInsightFamilyDataById', 'Received response', {
    status: response.status,
    ok: response.ok,
  });

  const text = await response.text();
  let data: unknown = null;
  try {
    data = JSON.parse(text);
  } catch {
    data = null;
  }

  if (!response.ok) {
    logInsightsError('updateInsightFamilyDataById', 'Backend returned error response', {
      status: response.status,
      responsePreview: text.slice(0, 300),
    });
    throw new Error(`Failed to update insight family data: ${response.status} ${text}`);
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Invalid insight family data update response");
  }

  const parsed = data as { data?: InsightFamilyData };
  if (!parsed.data || typeof parsed.data !== "object" || Array.isArray(parsed.data)) {
    throw new Error("Invalid insight family data update response");
  }

  logInsightsDebug('updateInsightFamilyDataById', 'Completed successfully', { tableId });
  return parsed.data;
}

export async function acceptInsights(projectId: string, insights: Insight[]): Promise<void> {
  logInsightsDebug('acceptInsights', 'Started', {
    projectId,
    insightCount: insights.length,
  });
  const url = new URL(`/insights/accept/${encodeURIComponent(projectId)}`, BACKEND_URL);
  const headers: Record<string, string> = {
    "Content-Type": "application/x-ndjson",
    Accept: "application/x-ndjson",
  };
  const authHeaders = await buildAuthHeaders(headers);
  const bodyStream = createInsightNdjsonStream(insights);
  logInsightsDebug('acceptInsights', 'Sending streaming PATCH request', {
    url: url.toString(),
    insightCount: insights.length,
  });
  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method: "PATCH",
      headers: authHeaders,
      body: bodyStream,
      duplex: "half",
    } as RequestInit & { duplex: "half" });
  } catch (error) {
    logInsightsError("acceptInsights", "Streaming PATCH failed; falling back to legacy JSON PATCH", {
      message: error instanceof Error ? error.message : "Unknown streaming fetch error",
    });
    response = await fallbackAcceptInsightsJson(url.toString(), insights);
  }
  logInsightsDebug('acceptInsights', 'Received response', {
    status: response.status,
    ok: response.ok,
  });

  if (!response.ok) {
    if (response.status === 413) {
      logInsightsError("acceptInsights", "Legacy JSON PATCH hit 413. Retrying as sequential one-insight PATCH calls.");
      await fallbackAcceptInsightsJsonSequential(url.toString(), insights);
      logInsightsDebug("acceptInsights", "Completed successfully via sequential fallback", {
        insightCount: insights.length,
      });
      return;
    }

    const text = await response.text();
    logInsightsError('acceptInsights', 'Backend returned error response', {
      status: response.status,
      responsePreview: text.slice(0, 300),
    });
    throw new Error(`Failed to accept insights: ${response.status} ${text}`);
  }

  const streamSummary = await consumeNdjsonResponse(response);
  logInsightsDebug('acceptInsights', 'Completed successfully', streamSummary);
}

async function fallbackAcceptInsightsJson(url: string, insights: Insight[]): Promise<Response> {
  const headers = await buildAuthHeaders({
    "Content-Type": "application/json",
    Accept: "application/json",
  });

  return fetch(url, {
    method: "PATCH",
    headers,
    body: JSON.stringify(insights),
  });
}

async function fallbackAcceptInsightsJsonSequential(url: string, insights: Insight[]): Promise<void> {
  const headers = await buildAuthHeaders({
    "Content-Type": "application/json",
    Accept: "application/json",
    "x-insights-partial-update": "true",
  });

  for (let i = 0; i < insights.length; i += 1) {
    const insight = insights[i];
    const response = await fetch(url, {
      method: "PATCH",
      headers,
      body: JSON.stringify([insight]),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Failed to accept insight ${i + 1}/${insights.length}: ${response.status} ${text}`,
      );
    }
  }
}

function createInsightNdjsonStream(insights: Insight[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let index = 0;
  return new ReadableStream<Uint8Array>({
    pull(controller) {
      if (index >= insights.length) {
        controller.close();
        return;
      }

      const insight = insights[index];
      index += 1;
      controller.enqueue(encoder.encode(`${JSON.stringify(insight)}\n`));
    },
  });
}

async function consumeNdjsonResponse(
  response: Response,
): Promise<{ processed: number; complete: boolean; projectUpdated: boolean }> {
  if (!response.body) {
    return { processed: 0, complete: true, projectUpdated: false };
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let processed = 0;
  let complete = false;
  let projectUpdated = false;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let newlineIndex = buffer.indexOf("\n");
    while (newlineIndex >= 0) {
      const line = buffer.slice(0, newlineIndex).trim();
      buffer = buffer.slice(newlineIndex + 1);
      if (line) {
        let parsed: Record<string, unknown>;
        try {
          parsed = JSON.parse(line) as Record<string, unknown>;
        } catch (error) {
          logInsightsError("acceptInsights", "Failed to parse streaming response line", {
            linePreview: line.slice(0, 200),
            message: error instanceof Error ? error.message : "Unknown parse error",
          });
          newlineIndex = buffer.indexOf("\n");
          continue;
        }

        if (parsed.type === "insight_persisted") processed += 1;
        if (parsed.type === "project_counts_updated") projectUpdated = true;
        if (parsed.type === "complete") complete = true;
        if (parsed.type === "error") {
          const message =
            typeof parsed.message === "string"
              ? parsed.message
              : "Backend stream reported an unknown error.";
          throw new Error(message);
        }
      }
      newlineIndex = buffer.indexOf("\n");
    }
  }

  return {
    processed,
    complete,
    projectUpdated,
  };
}

export async function deleteInsightTree(insightId: string): Promise<void> {
  logInsightsDebug('deleteInsightTree', 'Started', { insightId });
  const url = new URL(`/project/${encodeURIComponent(insightId)}`, BACKEND_URL);
  const headers = await buildAuthHeaders({});

  logInsightsDebug('deleteInsightTree', 'Sending DELETE request', { url: url.toString() });
  const response = await fetch(url.toString(), {
    method: "DELETE",
    headers,
  });
  logInsightsDebug('deleteInsightTree', 'Received response', {
    status: response.status,
    ok: response.ok,
  });

  if (!response.ok) {
    const text = await response.text();
    logInsightsError('deleteInsightTree', 'Backend returned error response', {
      status: response.status,
      responsePreview: text.slice(0, 300),
    });
    throw new Error(`Failed to delete project: ${response.status} ${text}`);
  }

  logInsightsDebug('deleteInsightTree', 'Completed successfully');
}

export async function generateInsights(payload: GenerateInsightsPayload): Promise<unknown> {
  logInsightsDebug('generateInsights', 'Started', {
    userId: payload.userId,
    uploadMode: payload.uploadMode,
    contextUrls: payload.contextUrls.length,
    outputUrls: payload.outputUrls.length,
    rawDataUrls: payload.rawDataUrls.length,
  });
  const url = new URL("/generate-insights-v2", BACKEND_URL);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const authHeaders = await buildAuthHeaders(headers);

  logInsightsDebug('generateInsights', 'Sending POST request', { url: url.toString() });
  const response = await fetch(url.toString(), {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify(payload),
  });
  logInsightsDebug('generateInsights', 'Received response', {
    status: response.status,
    ok: response.ok,
  });

  const text = await response.text();
  if (!response.ok) {
    logInsightsError('generateInsights', 'Backend returned error response', {
      status: response.status,
      responsePreview: text.slice(0, 300),
    });
    throw new Error(`generateInsights failed: ${response.status} ${text}`);
  }

  if (!text) {
    logInsightsDebug('generateInsights', 'Completed successfully with empty response body');
    return null;
  }

  try {
    const data = JSON.parse(text) as unknown;
    logInsightsDebug('generateInsights', 'Completed successfully');
    return data;
  } catch {
    logInsightsDebug('generateInsights', 'Completed successfully with non-JSON response body');
    return text;
  }
}

export async function streamSearchInsights(
  query: string,
  options?: StreamSearchInsightsOptions,
): Promise<SearchInsightsResponse> {
  logInsightsDebug('streamSearchInsights', 'Started', {
    query,
    source: options?.source ?? 'local',
    hasFilters: Boolean(options?.filters),
    hasPagination: Boolean(options?.pagination),
  });
  const url = new URL("/search/v2", BACKEND_SEARCH_URL);
  const headers: Record<string, string> = await buildAuthHeaders({
    "Content-Type": "application/json",
    Accept: "text/event-stream",
  });
  logInsightsDebug('streamSearchInsights', 'Sending POST request', { url: url.toString() });
  const response = await fetch(url.toString(), {
    method: "POST",
    headers,
    signal: options?.signal,
    body: JSON.stringify({
      query,
      source: options?.source ?? 'local',
      filters: options?.filters,
      pagination: options?.pagination,
    }),
  });
  logInsightsDebug('streamSearchInsights', 'Received response', {
    status: response.status,
    ok: response.ok,
  });

  if (!response.ok) {
    const text = await response.text();
    logInsightsError('streamSearchInsights', 'Backend returned error response', {
      status: response.status,
      responsePreview: text.slice(0, 300),
    });
    throw new Error(`Failed to stream insights search: ${response.status} ${text}`);
  }

  if (!response.body) {
    throw new Error('Backend returned no streaming body for search response.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let latestResults: SearchStreamResultsEvent | null = null;
  const sourceResultsBySource = new Map<'local' | 'gwi', SearchStreamSourceResultEvent>();
  let streamedSummary = '';
  let finalResponse: SearchInsightsResponse | null = null;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    if (!value) continue;

    buffer += decoder.decode(value, { stream: true });
    const parsed = drainSseFrames(buffer);
    buffer = parsed.remainder;

    for (const frame of parsed.frames) {
      processSearchStreamFrame(frame, options, {
        onResults: (event) => {
          latestResults = event;
        },
        onSourceResult: (event) => {
          sourceResultsBySource.set(event.source, event);
        },
        onSummaryToken: (event) => {
          streamedSummary += event.text;
        },
        onFinal: (event) => {
          finalResponse = event;
        },
        onDone: () => {
          // No-op for return payload; caller receives onDone callback through options.
        },
      });
    }
  }

  buffer += decoder.decode();
  if (buffer.trim().length > 0) {
    const parsed = drainSseFrames(buffer);
    for (const frame of parsed.frames) {
      processSearchStreamFrame(frame, options, {
        onResults: (event) => {
          latestResults = event;
        },
        onSourceResult: (event) => {
          sourceResultsBySource.set(event.source, event);
        },
        onSummaryToken: (event) => {
          streamedSummary += event.text;
        },
        onFinal: (event) => {
          finalResponse = event;
        },
        onDone: () => {
          // No-op for return payload; caller receives onDone callback through options.
        },
      });
    }
  }

  if (finalResponse) {
    return finalResponse;
  }

  if (latestResults) {
    return {
      summary: streamedSummary.trim(),
      insights: latestResults.insights,
    };
  }

  if (sourceResultsBySource.size > 0) {
    return {
      summary: streamedSummary.trim(),
      insights: combineSourceResults(Array.from(sourceResultsBySource.values())),
    };
  }

  throw new Error('Search stream ended before final event was received.');
}

export async function searchInsights(
  query: string,
  options?: { source?: SearchSource; filters?: SearchFilters; pagination?: SearchPagination },
): Promise<SearchInsightsResponse> {
  logInsightsDebug('searchInsights', 'Started', { query, options });
  const url = new URL("/search/v2", BACKEND_SEARCH_URL);
  const headers: Record<string, string> = await buildAuthHeaders({
    "Content-Type": "application/json",
  });
  logInsightsDebug('searchInsights', 'Sending POST request', { url: url.toString() });
  const response = await fetch(url.toString(), {
    method: "POST",
    headers,
    body: JSON.stringify({
      query,
      source: options?.source ?? 'local',
      filters: options?.filters,
      pagination: options?.pagination,
    }),
  });
  logInsightsDebug('searchInsights', 'Received response', {
    status: response.status,
    ok: response.ok,
  });
  const text = await response.text();
  let data: unknown = null;
  try {
    data = JSON.parse(text);
  } catch {
    logInsightsError('searchInsights', 'Failed to parse JSON response body', {
      responsePreview: text.slice(0, 300),
    });
    data = null;
  }

  if (!response.ok) {
    logInsightsError('searchInsights', 'Backend returned error response', {
      status: response.status,
      responsePreview: text.slice(0, 300),
    });
    throw new Error(`Failed to search insights: ${response.status} ${text}`);
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    logInsightsError('searchInsights', 'Invalid response shape', { data });
    throw new Error("Invalid insights search response");
  }

  const parsed = data as { summary?: unknown; insights?: unknown };
  if (typeof parsed.summary !== "string" || !Array.isArray(parsed.insights)) {
    logInsightsError('searchInsights', 'Invalid response object fields', { parsed });
    throw new Error("Invalid insights search response");
  }

  const insights = castInsights(parsed.insights);
  const responseData: SearchInsightsResponse = {
    summary: parsed.summary,
    insights,
  };
  logInsightsDebug('searchInsights', 'Completed successfully', {
    count: insights.length,
    hasSummary: responseData.summary.length > 0,
  });
  return responseData;
}

export async function streamDiveDeeper(
  options: StreamDiveDeeperOptions,
): Promise<DiveDeeperFinalEvent> {
  const selectedInsightIds = dedupeStringValues(options.selectedInsightIds).filter(Boolean);
  if (selectedInsightIds.length === 0) {
    throw new Error('At least one selected insight ID is required for dive deeper.');
  }

  const query = options.query.trim();
  if (!query) {
    throw new Error('query is required for dive deeper v2.');
  }

  const url = new URL('/ai/dive-deeper/v2', BACKEND_SEARCH_URL);
  const headers: Record<string, string> = await buildAuthHeaders({
    'Content-Type': 'application/json',
    Accept: 'text/event-stream',
  });

  logInsightsDebug('streamDiveDeeper', 'Sending POST request', {
    url: url.toString(),
    selectedCount: selectedInsightIds.length,
    hasQuery: Boolean(options.query?.trim()),
  });

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers,
    signal: options.signal,
    body: JSON.stringify({
      selected_insight_ids: selectedInsightIds,
      query,
      ...(options.organizationId ? { organization_id: options.organizationId } : {}),
      ...(options.documentId ? { document_id: options.documentId } : {}),
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    logInsightsError('streamDiveDeeper', 'Backend returned error response', {
      status: response.status,
      responsePreview: text.slice(0, 300),
    });
    throw new Error(`Failed to stream dive deeper response: ${response.status} ${text}`);
  }

  if (!response.body) {
    throw new Error('Backend returned no streaming body for dive deeper response.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let finalEvent: DiveDeeperFinalEvent | null = null;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    if (!value) continue;

    buffer += decoder.decode(value, { stream: true });
    const parsed = drainSseFrames(buffer);
    buffer = parsed.remainder;

    for (const frame of parsed.frames) {
      processDiveDeeperFrame(frame, options, (event) => {
        finalEvent = event;
      });
    }
  }

  // Flush decoder and parse any final buffered SSE frames.
  buffer += decoder.decode();
  if (buffer.trim().length > 0) {
    const parsed = drainSseFrames(buffer);
    for (const frame of parsed.frames) {
      processDiveDeeperFrame(frame, options, (event) => {
        finalEvent = event;
      });
    }
  }

  if (!finalEvent) {
    throw new Error('Dive deeper stream ended before final event was received.');
  }

  return finalEvent;
}

type ParsedSseFrame = {
  event?: string;
  data?: unknown;
};

type SearchStreamFrameHandlers = {
  onResults: (event: SearchStreamResultsEvent) => void;
  onSourceResult: (event: SearchStreamSourceResultEvent) => void;
  onSummaryToken: (event: SearchStreamTokenEvent) => void;
  onFinal: (event: SearchInsightsResponse) => void;
  onDone: (event: SearchStreamDoneEvent) => void;
};

const processSearchStreamFrame = (
  frame: ParsedSseFrame,
  options: StreamSearchInsightsOptions | undefined,
  handlers: SearchStreamFrameHandlers,
): void => {
  const eventType = frame.event as SearchStreamEventType | undefined;
  if (!eventType) return;

  if (eventType === 'status') {
    const payload = frame.data as SearchStreamStatusEvent | undefined;
    if (payload && typeof payload.message === 'string' && typeof payload.stage === 'string') {
      options?.onStatus?.(payload);
    }
    return;
  }

  if (eventType === 'results') {
    const payload = parseSearchResultsPayload(frame.data);
    handlers.onResults(payload);
    options?.onResults?.(payload);
    return;
  }

  if (eventType === 'result') {
    const payload = parseSearchSourceResultPayload(frame.data);
    handlers.onSourceResult(payload);
    options?.onSourceResult?.(payload);
    return;
  }

  if (eventType === 'token') {
    const payload = frame.data as SearchStreamTokenEvent | undefined;
    if (payload && typeof payload.text === 'string') {
      handlers.onSummaryToken(payload);
      options?.onSummaryToken?.(payload);
    }
    return;
  }

  if (eventType === 'final') {
    const payload = parseSearchFinalPayload(frame.data);
    handlers.onFinal(payload);
    options?.onFinal?.(payload);
    return;
  }

  if (eventType === 'error') {
    const payload = frame.data as SearchStreamErrorEvent | undefined;
    if (payload && typeof payload.message === 'string') {
      options?.onError?.(payload);
      if (!payload.source) {
        throw new Error(payload.message);
      }
      return;
    }

    throw new Error('Search stream returned an unknown error event.');
  }

  if (eventType === 'done') {
    const payload = parseSearchDonePayload(frame.data);
    handlers.onDone(payload);
    options?.onDone?.(payload);
  }
};

const processDiveDeeperFrame = (
  frame: ParsedSseFrame,
  options: StreamDiveDeeperOptions,
  setFinalEvent: (event: DiveDeeperFinalEvent) => void,
): void => {
  const eventType = frame.event as DiveDeeperEventType | undefined;
  if (!eventType) return;

  if (eventType === 'status') {
    const payload = frame.data as DiveDeeperStatusEvent | undefined;
    if (payload && typeof payload.message === 'string' && typeof payload.stage === 'string') {
      options.onStatus?.(payload);
    }
    return;
  }

  if (eventType === 'context') {
    const payload = frame.data as DiveDeeperContextEvent | undefined;
    if (payload && Array.isArray(payload.selected_insight_ids)) {
      options.onContext?.(payload);
    }
    return;
  }

  if (eventType === 'token') {
    const payload = frame.data as DiveDeeperTokenEvent | undefined;
    if (payload && typeof payload.text === 'string') {
      options.onToken?.(payload);
    }
    return;
  }

  if (eventType === 'final') {
    const payload = frame.data as DiveDeeperFinalEvent | undefined;
    if (payload && typeof payload.answer === 'string') {
      setFinalEvent(payload);
      options.onFinal?.(payload);
    }
    return;
  }

  if (eventType === 'error') {
    const payload = frame.data as DiveDeeperErrorEvent | undefined;
    if (payload && typeof payload.message === 'string') {
      options.onError?.(payload);
      throw new Error(payload.message);
    }

    throw new Error('Dive deeper stream returned an unknown error event.');
  }
};

const parseSearchResultsPayload = (data: unknown): SearchStreamResultsEvent => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Search stream returned invalid results payload.');
  }

  const payload = data as { insights?: unknown };
  if (!Array.isArray(payload.insights)) {
    throw new Error('Search stream results payload is missing insights.');
  }

  return {
    insights: castInsights(payload.insights),
  };
};

const parseSearchSourceResultPayload = (data: unknown): SearchStreamSourceResultEvent => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Search stream returned invalid source result payload.');
  }

  const payload = data as {
    source?: unknown;
    insights?: unknown;
    metadata?: unknown;
  };
  if ((payload.source !== 'local' && payload.source !== 'gwi') || !Array.isArray(payload.insights)) {
    throw new Error('Search stream source result payload is missing source or insights.');
  }

  const metadata = Array.isArray(payload.metadata)
    ? payload.metadata.filter(
        (entry): entry is SearchStreamSourceMetadataEntry =>
          Boolean(entry) &&
          typeof entry === 'object' &&
          !Array.isArray(entry) &&
          typeof (entry as { key?: unknown }).key === 'string' &&
          Array.isArray((entry as { values?: unknown }).values),
      )
    : [];

  return {
    source: payload.source,
    insights: castInsights(payload.insights),
    metadata,
  };
};

const parseSearchDonePayload = (data: unknown): SearchStreamDoneEvent => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Search stream returned invalid done payload.');
  }

  const payload = data as { requestedSource?: unknown };
  const requestedSource = payload.requestedSource;
  if (requestedSource !== 'local' && requestedSource !== 'gwi' && requestedSource !== 'all') {
    throw new Error('Search stream done payload is missing requestedSource.');
  }

  return { requestedSource };
};

const parseSearchFinalPayload = (data: unknown): SearchInsightsResponse => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Search stream returned invalid final payload.');
  }

  const payload = data as { summary?: unknown; insights?: unknown };
  if (typeof payload.summary !== 'string' || !Array.isArray(payload.insights)) {
    throw new Error('Search stream final payload is missing summary or insights.');
  }

  return {
    summary: payload.summary,
    insights: castInsights(payload.insights),
  };
};

const combineSourceResults = (results: SearchStreamSourceResultEvent[]): Insight[] => {
  const deduped = new Map<string, Insight>();

  for (const result of results) {
    for (const insight of result.insights) {
      if (!deduped.has(insight.insight_id)) {
        deduped.set(insight.insight_id, insight);
      }
    }
  }

  return Array.from(deduped.values());
};

const drainSseFrames = (
  rawBuffer: string,
): { frames: ParsedSseFrame[]; remainder: string } => {
  const normalizedBuffer = rawBuffer.replace(/\r\n/g, '\n');
  const frames: ParsedSseFrame[] = [];
  let cursor = 0;

  while (cursor < normalizedBuffer.length) {
    const boundary = normalizedBuffer.indexOf('\n\n', cursor);
    if (boundary === -1) break;

    const rawFrame = normalizedBuffer.slice(cursor, boundary);
    cursor = boundary + 2;

    const parsed = parseSseFrame(rawFrame);
    if (parsed) {
      frames.push(parsed);
    }
  }

  return {
    frames,
    remainder: normalizedBuffer.slice(cursor),
  };
};

const parseSseFrame = (rawFrame: string): ParsedSseFrame | null => {
  if (!rawFrame.trim()) {
    return null;
  }

  let event: string | undefined;
  const dataLines: string[] = [];

  for (const line of rawFrame.split('\n')) {
    if (line.startsWith('event:')) {
      event = line.slice('event:'.length).trim();
      continue;
    }

    if (line.startsWith('data:')) {
      dataLines.push(line.slice('data:'.length).trim());
    }
  }

  let data: unknown = undefined;
  if (dataLines.length > 0) {
    const rawData = dataLines.join('\n');
    try {
      data = JSON.parse(rawData) as unknown;
    } catch {
      data = { raw: rawData };
    }
  }

  return { event, data };
};

const dedupeStringValues = (values: string[]): string[] => Array.from(new Set(values));

async function buildAuthHeaders(
  baseHeaders: Record<string, string>,
): Promise<Record<string, string>> {
  const headers: Record<string, string> = { ...baseHeaders };

  const jwt = await getCognitoJwtToken();
  if (jwt) {
    headers.Authorization = `Bearer ${jwt}`;
  }

  return headers;
}

async function getCognitoJwtToken(): Promise<string | undefined> {
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();
    if (idToken) {
      return idToken;
    }
    const accessToken = session.tokens?.accessToken?.toString();
    return accessToken || undefined;
  } catch (error) {
    logInsightsError("getCognitoJwtToken", "Failed to read Cognito auth session", {
      message: error instanceof Error ? error.message : "Unknown auth session error",
    });
    return undefined;
  }
}
