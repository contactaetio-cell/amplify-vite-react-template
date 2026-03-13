import { LinkedInsight, ProcessedUpload, QueueItem } from './types';

// Mock data for queues
export const mockQueueItems: QueueItem[] = [
  {
    id: 'q1',
    queueId: 'QUEUE-2026-001',
    uploadDate: '2026-02-27',
    uploadedBy: 'Sarah Chen',
    status: 'pending',
    insightsCount: 12,
    researchContext: 'Q1 2026 pipeline performance analysis across all segments (SMB, Mid-Market, Enterprise). Objective: identify conversion rate drivers and SDR vs self-serve effectiveness. Methodology: cohort analysis of 342 accounts over a 90-day window, segmented by acquisition channel and deal size. Key questions: Where are the biggest drop-offs in the funnel? Is human-qualified pipeline still outperforming self-serve in mid-market?',
    contextDocuments: [
      { name: 'Q1_Research_Brief.pdf', type: 'application/pdf' },
      { name: 'Pipeline_Methodology_Notes.docx', type: 'application/msword' }
    ],
    outputDocuments: [
      { id: 'od1', name: 'Q1_2026_Pipeline_Analysis.pdf', type: 'application/pdf', insightIds: ['pi1', 'pi3', 'pi5', 'pi7'] },
      { id: 'od2', name: 'Email_Campaign_Performance_Report.pdf', type: 'application/pdf', insightIds: ['pi2', 'pi4', 'pi6'] },
      { id: 'od3', name: 'SDR_Outbound_Effectiveness_Deck.pptx', type: 'application/vnd.ms-powerpoint', insightIds: ['pi8', 'pi9', 'pi10'] },
      { id: 'od4', name: 'Channel_ROI_Comparison_Q1.xlsx', type: 'application/vnd.ms-excel', insightIds: ['pi11', 'pi12'] }
    ],
    rawDataFiles: [
      { name: 'pipeline_raw_data_q1.csv', type: 'text/csv' },
      { name: 'campaign_metrics_export.xlsx', type: 'application/vnd.ms-excel' }
    ]
  },
  {
    id: 'q2',
    queueId: 'QUEUE-2026-002',
    uploadDate: '2026-02-26',
    uploadedBy: 'Marcus Rodriguez',
    status: 'in_review',
    insightsCount: 8,
    researchContext: 'Content marketing effectiveness study for H2 2025 campaigns. Objective: measure which content formats and distribution channels drive the highest-quality MQLs and shortest time-to-SQL. Methodology: multi-touch attribution analysis across 96 campaigns, A/B testing on 48 email variants, and engagement scoring by content type.',
    contextDocuments: [
      { name: 'Content_Marketing_Study_Brief.pdf', type: 'application/pdf' }
    ],
    outputDocuments: [
      { id: 'od5', name: 'Content_Format_Effectiveness_Report.pdf', type: 'application/pdf', insightIds: ['pi13', 'pi14', 'pi15'] },
      { id: 'od6', name: 'ABM_Campaign_Results_H2.pdf', type: 'application/pdf', insightIds: ['pi16', 'pi17'] },
      { id: 'od7', name: 'Webinar_Conversion_Analysis.pptx', type: 'application/vnd.ms-powerpoint', insightIds: ['pi18', 'pi19', 'pi20'] }
    ],
    rawDataFiles: [
      { name: 'campaign_attribution_data.csv', type: 'text/csv' }
    ]
  },
  {
    id: 'q3',
    queueId: 'QUEUE-2026-003',
    uploadDate: '2026-02-25',
    uploadedBy: 'Lisa Wang',
    status: 'pending',
    insightsCount: 15,
    researchContext: 'Sales enablement and competitive intelligence review for Q4 2025 / Q1 2026. Objective: assess the impact of battle cards, mutual action plans, and competitive positioning on win rates. Methodology: win/loss interviews (n=78), CRM stage analysis, and sales cycle benchmarking across 200+ closed opportunities. Secondary focus: pricing transparency impact on competitive losses.',
    contextDocuments: [
      { name: 'Win_Loss_Interview_Guide.pdf', type: 'application/pdf' },
      { name: 'Competitive_Intelligence_Framework.docx', type: 'application/msword' },
      { name: 'Sales_Enablement_Audit_Scope.pdf', type: 'application/pdf' }
    ],
    outputDocuments: [
      { id: 'od8', name: 'Win_Loss_Analysis_Q4Q1.pdf', type: 'application/pdf', insightIds: ['pi21', 'pi22', 'pi23', 'pi24', 'pi25'] },
      { id: 'od9', name: 'Sales_Cycle_Benchmarking_Report.pdf', type: 'application/pdf', insightIds: ['pi26', 'pi27', 'pi28'] },
      { id: 'od10', name: 'Competitive_Battle_Card_Impact.pptx', type: 'application/vnd.ms-powerpoint', insightIds: ['pi29', 'pi30', 'pi31', 'pi32'] },
      { id: 'od11', name: 'Pricing_Transparency_Study.pdf', type: 'application/pdf', insightIds: ['pi33', 'pi34', 'pi35'] }
    ],
    rawDataFiles: [
      { name: 'crm_opportunity_export.csv', type: 'text/csv' },
      { name: 'win_loss_interview_transcripts.zip', type: 'application/zip' },
      { name: 'deal_stage_timing_data.xlsx', type: 'application/vnd.ms-excel' }
    ]
  }
];

