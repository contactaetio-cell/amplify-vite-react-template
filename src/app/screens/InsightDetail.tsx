import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import { getCurrentUser } from 'aws-amplify/auth';
import {
  ArrowLeft,
  FileText,
  History,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Separator } from '../components/ui/separator';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Checkbox } from '../components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { type Insight as UiInsight, type MetadataField } from '../data/mockData';
import { ChildInsightsExplorer } from '../components/ChildInsightsExplorer';
import {
  fetchInsightTree,
  type SearchSource,
  updateInsightById,
  updateInsightFamilyDataById,
} from '../api/insights';
import { parseSearchSource } from '../search/sourceOptions';
import type {
  Insight as BackendInsight,
  InsightFamilyData,
  InsightFamilyDataRow,
  MetadataEntry,
} from './data-source-connection/types';

interface InsightDetailProps {
  insightId: string;
  onBack: () => void;
  onViewRelated: (id: string) => void;
  forceEditMode?: boolean;
}

function toTitleLabel(tag: string): string {
  return tag
    .split(/[_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

type MetadataKeyValue = {
  key: string;
  value: string;
};

type TableDimensionFilterOption = {
  dimension: string;
  values: string[];
};

type TableDimensionFilters = Record<string, string[]>;

function toObjectRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
}

function getInsightFootnote(insight: BackendInsight): string {
  const refs = toObjectRecord(insight.additional_refs ?? insight.additionalRefs);
  const footnote = refs.footnote;
  if (typeof footnote === 'string' && footnote.trim().length > 0) {
    return footnote.trim();
  }
  return `Document ID: ${insight.document_id}`;
}

function formatDateInputValue(value: string | undefined | null): string {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().slice(0, 10);
}

function getOneYearFromTodayDateInputValue(): string {
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  return nextYear.toISOString().slice(0, 10);
}

function toIsoStringFromDateInput(value: string): string {
  if (!value) return '';
  return new Date(`${value}T00:00:00.000Z`).toISOString();
}

function getMetadataValueByTag(metadata: MetadataEntry[] | undefined, tag: string): string {
  const normalizedTag = tag.trim().toLowerCase();
  const match = (metadata ?? []).find((entry) => entry.tag.trim().toLowerCase() === normalizedTag);
  return match?.value ?? '';
}

function upsertMetadataEntry(metadata: MetadataEntry[], tag: string, value: string): MetadataEntry[] {
  const normalizedTag = tag.trim().toLowerCase();
  const nextValue = value.trim();
  const next = [...metadata];
  const index = next.findIndex((entry) => entry.tag.trim().toLowerCase() === normalizedTag);

  if (!nextValue) {
    return index >= 0 ? next.filter((_, entryIndex) => entryIndex !== index) : next;
  }

  if (index >= 0) {
    next[index] = {
      ...next[index],
      tag,
      value: nextValue,
    };
    return next;
  }

  next.push({
    tag,
    value: nextValue,
    confidence: 1,
  });
  return next;
}

function cloneInsightFamilyData(data: InsightFamilyData): InsightFamilyData {
  return {
    ...data,
    document_ids: [...data.document_ids],
    source_types: [...data.source_types],
    dimensions: [...data.dimensions],
    metric_columns: [...data.metric_columns],
    source_modalities: [...data.source_modalities],
    rows: data.rows.map((row) => ({
      ...row,
      filter_values: row.filter_values.map((value) => ({ ...value })),
      supporting_refs: row.supporting_refs.map((ref) => ({ ...ref })),
    })),
  };
}

function getRowDimensionValue(row: InsightFamilyDataRow, dimension: string): string {
  const normalizedDimension = dimension.trim().toLowerCase();
  const match = row.filter_values.find((entry) => entry.tag.trim().toLowerCase() === normalizedDimension);
  return match?.value ?? '';
}

function getTableDimensionFilterOptions(data: InsightFamilyData | null): TableDimensionFilterOption[] {
  if (!data) return [];
  return data.dimensions.map((dimension) => {
    const values = Array.from(
      new Set(
        data.rows
          .map((row) => getRowDimensionValue(row, dimension).trim())
          .filter((value) => value.length > 0),
      ),
    ).sort((a, b) => a.localeCompare(b));
    return { dimension, values };
  });
}

function rowMatchesDimensionFilters(
  row: InsightFamilyDataRow,
  dimensions: string[],
  selectedFilters: TableDimensionFilters,
): boolean {
  return dimensions.every((dimension) => {
    const selectedValues = selectedFilters[dimension] ?? [];
    if (selectedValues.length === 0) {
      return true;
    }
    const rowDimensionValue = getRowDimensionValue(row, dimension).trim();
    return selectedValues.includes(rowDimensionValue);
  });
}

function formatMetadataValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter((item) => item.length > 0)
      .join(', ');
  }
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
}

function toMetadataKeyValuePairs(metadata: MetadataEntry[] | undefined): MetadataKeyValue[] {
  return (metadata ?? []).map((entry) => ({
    key: entry.tag,
    value: formatMetadataValue(entry.value),
  }));
}

function normalizeSourceType(rawType?: string): UiInsight['sourceType'] {
  if (rawType === 'dashboard' || rawType === 'document' || rawType === 'api' || rawType === 'manual') {
    return rawType;
  }
  return 'document';
}

function mapMetadata(metadataPairs: MetadataKeyValue[]): MetadataField[] {
  return metadataPairs.map((entry, index) => ({
    id: `meta-${index}-${entry.key}`,
    label: toTitleLabel(entry.key),
    value: entry.value,
    type: 'text',
  }));
}

