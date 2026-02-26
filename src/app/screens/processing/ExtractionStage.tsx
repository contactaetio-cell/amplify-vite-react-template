import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { Insight } from '../../data/mockData';
import { uploadExtractionFileToS3 } from '../../api/storage';

interface ExtractionStageProps {
  selectedFile?: File | null;
  onContinue: () => void;
}

async function runExtractionPipeline(file: File): Promise<Insight[]> {
  const { path: s3Path, url: s3Url } = await uploadExtractionFileToS3(file);

  // TODO(backend): Send `s3Url` to the `extractInsights` function once implemented.
  // Example shape:
  // const extractedInsights = await extractInsights({ s3Url });

  // TODO(frontend): Return/map `extractedInsights` to Insight[] and store in UI state.
  void s3Path;
  void s3Url;
  return [];
}

export function ExtractionStage({ selectedFile = null, onContinue }: ExtractionStageProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const hasNavigatedRef = useRef(false);

  useEffect(() => {
    hasNavigatedRef.current = false;

    if (!selectedFile) {
      setInsights([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    runExtractionPipeline(selectedFile)
      .then((nextInsights) => {
        setInsights(nextInsights);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [selectedFile]);

  useEffect(() => {
    if (!selectedFile || isLoading || hasNavigatedRef.current) return;
    hasNavigatedRef.current = true;
    onContinue();
  }, [selectedFile, isLoading, onContinue]);

  if (!selectedFile) {
    return (
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="max-w-6xl mx-auto p-8">
          <div className="rounded-xl border border-gray-200 bg-white p-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Extraction</h1>
            <p className="text-gray-600">
              No file found from Upload stage. Go back and upload a file first.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="max-w-6xl mx-auto p-8">
        <div className="rounded-xl border border-gray-200 bg-white p-8 flex items-center gap-4">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Extraction</h1>
            <p className="text-gray-600">
              {isLoading
                ? 'Thinking... this might take a minute or two.'
                : `Extracted ${insights.length} insights. Moving to validation...`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
