import { ProcessingStagePage } from './ProcessingStagePage';

interface ValidationStageProps {
  onContinue: () => void;
}

export function ValidationStage({ onContinue }: ValidationStageProps) {
  return (
    <ProcessingStagePage
      currentStep={3}
      title="Validation"
      description="Quality checks run across confidence, traceability, and required fields."
      statusLabel="Validation passed"
      summaryTitle="Validation Results"
      summaryValue="0"
      summaryCaption="Blocking issues found"
      actionLabel="Continue to Publish"
      onContinue={onContinue}
    />
  );
}
