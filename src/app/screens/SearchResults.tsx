import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Search, Sparkles, ChevronDown, ChevronUp, ArrowLeft, MessageCircle } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { mockInsights } from '../data/mockData';
import { streamSearchInsights } from '../api/insights';
import type { SearchSource, SearchStreamSourceResultEvent } from '../api/insights';
import {
  availableSearchSources,
  defaultSearchSource,
  hasMultipleSearchSources,
  parseSearchSource,
  searchSourceLabel,
} from '../search/sourceOptions';
import type { Insight } from './data-source-connection/types';
import { DiveDeeperChat } from '../components/DiveDeeperChat';

interface SearchResultsProps {
  onViewInsight: (id: string, source?: SearchSource) => void;
}

type UiSearchInsight = (typeof mockInsights)[number] & {
  source: 'local' | 'gwi';
};

interface SearchResult {
  query: string;
  aiSummary: string;
  source: SearchSource;
  insights: UiSearchInsight[];
  sourceErrors: Array<{ source: 'local' | 'gwi'; message: string }>;
  timestamp: Date;
}

const searchResultCache = new Map<string, SearchResult>();

const formatSearchSource = (source: SearchSource): string => {
  if (source === 'all') return 'All Sources';
  return searchSourceLabel(source);
};

const formatResultSource = (source: 'local' | 'gwi'): string => (source === 'gwi' ? 'GWI' : 'Local');

const dedupeUiInsights = (insights: UiSearchInsight[]): UiSearchInsight[] => {
  const deduped = new Map<string, UiSearchInsight>();
  for (const insight of insights) {
    deduped.set(`${insight.source}:${insight.id}`, insight);
  }
  return Array.from(deduped.values());
};

const appendSourceResult = (
  previous: SearchResult | null,
  query: string,
  source: SearchSource,
  event: SearchStreamSourceResultEvent,
  mapInsight: (insight: Insight, index: number, eventSource: 'local' | 'gwi') => UiSearchInsight,
): SearchResult => {
  const mapped = event.insights.map((insight, index) => mapInsight(insight, index, event.source));
  const base: SearchResult = previous ?? {
    query,
    source,
    aiSummary: '',
    insights: [],
    sourceErrors: [],
    timestamp: new Date(),
  };

  const filteredExisting = base.insights.filter((insight) => insight.source !== event.source);
  return {
    ...base,
    insights: dedupeUiInsights([...filteredExisting, ...mapped]),
    timestamp: new Date(),
  };
};

