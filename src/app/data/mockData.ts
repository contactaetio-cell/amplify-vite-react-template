// Mock data for the insight discovery platform

// Data point within an insight
export interface DataPoint {
  id: string;
  value: string;
  source?: string;
}

// Metadata field definition
export interface MetadataField {
  id: string;
  label: string;
  value: string;
  type: 'text' | 'select' | 'date' | 'number';
  isNew?: boolean; // Highlight net new fields
  isRequired?: boolean;
}

// Dimension for filtering child insights
export interface InsightDimension {
  id: string;
  name: string; // e.g., "Geography", "Gender", "Age Group", "Device Type"
  values: string[]; // e.g., ["US", "UK", "Canada"] or ["Male", "Female", "Other"]
}

// Communication approval levels
export type SharingLevel = 'internal' | 'controlled' | 'public';

// Version history entry
export interface InsightVersion {
  id: string;
  version: number;
  statement: string;
  modifiedBy: string;
  modifiedDate: string;
  changeDescription: string;
  metadata: MetadataField[];
}

// Individual insight with required and optional metadata
export interface ExtractedInsight {
  // Required fields
  id: string;
  statement: string; // The insight statement (combines statement + description)
  dataPoints: DataPoint[]; // At least one data point
  footnote: string; // Source details and citations
  team: string;
  expiration: string; // Date when insight becomes stale
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'flagged';
  confidence: number;
  
  // Optional/custom metadata fields
  metadata: MetadataField[];
  
  // System fields
  sourceFile?: string;
  sourceType?: 'dashboard' | 'document' | 'api' | 'manual';
  extractedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  
  // Approval and compliance fields
  sharingLevel?: SharingLevel;
  prApprovalStatus?: 'pending' | 'approved' | 'rejected';
  legalApprovalStatus?: 'pending' | 'approved' | 'rejected';
  approvalDocumentationUrl?: string;
  analysisTimeframeStart?: string;
  analysisTimeframeEnd?: string;
  
  // Version control
  currentVersion?: number;
  versionHistory?: InsightVersion[];
  
  // Hierarchical structure
  parentInsightId?: string; // null/undefined for root insights
  isRootInsight?: boolean; // true for top-level/aggregate insights
  childInsightIds?: string[]; // IDs of child insights
  dimensions?: { [key: string]: string }; // e.g., { "Geography": "US", "Gender": "Female" }
  availableDimensions?: InsightDimension[]; // Dimensions that can be used to filter children
}

// Legacy Insight interface for published insights
export interface Insight {
  id: string;
  statement: string; // Single combined statement
  dataPoints: DataPoint[]; // At least one data point
  footnote: string;
  sourceType: 'dashboard' | 'document' | 'api' | 'manual';
  confidence: number;
  tags: string[];
  team: string;
  domain: string;
  author: string;
  date: string;
  expiration: string;
  status: 'published' | 'draft' | 'review';
  metadata: MetadataField[];
  fullContent?: string;
  relatedInsights?: string[];
  views?: number;
  savedByUser?: boolean; // For My Library
  sharedWith?: string[]; // For shared insights
  
  // Approval and compliance fields
  sharingLevel?: SharingLevel;
  prApprovalStatus?: 'pending' | 'approved' | 'rejected';
  legalApprovalStatus?: 'pending' | 'approved' | 'rejected';
  approvalDocumentationUrl?: string;
  analysisTimeframeStart?: string;
  analysisTimeframeEnd?: string;
  
  // Version control
  currentVersion?: number;
  versionHistory?: InsightVersion[];
  
  // Hierarchical structure
  parentInsightId?: string; // null/undefined for root insights
  isRootInsight?: boolean; // true for top-level/aggregate insights
  childInsightIds?: string[]; // IDs of child insights
  dimensions?: { [key: string]: string }; // e.g., { "Geography": "US", "Gender": "Female" }
  availableDimensions?: InsightDimension[]; // Dimensions that can be used to filter children
}

export interface UploadProgress {
  id: string;
  fileName: string;
  status:
    | 'uploading'
    | 'extracting'
    | 'structuring'
    | 'validating'
    | 'complete';
  progress: number;
  insights: number;
  metadata: number;
  warnings: number;
}

export interface DataSource {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'upload' | 'integration' | 'manual';
}

// Standard metadata fields that exist in the system
export const standardMetadataFields = [
  'country',
  'region',
  'userSegment',
  'industry',
  'productLine',
  'customerType',
  'priority',
  'impactArea'
];

