import { ProcessingStagePage } from './ProcessingStagePage';

interface StructuringStageProps {
  onContinue: () => void;
}

export function StructuringStage({ onContinue }: StructuringStageProps) {
  return (
    <ProcessingStagePage
      currentStep={2}
      title="Structuring"
      description="Extracted insights are normalized into the platform schema."
      statusLabel="Structuring complete"
      summaryTitle="Structured Records"
      summaryValue="45"
      summaryCaption="Metadata fields prepared"
      actionLabel="Continue to Validation"
      onContinue={onContinue}
    />
  );
}
