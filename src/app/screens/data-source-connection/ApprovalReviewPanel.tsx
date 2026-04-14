import { useEffect, useMemo, useState } from 'react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileCheck,
  FileText,
  PenLine,
  Plus,
  Trash2,
  X,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import type { Insight, InsightFamilyData, MetadataEntry } from './types';
import { acceptInsights, fetchProjectInsights } from '../../api/insights';

type ReviewStatus = 'pending' | 'approved' | 'declined';
const LOW_CONFIDENCE_THRESHOLD = 0.7;

function getConfidenceScore(insight: Insight): number | null {
  const rawScore = insight.confidence?.score;
  if (typeof rawScore !== 'number' || Number.isNaN(rawScore)) return null;
  return Math.min(1, Math.max(0, rawScore));
}

function normalizeTextValue(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeTextValue(item))
      .filter(Boolean)
      .join(', ');
  }
  return '';
}

function aggregateInsightsMetadataByTag(insights: Insight[]): Map<string, { tag: string; values: string[] }> {
  const aggregated = new Map<string, { tag: string; values: Set<string> }>();

  for (const insightItem of insights) {
    const metadata = Array.isArray(insightItem.metadata) ? insightItem.metadata : [];
    for (const entry of metadata) {
      const normalizedTag = normalizeTextValue(entry.tag);
      const normalizedValue = normalizeTextValue(entry.value);
      if (!normalizedTag || !normalizedValue) continue;

      const key = normalizedTag.toLowerCase();
      const current = aggregated.get(key);
      if (!current) {
        aggregated.set(key, { tag: normalizedTag, values: new Set([normalizedValue]) });
        continue;
      }
      current.values.add(normalizedValue);
    }
  }

  return new Map(
    Array.from(aggregated.entries()).map(([normalizedTag, data]) => [
      normalizedTag,
      {
        tag: data.tag,
        values: Array.from(data.values).sort((a, b) => a.localeCompare(b))
      }
    ])
  );
}

function metadataEntriesEqual(left: MetadataEntry[], right: MetadataEntry[]): boolean {
  if (left.length !== right.length) return false;
  for (let index = 0; index < left.length; index += 1) {
    const leftEntry = left[index];
    const rightEntry = right[index];
    if (
      normalizeTextValue(leftEntry?.tag) !== normalizeTextValue(rightEntry?.tag) ||
      normalizeTextValue(leftEntry?.value) !== normalizeTextValue(rightEntry?.value) ||
      (leftEntry?.confidence ?? 1) !== (rightEntry?.confidence ?? 1)
    ) {
      return false;
    }
  }
  return true;
}

function removeMetadataTagFromInsight(item: Insight, normalizedTagKey: string): Insight {
  return {
    ...item,
    metadata: (item.metadata ?? []).filter(
      (entry) => normalizeTextValue(entry.tag).toLowerCase() !== normalizedTagKey
    )
  };
}

function syncProjectMetadataWithInsights(
  currentMetadata: MetadataEntry[],
  insights: Insight[]
): MetadataEntry[] {
  const aggregated = aggregateInsightsMetadataByTag(insights);
  const nextMetadata: MetadataEntry[] = [];
  const seenTags = new Set<string>();

  for (const entry of currentMetadata) {
    const normalizedTag = normalizeTextValue(entry.tag);
    if (!normalizedTag) continue;
    const normalizedTagKey = normalizedTag.toLowerCase();

    if (normalizedTagKey === 'team') {
      if (!seenTags.has(normalizedTagKey)) {
        nextMetadata.push({ ...entry, tag: normalizedTag });
        seenTags.add(normalizedTagKey);
      }
      continue;
    }

    const aggregatedEntry = aggregated.get(normalizedTagKey);
    if (!aggregatedEntry) continue;

    const normalizedValue = normalizeTextValue(entry.value);
    const matchedValue = aggregatedEntry.values.find(
      (candidate) => candidate.toLowerCase() === normalizedValue.toLowerCase()
    );
    const resolvedValue = matchedValue ?? aggregatedEntry.values[0] ?? '';

    nextMetadata.push({
      ...entry,
      tag: aggregatedEntry.tag,
      value: resolvedValue
    });
    seenTags.add(normalizedTagKey);
  }

  for (const [normalizedTagKey, aggregatedEntry] of aggregated.entries()) {
    if (seenTags.has(normalizedTagKey)) continue;
    nextMetadata.push({
      tag: aggregatedEntry.tag,
      value: aggregatedEntry.values[0] ?? '',
      confidence: 1
    });
  }

  return nextMetadata;
}