// Mock extracted insights for review (from a single upload)
export const mockExtractedInsights: ExtractedInsight[] = [
  {
    id: 'ext-1',
    statement: 'SOC 2 Type II certification is table-stakes requirement for enterprise sales. Security compliance is the primary evaluation criterion for 80% of enterprise prospects surveyed.',
    dataPoints: [
      { id: 'dp1', value: '80% of enterprise prospects require SOC 2 Type II certification', source: 'Survey data' },
      { id: 'dp2', value: '92% cite security as top 3 evaluation criteria', source: 'RFP analysis' }
    ],
    footnote: 'Enterprise_Security_Research_2026.pdf, Pages 12-15, Survey data from 500 enterprise decision makers',
    team: 'Strategy',
    expiration: '2027-02-13',
    approvalStatus: 'pending',
    confidence: 0.92,
    metadata: [
      { id: 'm1', label: 'Country', value: 'United States', type: 'select', isRequired: true },
      { id: 'm2', label: 'User Segment', value: 'Enterprise', type: 'select', isRequired: true },
      { id: 'm3', label: 'Industry', value: 'Cross-industry', type: 'select' },
      { id: 'm4', label: 'Company Size', value: '500+', type: 'select', isNew: true },
      { id: 'm5', label: 'Priority', value: 'High', type: 'select', isNew: true }
    ],
    sourceFile: 'Enterprise_Security_Research_2026.pdf',
    sourceType: 'document',
    extractedDate: '2026-02-13'
  },
  {
    id: 'ext-2',
    statement: 'GDPR compliance is critical for European market expansion. Data protection regulations are cited as blocker by 98% of EU prospects without compliance.',
    dataPoints: [
      { id: 'dp3', value: '98% of EU prospects require GDPR compliance', source: 'Focus groups' },
      { id: 'dp4', value: '65% would not proceed with vendor without certification', source: 'Deal analysis' }
    ],
    footnote: 'Enterprise_Security_Research_2026.pdf, Pages 18-22, Focus group findings from 50 EU companies',
    team: 'Strategy',
    expiration: '2027-02-13',
    approvalStatus: 'pending',
    confidence: 0.95,
    metadata: [
      { id: 'm6', label: 'Country', value: 'European Union', type: 'select', isRequired: true },
      { id: 'm7', label: 'User Segment', value: 'Enterprise', type: 'select', isRequired: true },
      { id: 'm8', label: 'Region', value: 'EMEA', type: 'select' },
      { id: 'm9', label: 'Regulation Type', value: 'GDPR', type: 'text', isNew: true }
    ],
    sourceFile: 'Enterprise_Security_Research_2026.pdf',
    sourceType: 'document',
    extractedDate: '2026-02-13'
  },
  {
    id: 'ext-3',
    statement: 'SSO integration requested by 92% of enterprise prospects during security evaluation phase.',
    dataPoints: [
      { id: 'dp5', value: '92% request SSO in RFPs', source: 'RFP analysis' },
      { id: 'dp6', value: 'Average implementation time: 2-3 weeks', source: 'Engineering data' }
    ],
    footnote: 'Enterprise_Security_Research_2026.pdf, Pages 25-28, Analysis of 200+ RFP responses',
    team: 'Strategy',
    expiration: '2027-02-13',
    approvalStatus: 'pending',
    confidence: 0.89,
    metadata: [
      { id: 'm10', label: 'Country', value: 'United States', type: 'select', isRequired: true },
      { id: 'm11', label: 'User Segment', value: 'Enterprise', type: 'select', isRequired: true },
      { id: 'm12', label: 'Feature Category', value: 'Authentication', type: 'select', isNew: true },
      { id: 'm13', label: 'Implementation Effort', value: 'Medium', type: 'select', isNew: true }
    ],
    sourceFile: 'Enterprise_Security_Research_2026.pdf',
    sourceType: 'document',
    extractedDate: '2026-02-13'
  },
  {
    id: 'ext-4',
    statement: 'Data residency options needed for regulated industries. Healthcare and financial services require data to remain within specific geographic boundaries.',
    dataPoints: [
      { id: 'dp7', value: '50% of enterprise prospects in regulated industries', source: 'Market analysis' },
      { id: 'dp8', value: 'HIPAA requires US-only data storage', source: 'Compliance requirements' },
      { id: 'dp9', value: 'PCI-DSS has specific geographic requirements', source: 'Compliance requirements' }
    ],
    footnote: 'Enterprise_Security_Research_2026.pdf, Pages 32-35, Compliance requirements analysis',
    team: 'Strategy',
    expiration: '2027-02-13',
    approvalStatus: 'pending',
    confidence: 0.87,
    metadata: [
      { id: 'm14', label: 'Country', value: 'Multiple', type: 'select', isRequired: true },
      { id: 'm15', label: 'User Segment', value: 'Enterprise', type: 'select', isRequired: true },
      { id: 'm16', label: 'Industry', value: 'Healthcare, Financial', type: 'text' },
      { id: 'm17', label: 'Compliance Driver', value: 'HIPAA, PCI-DSS', type: 'text', isNew: true }
    ],
    sourceFile: 'Enterprise_Security_Research_2026.pdf',
    sourceType: 'document',
    extractedDate: '2026-02-13'
  },
  {
    id: 'ext-5',
    statement: 'Mobile app security controls less mature than web platform. Security audit revealed gaps in mobile authentication and data encryption.',
    dataPoints: [
      { id: 'dp10', value: '3 critical vulnerabilities identified in mobile app', source: 'Security audit' },
      { id: 'dp11', value: 'Web platform has 0 critical vulnerabilities', source: 'Security audit' }
    ],
    footnote: 'Q4_Security_Audit_2025.pdf, Pages 8-12, Internal security assessment',
    team: 'Engineering',
    expiration: '2026-08-13',
    approvalStatus: 'pending',
    confidence: 0.91,
    metadata: [
      { id: 'm18', label: 'Platform', value: 'Mobile', type: 'select', isNew: true },
      { id: 'm19', label: 'Priority', value: 'Critical', type: 'select', isNew: true },
      { id: 'm20', label: 'Product Line', value: 'Mobile App', type: 'select' }
    ],
    sourceFile: 'Q4_Security_Audit_2025.pdf',
    sourceType: 'document',
    extractedDate: '2026-02-13'
  },
  {
    id: 'ext-6',
    statement: 'API rate limiting inadequate for enterprise use cases. Large customers hitting rate limits during peak usage, causing integration failures.',
    dataPoints: [
      { id: 'dp12', value: '45% of enterprise customers hit rate limits monthly', source: 'Support tickets' },
      { id: 'dp13', value: 'Average 12 support tickets per month related to rate limits', source: 'Support analysis' }
    ],
    footnote: 'Customer_Support_Analysis_Jan2026.csv, Rows 145-289, Support ticket analysis',
    team: 'Product',
    expiration: '2026-08-13',
    approvalStatus: 'pending',
    confidence: 0.88,
    metadata: [
      { id: 'm21', label: 'User Segment', value: 'Enterprise', type: 'select', isRequired: true },
      { id: 'm22', label: 'Product Line', value: 'API', type: 'select' },
      { id: 'm23', label: 'Impact Area', value: 'Performance', type: 'select' },
      { id: 'm24', label: 'Severity', value: 'High', type: 'select', isNew: true }
    ],
    sourceFile: 'Customer_Support_Analysis_Jan2026.csv',
    sourceType: 'document',
    extractedDate: '2026-02-13'
  },
  {
    id: 'ext-7',
    statement: 'Bulk operations feature requested in 45% of enterprise deals. Customers need to perform actions on large datasets (10K+ records) simultaneously.',
    dataPoints: [
      { id: 'dp14', value: '45% of enterprise deals request bulk operations', source: 'Win/loss analysis' },
      { id: 'dp15', value: 'Feature cited as blocker in 8 lost deals', source: 'Sales data' }
    ],
    footnote: 'Sales_Feedback_Q4_2025.pptx, Slides 23-27, Win/loss analysis from 80 deals',
    team: 'Product',
    expiration: '2026-11-13',
    approvalStatus: 'pending',
    confidence: 0.85,
    metadata: [
      { id: 'm25', label: 'User Segment', value: 'Enterprise', type: 'select', isRequired: true },
      { id: 'm26', label: 'Feature Type', value: 'Workflow', type: 'select', isNew: true },
      { id: 'm27', label: 'Deal Impact', value: 'Blocker', type: 'select', isNew: true }
    ],
    sourceFile: 'Sales_Feedback_Q4_2025.pptx',
    sourceType: 'document',
    extractedDate: '2026-02-13'
  },
  {
    id: 'ext-8',
    statement: 'Custom reporting needs vary significantly by industry vertical. Healthcare needs patient-level reporting while finance needs transaction-level detail.',
    dataPoints: [
      { id: 'dp16', value: 'Healthcare clients need HIPAA-compliant patient-level reports', source: 'User interviews' },
      { id: 'dp17', value: 'Financial services need transaction-level audit trails', source: 'User interviews' }
    ],
    footnote: 'User_Research_Interviews_2025.pdf, Pages 45-52, Interview synthesis from 30 customers',
    team: 'Design',
    expiration: '2026-11-13',
    approvalStatus: 'pending',
    confidence: 0.82,
    metadata: [
      { id: 'm28', label: 'Industry', value: 'Healthcare, Financial', type: 'text' },
      { id: 'm29', label: 'Feature Category', value: 'Reporting', type: 'select', isNew: true },
      { id: 'm30', label: 'Customization Level', value: 'High', type: 'select', isNew: true }
    ],
    sourceFile: 'User_Research_Interviews_2025.pdf',
    sourceType: 'document',
    extractedDate: '2026-02-13'
  },
  {
    id: 'ext-9',
    statement: 'SMB customers prefer pre-built templates over customization, with 70% preference for out-of-box solutions.',
    dataPoints: [
      { id: 'dp18', value: '70% of SMB users choose templates over custom builds', source: 'A/B test' },
      { id: 'dp19', value: 'Template users activate 2x faster than custom users', source: 'Product analytics' }
    ],
    footnote: 'SMB_Usability_Study_2025.pdf, Pages 12-18, A/B test results from 500 users',
    team: 'Design',
    expiration: '2026-11-13',
    approvalStatus: 'pending',
    confidence: 0.90,
    metadata: [
      { id: 'm31', label: 'User Segment', value: 'SMB', type: 'select', isRequired: true },
      { id: 'm32', label: 'Country', value: 'United States', type: 'select', isRequired: true },
      { id: 'm33', label: 'UX Pattern', value: 'Templates', type: 'text', isNew: true }
    ],
    sourceFile: 'SMB_Usability_Study_2025.pdf',
    sourceType: 'document',
    extractedDate: '2026-02-13'
  },
  {
    id: 'ext-10',
    statement: 'Mobile-first onboarding reduces activation time by 40% compared to desktop-first approach.',
    dataPoints: [
      { id: 'dp20', value: '40% faster activation for mobile-first users', source: 'Cohort analysis' },
      { id: 'dp21', value: 'Mobile users: 4 days to activate vs Desktop: 7 days', source: 'Product analytics' }
    ],
    footnote: 'Mobile_Analytics_Dashboard, Date range: Jan 1-31 2026, Cohort analysis of 2,500 users',
    team: 'Growth',
    expiration: '2026-08-13',
    approvalStatus: 'pending',
    confidence: 0.93,
    metadata: [
      { id: 'm34', label: 'Platform', value: 'Mobile', type: 'select', isNew: true },
      { id: 'm35', label: 'Metric Type', value: 'Activation', type: 'select', isNew: true },
      { id: 'm36', label: 'Sample Size', value: '2500', type: 'number', isNew: true }
    ],
    sourceFile: 'Mobile_Analytics_Dashboard',
    sourceType: 'dashboard',
    extractedDate: '2026-02-13'
  },
  {
    id: 'ext-11',
    statement: 'Pricing page confusion leads to 25% cart abandonment rate.',
    dataPoints: [
      { id: 'dp22', value: '25% of users abandon cart on pricing page', source: 'Funnel analysis' },
      { id: 'dp23', value: 'Average time on pricing page: 4.5 minutes (2x longer than other pages)', source: 'Analytics' }
    ],
    footnote: 'Conversion_Funnel_Analysis.pdf, Pages 8-14, Heatmap and session recording analysis',
    team: 'Growth',
    expiration: '2026-08-13',
    approvalStatus: 'pending',
    confidence: 0.86,
    metadata: [
      { id: 'm37', label: 'User Segment', value: 'All', type: 'select', isRequired: true },
      { id: 'm38', label: 'Funnel Stage', value: 'Consideration', type: 'select', isNew: true },
      { id: 'm39', label: 'Issue Type', value: 'UX', type: 'select', isNew: true }
    ],
    sourceFile: 'Conversion_Funnel_Analysis.pdf',
    sourceType: 'document',
    extractedDate: '2026-02-13'
  },
  {
    id: 'ext-12',
    statement: 'Competitor X launched AI-powered analytics feature threatening our position in mid-market segment.',
    dataPoints: [
      { id: 'dp24', value: 'Competitor feature launched January 2026', source: 'Competitive intel' },
      { id: 'dp25', value: '3 customers mentioned competitor feature in recent calls', source: 'Sales notes' }
    ],
    footnote: 'Competitive_Intelligence_Feb2026.pptx, Slides 8-12, Product teardown analysis',
    team: 'Strategy',
    expiration: '2026-05-13',
    approvalStatus: 'pending',
    confidence: 0.88,
    metadata: [
      { id: 'm40', label: 'Competitor', value: 'Competitor X', type: 'text', isNew: true },
      { id: 'm41', label: 'Feature Category', value: 'AI/ML', type: 'select', isNew: true },
      { id: 'm42', label: 'Threat Level', value: 'High', type: 'select', isNew: true }
    ],
    sourceFile: 'Competitive_Intelligence_Feb2026.pptx',
    sourceType: 'document',
    extractedDate: '2026-02-13'
  }
];

