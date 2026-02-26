import { StepProgress } from '../../components/StepProgress';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { ArrowRight } from 'lucide-react';

const steps = ['Upload', 'Extraction', 'Structuring', 'Validation', 'Publish'];

interface ProcessingStagePageProps {
  currentStep: number;
  title: string;
  description: string;
  statusLabel: string;
  summaryTitle: string;
  summaryValue: string;
  summaryCaption: string;
  actionLabel: string;
  actionDisabled?: boolean;
  onContinue: () => void;
}

export function ProcessingStagePage({
  currentStep,
  title,
  description,
  statusLabel,
  summaryTitle,
  summaryValue,
  summaryCaption,
  actionLabel,
  actionDisabled = false,
  onContinue,
}: ProcessingStagePageProps) {
  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="max-w-6xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-600">{description}</p>
        </div>

        <StepProgress steps={steps} currentStep={currentStep} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Pipeline Status</h2>
              <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                {statusLabel}
              </Badge>
            </div>
            <p className="text-gray-700 mb-6">
              This stage is ready. Continue to move this source through the processing workflow.
            </p>
            <Button
              onClick={onContinue}
              disabled={actionDisabled}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {actionLabel}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Card>

          <Card className="p-6">
            <h3 className="font-medium text-gray-900 mb-4">{summaryTitle}</h3>
            <div className="p-4 rounded-lg bg-blue-50">
              <div className="text-2xl font-semibold text-blue-700 mb-1">{summaryValue}</div>
              <div className="text-sm text-gray-600">{summaryCaption}</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