export const mockProcessedUploads: ProcessedUpload[] = [
  {
    id: 'h1',
    queueId: 'QUEUE-2026-000',
    uploadDate: '2026-02-24',
    uploadedBy: 'Rachel Torres',
    insightsGenerated: 18,
    insightsApproved: 14,
    insightsDeclined: 4,
    status: 'complete'
  },
  {
    id: 'h2',
    queueId: 'QUEUE-2025-999',
    uploadDate: '2026-02-20',
    uploadedBy: 'James Liu',
    insightsGenerated: 22,
    insightsApproved: 19,
    insightsDeclined: 3,
    status: 'complete'
  },
  {
    id: 'h3',
    queueId: 'QUEUE-2025-998',
    uploadDate: '2026-02-18',
    uploadedBy: 'Aisha Patel',
    insightsGenerated: 11,
    insightsApproved: 9,
    insightsDeclined: 2,
    status: 'complete'
  },
  {
    id: 'h4',
    queueId: 'QUEUE-2025-997',
    uploadDate: '2026-02-15',
    uploadedBy: 'Taylor Kim',
    insightsGenerated: 16,
    insightsApproved: 13,
    insightsDeclined: 3,
    status: 'complete'
  }
];

export const mockLinkedInsights: Record<string, LinkedInsight[]> = {
  'QUEUE-2026-000': [
    { id: 'li1', statement: 'Pipeline velocity increased 28% in mid-market segment after implementing SDR-led outbound sequences targeting ICP-matched accounts.', team: 'Sales', status: 'approved', reviewedBy: 'Sarah Chen', reviewedDate: '2026-02-25' },
    { id: 'li2', statement: 'Content syndication campaigns on LinkedIn drove 3.2x more MQLs than organic social, with 19% lower CPL.', team: 'Marketing', status: 'approved', reviewedBy: 'Marcus Rodriguez', reviewedDate: '2026-02-25' },
    { id: 'li3', statement: 'ABM-targeted accounts show 45% higher average deal size compared to inbound-sourced opportunities.', team: 'Sales', status: 'approved', reviewedBy: 'Sarah Chen', reviewedDate: '2026-02-25' },
    { id: 'li4', statement: 'Webinar-to-demo conversion rate improved from 8% to 14% after introducing personalized follow-up sequences within 24 hours.', team: 'Marketing', status: 'approved', reviewedBy: 'Lisa Wang', reviewedDate: '2026-02-25' },
    { id: 'li5', statement: 'Enterprise segment CAC decreased 22% QoQ due to improved lead scoring model accuracy.', team: 'Sales', status: 'approved', reviewedBy: 'Marcus Rodriguez', reviewedDate: '2026-02-25' },
    { id: 'li6', statement: 'Blog content with interactive ROI calculators generates 5x more form submissions than static content.', team: 'Marketing', status: 'approved', reviewedBy: 'Lisa Wang', reviewedDate: '2026-02-25' },
    { id: 'li7', statement: 'Multi-threaded deals (3+ stakeholders engaged) close at 2.1x the rate of single-threaded deals.', team: 'Sales', status: 'approved', reviewedBy: 'Sarah Chen', reviewedDate: '2026-02-25' },
    { id: 'li8', statement: 'Prospects who attend live product demos convert 38% higher than those who only view recorded demos.', team: 'Sales', status: 'approved', reviewedBy: 'Marcus Rodriguez', reviewedDate: '2026-02-25' },
    { id: 'li9', statement: 'Channel partner co-marketing campaigns underperformed direct campaigns by 12% on lead quality metrics.', team: 'Marketing', status: 'approved', reviewedBy: 'Lisa Wang', reviewedDate: '2026-02-25' },
    { id: 'li10', statement: 'SEO-driven organic traffic increased 34% but conversion rate remained flat, indicating content-intent mismatch.', team: 'Marketing', status: 'approved', reviewedBy: 'Sarah Chen', reviewedDate: '2026-02-25' },
    { id: 'li11', statement: 'Paid search branded terms showed declining ROAS over Q1, potentially due to increased competitor bidding.', team: 'Marketing', status: 'approved', reviewedBy: 'Marcus Rodriguez', reviewedDate: '2026-02-25' },
    { id: 'li12', statement: 'Customer referral program generates leads with 60% shorter sales cycles compared to all other channels.', team: 'Sales', status: 'approved', reviewedBy: 'Lisa Wang', reviewedDate: '2026-02-25' },
    { id: 'li13', statement: 'Social selling index scores above 70 correlate with 15% higher quota attainment among AEs.', team: 'Sales', status: 'approved', reviewedBy: 'Sarah Chen', reviewedDate: '2026-02-25' },
    { id: 'li14', statement: 'Account expansion revenue from upsells grew 41% YoY, outpacing new business growth of 23%.', team: 'Sales', status: 'approved', reviewedBy: 'Marcus Rodriguez', reviewedDate: '2026-02-25' },
    { id: 'li15', statement: 'Email open rates declined across all segments in February, likely due to seasonal patterns.', team: 'Marketing', status: 'declined', reviewedBy: 'Lisa Wang', reviewedDate: '2026-02-25' },
    { id: 'li16', statement: 'Trade show ROI was inconclusive due to insufficient attribution data and long sales cycles.', team: 'Marketing', status: 'declined', reviewedBy: 'Sarah Chen', reviewedDate: '2026-02-25' },
    { id: 'li17', statement: 'Sales team sentiment survey showed general satisfaction, but no actionable business insight was extractable.', team: 'Sales', status: 'declined', reviewedBy: 'Marcus Rodriguez', reviewedDate: '2026-02-25' },
    { id: 'li18', statement: 'Competitive win rate data was based on anecdotal CRM notes and lacked statistical rigor for publication.', team: 'Sales', status: 'declined', reviewedBy: 'Lisa Wang', reviewedDate: '2026-02-25' },
  ],
  'QUEUE-2025-999': [
    { id: 'li19', statement: 'Outbound email sequences with 5-touch cadences outperform 3-touch by 31% in reply rate for enterprise prospects.', team: 'Sales', status: 'approved', reviewedBy: 'Aisha Patel', reviewedDate: '2026-02-21' },
    { id: 'li20', statement: 'Case study content featuring quantified ROI metrics generates 4.2x more downloads than narrative-only formats.', team: 'Marketing', status: 'approved', reviewedBy: 'Taylor Kim', reviewedDate: '2026-02-21' },
    { id: 'li21', statement: 'Discovery calls lasting 25-35 minutes have the highest close rate (32%), compared to shorter or longer calls.', team: 'Sales', status: 'approved', reviewedBy: 'Aisha Patel', reviewedDate: '2026-02-21' },
    { id: 'li22', statement: 'Marketing-sourced pipeline contribution reached 42% in Q4, up from 35% in Q3, driven by intent data programs.', team: 'Marketing', status: 'approved', reviewedBy: 'Taylor Kim', reviewedDate: '2026-02-21' },
    { id: 'li23', statement: 'Video testimonials embedded in nurture sequences improve SQL conversion by 26% compared to text-only emails.', team: 'Marketing', status: 'approved', reviewedBy: 'Aisha Patel', reviewedDate: '2026-02-21' },
    { id: 'li24', statement: 'Deals with procurement involvement take 2.4x longer to close but have 18% lower churn at 12 months.', team: 'Sales', status: 'approved', reviewedBy: 'Taylor Kim', reviewedDate: '2026-02-21' },
    { id: 'li25', statement: 'Product-led growth motions in SMB segment reduced CAC by 35% while maintaining similar LTV ratios.', team: 'Sales', status: 'approved', reviewedBy: 'Aisha Patel', reviewedDate: '2026-02-21' },
    { id: 'li26', statement: 'Gated whitepapers targeting C-suite personas had 67% higher conversion to sales-accepted leads.', team: 'Marketing', status: 'approved', reviewedBy: 'Taylor Kim', reviewedDate: '2026-02-21' },
    { id: 'li27', statement: 'Champion identification in accounts with 500+ employees accelerates deal cycle by an average of 18 days.', team: 'Sales', status: 'approved', reviewedBy: 'Aisha Patel', reviewedDate: '2026-02-21' },
    { id: 'li28', statement: 'Retargeting campaigns on display networks show diminishing returns after 14 days of exposure.', team: 'Marketing', status: 'approved', reviewedBy: 'Taylor Kim', reviewedDate: '2026-02-21' },
    { id: 'li29', statement: 'Cross-sell motion into installed base accounts generates 52% higher win rates than net-new prospecting.', team: 'Sales', status: 'approved', reviewedBy: 'Aisha Patel', reviewedDate: '2026-02-21' },
    { id: 'li30', statement: 'Podcast sponsorship campaign awareness lift was measured at 11%, but direct attribution to pipeline was unclear.', team: 'Marketing', status: 'approved', reviewedBy: 'Taylor Kim', reviewedDate: '2026-02-21' },
    { id: 'li31', statement: 'Field event attendance tracking was incomplete, making per-event ROI analysis unreliable.', team: 'Marketing', status: 'approved', reviewedBy: 'Aisha Patel', reviewedDate: '2026-02-21' },
    { id: 'li32', statement: 'Sales enablement content usage data showed uneven adoption across regions.', team: 'Sales', status: 'approved', reviewedBy: 'Taylor Kim', reviewedDate: '2026-02-21' },
    { id: 'li33', statement: 'G2 review campaign drove 89 new reviews in Q4, correlating with 15% increase in inbound demo requests.', team: 'Marketing', status: 'approved', reviewedBy: 'Aisha Patel', reviewedDate: '2026-02-21' },
    { id: 'li34', statement: 'Executive sponsorship in deals over $100K improves win rate by 29% according to CRM stage analysis.', team: 'Sales', status: 'approved', reviewedBy: 'Taylor Kim', reviewedDate: '2026-02-21' },
    { id: 'li35', statement: 'Industry vertical targeting in manufacturing showed promising early signals but sample size was too small.', team: 'Marketing', status: 'approved', reviewedBy: 'Aisha Patel', reviewedDate: '2026-02-21' },
    { id: 'li36', statement: 'Competitor feature comparison data was outdated and could not be verified for accuracy.', team: 'Sales', status: 'declined', reviewedBy: 'Taylor Kim', reviewedDate: '2026-02-21' },
    { id: 'li37', statement: 'Annual planning assumptions for headcount growth lacked supporting market data.', team: 'Sales', status: 'declined', reviewedBy: 'Aisha Patel', reviewedDate: '2026-02-21' },
    { id: 'li38', statement: 'Brand awareness survey results were directionally interesting but methodology had significant limitations.', team: 'Marketing', status: 'declined', reviewedBy: 'Taylor Kim', reviewedDate: '2026-02-21' },
  ],
  'QUEUE-2025-998': [
    { id: 'li39', statement: 'Freemium-to-paid conversion rate improved to 8.4% after introducing in-app upgrade prompts at usage milestones.', team: 'Sales', status: 'approved', reviewedBy: 'Rachel Torres', reviewedDate: '2026-02-19' },
    { id: 'li40', statement: 'LinkedIn Sponsored Content campaigns targeting VP+ titles achieve 2.8x higher engagement rate than broad targeting.', team: 'Marketing', status: 'approved', reviewedBy: 'James Liu', reviewedDate: '2026-02-19' },
    { id: 'li41', statement: 'Win/loss analysis reveals pricing transparency as the #1 factor in competitive losses (cited in 43% of lost deals).', team: 'Sales', status: 'approved', reviewedBy: 'Rachel Torres', reviewedDate: '2026-02-19' },
    { id: 'li42', statement: 'Marketing attribution model upgrade from last-touch to multi-touch revealed 28% more pipeline influence from content.', team: 'Marketing', status: 'approved', reviewedBy: 'James Liu', reviewedDate: '2026-02-19' },
    { id: 'li43', statement: 'Sales cycle length decreased by 11 days when mutual action plans were used in enterprise opportunities.', team: 'Sales', status: 'approved', reviewedBy: 'Rachel Torres', reviewedDate: '2026-02-19' },
    { id: 'li44', statement: 'Account-based advertising on LinkedIn drove 19% lift in target account engagement within 30 days.', team: 'Marketing', status: 'approved', reviewedBy: 'James Liu', reviewedDate: '2026-02-19' },
    { id: 'li45', statement: 'Technical proof-of-concept completion rate is the strongest predictor of deal closure (r=0.74).', team: 'Sales', status: 'approved', reviewedBy: 'Rachel Torres', reviewedDate: '2026-02-19' },
    { id: 'li46', statement: 'Email nurture sequences with dynamic content personalization show 21% higher click rates.', team: 'Marketing', status: 'approved', reviewedBy: 'James Liu', reviewedDate: '2026-02-19' },
    { id: 'li47', statement: 'Quarterly business reviews with existing customers surface 3.1x more expansion opportunities than ad-hoc check-ins.', team: 'Sales', status: 'approved', reviewedBy: 'Rachel Torres', reviewedDate: '2026-02-19' },
    { id: 'li48', statement: 'Preliminary analysis of new market segment showed interest but data was not statistically significant.', team: 'Marketing', status: 'declined', reviewedBy: 'James Liu', reviewedDate: '2026-02-19' },
    { id: 'li49', statement: 'Customer satisfaction correlation with renewal rates was directional only; confounding variables not controlled.', team: 'Sales', status: 'declined', reviewedBy: 'Rachel Torres', reviewedDate: '2026-02-19' },
  ],
  'QUEUE-2025-997': [
    { id: 'li50', statement: 'Intent data signals from Bombora correctly predicted 62% of closed-won deals when used for lead prioritization.', team: 'Sales', status: 'approved', reviewedBy: 'Sarah Chen', reviewedDate: '2026-02-16' },
    { id: 'li51', statement: 'Demand gen campaigns focused on pain-point messaging outperform feature-focused messaging by 37% in CTR.', team: 'Marketing', status: 'approved', reviewedBy: 'Marcus Rodriguez', reviewedDate: '2026-02-16' },
    { id: 'li52', statement: 'Sales teams using competitive battle cards in deals report 24% higher win rates against top 3 competitors.', team: 'Sales', status: 'approved', reviewedBy: 'Sarah Chen', reviewedDate: '2026-02-16' },
    { id: 'li53', statement: 'Integrated campaigns (3+ channels coordinated) produce 2.5x more pipeline than single-channel campaigns.', team: 'Marketing', status: 'approved', reviewedBy: 'Marcus Rodriguez', reviewedDate: '2026-02-16' },
    { id: 'li54', statement: 'Customer health score above 80 correlates with 91% renewal rate, validating the scoring model.', team: 'Customer Success', status: 'approved', reviewedBy: 'Lisa Wang', reviewedDate: '2026-02-16' },
    { id: 'li55', statement: 'Personalized landing pages for ABM campaigns convert at 3.6x the rate of generic landing pages.', team: 'Marketing', status: 'approved', reviewedBy: 'Marcus Rodriguez', reviewedDate: '2026-02-16' },
    { id: 'li56', statement: 'Deals progressed through MEDDPICC framework have 40% higher forecast accuracy than non-qualified deals.', team: 'Sales', status: 'approved', reviewedBy: 'Sarah Chen', reviewedDate: '2026-02-16' },
    { id: 'li57', statement: 'Content marketing ROI analysis shows blog posts have a 14-month payback period through organic traffic compounding.', team: 'Marketing', status: 'approved', reviewedBy: 'Marcus Rodriguez', reviewedDate: '2026-02-16' },
    { id: 'li58', statement: 'SDR-to-AE handoff quality score directly impacts stage 1 to stage 2 conversion (r=0.68).', team: 'Sales', status: 'approved', reviewedBy: 'Sarah Chen', reviewedDate: '2026-02-16' },
    { id: 'li59', statement: 'Influencer partnership ROI was difficult to attribute and measurement framework needs refinement.', team: 'Marketing', status: 'approved', reviewedBy: 'Marcus Rodriguez', reviewedDate: '2026-02-16' },
    { id: 'li60', statement: 'New logo acquisition cost trending upward but insufficient data points to confirm trend significance.', team: 'Sales', status: 'approved', reviewedBy: 'Sarah Chen', reviewedDate: '2026-02-16' },
    { id: 'li61', statement: 'Partner ecosystem contribution to pipeline was estimated at 15% but tracking methodology was inconsistent.', team: 'Sales', status: 'approved', reviewedBy: 'Marcus Rodriguez', reviewedDate: '2026-02-16' },
    { id: 'li62', statement: 'Event marketing budget allocation analysis had incomplete cost data for several major events.', team: 'Marketing', status: 'approved', reviewedBy: 'Lisa Wang', reviewedDate: '2026-02-16' },
    { id: 'li63', statement: 'Regional sales performance variance analysis lacked normalization for territory size and market potential.', team: 'Sales', status: 'declined', reviewedBy: 'Sarah Chen', reviewedDate: '2026-02-16' },
    { id: 'li64', statement: 'Social media engagement metrics showed inconsistent tracking across platforms, invalidating cross-platform comparison.', team: 'Marketing', status: 'declined', reviewedBy: 'Marcus Rodriguez', reviewedDate: '2026-02-16' },
    { id: 'li65', statement: 'Pricing sensitivity analysis relied on hypothetical survey responses rather than actual purchasing behavior.', team: 'Sales', status: 'declined', reviewedBy: 'Lisa Wang', reviewedDate: '2026-02-16' },
  ],
};