// Published insights (transformed from approved ExtractedInsights)
export const mockInsights: Insight[] = [
  {
    id: '1',
    statement: 'Customer churn increases 15% in Q4 due to pricing changes. Analysis of customer behavior data shows significant churn correlation with pricing tier adjustments implemented in October.',
    dataPoints: [
      { id: 'dp1', value: '15% increase in churn rate in Q4 2025', source: 'Customer analytics' },
      { id: 'dp2', value: '23% of mid-tier customers switched to competitors', source: 'Cohort analysis' },
      { id: 'dp3', value: 'Pricing changes implemented October 1, 2025', source: 'Product changelog' }
    ],
    footnote: 'Q4_Customer_Analysis.pdf, Pages 5-12, Cohort analysis of 5,000 customers',
    sourceType: 'dashboard',
    confidence: 0.92,
    tags: ['retention', 'pricing', 'customer behavior'],
    domain: 'Product Analytics',
    author: 'Sarah Chen',
    team: 'Data Science',
    date: '2026-02-10',
    expiration: '2026-08-10',
    status: 'published',
    metadata: [
      { id: 'm1', label: 'User Segment', value: 'Mid-tier', type: 'select', isRequired: true },
      { id: 'm2', label: 'Impact Area', value: 'Revenue', type: 'select' },
      { id: 'm3', label: 'Priority', value: 'Critical', type: 'select' }
    ],
    fullContent:
      'Deep dive analysis reveals that the 15% increase in customer churn during Q4 2025 was primarily driven by pricing tier changes. Customers in the mid-tier segment showed the highest sensitivity, with 23% moving to competitor solutions. The analysis suggests implementing a grandfathering strategy for existing customers and revisiting the value proposition for the mid-tier offering.',
    relatedInsights: ['2', '5'],
    views: 234,
    savedByUser: true,
    sharingLevel: 'controlled',
    prApprovalStatus: 'approved',
    legalApprovalStatus: 'approved',
    approvalDocumentationUrl: 'https://docs.company.com/approvals/insight-001-comms-approval.pdf',
    analysisTimeframeStart: '2025-10-01',
    analysisTimeframeEnd: '2025-12-31',
    currentVersion: 2,
    versionHistory: [
      {
        id: 'v1-1',
        version: 1,
        statement: 'Customer churn increases in Q4 due to pricing changes.',
        modifiedBy: 'Sarah Chen',
        modifiedDate: '2026-02-10',
        changeDescription: 'Initial version',
        metadata: []
      },
      {
        id: 'v1-2',
        version: 2,
        statement: 'Customer churn increases 15% in Q4 due to pricing changes. Analysis of customer behavior data shows significant churn correlation with pricing tier adjustments implemented in October.',
        modifiedBy: 'Sarah Chen',
        modifiedDate: '2026-02-12',
        changeDescription: 'Added specific percentage and expanded analysis details',
        metadata: [
          { id: 'm1', label: 'User Segment', value: 'Mid-tier', type: 'select', isRequired: true },
          { id: 'm2', label: 'Impact Area', value: 'Revenue', type: 'select' },
          { id: 'm3', label: 'Priority', value: 'Critical', type: 'select' }
        ]
      }
    ]
  },
  {
    id: '2',
    statement: 'Mobile app engagement increased 40% after redesign. User engagement metrics demonstrate substantial improvement following Q3 mobile app redesign initiative.',
    dataPoints: [
      { id: 'dp4', value: '40% increase in daily active users', source: 'Mobile analytics' },
      { id: 'dp5', value: '52% improvement in session duration', source: 'Mobile analytics' },
      { id: 'dp6', value: 'Redesign launched September 15, 2025', source: 'Product changelog' }
    ],
    footnote: 'Mobile_Metrics_Dashboard, Date range: Q3-Q4 2025, 50,000 daily active users tracked',
    sourceType: 'document',
    confidence: 0.88,
    tags: ['mobile', 'ux', 'engagement'],
    domain: 'Product Design',
    author: 'Marcus Rodriguez',
    team: 'Product Team',
    date: '2026-02-08',
    expiration: '2026-11-08',
    status: 'published',
    metadata: [
      { id: 'm4', label: 'Platform', value: 'Mobile', type: 'select' },
      { id: 'm5', label: 'Metric Type', value: 'Engagement', type: 'select' },
      { id: 'm6', label: 'Sample Size', value: '50000', type: 'number' }
    ],
    fullContent:
      'The mobile app redesign launched in Q3 2025 has exceeded performance targets with 40% increase in daily active users and 52% improvement in session duration. Key improvements include streamlined navigation, faster load times, and personalized content recommendations.',
    relatedInsights: ['1', '3'],
    views: 156
  },
  {
    id: '3',
    statement: 'New onboarding flow reduces time-to-value by 3 days. A/B test confirms streamlined onboarding significantly accelerates user activation.',
    dataPoints: [
      { id: 'dp7', value: 'Time-to-first-value reduced from 7 days to 4 days', source: 'A/B test results' },
      { id: 'dp8', value: '28% increase in activation rate', source: 'Experiment analysis' },
      { id: 'dp9', value: 'Test run over 6 weeks with 10,000 users', source: 'Experiment parameters' }
    ],
    footnote: 'Onboarding_Experiment.pptx, Slides 8-15, Statistical analysis of 10,000 users',
    sourceType: 'dashboard',
    confidence: 0.95,
    tags: ['onboarding', 'conversion', 'ux'],
    domain: 'Growth',
    author: 'Emily Watson',
    team: 'Growth Team',
    date: '2026-02-05',
    expiration: '2026-11-05',
    status: 'published',
    metadata: [
      { id: 'm7', label: 'Test Type', value: 'A/B Test', type: 'select' },
      { id: 'm8', label: 'Metric Type', value: 'Activation', type: 'select' },
      { id: 'm9', label: 'Sample Size', value: '10000', type: 'number' }
    ],
    fullContent:
      'A/B test conducted over 6 weeks with 10,000 users shows the new onboarding flow reduces time-to-first-value from 7 days to 4 days. The simplified 3-step process with contextual help increased activation rate by 28%.',
    relatedInsights: ['2', '4'],
    views: 189,
    savedByUser: false
  },
  {
    id: '4',
    statement: 'Enterprise customers prioritize security over features. Survey of 500+ enterprise decision makers reveals security and compliance as top purchase criteria.',
    dataPoints: [
      { id: 'dp10', value: '78% rank security as #1 evaluation criterion', source: 'Enterprise survey' },
      { id: 'dp11', value: '62% prioritize integration capabilities', source: 'Enterprise survey' },
      { id: 'dp12', value: 'Feature richness ranked 5th at 41%', source: 'Enterprise survey' }
    ],
    footnote: 'Enterprise_Survey_2025.pdf, Pages 12-20, Survey of 500 enterprise decision makers',
    sourceType: 'document',
    confidence: 0.85,
    tags: ['security', 'enterprise', 'market research'],
    domain: 'Strategy',
    author: 'David Kim',
    team: 'Strategy Team',
    date: '2026-02-01',
    expiration: '2027-02-01',
    status: 'published',
    metadata: [
      { id: 'm10', label: 'User Segment', value: 'Enterprise', type: 'select', isRequired: true },
      { id: 'm11', label: 'Research Type', value: 'Survey', type: 'select' },
      { id: 'm12', label: 'Sample Size', value: '500', type: 'number' }
    ],
    views: 145
  },
  {
    id: '5',
    statement: 'Three new well-funded competitors entered market in Q4 2025. Market intelligence identifies emerging competitive threats with differentiated positioning.',
    dataPoints: [
      { id: 'dp13', value: 'AI-first automation startup raised Series B $50M', source: 'Market intel' },
      { id: 'dp14', value: 'Healthcare-specific solution raised Series A $20M', source: 'Market intel' },
      { id: 'dp15', value: 'Open-source alternative gaining community traction', source: 'Market intel' }
    ],
    footnote: 'Competitive_Landscape_Q4_2025.pdf, Pages 5-18, Market intelligence report',
    sourceType: 'manual',
    confidence: 0.78,
    tags: ['competition', 'market analysis', 'strategy'],
    domain: 'Strategy',
    author: 'Lisa Thompson',
    team: 'Strategy Team',
    date: '2026-01-28',
    expiration: '2026-07-28',
    status: 'published',
    metadata: [
      { id: 'm13', label: 'Market', value: 'North America', type: 'select' },
      { id: 'm14', label: 'Threat Level', value: 'High', type: 'select' }
    ],
    views: 98,
    sharedWith: ['Product Team', 'Engineering']
  },
  {
    id: '6',
    statement: 'Top 10 feature requests for 2026 identified from user feedback. Aggregated feedback from support tickets, surveys, and user interviews reveals priority improvements.',
    dataPoints: [
      { id: 'dp16', value: 'Advanced reporting/export mentioned 487 times', source: 'Feedback analysis' },
      { id: 'dp17', value: 'API rate limit increases requested 401 times', source: 'Feedback analysis' },
      { id: 'dp18', value: 'Bulk operations requested 356 times', source: 'Feedback analysis' }
    ],
    footnote: 'User_Feedback_Synthesis_2025.pdf, Pages 8-25, Analysis of 2,500+ feedback points',
    sourceType: 'document',
    confidence: 0.9,
    tags: ['product feedback', 'roadmap', 'user research'],
    domain: 'Product Management',
    author: 'Alex Martinez',
    team: 'Product Team',
    date: '2026-01-25',
    expiration: '2027-01-25',
    status: 'published',
    metadata: [
      { id: 'm15', label: 'Research Type', value: 'Synthesis', type: 'select' },
      { id: 'm16', label: 'Sample Size', value: '2500', type: 'number' }
    ],
    views: 178,
    savedByUser: true
  }
];

