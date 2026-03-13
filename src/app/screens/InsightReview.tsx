import { useState } from 'react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Checkbox } from '../components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../components/ui/select';
import { Sparkles, Check, X, Flag, Edit2, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { mockExtractedInsights, ExtractedInsight, MetadataField } from '../data/mockData';
import { toast } from 'sonner';

interface InsightReviewProps {
  onApprove: () => void;
}

const ITEMS_PER_PAGE = 10;

export function InsightReview({ onApprove }: InsightReviewProps) {
  const [insights, setInsights] = useState<ExtractedInsight[]>(mockExtractedInsights);
  const [selectedInsights, setSelectedInsights] = useState<Set<string>>(new Set());
  const [editingInsight, setEditingInsight] = useState<ExtractedInsight | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showMetadataDialog, setShowMetadataDialog] = useState(false);
  const [newMetadataField, setNewMetadataField] = useState({ label: '', value: '', type: 'text' as const });

  const totalPages = Math.ceil(insights.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedInsights = insights.slice(startIndex, endIndex);

  const approvedCount = insights.filter(i => i.approvalStatus === 'approved').length;
  const pendingCount = insights.filter(i => i.approvalStatus === 'pending').length;

  const toggleSelectAll = () => {
    if (selectedInsights.size === paginatedInsights.length) {
      setSelectedInsights(new Set());
    } else {
      setSelectedInsights(new Set(paginatedInsights.map(i => i.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedInsights);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedInsights(newSelected);
  };

  const updateInsightStatus = (id: string, status: ExtractedInsight['approvalStatus']) => {
    setInsights(insights.map(i => i.id === id ? { ...i, approvalStatus: status } : i));
    const statusText = status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'flagged';
    toast.success(`Insight ${statusText}`);
  };

  const bulkApprove = () => {
    setInsights(insights.map(i => 
      selectedInsights.has(i.id) ? { ...i, approvalStatus: 'approved' } : i
    ));
    toast.success(`${selectedInsights.size} insights approved`);
    setSelectedInsights(new Set());
  };

  const bulkReject = () => {
    setInsights(insights.map(i => 
      selectedInsights.has(i.id) ? { ...i, approvalStatus: 'rejected' } : i
    ));
    toast.success(`${selectedInsights.size} insights rejected`);
    setSelectedInsights(new Set());
  };

  const saveEditedInsight = () => {
    if (editingInsight) {
      setInsights(insights.map(i => i.id === editingInsight.id ? editingInsight : i));
      toast.success('Insight updated');
      setEditingInsight(null);
    }
  };

  const addMetadataField = () => {
    if (editingInsight && newMetadataField.label && newMetadataField.value) {
      const newField: MetadataField = {
        id: `m${Date.now()}`,
        label: newMetadataField.label,
        value: newMetadataField.value,
        type: newMetadataField.type,
        isNew: true
      };
      setEditingInsight({
        ...editingInsight,
        metadata: [...editingInsight.metadata, newField]
      });
      setNewMetadataField({ label: '', value: '', type: 'text' });
      setShowMetadataDialog(false);
      toast.success('Metadata field added');
    }
  };

  const getStatusBadge = (status: ExtractedInsight['approvalStatus']) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'flagged':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Flagged</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="max-w-[1600px] mx-auto p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">Review Extracted Insights</h1>
              <p className="text-gray-600">Review and approve individual insights with their metadata</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="font-medium text-gray-900">{approvedCount}</span>
                <span className="text-gray-600"> approved</span>
                <span className="mx-2">•</span>
                <span className="font-medium text-gray-900">{pendingCount}</span>
                <span className="text-gray-600"> pending</span>
              </div>
            </div>
          </div>

          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-900">AI-Extracted Insights</p>
                <p className="text-sm text-blue-700 mt-1">
                  Review each insight individually. Required metadata fields are marked, and new/custom fields are highlighted.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {selectedInsights.size > 0 && (
          <Card className="p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">
                {selectedInsights.size} insight{selectedInsights.size > 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={bulkApprove}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Bulk Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={bulkReject}
                >
                  <X className="w-4 h-4 mr-2" />
                  Bulk Reject
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedInsights(new Set())}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </Card>
        )}

        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={selectedInsights.size === paginatedInsights.length && paginatedInsights.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead className="w-10 text-xs">ID</TableHead>
                <TableHead className="min-w-[350px]">Insight Statement & Data Points</TableHead>
                <TableHead className="w-20 text-xs">Confidence</TableHead>
                <TableHead className="w-24 text-xs">Team</TableHead>
                <TableHead className="w-24 text-xs">Expiration</TableHead>
                <TableHead className="w-24 text-xs">Status</TableHead>
                <TableHead className="w-36 text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedInsights.map((insight) => (
                <TableRow key={insight.id} className="align-top">
                  <TableCell>
                    <Checkbox
                      checked={selectedInsights.has(insight.id)}
                      onCheckedChange={() => toggleSelect(insight.id)}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs text-gray-500">
                    {insight.id.slice(-2)}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-2">{insight.statement}</p>
                        
                        {/* Data Points */}
                        <div className="space-y-1 mb-3">
                          {insight.dataPoints.map((dp) => (
                            <div key={dp.id} className="flex gap-2 text-xs">
                              <span className="text-blue-600 font-medium flex-shrink-0">•</span>
                              <span className="text-gray-700">{dp.value}</span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="text-xs text-gray-500 italic border-l-2 border-gray-300 pl-3">
                          {insight.footnote}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {insight.metadata.map((field) => (
                          <div key={field.id}>
                            {field.isNew ? (
                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300 text-xs">
                                <Sparkles className="w-3 h-3 mr-1" />
                                {field.label}: {field.value}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-gray-50 text-xs">
                                {field.label}: {field.value}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col items-start gap-1">
                      <div className="w-10 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${insight.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-900 tabular-nums">
                        {Math.round(insight.confidence * 100)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-gray-900">{insight.team}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-gray-600">
                      {new Date(insight.expiration).toLocaleDateString('en-US', { 
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(insight.approvalStatus)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {insight.approvalStatus === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateInsightStatus(insight.id, 'approved')}
                            className="bg-green-600 hover:bg-green-700 h-7 w-7 p-0"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateInsightStatus(insight.id, 'rejected')}
                            className="h-7 w-7 p-0"
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingInsight(insight)}
                        className="h-7 w-7 p-0"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateInsightStatus(insight.id, 'flagged')}
                        className="h-7 w-7 p-0"
                      >
                        <Flag className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="border-t border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1}-{Math.min(endIndex, insights.length)} of {insights.length} insights
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      size="sm"
                      variant={currentPage === page ? "default" : "outline"}
                      onClick={() => setCurrentPage(page)}
                      className={currentPage === page ? "bg-blue-600" : ""}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>

        <div className="sticky bottom-0 mt-8 -mx-8 -mb-8 bg-white border-t border-gray-200 px-8 py-4 flex items-center justify-between">
          <Button variant="outline">
            Save Progress
          </Button>
          <div className="flex gap-3">
            <span className="text-sm text-gray-600 self-center">
              {approvedCount} of {insights.length} approved
            </span>
            <Button onClick={onApprove} className="bg-blue-600 hover:bg-blue-700">
              Continue to Validation
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Insight Dialog */}
      {editingInsight && (
        <Dialog open={!!editingInsight} onOpenChange={() => setEditingInsight(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Insight</DialogTitle>
              <DialogDescription>
                Update the insight statement, description, and metadata fields
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label>Insight Statement (Required)</Label>
                <Textarea
                  value={editingInsight.statement}
                  onChange={(e) => setEditingInsight({ ...editingInsight, statement: e.target.value })}
                  className="mt-2"
                  rows={3}
                  placeholder="The insight statement with supporting context..."
                />
              </div>

              <div>
                <Label>Footnote (Required)</Label>
                <Textarea
                  value={editingInsight.footnote}
                  onChange={(e) => setEditingInsight({ ...editingInsight, footnote: e.target.value })}
                  className="mt-2"
                  rows={2}
                  placeholder="Source details, page numbers, date ranges..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Team (Required)</Label>
                  <Input
                    value={editingInsight.team}
                    onChange={(e) => setEditingInsight({ ...editingInsight, team: e.target.value })}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Expiration Date (Required)</Label>
                  <Input
                    type="date"
                    value={editingInsight.expiration}
                    onChange={(e) => setEditingInsight({ ...editingInsight, expiration: e.target.value })}
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Metadata Fields</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowMetadataDialog(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Field
                  </Button>
                </div>
                <div className="space-y-2 border rounded-lg p-4 bg-gray-50">
                  {editingInsight.metadata.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <Input
                        value={field.label}
                        onChange={(e) => {
                          const updated = [...editingInsight.metadata];
                          updated[index] = { ...field, label: e.target.value };
                          setEditingInsight({ ...editingInsight, metadata: updated });
                        }}
                        placeholder="Field name"
                        className="flex-1"
                      />
                      <Input
                        value={field.value}
                        onChange={(e) => {
                          const updated = [...editingInsight.metadata];
                          updated[index] = { ...field, value: e.target.value };
                          setEditingInsight({ ...editingInsight, metadata: updated });
                        }}
                        placeholder="Value"
                        className="flex-1"
                      />
                      {field.isNew && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                          New
                        </Badge>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingInsight({
                            ...editingInsight,
                            metadata: editingInsight.metadata.filter((_, i) => i !== index)
                          });
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingInsight(null)}>
                Cancel
              </Button>
              <Button onClick={saveEditedInsight} className="bg-blue-600 hover:bg-blue-700">
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Metadata Field Dialog */}
      <Dialog open={showMetadataDialog} onOpenChange={setShowMetadataDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Metadata Field</DialogTitle>
            <DialogDescription>
              Create a custom metadata field for this insight
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Field Name</Label>
              <Input
                value={newMetadataField.label}
                onChange={(e) => setNewMetadataField({ ...newMetadataField, label: e.target.value })}
                placeholder="e.g., Platform, Industry, Priority"
                className="mt-2"
              />
            </div>

            <div>
              <Label>Value</Label>
              <Input
                value={newMetadataField.value}
                onChange={(e) => setNewMetadataField({ ...newMetadataField, value: e.target.value })}
                placeholder="e.g., Mobile, Healthcare, High"
                className="mt-2"
              />
            </div>

            <div>
              <Label>Field Type</Label>
              <Select
                value={newMetadataField.type}
                onValueChange={(value: 'text' | 'select' | 'date' | 'number') => 
                  setNewMetadataField({ ...newMetadataField, type: value })
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="select">Select</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMetadataDialog(false)}>
              Cancel
            </Button>
            <Button onClick={addMetadataField} className="bg-blue-600 hover:bg-blue-700">
              Add Field
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}