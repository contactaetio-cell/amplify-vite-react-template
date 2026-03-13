import { useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Textarea } from '../../components/ui/textarea';
import {
  CheckCircle2,
  FileCheck,
  FileText,
  Paperclip,
  PenLine,
  Upload,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { ManualInsightForm } from './ManualInsightForm';
import { UploadedFile, UploadMode } from './types';
import { uploadExtractionFileToS3 } from '../../api/storage';
import type { Insight } from '../../data/mockData';

type ExtractionInput = {
  contextFiles: File[];
  outputFiles: File[];
  rawDataFiles: File[];
};

async function uploadFilesToS3(files: File[]) {
  return Promise.all(files.map((file) => uploadExtractionFileToS3(file)));
}

async function runExtractionPipeline(input: ExtractionInput): Promise<Insight[]> {
  const [contextUploads, outputUploads, rawUploads] = await Promise.all([
    uploadFilesToS3(input.contextFiles),
    uploadFilesToS3(input.outputFiles),
    uploadFilesToS3(input.rawDataFiles)
  ]);

  // TODO(backend): Send the uploaded URLs to the extraction pipeline.
  // Example shape:
  // const extractedInsights = await extractInsights({
  //   contextUrls: contextUploads.map((u) => u.url),
  //   outputUrls: outputUploads.map((u) => u.url),
  //   rawDataUrls: rawUploads.map((u) => u.url)
  // });

  void contextUploads;
  void outputUploads;
  void rawUploads;
  return [];
}

export function UploadResearchTab() {
  const [uploadMode, setUploadMode] = useState<UploadMode>('document');
  const [researchContext, setResearchContext] = useState('');
  const [contextFiles, setContextFiles] = useState<UploadedFile[]>([]);
  const [outputFiles, setOutputFiles] = useState<UploadedFile[]>([]);
  const [rawDataFiles, setRawDataFiles] = useState<UploadedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [generatedQueueId, setGeneratedQueueId] = useState('');

  const contextFileRef = useRef<HTMLInputElement>(null);
  const outputFileRef = useRef<HTMLInputElement>(null);
  const rawDataFileRef = useRef<HTMLInputElement>(null);

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

  const canSubmit = (researchContext.trim().length > 0 || contextFiles.length > 0) && outputFiles.length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);

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
      setIsSubmitting(false);
      toast.error('Missing upload files', {
        description: 'Please reselect your output files and try again.'
      });
      return;
    }

    try {
      await runExtractionPipeline({
        contextFiles: contextUploadFiles,
        outputFiles: outputUploadFiles,
        rawDataFiles: rawUploadFiles
      });

      const queueId = `QUEUE-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

      setTimeout(() => {
        setIsSubmitting(false);
        setShowSuccess(true);
        setGeneratedQueueId(queueId);

        toast.success('Research submitted successfully!', {
          description: `Queue ID: ${queueId}`
        });

        setTimeout(() => {
          setResearchContext('');
          setContextFiles([]);
          setOutputFiles([]);
          setRawDataFiles([]);
          setShowSuccess(false);
          setGeneratedQueueId('');
        }, 3000);
      }, 1500);
    } catch (error) {
      setIsSubmitting(false);
      toast.error('Extraction failed', {
        description: error instanceof Error ? error.message : 'Please try again.'
      });
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

      {uploadMode === 'document' ? (
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
      ) : (
        <ManualInsightForm />
      )}
    </div>
  );
}