export function SearchResults({ onViewInsight }: SearchResultsProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSource, setSearchSource] = useState<SearchSource>(defaultSearchSource);
  const [currentResult, setCurrentResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(true);
  const [summaryShowFull, setSummaryShowFull] = useState(false);
  const [displayedQuery, setDisplayedQuery] = useState('');
  const [displayedSource, setDisplayedSource] = useState<SearchSource>(defaultSearchSource);
  const [deepDiveMode, setDeepDiveMode] = useState(false);
  const [isSummaryStreaming, setIsSummaryStreaming] = useState(false);
  const activeSearchControllerRef = useRef<AbortController | null>(null);

  const metadataLabelFromTag = (tag: string) =>
    tag
      .split('_')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

  const mapSearchInsightToUiInsight = (
    backendInsight: Insight,
    index: number,
    source: 'local' | 'gwi',
  ): UiSearchInsight => {
    const metadata = (backendInsight.metadata ?? []).map((entry, i) => ({
      id: `${backendInsight.insight_id}-m-${i}`,
      label: metadataLabelFromTag(entry.tag),
      value: entry.value,
      type: 'text' as const,
    }));

    const sourceType = backendInsight.s3_node?.toLowerCase().includes('.pdf') ? 'document' : 'manual';
    const tags = (backendInsight.metadata ?? []).map((entry) => entry.tag);

    return {
      id: backendInsight.insight_id,
      statement: backendInsight.text,
      dataPoints: [
        {
          id: `${backendInsight.insight_id}-dp-0`,
          value: backendInsight.text,
          source: backendInsight.s3_node || 'search',
        },
      ],
      footnote: backendInsight.s3_node || 'Search result',
      sourceType,
      confidence: 0.8,
      tags,
      team: backendInsight.user_id || 'Aetio',
      domain: 'insights',
      author: 'Aetio',
      date: new Date().toISOString(),
      expiration: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      status: backendInsight.status === 'completed' ? 'published' : 'draft',
      metadata,
      views: index + 1,
      source,
    };
  };

  // Mock AI response generator fallback
  const generateAIResponse = (query: string): { response: string; insights: UiSearchInsight[] } => {
    // Filter insights based on query keywords
    const queryLower = query.toLowerCase();
    const keywords = queryLower.split(' ').filter(word => word.length > 3);
    
    let relevantInsights = mockInsights.filter(insight => {
      const insightText = `${insight.statement} ${insight.team} ${insight.metadata.map(m => m.value).join(' ')}`.toLowerCase();
      return keywords.some(keyword => insightText.includes(keyword));
    }).slice(0, 5);

    // If no insights found, return a broader set
    if (relevantInsights.length === 0) {
      relevantInsights = mockInsights.slice(0, 5);
    }

    // Analyze the insights and generate a summary
    const teams = Array.from(new Set(relevantInsights.map(i => i.team)));
    const sourceTypes = Array.from(new Set(relevantInsights.map(i => i.sourceType)));
    
    // Calculate average confidence if available
    const totalDataPoints = relevantInsights.reduce((sum, i) => sum + i.dataPoints.length, 0);
    
    // Generate analytical response based on query
    let response = '';
    
    if (queryLower.includes('pipeline') || queryLower.includes('conversion') || queryLower.includes('win rate')) {
      response = `**Analysis Summary:** I've identified ${relevantInsights.length} insights related to pipeline performance and conversion rates.\n\n**Key Findings:**\n• Research spans ${teams.length} teams (${teams.join(', ')})\n• ${totalDataPoints} supporting data points across all insights\n• Pipeline-to-close rate declined to 18% in Q4, with mid-market most affected\n\n**Insights:** Budget freezes and extended procurement cycles are the primary drivers of declining win rates. "No decision" has overtaken competitive losses as the #1 loss reason at 38% of lost deals. Multi-threaded deals (3+ stakeholders) close at 2.4x the rate of single-threaded ones. See the detailed insights below for segment-specific breakdowns and recommended actions.`;
    } else if (queryLower.includes('cac') || queryLower.includes('acquisition cost') || queryLower.includes('paid') || queryLower.includes('ads')) {
      response = `**Analysis Summary:** Found ${relevantInsights.length} insights analyzing customer acquisition costs and paid channel efficiency.\n\n**Key Findings:**\n• Data sources: ${sourceTypes.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')}\n• ${totalDataPoints} quantitative data points\n• Paid search CAC has risen 34% YoY to $487 per qualified lead\n\n**Insights:** Organic search CAC remains flat at $52, making it 9.4x more efficient than paid channels. Branded keyword CPCs rose 28% due to competitor bidding. Social ads generate 34% of MQLs but only 11% of closed-won revenue, while search drives 52% of revenue from 28% of MQLs. A strategic channel mix rebalance could save $800K+ annually.`;
    } else if (queryLower.includes('abm') || queryLower.includes('account') || queryLower.includes('enterprise')) {
      response = `**Analysis Summary:** ${relevantInsights.length} insights covering ABM programs and enterprise sales motions.\n\n**Key Findings:**\n• Research from ${teams.join(', ')} teams\n• ${totalDataPoints} enterprise-specific data points\n• ABM program generated $12.8M pipeline from Fortune 1000 targets\n\n**Insights:** ABM deal sizes are 2.3x larger than non-ABM enterprise deals ($234K vs $102K ACV). Enterprise deals with event-engaged champions convert at 41% vs 19% without. APAC is outperforming at 147% of H2 quota, led by Australia and Singapore. See referenced insights for tactical recommendations and regional breakdowns.`;
    } else if (queryLower.includes('content') || queryLower.includes('seo') || queryLower.includes('blog')) {
      response = `**Analysis Summary:** ${relevantInsights.length} insights on content marketing effectiveness and pipeline attribution.\n\n**Key Findings:**\n• ${totalDataPoints} data points across content performance metrics\n• Content influenced $34.2M in pipeline (48% of total new pipeline)\n• "Vs" comparison pages generate 6.3x more pipeline per page than any other format\n\n**Insights:** Buyers consume an average of 4.7 content pieces before qualifying as SQL. Case studies are the #1 requested content by 78% of sales reps, but production fell 60% short of target. Gated content ("State of Revenue Operations" report) generated 2,847 MQLs at just $23 CPL. Review insights below for content strategy recommendations.`;
    } else if (queryLower.includes('email') || queryLower.includes('outbound') || queryLower.includes('sequence')) {
      response = `**Analysis Summary:** ${relevantInsights.length} insights examining email and outbound sequence performance.\n\n**Key Findings:**\n• Sources: ${sourceTypes.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')}\n• ${totalDataPoints} email-specific metrics analyzed\n• Email open rates declined to 19.2% (from 24.8% YoY)\n\n**Insights:** Sender reputation dropped from 92 to 78, impacting deliverability across all campaigns. Personalized case study sequences produce 2.8x higher reply rates vs generic product messaging. List fatigue from 3-4 emails/week is a root cause. Aggressive list hygiene and AI-driven send-time optimization are recommended. See insights below for specific remediation steps.`;
    } else if (queryLower.includes('competitor') || queryLower.includes('competitive') || queryLower.includes('displacement')) {
      response = `**Analysis Summary:** ${relevantInsights.length} insights on competitive landscape and displacement strategies.\n\n**Key Findings:**\n• ${totalDataPoints} competitive intelligence data points\n• Displacement campaigns generated $6.4M in pipeline with 31% win rate\n• Competitor Drift captured 14% of churned SMB accounts\n\n**Insights:** Custom migration tooling was cited as the #1 differentiator by 68% of displacement deal winners. Competitive losses have actually declined from 29% to 24%, but "no decision" losses have risen to 38%. Brand awareness remains below key competitors Clari (31%) and Gong (27%). Review insights below for specific competitive strategies.`;
    } else if (queryLower.includes('pricing') || queryLower.includes('churn') || queryLower.includes('retention')) {
      response = `**Analysis Summary:** ${relevantInsights.length} insights on pricing strategy, churn, and revenue retention.\n\n**Key Findings:**\n• Research spans ${teams.length} teams (${teams.join(', ')})\n• ${totalDataPoints} data points analyzing revenue and retention\n• Net revenue retention hit 118%, driven by usage-based upsells\n\n**Insights:** Annual-only pricing increased ACV by 22% and reduced churn by 8%, with a net +$1.2M annual impact despite 15% fewer signups. Customer expansion revenue grew 28% YoY to $9.7M. PLG free-to-paid conversion sits at 4.2% — below the 6.8% benchmark. "Connect CRM" activation step is the strongest predictor of conversion at 11.3%.`;
    } else if (queryLower.includes('sales') && (queryLower.includes('productivity') || queryLower.includes('rep') || queryLower.includes('hiring') || queryLower.includes('ramp'))) {
      response = `**Analysis Summary:** ${relevantInsights.length} insights on sales team productivity and performance.\n\n**Key Findings:**\n• ${totalDataPoints} data points from time-motion studies and cohort analysis\n• Top reps spend 62% of time in active selling vs 38% for average performers\n• Sales hiring ramp time increased to 7.2 months (from 5.1 in 2024)\n\n**Insights:** CRM data entry (5.2 hrs/week), internal meetings (4.8 hrs/week), and manual forecasting (2.1 hrs/week) are the top productivity drains. Structured onboarding cuts ramp by 2.1 months. Only 34% of new hires hit quota in their first full quarter. AI-powered CRM auto-capture could save 4+ hours per rep per week.`;
    } else {
      response = `**Analysis Summary:** Discovered ${relevantInsights.length} relevant insights across your sales and marketing data.\n\n**Key Findings:**\n• Research spans ${teams.length} teams: ${teams.join(', ')}\n• ${totalDataPoints} supporting data points\n• Data sources: ${sourceTypes.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')}\n\n**Insights:** The analysis surfaces optimization opportunities across pipeline management, channel mix, and go-to-market strategy. Notable findings include declining mid-market conversion rates, strong ABM program ROI, and content marketing influence on 48% of total pipeline. The insights below provide detailed metrics and actionable recommendations for each area.`;
    }

    return {
      response,
      insights: relevantInsights.map((insight) => ({
        ...insight,
        source: 'local',
      })),
    };
  };

  const runSearch = async (query: string, source: SearchSource) => {
    const cacheKey = `${source}::${query}`;
    const cached = searchResultCache.get(cacheKey);
    setDisplayedQuery(query);
    setDisplayedSource(source);
    setSummaryExpanded(true);
    setSummaryShowFull(false);
    setDeepDiveMode(false);
    setIsSummaryStreaming(false);
    setSearchQuery(query);
    setSearchSource(source);
    console.log("Running search for query:", query);
    if (cached) {
      activeSearchControllerRef.current?.abort();
      activeSearchControllerRef.current = null;
      setCurrentResult(cached);
      setIsLoading(false);
      console.log("Loaded search result from cache for query:", query);
      return;
    }

    activeSearchControllerRef.current?.abort();
    const controller = new AbortController();
    activeSearchControllerRef.current = controller;
    setIsLoading(true);

    try {
      let hasSourceResultEvents = false;
      let latestSourceInsights: UiSearchInsight[] = [];
      let latestSourceErrors: Array<{ source: 'local' | 'gwi'; message: string }> = [];
      console.log("Initiating streaming search API call for query:", query);
      const response = await streamSearchInsights(query, {
        source,
        pagination: { limit: 25 },
        signal: controller.signal,
        onResults: (event) => {
          if (hasSourceResultEvents) {
            return;
          }
          const inferredSource: 'local' | 'gwi' = source === 'gwi' ? 'gwi' : 'local';
          const results = event.insights.map((item, index) =>
            mapSearchInsightToUiInsight(item, index, inferredSource),
          );
          setCurrentResult({
            query,
            source,
            aiSummary: '',
            insights: results,
            sourceErrors: [],
            timestamp: new Date(),
          });
          latestSourceInsights = results;
          latestSourceErrors = [];
          setIsLoading(false);
          setIsSummaryStreaming(true);
        },
        onSourceResult: (event: SearchStreamSourceResultEvent) => {
          hasSourceResultEvents = true;
          setCurrentResult((previous) => {
            const next = appendSourceResult(previous, query, source, event, mapSearchInsightToUiInsight);
            latestSourceInsights = next.insights;
            latestSourceErrors = next.sourceErrors;
            return next;
          });
          setIsLoading(false);
          setIsSummaryStreaming(true);
        },
        onError: (event) => {
          if (!event.source) {
            return;
          }
          setCurrentResult((previous) => {
            const baseResult: SearchResult = previous ?? {
              query,
              source,
              aiSummary: '',
              insights: [],
              sourceErrors: [],
              timestamp: new Date(),
            };

            const remaining = baseResult.sourceErrors.filter((entry) => entry.source !== event.source);
            return {
              ...baseResult,
              sourceErrors: [...remaining, { source: event.source, message: event.message }],
            };
          });
          latestSourceErrors = [
            ...latestSourceErrors.filter((entry) => entry.source !== event.source),
            { source: event.source, message: event.message },
          ];
          setIsLoading(false);
        },
        onSummaryToken: (event) => {
          setIsLoading(false);
          setIsSummaryStreaming(true);
          setCurrentResult((previous) => {
            if (!previous || previous.query !== query) return previous;
            return {
              ...previous,
              aiSummary: `${previous.aiSummary}${event.text}`,
            };
          });
        },
      });

      if (controller.signal.aborted) {
        return;
      }

      const fallbackSource: 'local' | 'gwi' = source === 'gwi' ? 'gwi' : 'local';
      const responseInsights = response.insights.map((item, index) =>
        mapSearchInsightToUiInsight(item, index, fallbackSource),
      );
      const insights =
        latestSourceInsights.length > 0 && hasSourceResultEvents
          ? latestSourceInsights
          : dedupeUiInsights(responseInsights);
      const result: SearchResult = {
        query,
        source,
        aiSummary:
          response.summary.trim() ||
          `Found ${response.insights.length} insight${response.insights.length === 1 ? '' : 's'} for "${query}".`,
        insights,
        sourceErrors: latestSourceErrors,
        timestamp: new Date(),
      };
      searchResultCache.set(cacheKey, result);
      setCurrentResult(result);
    } catch (error) {
      if ((error as Error)?.name === 'AbortError') {
        return;
      }
      if (activeSearchControllerRef.current !== controller) {
        return;
      }
      console.error("Error during search API call:", error);
      const { response, insights } = generateAIResponse(query);
      const result: SearchResult = {
        query,
        source,
        aiSummary: response,
        insights,
        sourceErrors: [],
        timestamp: new Date(),
      };
      searchResultCache.set(cacheKey, result);
      setCurrentResult(result);
    } finally {
      if (activeSearchControllerRef.current === controller) {
        activeSearchControllerRef.current = null;
        setIsSummaryStreaming(false);
        setIsLoading(false);
      }
    }
  };

  const handleSearch = async (queryOverride?: string) => {
    const query = (queryOverride ?? searchQuery).trim();
    if (!query || isLoading) return;

    const target = `/dashboard/search?q=${encodeURIComponent(query)}&source=${encodeURIComponent(searchSource)}`;
    const searchParams = new URLSearchParams(location.search);
    const currentQuery = searchParams.get('q')?.trim() ?? '';
    const currentSource = parseSearchSource(searchParams.get('source'));
    const alreadyOnTarget = currentQuery === query && currentSource === searchSource;

    if (alreadyOnTarget) {
      await runSearch(query, searchSource);
      return;
    }

    navigate(target);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q')?.trim() ?? '';
    const source = parseSearchSource(params.get('source'));
    if (!query) return;
    if (isLoading) return;
    if (query === displayedQuery && source === displayedSource && currentResult) {
      return;
    }

    void runSearch(query, source);
  }, [location.pathname, location.search]);

  useEffect(() => {
    return () => {
      activeSearchControllerRef.current?.abort();
      activeSearchControllerRef.current = null;
    };
  }, []);

  const renderSearchResults = () => (
    <div className="flex flex-col h-full">
      {/* Search Header - sticky top bar like Google */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setCurrentResult(null);
                setSearchQuery('');
                setDisplayedQuery('');
                setSearchSource(defaultSearchSource);
                setDisplayedSource(defaultSearchSource);
                navigate('/dashboard/home');
              }}
              className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSearch()}
                  placeholder={displayedQuery || "Search insights..."}
                  disabled={isLoading}
                  className="pl-12 h-12 border-gray-300 rounded-full shadow-sm focus:shadow-md transition-shadow"
                />
              </div>
              {hasMultipleSearchSources && (
                <select
                  value={searchSource}
                  onChange={(event) => setSearchSource(parseSearchSource(event.target.value))}
                  disabled={isLoading}
                  className="h-10 min-w-[110px] rounded-full border border-gray-300 bg-white px-3 text-sm text-gray-700 shadow-sm focus:border-blue-400 focus:outline-none"
                >
                  {availableSearchSources.map((source) => (
                    <option key={source} value={source}>
                      {searchSourceLabel(source)}
                    </option>
                  ))}
                </select>
              )}
              <Button
                onClick={() => handleSearch()}
                disabled={!searchQuery.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700 h-10 px-5 rounded-full"
                size="sm"
              >
                <Sparkles className="w-4 h-4 mr-1.5" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Body */}
      <div className="flex-1 overflow-auto bg-white">
        <div className="max-w-4xl mx-auto px-6 py-6">
          {/* Results count / query echo */}
          {currentResult && !isLoading && (
            <p className="text-sm text-gray-500 mb-6">
              About {currentResult.insights.length} insights for "<span className="font-medium text-gray-700">{displayedQuery}</span>" from{' '}
              <span className="font-medium text-gray-700">{formatSearchSource(displayedSource)}</span>
            </p>
          )}

          {currentResult && currentResult.sourceErrors.length > 0 && (
            <div className="mb-6 space-y-2">
              {currentResult.sourceErrors.map((entry) => (
                <div
                  key={`${entry.source}:${entry.message}`}
                  className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800"
                >
                  {formatResultSource(entry.source)} source error: {entry.message}
                </div>
              ))}
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-6">
              {/* AI Summary skeleton */}
              <div className="rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50/60 to-purple-50/40 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 animate-pulse" />
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="space-y-3">
                  <div className="h-3 w-full bg-gray-200/70 rounded animate-pulse" />
                  <div className="h-3 w-5/6 bg-gray-200/70 rounded animate-pulse" />
                  <div className="h-3 w-4/6 bg-gray-200/70 rounded animate-pulse" />
                  <div className="h-3 w-3/4 bg-gray-200/70 rounded animate-pulse" />
                </div>
              </div>
              {/* Result row skeletons */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="py-4 border-b border-gray-100">
                  <div className="h-3 w-32 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-3 w-full bg-gray-100 rounded animate-pulse" />
                </div>
              ))}
            </div>
          )}

          {currentResult && !isLoading && (
            <div className="space-y-2">
              {/* AI Overview - collapsible card with truncation + deep dive */}
              <div className="rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50/60 to-purple-50/40 mb-8 overflow-hidden">
                {/* Header toggle */}
                <button
                  onClick={() => setSummaryExpanded(!summaryExpanded)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="font-semibold text-gray-900">AI Overview</span>
                    <Badge variant="outline" className="text-xs bg-white/70 border-blue-200 text-blue-700">
                      Beta
                    </Badge>
                    {isSummaryStreaming && (
                      <Badge variant="outline" className="text-xs bg-white/80 border-blue-200 text-blue-700">
                        Streaming
                      </Badge>
                    )}
                  </div>
                  {summaryExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {summaryExpanded && (() => {
                  const allLines = currentResult.aiSummary.split('\n');
                  const previewLines = allLines.slice(0, 6);
                  const hasMore = allLines.length > 6;
                  const linesToRender = summaryShowFull ? allLines : previewLines;

                  const renderLine = (line: string, i: number) => {
                    if (line.startsWith('**') && line.endsWith('**')) {
                      const text = line.replace(/\*\*/g, '');
                      return <h4 key={i} className="font-semibold text-gray-900 mt-3 mb-1 first:mt-0">{text}</h4>;
                    }
                    if (line.startsWith('• ')) {
                      return <li key={i} className="ml-4 text-gray-700 mb-0.5">{line.slice(2)}</li>;
                    }
                    const parts = line.split(/\*\*(.*?)\*\*/g);
                    if (parts.length > 1) {
                      return (
                        <p key={i} className="mb-1">
                          {parts.map((part, j) =>
                            j % 2 === 1 ? <strong key={j} className="text-gray-900">{part}</strong> : <span key={j}>{part}</span>
                          )}
                        </p>
                      );
                    }
                    if (line.trim() === '') return <div key={i} className="h-2" />;
                    return <p key={i} className="mb-1">{line}</p>;
                  };

                  return (
                    <div className="px-6 pb-5">
                      {/* Summary content with truncation */}
                      <div className="relative">
                        {currentResult.aiSummary.trim().length > 0 ? (
                          <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                            {linesToRender.map(renderLine)}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-600 italic">
                            {isSummaryStreaming ? 'Generating summary...' : 'Summary unavailable.'}
                          </p>
                        )}
                        {/* Fade overlay when truncated */}
                        {hasMore && !summaryShowFull && (
                          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-blue-50/90 to-transparent pointer-events-none" />
                        )}
                      </div>

                      {/* Show more / Show less toggle */}
                      {hasMore && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSummaryShowFull(!summaryShowFull);
                          }}
                          className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors font-medium"
                        >
                          {summaryShowFull ? (
                            <>
                              Show less
                              <ChevronUp className="w-4 h-4" />
                            </>
                          ) : (
                            <>
                              Show more
                              <ChevronDown className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      )}

                      {/* Dive deeper in AI mode — CTA button only */}
                      <div className="mt-4 pt-4 border-t border-blue-100/80">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeepDiveMode(true);
                          }}
                          className="group flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-white/60 hover:bg-white border border-blue-100 hover:border-blue-300 transition-all"
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                            <MessageCircle className="w-4 h-4 text-white" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-medium text-gray-900">Dive deeper in AI mode</p>
                            <p className="text-xs text-gray-500">Ask follow-up questions about these findings</p>
                          </div>
                          <ArrowLeft className="w-4 h-4 text-gray-400 ml-auto rotate-180" />
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Search Results - Google-style rows */}
              <div>
                {currentResult.insights.map((insight, index) => (
                  <div
                    key={`${insight.source}:${insight.id}`}
                    className="group py-5 border-b border-gray-100 last:border-b-0"
                  >
                    {/* Breadcrumb-style source line */}
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-semibold text-blue-700">{index + 1}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px] uppercase tracking-wide border-blue-200 text-blue-700 bg-blue-50">
                        {formatResultSource(insight.source)}
                      </Badge>
                      <span className="text-xs text-gray-500">{insight.team}</span>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-xs text-gray-500 capitalize">{insight.sourceType}</span>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-xs text-gray-500">
                        {new Date(insight.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    {/* Title - clickable like Google blue links */}
                    <button
                      onClick={() => onViewInsight(insight.id, insight.source)}
                      className="text-left mb-1.5 group-hover:underline"
                    >
                      <h3 className="text-lg text-blue-700 group-hover:text-blue-800">
                        {insight.statement.length > 120
                          ? insight.statement.slice(0, 120) + '...'
                          : insight.statement}
                      </h3>
                    </button>

                    {/* Snippet / supporting details */}
                    <p className="text-sm text-gray-600 mb-2.5 line-clamp-2">
                      {insight.dataPoints?.[0]?.description || insight.statement}
                    </p>

                    {/* Metadata tags */}
                    <div className="flex items-center flex-wrap gap-2">
                      {insight.metadata.slice(0, 3).map((field) => (
                        <Badge
                          key={field.id}
                          variant="outline"
                          className="text-xs bg-gray-50 text-gray-600 border-gray-200 font-normal"
                        >
                          {field.label}: {field.value}
                        </Badge>
                      ))}
                      {insight.dataPoints && insight.dataPoints.length > 0 && (
                        <span className="text-xs text-gray-400">
                          {insight.dataPoints.length} data point{insight.dataPoints.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      {deepDiveMode && currentResult ? (
        <DiveDeeperChat
          displayedQuery={displayedQuery}
          aiSummary={currentResult.aiSummary}
          selectedInsightIds={currentResult.insights.map((insight) => insight.id)}
          totalInsightCount={currentResult.insights.length}
          onBack={() => {
            setDeepDiveMode(false);
          }}
        />
      ) : renderSearchResults()}
    </div>
  );
}
