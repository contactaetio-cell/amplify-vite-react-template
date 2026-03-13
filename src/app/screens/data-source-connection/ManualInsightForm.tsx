import { useRef, useState } from 'react';
import type { DragEvent } from 'react';
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
  Info,
  Plus,
  Sparkles,
  Trash2,
  Upload,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { UploadedFile } from './types';

interface DataPointEntry {
  id: string;
  value: string;
  source: string;
}

export function ManualInsightForm() {
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

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
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
