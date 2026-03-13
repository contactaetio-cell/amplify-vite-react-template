import { useState } from 'react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import {
  BookOpen,
  CheckCheck,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Database,
  ExternalLink,
  Eye,
  EyeOff,
  File,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Link2,
  PenLine,
  Plus,
  Trash2,
  X,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { QueueItem } from './types';

interface PendingInsight {
  id: string;
  statement: string;
  footnote: string;
  sourceDocId: string;
  sourceFile: string;
  sourceFileUrl: string;
  team: string;
  sourceType: string;
  sharingLevel: string;
  analysisStart: string;
  analysisEnd: string;
  expiration: string;
  customFields: { label: string; value: string }[];
}

export function ApprovalReviewPanel({
  queueItem,
  onBack,
  onApprove
}: {
  queueItem: QueueItem;
  onBack: () => void;
  onApprove: () => void;
}) {
  const generateInsightsForQueue = (item: QueueItem): PendingInsight[] => {
    const insightBank: Record<string, PendingInsight[]> = {
      'QUEUE-2026-001': [
        { id: 'pi1', statement: 'Mid-market segment shows 34% higher conversion rate when SDR-qualified vs self-serve trials, indicating value of human touch in this segment.', footnote: 'Source: Q1 Pipeline Analysis, pp. 14–18. Methodology: compared cohorts of SDR-qualified vs self-serve trial accounts (n=342) over a 90-day window.', sourceDocId: 'od1', sourceFile: 'Q1_2026_Pipeline_Analysis.pdf', sourceFileUrl: '#', team: 'Sales', sourceType: 'document', sharingLevel: 'internal', analysisStart: '2026-01-01', analysisEnd: '2026-03-31', expiration: '2026-09-30', customFields: [{ label: 'Segment', value: 'Mid-Market' }, { label: 'Region', value: 'North America' }] },
        { id: 'pi3', statement: 'Enterprise segment CAC decreased 22% QoQ due to improved lead scoring model accuracy, saving an estimated $340K annually.', footnote: 'Source: Q1 Pipeline Analysis, pp. 22–25. Based on fully-loaded CAC calculation including marketing and sales costs.', sourceDocId: 'od1', sourceFile: 'Q1_2026_Pipeline_Analysis.pdf', sourceFileUrl: '#', team: 'Sales', sourceType: 'document', sharingLevel: 'internal', analysisStart: '2026-01-01', analysisEnd: '2026-03-31', expiration: '2026-09-30', customFields: [{ label: 'Segment', value: 'Enterprise' }] },
        { id: 'pi5', statement: 'Multi-threaded deals (3+ stakeholders engaged) close at 2.1x the rate of single-threaded deals in enterprise accounts.', footnote: 'Source: Q1 Pipeline Analysis, pp. 31–34. Analysis of 156 enterprise opportunities by stakeholder engagement count.', sourceDocId: 'od1', sourceFile: 'Q1_2026_Pipeline_Analysis.pdf', sourceFileUrl: '#', team: 'Sales', sourceType: 'document', sharingLevel: 'internal', analysisStart: '2026-01-01', analysisEnd: '2026-03-31', expiration: '2026-09-30', customFields: [{ label: 'Segment', value: 'Enterprise' }] },
        { id: 'pi7', statement: 'Pipeline velocity increased 28% in mid-market segment after implementing SDR-led outbound sequences targeting ICP-matched accounts.', footnote: 'Source: Q1 Pipeline Analysis, pp. 38–41. Pre/post comparison over 60-day windows.', sourceDocId: 'od1', sourceFile: 'Q1_2026_Pipeline_Analysis.pdf', sourceFileUrl: '#', team: 'Sales', sourceType: 'document', sharingLevel: 'controlled', analysisStart: '2026-01-01', analysisEnd: '2026-03-31', expiration: '2026-09-30', customFields: [{ label: 'Segment', value: 'Mid-Market' }] },
        { id: 'pi2', statement: 'Email campaigns with personalized subject lines see 23% higher open rates and 18% higher click-through rates compared to generic messaging.', footnote: 'Based on A/B test across 48 campaigns (Oct 2025 – Feb 2026). Statistical significance p<0.01 for both open rate and CTR metrics.', sourceDocId: 'od2', sourceFile: 'Email_Campaign_Performance_Report.pdf', sourceFileUrl: '#', team: 'Marketing', sourceType: 'dashboard', sharingLevel: 'controlled', analysisStart: '2025-10-01', analysisEnd: '2026-02-28', expiration: '2026-08-31', customFields: [{ label: 'Channel', value: 'Email' }] },
        { id: 'pi4', statement: 'Webinar-to-demo conversion rate improved from 8% to 14% after introducing personalized follow-up sequences within 24 hours.', footnote: 'Email Campaign Performance Report, Section 4. Comparison of 12 webinars pre/post implementation.', sourceDocId: 'od2', sourceFile: 'Email_Campaign_Performance_Report.pdf', sourceFileUrl: '#', team: 'Marketing', sourceType: 'dashboard', sharingLevel: 'internal', analysisStart: '2025-10-01', analysisEnd: '2026-02-28', expiration: '2026-08-31', customFields: [{ label: 'Channel', value: 'Email + Webinar' }] },
        { id: 'pi6', statement: 'Blog content with interactive ROI calculators generates 5x more form submissions than static content.', footnote: 'Email Campaign Performance Report, Section 7. Tracked 24 blog posts with calculators vs 50 static posts over 4 months.', sourceDocId: 'od2', sourceFile: 'Email_Campaign_Performance_Report.pdf', sourceFileUrl: '#', team: 'Marketing', sourceType: 'document', sharingLevel: 'controlled', analysisStart: '2025-10-01', analysisEnd: '2026-02-28', expiration: '2026-08-31', customFields: [{ label: 'Content Type', value: 'Interactive' }] },
        { id: 'pi8', statement: 'SDR outbound sequences with 5-touch cadences outperform 3-touch by 31% in reply rate for enterprise prospects.', footnote: 'SDR Outbound Effectiveness Deck, Slide 8. Analysis of 1,200 sequences across 3 SDR teams.', sourceDocId: 'od3', sourceFile: 'SDR_Outbound_Effectiveness_Deck.pptx', sourceFileUrl: '#', team: 'Sales', sourceType: 'document', sharingLevel: 'internal', analysisStart: '2026-01-01', analysisEnd: '2026-02-28', expiration: '2026-08-31', customFields: [{ label: 'Channel', value: 'Outbound' }] },
        { id: 'pi9', statement: 'Prospects who attend live product demos convert 38% higher than those who only view recorded demos.', footnote: 'SDR Outbound Effectiveness Deck, Slide 14. Based on conversion tracking of 430 demo attendees.', sourceDocId: 'od3', sourceFile: 'SDR_Outbound_Effectiveness_Deck.pptx', sourceFileUrl: '#', team: 'Sales', sourceType: 'document', sharingLevel: 'internal', analysisStart: '2026-01-01', analysisEnd: '2026-02-28', expiration: '2026-08-31', customFields: [] },
        { id: 'pi10', statement: 'Social selling index scores above 70 correlate with 15% higher quota attainment among AEs.', footnote: 'SDR Outbound Effectiveness Deck, Slide 19. Correlation analysis across 48 AEs over 2 quarters.', sourceDocId: 'od3', sourceFile: 'SDR_Outbound_Effectiveness_Deck.pptx', sourceFileUrl: '#', team: 'Sales', sourceType: 'document', sharingLevel: 'controlled', analysisStart: '2025-07-01', analysisEnd: '2026-02-28', expiration: '2026-08-31', customFields: [{ label: 'Platform', value: 'LinkedIn' }] },
        { id: 'pi11', statement: 'Customer referral program generates leads with 60% shorter sales cycles compared to all other channels.', footnote: 'Channel ROI Comparison Q1, Tab "Referrals". Based on 89 referral-sourced deals closed in Q4–Q1.', sourceDocId: 'od4', sourceFile: 'Channel_ROI_Comparison_Q1.xlsx', sourceFileUrl: '#', team: 'Sales', sourceType: 'document', sharingLevel: 'internal', analysisStart: '2025-10-01', analysisEnd: '2026-03-31', expiration: '2026-09-30', customFields: [{ label: 'Channel', value: 'Referral' }] },
        { id: 'pi12', statement: 'Content syndication campaigns on LinkedIn drove 3.2x more MQLs than organic social, with 19% lower CPL.', footnote: 'Channel ROI Comparison Q1, Tab "Paid vs Organic". Comparison of 32 syndication vs 45 organic campaigns.', sourceDocId: 'od4', sourceFile: 'Channel_ROI_Comparison_Q1.xlsx', sourceFileUrl: '#', team: 'Marketing', sourceType: 'dashboard', sharingLevel: 'controlled', analysisStart: '2025-10-01', analysisEnd: '2026-03-31', expiration: '2026-09-30', customFields: [{ label: 'Channel', value: 'LinkedIn' }] },
      ],
      'QUEUE-2026-002': [
        { id: 'pi13', statement: 'Case study content featuring quantified ROI metrics generates 4.2x more downloads than narrative-only formats.', footnote: 'Content Format Effectiveness Report, pp. 8–11. Tracked 36 case studies over 6 months.', sourceDocId: 'od5', sourceFile: 'Content_Format_Effectiveness_Report.pdf', sourceFileUrl: '#', team: 'Marketing', sourceType: 'document', sharingLevel: 'controlled', analysisStart: '2025-07-01', analysisEnd: '2025-12-31', expiration: '2026-06-30', customFields: [{ label: 'Content Type', value: 'Case Study' }] },
        { id: 'pi14', statement: 'Gated whitepapers targeting C-suite personas had 67% higher conversion to sales-accepted leads.', footnote: 'Content Format Effectiveness Report, pp. 15–18. Analysis of 28 whitepapers by target persona.', sourceDocId: 'od5', sourceFile: 'Content_Format_Effectiveness_Report.pdf', sourceFileUrl: '#', team: 'Marketing', sourceType: 'document', sharingLevel: 'controlled', analysisStart: '2025-07-01', analysisEnd: '2025-12-31', expiration: '2026-06-30', customFields: [{ label: 'Audience', value: 'C-Suite' }] },
        { id: 'pi15', statement: 'Video testimonials embedded in nurture sequences improve SQL conversion by 26% compared to text-only emails.', footnote: 'Content Format Effectiveness Report, pp. 22–24. A/B test across 18 nurture tracks.', sourceDocId: 'od5', sourceFile: 'Content_Format_Effectiveness_Report.pdf', sourceFileUrl: '#', team: 'Marketing', sourceType: 'document', sharingLevel: 'internal', analysisStart: '2025-07-01', analysisEnd: '2025-12-31', expiration: '2026-06-30', customFields: [{ label: 'Content Type', value: 'Video' }] },
        { id: 'pi16', statement: 'ABM-targeted accounts show 45% higher average deal size compared to inbound-sourced opportunities.', footnote: 'ABM Campaign Results H2, pp. 6–10. Comparison of 120 ABM vs 340 inbound accounts.', sourceDocId: 'od6', sourceFile: 'ABM_Campaign_Results_H2.pdf', sourceFileUrl: '#', team: 'Marketing', sourceType: 'document', sharingLevel: 'controlled', analysisStart: '2025-07-01', analysisEnd: '2025-12-31', expiration: '2026-06-30', customFields: [{ label: 'Strategy', value: 'ABM' }] },
        { id: 'pi17', statement: 'Account-based advertising on LinkedIn drove 19% lift in target account engagement within 30 days.', footnote: 'ABM Campaign Results H2, pp. 14–16. Measured via 6sense engagement scoring across 85 target accounts.', sourceDocId: 'od6', sourceFile: 'ABM_Campaign_Results_H2.pdf', sourceFileUrl: '#', team: 'Marketing', sourceType: 'dashboard', sharingLevel: 'controlled', analysisStart: '2025-07-01', analysisEnd: '2025-12-31', expiration: '2026-06-30', customFields: [{ label: 'Platform', value: 'LinkedIn' }] },
        { id: 'pi18', statement: 'Webinar attendance rates improved from 38% to 52% when reminders included personalized agenda snippets.', footnote: 'Webinar Conversion Analysis, Slide 6. Pre/post comparison across 24 webinars.', sourceDocId: 'od7', sourceFile: 'Webinar_Conversion_Analysis.pptx', sourceFileUrl: '#', team: 'Marketing', sourceType: 'document', sharingLevel: 'internal', analysisStart: '2025-07-01', analysisEnd: '2025-12-31', expiration: '2026-06-30', customFields: [] },
        { id: 'pi19', statement: 'Post-webinar demo requests peak within the first 4 hours; delayed follow-up beyond 24 hours drops conversion by 41%.', footnote: 'Webinar Conversion Analysis, Slide 11. Time-series analysis of 1,400 webinar attendees.', sourceDocId: 'od7', sourceFile: 'Webinar_Conversion_Analysis.pptx', sourceFileUrl: '#', team: 'Marketing', sourceType: 'document', sharingLevel: 'controlled', analysisStart: '2025-07-01', analysisEnd: '2025-12-31', expiration: '2026-06-30', customFields: [{ label: 'Channel', value: 'Webinar' }] },
        { id: 'pi20', statement: 'Interactive Q&A during webinars correlates with 2.3x higher post-event engagement compared to presentation-only formats.', footnote: 'Webinar Conversion Analysis, Slide 15. Survey and engagement data from 18 webinars.', sourceDocId: 'od7', sourceFile: 'Webinar_Conversion_Analysis.pptx', sourceFileUrl: '#', team: 'Marketing', sourceType: 'document', sharingLevel: 'internal', analysisStart: '2025-07-01', analysisEnd: '2025-12-31', expiration: '2026-06-30', customFields: [] },
      ],
      'QUEUE-2026-003': [
        { id: 'pi21', statement: 'Win/loss analysis reveals pricing transparency as the #1 factor in competitive losses (cited in 43% of lost deals).', footnote: 'Win/Loss Analysis Q4Q1, pp. 8–12. Based on 78 structured interviews with buyers.', sourceDocId: 'od8', sourceFile: 'Win_Loss_Analysis_Q4Q1.pdf', sourceFileUrl: '#', team: 'Sales', sourceType: 'document', sharingLevel: 'internal', analysisStart: '2025-10-01', analysisEnd: '2026-02-28', expiration: '2026-08-31', customFields: [{ label: 'Focus', value: 'Competitive' }] },
        { id: 'pi22', statement: 'Deals with procurement involvement take 2.4x longer to close but have 18% lower churn at 12 months.', footnote: 'Win/Loss Analysis Q4Q1, pp. 15–18. Tracked 200 closed deals by procurement involvement flag.', sourceDocId: 'od8', sourceFile: 'Win_Loss_Analysis_Q4Q1.pdf', sourceFileUrl: '#', team: 'Sales', sourceType: 'document', sharingLevel: 'internal', analysisStart: '2025-10-01', analysisEnd: '2026-02-28', expiration: '2026-08-31', customFields: [] },
        { id: 'pi23', statement: 'Champion identification in accounts with 500+ employees accelerates deal cycle by an average of 18 days.', footnote: 'Win/Loss Analysis Q4Q1, pp. 21–23. Analysis of 134 enterprise deals by champion status.', sourceDocId: 'od8', sourceFile: 'Win_Loss_Analysis_Q4Q1.pdf', sourceFileUrl: '#', team: 'Sales', sourceType: 'document', sharingLevel: 'controlled', analysisStart: '2025-10-01', analysisEnd: '2026-02-28', expiration: '2026-08-31', customFields: [{ label: 'Segment', value: 'Enterprise' }] },
        { id: 'pi24', statement: 'Executive sponsorship in deals over $100K improves win rate by 29% according to CRM stage analysis.', footnote: 'Win/Loss Analysis Q4Q1, pp. 26–28. Cross-referenced with CRM opportunity data for 89 $100K+ deals.', sourceDocId: 'od8', sourceFile: 'Win_Loss_Analysis_Q4Q1.pdf', sourceFileUrl: '#', team: 'Sales', sourceType: 'document', sharingLevel: 'internal', analysisStart: '2025-10-01', analysisEnd: '2026-02-28', expiration: '2026-08-31', customFields: [{ label: 'Deal Size', value: '$100K+' }] },
        { id: 'pi25', statement: 'Top 3 competitive loss reasons after pricing: feature gaps in analytics (31%), integration limitations (27%), and implementation timeline (22%).', footnote: 'Win/Loss Analysis Q4Q1, pp. 30–33. Coded from open-ended interview responses.', sourceDocId: 'od8', sourceFile: 'Win_Loss_Analysis_Q4Q1.pdf', sourceFileUrl: '#', team: 'Sales', sourceType: 'document', sharingLevel: 'controlled', analysisStart: '2025-10-01', analysisEnd: '2026-02-28', expiration: '2026-08-31', customFields: [{ label: 'Focus', value: 'Competitive' }] },
        { id: 'pi26', statement: 'Sales cycle length decreased by 11 days when mutual action plans were used in enterprise opportunities.', footnote: 'Sales Cycle Benchmarking Report, pp. 6–9. Compared 67 deals with MAPs vs 78 without.', sourceDocId: 'od9', sourceFile: 'Sales_Cycle_Benchmarking_Report.pdf', sourceFileUrl: '#', team: 'Sales', sourceType: 'document', sharingLevel: 'internal', analysisStart: '2025-10-01', analysisEnd: '2026-02-28', expiration: '2026-08-31', customFields: [] },
        { id: 'pi27', statement: 'Technical proof-of-concept completion rate is the strongest predictor of deal closure (r=0.74).', footnote: 'Sales Cycle Benchmarking Report, pp. 12–14. Regression analysis across 200+ opportunities.', sourceDocId: 'od9', sourceFile: 'Sales_Cycle_Benchmarking_Report.pdf', sourceFileUrl: '#', team: 'Sales', sourceType: 'document', sharingLevel: 'internal', analysisStart: '2025-10-01', analysisEnd: '2026-02-28', expiration: '2026-08-31', customFields: [] },
        { id: 'pi28', statement: 'Deals progressed through MEDDPICC framework have 40% higher forecast accuracy than non-qualified deals.', footnote: 'Sales Cycle Benchmarking Report, pp. 18–20. Forecast accuracy measured as actual vs projected close date within 14 days.', sourceDocId: 'od9', sourceFile: 'Sales_Cycle_Benchmarking_Report.pdf', sourceFileUrl: '#', team: 'Sales', sourceType: 'document', sharingLevel: 'controlled', analysisStart: '2025-10-01', analysisEnd: '2026-02-28', expiration: '2026-08-31', customFields: [{ label: 'Framework', value: 'MEDDPICC' }] },
        { id: 'pi29', statement: 'Sales teams using competitive battle cards in deals report 24% higher win rates against top 3 competitors.', footnote: 'Competitive Battle Card Impact, Slide 5. Self-reported battle card usage cross-referenced with CRM outcomes.', sourceDocId: 'od10', sourceFile: 'Competitive_Battle_Card_Impact.pptx', sourceFileUrl: '#', team: 'Sales', sourceType: 'document', sharingLevel: 'controlled', analysisStart: '2025-10-01', analysisEnd: '2026-02-28', expiration: '2026-08-31', customFields: [{ label: 'Focus', value: 'Enablement' }] },
        { id: 'pi30', statement: 'Battle card adoption is highest among top quartile performers (87%) vs bottom quartile (34%).', footnote: 'Competitive Battle Card Impact, Slide 9. Usage survey of 96 AEs segmented by performance quartile.', sourceDocId: 'od10', sourceFile: 'Competitive_Battle_Card_Impact.pptx', sourceFileUrl: '#', team: 'Sales', sourceType: 'document', sharingLevel: 'internal', analysisStart: '2025-10-01', analysisEnd: '2026-02-28', expiration: '2026-08-31', customFields: [] },
        { id: 'pi31', statement: 'Competitive displacement deals have 1.8x longer cycles but 35% larger average deal sizes.', footnote: 'Competitive Battle Card Impact, Slide 13. Analysis of 44 competitive displacement opportunities.', sourceDocId: 'od10', sourceFile: 'Competitive_Battle_Card_Impact.pptx', sourceFileUrl: '#', team: 'Sales', sourceType: 'document', sharingLevel: 'internal', analysisStart: '2025-10-01', analysisEnd: '2026-02-28', expiration: '2026-08-31', customFields: [] },
        { id: 'pi32', statement: 'Sales enablement content that includes competitor-specific objection handling scripts reduces loss rate by 16%.', footnote: 'Competitive Battle Card Impact, Slide 17. Tracked objection handling content usage vs deal outcomes.', sourceDocId: 'od10', sourceFile: 'Competitive_Battle_Card_Impact.pptx', sourceFileUrl: '#', team: 'Sales', sourceType: 'document', sharingLevel: 'controlled', analysisStart: '2025-10-01', analysisEnd: '2026-02-28', expiration: '2026-08-31', customFields: [{ label: 'Focus', value: 'Enablement' }] },
        { id: 'pi33', statement: 'Transparent pricing page visitors convert to demo requests at 2.1x the rate of non-pricing page visitors.', footnote: 'Pricing Transparency Study, pp. 5–8. Web analytics funnel comparison over 90 days.', sourceDocId: 'od11', sourceFile: 'Pricing_Transparency_Study.pdf', sourceFileUrl: '#', team: 'Marketing', sourceType: 'dashboard', sharingLevel: 'controlled', analysisStart: '2025-10-01', analysisEnd: '2026-01-31', expiration: '2026-07-31', customFields: [{ label: 'Focus', value: 'Pricing' }] },
        { id: 'pi34', statement: '72% of enterprise buyers expect pricing guidance before scheduling a call; lack of it leads to 35% disqualification.', footnote: 'Pricing Transparency Study, pp. 11–14. Survey of 210 enterprise buyers post-evaluation.', sourceDocId: 'od11', sourceFile: 'Pricing_Transparency_Study.pdf', sourceFileUrl: '#', team: 'Sales', sourceType: 'document', sharingLevel: 'internal', analysisStart: '2025-10-01', analysisEnd: '2026-01-31', expiration: '2026-07-31', customFields: [{ label: 'Segment', value: 'Enterprise' }] },
        { id: 'pi35', statement: 'Competitors with public pricing pages saw 28% higher organic search traffic for buying-intent keywords.', footnote: 'Pricing Transparency Study, pp. 17–19. SEMrush competitive analysis across 8 competitors.', sourceDocId: 'od11', sourceFile: 'Pricing_Transparency_Study.pdf', sourceFileUrl: '#', team: 'Marketing', sourceType: 'dashboard', sharingLevel: 'controlled', analysisStart: '2025-10-01', analysisEnd: '2026-01-31', expiration: '2026-07-31', customFields: [{ label: 'Focus', value: 'Competitive SEO' }] },
      ]
    };
    return insightBank[item.queueId] || [];
  };

  const researchContext = queueItem.researchContext || '';
  const contextDocuments = queueItem.contextDocuments || [];
  const outputDocuments = queueItem.outputDocuments || [];
  const rawDataFiles = queueItem.rawDataFiles || [];

  const [insights, setInsights] = useState<PendingInsight[]>(() => generateInsightsForQueue(queueItem));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<PendingInsight | null>(null);
  const [contextExpanded, setContextExpanded] = useState(true);
  const [docsExpanded, setDocsExpanded] = useState(true);
  const [activeDocFilter, setActiveDocFilter] = useState<string | null>(null);
  const [expandedInsightIds, setExpandedInsightIds] = useState<Set<string>>(new Set());

  const [showAddNew, setShowAddNew] = useState(false);
  const [newInsightDraft, setNewInsightDraft] = useState<PendingInsight>({
    id: '',
    statement: '',
    footnote: '',
    sourceDocId: '',
    sourceFile: '',
    sourceFileUrl: '#',
    team: 'Sales',
    sourceType: 'document',
    sharingLevel: 'internal',
    analysisStart: '',
    analysisEnd: '',
    expiration: '',
    customFields: []
  });

  const startAddNew = () => {
    setShowAddNew(true);
    setNewInsightDraft({
      id: `pi-new-${Date.now()}`,
      statement: '',
      footnote: '',
      sourceDocId: outputDocuments.length > 0 ? outputDocuments[0].id : '',
      sourceFile: outputDocuments.length > 0 ? outputDocuments[0].name : '',
      sourceFileUrl: '#',
      team: 'Sales',
      sourceType: 'document',
      sharingLevel: 'internal',
      analysisStart: '',
      analysisEnd: '',
      expiration: '',
      customFields: []
    });
  };

  const cancelAddNew = () => {
    setShowAddNew(false);
  };

  const saveNewInsight = () => {
    if (!newInsightDraft.statement.trim()) {
      toast.error('Insight statement is required');
      return;
    }
    if (!newInsightDraft.sourceDocId) {
      toast.error('Please select a linking document');
      return;
    }
    setInsights(prev => [...prev, newInsightDraft]);
    toast.success('New insight added');
    setShowAddNew(false);
  };

  const updateNewDraftDoc = (docId: string) => {
    const doc = outputDocuments.find(d => d.id === docId);
    setNewInsightDraft(prev => ({
      ...prev,
      sourceDocId: docId,
      sourceFile: doc?.name || ''
    }));
  };

  const addNewCustomField = () => {
    setNewInsightDraft(prev => ({
      ...prev,
      customFields: [...prev.customFields, { label: '', value: '' }]
    }));
  };

  const removeNewCustomField = (index: number) => {
    setNewInsightDraft(prev => ({
      ...prev,
      customFields: prev.customFields.filter((_, i) => i !== index)
    }));
  };

  const updateNewCustomField = (index: number, field: 'label' | 'value', val: string) => {
    setNewInsightDraft(prev => ({
      ...prev,
      customFields: prev.customFields.map((cf, i) => i === index ? { ...cf, [field]: val } : cf)
    }));
  };

  const toggleInsightExpanded = (id: string) => {
    setExpandedInsightIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const filteredInsights = activeDocFilter
    ? insights.filter(i => i.sourceDocId === activeDocFilter)
    : insights;

  const activeDocName = activeDocFilter
    ? outputDocuments.find(d => d.id === activeDocFilter)?.name
    : null;

  const getDocFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="w-4 h-4" />;
    if (type.includes('powerpoint') || type.includes('presentation')) return <File className="w-4 h-4" />;
    if (type.includes('excel') || type.includes('spreadsheet')) return <FileSpreadsheet className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const getDocTypeLabel = (type: string) => {
    if (type.includes('pdf')) return 'PDF';
    if (type.includes('powerpoint') || type.includes('presentation')) return 'PPTX';
    if (type.includes('excel') || type.includes('spreadsheet')) return 'XLSX';
    if (type.includes('csv')) return 'CSV';
    if (type.includes('word') || type.includes('msword')) return 'DOCX';
    if (type.includes('zip')) return 'ZIP';
    return 'FILE';
  };

  const startEditing = (insight: PendingInsight) => {
    setEditingId(insight.id);
    setEditDraft({ ...insight, customFields: insight.customFields.map(f => ({ ...f })) });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditDraft(null);
  };

  const saveEditing = () => {
    if (!editDraft) return;
    setInsights(prev => prev.map(i => i.id === editDraft.id ? editDraft : i));
    toast.success('Changes saved');
    setEditingId(null);
    setEditDraft(null);
  };

  const addCustomField = () => {
    if (!editDraft) return;
    setEditDraft({ ...editDraft, customFields: [...editDraft.customFields, { label: '', value: '' }] });
  };

  const removeCustomField = (index: number) => {
    if (!editDraft) return;
    setEditDraft({ ...editDraft, customFields: editDraft.customFields.filter((_, i) => i !== index) });
  };

  const updateCustomField = (index: number, field: 'label' | 'value', val: string) => {
    if (!editDraft) return;
    const updated = editDraft.customFields.map((cf, i) => i === index ? { ...cf, [field]: val } : cf);
    setEditDraft({ ...editDraft, customFields: updated });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronDown className="w-4 h-4 rotate-90" />
          Back to Queue
        </button>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 font-mono">
            {queueItem.queueId}
          </Badge>
          <Badge variant="secondary" className={queueItem.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'}>
            {queueItem.status === 'pending' ? 'Pending Review' : 'In Review'}
          </Badge>
        </div>
      </div>

      <Card className="p-4 bg-white border-gray-200">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <FileCheck className="w-4 h-4 text-blue-700" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Uploaded by</p>
              <p className="text-sm font-medium text-gray-900">{queueItem.uploadedBy}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500">Date</p>
            <p className="text-sm font-medium text-gray-900">{new Date(queueItem.uploadDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Output Documents</p>
            <p className="text-sm font-medium text-gray-900">{outputDocuments.length} files</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Insights Extracted</p>
            <p className="text-sm font-medium text-gray-900">{insights.length} insights</p>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <button
          onClick={() => setContextExpanded(!contextExpanded)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-purple-700" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">Research Context</h3>
              <p className="text-xs text-gray-500">Objectives, methodology, and background documents</p>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${contextExpanded ? '' : '-rotate-90'}`} />
        </button>
        {contextExpanded && (
          <div className="px-6 pb-6 border-t border-gray-100">
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-800 leading-relaxed">{researchContext}</p>
            </div>

            {contextDocuments.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2 font-medium">Supporting Context Documents</p>
                <div className="flex flex-wrap gap-2">
                  {contextDocuments.map((doc, i) => (
                    <button
                      key={i}
                      onClick={() => toast.info(`Opening ${doc.name}...`)}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span>{doc.name}</span>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{getDocTypeLabel(doc.type)}</Badge>
                      <ExternalLink className="w-3 h-3 text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {rawDataFiles.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2 font-medium">Raw Data Files</p>
                <div className="flex flex-wrap gap-2">
                  {rawDataFiles.map((doc, i) => (
                    <button
                      key={i}
                      onClick={() => toast.info(`Opening ${doc.name}...`)}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <Database className="w-3.5 h-3.5 text-gray-400" />
                      <span>{doc.name}</span>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{getDocTypeLabel(doc.type)}</Badge>
                      <ExternalLink className="w-3 h-3 text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      <Card className="overflow-hidden">
        <button
          onClick={() => setDocsExpanded(!docsExpanded)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <FileCheck className="w-4 h-4 text-blue-700" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">Research Output Documents</h3>
              <p className="text-xs text-gray-500">{outputDocuments.length} documents produced {insights.length} insights</p>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${docsExpanded ? '' : '-rotate-90'}`} />
        </button>
        {docsExpanded && (
          <div className="px-6 pb-6 border-t border-gray-100">
            <div className="mt-4 space-y-3">
              {outputDocuments.map((doc) => {
                const docInsightCount = insights.filter(i => i.sourceDocId === doc.id).length;
                const isActive = activeDocFilter === doc.id;
                return (
                  <div
                    key={doc.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                      isActive
                        ? 'border-blue-300 bg-blue-50 ring-1 ring-blue-200'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isActive ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      {getDocFileIcon(doc.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => toast.info(`Opening ${doc.name}...`)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors flex items-center gap-1.5"
                      >
                        {doc.name}
                        <ExternalLink className="w-3 h-3" />
                      </button>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{getDocTypeLabel(doc.type)}</Badge>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Link2 className="w-3 h-3" />
                          {docInsightCount} insight{docInsightCount !== 1 ? 's' : ''} extracted
                        </span>
                      </div>
                    </div>
                    <Button
                      variant={isActive ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveDocFilter(isActive ? null : doc.id)}
                      className={`gap-1.5 ${isActive ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                    >
                      {isActive ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          Clear Filter
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          Show Insights
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-gray-900">Insights for Review</h3>
            <Badge variant="secondary" className="text-xs">{filteredInsights.length} of {insights.length}</Badge>
          </div>
          {activeDocFilter && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Filtered by:</span>
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 gap-1">
                <FileText className="w-3 h-3" />
                {activeDocName}
                <button onClick={() => setActiveDocFilter(null)} className="ml-1 hover:text-blue-900">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            </div>
          )}
        </div>

        {filteredInsights.map((insight) => {
          const isEditing = editingId === insight.id;
          const draft = isEditing ? editDraft! : insight;
          const isExpanded = expandedInsightIds.has(insight.id);

          return (
            <Card key={insight.id} className="overflow-hidden">
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleInsightExpanded(insight.id)}
                    className="mt-0.5 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge variant="secondary" className="text-[10px]">{insight.team}</Badge>
                      <button
                        onClick={(e) => { e.stopPropagation(); toast.info(`Opening ${insight.sourceFile}...`); }}
                        className="text-[11px] text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 transition-colors"
                      >
                        <FileText className="w-3 h-3" />
                        {insight.sourceFile}
                      </button>
                    </div>
                    <button
                      onClick={() => toggleInsightExpanded(insight.id)}
                      className="text-left w-full"
                    >
                      <p className="text-sm text-gray-900">{insight.statement}</p>
                    </button>
                    <p className="text-xs text-gray-500 mt-2 italic">{insight.footnote}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toast.info('Insight declined')}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                      title="Decline"
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { toggleInsightExpanded(insight.id); if (!isExpanded) startEditing(insight); }}
                      className="text-gray-500 hover:text-gray-700 h-8 w-8 p-0"
                      title="Edit Metadata"
                    >
                      <PenLine className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => toast.success('Insight approved')}
                      className="bg-green-600 hover:bg-green-700 h-8 w-8 p-0"
                      title="Approve"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="px-5 pb-5 pt-0 border-t border-gray-100">
                  <div className="mt-4 space-y-4">
                    {isEditing && (
                      <>
                        <div>
                          <Label className="text-xs text-gray-500 mb-1.5 block">Insight Statement</Label>
                          <Textarea
                            value={draft.statement}
                            onChange={(e) => setEditDraft({ ...draft, statement: e.target.value })}
                            className="min-h-[80px]"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500 mb-1.5 block">Footnote / Citation</Label>
                          <Textarea
                            value={draft.footnote}
                            onChange={(e) => setEditDraft({ ...draft, footnote: e.target.value })}
                            className="min-h-[60px]"
                          />
                        </div>
                      </>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-gray-500 mb-1.5 block">Team</Label>
                        {isEditing ? (
                          <Select value={draft.team} onValueChange={(v) => setEditDraft({ ...draft, team: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Strategy">Strategy</SelectItem>
                              <SelectItem value="Product">Product</SelectItem>
                              <SelectItem value="UX Research">UX Research</SelectItem>
                              <SelectItem value="Data Science">Data Science</SelectItem>
                              <SelectItem value="Marketing">Marketing</SelectItem>
                              <SelectItem value="Sales">Sales</SelectItem>
                              <SelectItem value="Customer Success">Customer Success</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant="secondary">{insight.team}</Badge>
                        )}
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500 mb-1.5 block">Source Type</Label>
                        {isEditing ? (
                          <Select value={draft.sourceType} onValueChange={(v) => setEditDraft({ ...draft, sourceType: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="document">Document / Report</SelectItem>
                              <SelectItem value="dashboard">Dashboard / Analytics</SelectItem>
                              <SelectItem value="manual">Manual Observation</SelectItem>
                              <SelectItem value="api">API / Automated</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-sm text-gray-700">{insight.sourceType === 'document' ? 'Document / Report' : insight.sourceType === 'dashboard' ? 'Dashboard / Analytics' : insight.sourceType === 'manual' ? 'Manual Observation' : 'API / Automated'}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-xs text-gray-500 mb-1.5 block">Analysis Starts At</Label>
                        {isEditing ? (
                          <Input type="date" value={draft.analysisStart} onChange={(e) => setEditDraft({ ...draft, analysisStart: e.target.value })} />
                        ) : (
                          <p className="text-sm text-gray-700">{new Date(insight.analysisStart).toLocaleDateString()}</p>
                        )}
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500 mb-1.5 block">Analysis Ends At</Label>
                        {isEditing ? (
                          <Input type="date" value={draft.analysisEnd} onChange={(e) => setEditDraft({ ...draft, analysisEnd: e.target.value })} />
                        ) : (
                          <p className="text-sm text-gray-700">{new Date(insight.analysisEnd).toLocaleDateString()}</p>
                        )}
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500 mb-1.5 block">Expiration Date</Label>
                        {isEditing ? (
                          <Input type="date" value={draft.expiration} onChange={(e) => setEditDraft({ ...draft, expiration: e.target.value })} />
                        ) : (
                          <p className="text-sm text-gray-700">{new Date(insight.expiration).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs text-gray-500 mb-1.5 block">Sharing Level</Label>
                      {isEditing ? (
                        <Select value={draft.sharingLevel} onValueChange={(v) => setEditDraft({ ...draft, sharingLevel: v })}>
                          <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="internal">Internal Only</SelectItem>
                            <SelectItem value="controlled">Controlled Distribution</SelectItem>
                            <SelectItem value="public">Public</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="secondary" className="capitalize">
                          {insight.sharingLevel === 'internal' ? 'Internal Only' : insight.sharingLevel === 'controlled' ? 'Controlled Distribution' : 'Public'}
                        </Badge>
                      )}
                    </div>

                    <div className="pt-3 border-t border-gray-100">
                      <Label className="text-xs text-gray-500 mb-2 block">Custom Metadata</Label>
                      {isEditing ? (
                        <div className="space-y-3">
                          {draft.customFields.map((cf, index) => (
                            <div key={index} className="flex items-end gap-3">
                              <div className="flex-1">
                                <Label className="text-xs text-gray-500 mb-1">Field Name</Label>
                                <Input placeholder="e.g., Product Line" value={cf.label} onChange={(e) => updateCustomField(index, 'label', e.target.value)} />
                              </div>
                              <div className="flex-1">
                                <Label className="text-xs text-gray-500 mb-1">Value</Label>
                                <Input placeholder="e.g., Enterprise Suite" value={cf.value} onChange={(e) => updateCustomField(index, 'value', e.target.value)} />
                              </div>
                              <button onClick={() => removeCustomField(index)} className="text-gray-400 hover:text-red-500 transition-colors pb-2">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          <Button variant="outline" size="sm" onClick={addCustomField} className="gap-1 mt-1">
                            <Plus className="w-4 h-4" />
                            Add Custom Field
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-3">
                          {insight.customFields.length > 0 ? insight.customFields.map((cf, i) => (
                            <div key={i} className="px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                              <span className="text-xs text-gray-500">{cf.label}:</span>{' '}
                              <span className="text-xs font-medium text-gray-800">{cf.value}</span>
                            </div>
                          )) : (
                            <p className="text-xs text-gray-400 italic">No custom metadata</p>
                          )}
                        </div>
                      )}
                    </div>

                    {isEditing && (
                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
                        <Button variant="outline" size="sm" onClick={cancelEditing}>Cancel</Button>
                        <Button size="sm" onClick={saveEditing} className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          );
        })}

        {showAddNew ? (
          <Card className="overflow-hidden border-2 border-blue-200 border-dashed">
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                  <Plus className="w-4 h-4 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900">New Insight</h4>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-gray-500 mb-1.5 block">Linking Document *</Label>
                  <Select value={newInsightDraft.sourceDocId} onValueChange={updateNewDraftDoc}>
                    <SelectTrigger><SelectValue placeholder="Select a document..." /></SelectTrigger>
                    <SelectContent>
                      {outputDocuments.map((doc) => (
                        <SelectItem key={doc.id} value={doc.id}>
                          <span className="flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5 text-gray-400" />
                            {doc.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs text-gray-500 mb-1.5 block">Insight Statement *</Label>
                  <Textarea
                    value={newInsightDraft.statement}
                    onChange={(e) => setNewInsightDraft({ ...newInsightDraft, statement: e.target.value })}
                    placeholder="Enter the insight statement..."
                    className="min-h-[80px]"
                  />
                </div>

                <div>
                  <Label className="text-xs text-gray-500 mb-1.5 block">Footnote / Citation</Label>
                  <Textarea
                    value={newInsightDraft.footnote}
                    onChange={(e) => setNewInsightDraft({ ...newInsightDraft, footnote: e.target.value })}
                    placeholder="Source reference, methodology notes, page numbers..."
                    className="min-h-[60px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-500 mb-1.5 block">Team</Label>
                    <Select value={newInsightDraft.team} onValueChange={(v) => setNewInsightDraft({ ...newInsightDraft, team: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Strategy">Strategy</SelectItem>
                        <SelectItem value="Product">Product</SelectItem>
                        <SelectItem value="UX Research">UX Research</SelectItem>
                        <SelectItem value="Data Science">Data Science</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Sales">Sales</SelectItem>
                        <SelectItem value="Customer Success">Customer Success</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 mb-1.5 block">Source Type</Label>
                    <Select value={newInsightDraft.sourceType} onValueChange={(v) => setNewInsightDraft({ ...newInsightDraft, sourceType: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="document">Document / Report</SelectItem>
                        <SelectItem value="dashboard">Dashboard / Analytics</SelectItem>
                        <SelectItem value="manual">Manual Observation</SelectItem>
                        <SelectItem value="api">API / Automated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs text-gray-500 mb-1.5 block">Analysis Starts At</Label>
                    <Input type="date" value={newInsightDraft.analysisStart} onChange={(e) => setNewInsightDraft({ ...newInsightDraft, analysisStart: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 mb-1.5 block">Analysis Ends At</Label>
                    <Input type="date" value={newInsightDraft.analysisEnd} onChange={(e) => setNewInsightDraft({ ...newInsightDraft, analysisEnd: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 mb-1.5 block">Expiration Date</Label>
                    <Input type="date" value={newInsightDraft.expiration} onChange={(e) => setNewInsightDraft({ ...newInsightDraft, expiration: e.target.value })} />
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-gray-500 mb-1.5 block">Sharing Level</Label>
                  <Select value={newInsightDraft.sharingLevel} onValueChange={(v) => setNewInsightDraft({ ...newInsightDraft, sharingLevel: v })}>
                    <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internal">Internal Only</SelectItem>
                      <SelectItem value="controlled">Controlled Distribution</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <Label className="text-xs text-gray-500 mb-2 block">Custom Metadata</Label>
                  <div className="space-y-3">
                    {newInsightDraft.customFields.map((cf, index) => (
                      <div key={index} className="flex items-end gap-3">
                        <div className="flex-1">
                          <Label className="text-xs text-gray-500 mb-1">Field Name</Label>
                          <Input placeholder="e.g., Product Line" value={cf.label} onChange={(e) => updateNewCustomField(index, 'label', e.target.value)} />
                        </div>
                        <div className="flex-1">
                          <Label className="text-xs text-gray-500 mb-1">Value</Label>
                          <Input placeholder="e.g., Enterprise Suite" value={cf.value} onChange={(e) => updateNewCustomField(index, 'value', e.target.value)} />
                        </div>
                        <button onClick={() => removeNewCustomField(index)} className="text-gray-400 hover:text-red-500 transition-colors pb-2">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={addNewCustomField} className="gap-1 mt-1">
                      <Plus className="w-4 h-4" />
                      Add Custom Field
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
                  <Button variant="outline" size="sm" onClick={cancelAddNew}>Cancel</Button>
                  <Button size="sm" onClick={saveNewInsight} className="bg-blue-600 hover:bg-blue-700">Add Insight</Button>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <button
            onClick={startAddNew}
            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New
          </button>
        )}
      </div>

      <div className="flex items-center justify-between pt-4">
        <p className="text-sm text-gray-500">
          {filteredInsights.length} insight{filteredInsights.length !== 1 ? 's' : ''} shown
          {activeDocFilter && ` from ${activeDocName}`}
        </p>
        <Button onClick={onApprove} className="bg-blue-600 hover:bg-blue-700 gap-2 px-6">
          <CheckCheck className="w-5 h-5" />
          Approve All & Publish
        </Button>
      </div>
    </div>
  );
}
