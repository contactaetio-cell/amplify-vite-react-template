export type UploadMode = 'document' | 'manual';

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  file?: File;
}

export interface QueueItem {
  id: string;
  queueId: string;
  uploadDate: string;
  uploadedBy: string;
  status: 'pending' | 'in_review';
  insightsCount: number;
  researchContext: string;
  contextDocuments: { name: string; type: string }[];
  outputDocuments: { id: string; name: string; type: string; insightIds: string[] }[];
  rawDataFiles: { name: string; type: string }[];
}

export interface SupportingChunk {
  chunk_id: string;
  paragraph_index?: number;
  line_index?: number;
}

export interface MetadataEntry {
  tag: string;
  value: string;
  confidence?: number; // 0–1
}

export interface InsightConfidence {
  score: number;
  reasoning: string;
}

export interface FindingRef {
  finding_id: string;
  text?: string;
  evidence_snipped?: string;
  evidence_type?: string;
  supporting_chunks?: SupportingChunk[];
  document_id?: string;
  s3_node?: string;
  metric?: string;
  value?: string;
  comparison?: string;
  segment?: string;
  timeframe?: string;
}

export interface InsightSubInsight {
  finding_id: string;
  text: string;
  metric_value?: string | number;
  metric_unit?: string;
  dimensions?: Array<{ tag: string; value: string }>;
  confidence?: number;
  source_modality?: 'text' | 'table';
  top_level_group_id?: string;
}

export interface Insight {
  insight_id: string;
  parent_insight_id?: string | null;
  project_id?: string;
  organization_id?: string;
  createdAt?: string;
  updatedAt?: string;

  text: string;
  family_text?: string;
  question_answered?: string;
  summary?: string;
  filters?: string[];
  has_grid?: boolean;
  insight_family_data_id?: string;
  row_count?: number;
  table_dimensions?: string[];
  metric_columns?: string[];
  document_ids?: string[];
  source_types?: string[];
  evidence_snippet?: string;

  supporting_chunks?: SupportingChunk[];
  findings?: FindingRef[];
  sub_insights?: InsightSubInsight[];

  metadata?: MetadataEntry[];
  confidence?: InsightConfidence;

  footnote?: string;
  insightfamilydata?: InsightFamilyData[];
  preloaded_project_insights?: Insight[];

  upload_mode?: UploadMode;
  context_urls?: string[];
  output_urls?: string[];
  raw_data_urls?: string[];
  insight_ids?: string[];

  user_id?: string;
  user_info?: {
    full_name?: string;
    email_address?: string;
  };
  status?: string;

  s3_node: string;
  document_id: string;
}

export interface InsightFamilyDataRow {
  row_id: string;
  family_id: string;
  filter_values: Array<{ tag: string; value: string }>;
  metric_name?: string;
  value_text: string;
  metric_value?: string | number;
  metric_unit?: string;
  supporting_refs: Array<{
    chunk_id?: string;
    table_id?: string;
    page?: number;
    section_title?: string;
    row_index?: number;
    cell_refs?: string[];
    source_excerpt?: string;
    source_file?: string;
    element_type?: string;
    sheet_name?: string;
    table_region?: string;
  }>;
}

export interface InsightFamilyData {
  table_id: string;
  family_id: string;
  project_id?: string;
  organization_id?: string;
  user_id?: string;
  status?: string;
  s3_node: string;
  document_id: string;
  document_ids: string[];
  source_types: string[];
  row_count: number;
  dimensions: string[];
  metric_columns: string[];
  table_markdown?: string;
  table_text_chunk?: string;
  source_modalities: Array<'text' | 'table' | 'image'>;
  rows: InsightFamilyDataRow[];
  created_at: string;
  updated_at: string;
}

export interface ProcessedUpload {
  id: string;
  queueId: string;
  uploadDate: string;
  uploadedBy: string;
  insightsGenerated: number;
  insightsApproved: number;
  insightsDeclined: number;
  status: 'complete';
}

export interface LinkedInsight {
  id: string;
  statement: string;
  team: string;
  status: 'approved' | 'declined';
  reviewedBy: string;
  reviewedDate: string;
}
