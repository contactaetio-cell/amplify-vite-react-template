import { useEffect, useRef, useState } from 'react';
import type { ComponentType, Dispatch, SetStateAction } from 'react';
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
  FileCheck,
  FileText,
  Globe,
  Lock,
  Upload as UploadIcon,
  Users,
  Upload,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { UploadedFile, UploadMode } from './types';
import { uploadExtractionFileToS3 } from '../../api/storage';
import { generateInsights } from '../../api/insights';
import type { Insight } from '../../data/mockData';
import { fetchUserAttributes, getCurrentUser } from "aws-amplify/auth";

type UserInfoPayload = {
  full_name?: string;
  email_address?: string;
};

type ExtractionInput = {
  contextFiles: File[];
  outputFiles: File[];
  rawDataFiles: File[];
};

type ResearchDetailsInput = {
  researchObjective: string;
  methodology: string;
  additionalContext: string;
  analysisStartDate: string;
  analysisEndDate: string;
  owner: string;
  relatedProjects: string;
  approvalStatus?: ApprovalStatus;
  sharingScope?: SharingScope;
};

async function runExtractionPipeline(
  id: string,
  userInfo: UserInfoPayload | undefined,
  input: ExtractionInput,
  uploadMode: UploadMode,
  researchDetails: ResearchDetailsInput
): Promise<Insight[]> {
  if (!id) return [];

  const [contextUrls, outputUrls, rawDataUrls] = await Promise.all([
    uploadExtractionFileToS3(id, input.contextFiles),
    uploadExtractionFileToS3(id, input.outputFiles),
    uploadExtractionFileToS3(id, input.rawDataFiles)
  ]);
  await generateInsights({
    userId: id,
    user_info: userInfo,
    uploadMode,
    ...researchDetails,
    contextUrls,
    outputUrls,
    rawDataUrls
  });
  void contextUrls;
  void outputUrls;
  void rawDataUrls;
  return [];
}

interface UploadResearchTabProps {
  onSubmissionComplete?: () => void | Promise<void>;
}

type ApprovalStatus =
  | 'pending'
  | 'approved_pr'
  | 'approved_legal'
  | 'approved_both'
  | 'not_required';

type SharingScope =
  | 'internal_restricted'
  | 'internal_all'
  | 'external_restricted'
  | 'public';

const DEFAULT_RELATED_PROJECTS = '';
const DEFAULT_RESEARCH_OBJECTIVE = '';
const DEFAULT_METHODOLOGY = '';
const DEFAULT_ANALYSIS_START = '';
const DEFAULT_ANALYSIS_END = '';
const DEFAULT_OWNER = '';
const DEFAULT_APPROVAL_STATUS: ApprovalStatus | undefined = undefined;
const DEFAULT_SHARING_SCOPE: SharingScope | undefined = undefined;

const approvalStatusOptions: Array<{ value: ApprovalStatus; label: string }> = [
  { value: 'pending', label: 'Pending Approval' },
  { value: 'approved_pr', label: 'Approved by PR' },
  { value: 'approved_legal', label: 'Approved by Legal' },
  { value: 'approved_both', label: 'Approved by PR & Legal' },
  { value: 'not_required', label: 'Approval Not Required' }
];

const sharingScopeOptions: Array<{
  value: SharingScope;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  {
    value: 'internal_restricted',
    title: 'Internal - Restricted',
    description: 'Limited team access only',
    icon: Lock
  },
  {
    value: 'internal_all',
    title: 'Internal - All',
    description: 'All internal employees',
    icon: Users
  },
  {
    value: 'external_restricted',
    title: 'External - Restricted',
    description: 'Specific external partners',
    icon: Users
  },
  {
    value: 'public',
    title: 'Public Sharing',
    description: 'Publicly accessible',
    icon: Globe
  }
];

