import { useState, useRef, useEffect } from 'react';
import { Search, Sparkles, TrendingUp, Bookmark, Award, ChevronDown, ChevronUp, ArrowLeft, MessageCircle, Send, User } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { mockInsights } from '../data/mockData';

interface HomeProps {
  onViewInsight: (id: string) => void;
  onNavigate?: (screen: string) => void;
}

interface SearchResult {
  query: string;
  aiSummary: string;
  insights: typeof mockInsights;
  timestamp: Date;
}

export function Home({ onViewInsight, onNavigate }: HomeProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState(false);
  const [currentResult, setCurrentResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(true);
  const [summaryShowFull, setSummaryShowFull] = useState(false);
  const [displayedQuery, setDisplayedQuery] = useState('');
  const [deepDiveMode, setDeepDiveMode] = useState(false);
  const [deepDiveMessages, setDeepDiveMessages] = useState<Array<{ role: 'user' | 'ai'; content: string }>>([]);
  const [deepDiveInput, setDeepDiveInput] = useState('');
  const [deepDiveLoading, setDeepDiveLoading] = useState(false);

  // Responsive placeholder for search input
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mock AI response generator
  const generateAIResponse = (query: string): { response: string; insights: typeof mockInsights } => {
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

    return { response, insights: relevantInsights };
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    setSearchMode(true);
    setIsLoading(true);
    setDisplayedQuery(searchQuery);
    setSummaryExpanded(true);
    setSummaryShowFull(false);
    setDeepDiveMode(false);
    setDeepDiveMessages([]);

    setTimeout(() => {
      const { response, insights } = generateAIResponse(searchQuery);
      
      setCurrentResult({
        query: searchQuery,
        aiSummary: response,
        insights: insights,
        timestamp: new Date()
      });

      setIsLoading(false);
      setSearchQuery('');
    }, 1000);
  };

  // Generate deep dive AI response
  const handleDeepDiveSend = () => {
    if (!deepDiveInput.trim() || deepDiveLoading) return;
    
    const userMsg = deepDiveInput.trim();
    setDeepDiveMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setDeepDiveInput('');
    setDeepDiveLoading(true);

    setTimeout(() => {
      // Mock contextual AI response based on the conversation
      const context = displayedQuery;
      let aiReply = '';
      
      if (userMsg.toLowerCase().includes('why') || userMsg.toLowerCase().includes('reason')) {
        aiReply = `Based on the ${currentResult?.insights.length || 0} insights analyzed for "${context}", the primary drivers appear to be:\n\n1. **Budget constraints** — 42% of lost deals cited budget freezes, particularly in mid-market. CFOs are extending approval cycles by 3-5 weeks on average.\n\n2. **Buying committee complexity** — Only 31% of opportunities are multi-threaded. Single-threaded deals close at just 14% vs 34% for multi-threaded.\n\n3. **Channel misalignment** — Social ads generate 34% of MQLs but only 11% of revenue. High-intent search channels are underfunded relative to their revenue contribution.\n\nWould you like me to break down any of these areas by segment or region?`;
      } else if (userMsg.toLowerCase().includes('recommend') || userMsg.toLowerCase().includes('action') || userMsg.toLowerCase().includes('should')) {
        aiReply = `Here are actionable recommendations based on the current insights:\n\n• **Quick win:** Shift 20% of paid social budget to content syndication and comparison page SEO — projected to save $800K+ annually while improving pipeline quality.\n\n• **Medium-term:** Implement mutual close plans and CFO-level business cases for all mid-market deals over $75K. This addresses the "no decision" problem that now accounts for 38% of losses.\n\n• **Strategic:** Scale the ABM program from 174 to 250 target accounts and add dedicated ABM SDRs for the top 50. Current ABM deals are 2.3x larger than non-ABM.\n\nEach recommendation has a clear ROI case from the referenced insights. Want me to model the projected revenue impact?`;
      } else if (userMsg.toLowerCase().includes('compare') || userMsg.toLowerCase().includes('trend') || userMsg.toLowerCase().includes('change')) {
        aiReply = `Comparing the current findings against prior period performance:\n\n• **Improving:** APAC expansion hit 147% of H2 quota. Australia ARR grew 210% YoY. ABM pipeline reached $12.8M in year one.\n\n• **Stable:** Content marketing continues to influence 48% of pipeline. Organic search CAC remains flat at $52.\n\n• **Declining:** Pipeline-to-close rate dropped from 26% to 18% QoQ. Email open rates fell from 24.8% to 19.2% YoY. Sales hiring ramp time increased from 5.1 to 7.2 months.\n\nThe overall trajectory suggests strong top-of-funnel but deteriorating mid-funnel efficiency. Shall I dig into a specific metric?`;
      } else {
        aiReply = `Great question. Looking at this from the perspective of "${context}":\n\nThe data across ${currentResult?.insights.length || 0} insights reveals several interconnected patterns across your sales and marketing operations.\n\nKey themes that emerge:\n• Pipeline quality matters more than volume — multi-threaded, ABM-sourced deals convert at 2-3x the rate of general pipeline\n• Channel efficiency is diverging — organic and content-driven leads produce far better revenue outcomes than paid social\n• Sales productivity has a massive gap — top performers spend 62% of time selling vs 38% for average reps\n• The "no decision" problem is growing — stalled deals now outnumber competitive losses\n\nI can explore any of these themes in more detail, or cross-reference specific segments and regions if helpful.`;
      }

      setDeepDiveMessages(prev => [...prev, { role: 'ai', content: aiReply }]);
      setDeepDiveLoading(false);
    }, 1200);
  };

  const handleQuickAction = (action: 'browse' | 'library' | 'top') => {
    if (onNavigate) {
      if (action === 'browse') {
        onNavigate('browse-insights');
      } else if (action === 'library') {
        onNavigate('my-library');
      } else if (action === 'top') {
        onNavigate('top-insights');
      }
    }
  };

  const renderWelcomeScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-semibold text-gray-900 mb-4">Welcome to Aetio</h1>
          <p className="text-xl text-gray-600">The Insights Marketplace</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={isMobile ? "Ask anything" : "Ask anything about insights across your organization..."}
              className="pl-14 pr-14 h-16 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-sm"
            />
            <Button
              onClick={handleSearch}
              disabled={!searchQuery.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 h-12 px-6 rounded-lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Search
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-3 text-center">Try: "Why is pipeline conversion declining?" or "What channels drive the most revenue?"</p>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <Button
            onClick={() => handleQuickAction('browse')}
            variant="outline"
            className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition-all"
          >
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <span className="font-medium">Browse All Insights</span>
          </Button>
          <Button
            onClick={() => handleQuickAction('library')}
            variant="outline"
            className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition-all"
          >
            <Bookmark className="w-6 h-6 text-blue-600" />
            <span className="font-medium">My Library</span>
          </Button>
          <Button
            onClick={() => handleQuickAction('top')}
            variant="outline"
            className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition-all"
          >
            <Award className="w-6 h-6 text-blue-600" />
            <span className="font-medium">Top Insights</span>
          </Button>
        </div>

        {/* Quick Suggestions */}
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Popular Questions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              'Why is pipeline conversion declining in mid-market?',
              'Which marketing channels have the best ROI?',
              'How is the ABM program performing?',
              'What are the top competitive threats?',
              'How can we improve sales rep productivity?',
              'What content drives the most pipeline?'
            ].map((question) => (
              <button
                key={question}
                onClick={() => {
                  setSearchQuery(question);
                  setTimeout(handleSearch, 100);
                }}
                className="text-left px-4 py-3 rounded-lg hover:bg-gray-50 text-sm text-gray-700 border border-gray-200 hover:border-blue-300 transition-all"
              >
                {question}
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [deepDiveMessages, deepDiveLoading]);

  const renderMarkdownLine = (line: string, i: number) => {
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

  const renderDeepDiveChatbot = () => (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Chatbot Header */}
      <div className="border-b border-gray-200 bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setDeepDiveMode(false);
                setDeepDiveMessages([]);
                setDeepDiveInput('');
              }}
              className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">AI Deep Dive</h2>
              <p className="text-xs text-gray-500">Exploring: {displayedQuery}</p>
            </div>
          </div>
          <Button
            onClick={() => {
              setDeepDiveMode(false);
              setDeepDiveMessages([]);
              setDeepDiveInput('');
            }}
            variant="outline"
            size="sm"
            className="text-gray-600"
          >
            Back to results
          </Button>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">
          {/* Initial context card — the AI summary that started this */}
          <div className="rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50/60 to-purple-50/40 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-900">Context from your search</span>
              <Badge variant="outline" className="text-xs bg-white/70 border-blue-200 text-blue-700 ml-auto">
                {currentResult?.insights.length || 0} insights referenced
              </Badge>
            </div>
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {currentResult?.aiSummary.split('\n').slice(0, 4).map(renderMarkdownLine)}
            </div>
          </div>

          {/* Empty state — suggestions */}
          {deepDiveMessages.length === 0 && (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Ask me anything about these insights</h3>
              <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                I have full context on the {currentResult?.insights.length || 0} insights from your search. Ask follow-up questions to explore deeper.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  'Why are these the top findings?',
                  'What actions should we take?',
                  'How has this changed over time?',
                  'Compare across segments',
                  'What are the risks?',
                  'Summarize in 3 bullet points'
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => {
                      setDeepDiveInput(prompt);
                    }}
                    className="text-sm px-4 py-2 rounded-full border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Conversation messages */}
          {deepDiveMessages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              )}
              <div className={`rounded-2xl px-5 py-4 max-w-[80%] ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 shadow-sm'
              }`}>
                <div className={`text-sm leading-relaxed whitespace-pre-line ${
                  msg.role === 'ai' ? 'text-gray-800' : ''
                }`}>
                  {msg.role === 'ai' ? (
                    msg.content.split('\n').map(renderMarkdownLine)
                  ) : msg.content}
                </div>
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {deepDiveLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Chat Input — sticky bottom */}
      <div className="border-t border-gray-200 bg-white px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Input
                value={deepDiveInput}
                onChange={(e) => setDeepDiveInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !deepDiveLoading && handleDeepDiveSend()}
                placeholder="Ask a follow-up question..."
                disabled={deepDiveLoading}
                className="pr-14 h-12 rounded-full border-gray-300 shadow-sm focus:shadow-md transition-shadow"
              />
              <Button
                onClick={handleDeepDiveSend}
                disabled={!deepDiveInput.trim() || deepDiveLoading}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 h-9 w-9 rounded-full p-0"
                size="sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSearchResults = () => (
    <div className="flex flex-col h-full">
      {/* Search Header - sticky top bar like Google */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setSearchMode(false);
                setCurrentResult(null);
                setSearchQuery('');
                setDisplayedQuery('');
              }}
              className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSearch()}
                placeholder={displayedQuery || "Search insights..."}
                disabled={isLoading}
                className="pl-12 pr-28 h-12 border-gray-300 rounded-full shadow-sm focus:shadow-md transition-shadow"
              />
              <Button
                onClick={handleSearch}
                disabled={!searchQuery.trim() || isLoading}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 h-9 px-5 rounded-full"
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
              About {currentResult.insights.length} insights for "<span className="font-medium text-gray-700">{displayedQuery}</span>"
            </p>
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
                        <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                          {linesToRender.map(renderLine)}
                        </div>
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
                            setDeepDiveMessages([]);
                            setDeepDiveInput('');
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
                    key={insight.id}
                    className="group py-5 border-b border-gray-100 last:border-b-0"
                  >
                    {/* Breadcrumb-style source line */}
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-semibold text-blue-700">{index + 1}</span>
                      </div>
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
                      onClick={() => onViewInsight(insight.id)}
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

              {/* Follow-up section at bottom */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Refine your search</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Why is pipeline conversion declining?',
                    'What channels drive the most revenue?',
                    'How is the ABM program performing?',
                    'What are the top competitive threats?',
                    'How can we improve sales rep productivity?',
                    'What content drives the most pipeline?'
                  ].map((question) => (
                    <button
                      key={question}
                      onClick={() => {
                        setSearchQuery(question);
                        setTimeout(() => {
                          handleSearch();
                        }, 50);
                      }}
                      className="text-sm px-4 py-2 rounded-full border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 transition-all"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      {deepDiveMode ? (
        renderDeepDiveChatbot()
      ) : searchMode ? (
        renderSearchResults()
      ) : (
        <div className="flex-1 overflow-auto p-8">
          {renderWelcomeScreen()}
        </div>
      )}
    </div>
  );
}