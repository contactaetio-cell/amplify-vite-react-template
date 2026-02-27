import { useRef, useState, DragEvent, ChangeEvent } from 'react';
import { StepProgress } from '../../components/StepProgress';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { FileText, ArrowRight } from 'lucide-react';

interface UploadStageProps {
  onContinue: (file: File) => void;
}

const steps = ['Upload', 'Extraction', 'Validation', 'Publish'];

export function UploadStage({ onContinue }: UploadStageProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const formatFileSize = (sizeInBytes: number) => {
    if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    }
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileSelection = (file: File | null) => {
    setSelectedFile(file);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0] ?? null;
    handleFileSelection(file);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    handleFileSelection(file);
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="max-w-6xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Upload</h1>
          <p className="text-gray-600">Upload your source document to start processing.</p>
          <p className="text-gray-500 italic mt-1">
            If you leave during this process, your files &amp; changes will be lost
          </p>
        </div>

        <StepProgress steps={steps} currentStep={0} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Upload Source</h2>
              <div
                className={`flex items-center gap-4 rounded-lg border p-4 transition-colors cursor-pointer ${
                  isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  {selectedFile ? (
                    <>
                      <h3 className="font-medium text-gray-900">{selectedFile.name}</h3>
                      <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                    </>
                  ) : (
                    <>
                      <h3 className="font-medium text-gray-900">Drag and drop a file here</h3>
                      <p className="text-sm text-gray-500">or click to browse from your device</p>
                    </>
                  )}
                </div>
                <Badge
                  variant="secondary"
                  className={selectedFile ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-700'}
                >
                  {selectedFile ? 'Ready' : 'No file'}
                </Badge>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleInputChange}
              />
            </Card>

            <div className="mt-4">
              <Button
                onClick={() => {
                  if (!selectedFile) return;
                  onContinue(selectedFile);
                }}
                disabled={!selectedFile}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Continue to Extraction
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          <Card className="p-6">
            <h3 className="font-medium text-gray-900 mb-4">Upload Queue</h3>
            <div className="p-4 rounded-lg bg-blue-50">
              <div className="text-2xl font-semibold text-blue-700 mb-1">
                {selectedFile ? '1' : '0'}
              </div>
              <div className="text-sm text-gray-600">File selected for processing</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