function mapBackendInsightToUiInsight(
  insight: BackendInsight,
  options?: { childInsightIds?: string[] },
): UiInsight {
  const summary = insight.summary?.trim();
  const detailedAnalysis = summary && summary.length > 0 ? summary : insight.text;
  const metadataPairs = toMetadataKeyValuePairs(insight.metadata);
  const metadata = mapMetadata(metadataPairs);
  const metadataByKey = metadataPairs.reduce<Record<string, string>>((acc, entry) => {
    acc[entry.key.toLowerCase()] = entry.value;
    return acc;
  }, {});
  const date = insight.createdAt ?? insight.updatedAt ?? new Date().toISOString();
  const fallbackExpiration = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString();
  const metadataTagNames = metadataPairs.map((entry) => entry.key);
  const excludedDimensionKeys = new Set([
    'source_type',
    'expiration',
    'domain',
    'team',
    'status',
  ]);
  const dimensions = metadataPairs.reduce<Record<string, string>>((acc, entry) => {
    if (excludedDimensionKeys.has(entry.key.toLowerCase())) return acc;
    acc[toTitleLabel(entry.key)] = entry.value;
    return acc;
  }, {});

  return {
    id: insight.insight_id,
    statement: insight.text,
    dataPoints: (insight.supporting_chunks ?? []).map((chunk, idx) => ({
      id: `chunk-${idx}-${chunk.chunk_id}`,
      value: `Chunk ${chunk.chunk_id}`,
      source: 'Supporting chunk',
    })),
    footnote: getInsightFootnote(insight),
    sourceType: normalizeSourceType(metadataByKey.source_type),
    confidence: 1,
    tags: metadataTagNames,
    team: metadataByKey.team ?? insight.user_info?.full_name ?? null,
    domain: metadataByKey.domain ?? 'Unknown',
    author: insight.user_info?.full_name ?? insight.user_id ?? 'Unknown',
    date,
    expiration: metadataByKey.expiration ?? fallbackExpiration,
    status: insight?.status,
    metadata,
    fullContent: detailedAnalysis,
    parentInsightId: insight.parent_insight_id,
    isRootInsight: !insight.parent_insight_id,
    childInsightIds: options?.childInsightIds,
    dimensions: Object.keys(dimensions).length > 0 ? dimensions : undefined,
  };
}

type RelatedInsightItem = {
  relation: 'child' | 'parent' | 'sibling';
  insight: UiInsight;
};

