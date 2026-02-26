import { motion } from "motion/react";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { Logo } from "../components/Logo";
import {
  ArrowRight,
  FileSpreadsheet,
  Search,
  Network,
  Tag,
  Shield,
  Link2,
  Users,
  BadgeCheck,
  User,
  Building,
  Building2,
} from "lucide-react";

export default function Product() {
  return (
    <div className="min-h-screen bg-white text-aetio-blue-950">
      <Navigation />

      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative py-24 px-6 bg-gradient-to-b from-aetio-blue-950 to-aetio-blue-900 overflow-hidden">
          {/* Background logo watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.06]">
            <Logo variant="icon" className="w-[28rem] h-[28rem] text-white" />
          </div>

          <div className="relative max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                The Complete Insight
                <br />
                <span className="text-aetio-blue-400">
                  Intelligence Platform
                </span>
              </h1>
              <p className="text-xl text-aetio-blue-200 max-w-3xl mx-auto">
                Centralize product research and analytics insights so teams can
                find, trust, and act on data faster — from Excel and BI tools to
                research platforms, all in one place.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Video Section */}
        <section className="py-24 px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-aetio-blue-950 mb-8 text-center">
                See Aetio in Action
              </h2>
              <div className="aspect-video bg-aetio-blue-100 rounded-lg border-2 border-aetio-blue-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-aetio-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-10 h-10 text-white ml-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <p className="text-aetio-blue-800 font-semibold">
                    Platform Demo Video
                  </p>
                  <p className="text-sm text-aetio-blue-600 mt-2">
                    Video placeholder - Coming soon
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 px-6 bg-aetio-blue-950">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                How Aetio Works
              </h2>
              <p className="text-xl text-aetio-blue-200">
                Three powerful steps to transform your research workflow
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-12">
              {[
                {
                  step: "01",
                  title: "Universal Data Ingestion",
                  description:
                    "Import from Excel, BI tools like Tableau and Power BI, and research platforms. Aetio pulls insights from wherever they live — no manual uploads required.",
                  icon: FileSpreadsheet,
                  features: [
                    "Excel, CSV, and spreadsheet import",
                    "Tableau, Power BI, and Looker connectors",
                    "Research platform integrations",
                    "Automatic sync and updates",
                  ],
                },
                {
                  step: "02",
                  title: "Intelligent Organization",
                  description:
                    "AI extracts, structures, and tags insights with metadata — authors, dates, sources, and topics — creating a fully auditable knowledge graph.",
                  icon: Network,
                  features: [
                    "AI-powered metadata extraction",
                    "Automatic tagging and categorization",
                    "Relationship mapping between insights",
                    "Full version history and traceability",
                  ],
                },
                {
                  step: "03",
                  title: "Instant Discovery",
                  description:
                    "Search using natural language to find exactly what you need in seconds. Filter by team, date, topic, or any custom metadata.",
                  icon: Search,
                  features: [
                    "Natural language semantic search",
                    "Advanced filtering options",
                    "Related insights suggestions",
                    "Export and share findings",
                  ],
                },
              ].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="relative"
                >
                  <div className="text-6xl font-bold text-aetio-blue-800/30 mb-4">
                    {step.step}
                  </div>
                  <div className="w-12 h-12 bg-aetio-blue-600/20 rounded-lg flex items-center justify-center mb-4">
                    <step.icon className="w-6 h-6 text-aetio-blue-300" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-aetio-blue-200 mb-6">
                    {step.description}
                  </p>
                  <ul className="space-y-2">
                    {step.features.map((feature, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-aetio-blue-300"
                      >
                        <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Key Features Deep Dive */}
        <section className="py-24 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-aetio-blue-950 mb-4">
                AI-Powered Insights
              </h2>
              <p className="text-lg text-aetio-blue-700 max-w-2xl mx-auto">
                Enterprise-grade capabilities that transform how your
                organization manages knowledge.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  icon: FileSpreadsheet,
                  title: "Universal Data Ingestion",
                  description:
                    "Import from Excel, BI tools like Tableau and Power BI, and research platforms — all into one unified layer. Native connectors keep everything in sync without manual uploads or data entry.",
                },
                {
                  icon: Search,
                  title: "AI-Powered Semantic Search",
                  description:
                    "Go beyond keyword matching. Semantic search understands context, synonyms, and relationships. Ask questions in natural language and get relevant insights instantly — even if the exact words don't match.",
                },
                {
                  icon: Tag,
                  title: "Metadata Tagging & Auditability",
                  description:
                    "Every insight is enriched with comprehensive metadata — author, creation date, source system, project tags, and custom fields. Full version history and change tracking for complete traceability.",
                },
                {
                  icon: Users,
                  title: "Cross-Team Insight Sharing",
                  description:
                    "Break down silos with unified access to research across all departments. Surface cross-functional insights for strategic planning and ensure teams work from the same knowledge base.",
                },
                {
                  icon: BadgeCheck,
                  title: "Approval Workflows",
                  description:
                    "Establish a single, canonical source of truth for every insight with built-in PR and legal approval workflows. Eliminate contradictory communications and ensure every message is aligned.",
                },
                {
                  icon: Link2,
                  title: "Research Traceability",
                  description:
                    "Automatically discover connections between related insights. Trace every finding back to original sources, methods, and raw data. Visualize institutional knowledge as an interconnected graph.",
                },
                {
                  icon: Network,
                  title: "Insight Relationships",
                  description:
                    "See which research builds on prior work, find contradictions, and identify knowledge gaps. Build compounding knowledge by surfacing existing work before new projects start.",
                },
                {
                  icon: Shield,
                  title: "Enterprise Security & Access Controls",
                  description:
                    "Role-based permissions, SSO integration, data encryption at rest and in transit, and compliance-ready infrastructure ensure sensitive research stays protected while remaining accessible.",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-aetio-blue-50 border border-aetio-blue-200 rounded-lg p-8 hover:border-aetio-blue-300 transition-colors"
                >
                  <div className="w-12 h-12 bg-aetio-blue-600/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-aetio-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-aetio-blue-950 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-aetio-blue-800">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases Deep Dive */}
        <section className="py-24 px-6 bg-aetio-blue-950">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Scales as You Grow
              </h2>
              <p className="text-xl text-aetio-blue-200 max-w-2xl mx-auto">
                From a single team to the entire enterprise — Aetio grows with
                you at every stage.
              </p>
            </motion.div>

            <div className="space-y-12">
              {[
                {
                  icon: User,
                  label: "Small Team",
                  size: "2–5 people",
                  role: "One Team, One Source of Truth",
                  challenge:
                    "Insights are scattered across spreadsheets, Slack threads, and personal drives. Important findings get lost, and the same questions are researched over and over.",
                  solution:
                    "A single, searchable home for every finding. Centralize research from Excel, docs, and BI tools with lightweight setup and instant value — nothing falls through the cracks.",
                },
                {
                  icon: Users,
                  label: "Growing Team",
                  size: "5–20 people",
                  role: "Share Knowledge, Avoid Duplication",
                  challenge:
                    "Multiple contributors generate insights independently. No one knows what's already been researched, leading to duplicated effort and wasted resources.",
                  solution:
                    "Surface existing research before new projects begin. AI-powered tagging keeps insights organized automatically, and natural language search finds relevant work in seconds.",
                },
                {
                  icon: Building,
                  label: "Multi-Team Org",
                  size: "20–100 people",
                  role: "Align Across Departments",
                  challenge:
                    "Product, data science, UX, and strategy teams all generate insights but rarely share them — leading to misaligned initiatives and contradictory external communications.",
                  solution:
                    "A cross-functional knowledge layer so every team benefits from every other's work. Approval workflows ensure aligned messaging, and relationship mapping reveals connected research.",
                },
                {
                  icon: Building2,
                  label: "Enterprise",
                  size: "100+ people",
                  role: "Institutional Intelligence at Scale",
                  challenge:
                    "Knowledge walks out the door with every departing team member. No central governance over who can access, edit, or approve insights — and no audit trail.",
                  solution:
                    "Full governance with role-based access, SSO, and compliance-ready security. Complete audit trails with version history ensure institutional memory persists beyond any individual.",
                },
              ].map((useCase, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="bg-aetio-blue-900/50 border border-aetio-blue-800 rounded-lg p-8"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-aetio-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <useCase.icon className="w-5 h-5 text-aetio-blue-300" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">
                        {useCase.role}
                      </h3>
                      <span className="text-xs text-aetio-blue-400 font-semibold tracking-widest uppercase">
                        {useCase.label} · {useCase.size}
                      </span>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-aetio-blue-300 mb-2 uppercase tracking-wide">
                        Challenge
                      </p>
                      <p className="text-aetio-blue-100">
                        {useCase.challenge}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-aetio-blue-300 mb-2 uppercase tracking-wide">
                        Aetio Solution
                      </p>
                      <p className="text-aetio-blue-100">
                        {useCase.solution}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-6 bg-gradient-to-b from-white to-aetio-blue-50 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-aetio-blue-600 rounded-full blur-[120px]" />
          </div>

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-5xl md:text-6xl font-bold text-aetio-blue-950 mb-6">
                Make Every Insight Count.
              </h2>
              <p className="text-xl text-aetio-blue-800 mb-10 max-w-2xl mx-auto">
                Transform how your organization discovers, shares, and leverages
                research intelligence.
              </p>

              <motion.a
                href="mailto:contactaetio@gmail.com?subject=Schedule%20Demo&body=Hi%2C%20I%27d%20like%20to%20schedule%20a%20demo%20of%20Aetio."
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-10 py-5 bg-aetio-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-aetio-blue-700 transition-colors shadow-2xl shadow-aetio-blue-600/30"
              >
                Schedule a Demo
                <ArrowRight className="w-5 h-5" />
              </motion.a>

              <p className="text-sm text-aetio-blue-600 mt-6">
                Join leading enterprises making insights accessible to every
                team.
              </p>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}