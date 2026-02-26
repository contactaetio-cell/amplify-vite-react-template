import { ProcessingStagePage } from './ProcessingStagePage';

interface PublishStageProps {
  onContinue: () => void;
}

export function PublishStage({ onContinue }: PublishStageProps) {
  return (
    <ProcessingStagePage
      currentStep={4}
      title="Publish"
      description="This source has completed processing and is ready for review."
      statusLabel="Ready for review"
      summaryTitle="Publishing Status"
      summaryValue="Ready"
      summaryCaption="Insight package available"
      actionLabel="Review Extracted Insights"
      onContinue={onContinue}
    />
  );
}