export const mockDataSources: DataSource[] = [
  {
    id: 'cloud-storage',
    name: 'Cloud Storage',
    description: 'Connect to Google Drive, Dropbox, OneDrive, or S3',
    icon: 'cloud',
    category: 'integration'
  },
  {
    id: 'document-upload',
    name: 'Document Upload',
    description: 'Upload PPT, PDF, CSV, or Excel files',
    icon: 'file-up',
    category: 'upload'
  },
  {
    id: 'dashboard-ingestion',
    name: 'Dashboard Ingestion',
    description: 'Import from Tableau, Looker, or PowerBI',
    icon: 'bar-chart-3',
    category: 'integration'
  },
  {
    id: 'api-integration',
    name: 'API Integration',
    description: 'Connect via REST API or webhooks',
    icon: 'plug',
    category: 'integration'
  },
  {
    id: 'manual-entry',
    name: 'Manual Entry',
    description: 'Create insights manually with rich text editor',
    icon: 'edit',
    category: 'manual'
  }
];

export const mockUploadHistory = [
  {
    id: 'up-1',
    fileName: 'Enterprise_Security_Research_2026.pdf',
    uploadedBy: 'Sarah Chen',
    date: '2026-02-13',
    insights: 12,
    status: 'complete'
  },
  {
    id: 'up-2',
    fileName: 'Q4_Customer_Analysis.pdf',
    uploadedBy: 'Sarah Chen',
    date: '2026-02-10',
    insights: 3,
    status: 'complete'
  },
  {
    id: 'up-3',
    fileName: 'Mobile_App_Metrics_Dashboard',
    uploadedBy: 'Marcus Rodriguez',
    date: '2026-02-08',
    insights: 2,
    status: 'complete'
  }
];

