import { useState, useEffect } from 'react';
import { StepProgress } from '../components/StepProgress';
import { Progress } from '../components/ui/progress';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';

interface UploadProgressProps {
  onContinue: () => void;
}

const steps = ['Upload', 'Extraction', 'Structuring', 'Validation', 'Publish'];

export function UploadProgress({ onContinue }: UploadProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [extractedInsights, setExtractedInsights] = useState(0);
  const [metadataTags, setMetadataTags] = useState(0);

  useEffect(() => {
    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentStep]);

  useEffect(() => {
    if (progress === 100 && currentStep < 2) {
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setProgress(0);
        if (currentStep === 0) setExtractedInsights(12);
        if (currentStep === 1) setMetadataTags(45);
      }, 500);
    }
  }, [progress, currentStep]);

  const activityLog = [
    { time: '14:23:45', message: 'File uploaded successfully', type: 'success' },
    { time: '14:23:47', message: 'Starting text extraction...', type: 'info' },
    { time: '14:23:52', message: 'Extracted 4 potential insights', type: 'success' },
    { time: '14:23:54', message: 'Analyzing content structure...', type: 'info' },
    { time: '14:23:58', message: 'Generated 12 metadata tags', type: 'success' },
    { time: '14:24:01', message: 'Ready for review', type: 'warning' }
  ];

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="max-w-6xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Upload & Extraction</h1>
          <p className="text-gray-600">Your original analysis remains linked and auditable throughout the process</p>
        </div>
        
        <StepProgress steps={steps} currentStep={currentStep} />
        
        <div className="grid grid-cols-3 gap-6 mt-8">
          <div className="col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Enterprise_Security_Research_2026.pdf</h3>
                  <p className="text-sm text-gray-500">4.2 MB • 45 pages</p>
                </div>
                <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                  Processing
                </Badge>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-700 font-medium">
                      {currentStep === 0 ? 'Uploading...' : 
                       currentStep === 1 ? 'Extracting insights...' : 
                       'Structuring data...'}
                    </span>
                    <span className="text-gray-600">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-medium text-gray-900 mb-4">Extraction Summary</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-semibold text-blue-700 mb-1">
                    {extractedInsights}
                  </div>
                  <div className="text-sm text-gray-600">Insights Detected</div>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-semibold text-green-700 mb-1">
                    {metadataTags}
                  </div>
                  <div className="text-sm text-gray-600">Metadata Tags</div>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-semibold text-purple-700 mb-1">
                    87%
                  </div>
                  <div className="text-sm text-gray-600">Avg. Confidence</div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-semibold text-gray-700 mb-1">
                    0
                  </div>
                  <div className="text-sm text-gray-600">Warnings</div>
                </div>
              </div>
              
              {currentStep >= 2 && (
                <div className="mt-6 flex justify-end">
                  <Button onClick={onContinue} className="bg-blue-600 hover:bg-blue-700">
                    Review Extracted Insights
                  </Button>
                </div>
              )}
            </Card>
          </div>
          
          <div className="col-span-1">
            <Card className="p-6">
              <h3 className="font-medium text-gray-900 mb-4">Activity Log</h3>
              
              <div className="space-y-3">
                {activityLog.map((log, index) => (
                  <div key={index} className="flex gap-3 text-sm">
                    <span className="text-gray-500 font-mono text-xs whitespace-nowrap">
                      {log.time}
                    </span>
                    <div className="flex items-start gap-2 flex-1">
                      {log.type === 'success' && (
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      )}
                      {log.type === 'warning' && (
                        <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      )}
                      <span className="text-gray-700">{log.message}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}