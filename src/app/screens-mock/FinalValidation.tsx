import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { CheckCircle2, AlertCircle, Users, Eye } from 'lucide-react';
import { mockExtractedInsights } from '../data/mockData';

interface FinalValidationProps {
  onPublish: () => void;
  onEdit: () => void;
}

export function FinalValidation({ onPublish, onEdit }: FinalValidationProps) {
  const approvedInsights = mockExtractedInsights.filter(i => i.approvalStatus === 'approved');
  const totalInsights = mockExtractedInsights.length;

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Final Validation</h1>
          <p className="text-gray-600">
            Review {approvedInsights.length} approved insight{approvedInsights.length !== 1 ? 's' : ''} before publishing to Insight Library
          </p>
        </div>
        
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Pre-Publication Checklist</h2>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-green-900">Metadata Complete</p>
                  <p className="text-sm text-green-700 mt-1">
                    All required fields have been filled
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-green-900">Quality Score: High</p>
                  <p className="text-sm text-green-700 mt-1">
                    Confidence score above threshold (87%)
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-amber-900">Similar Insight Detected</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Found 1 potentially related insight from Q3 2025. Review to avoid duplicates.
                  </p>
                  <Button variant="link" className="h-auto p-0 text-amber-700 hover:text-amber-800 mt-2">
                    View Similar Insight →
                  </Button>
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Visibility & Permissions</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <label className="flex items-center gap-2 mb-2">
                    <input 
                      type="radio" 
                      name="visibility" 
                      value="all" 
                      defaultChecked
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="font-medium text-gray-900">All teams</span>
                  </label>
                  <p className="text-sm text-gray-600 ml-6">
                    Searchable and visible to everyone in the organization
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                  <Eye className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <label className="flex items-center gap-2 mb-2">
                    <input 
                      type="radio" 
                      name="visibility" 
                      value="restricted"
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="font-medium text-gray-900">Specific teams only</span>
                  </label>
                  <p className="text-sm text-gray-600 ml-6">
                    Limit access to selected departments or teams
                  </p>
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Preview: Searchable Record</h2>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-medium text-gray-900">{mockExtractedInsights[0].statement}</h3>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-gray-600">{Math.round(mockExtractedInsights[0].confidence * 100)}%</span>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">{mockExtractedInsights[0].description}</p>
              
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary">Document</Badge>
                <Badge variant="outline">{mockExtractedInsights[0].team}</Badge>
                {mockExtractedInsights[0].metadata.slice(0, 3).map((field) => (
                  <Badge key={field.id} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {field.label}: {field.value}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        </div>
        
        <div className="sticky bottom-0 mt-8 -mx-8 -mb-8 bg-white border-t border-gray-200 px-8 py-4 flex items-center justify-between">
          <Button variant="outline" onClick={onEdit}>
            Edit Again
          </Button>
          <Button onClick={onPublish} className="bg-blue-600 hover:bg-blue-700">
            Publish to Insight Library
          </Button>
        </div>
      </div>
    </div>
  );
}