// For Home page - insights organized by category
export const getTrendingInsights = (days: number = 7) => {
  // Simulate filtering by views
  return mockInsights
    .filter(i => i.views && i.views > 100)
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 6);
};

export const getRecentInsights = (days: number = 7) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return mockInsights
    .filter(i => new Date(i.date) >= cutoffDate)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);
};

export const getTopInsights = (days: number = 7) => {
  // Simulate filtering by confidence + views
  return mockInsights
    .filter(i => i.confidence > 0.85)
    .sort((a, b) => {
      const scoreA = a.confidence * (a.views || 0);
      const scoreB = b.confidence * (b.views || 0);
      return scoreB - scoreA;
    })
    .slice(0, 6);
};

// For My Library page
export const getSavedInsights = () => {
  return mockInsights.filter(i => i.savedByUser);
};

export const getSharedInsights = () => {
  return mockInsights.filter(i => i.sharedWith && i.sharedWith.length > 0);
};

export const getUserUploads = () => {
  return mockUploadHistory.filter(u => u.uploadedBy === 'Current User');
};

export const mockRecentSearches = [
  { id: 's1', query: 'customer churn pricing', timestamp: '2026-02-14' },
  { id: 's2', query: 'mobile engagement', timestamp: '2026-02-13' },
  { id: 's3', query: 'enterprise security', timestamp: '2026-02-12' }
];

// Hierarchical insights data structure
// Root insight example with child insights subdivided by dimensions

// Helper function to get all child insights for a parent
export const getChildInsights = (parentId: string): Insight[] => {
  return mockInsights.filter(insight => insight.parentInsightId === parentId);
};

// Helper function to get an insight by ID
export const getInsightById = (id: string): Insight | undefined => {
  return mockInsights.find(insight => insight.id === id);
};

// Sample hierarchical insight structure
// Root insight: Overall conversion pattern
// Child insights: Subdivided by geography, gender, device type, etc.

