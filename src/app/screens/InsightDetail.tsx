import { ArrowLeft, FileText, Download, Share2, MessageSquare, History, Sparkles, CheckCircle2, XCircle, Clock, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Separator } from '../components/ui/separator';
import { mockInsights } from '../data/mockData';
import { ChildInsightsExplorer } from '../components/ChildInsightsExplorer';

interface InsightDetailProps {
  insightId: string;
  onBack: () => void;
  onViewRelated: (id: string) => void;
}

export function InsightDetail({ insightId, onBack, onViewRelated }: InsightDetailProps) {
  const insight = mockInsights.find((i) => i.id === insightId);
  
  if (!insight) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Insight not found</p>
      </div>
    );
  }

  const relatedInsights = mockInsights.filter((i) => 
    insight.relatedInsights?.includes(i.id)
  );

  const requiredFields = insight.metadata.filter(m => m.isRequired);
  const optionalFields = insight.metadata.filter(m => !m.isRequired);

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto p-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Badge variant="secondary">
                  <FileText className="w-3 h-3 mr-1" />
                  {insight.sourceType}
                </Badge>
                <Badge variant="outline">{insight.team}</Badge>
              </div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">{insight.statement}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <span>{insight.author}</span>
                <span>•</span>
                <span>Published {new Date(insight.date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
                <span>•</span>
                <span>Expires {new Date(insight.expiration).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {insight.metadata.slice(0, 4).map((field) => (
                  <Badge key={field.id} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {field.label}: {field.value}
                  </Badge>
                ))}
                {insight.metadata.length > 4 && (
                  <Badge variant="outline" className="text-gray-600">
                    +{insight.metadata.length - 4} more fields
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-5xl mx-auto p-8">
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 space-y-6">
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="source">Source Details</TabsTrigger>
                <TabsTrigger value="related">Related Insights</TabsTrigger>
                <TabsTrigger value="metadata">Full Metadata</TabsTrigger>
              </TabsList>
              
              <TabsContent value="content" className="mt-6">
                <Card className="p-6">
                  <h2 className="font-semibold text-gray-900 mb-4">Insight Statement</h2>
                  <p className="text-lg text-gray-900 leading-relaxed mb-6">{insight.statement}</p>
                  
                  {insight.fullContent && (
                    <>
                      <Separator className="my-6" />
                      <h3 className="font-semibold text-gray-900 mb-4">Detailed Analysis</h3>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {insight.fullContent}
                      </p>
                      <Separator className="my-6" />
                    </>
                  )}
                  
                  {!insight.fullContent && <Separator className="my-6" />}
                  
                  <div className="bg-gray-50 border-l-4 border-gray-300 p-4 rounded">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Source Citation</h3>
                    <p className="text-sm text-gray-600 italic">{insight.footnote}</p>
                  </div>
                </Card>
              </TabsContent>
              
              <TabsContent value="source" className="mt-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-gray-900">Source Document</h2>
                    <Badge variant="outline" className="capitalize">{insight.sourceType}</Badge>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-8 border border-gray-200 mb-6">
                    <div className="text-center">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-600 mb-4">
                        Original source document
                      </p>
                      <Button variant="outline" size="sm">
                        View Full Source
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Source Citation:</span>
                      <span className="text-gray-900 font-medium text-right flex-1 ml-4">{insight.footnote.split(',')[0]}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Published:</span>
                      <span className="text-gray-900">{new Date(insight.date).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Author:</span>
                      <span className="text-gray-900">{insight.author}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Team:</span>
                      <span className="text-gray-900">{insight.team}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Expiration:</span>
                      <span className="text-gray-900">{new Date(insight.expiration).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Card>
              </TabsContent>
              
              <TabsContent value="related" className="mt-6">
                <div className="space-y-4">
                  {relatedInsights.length > 0 ? (
                    relatedInsights.map((related) => (
                      <Card key={related.id} className="p-6 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => onViewRelated(related.id)}
                      >
                        <h3 className="font-medium text-gray-900 mb-3">{related.statement}</h3>
                        <p className="text-sm text-gray-600 mb-3">{related.description}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline">{related.team}</Badge>
                          {related.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </Card>
                    ))
                  ) : (
                    <Card className="p-8 text-center">
                      <p className="text-gray-600">No related insights found</p>
                    </Card>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="metadata" className="mt-6">
                <Card className="p-6">
                  <h2 className="font-semibold text-gray-900 mb-6">Complete Metadata</h2>
                  
                  <div className="space-y-6">
                    {/* Analysis Timeframe */}
                    {(insight.analysisTimeframeStart || insight.analysisTimeframeEnd) && (
                      <>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 mb-3">Analysis Timeframe</h3>
                          <div className="space-y-2 pl-4">
                            {insight.analysisTimeframeStart && (
                              <div className="flex items-center gap-3">
                                <label className="text-sm text-gray-600 w-20">Start Date:</label>
                                <p className="text-gray-900 font-medium">
                                  {new Date(insight.analysisTimeframeStart).toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  })}
                                </p>
                              </div>
                            )}
                            {insight.analysisTimeframeEnd && (
                              <div className="flex items-center gap-3">
                                <label className="text-sm text-gray-600 w-20">End Date:</label>
                                <p className="text-gray-900 font-medium">
                                  {new Date(insight.analysisTimeframeEnd).toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  })}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        <Separator />
                      </>
                    )}
                    
                    {/* Communications & Legal Approvals */}
                    {(insight.sharingLevel || insight.prApprovalStatus || insight.legalApprovalStatus) && (
                      <>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 mb-3">Communications & Legal Approvals</h3>
                          <div className="space-y-3 pl-4">
                            {insight.sharingLevel && (
                              <div>
                                <label className="text-sm text-gray-600">Sharing Level</label>
                                <div className="mt-1">
                                  <Badge 
                                    variant="outline" 
                                    className={
                                      insight.sharingLevel === 'internal' 
                                        ? 'bg-gray-100 text-gray-800 border-gray-300' 
                                        : insight.sharingLevel === 'controlled'
                                        ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                                        : 'bg-green-100 text-green-800 border-green-300'
                                    }
                                  >
                                    {insight.sharingLevel === 'internal' && 'Internal Comms Only'}
                                    {insight.sharingLevel === 'controlled' && 'Controlled Audience Comms'}
                                    {insight.sharingLevel === 'public' && 'Public Comms'}
                                  </Badge>
                                </div>
                              </div>
                            )}
                            {insight.prApprovalStatus && (
                              <div>
                                <label className="text-sm text-gray-600">PR Approval</label>
                                <div className="flex items-center gap-2 mt-1">
                                  {insight.prApprovalStatus === 'approved' && (
                                    <>
                                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                                      <span className="text-sm font-medium text-green-700">Approved</span>
                                    </>
                                  )}
                                  {insight.prApprovalStatus === 'rejected' && (
                                    <>
                                      <XCircle className="w-4 h-4 text-red-600" />
                                      <span className="text-sm font-medium text-red-700">Rejected</span>
                                    </>
                                  )}
                                  {insight.prApprovalStatus === 'pending' && (
                                    <>
                                      <Clock className="w-4 h-4 text-yellow-600" />
                                      <span className="text-sm font-medium text-yellow-700">Pending</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                            {insight.legalApprovalStatus && (
                              <div>
                                <label className="text-sm text-gray-600">Legal Approval</label>
                                <div className="flex items-center gap-2 mt-1">
                                  {insight.legalApprovalStatus === 'approved' && (
                                    <>
                                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                                      <span className="text-sm font-medium text-green-700">Approved</span>
                                    </>
                                  )}
                                  {insight.legalApprovalStatus === 'rejected' && (
                                    <>
                                      <XCircle className="w-4 h-4 text-red-600" />
                                      <span className="text-sm font-medium text-red-700">Rejected</span>
                                    </>
                                  )}
                                  {insight.legalApprovalStatus === 'pending' && (
                                    <>
                                      <Clock className="w-4 h-4 text-yellow-600" />
                                      <span className="text-sm font-medium text-yellow-700">Pending</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                            {insight.approvalDocumentationUrl && (
                              <div>
                                <label className="text-sm text-gray-600">Approval Documentation</label>
                                <div className="mt-1">
                                  <a 
                                    href={insight.approvalDocumentationUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
                                  >
                                    View Approval Documentation
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <Separator />
                      </>
                    )}
                    
                    {/* Required Fields */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        Required Fields
                      </h3>
                      <div className="space-y-3 pl-4">
                        <div>
                          <label className="text-sm text-gray-600">Team</label>
                          <p className="text-gray-900 font-medium mt-1">{insight.team}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Expiration Date</label>
                          <p className="text-gray-900 font-medium mt-1">
                            {new Date(insight.expiration).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                        {requiredFields.map((field) => (
                          <div key={field.id}>
                            <label className="text-sm text-gray-600">{field.label}</label>
                            <p className="text-gray-900 font-medium mt-1">{field.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Optional/Custom Fields */}
                    {optionalFields.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-3">
                          Optional & Custom Fields
                        </h3>
                        <div className="space-y-3 pl-4">
                          {optionalFields.map((field) => (
                            <div key={field.id} className="flex items-start gap-2">
                              <div className="flex-1">
                                <label className="text-sm text-gray-600">{field.label}</label>
                                <p className="text-gray-900 font-medium mt-1">{field.value}</p>
                              </div>
                              {field.isNew && (
                                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  Custom
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <Separator />
                    
                    {/* System Fields */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3">System Fields</h3>
                      <div className="space-y-3 pl-4">
                        <div>
                          <label className="text-sm text-gray-600">Insight ID</label>
                          <p className="text-gray-900 font-mono text-sm mt-1">{insight.id}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Source Type</label>
                          <p className="text-gray-900 font-medium mt-1 capitalize">{insight.sourceType}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Domain</label>
                          <p className="text-gray-900 font-medium mt-1">{insight.domain || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Tags</label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {insight.tags.map((tag) => (
                              <Badge key={tag} variant="secondary">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
            
            {/* Child Insights Explorer - only show for root insights */}
            {insight.isRootInsight && insight.childInsightIds && insight.childInsightIds.length > 0 && (
              <ChildInsightsExplorer 
                rootInsight={insight} 
                onViewInsight={onViewRelated}
              />
            )}
            
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Discussion</h3>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                      AM
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">Alex Martinez</span>
                        <span className="text-xs text-gray-500">2 days ago</span>
                      </div>
                      <p className="text-sm text-gray-700">
                        This aligns with what we're seeing in customer interviews. We should prioritize the roadmap items related to this.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Comment
                  </Button>
                </div>
              </div>
            </Card>
          </div>
          
          <div className="col-span-1 space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Key Metadata</h3>
              
              <div className="space-y-3">
                {insight.metadata.slice(0, 4).map((field) => (
                  <div key={field.id}>
                    <label className="text-xs text-gray-600 uppercase tracking-wide">{field.label}</label>
                    <p className="text-sm text-gray-900 font-medium mt-1">{field.value}</p>
                  </div>
                ))}
                {insight.metadata.length > 4 && (
                  <Button variant="link" className="h-auto p-0 text-blue-600 text-sm">
                    View all {insight.metadata.length} fields →
                  </Button>
                )}
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Version History</h3>
                </div>
                {insight.currentVersion && (
                  <Badge variant="secondary" className="text-xs">
                    v{insight.currentVersion}
                  </Badge>
                )}
              </div>
              
              <div className="space-y-2">
                {insight.versionHistory && insight.versionHistory.length > 0 ? (
                  <>
                    {insight.versionHistory.slice().reverse().map((version, idx) => (
                      <button
                        key={version.id}
                        className="w-full flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left group"
                        onClick={() => {
                          // In a real app, this would navigate to view the specific version
                          console.log('View version:', version.version);
                        }}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                          idx === 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          v{version.version}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className={`text-sm font-medium ${idx === 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                              {idx === 0 ? 'Current version' : `Version ${version.version}`}
                            </p>
                            {idx === 0 && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                                Active
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            By {version.modifiedBy} • {new Date(version.modifiedDate).toLocaleDateString()}
                          </p>
                          {version.changeDescription && (
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {version.changeDescription}
                            </p>
                          )}
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                            View
                          </Button>
                        </div>
                      </button>
                    ))}
                  </>
                ) : (
                  <div className="flex gap-3 p-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-medium flex-shrink-0">
                      v1
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">Current version</p>
                      <p className="text-xs text-gray-500">
                        Published {new Date(insight.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
            
            <Card className="p-6 bg-blue-50 border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Recommended Actions</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Share with {insight.team} team</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Review related insights</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Add to roadmap discussion</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}