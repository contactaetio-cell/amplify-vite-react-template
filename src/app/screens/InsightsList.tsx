import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import { getCurrentUser } from 'aws-amplify/auth';
import { useNavigate } from 'react-router';
import { fetchAllInsights, fetchInsights } from '../api/insights';
import type { Insight } from './data-source-connection/types';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

interface InsightsListProps {
  mode: 'all' | 'mine';
  onViewInsight: (id: string) => void;
}

const STATUS_OPTIONS = ['all', 'Pending', 'Completed', 'Rejected'];

export function InsightsList({ mode, onViewInsight }: InsightsListProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(mode === 'mine' ? null : '');

  useEffect(() => {
    let mounted = true;

    async function loadUserIfNeeded() {
      if (mode !== 'mine') {
        if (mounted) setUserId('');
        return;
      }

      try {
        const user = await getCurrentUser();
        if (mounted) {
          setUserId(user.userId);
        }
      } catch {
        if (mounted) {
          setError('Unable to load current user for My Insights.');
          setLoading(false);
        }
      }
    }

    void loadUserIfNeeded();

    return () => {
      mounted = false;
    };
  }, [mode]);

  useEffect(() => {
    let mounted = true;

    async function loadInsights() {
      if (mode === 'mine' && !userId) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data =
          mode === 'all'
            ? await fetchAllInsights()
            : await fetchInsights({
                user_id: userId ?? undefined,
                status: status === 'all' ? undefined : status,
              });

        if (mounted) {
          setInsights(data);
        }
      } catch {
        if (mounted) {
          setInsights([]);
          setError('Failed to load insights from backend.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadInsights();

    return () => {
      mounted = false;
    };
  }, [mode, status, userId]);

  const filteredInsights = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    const statusFiltered =
      status === 'all'
        ? insights
        : insights.filter((insight) => (insight.status ?? '').toLowerCase() === status.toLowerCase());

    if (!trimmed) return statusFiltered;

    return statusFiltered.filter((insight) => {
      const metadataValues = (insight.metadata ?? []).map((item) => item.value.toLowerCase());
      return (
        insight.text.toLowerCase().includes(trimmed) ||
        (insight.user_id ?? '').toLowerCase().includes(trimmed) ||
        (insight.s3_node ?? '').toLowerCase().includes(trimmed) ||
        metadataValues.some((value) => value.includes(trimmed))
      );
    });
  }, [insights, query, status]);

  const title = mode === 'mine' ? 'My Insights' : 'Browse All Insights';
  const subtitle =
    mode === 'mine'
      ? 'Insights created under your user account'
      : 'Explore all available insights across your organization';

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-4">
          <button
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
                return;
              }
              navigate('/dashboard/home');
            }}
            className="flex items-center gap-1 sm:gap-1.5 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm hidden sm:inline">Back</span>
          </button>
          <div className="w-px h-6 bg-gray-200" />
          <div>
            <h1 className="text-xl sm:text-3xl font-semibold text-gray-900 sm:mb-1">{title}</h1>
            <p className="text-gray-600 text-sm hidden sm:block">{subtitle}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search loaded insights..."
              className="pl-10 h-10"
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full sm:w-56 h-10">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option === 'all' ? 'All Statuses' : option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => navigate(mode === 'mine' ? '/dashboard/insights' : '/dashboard/my-insights')}
          >
            {mode === 'mine' ? 'Browse All' : 'My Insights'}
          </Button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          {loading ? 'Loading insights...' : `Showing ${filteredInsights.length} insight${filteredInsights.length === 1 ? '' : 's'}`}
        </p>

        {error && (
          <Card className="p-4 mb-4 border-red-200 bg-red-50 text-red-700 text-sm">
            {error}
          </Card>
        )}

        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[420px]">Insight</TableHead>
                <TableHead className="w-52">User</TableHead>
                <TableHead className="w-36">Status</TableHead>
                <TableHead className="w-60">Source</TableHead>
                <TableHead className="w-24">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!loading && filteredInsights.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-gray-500 py-10">
                    No insights found for current filters.
                  </TableCell>
                </TableRow>
              )}

              {filteredInsights.map((insight) => (
                <TableRow
                  key={insight.insight_id}
                  className="align-top cursor-pointer hover:bg-gray-50"
                  onClick={() => onViewInsight(insight.insight_id)}
                >
                  <TableCell>
                    <div className="space-y-2">
                      <p className="font-medium text-gray-900">{insight.text}</p>
                      <div className="flex flex-wrap gap-2">
                        {(insight.metadata ?? []).slice(0, 3).map((field, index) => (
                          <Badge key={`${insight.insight_id}-m-${index}`} variant="outline" className="text-xs">
                            {field.tag}: {field.value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-700">{insight.user_id ?? 'Unknown'}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{insight.status ?? 'Unknown'}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-gray-600 break-all">{insight.s3_node || insight.document_id || '-'}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(event) => {
                        event.stopPropagation();
                        onViewInsight(insight.insight_id);
                      }}
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
      </div>
    </div>
  );
}
