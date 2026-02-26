import { Book, FileUp, CheckCircle, Search, Save, Share2, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { useState } from 'react';

export function Help() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const gettingStartedSteps = [
    {
      icon: FileUp,
      title: 'Upload Research Documents',
      description: 'Start by uploading your research files (PDF, PowerPoint, CSV, or connect to analytics dashboards). Our AI will automatically extract insights from your documents.',
      steps: [
        'Navigate to the Ingestion page from the sidebar',
        'Choose a data source (File Upload, Dashboard, API, or Manual Entry)',
        'Upload your research documents or connect to your data source',
        'Wait for AI processing - insights will be extracted automatically',
        'Review the extraction progress and any warnings'
      ]
    },
    {
      icon: CheckCircle,
      title: 'Review & Approve Insights',
      description: 'After extraction, review each insight to ensure accuracy and completeness. You can approve, reject, or flag insights for further review.',
      steps: [
        'Go to the Insight Library page to see extracted insights',
        'Review each insight statement and its supporting data',
        'Check the confidence score and metadata fields',
        'Edit or add custom metadata fields as needed',
        'Approve insights individually or in bulk',
        'Rejected insights can be revised and resubmitted'
      ]
    },
    {
      icon: Search,
      title: 'Search & Discover Insights',
      description: 'Use powerful search and filtering to find relevant insights across your entire research database.',
      steps: [
        'Navigate to the Search / Discovery page',
        'Use the search bar to find insights by keywords',
        'Apply filters for team, date range, confidence, tags, and metadata',
        'Sort results by relevance, date, or confidence score',
        'Click any insight to view full details'
      ]
    },
    {
      icon: Save,
      title: 'Save to My Library',
      description: 'Build your personal collection of relevant insights for quick access and reference.',
      steps: [
        'Find an insight you want to save',
        'Click the bookmark icon or "Save" button',
        'Access your saved insights anytime from the "My Library" link',
        'Remove insights from your library when no longer needed'
      ]
    },
    {
      icon: Share2,
      title: 'Share with Your Team',
      description: 'Collaborate by sharing insights with team members and adding comments for discussion.',
      steps: [
        'Open an insight detail page',
        'Click the "Share" button',
        'Select team members or groups to share with',
        'Add comments to start a discussion',
        'Team members will be notified of shared insights'
      ]
    }
  ];

  const faqs = [
    {
      question: 'What types of files can I upload?',
      answer: 'Aetio supports PDF documents, PowerPoint presentations (PPT/PPTX), CSV/Excel files, and can connect to analytics dashboards and APIs. Files can be up to 100MB in size. For best results, ensure your documents contain clear research findings with data points and citations.'
    },
    {
      question: 'How does the AI extract insights?',
      answer: 'Our AI uses advanced natural language processing to identify key findings, patterns, and actionable insights from your research documents. It looks for statements supported by data, identifies metadata like geographic regions and user segments, and validates findings against source citations. The AI assigns a confidence score based on source quality and data completeness.'
    },
    {
      question: 'What is a confidence score?',
      answer: 'The confidence score (0-100%) represents how certain the AI is about the accuracy and validity of an insight. Scores above 85% are considered high confidence. The score is based on factors like source quality, data completeness, citation clarity, and consistency with other findings. You should always review insights regardless of confidence score.'
    },
    {
      question: 'How long are insights valid?',
      answer: 'Each insight has an expiration date that indicates when the information may become outdated. This is typically set based on the research type - market research might expire after 6-12 months, while product feedback might be valid for 3-6 months. You can extend expiration dates or archive insights as needed.'
    },
    {
      question: 'Can I edit insights after approval?',
      answer: 'Yes, approved insights can be edited at any time. When you make changes, a new version is created and the version history is preserved. This allows you to track how insights evolve over time while maintaining an audit trail. All previous versions remain accessible for reference.'
    },
    {
      question: 'Who can see my insights?',
      answer: 'Visibility depends on the sharing level: Internal Comms Only (your team only), Controlled Audience Comms (approved teams/stakeholders), or Public Comms (all company users). Draft and rejected insights are only visible to you and your team. You can change sharing levels after PR and Legal approval.'
    },
    {
      question: 'What are the different approval levels?',
      answer: 'There are three approval levels: 1) Team Approval - your immediate team reviews and approves the insight for accuracy. 2) PR Approval - required for controlled audience or public sharing to ensure messaging is appropriate. 3) Legal Approval - required for public communications to ensure compliance with regulations and company policies.'
    },
    {
      question: 'How do I add custom metadata fields?',
      answer: 'During the review process, you can add custom metadata fields by clicking "Add Field" in the metadata section. Enter a field name and value. Custom fields are highlighted with a "Custom" badge and can be used for filtering and organizing insights specific to your team\'s needs.'
    },
    {
      question: 'What happens to expired insights?',
      answer: 'Expired insights are flagged with a warning badge and moved to an "Expiring Soon" or "Expired" filter category. They remain searchable and accessible but are clearly marked as potentially outdated. You can extend the expiration date, archive the insight, or create a new version with updated data.'
    },
    {
      question: 'How do I export insights?',
      answer: 'You can export individual insights or bulk export from the search results. Click the "Export" button and choose your format (PDF, CSV, or PowerPoint). Exports include the insight statement, metadata, source citations, and confidence scores. This is useful for creating reports or presentations.'
    },
    {
      question: 'Can I upload insights manually?',
      answer: 'Yes! If you have insights that weren\'t extracted from documents, you can manually create them using the "Manual Entry" option in the Ingestion page. You\'ll need to provide the insight statement, supporting data points, source citation, and required metadata fields.'
    },
    {
      question: 'How do version histories work?',
      answer: 'Every time an insight is edited, a new version is created. The version history shows all changes, who made them, when, and why. You can view previous versions at any time by clicking on them in the Version History panel. This ensures transparency and allows you to track how insights evolve based on new data.'
    }
  ];

  const glossaryTerms = [
    {
      term: 'Insight',
      definition: 'A single, actionable finding derived from research data. Insights are statements backed by evidence that inform business decisions and strategy.'
    },
    {
      term: 'Insight Statement',
      definition: 'The primary text that describes the insight in a clear, concise manner. It should be specific, measurable, and actionable.'
    },
    {
      term: 'Data Points',
      definition: 'Individual pieces of evidence that support an insight. Examples include survey statistics, user feedback quotes, or analytics metrics.'
    },
    {
      term: 'Confidence Score',
      definition: 'A percentage (0-100%) indicating the AI\'s certainty about an insight\'s accuracy. Based on source quality, data completeness, and validation checks.'
    },
    {
      term: 'Metadata',
      definition: 'Descriptive information about an insight, such as geographic region, user segment, industry, team, and custom fields. Metadata enables filtering and organization.'
    },
    {
      term: 'Source Type',
      definition: 'The origin of the insight: Dashboard (analytics platforms), Document (PDFs, presentations), API (programmatic data), or Manual (user-created).'
    },
    {
      term: 'Footnote / Citation',
      definition: 'The source reference for an insight, including document name, page numbers, date ranges, and methodology. Essential for traceability and validation.'
    },
    {
      term: 'Expiration Date',
      definition: 'The date when an insight may become outdated or stale. Set based on research type and context. Expired insights are flagged but remain accessible.'
    },
    {
      term: 'Sharing Level',
      definition: 'Access control setting that determines who can view and share an insight: Internal Comms Only, Controlled Audience Comms, or Public Comms.'
    },
    {
      term: 'Approval Status',
      definition: 'The current state of an insight: Pending (awaiting review), Approved (validated and published), Rejected (not approved), or Flagged (needs attention).'
    },
    {
      term: 'PR Approval',
      definition: 'Public Relations review and approval required for insights shared beyond immediate teams. Ensures messaging is appropriate and on-brand.'
    },
    {
      term: 'Legal Approval',
      definition: 'Legal department review required for public communications. Ensures compliance with regulations, privacy laws, and company policies.'
    },
    {
      term: 'Approval Documentation',
      definition: 'Official record of PR and Legal approvals, including who approved, when, and any conditions. Accessible via a link in the insight metadata.'
    },
    {
      term: 'Analysis Timeframe',
      definition: 'The start and end dates of the research period from which the insight was derived. Provides context about when data was collected.'
    },
    {
      term: 'Version History',
      definition: 'Complete record of all changes made to an insight over time. Includes version numbers, who made changes, when, and why.'
    },
    {
      term: 'Custom Fields',
      definition: 'User-defined metadata fields specific to team needs. Examples might include project name, campaign ID, or internal tracking codes.'
    },
    {
      term: 'My Library',
      definition: 'Your personal collection of saved insights. Provides quick access to insights relevant to your work without searching the full database.'
    },
    {
      term: 'Related Insights',
      definition: 'Other insights that share themes, topics, or context with the current insight. Helps discover connections across research findings.'
    },
    {
      term: 'AI Extraction',
      definition: 'The automated process of identifying and structuring insights from uploaded documents using natural language processing and machine learning.'
    },
    {
      term: 'Ingestion',
      definition: 'The process of uploading research documents or connecting data sources so insights can be extracted and added to the platform.'
    }
  ];

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Book className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">Help Center</h1>
              <p className="text-gray-600 mt-1">Everything you need to know about using Aetio</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto p-8 space-y-12">
        {/* Getting Started Section */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Getting Started</h2>
            <p className="text-gray-600">
              Follow these steps to start discovering insights from your research data
            </p>
          </div>

          <div className="space-y-6">
            {gettingStartedSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card key={index} className="p-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="bg-gray-100 text-gray-700">
                          Step {index + 1}
                        </Badge>
                        <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                      </div>
                      <p className="text-gray-700 mb-4">{step.description}</p>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <ol className="space-y-2">
                          {step.steps.map((substep, subindex) => (
                            <li key={subindex} className="flex gap-3 text-sm text-gray-700">
                              <span className="text-blue-600 font-medium">{subindex + 1}.</span>
                              <span>{substep}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        <Separator />

        {/* FAQ Section */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Frequently Asked Questions</h2>
            <p className="text-gray-600">
              Common questions about using Aetio and managing your research insights
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <Card key={index} className="overflow-hidden">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-base font-semibold text-gray-900">{faq.question}</h3>
                    {expandedFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    )}
                  </div>
                </button>
                {expandedFaq === index && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        {/* Glossary Section */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Glossary</h2>
            <p className="text-gray-600">
              Key terms and definitions used throughout Aetio
            </p>
          </div>

          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {glossaryTerms.map((item, index) => (
                <div key={index} className="space-y-2">
                  <h3 className="text-base font-semibold text-gray-900">{item.term}</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">{item.definition}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* Contact Support Section */}
        <section>
          <Card className="p-8 bg-blue-50 border-blue-200">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Still need help?</h2>
              <p className="text-gray-700 mb-4">
                Our support team is here to assist you with any questions or issues
              </p>
              <div className="flex items-center justify-center gap-4">
                <a
                  href="mailto:support@insighthub.com"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  support@insighthub.com
                </a>
                <span className="text-gray-400">•</span>
                <a
                  href="#"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Open a support ticket
                </a>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}