export function UploadResearchTab({ onSubmissionComplete }: UploadResearchTabProps) {
  const uploadMode: UploadMode = 'document';
  const [additionalContext, setAdditionalContext] = useState('');
  const [analysisStart, setAnalysisStart] = useState(DEFAULT_ANALYSIS_START);
  const [analysisEnd, setAnalysisEnd] = useState(DEFAULT_ANALYSIS_END);
  const [owner, setOwner] = useState(DEFAULT_OWNER);
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus | undefined>(DEFAULT_APPROVAL_STATUS);
  const [sharingScope, setSharingScope] = useState<SharingScope | undefined>(DEFAULT_SHARING_SCOPE);
  const [relatedProjects, setRelatedProjects] = useState(DEFAULT_RELATED_PROJECTS);
  const [researchObjective, setResearchObjective] = useState(DEFAULT_RESEARCH_OBJECTIVE);
  const [methodology, setMethodology] = useState(DEFAULT_METHODOLOGY);

  const [contextFiles, setContextFiles] = useState<UploadedFile[]>([]);
  const [outputFiles, setOutputFiles] = useState<UploadedFile[]>([]);
  const [rawDataFiles, setRawDataFiles] = useState<UploadedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [generatedQueueId, setGeneratedQueueId] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfoPayload | undefined>(undefined);

  const contextFileRef = useRef<HTMLInputElement>(null);
  const outputFileRef = useRef<HTMLInputElement>(null);
  const rawDataFileRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    async function loadUser() {
      const user = await getCurrentUser();
      setUserId(user.userId);
      const attributes = await fetchUserAttributes();
      setUserInfo({
        full_name: attributes.name ?? attributes.preferred_username ?? undefined,
        email_address: attributes.email ?? undefined,
      });
    }

    loadUser();
  }, []);
  const handleFileSelect = (
    files: FileList | null,
    setter: Dispatch<SetStateAction<UploadedFile[]>>
  ) => {
    if (!files) return;
    const newFiles: UploadedFile[] = Array.from(files).map((f) => ({
      name: f.name,
      size: f.size,
      type: f.type,
      file: f
    }));
    setter((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (
    index: number,
    setter: Dispatch<SetStateAction<UploadedFile[]>>
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

  const canSubmit =
    outputFiles.length > 0 &&
    owner.trim().length > 0 &&
    researchObjective.trim().length > 0 &&
    methodology.trim().length > 0 &&
    analysisStart.trim().length > 0 &&
    analysisEnd.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit || !userId) return;
    setIsSubmitting(true);
    setShowSuccess(false);
    setGeneratedQueueId('');
    let submissionSucceeded = false;

    try {
      const contextUploadFiles = contextFiles
        .map((file) => file.file)
        .filter((file): file is File => Boolean(file));
      const outputUploadFiles = outputFiles
        .map((file) => file.file)
        .filter((file): file is File => Boolean(file));
      const rawUploadFiles = rawDataFiles
        .map((file) => file.file)
        .filter((file): file is File => Boolean(file));

      if (outputUploadFiles.length === 0) {
        throw new Error('Please reselect your output files and try again.');
      }

      await runExtractionPipeline(
        userId,
        userInfo,
        {
          contextFiles: contextUploadFiles,
          outputFiles: outputUploadFiles,
          rawDataFiles: rawUploadFiles
        },
        uploadMode,
        {
          researchObjective,
          methodology,
          additionalContext,
          analysisStartDate: analysisStart,
          analysisEndDate: analysisEnd,
          owner,
          relatedProjects,
          approvalStatus,
          sharingScope
        }
      );
      submissionSucceeded = true;

      const queueId = `QUEUE-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

      setTimeout(() => {
        if (onSubmissionComplete) {
          void onSubmissionComplete();
        }
        setIsSubmitting(false);
        setShowSuccess(true);
        setGeneratedQueueId(queueId);

        toast.success('Research submitted successfully!', {
          description: `Queue ID: ${queueId}`
        });

        setTimeout(() => {
          setAdditionalContext('');
          setAnalysisStart(DEFAULT_ANALYSIS_START);
          setAnalysisEnd(DEFAULT_ANALYSIS_END);
          setOwner(DEFAULT_OWNER);
          setApprovalStatus(DEFAULT_APPROVAL_STATUS);
          setSharingScope(DEFAULT_SHARING_SCOPE);
          setRelatedProjects('');
          setResearchObjective(DEFAULT_RESEARCH_OBJECTIVE);
          setMethodology(DEFAULT_METHODOLOGY);
          setContextFiles([]);
          setOutputFiles([]);
          setRawDataFiles([]);
          setShowSuccess(false);
          setGeneratedQueueId('');
        }, 3000);
      }, 1500);
    } catch (error) {
      toast.error('Extraction failed', {
        description: error instanceof Error ? error.message : 'Please try again.'
      });
    } finally {
      if (!submissionSucceeded) {
        setIsSubmitting(false);
      }
    }
  };

  const renderFileList = (
    files: UploadedFile[],
    setter: Dispatch<SetStateAction<UploadedFile[]>>
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

  return (
    <div className="max-w-5xl mx-auto">
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
        <form
          className="space-y-6"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit();
          }}
        >
          <Card className="p-6">
            <div className="space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label htmlFor="researchObjective" className="font-medium text-gray-900">
                    Research Objective
                  </Label>
                  <Badge variant="secondary" className="text-xs bg-red-50 text-red-700 border-red-200">
                    Required
                  </Badge>
                </div>
                <Textarea
                  id="researchObjective"
                  placeholder="What was the goal of this research? (e.g., Identify conversion rate drivers across acquisition channels)"
                  value={researchObjective}
                  onChange={(event) => setResearchObjective(event.target.value)}
                  className="min-h-[80px]"
                  required
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label className="font-medium text-gray-900">Context Documents</Label>
                  <Badge variant="secondary" className="text-xs">
                    Optional
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Supporting documents like research briefs, methodology notes, or background materials
                </p>
                <input
                  ref={contextFileRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(event) => handleFileSelect(event.target.files, setContextFiles)}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => contextFileRef.current?.click()}
                  className="w-full py-6 border-dashed hover:bg-gray-50"
                >
                  <div className="flex flex-col items-center gap-2">
                    <UploadIcon className="w-5 h-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Click to upload context documents</span>
                    <span className="text-xs text-gray-500">PDF, DOC, TXT</span>
                  </div>
                </Button>
                {renderFileList(contextFiles, setContextFiles)}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label htmlFor="methodology" className="font-medium text-gray-900">
                    Methodology
                  </Label>
                  <Badge variant="secondary" className="text-xs bg-red-50 text-red-700 border-red-200">
                    Required
                  </Badge>
                </div>
                <Textarea
                  id="methodology"
                  placeholder="Describe the research approach (e.g., Cohort analysis of 342 accounts over 90 days, segmented by channel)"
                  value={methodology}
                  onChange={(event) => setMethodology(event.target.value)}
                  className="min-h-[80px]"
                  required
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Label className="font-medium text-gray-900">Research Output</Label>
              <Badge variant="secondary" className="text-xs bg-red-50 text-red-700 border-red-200">
                Required
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Upload your research findings, reports, presentations, or analysis documents
            </p>
            <input
              ref={outputFileRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv"
              onChange={(event) => handleFileSelect(event.target.files, setOutputFiles)}
              className="hidden"
            />
            <Button
              variant="outline"
              type="button"
              onClick={() => outputFileRef.current?.click()}
              className="w-full py-8 border-2 border-dashed hover:bg-gray-50"
            >
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-6 h-6 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Click to upload research output files</span>
                <span className="text-xs text-gray-500">PDF, DOC, PPT, XLS, CSV (max 100MB per file)</span>
              </div>
            </Button>
            {renderFileList(outputFiles, setOutputFiles)}
          </Card>

          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Additional Details</h2>
              <p className="text-sm text-gray-600">Provide additional context and project information</p>
            </div>

            <div className="space-y-5">
              <div>
                <Label htmlFor="researchContext" className="font-medium text-gray-900 mb-2 block">
                  Additional Context
                </Label>
                <Textarea
                  id="researchContext"
                  placeholder="Any other relevant background, key questions, or contextual information..."
                  value={additionalContext}
                  onChange={(event) => setAdditionalContext(event.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="analysisStartDate" className="font-medium text-gray-900">
                      Analysis Start Date
                    </Label>
                    <Badge variant="secondary" className="text-xs bg-red-50 text-red-700 border-red-200">
                      Required
                    </Badge>
                  </div>
                  <Input
                    id="analysisStartDate"
                    type="date"
                    value={analysisStart}
                    onChange={(event) => setAnalysisStart(event.target.value)}
                    required
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="analysisEndDate" className="font-medium text-gray-900">
                      Analysis End Date
                    </Label>
                    <Badge variant="secondary" className="text-xs bg-red-50 text-red-700 border-red-200">
                      Required
                    </Badge>
                  </div>
                  <Input
                    id="analysisEndDate"
                    type="date"
                    value={analysisEnd}
                    onChange={(event) => setAnalysisEnd(event.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label htmlFor="owner" className="font-medium text-gray-900">
                    Owner
                  </Label>
                  <Badge variant="secondary" className="text-xs bg-red-50 text-red-700 border-red-200">
                    Required
                  </Badge>
                </div>
                <Input
                  id="owner"
                  placeholder="Research owner or primary contact"
                  value={owner}
                  onChange={(event) => setOwner(event.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="relatedProjects" className="font-medium text-gray-900 mb-2 block">
                  Related Projects
                </Label>
                <Input
                  id="relatedProjects"
                  placeholder="Project names or IDs (comma-separated)"
                  value={relatedProjects}
                  onChange={(event) => setRelatedProjects(event.target.value)}
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Sharing & Approval</h2>
              <p className="text-sm text-gray-600">Configure access permissions and approval requirements</p>
            </div>

            <div className="space-y-5">
              <div>
                <Label htmlFor="sharingApprovalStatus" className="font-medium text-gray-900 mb-2 block">
                  Approval Status
                </Label>
                <Select
                  value={approvalStatus}
                  onValueChange={(value) => setApprovalStatus(value as ApprovalStatus)}
                >
                  <SelectTrigger id="sharingApprovalStatus">
                    <SelectValue placeholder="Select approval status" />
                  </SelectTrigger>
                  <SelectContent>
                    {approvalStatusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sharingApprovalScope" className="font-medium text-gray-900 mb-2 block">
                  Sharing Scope
                </Label>
                <Select
                  value={sharingScope}
                  onValueChange={(value) => setSharingScope(value as SharingScope)}
                >
                  <SelectTrigger id="sharingApprovalScope">
                    <SelectValue placeholder="Select sharing scope" />
                  </SelectTrigger>
                  <SelectContent>
                    {sharingScopeOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            <div>
                              <div className="font-medium">{option.title}</div>
                              <div className="text-xs text-gray-500">{option.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Label className="font-medium text-gray-900">Raw Data</Label>
              <Badge variant="secondary" className="text-xs">
                Optional
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Raw datasets, survey responses, or source data files for transparency and traceability
            </p>
            <input
              ref={rawDataFileRef}
              type="file"
              multiple
              accept=".csv,.xlsx,.xls,.json,.txt"
              onChange={(event) => handleFileSelect(event.target.files, setRawDataFiles)}
              className="hidden"
            />
            <Button
              variant="outline"
              type="button"
              onClick={() => rawDataFileRef.current?.click()}
              className="w-full py-6 border-dashed hover:bg-gray-50"
            >
              <div className="flex flex-col items-center gap-2">
                <FileText className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Click to upload raw data files</span>
                <span className="text-xs text-gray-500">CSV, XLSX, JSON, TXT</span>
              </div>
            </Button>
            {renderFileList(rawDataFiles, setRawDataFiles)}
          </Card>

          <div className="flex justify-end pt-4 pb-8">
            <Button
              type="submit"
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
        </form>
      )}
    </div>
  );
}
