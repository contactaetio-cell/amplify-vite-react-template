import { useState } from 'react';
import { ArrowLeft, ExternalLink, Library } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../components/ui/select';
import { mockInsights } from '../data/mockData';

interface InsightLibraryProps {
  onViewInsight: (id: string) => void;
  onBack: () => void;
}

export function InsightLibrary({ onViewInsight, onBack }: InsightLibraryProps) {
  const [filters, setFilters] = useState({
    team: 'all',
    domain: 'all',
    confidence: 'all'
  });

  const filteredInsights = mockInsights.filter(insight => {
    if (filters.team !== 'all' && insight.team !== filters.team) return false;
    if (filters.domain !== 'all' && insight.domain !== filters.domain) return false;
    if (filters.confidence !== 'all') {
      const conf = insight.confidence;
      if (filters.confidence === 'high' && conf < 0.9) return false;
      if (filters.confidence === 'medium' && (conf < 0.7 || conf >= 0.9)) return false;
      if (filters.confidence === 'low' && conf >= 0.7) return false;
    }
    return true;
  });

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="gap-2 mb-4 -ml-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Discovery
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <Library className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-semibold text-gray-900">Insight Library</h1>
          </div>
          <p className="text-gray-600">
            Browse all published insights across your organization
          </p>
        </div>

        <div className="mb-6 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Filter by:</span>
            <Select
              value={filters.team}
              onValueChange={(value) => setFilters({ ...filters, team: value })}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                <SelectItem value="Data Science">Data Science</SelectItem>
                <SelectItem value="Product Team">Product Team</SelectItem>
                <SelectItem value="Growth Team">Growth Team</SelectItem>
                <SelectItem value="Strategy Team">Strategy Team</SelectItem>
                <SelectItem value="Design">Design</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.domain}
              onValueChange={(value) => setFilters({ ...filters, domain: value })}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Domains</SelectItem>
                <SelectItem value="Product Analytics">Product Analytics</SelectItem>
                <SelectItem value="Product Design">Product Design</SelectItem>
                <SelectItem value="Growth">Growth</SelectItem>
                <SelectItem value="Strategy">Strategy</SelectItem>
                <SelectItem value="Product Management">Product Management</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.confidence}
              onValueChange={(value) => setFilters({ ...filters, confidence: value })}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Confidence</SelectItem>
                <SelectItem value="high">High (90%+)</SelectItem>
                <SelectItem value="medium">Medium (70-89%)</SelectItem>
                <SelectItem value="low">Low (&lt;70%)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1" />

          <p className="text-sm text-gray-600">
            Showing <span className="font-medium text-gray-900">{filteredInsights.length}</span> of {mockInsights.length} insights
          </p>
        </div>

        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[350px]">Insight Statement</TableHead>
                <TableHead className="w-20 text-xs">Confidence</TableHead>
                <TableHead className="w-28 text-xs">Team</TableHead>
                <TableHead className="w-32 text-xs">Domain</TableHead>
                <TableHead className="w-28 text-xs">Published</TableHead>
                <TableHead className="w-20 text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInsights.map((insight) => (
                <TableRow key={insight.id} className="align-top">
                  <TableCell>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-900">{insight.statement}</p>
                      {insight.footnote && (
                        <div className="text-xs text-gray-500 italic border-l-2 border-gray-300 pl-3 mt-2">
                          {insight.footnote}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline" className="text-xs capitalize">
                          {insight.sourceType}
                        </Badge>
                        {insight.metadata.slice(0, 2).map((field) => (
                          <Badge key={field.id} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            {field.label}: {field.value}
                          </Badge>
                        ))}
                        {insight.metadata.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{insight.metadata.length - 2} more
                          </Badge>
                        )}
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
                    <span className="text-xs text-gray-900">{insight.domain}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-gray-600">
                      {new Date(insight.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onViewInsight(insight.id)}
                      className="text-blue-600 hover:text-blue-700 h-7 w-7 p-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <div className="mt-8 flex justify-center">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" className="bg-blue-50 text-blue-700">
              1
            </Button>
            <Button variant="outline" size="sm">
              2
            </Button>
            <Button variant="outline" size="sm">
              3
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}