// Adding hierarchical insights to mockInsights
export const hierarchicalInsights: Insight[] = [
  // ROOT INSIGHT 1: Homepage conversion by traffic source
  {
    id: 'root-1',
    isRootInsight: true,
    statement: 'Customers who clicked on the homepage after landing from Instagram are 30% more likely to make a purchase compared to customers who click on "Add to Cart" directly. Overall conversion rate: 8.5% vs 6.5%.',
    dataPoints: [
      { id: 'dp-r1-1', value: 'Instagram → Homepage conversion rate: 8.5%', source: 'Analytics Dashboard' },
      { id: 'dp-r1-2', value: 'Direct → Add to Cart conversion rate: 6.5%', source: 'Analytics Dashboard' },
      { id: 'dp-r1-3', value: 'Sample size: 50,000 sessions analyzed', source: 'Analytics Dashboard' }
    ],
    footnote: 'Conversion_Analysis_Jan2026.pdf, Pages 5-12, Analysis of 50,000 user sessions from December 2025',
    sourceType: 'dashboard',
    confidence: 0.91,
    tags: ['conversion', 'traffic source', 'instagram', 'homepage'],
    domain: 'Growth',
    author: 'Emily Watson',
    team: 'Growth Team',
    date: '2026-02-01',
    expiration: '2026-08-01',
    status: 'published',
    metadata: [
      { id: 'mr1-1', label: 'Traffic Source', value: 'Instagram', type: 'select' },
      { id: 'mr1-2', label: 'Metric Type', value: 'Conversion', type: 'select' },
      { id: 'mr1-3', label: 'Analysis Period', value: 'December 2025', type: 'text' }
    ],
    views: 342,
    savedByUser: true,
    childInsightIds: ['child-1-1', 'child-1-2', 'child-1-3', 'child-1-4', 'child-1-5', 'child-1-6', 'child-1-7', 'child-1-8'],
    availableDimensions: [
      { id: 'dim-geo', name: 'Geography', values: ['United States', 'United Kingdom', 'Canada', 'Australia'] },
      { id: 'dim-gender', name: 'Gender', values: ['Male', 'Female', 'Other'] },
      { id: 'dim-device', name: 'Device Type', values: ['Mobile', 'Desktop', 'Tablet'] },
      { id: 'dim-age', name: 'Age Group', values: ['18-24', '25-34', '35-44', '45-54', '55+'] }
    ]
  },
  // Child insights for root-1 subdivided by Geography
  {
    id: 'child-1-1',
    parentInsightId: 'root-1',
    isRootInsight: false,
    statement: 'For US customers: Instagram → Homepage conversion rate is 9.2% vs 6.8% for direct Add to Cart. 35% higher conversion rate.',
    dataPoints: [
      { id: 'dp-c1-1-1', value: 'US Instagram → Homepage: 9.2% conversion', source: 'Analytics Dashboard' },
      { id: 'dp-c1-1-2', value: 'US Direct → Add to Cart: 6.8% conversion', source: 'Analytics Dashboard' },
      { id: 'dp-c1-1-3', value: 'Sample size: 22,000 US sessions', source: 'Analytics Dashboard' }
    ],
    footnote: 'Conversion_Analysis_Jan2026.pdf, Pages 13-15, US market segment analysis',
    sourceType: 'dashboard',
    confidence: 0.93,
    tags: ['conversion', 'traffic source', 'instagram', 'homepage', 'united states'],
    domain: 'Growth',
    author: 'Emily Watson',
    team: 'Growth Team',
    date: '2026-02-01',
    expiration: '2026-08-01',
    status: 'published',
    metadata: [
      { id: 'mc1-1-1', label: 'Geography', value: 'United States', type: 'select' },
      { id: 'mc1-1-2', label: 'Traffic Source', value: 'Instagram', type: 'select' }
    ],
    dimensions: { 'Geography': 'United States' },
    views: 145
  },
  {
    id: 'child-1-2',
    parentInsightId: 'root-1',
    isRootInsight: false,
    statement: 'For UK customers: Instagram → Homepage conversion rate is 7.8% vs 6.1% for direct Add to Cart. 28% higher conversion rate.',
    dataPoints: [
      { id: 'dp-c1-2-1', value: 'UK Instagram → Homepage: 7.8% conversion', source: 'Analytics Dashboard' },
      { id: 'dp-c1-2-2', value: 'UK Direct → Add to Cart: 6.1% conversion', source: 'Analytics Dashboard' },
      { id: 'dp-c1-2-3', value: 'Sample size: 12,000 UK sessions', source: 'Analytics Dashboard' }
    ],
    footnote: 'Conversion_Analysis_Jan2026.pdf, Pages 16-18, UK market segment analysis',
    sourceType: 'dashboard',
    confidence: 0.89,
    tags: ['conversion', 'traffic source', 'instagram', 'homepage', 'united kingdom'],
    domain: 'Growth',
    author: 'Emily Watson',
    team: 'Growth Team',
    date: '2026-02-01',
    expiration: '2026-08-01',
    status: 'published',
    metadata: [
      { id: 'mc1-2-1', label: 'Geography', value: 'United Kingdom', type: 'select' },
      { id: 'mc1-2-2', label: 'Traffic Source', value: 'Instagram', type: 'select' }
    ],
    dimensions: { 'Geography': 'United Kingdom' },
    views: 89
  },
  // Child insights subdivided by Gender
  {
    id: 'child-1-3',
    parentInsightId: 'root-1',
    isRootInsight: false,
    statement: 'For Female customers: Instagram → Homepage conversion rate is 10.1% vs 7.2% for direct Add to Cart. 40% higher conversion rate.',
    dataPoints: [
      { id: 'dp-c1-3-1', value: 'Female Instagram → Homepage: 10.1% conversion', source: 'Analytics Dashboard' },
      { id: 'dp-c1-3-2', value: 'Female Direct → Add to Cart: 7.2% conversion', source: 'Analytics Dashboard' },
      { id: 'dp-c1-3-3', value: 'Sample size: 28,000 female user sessions', source: 'Analytics Dashboard' }
    ],
    footnote: 'Conversion_Analysis_Jan2026.pdf, Pages 19-21, Gender-based segment analysis',
    sourceType: 'dashboard',
    confidence: 0.92,
    tags: ['conversion', 'traffic source', 'instagram', 'homepage', 'female'],
    domain: 'Growth',
    author: 'Emily Watson',
    team: 'Growth Team',
    date: '2026-02-01',
    expiration: '2026-08-01',
    status: 'published',
    metadata: [
      { id: 'mc1-3-1', label: 'Gender', value: 'Female', type: 'select' },
      { id: 'mc1-3-2', label: 'Traffic Source', value: 'Instagram', type: 'select' }
    ],
    dimensions: { 'Gender': 'Female' },
    views: 167
  },
  {
    id: 'child-1-4',
    parentInsightId: 'root-1',
    isRootInsight: false,
    statement: 'For Male customers: Instagram → Homepage conversion rate is 7.2% vs 5.9% for direct Add to Cart. 22% higher conversion rate.',
    dataPoints: [
      { id: 'dp-c1-4-1', value: 'Male Instagram → Homepage: 7.2% conversion', source: 'Analytics Dashboard' },
      { id: 'dp-c1-4-2', value: 'Male Direct → Add to Cart: 5.9% conversion', source: 'Analytics Dashboard' },
      { id: 'dp-c1-4-3', value: 'Sample size: 19,000 male user sessions', source: 'Analytics Dashboard' }
    ],
    footnote: 'Conversion_Analysis_Jan2026.pdf, Pages 22-24, Gender-based segment analysis',
    sourceType: 'dashboard',
    confidence: 0.88,
    tags: ['conversion', 'traffic source', 'instagram', 'homepage', 'male'],
    domain: 'Growth',
    author: 'Emily Watson',
    team: 'Growth Team',
    date: '2026-02-01',
    expiration: '2026-08-01',
    status: 'published',
    metadata: [
      { id: 'mc1-4-1', label: 'Gender', value: 'Male', type: 'select' },
      { id: 'mc1-4-2', label: 'Traffic Source', value: 'Instagram', type: 'select' }
    ],
    dimensions: { 'Gender': 'Male' },
    views: 134
  },
  // Child insights subdivided by Device Type
  {
    id: 'child-1-5',
    parentInsightId: 'root-1',
    isRootInsight: false,
    statement: 'For Mobile users: Instagram → Homepage conversion rate is 8.9% vs 6.7% for direct Add to Cart. 33% higher conversion rate.',
    dataPoints: [
      { id: 'dp-c1-5-1', value: 'Mobile Instagram → Homepage: 8.9% conversion', source: 'Analytics Dashboard' },
      { id: 'dp-c1-5-2', value: 'Mobile Direct → Add to Cart: 6.7% conversion', source: 'Analytics Dashboard' },
      { id: 'dp-c1-5-3', value: 'Sample size: 35,000 mobile sessions', source: 'Analytics Dashboard' }
    ],
    footnote: 'Conversion_Analysis_Jan2026.pdf, Pages 25-27, Device-based segment analysis',
    sourceType: 'dashboard',
    confidence: 0.94,
    tags: ['conversion', 'traffic source', 'instagram', 'homepage', 'mobile'],
    domain: 'Growth',
    author: 'Emily Watson',
    team: 'Growth Team',
    date: '2026-02-01',
    expiration: '2026-08-01',
    status: 'published',
    metadata: [
      { id: 'mc1-5-1', label: 'Device Type', value: 'Mobile', type: 'select' },
      { id: 'mc1-5-2', label: 'Traffic Source', value: 'Instagram', type: 'select' }
    ],
    dimensions: { 'Device Type': 'Mobile' },
    views: 203
  },
  {
    id: 'child-1-6',
    parentInsightId: 'root-1',
    isRootInsight: false,
    statement: 'For Desktop users: Instagram → Homepage conversion rate is 8.0% vs 6.3% for direct Add to Cart. 27% higher conversion rate.',
    dataPoints: [
      { id: 'dp-c1-6-1', value: 'Desktop Instagram → Homepage: 8.0% conversion', source: 'Analytics Dashboard' },
      { id: 'dp-c1-6-2', value: 'Desktop Direct → Add to Cart: 6.3% conversion', source: 'Analytics Dashboard' },
      { id: 'dp-c1-6-3', value: 'Sample size: 13,000 desktop sessions', source: 'Analytics Dashboard' }
    ],
    footnote: 'Conversion_Analysis_Jan2026.pdf, Pages 28-30, Device-based segment analysis',
    sourceType: 'dashboard',
    confidence: 0.87,
    tags: ['conversion', 'traffic source', 'instagram', 'homepage', 'desktop'],
    domain: 'Growth',
    author: 'Emily Watson',
    team: 'Growth Team',
    date: '2026-02-01',
    expiration: '2026-08-01',
    status: 'published',
    metadata: [
      { id: 'mc1-6-1', label: 'Device Type', value: 'Desktop', type: 'select' },
      { id: 'mc1-6-2', label: 'Traffic Source', value: 'Instagram', type: 'select' }
    ],
    dimensions: { 'Device Type': 'Desktop' },
    views: 112
  },
  // Child insights subdivided by Age Group
  {
    id: 'child-1-7',
    parentInsightId: 'root-1',
    isRootInsight: false,
    statement: 'For 18-24 age group: Instagram → Homepage conversion rate is 11.2% vs 7.8% for direct Add to Cart. 44% higher conversion rate.',
    dataPoints: [
      { id: 'dp-c1-7-1', value: '18-24 Instagram → Homepage: 11.2% conversion', source: 'Analytics Dashboard' },
      { id: 'dp-c1-7-2', value: '18-24 Direct → Add to Cart: 7.8% conversion', source: 'Analytics Dashboard' },
      { id: 'dp-c1-7-3', value: 'Sample size: 18,000 sessions from 18-24 age group', source: 'Analytics Dashboard' }
    ],
    footnote: 'Conversion_Analysis_Jan2026.pdf, Pages 31-33, Age-based segment analysis',
    sourceType: 'dashboard',
    confidence: 0.90,
    tags: ['conversion', 'traffic source', 'instagram', 'homepage', '18-24'],
    domain: 'Growth',
    author: 'Emily Watson',
    team: 'Growth Team',
    date: '2026-02-01',
    expiration: '2026-08-01',
    status: 'published',
    metadata: [
      { id: 'mc1-7-1', label: 'Age Group', value: '18-24', type: 'select' },
      { id: 'mc1-7-2', label: 'Traffic Source', value: 'Instagram', type: 'select' }
    ],
    dimensions: { 'Age Group': '18-24' },
    views: 178
  },
  {
    id: 'child-1-8',
    parentInsightId: 'root-1',
    isRootInsight: false,
    statement: 'For 25-34 age group: Instagram → Homepage conversion rate is 8.1% vs 6.2% for direct Add to Cart. 31% higher conversion rate.',
    dataPoints: [
      { id: 'dp-c1-8-1', value: '25-34 Instagram → Homepage: 8.1% conversion', source: 'Analytics Dashboard' },
      { id: 'dp-c1-8-2', value: '25-34 Direct → Add to Cart: 6.2% conversion', source: 'Analytics Dashboard' },
      { id: 'dp-c1-8-3', value: 'Sample size: 20,000 sessions from 25-34 age group', source: 'Analytics Dashboard' }
    ],
    footnote: 'Conversion_Analysis_Jan2026.pdf, Pages 34-36, Age-based segment analysis',
    sourceType: 'dashboard',
    confidence: 0.91,
    tags: ['conversion', 'traffic source', 'instagram', 'homepage', '25-34'],
    domain: 'Growth',
    author: 'Emily Watson',
    team: 'Growth Team',
    date: '2026-02-01',
    expiration: '2026-08-01',
    status: 'published',
    metadata: [
      { id: 'mc1-8-1', label: 'Age Group', value: '25-34', type: 'select' },
      { id: 'mc1-8-2', label: 'Traffic Source', value: 'Instagram', type: 'select' }
    ],
    dimensions: { 'Age Group': '25-34' },
    views: 156
  },
  
  // ROOT INSIGHT 2: Feature adoption by user segment
  {
    id: 'root-2',
    isRootInsight: true,
    statement: 'Enterprise customers adopt advanced reporting features 2.5x faster than SMB customers. Average time to feature adoption: 12 days vs 30 days.',
    dataPoints: [
      { id: 'dp-r2-1', value: 'Enterprise adoption time: 12 days average', source: 'Product Analytics' },
      { id: 'dp-r2-2', value: 'SMB adoption time: 30 days average', source: 'Product Analytics' },
      { id: 'dp-r2-3', value: 'Sample size: 1,200 customers analyzed', source: 'Product Analytics' }
    ],
    footnote: 'Feature_Adoption_Analysis_Q1_2026.pdf, Pages 8-15, Cohort analysis of 1,200 customers',
    sourceType: 'dashboard',
    confidence: 0.88,
    tags: ['feature adoption', 'enterprise', 'smb', 'reporting'],
    domain: 'Product Analytics',
    author: 'Sarah Chen',
    team: 'Data Science',
    date: '2026-02-05',
    expiration: '2026-08-05',
    status: 'published',
    metadata: [
      { id: 'mr2-1', label: 'Feature Category', value: 'Reporting', type: 'select' },
      { id: 'mr2-2', label: 'Metric Type', value: 'Adoption', type: 'select' },
      { id: 'mr2-3', label: 'Analysis Period', value: 'Q1 2026', type: 'text' }
    ],
    views: 267,
    savedByUser: false,
    childInsightIds: ['child-2-1', 'child-2-2', 'child-2-3', 'child-2-4'],
    availableDimensions: [
      { id: 'dim-segment', name: 'Customer Segment', values: ['Enterprise', 'Mid-Market', 'SMB'] },
      { id: 'dim-industry', name: 'Industry', values: ['Technology', 'Healthcare', 'Financial Services', 'Retail'] },
      { id: 'dim-region', name: 'Region', values: ['North America', 'EMEA', 'APAC', 'LATAM'] }
    ]
  },
  {
    id: 'child-2-1',
    parentInsightId: 'root-2',
    isRootInsight: false,
    statement: 'Technology sector enterprises adopt reporting features in 9 days, fastest across all industries.',
    dataPoints: [
      { id: 'dp-c2-1-1', value: 'Technology enterprise adoption: 9 days average', source: 'Product Analytics' },
      { id: 'dp-c2-1-2', value: '35% faster than cross-industry average', source: 'Product Analytics' },
      { id: 'dp-c2-1-3', value: 'Sample size: 280 technology enterprises', source: 'Product Analytics' }
    ],
    footnote: 'Feature_Adoption_Analysis_Q1_2026.pdf, Pages 16-18, Technology sector analysis',
    sourceType: 'dashboard',
    confidence: 0.89,
    tags: ['feature adoption', 'enterprise', 'technology', 'reporting'],
    domain: 'Product Analytics',
    author: 'Sarah Chen',
    team: 'Data Science',
    date: '2026-02-05',
    expiration: '2026-08-05',
    status: 'published',
    metadata: [
      { id: 'mc2-1-1', label: 'Industry', value: 'Technology', type: 'select' },
      { id: 'mc2-1-2', label: 'Customer Segment', value: 'Enterprise', type: 'select' }
    ],
    dimensions: { 'Industry': 'Technology', 'Customer Segment': 'Enterprise' },
    views: 98
  },
  {
    id: 'child-2-2',
    parentInsightId: 'root-2',
    isRootInsight: false,
    statement: 'Healthcare enterprises adopt reporting features in 14 days, requiring more compliance verification.',
    dataPoints: [
      { id: 'dp-c2-2-1', value: 'Healthcare enterprise adoption: 14 days average', source: 'Product Analytics' },
      { id: 'dp-c2-2-2', value: 'Compliance checks add 3-5 days to adoption', source: 'Product Analytics' },
      { id: 'dp-c2-2-3', value: 'Sample size: 150 healthcare enterprises', source: 'Product Analytics' }
    ],
    footnote: 'Feature_Adoption_Analysis_Q1_2026.pdf, Pages 19-21, Healthcare sector analysis',
    sourceType: 'dashboard',
    confidence: 0.85,
    tags: ['feature adoption', 'enterprise', 'healthcare', 'reporting', 'compliance'],
    domain: 'Product Analytics',
    author: 'Sarah Chen',
    team: 'Data Science',
    date: '2026-02-05',
    expiration: '2026-08-05',
    status: 'published',
    metadata: [
      { id: 'mc2-2-1', label: 'Industry', value: 'Healthcare', type: 'select' },
      { id: 'mc2-2-2', label: 'Customer Segment', value: 'Enterprise', type: 'select' }
    ],
    dimensions: { 'Industry': 'Healthcare', 'Customer Segment': 'Enterprise' },
    views: 76
  },
  {
    id: 'child-2-3',
    parentInsightId: 'root-2',
    isRootInsight: false,
    statement: 'EMEA region enterprises adopt reporting features 20% slower than North America due to data residency setup.',
    dataPoints: [
      { id: 'dp-c2-3-1', value: 'EMEA enterprise adoption: 14.5 days average', source: 'Product Analytics' },
      { id: 'dp-c2-3-2', value: 'North America enterprise adoption: 11.5 days average', source: 'Product Analytics' },
      { id: 'dp-c2-3-3', value: 'Sample size: 450 enterprises (EMEA + NA)', source: 'Product Analytics' }
    ],
    footnote: 'Feature_Adoption_Analysis_Q1_2026.pdf, Pages 22-24, Regional comparison analysis',
    sourceType: 'dashboard',
    confidence: 0.87,
    tags: ['feature adoption', 'enterprise', 'emea', 'reporting', 'data residency'],
    domain: 'Product Analytics',
    author: 'Sarah Chen',
    team: 'Data Science',
    date: '2026-02-05',
    expiration: '2026-08-05',
    status: 'published',
    metadata: [
      { id: 'mc2-3-1', label: 'Region', value: 'EMEA', type: 'select' },
      { id: 'mc2-3-2', label: 'Customer Segment', value: 'Enterprise', type: 'select' }
    ],
    dimensions: { 'Region': 'EMEA', 'Customer Segment': 'Enterprise' },
    views: 89
  },
  {
    id: 'child-2-4',
    parentInsightId: 'root-2',
    isRootInsight: false,
    statement: 'Mid-market customers adopt reporting features in 18 days, between enterprise and SMB speeds.',
    dataPoints: [
      { id: 'dp-c2-4-1', value: 'Mid-market adoption: 18 days average', source: 'Product Analytics' },
      { id: 'dp-c2-4-2', value: '50% faster than SMB, 50% slower than enterprise', source: 'Product Analytics' },
      { id: 'dp-c2-4-3', value: 'Sample size: 400 mid-market customers', source: 'Product Analytics' }
    ],
    footnote: 'Feature_Adoption_Analysis_Q1_2026.pdf, Pages 25-27, Mid-market segment analysis',
    sourceType: 'dashboard',
    confidence: 0.88,
    tags: ['feature adoption', 'mid-market', 'reporting'],
    domain: 'Product Analytics',
    author: 'Sarah Chen',
    team: 'Data Science',
    date: '2026-02-05',
    expiration: '2026-08-05',
    status: 'published',
    metadata: [
      { id: 'mc2-4-1', label: 'Customer Segment', value: 'Mid-Market', type: 'select' },
      { id: 'mc2-4-2', label: 'Feature Category', value: 'Reporting', type: 'select' }
    ],
    dimensions: { 'Customer Segment': 'Mid-Market' },
    views: 67
  }
];

// Merge hierarchical insights into mockInsights
mockInsights.push(...hierarchicalInsights);