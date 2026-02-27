import { useState } from 'react';
import { StepProgress } from '../../components/StepProgress';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { CheckCircle2, Eye, Users } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';

interface PublishStageProps {
  onPublish?: () => void;
  onEdit?: () => void;
  onContinue?: () => void;
}

const steps = ['Upload', 'Extraction', 'Validation', 'Publish'];

export function PublishStage({ onPublish, onEdit, onContinue }: PublishStageProps) {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [ownerTeam, setOwnerTeam] = useState('');
  const [visibility, setVisibility] = useState<'all' | 'restricted'>('all');

  const publish = onPublish ?? onContinue ?? (() => {});

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Publish</h1>
          <p className="text-gray-600">Confirm publishing details before sending this insight package to the library.</p>
          <p className="text-gray-500 italic mt-1">
            If you leave during this process, your files &amp; changes will be lost
          </p>
        </div>

        <StepProgress steps={steps} currentStep={3} />

        <div className="space-y-6 mt-8">
          <Card className="p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Pre-Publish Checklist</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-green-900">Required fields complete</p>
                  <p className="text-sm text-green-700">Validation fields and review notes are included.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-green-900">Approval review complete</p>
                  <p className="text-sm text-green-700">Insights are ready for publication.</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Publishing Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="publish-title">Record Title</Label>
                <Input
                  id="publish-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Q1 Consumer Sentiment Highlights"
                />
              </div>
              <div>
                <Label htmlFor="publish-team">Owner Team</Label>
                <Input
                  id="publish-team"
                  value={ownerTeam}
                  onChange={(event) => setOwnerTeam(event.target.value)}
                  placeholder="Consumer Insights"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="publish-summary">Search Summary</Label>
                <Textarea
                  id="publish-summary"
                  value={summary}
                  onChange={(event) => setSummary(event.target.value)}
                  rows={3}
                  placeholder="Short description shown in search and discovery views."
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Visibility & Permissions</h2>
            <div className="space-y-4">
              <label className="flex items-start gap-4 cursor-pointer">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      type="radio"
                      name="visibility"
                      checked={visibility === 'all'}
                      onChange={() => setVisibility('all')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="font-medium text-gray-900">All teams</span>
                  </div>
                  <p className="text-sm text-gray-600">Searchable and visible to everyone in the organization.</p>
                </div>
              </label>

              <label className="flex items-start gap-4 cursor-pointer">
                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                  <Eye className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      type="radio"
                      name="visibility"
                      checked={visibility === 'restricted'}
                      onChange={() => setVisibility('restricted')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="font-medium text-gray-900">Specific teams only</span>
                  </div>
                  <p className="text-sm text-gray-600">Limit access to selected departments or teams.</p>
                </div>
              </label>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Preview</h2>
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{title || 'Untitled Insight Record'}</h3>
                <Badge variant="secondary">Draft</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                {summary || 'Add a summary to preview how this insight will appear in search results.'}
              </p>
              <div className="text-xs text-gray-500">Owner: {ownerTeam || 'Not set'}</div>
            </div>
          </Card>
        </div>

        <div className="sticky bottom-0 mt-8 -mx-8 -mb-8 bg-white border-t border-gray-200 px-8 py-4 flex items-center justify-between">
          <Button variant="outline" onClick={onEdit} disabled={!onEdit}>
            Back to Validation
          </Button>
          <Button onClick={publish} className="bg-blue-600 hover:bg-blue-700">
            Publish to Insight Library
          </Button>
        </div>
      </div>
    </div>
  );
}
