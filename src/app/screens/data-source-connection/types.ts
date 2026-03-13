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
