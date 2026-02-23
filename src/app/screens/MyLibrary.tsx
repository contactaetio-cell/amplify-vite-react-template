import { useState } from 'react';
import { Bookmark, Clock, Share2, Upload, Trash2 } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../components/ui/table';
import { getSavedInsights, getSharedInsights, mockUploadHistory, mockRecentSearches } from '../data/mockData';

interface MyLibraryProps {
  onViewInsight: (id: string) => void;
  onSearch: (query: string) => void;
}

export function MyLibrary({ onViewInsight, onSearch }: MyLibraryProps) {
  const [activeTab, setActiveTab] = useState('saved');
  
  const savedInsights = getSavedInsights();
  const sharedInsights = getSharedInsights();

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">My Library</h1>
          <p className="text-gray-600">
            Your personal collection of insights, uploads, and searches
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="saved" className="gap-2">
              <Bookmark className="w-4 h-4" />
              Saved Insights ({savedInsights.length})
            </TabsTrigger>
            <TabsTrigger value="recent" className="gap-2">
              <Clock className="w-4 h-4" />
              Recent Searches ({mockRecentSearches.length})
            </TabsTrigger>
            <TabsTrigger value="shared" className="gap-2">
              <Share2 className="w-4 h-4" />
              Shared with Me ({sharedInsights.length})
            </TabsTrigger>
            <TabsTrigger value="uploads" className="gap-2">
              <Upload className="w-4 h-4" />
              My Uploads ({mockUploadHistory.length})
            </TabsTrigger>
          </TabsList>

          {/* Saved Insights */}
          <TabsContent value="saved">
            <Card className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[400px]">Insight Statement</TableHead>
                    <TableHead className="w-24">Confidence</TableHead>
                    <TableHead className="w-32">Team</TableHead>
                    <TableHead className="w-32">Saved Date</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {savedInsights.map((insight) => (
                    <TableRow key={insight.id} className="align-top">
                      <TableCell>
                        <div className="space-y-2">
                          <p className="font-medium text-gray-900">{insight.statement}</p>
                          <div className="flex flex-wrap gap-2">{insight.metadata.slice(0, 2).map((field) => (
                              <Badge key={field.id} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                {field.label}: {field.value}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${insight.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900 tabular-nums">
                            {Math.round(insight.confidence * 100)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-900">{insight.team}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {new Date(insight.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onViewInsight(insight.id)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
            
            {savedInsights.length === 0 && (
              <Card className="p-12 text-center">
                <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">No saved insights yet</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Save insights you want to reference later
                </p>
                <Button onClick={() => onSearch('')} className="bg-blue-600 hover:bg-blue-700">
                  Browse Insights
                </Button>
              </Card>
            )}
          </TabsContent>

          {/* Recent Searches */}
          <TabsContent value="recent">
            <Card>
              <div className="divide-y divide-gray-200">
                {mockRecentSearches.map((search) => (
                  <button
                    key={search.id}
                    onClick={() => onSearch(search.query)}
                    className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{search.query}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(search.timestamp).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Search Again
                    </Button>
                  </button>
                ))}
              </div>
            </Card>
            
            {mockRecentSearches.length === 0 && (
              <Card className="p-12 text-center">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">No recent searches</h3>
                <p className="text-sm text-gray-600">
                  Your search history will appear here
                </p>
              </Card>
            )}
          </TabsContent>

          {/* Shared Insights */}
          <TabsContent value="shared">
            <Card className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[400px]">Insight Statement</TableHead>
                    <TableHead className="w-32">Shared By</TableHead>
                    <TableHead className="w-32">Team</TableHead>
                    <TableHead className="w-32">Shared With</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sharedInsights.map((insight) => (
                    <TableRow key={insight.id} className="align-top">
                      <TableCell>
                        <div className="space-y-2">
                          <p className="font-medium text-gray-900">{insight.statement.split('.')[0]}</p>
                          <div className="flex flex-wrap gap-2">
                            {insight.metadata.slice(0, 2).map((field) => (
                              <Badge key={field.id} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                {field.label}: {field.value}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-900">{insight.author}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-900">{insight.team}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {insight.sharedWith?.slice(0, 2).map((team) => (
                            <Badge key={team} variant="secondary" className="text-xs">
                              {team}
                            </Badge>
                          ))}
                          {insight.sharedWith && insight.sharedWith.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{insight.sharedWith.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onViewInsight(insight.id)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
            
            {sharedInsights.length === 0 && (
              <Card className="p-12 text-center">
                <Share2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">No shared insights</h3>
                <p className="text-sm text-gray-600">
                  Insights shared with you will appear here
                </p>
              </Card>
            )}
          </TabsContent>

          {/* My Uploads */}
          <TabsContent value="uploads">
            <Card className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[300px]">File Name</TableHead>
                    <TableHead className="w-32">Upload Date</TableHead>
                    <TableHead className="w-24">Insights</TableHead>
                    <TableHead className="w-32">Status</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUploadHistory.map((upload) => (
                    <TableRow key={upload.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                            <Upload className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{upload.fileName}</p>
                            <p className="text-xs text-gray-500">By {upload.uploadedBy}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {new Date(upload.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{upload.insights} insights</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 capitalize">
                          {upload.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
            
            {mockUploadHistory.length === 0 && (
              <Card className="p-12 text-center">
                <Upload className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">No uploads yet</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Upload documents to extract insights
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Upload Document
                </Button>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}