function ProjectInsightReviewCard({
  projectInsight,
  isExpanded,
  isEditing,
  draft,
  reviewStatus,
  onToggleExpanded,
  onSetActiveDocFilter,
  onDecline,
  onApprove,
  onStartEditing,
  onEditDraftChange,
  onUpdateCustomField,
  onRemoveCustomField,
  onAddCustomField,
  onCancelEditing,
  onSaveEditing,
  getMetadataValue,
  setMetadataValue,
  getCustomFields,
  getFootnote,
  setFootnoteValue,
  getInsightFamilyDataForInsight,
  formatDisplayDate
}: {
  projectInsight: Insight;
  isExpanded: boolean;
  isEditing: boolean;
  draft: Insight;
  reviewStatus: ReviewStatus;
  onToggleExpanded: (id: string) => void;
  onSetActiveDocFilter: (documentId: string | null) => void;
  onDecline: (insightId: string) => void;
  onApprove: (insightId: string) => void;
  onStartEditing: (insight: Insight) => void;
  onEditDraftChange: (nextDraft: Insight) => void;
  onUpdateCustomField: (index: number, field: 'label' | 'value', val: string) => void;
  onRemoveCustomField: (index: number) => void;
  onAddCustomField: () => void;
  onCancelEditing: () => void;
  onSaveEditing: () => void;
  getMetadataValue: (item: Insight, tag: string, fallback?: string) => string;
  setMetadataValue: (item: Insight, tag: string, value: string) => Insight;
  getCustomFields: (item: Insight) => { label: string; value: string }[];
  getFootnote: (item: Insight) => string;
  setFootnoteValue: (item: Insight, value: string) => Insight;
  getInsightFamilyDataForInsight: (item: Insight) => InsightFamilyData | null;
  formatDisplayDate: (value: string) => string;
}) {
  const isDeclined = reviewStatus === 'declined';
  const isApproved = reviewStatus === 'approved';
  const team = getMetadataValue(projectInsight, 'team', 'Strategy');
  const sourceType = getMetadataValue(projectInsight, 'source_type', 'document');
  const sharingLevel = getMetadataValue(projectInsight, 'sharing_level', 'internal');
  const analysisStart = getMetadataValue(projectInsight, 'analysis_start', '');
  const analysisEnd = getMetadataValue(projectInsight, 'analysis_end', '');
  const expiration = getMetadataValue(projectInsight, 'expiration', '');
  const customFields = getCustomFields(projectInsight);
  const draftCustomFields = getCustomFields(draft);
  const confidenceScore = getConfidenceScore(projectInsight);
  const insightFamilyData = getInsightFamilyDataForInsight(projectInsight);
  const confidencePercent = confidenceScore !== null ? Math.round(confidenceScore * 100) : null;
  const isLowConfidence =
    confidenceScore !== null && confidenceScore < LOW_CONFIDENCE_THRESHOLD;
  const confidenceReasoning = projectInsight.confidence?.reasoning?.trim();
  const filteredCollapsedMetadata = (projectInsight.metadata ?? []).filter((entry) => {
    const normalizedTag = entry.tag.toLowerCase();
    return (
      normalizedTag !== 'team' &&
      normalizedTag !== 'analysis_start' &&
      normalizedTag !== 'analysis_end' &&
      normalizedTag !== 'expiration'
    );
  });
  const collapsedMetadata = filteredCollapsedMetadata.slice(0, 4);
  const remainingCollapsedMetadataCount = Math.max(
    filteredCollapsedMetadata.length - collapsedMetadata.length,
    0
  );

  return (
    <Card
      className={`overflow-hidden ${
        isDeclined
          ? 'border-red-300 bg-red-50/40'
          : isLowConfidence
            ? 'border-red-200 bg-red-50/35'
            : isApproved
              ? 'border-green-200 bg-green-50/30'
              : ''
      }`}
    >
      <div className="p-5">
        <div className="flex items-start gap-3">
          <button
            onClick={() => onToggleExpanded(projectInsight.insight_id)}
            className="mt-0.5 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="secondary" className="text-[10px]">
                {team}
              </Badge>
              {confidencePercent !== null && (
                <Badge
                  variant="secondary"
                  className={
                    isLowConfidence
                      ? 'text-[10px] bg-red-100 text-red-700 border-red-200'
                      : 'text-[10px] bg-emerald-100 text-emerald-700 border-emerald-200'
                  }
                >
                  Confidence: {confidencePercent}%
                </Badge>
              )}
              <Badge
                variant="secondary"
                className={
                  isDeclined
                    ? 'text-[10px] bg-red-100 text-red-700 border-red-200'
                    : isApproved
                      ? 'text-[10px] bg-green-100 text-green-700 border-green-200'
                      : 'text-[10px]'
                }
              >
                {isDeclined ? 'Declined' : isApproved ? 'Approved' : 'Pending'}
              </Badge>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSetActiveDocFilter(projectInsight.document_id || null);
                }}
                className="text-[11px] text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 transition-colors"
              >
                <FileText className="w-3 h-3" />
                {projectInsight.document_id}
              </button>
            </div>
            <button onClick={() => onToggleExpanded(projectInsight.insight_id)} className="text-left w-full">
              <p className="text-sm text-gray-900">{projectInsight.text}</p>
            </button>
            {!isExpanded && collapsedMetadata.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {collapsedMetadata.map((entry, idx) => (
                  <Badge
                    key={`${projectInsight.insight_id}-${entry.tag}-${entry.value}-${idx}`}
                    variant="secondary"
                    className="text-[10px] font-normal"
                  >
                    {entry.tag}: {entry.value}
                  </Badge>
                ))}
                {remainingCollapsedMetadataCount > 0 && (
                  <Badge variant="secondary" className="text-[10px] font-normal">
                    +{remainingCollapsedMetadataCount} more
                  </Badge>
                )}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2 italic">{getFootnote(projectInsight)}</p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDecline(projectInsight.insight_id)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
              title="Decline"
            >
              <XCircle className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onToggleExpanded(projectInsight.insight_id);
                if (!isExpanded) onStartEditing(projectInsight);
              }}
              className="text-gray-500 hover:text-gray-700 h-8 w-8 p-0"
              title="Edit Metadata"
            >
              <PenLine className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              onClick={() => onApprove(projectInsight.insight_id)}
              className={`h-8 w-8 p-0 ${
                isDeclined ? 'bg-gray-300 hover:bg-gray-400 text-gray-700' : 'bg-green-600 hover:bg-green-700'
              }`}
              title="Approve"
            >
              <CheckCircle2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-5 pb-5 pt-0 border-t border-gray-100">
          <div className="mt-4 space-y-4">
            {isEditing && (
              <>
                <div>
                  <Label className="text-xs text-gray-500 mb-1.5 block">Insight Statement</Label>
                  <Textarea
                    value={draft.text}
                    onChange={(e) => onEditDraftChange({ ...draft, text: e.target.value })}
                    className="min-h-[80px]"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500 mb-1.5 block">Footnote / Citation</Label>
                  <Textarea
                    value={getFootnote(draft)}
                    onChange={(e) =>
                      onEditDraftChange(setFootnoteValue(draft, e.target.value))
                    }
                    className="min-h-[60px]"
                  />
                </div>
              </>
            )}

            {confidencePercent !== null && (
              <div className="rounded-md border border-gray-200 bg-white/70 p-3">
                <p className="text-xs text-gray-500 mb-1">Confidence</p>
                <p className={`text-sm font-medium ${isLowConfidence ? 'text-red-700' : 'text-gray-900'}`}>
                  {confidencePercent}%
                </p>
                {confidenceReasoning && (
                  <p className="text-xs text-gray-600 mt-1">{confidenceReasoning}</p>
                )}
              </div>
            )}

            {insightFamilyData && (
              <div className="rounded-md border border-blue-100 bg-blue-50/40 p-3">
                <p className="text-xs text-gray-500 mb-2">Insight Family Data</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge variant="secondary" className="text-[10px]">
                    Rows: {insightFamilyData.row_count ?? insightFamilyData.rows?.length ?? 0}
                  </Badge>
                  {(insightFamilyData.dimensions ?? []).length > 0 && (
                    <Badge variant="secondary" className="text-[10px]">
                      Dimensions: {insightFamilyData.dimensions.join(', ')}
                    </Badge>
                  )}
                  {(insightFamilyData.metric_columns ?? []).length > 0 && (
                    <Badge variant="secondary" className="text-[10px]">
                      Metrics: {insightFamilyData.metric_columns.join(', ')}
                    </Badge>
                  )}
                </div>
                {(insightFamilyData.rows ?? []).length > 0 && (
                  <div className="space-y-1.5">
                    {(insightFamilyData.rows ?? []).slice(0, 5).map((row) => (
                      <div key={row.row_id} className="text-xs text-gray-700 rounded bg-white border border-blue-100 px-2 py-1.5">
                        <span className="font-medium">
                          {row.filter_values?.map((entry) => `${entry.tag}: ${entry.value}`).join(' | ') || 'All segments'}
                        </span>
                        <span className="text-gray-500">{' -> '}</span>
                        <span>{row.metric_name ? `${row.metric_name}: ` : ''}{row.value_text}</span>
                      </div>
                    ))}
                    {(insightFamilyData.rows ?? []).length > 5 && (
                      <p className="text-[11px] text-gray-500">
                        Showing 5 of {(insightFamilyData.rows ?? []).length} rows
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            <div>
              <Label className="text-xs text-gray-500 mb-1.5 block">Source Type</Label>
              {isEditing ? (
                <Select
                  value={getMetadataValue(draft, 'source_type', 'document')}
                  onValueChange={(v) => onEditDraftChange(setMetadataValue(draft, 'source_type', v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="document">Document / Report</SelectItem>
                    <SelectItem value="dashboard">Dashboard / Analytics</SelectItem>
                    <SelectItem value="manual">Manual Observation</SelectItem>
                    <SelectItem value="api">API / Automated</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-gray-700">
                  {sourceType === 'document'
                    ? 'Document / Report'
                    : sourceType === 'dashboard'
                      ? 'Dashboard / Analytics'
                      : sourceType === 'manual'
                        ? 'Manual Observation'
                        : 'API / Automated'}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-xs text-gray-500 mb-1.5 block">Analysis Starts At</Label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={getMetadataValue(draft, 'analysis_start', '')}
                    onChange={(e) =>
                      onEditDraftChange(setMetadataValue(draft, 'analysis_start', e.target.value))
                    }
                  />
                ) : (
                  <p className="text-sm text-gray-700">{formatDisplayDate(analysisStart)}</p>
                )}
              </div>
              <div>
                <Label className="text-xs text-gray-500 mb-1.5 block">Analysis Ends At</Label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={getMetadataValue(draft, 'analysis_end', '')}
                    onChange={(e) =>
                      onEditDraftChange(setMetadataValue(draft, 'analysis_end', e.target.value))
                    }
                  />
                ) : (
                  <p className="text-sm text-gray-700">{formatDisplayDate(analysisEnd)}</p>
                )}
              </div>
              <div>
                <Label className="text-xs text-gray-500 mb-1.5 block">Expiration Date</Label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={getMetadataValue(draft, 'expiration', '')}
                    onChange={(e) => onEditDraftChange(setMetadataValue(draft, 'expiration', e.target.value))}
                  />
                ) : (
                  <p className="text-sm text-gray-700">{formatDisplayDate(expiration)}</p>
                )}
              </div>
            </div>

            <div>
              <Label className="text-xs text-gray-500 mb-1.5 block">Sharing Level</Label>
              {isEditing ? (
                <Select
                  value={getMetadataValue(draft, 'sharing_level', 'internal')}
                  onValueChange={(v) => onEditDraftChange(setMetadataValue(draft, 'sharing_level', v))}
                >
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal">Internal Only</SelectItem>
                    <SelectItem value="controlled">Controlled Distribution</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant="secondary" className="capitalize">
                  {sharingLevel === 'internal'
                    ? 'Internal Only'
                    : sharingLevel === 'controlled'
                      ? 'Controlled Distribution'
                      : 'Public'}
                </Badge>
              )}
            </div>

            <div className="pt-3 border-t border-gray-100">
              <Label className="text-xs text-gray-500 mb-2 block">Custom Metadata</Label>
              {isEditing ? (
                <div className="space-y-3">
                  {draftCustomFields.map((cf, index) => (
                    <div key={index} className="flex items-end gap-3">
                      <div className="flex-1">
                        <Label className="text-xs text-gray-500 mb-1">Field Name</Label>
                        <Input
                          placeholder="e.g., Product Line"
                          value={cf.label}
                          onChange={(e) => onUpdateCustomField(index, 'label', e.target.value)}
                        />
                      </div>
                      <div className="flex-1">
                        <Label className="text-xs text-gray-500 mb-1">Value</Label>
                        <Input
                          placeholder="e.g., Enterprise Suite"
                          value={cf.value}
                          onChange={(e) => onUpdateCustomField(index, 'value', e.target.value)}
                        />
                      </div>
                      <button
                        onClick={() => onRemoveCustomField(index)}
                        className="text-gray-400 hover:text-red-500 transition-colors pb-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={onAddCustomField} className="gap-1 mt-1">
                    <Plus className="w-4 h-4" />
                    Add Custom Field
                  </Button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {customFields.length > 0 ? (
                    customFields.map((cf, i) => (
                      <div key={i} className="px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-xs text-gray-500">{cf.label}:</span>{' '}
                        <span className="text-xs font-medium text-gray-800">{cf.value}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 italic">No custom metadata</p>
                  )}
                </div>
              )}
            </div>

            {isEditing && (
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
                <Button variant="outline" size="sm" onClick={onCancelEditing}>
                  Cancel
                </Button>
                <Button size="sm" onClick={onSaveEditing} className="bg-blue-600 hover:bg-blue-700">
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

export function ApprovalReviewPanel({
  insight,
  onBack,
  onApprove,
  onDecline
}: {
  insight: Insight;
  onBack: () => void;
  onApprove: () => void;
  onDecline: (insightId: string) => void;
}) {
  const [statement, setStatement] = useState(insight.text);
  const [projectMetadata, setProjectMetadata] = useState<MetadataEntry[]>(insight.metadata ?? []);
  const [projectInsights, setProjectInsights] = useState<Insight[]>([]);
  const [isApproving, setIsApproving] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Insight | null>(null);
  const [activeDocFilter, setActiveDocFilter] = useState<string | null>(null);
  const [expandedInsightIds, setExpandedInsightIds] = useState<Set<string>>(new Set());
  const aggregatedMetadataByTag = useMemo(
    () => aggregateInsightsMetadataByTag(projectInsights),
    [projectInsights]
  );

  const reviewStatusForInsight = (item: Insight): 'pending' | 'approved' | 'declined' => {
    const statusValue = item.status?.toLowerCase();
    if (statusValue === 'approved' || statusValue === 'accepted') return 'approved';
    if (statusValue === 'declined') return 'declined';
    return 'pending';
  };

  const setReviewStatusForInsight = (
    item: Insight,
    nextStatus: 'pending' | 'approved' | 'declined'
  ): Insight => ({
    ...item,
    status: nextStatus === 'approved' ? 'Approved' : nextStatus === 'declined' ? 'Declined' : 'Pending'
  });

  const getMetadataValue = (item: Insight, tag: string, fallback = ''): string =>
    item.metadata?.find((entry) => entry.tag.toLowerCase() === tag)?.value ?? fallback;

  const setMetadataValue = (item: Insight, tag: string, value: string): Insight => {
    const metadata = [...(item.metadata ?? [])];
    const index = metadata.findIndex((entry) => entry.tag.toLowerCase() === tag);
    if (index >= 0) {
      metadata[index] = { ...metadata[index], value };
    } else {
      metadata.push({ tag, value, confidence: 1 });
    }
    return { ...item, metadata };
  };

  const getInsightFamilyDataForInsight = (item: Insight): InsightFamilyData | null => {
    const tableId = item.insight_family_data_id?.trim();
    if (!tableId) return null;

    const rootTables = insight.insightfamilydata;
    if (!Array.isArray(rootTables)) return null;
    const matched = rootTables.find(
      (table): table is InsightFamilyData =>
        Boolean(table) &&
        typeof table === 'object' &&
        !Array.isArray(table) &&
        typeof (table as InsightFamilyData).table_id === 'string' &&
        (table as InsightFamilyData).table_id === tableId
    );

    return matched ?? null;
  };

  const setFootnoteValue = (item: Insight, value: string): Insight => ({
    ...item,
    footnote: value
  });

  const getFootnote = (item: Insight): string => {
    const footnote = item.footnote;
    if (typeof footnote === 'string') return footnote;
    return item.supporting_chunks?.[0]?.chunk_id
      ? `Source chunk: ${item.supporting_chunks[0].chunk_id}`
      : 'No citation provided';
  };

  const customMetadataTags = new Set([
    'team',
    'source_type',
    'sharing_level',
    'analysis_start',
    'analysis_end',
    'expiration'
  ]);

  const getCustomFields = (item: Insight) =>
    (item.metadata ?? [])
      .filter((entry) => !customMetadataTags.has(entry.tag.toLowerCase()))
      .map((entry) => ({ label: entry.tag, value: entry.value }));

  const setCustomFieldValue = (
    item: Insight,
    index: number,
    field: 'label' | 'value',
    val: string
  ): Insight => {
    const customFields = getCustomFields(item);
    customFields[index] = { ...customFields[index], [field]: val };
    const baseMetadata = (item.metadata ?? []).filter((entry) => customMetadataTags.has(entry.tag.toLowerCase()));
    return {
      ...item,
      metadata: [
        ...baseMetadata,
        ...customFields.map((entry) => ({ tag: entry.label, value: entry.value, confidence: 1 }))
      ]
    };
  };

  const addCustomFieldToInsight = (item: Insight): Insight => {
    const customFields = [...getCustomFields(item), { label: '', value: '' }];
    const baseMetadata = (item.metadata ?? []).filter((entry) => customMetadataTags.has(entry.tag.toLowerCase()));
    return {
      ...item,
      metadata: [
        ...baseMetadata,
        ...customFields.map((entry) => ({ tag: entry.label, value: entry.value, confidence: 1 }))
      ]
    };
  };

  const removeCustomFieldFromInsight = (item: Insight, index: number): Insight => {
    const customFields = getCustomFields(item).filter((_, i) => i !== index);
    const baseMetadata = (item.metadata ?? []).filter((entry) => customMetadataTags.has(entry.tag.toLowerCase()));
    return {
      ...item,
      metadata: [
        ...baseMetadata,
        ...customFields.map((entry) => ({ tag: entry.label, value: entry.value, confidence: 1 }))
      ]
    };
  };

  const cloneInsight = (item: Insight): Insight => ({
    ...item,
    metadata: item.metadata?.map((entry) => ({ ...entry })),
    supporting_chunks: item.supporting_chunks?.map((chunk) => ({ ...chunk })),
    insightfamilydata: item.insightfamilydata ? [...item.insightfamilydata] : undefined,
    preloaded_project_insights: item.preloaded_project_insights
      ? [...item.preloaded_project_insights]
      : undefined
  });

  const team = projectMetadata.find((entry) => entry.tag.toLowerCase() === 'team')?.value ?? '';
  const nonTeamMetadata = projectMetadata
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => entry.tag.toLowerCase() !== 'team');
  const queueId = insight.document_id || insight.insight_id;
  const status = insight.status ?? 'pending';

  useEffect(() => {
    setStatement(insight.text);
    setProjectMetadata(insight.metadata ?? []);
  }, [insight.insight_id, insight.metadata, insight.text]);

  useEffect(() => {
    let mounted = true;

    async function loadProjectInsights() {
      if (!insight.user_id || !insight.insight_id) {
        if (mounted) setProjectInsights([]);
        return;
      }

      const preloadedInsightsRaw = insight.preloaded_project_insights;
      if (Array.isArray(preloadedInsightsRaw) && preloadedInsightsRaw.length > 0) {
        if (mounted) {
          setProjectInsights(
            preloadedInsightsRaw.filter(
              (candidate): candidate is Insight =>
                Boolean(candidate) &&
                typeof candidate === 'object' &&
                !Array.isArray(candidate) &&
                typeof (candidate as Insight).insight_id === 'string'
            )
          );
        }
        return;
      }

      try {
        const data = await fetchProjectInsights(insight.user_id, insight.insight_id);
        if (mounted) {
          setProjectInsights(data);
        }
      } catch (error) {
        console.error('Failed to fetch project insights', error);
        if (mounted) setProjectInsights([]);
      }
    }

    void loadProjectInsights();
    return () => {
      mounted = false;
    };
  }, [insight.insight_id, insight.user_id]);

  const toggleInsightExpanded = (id: string) => {
    setExpandedInsightIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredInsights = activeDocFilter
    ? projectInsights.filter((insightItem) => insightItem.document_id === activeDocFilter)
    : projectInsights;

  const activeDocName = activeDocFilter ?? null;

  const formatDisplayDate = (value: string) =>
    value ? new Date(value).toLocaleDateString() : '-';

  const startEditing = (pendingInsight: Insight) => {
    setEditingId(pendingInsight.insight_id);
    setEditDraft(cloneInsight(pendingInsight));
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditDraft(null);
  };

  const saveEditing = () => {
    if (!editDraft) return;
    const nextProjectInsights = projectInsights.map((insightItem) =>
      insightItem.insight_id === editDraft.insight_id ? editDraft : insightItem
    );
    setProjectInsights(nextProjectInsights);
    setProjectMetadata((prev) => syncProjectMetadataWithInsights(prev, nextProjectInsights));
    toast.success('Changes saved');
    setEditingId(null);
    setEditDraft(null);
  };

  const updateReviewStatus = (insightId: string, nextStatus: 'pending' | 'approved' | 'declined') => {
    setProjectInsights((prev) =>
      prev.map((insightItem) => 
        insightItem.insight_id === insightId
          ? setReviewStatusForInsight(insightItem, nextStatus)
          : insightItem
      )
    );
  };

  const addCustomField = () => {
    if (!editDraft) return;
    setEditDraft(addCustomFieldToInsight(editDraft));
  };

  const removeCustomField = (index: number) => {
    if (!editDraft) return;
    setEditDraft(removeCustomFieldFromInsight(editDraft, index));
  };

  const updateCustomField = (index: number, field: 'label' | 'value', val: string) => {
    if (!editDraft) return;
    setEditDraft(setCustomFieldValue(editDraft, index, field, val));
  };

  const stripTransientProjectContext = (item: Insight): Insight => {
    const { preloaded_project_insights, insightfamilydata, ...persistable } = item;
    void preloaded_project_insights;
    void insightfamilydata;
    return persistable;
  };

  const submitReviewDecision = async (decision: 'Approved' | 'Declined') => {
    if (!statement.trim()) {
      toast.error('Insight statement is required');
      return;
    }

    const loadedCurrentInsight = projectInsights.find((item) => item.insight_id === insight.insight_id);
    const currentInsight: Insight = {
      ...(loadedCurrentInsight ?? insight),
      ...insight,
      text: statement,
      metadata: projectMetadata,
      status: decision,
    };

    const combinedInsights = [...projectInsights, currentInsight];
    const uniqueInsights = Array.from(
      new Map(combinedInsights.map((item) => [item.insight_id, stripTransientProjectContext(item)])).values()
    );

    try {
      if (decision === 'Approved') {
        setIsApproving(true);
      } else {
        setIsDeclining(true);
      }
      await acceptInsights(insight.insight_id, uniqueInsights);
      if (decision === 'Approved') {
        toast.success('Insight approved');
        onApprove();
      } else {
        toast.info('Insight declined');
        onDecline(insight.insight_id);
      }
    } catch (error) {
      console.error(`Failed to ${decision.toLowerCase()} insight`, error);
      toast.error(`Failed to ${decision.toLowerCase()} insight`);
    } finally {
      if (decision === 'Approved') {
        setIsApproving(false);
      } else {
        setIsDeclining(false);
      }
    }
  };

  const handleApprove = async () => {
    await submitReviewDecision('Approved');
  };

  const handleDecline = async () => {
    await submitReviewDecision('Declined');
  };

  const updateProjectMetadata = (index: number, field: 'tag' | 'value', value: string) => {
    setProjectMetadata((prev) =>
      prev.map((entry, i) => (i === index ? { ...entry, [field]: value } : entry))
    );
  };

  const addProjectMetadata = () => {
    setProjectMetadata((prev) => [...prev, { tag: '', value: '', confidence: 1 }]);
  };

  const removeProjectMetadata = (index: number) => {
    const removedEntry = projectMetadata[index];
    if (!removedEntry) return;

    const normalizedTagKey = normalizeTextValue(removedEntry.tag).toLowerCase();
    setProjectMetadata((prev) => prev.filter((_, i) => i !== index));

    if (!normalizedTagKey || normalizedTagKey === 'team') return;

    setProjectInsights((prev) =>
      prev.map((insightItem) => removeMetadataTagFromInsight(insightItem, normalizedTagKey))
    );
    setEditDraft((prev) =>
      prev ? removeMetadataTagFromInsight(prev, normalizedTagKey) : prev
    );
  };

  const setProjectTeam = (value: string) => {
    setProjectMetadata((prev) => {
      const next = [...prev];
      const teamIndex = next.findIndex((entry) => entry.tag.toLowerCase() === 'team');

      if (!value.trim()) {
        if (teamIndex >= 0) next.splice(teamIndex, 1);
        return next;
      }

      if (teamIndex >= 0) {
        next[teamIndex] = { ...next[teamIndex], value };
        return next;
      }

      next.push({ tag: 'team', value, confidence: 1 });
      return next;
    });
  };

  useEffect(() => {
    if (projectInsights.length === 0) return;
    setProjectMetadata((prev) => {
      const next = syncProjectMetadataWithInsights(prev, projectInsights);
      return metadataEntriesEqual(prev, next) ? prev : next;
    });
  }, [projectInsights]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronDown className="w-4 h-4 rotate-90" />
          Back to Queue
        </button>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 font-mono">
            {queueId}
          </Badge>
          <Badge
            variant="secondary"
            className={
              status === 'in_review'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }
          >
            {status === 'in_review' ? 'In Review' : 'Pending Review'}
          </Badge>
        </div>
      </div>

      <Card className="p-4 bg-white border-gray-200">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <FileCheck className="w-4 h-4 text-blue-700" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Uploaded by</p>
              <p className="text-sm font-medium text-gray-900">{insight.user_id ?? 'Unknown user'}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500">Document</p>
            <p className="text-sm font-medium text-gray-900">{insight.document_id}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Insight ID</p>
            <p className="text-sm font-medium text-gray-900">{insight.insight_id}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-900 mb-2">Insight Statement</p>
          <Textarea value={statement} onChange={(event) => setStatement(event.target.value)} rows={5} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 mb-2">Team</p>
          <Input
            value={team}
            placeholder="Enter team"
            onChange={(event) => setProjectTeam(event.target.value)}
          />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 mb-2">Metadata</p>
          <div className="space-y-3">
            {nonTeamMetadata.map(({ entry, index }) => (
              <div key={`${entry.tag}-${entry.value}-${index}`} className="flex items-end gap-3">
                <div className="flex-1">
                  <Label className="text-xs text-gray-500 mb-1">Field Name</Label>
                  <Input
                    value={entry.tag}
                    placeholder="e.g., source_type"
                    onChange={(e) => updateProjectMetadata(index, 'tag', e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-xs text-gray-500 mb-1">Value</Label>
                  {(() => {
                    const normalizedTag = entry.tag.trim().toLowerCase();
                    const options = normalizedTag
                      ? (aggregatedMetadataByTag.get(normalizedTag)?.values ?? [])
                      : [];
                    const valueOptions =
                      entry.value && !options.includes(entry.value)
                        ? [entry.value, ...options]
                        : options;
                    const selectValue = entry.value.trim() ? entry.value : '__EMPTY__';

                    if (valueOptions.length === 0) {
                      return (
                        <Input
                          value={entry.value}
                          placeholder="e.g., Strategy"
                          onChange={(e) => updateProjectMetadata(index, 'value', e.target.value)}
                        />
                      );
                    }

                    return (
                      <Select
                        value={selectValue}
                        onValueChange={(value) =>
                          updateProjectMetadata(index, 'value', value === '__EMPTY__' ? '' : value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select value" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__EMPTY__">Select value</SelectItem>
                          {valueOptions.map((optionValue) => (
                            <SelectItem key={`${entry.tag}-${optionValue}`} value={optionValue}>
                              {optionValue}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    );
                  })()}
                </div>
                <button
                  onClick={() => removeProjectMetadata(index)}
                  className="text-gray-400 hover:text-red-500 transition-colors pb-2"
                  title="Remove metadata field"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <div>
              <Button variant="outline" size="sm" onClick={addProjectMetadata} className="gap-1">
                <Plus className="w-4 h-4" />
                Add Metadata Field
              </Button>
            </div>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 mb-2">
            Project Insights ({projectInsights.length})
          </p>
          {projectInsights.length === 0 ? (
            <p className="text-sm text-gray-500">No child insights found for this insight.</p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-gray-900">Insights for Review</h3>
                  <Badge variant="secondary" className="text-xs">
                    {filteredInsights.length} of {projectInsights.length}
                  </Badge>
                </div>
                {activeDocFilter && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Filtered by:</span>
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 gap-1">
                      <FileText className="w-3 h-3" />
                      {activeDocName}
                      <button onClick={() => setActiveDocFilter(null)} className="ml-1 hover:text-blue-900">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  </div>
                )}
              </div>

              {filteredInsights.map((projectInsight) => {
                const isEditing = editingId === projectInsight.insight_id;
                const draft = isEditing && editDraft ? editDraft : projectInsight;
                const isExpanded = expandedInsightIds.has(projectInsight.insight_id);
                const reviewStatus = reviewStatusForInsight(projectInsight);

                return (
                  <ProjectInsightReviewCard
                    key={projectInsight.insight_id}
                    projectInsight={projectInsight}
                    isExpanded={isExpanded}
                    isEditing={isEditing}
                    draft={draft}
                    reviewStatus={reviewStatus}
                    onToggleExpanded={toggleInsightExpanded}
                    onSetActiveDocFilter={setActiveDocFilter}
                    onDecline={(insightId) => {
                      updateReviewStatus(insightId, 'declined');
                      toast.info('Insight declined');
                    }}
                    onApprove={(insightId) => {
                      updateReviewStatus(insightId, 'approved');
                      toast.success('Insight approved');
                    }}
                    onStartEditing={startEditing}
                    onEditDraftChange={(nextDraft) => setEditDraft(nextDraft)}
                    onUpdateCustomField={updateCustomField}
                    onRemoveCustomField={removeCustomField}
                    onAddCustomField={addCustomField}
                    onCancelEditing={cancelEditing}
                    onSaveEditing={saveEditing}
                    getMetadataValue={getMetadataValue}
                    setMetadataValue={setMetadataValue}
                    getCustomFields={getCustomFields}
                    getFootnote={getFootnote}
                    setFootnoteValue={setFootnoteValue}
                    getInsightFamilyDataForInsight={getInsightFamilyDataForInsight}
                    formatDisplayDate={formatDisplayDate}
                  />
                );
              })}

              {filteredInsights.length === 0 && (
                <p className="text-sm text-gray-500">No insights match the selected document filter.</p>
              )}
            </div>
          )}
        </div>
      </Card>

      <div className="flex justify-between gap-3">
        <Button variant="destructive" onClick={handleDecline} disabled={isDeclining || isApproving}>
          {isDeclining ? 'Declining...' : 'Decline'}
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} disabled={isDeclining || isApproving}>Back</Button>
          <Button onClick={handleApprove} disabled={isApproving || isDeclining}>
            {isApproving ? 'Approving...' : 'Approve'}
          </Button>
        </div>
      </div>
    </div>
  );
}
