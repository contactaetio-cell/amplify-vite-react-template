import { motion } from "motion/react";
import { DataFlowVisualization } from "./DataFlowVisualization";
import {
  Search,
  Tag,
  Users,
  Link2,
  Shield,
  FileSpreadsheet,
  BadgeCheck,
  Database,
  Zap,
} from "lucide-react";

const platformPillars = [
  {
    title: "Universal Data Ingestion",
    description:
      "Import from Excel, BI tools like Tableau and Power BI, and research platforms — all into one unified layer.",
    type: "ingestion" as const,
    capabilities: [
      {
        icon: FileSpreadsheet,
        title: "Multi-Source Integration",
        description:
          "Seamlessly connect Excel files, BI tools (Tableau, Power BI), research platforms, and proprietary databases.",
      },
      {
        icon: Shield,
        title: "Enterprise Security & Access Controls",
        description:
          "Role-based permissions, SSO integration, and compliance-ready infrastructure ensure secure data import.",
      },
      {
        icon: Database,
        title: "Automated Data Normalization",
        description:
          "Automatically standardize and structure data from disparate sources into a unified format.",
      },
    ],
  },
  {
    title: "Centralized Insight Repository",
    description:
      "Structured, tagged, auditable database of all product and user insights — always in sync.",
    type: "repository" as const,
    capabilities: [
      {
        icon: Tag,
        title: "Metadata Tagging & Auditability",
        description:
          "Complete traceability with timestamps, authors, sources, and version history for every insight.",
      },
      {
        icon: Link2,
        title: "Research Traceability",
        description:
          "Trace insights back to original sources, methods, and raw data with full lineage tracking.",
      },
      {
        icon: BadgeCheck,
        title: "Approval Workflows",
        description:
          "Built-in PR and legal approval workflows ensure every published insight is aligned and canonical.",
      },
    ],
  },
  {
    title: "Instant Discovery Interface",
    description:
      "Natural-language search and filters to find relevant research in seconds, not hours.",
    type: "discovery" as const,
    capabilities: [
      {
        icon: Search,
        title: "AI-Powered Semantic Search",
        description:
          "Find insights using natural language queries that understand context, intent, and relationships.",
      },
      {
        icon: Users,
        title: "Cross-Team Insight Sharing",
        description:
          "Break down silos with unified access to research across all departments and stakeholders.",
      },
      {
        icon: Zap,
        title: "Intelligent Recommendations",
        description:
          "AI surfaces related insights and suggests connections you might have missed.",
      },
    ],
  },
];

export function PlatformSection() {
  return (
    <section className="py-24 px-6 bg-aetio-blue-950">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            The Aetio Platform
          </h2>
          <p className="text-xl text-aetio-blue-200 max-w-2xl mx-auto">
            Turn scattered research into accessible, actionable organizational
            knowledge — powered by AI.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {platformPillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="bg-aetio-blue-900/50 border border-aetio-blue-800 rounded-lg overflow-hidden"
            >
              {/* Main Pillar Card */}
              <div className="p-6 border-b border-aetio-blue-800/50">
                <DataFlowVisualization type={pillar.type} />
                <h3 className="text-xl font-semibold text-white mt-6 mb-3">
                  {pillar.title}
                </h3>
                <p className="text-slate-400">{pillar.description}</p>
              </div>

              {/* Capabilities beneath */}
              <div className="p-6 space-y-6">
                {pillar.capabilities.map((capability, capIndex) => (
                  <motion.div
                    key={capability.title}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.15 + capIndex * 0.1,
                    }}
                    className="flex gap-3"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-aetio-blue-800/50 rounded-lg flex items-center justify-center">
                      <capability.icon className="w-5 h-5 text-aetio-blue-300" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium mb-1">
                        {capability.title}
                      </h4>
                      <p className="text-sm text-slate-400">
                        {capability.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}