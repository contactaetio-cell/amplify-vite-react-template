import { useMemo, useState } from 'react';
import { StepProgress } from '../../components/StepProgress';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Checkbox } from '../../components/ui/checkbox';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Plus } from 'lucide-react';

interface ValidationStageProps {
  onContinue: () => void;
}

interface EditableInsight {
  id: string;
  statement: string;
  dataPoints: string;
  confidence: string;
  team: string;
  expiration: string;
  approved: boolean;
}

const steps = ['Upload', 'Extraction', 'Validation', 'Publish'];

const createEmptyInsight = (index: number): EditableInsight => ({
  id: `insight-${index + 1}`,
  statement: '',
  dataPoints: '',
  confidence: '',
  team: '',
  expiration: '',
  approved: false,
});

export function ValidationStage({ onContinue }: ValidationStageProps) {
  const [title, setTitle] = useState('');
  const [context, setContext] = useState('');
  const [insights, setInsights] = useState<EditableInsight[]>([createEmptyInsight(0)]);
  const [metadataNotes, setMetadataNotes] = useState('');

  const approvedCount = useMemo(
    () => insights.filter((insight) => insight.approved).length,
    [insights],
  );

  const updateInsight = (id: string, patch: Partial<EditableInsight>) => {
    setInsights((current) =>
      current.map((insight) => (insight.id === id ? { ...insight, ...patch } : insight)),
    );
  };

  const addInsight = () => {
    setInsights((current) => [...current, createEmptyInsight(current.length)]);
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="max-w-6xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Validation</h1>
          <p className="text-gray-600">
            Review extracted insights, validate metadata, and approve entries for publishing.
          </p>
          <p className="text-gray-500 italic mt-1">
            If you leave during this process, your files &amp; changes will be lost
          </p>
        </div>

        <StepProgress steps={steps} currentStep={2} />

        <div className="space-y-6 mt-8">
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="review-title">Insight Package Title</Label>
                <Input
                  id="review-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Q1 Consumer Sentiment Highlights"
                />
              </div>
              <div>
                <Label>Approval Progress</Label>
                <div className="mt-2 text-sm text-gray-700">
                  <span className="font-medium">{approvedCount}</span>
                  <span> of </span>
                  <span className="font-medium">{insights.length}</span>
                  <span> insights approved</span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <Label htmlFor="review-context">Review Context</Label>
              <Textarea
                id="review-context"
                value={context}
                onChange={(event) => setContext(event.target.value)}
                placeholder="Provide any context the publishing reviewer should know."
                rows={3}
              />
            </div>
          </Card>

          {insights.map((insight, index) => (
            <Card key={insight.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Insight {index + 1}</h2>
                <Badge variant={insight.approved ? 'default' : 'secondary'}>
                  {insight.approved ? 'Approved' : 'Pending'}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor={`statement-${insight.id}`}>Insight Statement</Label>
                  <Textarea
                    id={`statement-${insight.id}`}
                    value={insight.statement}
                    onChange={(event) =>
                      updateInsight(insight.id, { statement: event.target.value })
                    }
                    placeholder="Customers are prioritizing reliability over price in Q1."
                    rows={2}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor={`data-points-${insight.id}`}>Supporting Data Points</Label>
                  <Textarea
                    id={`data-points-${insight.id}`}
                    value={insight.dataPoints}
                    onChange={(event) =>
                      updateInsight(insight.id, { dataPoints: event.target.value })
                    }
                    placeholder="Add bullet points or short notes for supporting evidence."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor={`confidence-${insight.id}`}>Confidence (%)</Label>
                  <Input
                    id={`confidence-${insight.id}`}
                    type="number"
                    min="0"
                    max="100"
                    value={insight.confidence}
                    onChange={(event) =>
                      updateInsight(insight.id, { confidence: event.target.value })
                    }
                    placeholder="85"
                  />
                </div>
                <div>
                  <Label htmlFor={`team-${insight.id}`}>Owning Team</Label>
                  <Input
                    id={`team-${insight.id}`}
                    value={insight.team}
                    onChange={(event) =>
                      updateInsight(insight.id, { team: event.target.value })
                    }
                    placeholder="Consumer Insights"
                  />
                </div>
                <div>
                  <Label htmlFor={`expiration-${insight.id}`}>Expiration Date</Label>
                  <Input
                    id={`expiration-${insight.id}`}
                    type="date"
                    value={insight.expiration}
                    onChange={(event) =>
                      updateInsight(insight.id, { expiration: event.target.value })
                    }
                  />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <Checkbox
                      checked={insight.approved}
                      onCheckedChange={(value) =>
                        updateInsight(insight.id, { approved: Boolean(value) })
                      }
                    />
                    Mark as approved for publishing
                  </label>
                </div>
              </div>
            </Card>
          ))}

          <div className="flex justify-start">
            <Button variant="outline" onClick={addInsight}>
              <Plus className="w-4 h-4 mr-2" />
              Add Another Insight
            </Button>
          </div>

          <Card className="p-6">
            <Label htmlFor="metadata-notes">Metadata Notes</Label>
            <Textarea
              id="metadata-notes"
              value={metadataNotes}
              onChange={(event) => setMetadataNotes(event.target.value)}
              placeholder="Capture tags, lineage notes, and reviewer comments."
              rows={3}
            />
          </Card>

          <div className="sticky bottom-0 -mx-8 -mb-8 bg-white border-t border-gray-200 px-8 py-4 flex justify-end">
            <Button onClick={onContinue} className="bg-blue-600 hover:bg-blue-700">
              Continue to Publish
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