function toDisplayLabel(value: string): string {
  return value
    .split(/[_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatMetricCell(
  row: InsightFamilyDataRow,
  metricColumn: string,
  allMetricColumns: string[],
): string {
  const normalizedMetricName = row.metric_name?.trim().toLowerCase();
  const normalizedColumn = metricColumn.trim().toLowerCase();
  const isSingleMetric = allMetricColumns.length === 1;
  const matchesMetric = normalizedMetricName === normalizedColumn;
  if (!isSingleMetric && !matchesMetric) return '—';

  if (row.metric_value !== undefined && row.metric_value !== null) {
    const metricValue = String(row.metric_value);
    return row.metric_unit ? `${metricValue} ${row.metric_unit}` : metricValue;
  }

  return row.value_text?.trim() || '—';
}

function canEditMetricCell(
  row: InsightFamilyDataRow,
  metricColumn: string,
  allMetricColumns: string[],
): boolean {
  const normalizedMetricName = row.metric_name?.trim().toLowerCase();
  const normalizedColumn = metricColumn.trim().toLowerCase();
  const isSingleMetric = allMetricColumns.length === 1;
  return isSingleMetric || normalizedMetricName === normalizedColumn;
}

function getEditableMetricValue(
  row: InsightFamilyDataRow,
  metricColumn: string,
  allMetricColumns: string[],
): string {
  if (!canEditMetricCell(row, metricColumn, allMetricColumns)) return '';
  if (row.metric_value !== undefined && row.metric_value !== null) {
    return String(row.metric_value);
  }
  return row.value_text?.trim() || '';
}

export function InsightDetail({ insightId, onBack, onViewRelated, forceEditMode = false }: InsightDetailProps) {
  const location = useLocation();
  const [rootInsight, setRootInsight] = useState<BackendInsight | null>(null);
  const [insight, setInsight] = useState<UiInsight | null>(null);
  const [insightData, setInsightData] = useState<InsightFamilyData | null>(null);
  const [childInsights, setChildInsights] = useState<UiInsight[]>([]);
  const [relatedInsights, setRelatedInsights] = useState<RelatedInsightItem[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isEditingPage, setIsEditingPage] = useState<boolean>(false);
  const [editStatement, setEditStatement] = useState<string>('');
  const [editDetailedAnalysis, setEditDetailedAnalysis] = useState<string>('');
  const [editAuthorName, setEditAuthorName] = useState<string>('');
  const [editStatus, setEditStatus] = useState<string>('');
  const [editCreationDate, setEditCreationDate] = useState<string>('');
  const [editExpiryDate, setEditExpiryDate] = useState<string>('');
  const [editFootnote, setEditFootnote] = useState<string>('');
  const [editMetadata, setEditMetadata] = useState<MetadataEntry[]>([]);
  const [editInsightData, setEditInsightData] = useState<InsightFamilyData | null>(null);
  const [tableDimensionFilters, setTableDimensionFilters] = useState<TableDimensionFilters>({});
  const [isSavingEdits, setIsSavingEdits] = useState<boolean>(false);
  const [showAllKeyMetadata, setShowAllKeyMetadata] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadCurrentUser = async () => {
      try {
        const user = await getCurrentUser();
        if (!cancelled) {
          setCurrentUserId(user.userId);
        }
      } catch {
        if (!cancelled) {
          setCurrentUserId(null);
        }
      }
    };

    void loadCurrentUser();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const source: SearchSource = parseSearchSource(new URLSearchParams(location.search).get('source'));

    const loadInsight = async () => {
      setIsLoading(true);
      setLoadError(null);
      setRootInsight(null);
      setInsight(null);
      setInsightData(null);
      setChildInsights([]);
      setRelatedInsights([]);
      setShowAllKeyMetadata(false);
      setIsEditingPage(false);
      setEditStatement('');
      setEditDetailedAnalysis('');
      setEditAuthorName('');
      setEditStatus('');
      setEditCreationDate('');
      setEditExpiryDate('');
      setEditFootnote('');
      setEditMetadata([]);
      setEditInsightData(null);
      setTableDimensionFilters({});

      try {
        const tree = await fetchInsightTree(insightId, { source });
        if (cancelled) return;

        if (!tree || tree.insight.length === 0) {
          setInsight(null);
          return;
        }

        const rootInsight = tree.insight[0];
        setRootInsight(rootInsight);
        setInsightData(tree.data ?? null);
        const mappedChildren = tree.children.map((child) => mapBackendInsightToUiInsight(child));
        setChildInsights(mappedChildren);

        setInsight(
          mapBackendInsightToUiInsight(rootInsight, {
            childInsightIds: mappedChildren.map((child) => child.id),
          }),
        );

        const relatedById = new Map<string, RelatedInsightItem>();
        const relationBuckets: Array<{ relation: RelatedInsightItem['relation']; items: BackendInsight[] }> = [
          { relation: 'parent', items: tree.parents },
          { relation: 'sibling', items: tree.siblings },
          { relation: 'child', items: tree.children },
        ];

        for (const bucket of relationBuckets) {
          for (const item of bucket.items) {
            if (item.insight_id === rootInsight.insight_id) continue;
            if (relatedById.has(item.insight_id)) continue;
            relatedById.set(item.insight_id, {
              relation: bucket.relation,
              insight:
                bucket.relation === 'child'
                  ? mappedChildren.find((child) => child.id === item.insight_id) ?? mapBackendInsightToUiInsight(item)
                  : mapBackendInsightToUiInsight(item),
            });
          }
        }

        setRelatedInsights(Array.from(relatedById.values()));
      } catch (error) {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : 'Failed to load insight';
        setLoadError(message);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadInsight();

    return () => {
      cancelled = true;
    };
  }, [insightId, location.search]);

  const canEditInsight = Boolean(rootInsight?.user_id && currentUserId && rootInsight.user_id === currentUserId);

  const handleStartEditing = () => {
    if (!rootInsight) return;
    setEditStatement(rootInsight.text ?? '');
    setEditDetailedAnalysis(rootInsight.summary ?? '');
    setEditAuthorName(rootInsight.user_info?.full_name ?? '');
    setEditStatus(rootInsight.status ?? '');
    setEditCreationDate(
      formatDateInputValue(rootInsight.createdAt) || formatDateInputValue(new Date().toISOString()),
    );
    setEditExpiryDate(
      getMetadataValueByTag(rootInsight.metadata, 'expiration') || getOneYearFromTodayDateInputValue(),
    );
    setEditFootnote(getInsightFootnote(rootInsight));
    setEditMetadata((rootInsight.metadata ?? []).map((entry) => ({ ...entry })));
    setEditInsightData(insightData ? cloneInsightFamilyData(insightData) : null);
    setIsEditingPage(true);
  };

  useEffect(() => {
    if (!forceEditMode || !rootInsight) return;
    setEditStatement(rootInsight.text ?? '');
    setEditDetailedAnalysis(rootInsight.summary ?? '');
    setEditAuthorName(rootInsight.user_info?.full_name ?? '');
    setEditStatus(rootInsight.status ?? '');
    setEditCreationDate(
      formatDateInputValue(rootInsight.createdAt) || formatDateInputValue(new Date().toISOString()),
    );
    setEditExpiryDate(
      getMetadataValueByTag(rootInsight.metadata, 'expiration') || getOneYearFromTodayDateInputValue(),
    );
    setEditFootnote(getInsightFootnote(rootInsight));
    setEditMetadata((rootInsight.metadata ?? []).map((entry) => ({ ...entry })));
    setEditInsightData(insightData ? cloneInsightFamilyData(insightData) : null);
    setIsEditingPage(true);
  }, [forceEditMode, rootInsight, insightData]);

  const handleAddMetadataField = () => {
    setEditMetadata((prev) => [...prev, { tag: '', value: '', confidence: 1 }]);
  };

  const handleUpdateMetadataField = (index: number, field: 'tag' | 'value', value: string) => {
    setEditMetadata((prev) =>
      prev.map((entry, entryIndex) =>
        entryIndex === index
          ? {
              ...entry,
              [field]: value,
            }
          : entry,
      ),
    );
  };

  const handleRemoveMetadataField = (index: number) => {
    setEditMetadata((prev) => prev.filter((_, entryIndex) => entryIndex !== index));
  };

  const handleTableDimensionChange = (rowId: string, dimension: string, value: string) => {
    setEditInsightData((prev) => {
      if (!prev) return prev;
      const normalizedDimension = dimension.trim().toLowerCase();
      return {
        ...prev,
        rows: prev.rows.map((row) => {
          if (row.row_id !== rowId) return row;
          const existingIndex = row.filter_values.findIndex(
            (entry) => entry.tag.trim().toLowerCase() === normalizedDimension,
          );
          const nextFilterValues = [...row.filter_values];
          if (existingIndex >= 0) {
            nextFilterValues[existingIndex] = {
              ...nextFilterValues[existingIndex],
              tag: dimension,
              value,
            };
          } else {
            nextFilterValues.push({ tag: dimension, value });
          }
          return {
            ...row,
            filter_values: nextFilterValues,
          };
        }),
      };
    });
  };

  const handleTableMetricChange = (rowId: string, metricColumn: string, value: string) => {
    setEditInsightData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        rows: prev.rows.map((row) => {
          if (row.row_id !== rowId) return row;
          if (!canEditMetricCell(row, metricColumn, prev.metric_columns)) return row;

          const nextRow: InsightFamilyDataRow = {
            ...row,
            value_text: value,
          };

          if (row.metric_value !== undefined && row.metric_value !== null) {
            nextRow.metric_value = value;
          }

          if (prev.metric_columns.length === 1 && !nextRow.metric_name) {
            nextRow.metric_name = metricColumn;
          }

          return nextRow;
        }),
      };
    });
  };

  const handleTableFilterChange = (dimension: string, value: string, checked: boolean) => {
    setTableDimensionFilters((prev) => {
      const currentValues = prev[dimension] ?? [];
      const nextValues = checked
        ? currentValues.includes(value)
          ? currentValues
          : [...currentValues, value]
        : currentValues.filter((currentValue) => currentValue !== value);

      const nextFilters = { ...prev };
      if (nextValues.length === 0) {
        delete nextFilters[dimension];
      } else {
        nextFilters[dimension] = nextValues;
      }
      return nextFilters;
    });
  };

  const handleClearTableFilterDimension = (dimension: string) => {
    setTableDimensionFilters((prev) => {
      const nextFilters = { ...prev };
      delete nextFilters[dimension];
      return nextFilters;
    });
  };

  const handleSaveInsightEdits = async () => {
    if (!rootInsight) return;

    const nextStatement = editStatement.trim();
    if (!nextStatement) {
      toast.error('Insight statement is required');
      return;
    }

    try {
      setIsSavingEdits(true);
      let normalizedMetadata = editMetadata
        .map((entry) => ({
          tag: entry.tag.trim(),
          value: entry.value.trim(),
          confidence: entry.confidence ?? 1,
        }))
        .filter((entry) => entry.tag.length > 0 && entry.value.length > 0);
      normalizedMetadata = upsertMetadataEntry(normalizedMetadata, 'expiration', editExpiryDate);
      const additionalRefs = toObjectRecord(rootInsight.additional_refs ?? rootInsight.additionalRefs);
      const creationDateForSave = editCreationDate || formatDateInputValue(new Date().toISOString());
      const updatedRootInsight = await updateInsightById(rootInsight.insight_id, {
        createdAt: toIsoStringFromDateInput(creationDateForSave) || rootInsight.createdAt,
        text: nextStatement,
        summary: editDetailedAnalysis,
        status: editStatus.trim() || undefined,
        metadata: normalizedMetadata,
        additional_refs: {
          ...additionalRefs,
          footnote: editFootnote.trim(),
        },
        user_info: {
          ...(rootInsight.user_info ?? {}),
          full_name: editAuthorName.trim(),
        },
      });

      let updatedInsightData = insightData;
      if (editInsightData && editInsightData.table_id) {
        updatedInsightData = await updateInsightFamilyDataById(editInsightData.table_id, {
          dimensions: editInsightData.dimensions,
          metric_columns: editInsightData.metric_columns,
          rows: editInsightData.rows,
        });
      }

      setRootInsight(updatedRootInsight);
      if (updatedInsightData) {
        setInsightData(updatedInsightData);
      }
      const mappedInsight = mapBackendInsightToUiInsight(updatedRootInsight, {
        childInsightIds: childInsights.map((child) => child.id),
      });
      setInsight(mappedInsight);
      setRelatedInsights((prev) =>
        prev.map((item) =>
          item.insight.id === updatedRootInsight.insight_id
            ? {
                ...item,
                insight: mappedInsight,
              }
            : item,
        ),
      );
      setIsEditingPage(forceEditMode);
      toast.success('Insight updated');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update insight';
      toast.error(message);
    } finally {
      setIsSavingEdits(false);
    }
  };

  const editTableFilterOptions = useMemo(
    () => getTableDimensionFilterOptions(editInsightData),
    [editInsightData],
  );
  const readOnlyTableFilterOptions = useMemo(
    () => getTableDimensionFilterOptions(insightData),
    [insightData],
  );
  const filteredEditRows = useMemo(() => {
    if (!editInsightData) return [];
    return editInsightData.rows.filter((row) =>
      rowMatchesDimensionFilters(row, editInsightData.dimensions, tableDimensionFilters),
    );
  }, [editInsightData, tableDimensionFilters]);
  const filteredReadOnlyRows = useMemo(() => {
    if (!insightData) return [];
    return insightData.rows.filter((row) =>
      rowMatchesDimensionFilters(row, insightData.dimensions, tableDimensionFilters),
    );
  }, [insightData, tableDimensionFilters]);
  const insightMetadata = insight?.metadata ?? [];
  const requiredFields = insightMetadata.filter((m) => m.isRequired);
  const optionalFields = insightMetadata.filter((m) => !m.isRequired);
  const showInlineEditor = forceEditMode || isEditingPage;

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading insight...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <p className="text-gray-700">Failed to load insight</p>
          <p className="text-sm text-gray-500">{loadError}</p>
          <Button variant="outline" onClick={onBack}>Back to Search</Button>
        </div>
      </div>
    );
  }

  if (!insight) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Insight not found</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto p-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {showInlineEditor ? (
                <div>
                  <p className="text-sm text-gray-600">Editing Insight</p>
                  <h1 className="text-2xl font-semibold text-gray-900 whitespace-normal break-words">
                    {rootInsight?.insight_id}
                  </h1>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="secondary">
                      <FileText className="w-3 h-3 mr-1" />
                      {insight.sourceType}
                    </Badge>
                    <Badge variant="outline">{insight.team}</Badge>
                  </div>
                  <h1 className="text-2xl font-semibold text-gray-900 mb-2 whitespace-normal break-words">{insight.statement}</h1>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-3">
                    <span className="whitespace-normal break-words">{insight.author}</span>
                    <span>•</span>
                    <span className="whitespace-normal break-words">Published {new Date(insight.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                    <span>•</span>
                    <span className="whitespace-normal break-words">Expires {new Date(insight.expiration).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {insight.metadata.slice(0, 4).map((field) => (
                      <Badge key={field.id} variant="outline" className="max-w-full bg-blue-50 text-blue-700 border-blue-200 whitespace-normal break-all">
                        {field.label}: {field.value}
                      </Badge>
                    ))}
                    {insight.metadata.length > 4 && (
                      <Badge variant="outline" className="text-gray-600">
                        +{insight.metadata.length - 4} more fields
                      </Badge>
                    )}
                  </div>
                </>
              )}
            </div>
            {canEditInsight && !forceEditMode && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleStartEditing}
                aria-label="Edit insight"
                className="shrink-0 text-gray-600 hover:text-gray-900"
              >
                <Pencil className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <div className="max-w-5xl mx-auto p-8">
        {showInlineEditor && (
          <Card className="mb-8 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Edit Insight</h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (rootInsight) {
                      setEditStatement(rootInsight.text ?? '');
                      setEditDetailedAnalysis(rootInsight.summary ?? '');
                      setEditAuthorName(rootInsight.user_info?.full_name ?? '');
                      setEditStatus(rootInsight.status ?? '');
                      setEditCreationDate(
                        formatDateInputValue(rootInsight.createdAt) || formatDateInputValue(new Date().toISOString()),
                      );
                      setEditExpiryDate(
                        getMetadataValueByTag(rootInsight.metadata, 'expiration') || getOneYearFromTodayDateInputValue(),
                      );
                      setEditFootnote(getInsightFootnote(rootInsight));
                      setEditMetadata((rootInsight.metadata ?? []).map((entry) => ({ ...entry })));
                      setEditInsightData(insightData ? cloneInsightFamilyData(insightData) : null);
                      if (forceEditMode) {
                        return;
                      }
                    }
                    setIsEditingPage(false);
                  }}
                  disabled={isSavingEdits}
                >
                  {forceEditMode ? 'Reset Changes' : 'Cancel'}
                </Button>
                <Button
                  onClick={() => {
                    void handleSaveInsightEdits();
                  }}
                  disabled={isSavingEdits || !editStatement.trim()}
                >
                  {isSavingEdits ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="edit-insight-statement" className="text-sm font-medium text-gray-700">
                  Insight Statement
                </label>
                <Input
                  id="edit-insight-statement"
                  value={editStatement}
                  onChange={(event) => setEditStatement(event.target.value)}
                  placeholder="Enter an insight statement"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="edit-insight-author" className="text-sm font-medium text-gray-700">
                    Author
                  </label>
                  <Input
                    id="edit-insight-author"
                    value={editAuthorName}
                    onChange={(event) => setEditAuthorName(event.target.value)}
                    placeholder="Author full name"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-insight-status" className="text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <Input
                    id="edit-insight-status"
                    value={editStatus}
                    onChange={(event) => setEditStatus(event.target.value)}
                    placeholder="e.g. Accepted, Pending, Declined"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="edit-insight-creation-date" className="text-sm font-medium text-gray-700">
                    Creation Date (Auto-created)
                  </label>
                  <Input
                    id="edit-insight-creation-date"
                    type="date"
                    value={editCreationDate}
                    onChange={(event) => setEditCreationDate(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-insight-expiry-date" className="text-sm font-medium text-gray-700">
                    Expiry Date
                  </label>
                  <Input
                    id="edit-insight-expiry-date"
                    type="date"
                    value={editExpiryDate}
                    onChange={(event) => setEditExpiryDate(event.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-insight-analysis" className="text-sm font-medium text-gray-700">
                  Detailed Analysis
                </label>
                <Textarea
                  id="edit-insight-analysis"
                  value={editDetailedAnalysis}
                  onChange={(event) => setEditDetailedAnalysis(event.target.value)}
                  placeholder="Add supporting detail for this insight"
                  rows={10}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-insight-footnote" className="text-sm font-medium text-gray-700">
                  Source Citation
                </label>
                <Textarea
                  id="edit-insight-footnote"
                  value={editFootnote}
                  onChange={(event) => setEditFootnote(event.target.value)}
                  placeholder="Source citation details"
                  rows={3}
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-700">Metadata Fields</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddMetadataField}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add Field
                  </Button>
                </div>
                <div className="space-y-2">
                  {editMetadata.length === 0 ? (
                    <p className="text-sm text-gray-500">No metadata fields yet.</p>
                  ) : (
                    editMetadata.map((entry, index) => (
                      <div key={`edit-meta-${index}`} className="grid grid-cols-12 gap-2">
                        <Input
                          className="col-span-5"
                          value={entry.tag}
                          onChange={(event) => handleUpdateMetadataField(index, 'tag', event.target.value)}
                          placeholder="Field name"
                        />
                        <Input
                          className="col-span-6"
                          value={entry.value}
                          onChange={(event) => handleUpdateMetadataField(index, 'value', event.target.value)}
                          placeholder="Field value"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="col-span-1"
                          onClick={() => handleRemoveMetadataField(index)}
                          aria-label={`Remove metadata field ${entry.tag || index + 1}`}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">Insight Data Table</h4>
                {editInsightData && editInsightData.rows.length > 0 ? (
                  <div className="space-y-3">
                    {editTableFilterOptions.length > 0 && (
                      <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-600">
                            Insight Family Metadata Filters
                          </p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setTableDimensionFilters({})}
                            className="h-7 px-2 text-xs"
                          >
                            Clear Filters
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                          {editTableFilterOptions.map((option) => {
                            const selectedValues = tableDimensionFilters[option.dimension] ?? [];
                            return (
                              <div
                                key={`edit-filter-${option.dimension}`}
                                className="space-y-2 rounded-md border border-gray-200 bg-white p-3"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <label className="text-xs text-gray-600">{toDisplayLabel(option.dimension)}</label>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                    onClick={() => handleClearTableFilterDimension(option.dimension)}
                                    disabled={selectedValues.length === 0}
                                  >
                                    All
                                  </Button>
                                </div>
                                <p className="text-xs text-gray-500">
                                  {selectedValues.length === 0
                                    ? `All ${toDisplayLabel(option.dimension)} values`
                                    : `${selectedValues.length} selected`}
                                </p>
                                <div className="max-h-32 space-y-1 overflow-y-auto pr-1">
                                  {option.values.map((value) => (
                                    <label
                                      key={`edit-filter-${option.dimension}-${value}`}
                                      className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 hover:bg-gray-50"
                                    >
                                      <Checkbox
                                        checked={selectedValues.includes(value)}
                                        onCheckedChange={(checked) =>
                                          handleTableFilterChange(option.dimension, value, checked === true)
                                        }
                                      />
                                      <span className="text-xs text-gray-700">{value}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-gray-600">
                      Showing {filteredEditRows.length} of {editInsightData.rows.length} rows
                    </p>
                    <div className="overflow-x-auto rounded-md border border-gray-200">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {editInsightData.dimensions.map((dimension) => (
                              <TableHead key={`edit-dimension-${dimension}`}>{toDisplayLabel(dimension)}</TableHead>
                            ))}
                            {editInsightData.metric_columns.map((metricColumn) => (
                              <TableHead key={`edit-metric-${metricColumn}`}>{toDisplayLabel(metricColumn)}</TableHead>
                            ))}
                            <TableHead>Evidence</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredEditRows.map((row) => {
                            const filterByTag = new Map(
                              row.filter_values.map((filterValue) => [
                                filterValue.tag.trim().toLowerCase(),
                                filterValue.value,
                              ]),
                            );

                            return (
                              <TableRow key={`edit-row-${row.row_id}`}>
                                {editInsightData.dimensions.map((dimension) => (
                                  <TableCell key={`${row.row_id}-dimension-${dimension}`}>
                                    <Input
                                      value={filterByTag.get(dimension.trim().toLowerCase()) ?? ''}
                                      onChange={(event) =>
                                        handleTableDimensionChange(row.row_id, dimension, event.target.value)
                                      }
                                      placeholder={toDisplayLabel(dimension)}
                                    />
                                  </TableCell>
                                ))}
                                {editInsightData.metric_columns.map((metricColumn) => (
                                  <TableCell key={`${row.row_id}-metric-${metricColumn}`}>
                                    {canEditMetricCell(row, metricColumn, editInsightData.metric_columns) ? (
                                      <Input
                                        value={getEditableMetricValue(row, metricColumn, editInsightData.metric_columns)}
                                        onChange={(event) =>
                                          handleTableMetricChange(row.row_id, metricColumn, event.target.value)
                                        }
                                        placeholder={toDisplayLabel(metricColumn)}
                                      />
                                    ) : (
                                      <span className="text-sm text-gray-400">—</span>
                                    )}
                                  </TableCell>
                                ))}
                                <TableCell className="text-sm text-gray-600">
                                  {row.supporting_refs.length}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No insight data table is linked to this insight.</p>
                )}
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Insight ID (Read-only)</label>
                  <Input value={rootInsight?.insight_id ?? ''} disabled />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Document ID (Read-only)</label>
                  <Input value={rootInsight?.document_id ?? ''} disabled />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">User ID (Read-only)</label>
                  <Input value={rootInsight?.user_id ?? ''} disabled />
                </div>
              </div>
            </div>
          </Card>
        )}

        {!showInlineEditor && (
          <>
            <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 space-y-6">
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="source">Source Details</TabsTrigger>
                <TabsTrigger value="related">Related Insights</TabsTrigger>
                <TabsTrigger value="metadata">Full Metadata</TabsTrigger>
              </TabsList>
              
              <TabsContent value="content" className="mt-6">
                <Card className="p-6">
                  <h2 className="font-semibold text-gray-900 mb-4">Insight Statement</h2>
                  <p className="text-lg text-gray-900 leading-relaxed mb-6 whitespace-normal break-words">{insight.statement}</p>
                  
                  {insight.fullContent && (
                    <>
                      <Separator className="my-6" />
                      <h3 className="font-semibold text-gray-900 mb-4">Detailed Analysis</h3>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line break-words">
                        {insight.fullContent}
                      </p>
                      <Separator className="my-6" />
                    </>
                  )}
                  
                  {!insight.fullContent && <Separator className="my-6" />}
                  
                  <div className="bg-gray-50 border-l-4 border-gray-300 p-4 rounded">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Source Citation</h3>
                    <p className="text-sm text-gray-600 italic whitespace-normal break-words">{insight.footnote}</p>
                  </div>
                </Card>
              </TabsContent>
              
              <TabsContent value="source" className="mt-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-gray-900">Source Document</h2>
                    <Badge variant="outline" className="capitalize">{insight.sourceType}</Badge>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-8 border border-gray-200 mb-6">
                    <div className="text-center">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-600 mb-4">
                        Original source document
                      </p>
                      <Button variant="outline" size="sm">
                        View Full Source
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3 text-sm">
                      <span className="text-gray-600">Source Citation:</span>
                      <span className="text-gray-900 font-medium text-right flex-1 min-w-0 whitespace-normal break-words">{insight.footnote.split(',')[0]}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Published:</span>
                      <span className="text-gray-900">{new Date(insight.date).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Author:</span>
                      <span className="text-gray-900">{insight.author}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Team:</span>
                      <span className="text-gray-900">{insight.team}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Expiration:</span>
                      <span className="text-gray-900">{new Date(insight.expiration).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Card>
              </TabsContent>
              
              <TabsContent value="related" className="mt-6">
                <div className="space-y-4">
                  {relatedInsights.length > 0 ? (
                    relatedInsights.map(({ relation, insight: related }) => (
                      <Card key={related.id} className="p-6 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => onViewRelated(related.id)}
                      >
                        <h3 className="font-medium text-gray-900 mb-3 whitespace-normal break-words">{related.statement}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2 break-words">{related.fullContent ?? related.statement}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="capitalize">{relation}</Badge>
                          <Badge variant="outline">{related.team}</Badge>
                          {related.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </Card>
                    ))
                  ) : (
                    <Card className="p-8 text-center">
                      <p className="text-gray-600">No related insights found</p>
                    </Card>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="metadata" className="mt-6">
                <Card className="p-6">
                  <h2 className="font-semibold text-gray-900 mb-6">Complete Metadata</h2>
                  
                  <div className="space-y-6">
                    {/* Analysis Timeframe */}
                    {(insight.analysisTimeframeStart || insight.analysisTimeframeEnd) && (
                      <>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 mb-3">Analysis Timeframe</h3>
                          <div className="space-y-2 pl-4">
                            {insight.analysisTimeframeStart && (
                              <div className="flex items-center gap-3">
                                <label className="text-sm text-gray-600 w-20">Start Date:</label>
                                <p className="text-gray-900 font-medium">
                                  {new Date(insight.analysisTimeframeStart).toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  })}
                                </p>
                              </div>
                            )}
                            {insight.analysisTimeframeEnd && (
                              <div className="flex items-center gap-3">
                                <label className="text-sm text-gray-600 w-20">End Date:</label>
                                <p className="text-gray-900 font-medium">
                                  {new Date(insight.analysisTimeframeEnd).toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  })}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        <Separator />
                      </>
                    )}
                    
                    {/* Communications & Legal Approvals */}
                    {(insight.sharingLevel || insight.prApprovalStatus || insight.legalApprovalStatus) && (
                      <>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 mb-3">Communications & Legal Approvals</h3>
                          <div className="space-y-3 pl-4">
                            {insight.sharingLevel && (
                              <div>
                                <label className="text-sm text-gray-600">Sharing Level</label>
                                <div className="mt-1">
                                  <Badge 
                                    variant="outline" 
                                    className={
                                      insight.sharingLevel === 'internal' 
                                        ? 'bg-gray-100 text-gray-800 border-gray-300' 
                                        : insight.sharingLevel === 'controlled'
                                        ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                                        : 'bg-green-100 text-green-800 border-green-300'
                                    }
                                  >
                                    {insight.sharingLevel === 'internal' && 'Internal Comms Only'}
                                    {insight.sharingLevel === 'controlled' && 'Controlled Audience Comms'}
                                    {insight.sharingLevel === 'public' && 'Public Comms'}
                                  </Badge>
                                </div>
                              </div>
                            )}
                            {insight.prApprovalStatus && (
                              <div>
                                <label className="text-sm text-gray-600">PR Approval</label>
                                <div className="flex items-center gap-2 mt-1">
                                  {insight.prApprovalStatus === 'approved' && (
                                    <>
                                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                                      <span className="text-sm font-medium text-green-700">Approved</span>
                                    </>
                                  )}
                                  {insight.prApprovalStatus === 'rejected' && (
                                    <>
                                      <XCircle className="w-4 h-4 text-red-600" />
                                      <span className="text-sm font-medium text-red-700">Rejected</span>
                                    </>
                                  )}
                                  {insight.prApprovalStatus === 'pending' && (
                                    <>
                                      <Clock className="w-4 h-4 text-yellow-600" />
                                      <span className="text-sm font-medium text-yellow-700">Pending</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                            {insight.legalApprovalStatus && (
                              <div>
                                <label className="text-sm text-gray-600">Legal Approval</label>
                                <div className="flex items-center gap-2 mt-1">
                                  {insight.legalApprovalStatus === 'approved' && (
                                    <>
                                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                                      <span className="text-sm font-medium text-green-700">Approved</span>
                                    </>
                                  )}
                                  {insight.legalApprovalStatus === 'rejected' && (
                                    <>
                                      <XCircle className="w-4 h-4 text-red-600" />
                                      <span className="text-sm font-medium text-red-700">Rejected</span>
                                    </>
                                  )}
                                  {insight.legalApprovalStatus === 'pending' && (
                                    <>
                                      <Clock className="w-4 h-4 text-yellow-600" />
                                      <span className="text-sm font-medium text-yellow-700">Pending</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                            {insight.approvalDocumentationUrl && (
                              <div>
                                <label className="text-sm text-gray-600">Approval Documentation</label>
                                <div className="mt-1">
                                  <a 
                                    href={insight.approvalDocumentationUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
                                  >
                                    View Approval Documentation
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <Separator />
                      </>
                    )}
                    
                    {/* Required Fields */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        Required Fields
                      </h3>
                      <div className="space-y-3 pl-4">
                        <div>
                          <label className="text-sm text-gray-600">Team</label>
                          <p className="text-gray-900 font-medium mt-1">{insight.team}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Expiration Date</label>
                          <p className="text-gray-900 font-medium mt-1">
                            {new Date(insight.expiration).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                        {requiredFields.map((field) => (
                          <div key={field.id}>
                            <label className="text-sm text-gray-600">{field.label}</label>
                            <p className="text-gray-900 font-medium mt-1 whitespace-normal break-words">{field.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Optional/Custom Fields */}
                    {optionalFields.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-3">
                          Optional & Custom Fields
                        </h3>
                        <div className="space-y-3 pl-4">
                          {optionalFields.map((field) => (
                            <div key={field.id} className="flex items-start gap-2">
                              <div className="flex-1 min-w-0">
                                <label className="text-sm text-gray-600">{field.label}</label>
                                <p className="text-gray-900 font-medium mt-1 whitespace-normal break-words">{field.value}</p>
                              </div>
                              {field.isNew && (
                                <Badge variant="outline" className="shrink-0 bg-purple-50 text-purple-700 border-purple-300">
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  Custom
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <Separator />
                    
                    {/* System Fields */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3">System Fields</h3>
                      <div className="space-y-3 pl-4">
                        <div>
                          <label className="text-sm text-gray-600">Insight ID</label>
                          <p className="text-gray-900 font-mono text-sm mt-1 whitespace-normal break-all">{insight.id}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Source Type</label>
                          <p className="text-gray-900 font-medium mt-1 capitalize">{insight.sourceType}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Domain</label>
                          <p className="text-gray-900 font-medium mt-1">{insight.domain || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Tags</label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {insight.tags.map((tag) => (
                              <Badge key={tag} variant="secondary">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
            
            {/* Child Insights Explorer - only show for root insights */}
            {insight.childInsightIds && insight.childInsightIds.length > 0 && (
              <ChildInsightsExplorer 
                rootInsight={insight} 
                childInsights={childInsights}
                onViewInsight={onViewRelated}
              />
            )}
            
          </div>
          
          <div className="col-span-1 space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Key Metadata</h3>
              
              <div className="space-y-3">
                {(showAllKeyMetadata ? insight.metadata : insight.metadata.slice(0, 4)).map((field) => (
                  <div key={field.id}>
                    <label className="text-xs text-gray-600 uppercase tracking-wide">{field.label}</label>
                    <p className="text-sm text-gray-900 font-medium mt-1 whitespace-normal break-words">{field.value}</p>
                  </div>
                ))}
                {insight.metadata.length > 4 && !showAllKeyMetadata && (
                  <Button
                    variant="link"
                    className="h-auto p-0 text-blue-600 text-sm"
                    onClick={() => setShowAllKeyMetadata(true)}
                  >
                    View all {insight.metadata.length} fields →
                  </Button>
                )}
                {insight.metadata.length > 4 && showAllKeyMetadata && (
                  <Button
                    variant="link"
                    className="h-auto p-0 text-blue-600 text-sm"
                    onClick={() => setShowAllKeyMetadata(false)}
                  >
                    Show fewer fields
                  </Button>
                )}
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Version History</h3>
                </div>
                {insight.currentVersion && (
                  <Badge variant="secondary" className="text-xs">
                    v{insight.currentVersion}
                  </Badge>
                )}
              </div>
              
              <div className="space-y-2">
                {insight.versionHistory && insight.versionHistory.length > 0 ? (
                  <>
                    {insight.versionHistory.slice().reverse().map((version, idx) => (
                      <button
                        key={version.id}
                        className="w-full flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left group"
                        onClick={() => {
                          // In a real app, this would navigate to view the specific version
                          console.log('View version:', version.version);
                        }}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                          idx === 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          v{version.version}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className={`text-sm font-medium ${idx === 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                              {idx === 0 ? 'Current version' : `Version ${version.version}`}
                            </p>
                            {idx === 0 && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                                Active
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            By {version.modifiedBy} • {new Date(version.modifiedDate).toLocaleDateString()}
                          </p>
                          {version.changeDescription && (
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {version.changeDescription}
                            </p>
                          )}
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                            View
                          </Button>
                        </div>
                      </button>
                    ))}
                  </>
                ) : (
                  <div className="flex gap-3 p-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-medium flex-shrink-0">
                      v1
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">Current version</p>
                      <p className="text-xs text-gray-500">
                        Published {new Date(insight.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
            
            <Card className="p-6 bg-blue-50 border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Recommended Actions</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Share with {insight.team} team</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Review related insights</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Add to roadmap discussion</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>

            {insightData && insightData.rows.length > 0 && (
              <Card className="mt-8 p-6">
            <div className="mb-4">
              <h2 className="font-semibold text-gray-900">Insight Data Table</h2>
              <p className="text-sm text-gray-600 mt-1">
                {insightData.row_count} row{insightData.row_count === 1 ? '' : 's'} linked to this insight.
              </p>
            </div>

            <div className="space-y-3">
              {readOnlyTableFilterOptions.length > 0 && (
                <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-600">
                      Insight Family Metadata Filters
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setTableDimensionFilters({})}
                      className="h-7 px-2 text-xs"
                    >
                      Clear Filters
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    {readOnlyTableFilterOptions.map((option) => {
                      const selectedValues = tableDimensionFilters[option.dimension] ?? [];
                      return (
                        <div
                          key={`read-filter-${option.dimension}`}
                          className="space-y-2 rounded-md border border-gray-200 bg-white p-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <label className="text-xs text-gray-600">{toDisplayLabel(option.dimension)}</label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={() => handleClearTableFilterDimension(option.dimension)}
                              disabled={selectedValues.length === 0}
                            >
                              All
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500">
                            {selectedValues.length === 0
                              ? `All ${toDisplayLabel(option.dimension)} values`
                              : `${selectedValues.length} selected`}
                          </p>
                          <div className="max-h-32 space-y-1 overflow-y-auto pr-1">
                            {option.values.map((value) => (
                              <label
                                key={`read-filter-${option.dimension}-${value}`}
                                className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 hover:bg-gray-50"
                              >
                                <Checkbox
                                  checked={selectedValues.includes(value)}
                                  onCheckedChange={(checked) =>
                                    handleTableFilterChange(option.dimension, value, checked === true)
                                  }
                                />
                                <span className="text-xs text-gray-700">{value}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-600">
                Showing {filteredReadOnlyRows.length} of {insightData.rows.length} rows
              </p>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {insightData.dimensions.map((dimension) => (
                        <TableHead key={dimension}>{toDisplayLabel(dimension)}</TableHead>
                      ))}
                      {insightData.metric_columns.map((metricColumn) => (
                        <TableHead key={metricColumn}>{toDisplayLabel(metricColumn)}</TableHead>
                      ))}
                      <TableHead>Evidence</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReadOnlyRows.map((row) => {
                      const filterByTag = new Map(
                        row.filter_values.map((filterValue) => [
                          filterValue.tag.trim().toLowerCase(),
                          filterValue.value,
                        ]),
                      );

                      return (
                        <TableRow key={row.row_id}>
                          {insightData.dimensions.map((dimension) => (
                            <TableCell key={`${row.row_id}-${dimension}`}>
                              {filterByTag.get(dimension.trim().toLowerCase()) ?? '—'}
                            </TableCell>
                          ))}
                          {insightData.metric_columns.map((metricColumn) => (
                            <TableCell key={`${row.row_id}-${metricColumn}`}>
                              {formatMetricCell(row, metricColumn, insightData.metric_columns)}
                            </TableCell>
                          ))}
                          <TableCell>{row.supporting_refs.length}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
              </Card>
            )}
          </>
        )}

      </div>
    </div>
  );
}
