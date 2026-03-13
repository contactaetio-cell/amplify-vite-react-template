import { useState, useRef } from 'react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../components/ui/table';
import {
  Upload,
  FileText,
  X,
  CheckCircle2,
  Paperclip,
  ChevronDown,
  ChevronRight,
  Clock,
  FileCheck,
  History,
  CheckCheck,
  XCircle,
  Sparkles,
  Plus,
  Trash2,
  Info,
  PenLine,
  ExternalLink,
  BookOpen,
  FileSpreadsheet,
  File,
  Database,
  Link2,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';

interface DataSourceConnectionProps {
  onSelectSource: (sourceId: string) => void;
  onManualEntry?: () => void;
}

type Tab = 'upload' | 'approval' | 'history';
type UploadMode = 'document' | 'manual';

interface UploadedFile {
  name: string;
  size: number;
  type: string;
}

interface QueueItem {
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

interface ProcessedUpload {
  id: string;
  queueId: string;
  uploadDate: string;
  uploadedBy: string;
  insightsGenerated: number;
  insightsApproved: number;
  insightsDeclined: number;
  status: 'complete';
}

// Mock data for queues
const mockQueueItems: QueueItem[] = [
  {
    id: 'q1',
    queueId: 'QUEUE-2026-001',
    uploadDate: '2026-02-27',
    uploadedBy: 'Sarah Chen',
    status: 'pending',
    insightsCount: 12,
    researchContext: 'Q1 2026 pipeline performance analysis across all segments (SMB, Mid-Market, Enterprise). Objective: identify conversion rate drivers and SDR vs self-serve effectiveness. Methodology: cohort analysis of 342 accounts over a 90-day window, segmented by acquisition channel and deal size. Key questions: Where are the biggest drop-offs in the funnel? Is human-qualified pipeline still outperforming self-serve in mid-market?',
    contextDocuments: [
      { name: 'Q1_Research_Brief.pdf', type: 'application/pdf' },
      { name: 'Pipeline_Methodology_Notes.docx', type: 'application/msword' }
    ],
    outputDocuments: [
      { id: 'od1', name: 'Q1_2026_Pipeline_Analysis.pdf', type: 'application/pdf', insightIds: ['pi1', 'pi3', 'pi5', 'pi7'] },
      { id: 'od2', name: 'Email_Campaign_Performance_Report.pdf', type: 'application/pdf', insightIds: ['pi2', 'pi4', 'pi6'] },
      { id: 'od3', name: 'SDR_Outbound_Effectiveness_Deck.pptx', type: 'application/vnd.ms-powerpoint', insightIds: ['pi8', 'pi9', 'pi10'] },
      { id: 'od4', name: 'Channel_ROI_Comparison_Q1.xlsx', type: 'application/vnd.ms-excel', insightIds: ['pi11', 'pi12'] }
    ],
    rawDataFiles: [
      { name: 'pipeline_raw_data_q1.csv', type: 'text/csv' },
      { name: 'campaign_metrics_export.xlsx', type: 'application/vnd.ms-excel' }
    ]
  },
  {
    id: 'q2',
    queueId: 'QUEUE-2026-002',
    uploadDate: '2026-02-26',
    uploadedBy: 'Marcus Rodriguez',
    status: 'in_review',
    insightsCount: 8,
    researchContext: 'Content marketing effectiveness study for H2 2025 campaigns. Objective: measure which content formats and distribution channels drive the highest-quality MQLs and shortest time-to-SQL. Methodology: multi-touch attribution analysis across 96 campaigns, A/B testing on 48 email variants, and engagement scoring by content type.',
    contextDocuments: [
      { name: 'Content_Marketing_Study_Brief.pdf', type: 'application/pdf' }
    ],
    outputDocuments: [
      { id: 'od5', name: 'Content_Format_Effectiveness_Report.pdf', type: 'application/pdf', insightIds: ['pi13', 'pi14', 'pi15'] },
      { id: 'od6', name: 'ABM_Campaign_Results_H2.pdf', type: 'application/pdf', insightIds: ['pi16', 'pi17'] },
      { id: 'od7', name: 'Webinar_Conversion_Analysis.pptx', type: 'application/vnd.ms-powerpoint', insightIds: ['pi18', 'pi19', 'pi20'] }
    ],
    rawDataFiles: [
      { name: 'campaign_attribution_data.csv', type: 'text/csv' }
    ]
  },
  {
    id: 'q3',
    queueId: 'QUEUE-2026-003',
    uploadDate: '2026-02-25',
    uploadedBy: 'Lisa Wang',
    status: 'pending',
    insightsCount: 15,
    researchContext: 'Sales enablement and competitive intelligence review for Q4 2025 / Q1 2026. Objective: assess the impact of battle cards, mutual action plans, and competitive positioning on win rates. Methodology: win/loss interviews (n=78), CRM stage analysis, and sales cycle benchmarking across 200+ closed opportunities. Secondary focus: pricing transparency impact on competitive losses.',
    contextDocuments: [
      { name: 'Win_Loss_Interview_Guide.pdf', type: 'application/pdf' },
      { name: 'Competitive_Intelligence_Framework.docx', type: 'application/msword' },
      { name: 'Sales_Enablement_Audit_Scope.pdf', type: 'application/pdf' }
    ],
    outputDocuments: [
      { id: 'od8', name: 'Win_Loss_Analysis_Q4Q1.pdf', type: 'application/pdf', insightIds: ['pi21', 'pi22', 'pi23', 'pi24', 'pi25'] },
      { id: 'od9', name: 'Sales_Cycle_Benchmarking_Report.pdf', type: 'application/pdf', insightIds: ['pi26', 'pi27', 'pi28'] },
      { id: 'od10', name: 'Competitive_Battle_Card_Impact.pptx', type: 'application/vnd.ms-powerpoint', insightIds: ['pi29', 'pi30', 'pi31', 'pi32'] },
      { id: 'od11', name: 'Pricing_Transparency_Study.pdf', type: 'application/pdf', insightIds: ['pi33', 'pi34', 'pi35'] }
    ],
    rawDataFiles: [
      { name: 'crm_opportunity_export.csv', type: 'text/csv' },
      { name: 'win_loss_interview_transcripts.zip', type: 'application/zip' },
      { name: 'deal_stage_timing_data.xlsx', type: 'application/vnd.ms-excel' }
    ]
  }
];

const mockProcessedUploads: ProcessedUpload[] = [
  {
    id: 'h1',
    queueId: 'QUEUE-2026-000',
    uploadDate: '2026-02-24',
    uploadedBy: 'Rachel Torres',
    insightsGenerated: 18,
    insightsApproved: 14,
    insightsDeclined: 4,
    status: 'complete'
  },
  {
    id: 'h2',
    queueId: 'QUEUE-2025-999',
    uploadDate: '2026-02-20',
    uploadedBy: 'James Liu',
    insightsGenerated: 22,
    insightsApproved: 19,
    insightsDeclined: 3,
    status: 'complete'
  },
  {
    id: 'h3',
    queueId: 'QUEUE-2025-998',
    uploadDate: '2026-02-18',
    uploadedBy: 'Aisha Patel',
    insightsGenerated: 11,
    insightsApproved: 9,
    insightsDeclined: 2,
    status: 'complete'
  },
  {
    id: 'h4',
    queueId: 'QUEUE-2025-997',
    uploadDate: '2026-02-15',
    uploadedBy: 'Taylor Kim',
    insightsGenerated: 16,
    insightsApproved: 13,
    insightsDeclined: 3,
    status: 'complete'
  }
];

export function DataSourceConnection({ onSelectSource, onManualEntry }: DataSourceConnectionProps) {
  const [activeTab, setActiveTab] = useState<Tab>('upload');
  const [uploadMode, setUploadMode] = useState<UploadMode>('document');
  
  // Upload tab state
  const [researchContext, setResearchContext] = useState('');
  const [contextFiles, setContextFiles] = useState<UploadedFile[]>([]);
  const [outputFiles, setOutputFiles] = useState<UploadedFile[]>([]);
  const [rawDataFiles, setRawDataFiles] = useState<UploadedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [generatedQueueId, setGeneratedQueueId] = useState('');
  
  // File input refs
  const contextFileRef = useRef<HTMLInputElement>(null);
  const outputFileRef = useRef<HTMLInputElement>(null);
  const rawDataFileRef = useRef<HTMLInputElement>(null);
  
  // Approval queue state
  const [selectedQueueItem, setSelectedQueueItem] = useState<QueueItem | null>(null);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<ProcessedUpload | null>(null);

  const handleFileSelect = (
    files: FileList | null,
    setter: React.Dispatch<React.SetStateAction<UploadedFile[]>>
  ) => {
    if (!files) return;
    const newFiles: UploadedFile[] = Array.from(files).map((f) => ({
      name: f.name,
      size: f.size,
      type: f.type
    }));
    setter((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (
    index: number,
    setter: React.Dispatch<React.SetStateAction<UploadedFile[]>>
  ) => {
    setter((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return 'PDF';
    if (type.includes('word') || type.includes('document')) return 'DOC';
    if (type.includes('spreadsheet') || type.includes('excel') || type.includes('csv')) return 'XLS';
    if (type.includes('presentation') || type.includes('powerpoint')) return 'PPT';
    return 'FILE';
  };

  const canSubmit = (researchContext.trim().length > 0 || contextFiles.length > 0) && outputFiles.length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setIsSubmitting(true);

    // Generate queue ID
    const queueId = `QUEUE-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

    // Simulate submission with animation
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      setGeneratedQueueId(queueId);
      
      toast.success('Research submitted successfully!', {
        description: `Queue ID: ${queueId}`
      });

      // Reset form after showing success
      setTimeout(() => {
        setResearchContext('');
        setContextFiles([]);
        setOutputFiles([]);
        setRawDataFiles([]);
        setShowSuccess(false);
        setGeneratedQueueId('');
      }, 3000);
    }, 1500);
  };

  const renderFileList = (
    files: UploadedFile[],
    setter: React.Dispatch<React.SetStateAction<UploadedFile[]>>
  ) => {
    if (files.length === 0) return null;

    return (
      <div className="mt-3 space-y-2">
        {files.map((file, index) => (
          <div
            key={`${file.name}-${index}`}
            className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-blue-600">
                {getFileIcon(file.type)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
              <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
            </div>
            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
            <button
              onClick={() => handleRemoveFile(index, setter)}
              className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    );
  };

  const renderUploadTab = () => (
    <div className="max-w-5xl mx-auto">
      {/* Upload Mode Toggle */}
      <div className="flex items-center gap-1 mb-6 bg-white rounded-lg p-1 border border-gray-200 w-fit">
        <button
          onClick={() => setUploadMode('document')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
            uploadMode === 'document'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <Upload className="w-4 h-4" />
          Upload Document
        </button>
        <button
          onClick={() => setUploadMode('manual')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
            uploadMode === 'manual'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <PenLine className="w-4 h-4" />
          Input Manually
        </button>
      </div>

      {uploadMode === 'document' ? renderDocumentUpload() : <ManualInsightForm />}
    </div>
  );

  const renderDocumentUpload = () => (
    <>
      {showSuccess ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Upload Successful!</h2>
              <p className="text-gray-600 mb-4">
                Your research has been submitted to the processing queue.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
                <FileCheck className="w-5 h-5 text-blue-600" />
                <span className="font-mono text-lg font-semibold text-blue-900">
                  {generatedQueueId}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-3">
                You can track this upload in the Approval Review Queue tab.
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Research Context */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h2 className="font-semibold text-gray-900">Research Context</h2>
                <Badge variant="secondary" className="text-xs bg-red-50 text-red-700 border-red-200">
                  Required
                </Badge>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Provide context about your research: objectives, methodology, key questions, or any background information.
            </p>
            <Textarea
              placeholder="Describe the research objectives, methodology, timeframe, and any important context that will help in insight extraction..."
              value={researchContext}
              onChange={(e) => setResearchContext(e.target.value)}
              className="min-h-[120px] mb-3"
            />
            <div className="flex items-center gap-2">
              <input
                ref={contextFileRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => handleFileSelect(e.target.files, setContextFiles)}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => contextFileRef.current?.click()}
                className="gap-2"
              >
                <Paperclip className="w-4 h-4" />
                Attach Files
              </Button>
              <span className="text-xs text-gray-500">Optional: Attach supporting documents</span>
            </div>
            {renderFileList(contextFiles, setContextFiles)}
          </Card>

          {/* Research Output */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                <h2 className="font-semibold text-gray-900">Research Output</h2>
                <Badge variant="secondary" className="text-xs bg-red-50 text-red-700 border-red-200">
                  Required
                </Badge>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Upload your research findings, reports, presentations, or analysis documents. You can add multiple files.
            </p>
            <input
              ref={outputFileRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv"
              onChange={(e) => handleFileSelect(e.target.files, setOutputFiles)}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => outputFileRef.current?.click()}
              className="w-full py-8 border-2 border-dashed hover:bg-gray-50"
            >
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-6 h-6 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  Click to upload research output files
                </span>
                <span className="text-xs text-gray-500">
                  PDF, DOC, PPT, XLS, CSV (max 100MB per file)
                </span>
              </div>
            </Button>
            {renderFileList(outputFiles, setOutputFiles)}
          </Card>

          {/* Raw Data */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600" />
                <h2 className="font-semibold text-gray-900">Raw Data</h2>
                <Badge variant="secondary" className="text-xs">
                  Optional
                </Badge>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Upload raw datasets, survey responses, or source data files for full transparency and traceability.
            </p>
            <input
              ref={rawDataFileRef}
              type="file"
              multiple
              accept=".csv,.xlsx,.xls,.json,.txt"
              onChange={(e) => handleFileSelect(e.target.files, setRawDataFiles)}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => rawDataFileRef.current?.click()}
              className="w-full py-6 border-dashed hover:bg-gray-50"
            >
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Click to upload raw data files</span>
                <span className="text-xs text-gray-500">CSV, XLSX, JSON, TXT</span>
              </div>
            </Button>
            {renderFileList(rawDataFiles, setRawDataFiles)}
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end pt-4 pb-8">
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 gap-2 px-8 py-6 text-base"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing Upload...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Submit for Processing
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </>
  );

  const renderApprovalQueueTab = () => (
    <div className="max-w-7xl mx-auto">
      {selectedQueueItem ? (
        <ApprovalReviewPanel
          queueItem={selectedQueueItem}
          onBack={() => setSelectedQueueItem(null)}
          onApprove={() => {
            toast.success('Insights approved successfully!');
            setSelectedQueueItem(null);
          }}
        />
      ) : (
        <Card>
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Pending Approval Queue</h2>
            <p className="text-sm text-gray-600 mt-1">
              Review and approve insights extracted from uploaded research
            </p>
          </div>
          <div className="divide-y divide-gray-100">
            {mockQueueItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedQueueItem(item)}
                className="w-full px-6 py-5 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-medium text-gray-900">{item.queueId}</span>
                    <Badge
                      variant="secondary"
                      className={
                        item.status === 'pending'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      {item.status === 'pending' ? 'Pending Review' : 'In Review'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{item.uploadedBy}</span>
                    <span>{new Date(item.uploadDate).toLocaleDateString()}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{item.researchContext}</p>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    {item.outputDocuments.length} output document{item.outputDocuments.length !== 1 ? 's' : ''}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    {item.insightsCount} insights
                  </span>
                  {item.contextDocuments.length > 0 && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      {item.contextDocuments.length} context doc{item.contextDocuments.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );

  const renderHistoryTab = () => (
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
              {mockProcessedUploads.map((item) => (
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

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Add New Insights</h1>
          <p className="text-gray-600">
            Upload research documents, review extracted insights, and track processing history
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-white rounded-lg p-1 border border-gray-200 w-fit">
          <button
            onClick={() => setActiveTab('upload')}
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
            onClick={() => setActiveTab('approval')}
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
                {mockQueueItems.length}
              </Badge>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('history')}
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

        {/* Tab Content */}
        <div className="pb-8">
          {activeTab === 'upload' && renderUploadTab()}
          {activeTab === 'approval' && renderApprovalQueueTab()}
          {activeTab === 'history' && renderHistoryTab()}
        </div>
      </div>
    </div>
  );
}

// Approval Review Panel Component
interface PendingInsight {
  id: string;
  statement: string;
  footnote: string;
  sourceDocId: string;
  sourceFile: string;
  sourceFileUrl: string;
  team: string;
  sourceType: string;
  sharingLevel: string;
  analysisStart: string;
  analysisEnd: string;
  expiration: string;
  customFields: { label: string; value: string }[];
}

function ApprovalReviewPanel({
  queueItem,
  onBack,
  onApprove
}: {
  queueItem: QueueItem;
  onBack: () => void;
  onApprove: () => void;
}) {
  // Generate insights tied to output documents
  const generateInsightsForQueue = (item: QueueItem): PendingInsight[] => {
    const insightBank: Record<string, PendingInsight[]> = {
      'QUEUE-2026-001': [
        { id: 'pi1', statement: 'Mid-market segment shows 34% higher conversion rate when SDR-qualified vs self-serve trials, indicating value of human touch in this segment.', footnote: 'Source: Q1 Pipeline Analysis, pp. 14–18. Methodology: compared cohorts of SDR-qualified vs self-serve trial accounts (n=342) over a 90-day window.', sourceDocId: 'od1', sourceFile: 'Q1_2026_Pipeline_Analysis.pdf', sourceFileUrl: '#', team: 'Sales', sourceType: 'document', sharingLevel: 'internal', analysisStart: '2026-01-01', analysisEnd: '2026-03-31', expiration: '2026-09-30', customFields: [{ label: 'Segment', value: 'Mid-Market' }, { label: 'Region', value: 'North America' }] },
        { id: 'pi3', statement: 'Enterprise segment CAC decreased 22% QoQ due to improved lead scoring model accuracy, saving an estimated $340K annually.', footnote: 'Source: Q1 Pipeline Analysis, pp. 22–25. Based on fully-loaded CAC calculation including marketing and sales costs.', sourceDocId: 'od1', sourceFile: 'Q1_2026_Pipeline_Analysis.pdf', sourceFileUrl: '#', team: 'Sales', sourceType: 'document', sharingLevel: 'internal', analysisStart: '2026-01-01', analysisEnd: '2026-03-31', expiration: '2026-09-30', customFields: [{ label: 'Segment', value: 'Enterprise' }] },
        { id: 'pi5', statement: 'Multi-threaded deals (3+ stakeholders engaged) close at 2.1x the rate of single-threaded deals in enterprise accounts.', footnote: 'Source: Q1 Pipeline Analysis, pp. 31–34. Analysis of 156 enterprise opportunities by stakeholder engagement count.', sourceDocId: 'od1', sourceFile: 'Q1_2026_Pipeline_Analysis.pdf', sourceFileUrl: '#', team: 'Sales', sourceType: 'document', sharingLevel: 'internal', analysisStart: '2026-01-01', analysisEnd: '2026-03-31', expiration: '2026-09-30', customFields: [{ label: 'Segment', value: 'Enterprise' }] },
        { id: 'pi7', statement: 'Pipeline velocity increased 28% in mid-market segment after implementing SDR-led outbound sequences targeting ICP-matched accounts.', footnote: 'Source: Q1 Pipeline Analysis, pp. 38–41. Pre/post comparison over 60-day windows.', sourceDocId: 'od1', sourceFile: 'Q1_2026_Pipeline_Analysis.pdf', sourceFileUrl: '#', team: 'Sales', sourceType: 'document', sharingLevel: 'controlled', analysisStart: '2026-01-01', analysisEnd: '2026-03-31', expiration: '2026-09-30', customFields: [{ label: 'Segment', value: 'Mid-Market' }] },
        { id: 'pi2', statement: 'Email campaigns with personalized subject lines see 23% higher open rates and 18% higher click-through rates compared to generic messaging.', footnote: 'Based on A/B test across 48 campaigns (Oct 2025 – Feb 2026). Statistical significance p<0.01 for both open rate and CTR metrics.', sourceDocId: 'od2', sourceFile: 'Email_Campaign_Performance_Report.pdf', sourceFileUrl: '#', team: 'Marketing', sourceType: 'dashboard', sharingLevel: 'controlled', analysisStart: '2025-10-01', analysisEnd: '2026-02-28', expiration: '2026-08-31', customFields: [{ label: 'Channel', value: 'Email' }] },
        { id: 'pi4', statement: 'Webinar-to-demo conversion rate improved from 8% to 14% after introducing personalized follow-up sequences within 24 hours.', footnote: 'Email Campaign Performance Report, Section 4. Comparison of 12 webinars pre/post implementation.', sourceDocId: 'od2', sourceFile: 'Email_Campaign_Performance_Report.pdf', sourceFileUrl: '#', team: 'Marketing', sourceType: 'dashboard', sharingLevel: 'internal', analysisStart: '2025-10-01', analysisEnd: '2026-02-28', expiration: '2026-08-31', customFields: [{ label: 'Channel', value: 'Email + Webinar' }] },
        { id: 'pi6', statement: 'Blog content with interactive ROI calculators generates 5x more form submissions than static content.', footnote: 'Email Campaign Performance Report, Section 7. Tracked 24 blog posts with calculators vs 50 static posts over 4 months.', sourceDocId: 'od2', sourceFile: 'Email_Campaign_Performance_Report.pdf', sourceFileUrl: '#', team: 'Marketing', sourceType: 'document', sharingLevel: 'controlled', analysisStart: '2025-10-01', analysisEnd: '2026-02-28', expiration: '2026-08-31', customFields: [{ label: 'Content Type', value: 'Interactive' }] },
        { id: 'pi8', statement: 'SDR outbound sequences with 5-touch cadences outperform 3-touch by 31% in reply rate for enterprise prospects.', footnote: 'SDR Outbound Effectiveness Deck, Slide 8. Analysis of 1,200 sequences across 3 SDR teams.', sourceDocId: 'od3', sourceFile: 'SDR_Outbound_Effectiveness_Deck.pptx', sourceFileUrl: '#', team: 'Sales', sourceType: 'document', sharingLevel: 'internal', analysisStart: '2026-01-01', analysisEnd: '2026-02-28', expiration: '2026-08-31', customFields: [{ label: 'Channel', value: 'Outbound' }] },
        { id: 'pi9', statement: 'Prospects who attend live product demos convert 38% higher than those who only view recorded demos.', footnote: 'SDR Outbound Effectiveness Deck, Slide 14. Based on conversion tracking of 430 demo attendees.', sourceDocId: 'od3', sourceFile: 'SDR_Outbound_Effectiveness_Deck.pptx', sourceFileUrl: '#', team: 'Sales', sourceType: 'document', sharingLevel: 'internal', analysisStart: '2026-01-01', analysisEnd: '2026-02-28', expiration: '2026-08-31', customFields: [] },
        { id: 'pi10', statement: 'Social selling index scores above 70 correlate with 15% higher quota attainment among AEs.', footnote: 'SDR Outbound Effectiveness Deck, Slide 19. Correlation analysis across 48 AEs over 2 quarters.', sourceDocId: 'od3', sourceFile: 'SDR_Outbound_Effectiveness_Deck.pptx', sourceFileUrl: '#', team: 'Sales', sourceType: 'document', sharingLevel: 'controlled', analysisStart: '2025-07-01', analysisEnd: '2026-02-28', expiration: '2026-08-31', customFields: [{ label: 'Platform', value: 'LinkedIn' }] },
        { id: 'pi11', statement: 'Customer referral program generates leads with 60% shorter sales cycles compared to all other channels.', footnote: 'Channel ROI Comparison Q1, Tab "Referrals". Based on 89 referral-sourced deals closed in Q4–Q1.', sourceDocId: 'od4', sourceFile: 'Channel_ROI_Comparison_Q1.xlsx', sourceFileUrl: '#', team: 'Sales', sourceType: 'document', sharingLevel: 'internal', analysisStart: '2025-10-01', analysisEnd: '2026-03-31', expiration: '2026-09-30', customFields: [{ label: 'Channel', value: 'Referral' }] },
        { id: 'pi12', statement: 'Content syndication campaigns on LinkedIn drove 3.2x more MQLs than organic social, with 19% lower CPL.', footnote: 'Channel ROI Comparison Q1, Tab "Paid vs Organic". Comparison of 32 syndication vs 45 organic campaigns.', sourceDocId: 'od4', sourceFile: 'Channel_ROI_Comparison_Q1.xlsx', sourceFileUrl: '#', team: 'Marketing', sourceType: 'dashboard', sharingLevel: 'controlled', analysisStart: '2025-10-01', analysisEnd: '2026-03-31', expiration: '2026-09-30', customFields: [{ label: 'Channel', value: 'LinkedIn' }] },
      ],
      'QUEUE-2026-002': [
        { id: 'pi13', statement: 'Case study content featuring quantified ROI metrics generates 4.2x more downloads than narrative-only formats.', footnote: 'Content Format Effectiveness Report, pp. 8–11. Tracked 36 case studies over 6 months.', sourceDocId: 'od5', sourceFile: 'Content_Format_Effectiveness_Report.pdf', sourceFileUrl: '#', team: 'Marketing', sourceType: 'document', sharingLevel: 'controlled', analysisStart: '2025-07-01', analysisEnd: '2025-12-31', expiration: '2026-06-30', customFields: [{ label: 'Content Type', value: 'Case Study' }] },
        { id: 'pi14', statement: 'Gated whitepapers targeting C-suite personas had 67% higher conversion to sales-accepted leads.', footnote: 'Content Format Effectiveness Report, pp. 15–18. Analysis of 28 whitepapers by target persona.', sourceDocId: 'od5', sourceFile: 'Content_Format_Effectiveness_Report.pdf', sourceFileUrl: '#', team: 'Marketing', sourceType: 'document', sharingLevel: 'controlled', analysisStart: '2025-07-01', analysisEnd: '2025-12-31', expiration: '2026-06-30', customFields: [{ label: 'Audience', value: 'C-Suite' }] },
        { id: 'pi15', statement: 'Video testimonials embedded in nurture sequences improve SQL conversion by 26% compared to text-only emails.', footnote: 'Content Format Effectiveness Report, pp. 22–24. A/B test across 18 nurture tracks.', sourceDocId: 'od5', sourceFile: 'Content_Format_Effectiveness_Report.pdf', sourceFileUrl: '#', team: 'Marketing', sourceType: 'document', sharingLevel: 'internal', analysisStart: '2025-07-01', analysisEnd: '2025-12-31', expiration: '2026-06-30', customFields: [{ label: 'Content Type', value: 'Video' }] },
        { id: 'pi16', statement: 'ABM-targeted accounts show 45% higher average deal size compared to inbound-sourced opportunities.', footnote: 'ABM Campaign Results H2, pp. 6–10. Comparison of 120 ABM vs 340 inbound accounts.', sourceDocId: 'od6', sourceFile: 'ABM_Campaign_Results_H2.pdf', sourceFileUrl: '#', team: 'Marketing', sourceType: 'document', sharingLevel: 'controlled', analysisStart: '2025-07-01', analysisEnd: '2025-12-31', expiration: '2026-06-30', customFields: [{ label: 'Strategy', value: 'ABM' }] },
        { id: 'pi17', statement: 'Account-based advertising on LinkedIn drove 19% lift in target account engagement within 30 days.', footnote: 'ABM Campaign Results H2, pp. 14–16. Measured via 6sense engagement scoring across 85 target accounts.', sourceDocId: 'od6', sourceFile: 'ABM_Campaign_Results_H2.pdf', sourceFileUrl: '#', team: 'Marketing', sourceType: 'dashboard', sharingLevel: 'controlled', analysisStart: '2025-07-01', analysisEnd: '2025-12-31', expiration: '2026-06-30', customFields: [{ label: 'Platform', value: 'LinkedIn' }] },
        { id: 'pi18', statement: 'Webinar attendance rates improved from 38% to 52% when reminders included personalized agenda snippets.', footnote: 'Webinar Conversion Analysis, Slide 6. Pre/post comparison across 24 webinars.', sourceDocId: 'od7', sourceFile: 'Webinar_Conversion_Analysis.pptx', sourceFileUrl: '#', team: 'Marketing', sourceType: 'document', sharingLevel: 'internal', analysisStart: '2025-07-01', analysisEnd: '2025-12-31', expiration: '2026-06-30', customFields: [] },
        { id: 'pi19', statement: 'Post-webinar demo requests peak within the first 4 hours; delayed follow-up beyond 24 hours drops conversion by 41%.', footnote: 'Webinar Conversion Analysis, Slide 11. Time-series analysis of 1,400 webinar attendees.', sourceDocId: 'od7', sourceFile: 'Webinar_Conversion_Analysis.pptx', sourceFileUrl: '#', team: 'Marketing', sourceType: 'document', sharingLevel: 'controlled', analysisStart: '2025-07-01', analysisEnd: '2025-12-31', expiration: '2026-06-30', customFields: [{ label: 'Channel', value: 'Webinar' }] },
        { id: 'pi20', statement: 'Interactive Q&A during webinars correlates with 2.3x higher post-event engagement compared to presentation-only formats.', footnote: 'Webinar Conversion Analysis, Slide 15. Survey and engagement data from 18 webinars.', sourceDocId: 'od7', sourceFile: 'Webinar_Conversion_Analysis.pptx', sourceFileUrl: '#', team: 'Marketing', sourceType: 'document', sharingLevel: 'internal', analysisStart: '2025-07-01', analysisEnd: '2025-12-31', expiration: '2026-06-30', customFields: [] },
      ],
      'QUEUE-2026-003': [
        { id: 'pi21', statement: 'Win/loss analysis reveals pricing transparency as the #1 factor in competitive losses (cited in 43% of lost deals).', footnote: 'Win/Loss Analysis Q4Q1, pp. 8–12. Based on 78 structured interviews with buyers.', sourceDocId: 'od8', sourceFile: 'Win_Loss_Analysis_Q4Q1.pdf', sourceFileUrl: '#', team: 'Sales', sourceType: 'document', sharingLevel: 'internal', analysisStart: '2025-10-01', analysisEnd: '2026-02-28', expiration: '2026-08-31', customFields: [{ label: 'Focus', value: 'Competitive' }] },
        { id: 'pi22', statement: 'Deals with procurement involvement take 2.4x longer to close but have 18% lower churn at 12 months.', footnote: 'Win/Loss Analysis Q4Q1, pp. 15–18. Tracked 200 closed deals by procurement involvement flag.', sourceDocId: 'od8', sourceFile: 'Win_Loss_Analysis_Q4Q1.pdf', sourceFileUrl: '#', team: 'Sales', sourceType: 'document', sharingLevel: 'internal', analysisStart: '2025-10-01', analysisEnd: '2026-02-28', expiration: '2026-08-31', customFields: [] },
        { id: 'pi23', statement: 'Champion identification in accounts with 500+ employees accelerates deal cycle by an average of 18 days.', footnote: 'Win/Loss Analysis Q4Q1, pp. 21–23. Analysis of 134 enterprise deals by champion status.', sourceDocId: 'od8', sourceFile: 'Win_Loss_Analysis_Q4Q1.pdf', sourceFileUrl: '#', team: 'Sales', sourceType: 'document', sharingLevel: 'controlled', analysisStart: '2025-10-01', analysisEnd: '2026-02-28', expiration: '2026-08-31', customFields: [{ label: 'Segment', value: 'Enterprise' }] },
        { id: 'pi24', statement: 'Executive sponsorship in deals over $100K improves win rate by 29% according to CRM stage analysis.', footnote: 'Win/Loss Analysis Q4Q1, pp. 26–28. Cross-referenced with CRM opportunity data for 89 $100K+ deals.', sourceDocId: 'od8', sourceFile: 'Win_Loss_Analysis_Q4Q1.pdf', sourceFileUrl: '#', team: 'Sales', sourceType: 'document', sharingLevel: 'internal', analysisStart: '2025-10-01', analysisEnd: '2026-02-28', expiration: '2026-08-31', customFields: [{ label: 'Deal Size', value: '$100K+' }] },
        { id: 'pi25', statement: 'Top 3 competitive loss reasons after pricing: feature gaps in analytics (31%), integration limitations (27%), and implementation timeline (22%).', footnote: 'Win/Loss Analysis Q4Q1, pp. 30–33. Coded from open-ended interview responses.', sourceDocId: 'od8', sourceFile: 'Win_Loss_Analysis_Q4Q1.pdf', sourceFileUrl: '#', team: 'Sales', sourceType: 'document', sharingLevel: 'controlled', analysisStart: '2025-10-01', analysisEnd: '2026-02-28', expiration: '2026-08-31', customFields: [{ label: 'Focus', value: 'Competitive' }] },
        { id: 'pi26', statement: 'Sales cycle length decreased by 11 days when mutual action plans were used in enterprise opportunities.', footnote: 'Sales Cycle Benchmarking Report, pp. 6–9. Compared 67 deals with MAPs vs 78 without.', sourceDocId: 'od9', sourceFile: 'Sales_Cycle_Benchmarking_Report.pdf', sourceFileUrl: '#', team: 'Sales', sourceType: 'document', sharingLevel: 'internal', analysisStart: '2025-10-01', analysisEnd: '2026-02-28', expiration: '2026-08-31', customFields: [] },
        { id: 'pi27', statement: 'Technical proof-of-concept completion rate is the strongest predictor of deal closure (r=0.74).', footnote: 'Sales Cycle Benchmarking Report, pp. 12–14. Regression analysis across 200+ opportunities.', sourceDocId: 'od9', sourceFile: 'Sales_Cycle_Benchmarking_Report.pdf', sourceFileUrl: '#', team: 'Sales', sourceType: 'document', sharingLevel: 'internal', analysisStart: '2025-10-01', analysisEnd: '2026-02-28', expiration: '2026-08-31', customFields: [] },
        { id: 'pi28', statement: 'Deals progressed through MEDDPICC framework have 40% higher forecast accuracy than non-qualified deals.', footnote: 'Sales Cycle Benchmarking Report, pp. 18–20. Forecast accuracy measured as actual vs projected close date within 14 days.', sourceDocId: 'od9', sourceFile: 'Sales_Cycle_Benchmarking_Report.pdf', sourceFileUrl: '#', team: 'Sales', sourceType: 'document', sharingLevel: 'controlled', analysisStart: '2025-10-01', analysisEnd: '2026-02-28', expiration: '2026-08-31', customFields: [{ label: 'Framework', value: 'MEDDPICC' }] },
        { id: 'pi29', statement: 'Sales teams using competitive battle cards in deals report 24% higher win rates against top 3 competitors.', footnote: 'Competitive Battle Card Impact, Slide 5. Self-reported battle card usage cross-referenced with CRM outcomes.', sourceDocId: 'od10', sourceFile: 'Competitive_Battle_Card_Impact.pptx', sourceFileUrl: '#', team: 'Sales', sourceType: 'document', sharingLevel: 'controlled', analysisStart: '2025-10-01', analysisEnd: '2026-02-28', expiration: '2026-08-31', customFields: [{ label: 'Focus', value: 'Enablement' }] },
        { id: 'pi30', statement: 'Battle card adoption is highest among top quartile performers (87%) vs bottom quartile (34%).', footnote: 'Competitive Battle Card Impact, Slide 9. Usage survey of 96 AEs segmented by performance quartile.', sourceDocId: 'od10', sourceFile: 'Competitive_Battle_Card_Impact.pptx', sourceFileUrl: '#', team: 'Sales', sourceType: 'document', sharingLevel: 'internal', analysisStart: '2025-10-01', analysisEnd: '2026-02-28', expiration: '2026-08-31', customFields: [] },
        { id: 'pi31', statement: 'Competitive displacement deals have 1.8x longer cycles but 35% larger average deal sizes.', footnote: 'Competitive Battle Card Impact, Slide 13. Analysis of 44 competitive displacement opportunities.', sourceDocId: 'od10', sourceFile: 'Competitive_Battle_Card_Impact.pptx', sourceFileUrl: '#', team: 'Sales', sourceType: 'document', sharingLevel: 'internal', analysisStart: '2025-10-01', analysisEnd: '2026-02-28', expiration: '2026-08-31', customFields: [] },
        { id: 'pi32', statement: 'Sales enablement content that includes competitor-specific objection handling scripts reduces loss rate by 16%.', footnote: 'Competitive Battle Card Impact, Slide 17. Tracked objection handling content usage vs deal outcomes.', sourceDocId: 'od10', sourceFile: 'Competitive_Battle_Card_Impact.pptx', sourceFileUrl: '#', team: 'Sales', sourceType: 'document', sharingLevel: 'controlled', analysisStart: '2025-10-01', analysisEnd: '2026-02-28', expiration: '2026-08-31', customFields: [{ label: 'Focus', value: 'Enablement' }] },
        { id: 'pi33', statement: 'Transparent pricing page visitors convert to demo requests at 2.1x the rate of non-pricing page visitors.', footnote: 'Pricing Transparency Study, pp. 5–8. Web analytics funnel comparison over 90 days.', sourceDocId: 'od11', sourceFile: 'Pricing_Transparency_Study.pdf', sourceFileUrl: '#', team: 'Marketing', sourceType: 'dashboard', sharingLevel: 'controlled', analysisStart: '2025-10-01', analysisEnd: '2026-01-31', expiration: '2026-07-31', customFields: [{ label: 'Focus', value: 'Pricing' }] },
        { id: 'pi34', statement: '72% of enterprise buyers expect pricing guidance before scheduling a call; lack of it leads to 35% disqualification.', footnote: 'Pricing Transparency Study, pp. 11–14. Survey of 210 enterprise buyers post-evaluation.', sourceDocId: 'od11', sourceFile: 'Pricing_Transparency_Study.pdf', sourceFileUrl: '#', team: 'Sales', sourceType: 'document', sharingLevel: 'internal', analysisStart: '2025-10-01', analysisEnd: '2026-01-31', expiration: '2026-07-31', customFields: [{ label: 'Segment', value: 'Enterprise' }] },
        { id: 'pi35', statement: 'Competitors with public pricing pages saw 28% higher organic search traffic for buying-intent keywords.', footnote: 'Pricing Transparency Study, pp. 17–19. SEMrush competitive analysis across 8 competitors.', sourceDocId: 'od11', sourceFile: 'Pricing_Transparency_Study.pdf', sourceFileUrl: '#', team: 'Marketing', sourceType: 'dashboard', sharingLevel: 'controlled', analysisStart: '2025-10-01', analysisEnd: '2026-01-31', expiration: '2026-07-31', customFields: [{ label: 'Focus', value: 'Competitive SEO' }] },
      ]
    };
    return insightBank[item.queueId] || [];
  };

  // Safe defaults for fields that may be undefined on stale state
  const researchContext = queueItem.researchContext || '';
  const contextDocuments = queueItem.contextDocuments || [];
  const outputDocuments = queueItem.outputDocuments || [];
  const rawDataFiles = queueItem.rawDataFiles || [];

  const [insights, setInsights] = useState<PendingInsight[]>(() => generateInsightsForQueue(queueItem));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<PendingInsight | null>(null);
  const [contextExpanded, setContextExpanded] = useState(true);
  const [docsExpanded, setDocsExpanded] = useState(true);
  const [activeDocFilter, setActiveDocFilter] = useState<string | null>(null);
  const [expandedInsightIds, setExpandedInsightIds] = useState<Set<string>>(new Set());

  // Add New insight state
  const [showAddNew, setShowAddNew] = useState(false);
  const [newInsightDraft, setNewInsightDraft] = useState<PendingInsight>({
    id: '',
    statement: '',
    footnote: '',
    sourceDocId: '',
    sourceFile: '',
    sourceFileUrl: '#',
    team: 'Sales',
    sourceType: 'document',
    sharingLevel: 'internal',
    analysisStart: '',
    analysisEnd: '',
    expiration: '',
    customFields: []
  });

  const startAddNew = () => {
    setShowAddNew(true);
    setNewInsightDraft({
      id: `pi-new-${Date.now()}`,
      statement: '',
      footnote: '',
      sourceDocId: outputDocuments.length > 0 ? outputDocuments[0].id : '',
      sourceFile: outputDocuments.length > 0 ? outputDocuments[0].name : '',
      sourceFileUrl: '#',
      team: 'Sales',
      sourceType: 'document',
      sharingLevel: 'internal',
      analysisStart: '',
      analysisEnd: '',
      expiration: '',
      customFields: []
    });
  };

  const cancelAddNew = () => {
    setShowAddNew(false);
  };

  const saveNewInsight = () => {
    if (!newInsightDraft.statement.trim()) {
      toast.error('Insight statement is required');
      return;
    }
    if (!newInsightDraft.sourceDocId) {
      toast.error('Please select a linking document');
      return;
    }
    setInsights(prev => [...prev, newInsightDraft]);
    toast.success('New insight added');
    setShowAddNew(false);
  };

  const updateNewDraftDoc = (docId: string) => {
    const doc = outputDocuments.find(d => d.id === docId);
    setNewInsightDraft(prev => ({
      ...prev,
      sourceDocId: docId,
      sourceFile: doc?.name || ''
    }));
  };

  const addNewCustomField = () => {
    setNewInsightDraft(prev => ({
      ...prev,
      customFields: [...prev.customFields, { label: '', value: '' }]
    }));
  };

  const removeNewCustomField = (index: number) => {
    setNewInsightDraft(prev => ({
      ...prev,
      customFields: prev.customFields.filter((_, i) => i !== index)
    }));
  };

  const updateNewCustomField = (index: number, field: 'label' | 'value', val: string) => {
    setNewInsightDraft(prev => ({
      ...prev,
      customFields: prev.customFields.map((cf, i) => i === index ? { ...cf, [field]: val } : cf)
    }));
  };

  const toggleInsightExpanded = (id: string) => {
    setExpandedInsightIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const filteredInsights = activeDocFilter
    ? insights.filter(i => i.sourceDocId === activeDocFilter)
    : insights;

  const activeDocName = activeDocFilter
    ? outputDocuments.find(d => d.id === activeDocFilter)?.name
    : null;

  const getDocFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="w-4 h-4" />;
    if (type.includes('powerpoint') || type.includes('presentation')) return <File className="w-4 h-4" />;
    if (type.includes('excel') || type.includes('spreadsheet')) return <FileSpreadsheet className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const getDocTypeLabel = (type: string) => {
    if (type.includes('pdf')) return 'PDF';
    if (type.includes('powerpoint') || type.includes('presentation')) return 'PPTX';
    if (type.includes('excel') || type.includes('spreadsheet')) return 'XLSX';
    if (type.includes('csv')) return 'CSV';
    if (type.includes('word') || type.includes('msword')) return 'DOCX';
    if (type.includes('zip')) return 'ZIP';
    return 'FILE';
  };

  const startEditing = (insight: PendingInsight) => {
    setEditingId(insight.id);
    setEditDraft({ ...insight, customFields: insight.customFields.map(f => ({ ...f })) });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditDraft(null);
  };

  const saveEditing = () => {
    if (!editDraft) return;
    setInsights(prev => prev.map(i => i.id === editDraft.id ? editDraft : i));
    toast.success('Changes saved');
    setEditingId(null);
    setEditDraft(null);
  };

  const addCustomField = () => {
    if (!editDraft) return;
    setEditDraft({ ...editDraft, customFields: [...editDraft.customFields, { label: '', value: '' }] });
  };

  const removeCustomField = (index: number) => {
    if (!editDraft) return;
    setEditDraft({ ...editDraft, customFields: editDraft.customFields.filter((_, i) => i !== index) });
  };

  const updateCustomField = (index: number, field: 'label' | 'value', val: string) => {
    if (!editDraft) return;
    const updated = editDraft.customFields.map((cf, i) => i === index ? { ...cf, [field]: val } : cf);
    setEditDraft({ ...editDraft, customFields: updated });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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
            {queueItem.queueId}
          </Badge>
          <Badge variant="secondary" className={queueItem.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'}>
            {queueItem.status === 'pending' ? 'Pending Review' : 'In Review'}
          </Badge>
        </div>
      </div>

      {/* Queue Summary Bar */}
      <Card className="p-4 bg-white border-gray-200">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <FileCheck className="w-4 h-4 text-blue-700" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Uploaded by</p>
              <p className="text-sm font-medium text-gray-900">{queueItem.uploadedBy}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500">Date</p>
            <p className="text-sm font-medium text-gray-900">{new Date(queueItem.uploadDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Output Documents</p>
            <p className="text-sm font-medium text-gray-900">{outputDocuments.length} files</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Insights Extracted</p>
            <p className="text-sm font-medium text-gray-900">{insights.length} insights</p>
          </div>
        </div>
      </Card>

      {/* Research Context Section */}
      <Card className="overflow-hidden">
        <button
          onClick={() => setContextExpanded(!contextExpanded)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-purple-700" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">Research Context</h3>
              <p className="text-xs text-gray-500">Objectives, methodology, and background documents</p>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${contextExpanded ? '' : '-rotate-90'}`} />
        </button>
        {contextExpanded && (
          <div className="px-6 pb-6 border-t border-gray-100">
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-800 leading-relaxed">{researchContext}</p>
            </div>

            {contextDocuments.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2 font-medium">Supporting Context Documents</p>
                <div className="flex flex-wrap gap-2">
                  {contextDocuments.map((doc, i) => (
                    <button
                      key={i}
                      onClick={() => toast.info(`Opening ${doc.name}...`)}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span>{doc.name}</span>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{getDocTypeLabel(doc.type)}</Badge>
                      <ExternalLink className="w-3 h-3 text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {rawDataFiles.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2 font-medium">Raw Data Files</p>
                <div className="flex flex-wrap gap-2">
                  {rawDataFiles.map((doc, i) => (
                    <button
                      key={i}
                      onClick={() => toast.info(`Opening ${doc.name}...`)}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <Database className="w-3.5 h-3.5 text-gray-400" />
                      <span>{doc.name}</span>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{getDocTypeLabel(doc.type)}</Badge>
                      <ExternalLink className="w-3 h-3 text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Output Documents Section */}
      <Card className="overflow-hidden">
        <button
          onClick={() => setDocsExpanded(!docsExpanded)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <FileCheck className="w-4 h-4 text-blue-700" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">Research Output Documents</h3>
              <p className="text-xs text-gray-500">{outputDocuments.length} documents produced {insights.length} insights</p>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${docsExpanded ? '' : '-rotate-90'}`} />
        </button>
        {docsExpanded && (
          <div className="px-6 pb-6 border-t border-gray-100">
            <div className="mt-4 space-y-3">
              {outputDocuments.map((doc) => {
                const docInsightCount = insights.filter(i => i.sourceDocId === doc.id).length;
                const isActive = activeDocFilter === doc.id;
                return (
                  <div
                    key={doc.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                      isActive
                        ? 'border-blue-300 bg-blue-50 ring-1 ring-blue-200'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isActive ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      {getDocFileIcon(doc.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => toast.info(`Opening ${doc.name}...`)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors flex items-center gap-1.5"
                      >
                        {doc.name}
                        <ExternalLink className="w-3 h-3" />
                      </button>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{getDocTypeLabel(doc.type)}</Badge>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Link2 className="w-3 h-3" />
                          {docInsightCount} insight{docInsightCount !== 1 ? 's' : ''} extracted
                        </span>
                      </div>
                    </div>
                    <Button
                      variant={isActive ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveDocFilter(isActive ? null : doc.id)}
                      className={`gap-1.5 ${isActive ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                    >
                      {isActive ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          Clear Filter
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          Show Insights
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {/* Insights for Review */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-gray-900">Insights for Review</h3>
            <Badge variant="secondary" className="text-xs">{filteredInsights.length} of {insights.length}</Badge>
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

        {filteredInsights.map((insight) => {
          const isEditing = editingId === insight.id;
          const draft = isEditing ? editDraft! : insight;
          const isExpanded = expandedInsightIds.has(insight.id);

          return (
            <Card key={insight.id} className="overflow-hidden">
              {/* Insight Summary Row */}
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleInsightExpanded(insight.id)}
                    className="mt-0.5 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge variant="secondary" className="text-[10px]">{insight.team}</Badge>
                      <button
                        onClick={(e) => { e.stopPropagation(); toast.info(`Opening ${insight.sourceFile}...`); }}
                        className="text-[11px] text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 transition-colors"
                      >
                        <FileText className="w-3 h-3" />
                        {insight.sourceFile}
                      </button>
                    </div>
                    <button
                      onClick={() => toggleInsightExpanded(insight.id)}
                      className="text-left w-full"
                    >
                      <p className="text-sm text-gray-900">{insight.statement}</p>
                    </button>
                    <p className="text-xs text-gray-500 mt-2 italic">{insight.footnote}</p>
                  </div>
                  {/* Compact action buttons */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toast.info('Insight declined')}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                      title="Decline"
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { toggleInsightExpanded(insight.id); if (!isExpanded) startEditing(insight); }}
                      className="text-gray-500 hover:text-gray-700 h-8 w-8 p-0"
                      title="Edit Metadata"
                    >
                      <PenLine className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => toast.success('Insight approved')}
                      className="bg-green-600 hover:bg-green-700 h-8 w-8 p-0"
                      title="Approve"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Expanded Metadata Section */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-0 border-t border-gray-100">
                  <div className="mt-4 space-y-4">
                    {/* Editable Statement & Footnote */}
                    {isEditing && (
                      <>
                        <div>
                          <Label className="text-xs text-gray-500 mb-1.5 block">Insight Statement</Label>
                          <Textarea
                            value={draft.statement}
                            onChange={(e) => setEditDraft({ ...draft, statement: e.target.value })}
                            className="min-h-[80px]"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500 mb-1.5 block">Footnote / Citation</Label>
                          <Textarea
                            value={draft.footnote}
                            onChange={(e) => setEditDraft({ ...draft, footnote: e.target.value })}
                            className="min-h-[60px]"
                          />
                        </div>
                      </>
                    )}

                    {/* Team & Source Type */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-gray-500 mb-1.5 block">Team</Label>
                        {isEditing ? (
                          <Select value={draft.team} onValueChange={(v) => setEditDraft({ ...draft, team: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Strategy">Strategy</SelectItem>
                              <SelectItem value="Product">Product</SelectItem>
                              <SelectItem value="UX Research">UX Research</SelectItem>
                              <SelectItem value="Data Science">Data Science</SelectItem>
                              <SelectItem value="Marketing">Marketing</SelectItem>
                              <SelectItem value="Sales">Sales</SelectItem>
                              <SelectItem value="Customer Success">Customer Success</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant="secondary">{insight.team}</Badge>
                        )}
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500 mb-1.5 block">Source Type</Label>
                        {isEditing ? (
                          <Select value={draft.sourceType} onValueChange={(v) => setEditDraft({ ...draft, sourceType: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="document">Document / Report</SelectItem>
                              <SelectItem value="dashboard">Dashboard / Analytics</SelectItem>
                              <SelectItem value="manual">Manual Observation</SelectItem>
                              <SelectItem value="api">API / Automated</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-sm text-gray-700">{insight.sourceType === 'document' ? 'Document / Report' : insight.sourceType === 'dashboard' ? 'Dashboard / Analytics' : insight.sourceType === 'manual' ? 'Manual Observation' : 'API / Automated'}</p>
                        )}
                      </div>
                    </div>

                    {/* Analysis Dates */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-xs text-gray-500 mb-1.5 block">Analysis Starts At</Label>
                        {isEditing ? (
                          <Input type="date" value={draft.analysisStart} onChange={(e) => setEditDraft({ ...draft, analysisStart: e.target.value })} />
                        ) : (
                          <p className="text-sm text-gray-700">{new Date(insight.analysisStart).toLocaleDateString()}</p>
                        )}
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500 mb-1.5 block">Analysis Ends At</Label>
                        {isEditing ? (
                          <Input type="date" value={draft.analysisEnd} onChange={(e) => setEditDraft({ ...draft, analysisEnd: e.target.value })} />
                        ) : (
                          <p className="text-sm text-gray-700">{new Date(insight.analysisEnd).toLocaleDateString()}</p>
                        )}
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500 mb-1.5 block">Expiration Date</Label>
                        {isEditing ? (
                          <Input type="date" value={draft.expiration} onChange={(e) => setEditDraft({ ...draft, expiration: e.target.value })} />
                        ) : (
                          <p className="text-sm text-gray-700">{new Date(insight.expiration).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>

                    {/* Sharing Level */}
                    <div>
                      <Label className="text-xs text-gray-500 mb-1.5 block">Sharing Level</Label>
                      {isEditing ? (
                        <Select value={draft.sharingLevel} onValueChange={(v) => setEditDraft({ ...draft, sharingLevel: v })}>
                          <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="internal">Internal Only</SelectItem>
                            <SelectItem value="controlled">Controlled Distribution</SelectItem>
                            <SelectItem value="public">Public</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="secondary" className="capitalize">
                          {insight.sharingLevel === 'internal' ? 'Internal Only' : insight.sharingLevel === 'controlled' ? 'Controlled Distribution' : 'Public'}
                        </Badge>
                      )}
                    </div>

                    {/* Custom Metadata */}
                    <div className="pt-3 border-t border-gray-100">
                      <Label className="text-xs text-gray-500 mb-2 block">Custom Metadata</Label>
                      {isEditing ? (
                        <div className="space-y-3">
                          {draft.customFields.map((cf, index) => (
                            <div key={index} className="flex items-end gap-3">
                              <div className="flex-1">
                                <Label className="text-xs text-gray-500 mb-1">Field Name</Label>
                                <Input placeholder="e.g., Product Line" value={cf.label} onChange={(e) => updateCustomField(index, 'label', e.target.value)} />
                              </div>
                              <div className="flex-1">
                                <Label className="text-xs text-gray-500 mb-1">Value</Label>
                                <Input placeholder="e.g., Enterprise Suite" value={cf.value} onChange={(e) => updateCustomField(index, 'value', e.target.value)} />
                              </div>
                              <button onClick={() => removeCustomField(index)} className="text-gray-400 hover:text-red-500 transition-colors pb-2">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          <Button variant="outline" size="sm" onClick={addCustomField} className="gap-1 mt-1">
                            <Plus className="w-4 h-4" />
                            Add Custom Field
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-3">
                          {insight.customFields.length > 0 ? insight.customFields.map((cf, i) => (
                            <div key={i} className="px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                              <span className="text-xs text-gray-500">{cf.label}:</span>{' '}
                              <span className="text-xs font-medium text-gray-800">{cf.value}</span>
                            </div>
                          )) : (
                            <p className="text-xs text-gray-400 italic">No custom metadata</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Edit actions */}
                    {isEditing && (
                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
                        <Button variant="outline" size="sm" onClick={cancelEditing}>Cancel</Button>
                        <Button size="sm" onClick={saveEditing} className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          );
        })}

        {/* Add New Insight */}
        {showAddNew ? (
          <Card className="overflow-hidden border-2 border-blue-200 border-dashed">
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                  <Plus className="w-4 h-4 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900">New Insight</h4>
              </div>

              <div className="space-y-4">
                {/* Linking Document Dropdown */}
                <div>
                  <Label className="text-xs text-gray-500 mb-1.5 block">Linking Document *</Label>
                  <Select value={newInsightDraft.sourceDocId} onValueChange={updateNewDraftDoc}>
                    <SelectTrigger><SelectValue placeholder="Select a document..." /></SelectTrigger>
                    <SelectContent>
                      {outputDocuments.map((doc) => (
                        <SelectItem key={doc.id} value={doc.id}>
                          <span className="flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5 text-gray-400" />
                            {doc.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Insight Statement */}
                <div>
                  <Label className="text-xs text-gray-500 mb-1.5 block">Insight Statement *</Label>
                  <Textarea
                    value={newInsightDraft.statement}
                    onChange={(e) => setNewInsightDraft({ ...newInsightDraft, statement: e.target.value })}
                    placeholder="Enter the insight statement..."
                    className="min-h-[80px]"
                  />
                </div>

                {/* Footnote / Citation */}
                <div>
                  <Label className="text-xs text-gray-500 mb-1.5 block">Footnote / Citation</Label>
                  <Textarea
                    value={newInsightDraft.footnote}
                    onChange={(e) => setNewInsightDraft({ ...newInsightDraft, footnote: e.target.value })}
                    placeholder="Source reference, methodology notes, page numbers..."
                    className="min-h-[60px]"
                  />
                </div>

                {/* Team & Source Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-500 mb-1.5 block">Team</Label>
                    <Select value={newInsightDraft.team} onValueChange={(v) => setNewInsightDraft({ ...newInsightDraft, team: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Strategy">Strategy</SelectItem>
                        <SelectItem value="Product">Product</SelectItem>
                        <SelectItem value="UX Research">UX Research</SelectItem>
                        <SelectItem value="Data Science">Data Science</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Sales">Sales</SelectItem>
                        <SelectItem value="Customer Success">Customer Success</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 mb-1.5 block">Source Type</Label>
                    <Select value={newInsightDraft.sourceType} onValueChange={(v) => setNewInsightDraft({ ...newInsightDraft, sourceType: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="document">Document / Report</SelectItem>
                        <SelectItem value="dashboard">Dashboard / Analytics</SelectItem>
                        <SelectItem value="manual">Manual Observation</SelectItem>
                        <SelectItem value="api">API / Automated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Analysis Dates */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs text-gray-500 mb-1.5 block">Analysis Starts At</Label>
                    <Input type="date" value={newInsightDraft.analysisStart} onChange={(e) => setNewInsightDraft({ ...newInsightDraft, analysisStart: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 mb-1.5 block">Analysis Ends At</Label>
                    <Input type="date" value={newInsightDraft.analysisEnd} onChange={(e) => setNewInsightDraft({ ...newInsightDraft, analysisEnd: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 mb-1.5 block">Expiration Date</Label>
                    <Input type="date" value={newInsightDraft.expiration} onChange={(e) => setNewInsightDraft({ ...newInsightDraft, expiration: e.target.value })} />
                  </div>
                </div>

                {/* Sharing Level */}
                <div>
                  <Label className="text-xs text-gray-500 mb-1.5 block">Sharing Level</Label>
                  <Select value={newInsightDraft.sharingLevel} onValueChange={(v) => setNewInsightDraft({ ...newInsightDraft, sharingLevel: v })}>
                    <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internal">Internal Only</SelectItem>
                      <SelectItem value="controlled">Controlled Distribution</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Custom Metadata */}
                <div className="pt-3 border-t border-gray-100">
                  <Label className="text-xs text-gray-500 mb-2 block">Custom Metadata</Label>
                  <div className="space-y-3">
                    {newInsightDraft.customFields.map((cf, index) => (
                      <div key={index} className="flex items-end gap-3">
                        <div className="flex-1">
                          <Label className="text-xs text-gray-500 mb-1">Field Name</Label>
                          <Input placeholder="e.g., Product Line" value={cf.label} onChange={(e) => updateNewCustomField(index, 'label', e.target.value)} />
                        </div>
                        <div className="flex-1">
                          <Label className="text-xs text-gray-500 mb-1">Value</Label>
                          <Input placeholder="e.g., Enterprise Suite" value={cf.value} onChange={(e) => updateNewCustomField(index, 'value', e.target.value)} />
                        </div>
                        <button onClick={() => removeNewCustomField(index)} className="text-gray-400 hover:text-red-500 transition-colors pb-2">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={addNewCustomField} className="gap-1 mt-1">
                      <Plus className="w-4 h-4" />
                      Add Custom Field
                    </Button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
                  <Button variant="outline" size="sm" onClick={cancelAddNew}>Cancel</Button>
                  <Button size="sm" onClick={saveNewInsight} className="bg-blue-600 hover:bg-blue-700">Add Insight</Button>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <button
            onClick={startAddNew}
            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New
          </button>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="flex items-center justify-between pt-4">
        <p className="text-sm text-gray-500">
          {filteredInsights.length} insight{filteredInsights.length !== 1 ? 's' : ''} shown
          {activeDocFilter && ` from ${activeDocName}`}
        </p>
        <Button onClick={onApprove} className="bg-blue-600 hover:bg-blue-700 gap-2 px-6">
          <CheckCheck className="w-5 h-5" />
          Approve All & Publish
        </Button>
      </div>
    </div>
  );
}

// Mock linked insights per history queue
interface LinkedInsight {
  id: string;
  statement: string;
  team: string;
  status: 'approved' | 'declined';
  reviewedBy: string;
  reviewedDate: string;
}

const mockLinkedInsights: Record<string, LinkedInsight[]> = {
  'QUEUE-2026-000': [
    { id: 'li1', statement: 'Pipeline velocity increased 28% in mid-market segment after implementing SDR-led outbound sequences targeting ICP-matched accounts.', team: 'Sales', status: 'approved', reviewedBy: 'Sarah Chen', reviewedDate: '2026-02-25' },
    { id: 'li2', statement: 'Content syndication campaigns on LinkedIn drove 3.2x more MQLs than organic social, with 19% lower CPL.', team: 'Marketing', status: 'approved', reviewedBy: 'Marcus Rodriguez', reviewedDate: '2026-02-25' },
    { id: 'li3', statement: 'ABM-targeted accounts show 45% higher average deal size compared to inbound-sourced opportunities.', team: 'Sales', status: 'approved', reviewedBy: 'Sarah Chen', reviewedDate: '2026-02-25' },
    { id: 'li4', statement: 'Webinar-to-demo conversion rate improved from 8% to 14% after introducing personalized follow-up sequences within 24 hours.', team: 'Marketing', status: 'approved', reviewedBy: 'Lisa Wang', reviewedDate: '2026-02-25' },
    { id: 'li5', statement: 'Enterprise segment CAC decreased 22% QoQ due to improved lead scoring model accuracy.', team: 'Sales', status: 'approved', reviewedBy: 'Marcus Rodriguez', reviewedDate: '2026-02-25' },
    { id: 'li6', statement: 'Blog content with interactive ROI calculators generates 5x more form submissions than static content.', team: 'Marketing', status: 'approved', reviewedBy: 'Lisa Wang', reviewedDate: '2026-02-25' },
    { id: 'li7', statement: 'Multi-threaded deals (3+ stakeholders engaged) close at 2.1x the rate of single-threaded deals.', team: 'Sales', status: 'approved', reviewedBy: 'Sarah Chen', reviewedDate: '2026-02-25' },
    { id: 'li8', statement: 'Prospects who attend live product demos convert 38% higher than those who only view recorded demos.', team: 'Sales', status: 'approved', reviewedBy: 'Marcus Rodriguez', reviewedDate: '2026-02-25' },
    { id: 'li9', statement: 'Channel partner co-marketing campaigns underperformed direct campaigns by 12% on lead quality metrics.', team: 'Marketing', status: 'approved', reviewedBy: 'Lisa Wang', reviewedDate: '2026-02-25' },
    { id: 'li10', statement: 'SEO-driven organic traffic increased 34% but conversion rate remained flat, indicating content-intent mismatch.', team: 'Marketing', status: 'approved', reviewedBy: 'Sarah Chen', reviewedDate: '2026-02-25' },
    { id: 'li11', statement: 'Paid search branded terms showed declining ROAS over Q1, potentially due to increased competitor bidding.', team: 'Marketing', status: 'approved', reviewedBy: 'Marcus Rodriguez', reviewedDate: '2026-02-25' },
    { id: 'li12', statement: 'Customer referral program generates leads with 60% shorter sales cycles compared to all other channels.', team: 'Sales', status: 'approved', reviewedBy: 'Lisa Wang', reviewedDate: '2026-02-25' },
    { id: 'li13', statement: 'Social selling index scores above 70 correlate with 15% higher quota attainment among AEs.', team: 'Sales', status: 'approved', reviewedBy: 'Sarah Chen', reviewedDate: '2026-02-25' },
    { id: 'li14', statement: 'Account expansion revenue from upsells grew 41% YoY, outpacing new business growth of 23%.', team: 'Sales', status: 'approved', reviewedBy: 'Marcus Rodriguez', reviewedDate: '2026-02-25' },
    { id: 'li15', statement: 'Email open rates declined across all segments in February, likely due to seasonal patterns.', team: 'Marketing', status: 'declined', reviewedBy: 'Lisa Wang', reviewedDate: '2026-02-25' },
    { id: 'li16', statement: 'Trade show ROI was inconclusive due to insufficient attribution data and long sales cycles.', team: 'Marketing', status: 'declined', reviewedBy: 'Sarah Chen', reviewedDate: '2026-02-25' },
    { id: 'li17', statement: 'Sales team sentiment survey showed general satisfaction, but no actionable business insight was extractable.', team: 'Sales', status: 'declined', reviewedBy: 'Marcus Rodriguez', reviewedDate: '2026-02-25' },
    { id: 'li18', statement: 'Competitive win rate data was based on anecdotal CRM notes and lacked statistical rigor for publication.', team: 'Sales', status: 'declined', reviewedBy: 'Lisa Wang', reviewedDate: '2026-02-25' },
  ],
  'QUEUE-2025-999': [
    { id: 'li19', statement: 'Outbound email sequences with 5-touch cadences outperform 3-touch by 31% in reply rate for enterprise prospects.', team: 'Sales', status: 'approved', reviewedBy: 'Aisha Patel', reviewedDate: '2026-02-21' },
    { id: 'li20', statement: 'Case study content featuring quantified ROI metrics generates 4.2x more downloads than narrative-only formats.', team: 'Marketing', status: 'approved', reviewedBy: 'Taylor Kim', reviewedDate: '2026-02-21' },
    { id: 'li21', statement: 'Discovery calls lasting 25-35 minutes have the highest close rate (32%), compared to shorter or longer calls.', team: 'Sales', status: 'approved', reviewedBy: 'Aisha Patel', reviewedDate: '2026-02-21' },
    { id: 'li22', statement: 'Marketing-sourced pipeline contribution reached 42% in Q4, up from 35% in Q3, driven by intent data programs.', team: 'Marketing', status: 'approved', reviewedBy: 'Taylor Kim', reviewedDate: '2026-02-21' },
    { id: 'li23', statement: 'Video testimonials embedded in nurture sequences improve SQL conversion by 26% compared to text-only emails.', team: 'Marketing', status: 'approved', reviewedBy: 'Aisha Patel', reviewedDate: '2026-02-21' },
    { id: 'li24', statement: 'Deals with procurement involvement take 2.4x longer to close but have 18% lower churn at 12 months.', team: 'Sales', status: 'approved', reviewedBy: 'Taylor Kim', reviewedDate: '2026-02-21' },
    { id: 'li25', statement: 'Product-led growth motions in SMB segment reduced CAC by 35% while maintaining similar LTV ratios.', team: 'Sales', status: 'approved', reviewedBy: 'Aisha Patel', reviewedDate: '2026-02-21' },
    { id: 'li26', statement: 'Gated whitepapers targeting C-suite personas had 67% higher conversion to sales-accepted leads.', team: 'Marketing', status: 'approved', reviewedBy: 'Taylor Kim', reviewedDate: '2026-02-21' },
    { id: 'li27', statement: 'Champion identification in accounts with 500+ employees accelerates deal cycle by an average of 18 days.', team: 'Sales', status: 'approved', reviewedBy: 'Aisha Patel', reviewedDate: '2026-02-21' },
    { id: 'li28', statement: 'Retargeting campaigns on display networks show diminishing returns after 14 days of exposure.', team: 'Marketing', status: 'approved', reviewedBy: 'Taylor Kim', reviewedDate: '2026-02-21' },
    { id: 'li29', statement: 'Cross-sell motion into installed base accounts generates 52% higher win rates than net-new prospecting.', team: 'Sales', status: 'approved', reviewedBy: 'Aisha Patel', reviewedDate: '2026-02-21' },
    { id: 'li30', statement: 'Podcast sponsorship campaign awareness lift was measured at 11%, but direct attribution to pipeline was unclear.', team: 'Marketing', status: 'approved', reviewedBy: 'Taylor Kim', reviewedDate: '2026-02-21' },
    { id: 'li31', statement: 'Field event attendance tracking was incomplete, making per-event ROI analysis unreliable.', team: 'Marketing', status: 'approved', reviewedBy: 'Aisha Patel', reviewedDate: '2026-02-21' },
    { id: 'li32', statement: 'Sales enablement content usage data showed uneven adoption across regions.', team: 'Sales', status: 'approved', reviewedBy: 'Taylor Kim', reviewedDate: '2026-02-21' },
    { id: 'li33', statement: 'G2 review campaign drove 89 new reviews in Q4, correlating with 15% increase in inbound demo requests.', team: 'Marketing', status: 'approved', reviewedBy: 'Aisha Patel', reviewedDate: '2026-02-21' },
    { id: 'li34', statement: 'Executive sponsorship in deals over $100K improves win rate by 29% according to CRM stage analysis.', team: 'Sales', status: 'approved', reviewedBy: 'Taylor Kim', reviewedDate: '2026-02-21' },
    { id: 'li35', statement: 'Industry vertical targeting in manufacturing showed promising early signals but sample size was too small.', team: 'Marketing', status: 'approved', reviewedBy: 'Aisha Patel', reviewedDate: '2026-02-21' },
    { id: 'li36', statement: 'Competitor feature comparison data was outdated and could not be verified for accuracy.', team: 'Sales', status: 'declined', reviewedBy: 'Taylor Kim', reviewedDate: '2026-02-21' },
    { id: 'li37', statement: 'Annual planning assumptions for headcount growth lacked supporting market data.', team: 'Sales', status: 'declined', reviewedBy: 'Aisha Patel', reviewedDate: '2026-02-21' },
    { id: 'li38', statement: 'Brand awareness survey results were directionally interesting but methodology had significant limitations.', team: 'Marketing', status: 'declined', reviewedBy: 'Taylor Kim', reviewedDate: '2026-02-21' },
  ],
  'QUEUE-2025-998': [
    { id: 'li39', statement: 'Freemium-to-paid conversion rate improved to 8.4% after introducing in-app upgrade prompts at usage milestones.', team: 'Sales', status: 'approved', reviewedBy: 'Rachel Torres', reviewedDate: '2026-02-19' },
    { id: 'li40', statement: 'LinkedIn Sponsored Content campaigns targeting VP+ titles achieve 2.8x higher engagement rate than broad targeting.', team: 'Marketing', status: 'approved', reviewedBy: 'James Liu', reviewedDate: '2026-02-19' },
    { id: 'li41', statement: 'Win/loss analysis reveals pricing transparency as the #1 factor in competitive losses (cited in 43% of lost deals).', team: 'Sales', status: 'approved', reviewedBy: 'Rachel Torres', reviewedDate: '2026-02-19' },
    { id: 'li42', statement: 'Marketing attribution model upgrade from last-touch to multi-touch revealed 28% more pipeline influence from content.', team: 'Marketing', status: 'approved', reviewedBy: 'James Liu', reviewedDate: '2026-02-19' },
    { id: 'li43', statement: 'Sales cycle length decreased by 11 days when mutual action plans were used in enterprise opportunities.', team: 'Sales', status: 'approved', reviewedBy: 'Rachel Torres', reviewedDate: '2026-02-19' },
    { id: 'li44', statement: 'Account-based advertising on LinkedIn drove 19% lift in target account engagement within 30 days.', team: 'Marketing', status: 'approved', reviewedBy: 'James Liu', reviewedDate: '2026-02-19' },
    { id: 'li45', statement: 'Technical proof-of-concept completion rate is the strongest predictor of deal closure (r=0.74).', team: 'Sales', status: 'approved', reviewedBy: 'Rachel Torres', reviewedDate: '2026-02-19' },
    { id: 'li46', statement: 'Email nurture sequences with dynamic content personalization show 21% higher click rates.', team: 'Marketing', status: 'approved', reviewedBy: 'James Liu', reviewedDate: '2026-02-19' },
    { id: 'li47', statement: 'Quarterly business reviews with existing customers surface 3.1x more expansion opportunities than ad-hoc check-ins.', team: 'Sales', status: 'approved', reviewedBy: 'Rachel Torres', reviewedDate: '2026-02-19' },
    { id: 'li48', statement: 'Preliminary analysis of new market segment showed interest but data was not statistically significant.', team: 'Marketing', status: 'declined', reviewedBy: 'James Liu', reviewedDate: '2026-02-19' },
    { id: 'li49', statement: 'Customer satisfaction correlation with renewal rates was directional only; confounding variables not controlled.', team: 'Sales', status: 'declined', reviewedBy: 'Rachel Torres', reviewedDate: '2026-02-19' },
  ],
  'QUEUE-2025-997': [
    { id: 'li50', statement: 'Intent data signals from Bombora correctly predicted 62% of closed-won deals when used for lead prioritization.', team: 'Sales', status: 'approved', reviewedBy: 'Sarah Chen', reviewedDate: '2026-02-16' },
    { id: 'li51', statement: 'Demand gen campaigns focused on pain-point messaging outperform feature-focused messaging by 37% in CTR.', team: 'Marketing', status: 'approved', reviewedBy: 'Marcus Rodriguez', reviewedDate: '2026-02-16' },
    { id: 'li52', statement: 'Sales teams using competitive battle cards in deals report 24% higher win rates against top 3 competitors.', team: 'Sales', status: 'approved', reviewedBy: 'Sarah Chen', reviewedDate: '2026-02-16' },
    { id: 'li53', statement: 'Integrated campaigns (3+ channels coordinated) produce 2.5x more pipeline than single-channel campaigns.', team: 'Marketing', status: 'approved', reviewedBy: 'Marcus Rodriguez', reviewedDate: '2026-02-16' },
    { id: 'li54', statement: 'Customer health score above 80 correlates with 91% renewal rate, validating the scoring model.', team: 'Customer Success', status: 'approved', reviewedBy: 'Lisa Wang', reviewedDate: '2026-02-16' },
    { id: 'li55', statement: 'Personalized landing pages for ABM campaigns convert at 3.6x the rate of generic landing pages.', team: 'Marketing', status: 'approved', reviewedBy: 'Marcus Rodriguez', reviewedDate: '2026-02-16' },
    { id: 'li56', statement: 'Deals progressed through MEDDPICC framework have 40% higher forecast accuracy than non-qualified deals.', team: 'Sales', status: 'approved', reviewedBy: 'Sarah Chen', reviewedDate: '2026-02-16' },
    { id: 'li57', statement: 'Content marketing ROI analysis shows blog posts have a 14-month payback period through organic traffic compounding.', team: 'Marketing', status: 'approved', reviewedBy: 'Marcus Rodriguez', reviewedDate: '2026-02-16' },
    { id: 'li58', statement: 'SDR-to-AE handoff quality score directly impacts stage 1 to stage 2 conversion (r=0.68).', team: 'Sales', status: 'approved', reviewedBy: 'Sarah Chen', reviewedDate: '2026-02-16' },
    { id: 'li59', statement: 'Influencer partnership ROI was difficult to attribute and measurement framework needs refinement.', team: 'Marketing', status: 'approved', reviewedBy: 'Marcus Rodriguez', reviewedDate: '2026-02-16' },
    { id: 'li60', statement: 'New logo acquisition cost trending upward but insufficient data points to confirm trend significance.', team: 'Sales', status: 'approved', reviewedBy: 'Sarah Chen', reviewedDate: '2026-02-16' },
    { id: 'li61', statement: 'Partner ecosystem contribution to pipeline was estimated at 15% but tracking methodology was inconsistent.', team: 'Sales', status: 'approved', reviewedBy: 'Marcus Rodriguez', reviewedDate: '2026-02-16' },
    { id: 'li62', statement: 'Event marketing budget allocation analysis had incomplete cost data for several major events.', team: 'Marketing', status: 'approved', reviewedBy: 'Lisa Wang', reviewedDate: '2026-02-16' },
    { id: 'li63', statement: 'Regional sales performance variance analysis lacked normalization for territory size and market potential.', team: 'Sales', status: 'declined', reviewedBy: 'Sarah Chen', reviewedDate: '2026-02-16' },
    { id: 'li64', statement: 'Social media engagement metrics showed inconsistent tracking across platforms, invalidating cross-platform comparison.', team: 'Marketing', status: 'declined', reviewedBy: 'Marcus Rodriguez', reviewedDate: '2026-02-16' },
    { id: 'li65', statement: 'Pricing sensitivity analysis relied on hypothetical survey responses rather than actual purchasing behavior.', team: 'Sales', status: 'declined', reviewedBy: 'Lisa Wang', reviewedDate: '2026-02-16' },
  ],
};

// History Summary Panel Component
function HistorySummaryPanel({
  historyItem,
  onBack
}: {
  historyItem: ProcessedUpload;
  onBack: () => void;
}) {
  const linkedInsights = mockLinkedInsights[historyItem.queueId] || [];
  const approvedInsights = linkedInsights.filter((i) => i.status === 'approved');
  const declinedInsights = linkedInsights.filter((i) => i.status === 'declined');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronDown className="w-4 h-4 rotate-90" />
          Back to History
        </button>
        <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 font-mono">
          {historyItem.queueId}
        </Badge>
      </div>

      <Card className="p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
            <CheckCheck className="w-6 h-6 text-green-700" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-1">Upload Complete</h3>
            <p className="text-gray-600">
              Processed on {new Date(historyItem.uploadDate).toLocaleDateString()} by{' '}
              {historyItem.uploadedBy}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
              <FileCheck className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{historyItem.insightsGenerated}</p>
            <p className="text-sm text-gray-600 mt-1">Insights Generated</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
              <CheckCheck className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-700">{historyItem.insightsApproved}</p>
            <p className="text-sm text-gray-600 mt-1">Approved & Published</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <XCircle className="w-8 h-8 text-gray-500" />
            </div>
            <p className="text-3xl font-bold text-gray-600">{historyItem.insightsDeclined}</p>
            <p className="text-sm text-gray-600 mt-1">Declined</p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Approval Rate</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Successfully processed and published
              </p>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {Math.round(
                (historyItem.insightsApproved / historyItem.insightsGenerated) * 100
              )}
              %
            </p>
          </div>
          <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{
                width: `${(historyItem.insightsApproved / historyItem.insightsGenerated) * 100}%`
              }}
            />
          </div>
        </div>
      </Card>

      {/* Linked Insights - Approved */}
      {approvedInsights.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Approved Insights ({approvedInsights.length})
          </h3>
          <div className="space-y-3">
            {approvedInsights.map((insight) => (
              <Card key={insight.id} className="p-4 border-l-4 border-l-green-500">
                <p className="text-sm text-gray-900 mb-2">{insight.statement}</p>
                <div className="flex items-center gap-3 flex-wrap text-xs text-gray-500">
                  <Badge variant="secondary" className="text-xs">{insight.team}</Badge>
                  <span>Reviewed by {insight.reviewedBy}</span>
                  <span>{new Date(insight.reviewedDate).toLocaleDateString()}</span>
                  <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-green-200">
                    Approved
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Linked Insights - Declined */}
      {declinedInsights.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-gray-500" />
            Declined Insights ({declinedInsights.length})
          </h3>
          <div className="space-y-3">
            {declinedInsights.map((insight) => (
              <Card key={insight.id} className="p-4 border-l-4 border-l-gray-300 opacity-75">
                <p className="text-sm text-gray-700 mb-2">{insight.statement}</p>
                <div className="flex items-center gap-3 flex-wrap text-xs text-gray-500">
                  <Badge variant="secondary" className="text-xs">{insight.team}</Badge>
                  <span>Reviewed by {insight.reviewedBy}</span>
                  <span>{new Date(insight.reviewedDate).toLocaleDateString()}</span>
                  <Badge variant="secondary" className="text-xs bg-red-50 text-red-700 border-red-200">
                    Declined
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Manual Insight Form Component (inline version of ManualEntry)
interface DataPointEntry {
  id: string;
  value: string;
  source: string;
}

function ManualInsightForm() {
  const [insightText, setInsightText] = useState('');
  const [dataPoints, setDataPoints] = useState<DataPointEntry[]>([
    { id: '1', value: '', source: '' }
  ]);
  const [footnote, setFootnote] = useState('');
  const [team, setTeam] = useState('');
  const [sourceType, setSourceType] = useState('');
  const [expiration, setExpiration] = useState('');
  const [analysisStart, setAnalysisStart] = useState('');
  const [analysisEnd, setAnalysisEnd] = useState('');
  const [sharingLevel, setSharingLevel] = useState('');
  const [manualFiles, setManualFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showManualSuccess, setShowManualSuccess] = useState(false);
  const manualFileRef = useRef<HTMLInputElement>(null);
  const [customFields, setCustomFields] = useState<{ label: string; value: string }[]>([]);

  const handleAddDataPoint = () => {
    setDataPoints((prev) => [
      ...prev,
      { id: String(Date.now()), value: '', source: '' }
    ]);
  };

  const handleRemoveDataPoint = (id: string) => {
    if (dataPoints.length > 1) {
      setDataPoints((prev) => prev.filter((dp) => dp.id !== id));
    }
  };

  const handleDataPointChange = (id: string, field: 'value' | 'source', val: string) => {
    setDataPoints((prev) =>
      prev.map((dp) => (dp.id === id ? { ...dp, [field]: val } : dp))
    );
  };

  const handleAddCustomField = () => {
    setCustomFields((prev) => [...prev, { label: '', value: '' }]);
  };

  const handleRemoveCustomField = (index: number) => {
    setCustomFields((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCustomFieldChange = (index: number, field: 'label' | 'value', val: string) => {
    setCustomFields((prev) =>
      prev.map((cf, i) => (i === index ? { ...cf, [field]: val } : cf))
    );
  };

  const handleManualFileSelect = (files: FileList | null) => {
    if (!files) return;
    const newFiles: UploadedFile[] = Array.from(files).map((f) => ({
      name: f.name,
      size: f.size,
      type: f.type
    }));
    setManualFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveManualFile = (index: number) => {
    setManualFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleManualFileSelect(e.dataTransfer.files);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return 'PDF';
    if (type.includes('word') || type.includes('document')) return 'DOC';
    if (type.includes('spreadsheet') || type.includes('excel') || type.includes('csv')) return 'XLS';
    if (type.includes('presentation') || type.includes('powerpoint')) return 'PPT';
    return 'FILE';
  };

  const canSubmit =
    insightText.trim().length > 0 &&
    dataPoints.some((dp) => dp.value.trim().length > 0) &&
    team.length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setShowManualSuccess(true);
      toast.success('Insight submitted for review!', {
        description: 'Your manually entered insight has been sent for validation.'
      });

      setTimeout(() => {
        setInsightText('');
        setDataPoints([{ id: '1', value: '', source: '' }]);
        setFootnote('');
        setTeam('');
        setSourceType('');
        setExpiration('');
        setAnalysisStart('');
        setAnalysisEnd('');
        setSharingLevel('');
        setManualFiles([]);
        setCustomFields([]);
        setShowManualSuccess(false);
      }, 3000);
    }, 1200);
  };

  if (showManualSuccess) {
    return (
      <Card className="p-12 text-center">
        <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Insight Submitted!</h2>
            <p className="text-gray-600 mb-4">
              Your manually entered insight has been sent for validation and approval.
            </p>
            <p className="text-sm text-gray-500">
              You can track it in the Approval Review Queue tab.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Insight Statement */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold text-gray-900">Insight Statement</h2>
          <Badge variant="secondary" className="text-xs bg-red-50 text-red-700 border-red-200">
            Required
          </Badge>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Enter your insight as a clear, concise statement. Include the key finding and its
          business implication.
        </p>
        <Textarea
          placeholder="e.g., Enterprise customers who complete onboarding within 7 days show 40% higher retention at 12 months compared to those who take longer, suggesting accelerated onboarding drives long-term engagement."
          value={insightText}
          onChange={(e) => setInsightText(e.target.value)}
          className="min-h-[120px]"
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-500">
            Tip: A strong insight statement combines an observation with its implication.
          </p>
          <span className="text-xs text-gray-400">{insightText.length} characters</span>
        </div>
      </Card>

      {/* Data Points */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-gray-900">Supporting Data Points</h2>
            <Badge variant="secondary" className="text-xs bg-red-50 text-red-700 border-red-200">
              At least 1 required
            </Badge>
          </div>
          <Button variant="outline" size="sm" onClick={handleAddDataPoint} className="gap-1">
            <Plus className="w-4 h-4" />
            Add Data Point
          </Button>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Add specific metrics, statistics, or evidence that support your insight.
        </p>

        <div className="space-y-4">
          {dataPoints.map((dp, index) => (
            <div key={dp.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">
                  Data Point {index + 1}
                </span>
                {dataPoints.length > 1 && (
                  <button
                    onClick={() => handleRemoveDataPoint(dp.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-gray-600 mb-1">Value / Metric</Label>
                  <Input
                    placeholder="e.g., 40% higher retention rate at 12 months"
                    value={dp.value}
                    onChange={(e) => handleDataPointChange(dp.id, 'value', e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600 mb-1">Source (optional)</Label>
                  <Input
                    placeholder="e.g., Customer cohort analysis Q4 2025"
                    value={dp.source}
                    onChange={(e) => handleDataPointChange(dp.id, 'source', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Source & Citation */}
      <Card className="p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Source & Citation</h2>
        <div>
          <Label className="text-sm text-gray-700 mb-1">Footnote / Citation</Label>
          <Textarea
            placeholder="Provide source details, page references, methodology notes, or other citation information..."
            value={footnote}
            onChange={(e) => setFootnote(e.target.value)}
            className="min-h-[80px]"
          />
        </div>
      </Card>

      {/* Document Upload */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Upload className="w-5 h-5 text-gray-700" />
          <h2 className="font-semibold text-gray-900">Attach Supporting Documents</h2>
          <Badge variant="secondary" className="text-xs">
            Optional
          </Badge>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Upload research reports, presentations, or data files that support this insight. These
          will be linked for source traceability.
        </p>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => manualFileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
        >
          <input
            ref={manualFileRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.txt"
            onChange={(e) => handleManualFileSelect(e.target.files)}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <Upload className="w-6 h-6 text-gray-500" />
            </div>
            <p className="text-sm font-medium text-gray-700">
              {isDragging ? 'Drop files here' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-gray-500">
              PDF, DOC, PPT, XLS, CSV, TXT (max 50MB per file)
            </p>
          </div>
        </div>

        {manualFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Attached files ({manualFiles.length})
            </p>
            {manualFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-blue-600">
                    {getFileIcon(file.type)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                <button
                  onClick={() => handleRemoveManualFile(index)}
                  className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Metadata */}
      <Card className="p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Classification & Metadata</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm text-gray-700 mb-1">
              Team <span className="text-red-500">*</span>
            </Label>
            <Select value={team} onValueChange={setTeam}>
              <SelectTrigger>
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Strategy">Strategy</SelectItem>
                <SelectItem value="Product">Product</SelectItem>
                <SelectItem value="UX Research">UX Research</SelectItem>
                <SelectItem value="Data Science">Data Science</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
                <SelectItem value="Customer Success">Customer Success</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm text-gray-700 mb-1">Source Type</Label>
            <Select value={sourceType} onValueChange={setSourceType}>
              <SelectTrigger>
                <SelectValue placeholder="Select source type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="document">Document / Report</SelectItem>
                <SelectItem value="dashboard">Dashboard / Analytics</SelectItem>
                <SelectItem value="manual">Manual Observation</SelectItem>
                <SelectItem value="api">API / Automated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm text-gray-700 mb-1">Sharing Level</Label>
            <Select value={sharingLevel} onValueChange={setSharingLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Select sharing level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="internal">Internal Only</SelectItem>
                <SelectItem value="controlled">Controlled Distribution</SelectItem>
                <SelectItem value="public">Public</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm text-gray-700 mb-1">Expiration Date</Label>
            <Input
              type="date"
              value={expiration}
              onChange={(e) => setExpiration(e.target.value)}
            />
          </div>

          <div>
            <Label className="text-sm text-gray-700 mb-1">Analysis Timeframe Start</Label>
            <Input
              type="date"
              value={analysisStart}
              onChange={(e) => setAnalysisStart(e.target.value)}
            />
          </div>

          <div>
            <Label className="text-sm text-gray-700 mb-1">Analysis Timeframe End</Label>
            <Input
              type="date"
              value={analysisEnd}
              onChange={(e) => setAnalysisEnd(e.target.value)}
            />
          </div>
        </div>

        {customFields.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-3">Custom Metadata Fields</p>
            <div className="space-y-3">
              {customFields.map((cf, index) => (
                <div key={index} className="flex items-end gap-3">
                  <div className="flex-1">
                    <Label className="text-xs text-gray-600 mb-1">Field Name</Label>
                    <Input
                      placeholder="e.g., Product Line"
                      value={cf.label}
                      onChange={(e) => handleCustomFieldChange(index, 'label', e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs text-gray-600 mb-1">Value</Label>
                    <Input
                      placeholder="e.g., Enterprise Suite"
                      value={cf.value}
                      onChange={(e) => handleCustomFieldChange(index, 'value', e.target.value)}
                    />
                  </div>
                  <button
                    onClick={() => handleRemoveCustomField(index)}
                    className="text-gray-400 hover:text-red-500 transition-colors pb-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={handleAddCustomField}
          className="mt-4 gap-1"
        >
          <Plus className="w-4 h-4" />
          Add Custom Field
        </Button>
      </Card>

      {/* AI Transparency Notice */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
        <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800">Source Traceability Notice</p>
          <p className="text-xs text-amber-700 mt-1">
            This insight will be tagged as <strong>manually entered</strong> for full
            transparency. Attached documents will be linked as supporting sources. The insight
            will go through the standard human-in-the-loop validation and approval workflow
            before publication.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 pb-8">
        <Button
          variant="outline"
          onClick={() => {
            toast.info('Draft saved', {
              description: 'You can return to finish this entry later.'
            });
          }}
        >
          Save as Draft
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Submit for Review
            </>
          )}
        </Button>
      </div>
    </div>
  );
}