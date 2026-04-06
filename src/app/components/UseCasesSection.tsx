import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { User, Users, Building, Building2, ArrowRight } from "lucide-react";

const stages = [
  {
    icon: User,
    iconSize: "w-5 h-5",
    dotSize: "w-12 h-12",
    label: "Small Team",
    size: "2–5 people",
    title: "One Team, One Source of Truth",
    description:
      "Stop losing insights in spreadsheets and Slack threads. Aetio gives a small team a single, searchable home for every finding — so nothing falls through the cracks.",
    highlights: [
      "Centralize research from Excel, docs, and BI tools",
      "Quickly find past insights instead of re-doing work",
      "Lightweight setup with instant value",
    ],
  },
  {
    icon: Users,
    iconSize: "w-6 h-6",
    dotSize: "w-14 h-14",
    label: "Growing Team",
    size: "5–20 people",
    title: "Share Knowledge, Avoid Duplication",
    description:
      "As your team scales, insights multiply — and so does duplicated effort. Aetio surfaces existing research before new projects begin, so everyone builds on what's already known.",
    highlights: [
      "Prevent duplicate analyses across contributors",
      "AI-powered tagging keeps insights organized automatically",
      "Natural language search finds relevant work in seconds",
    ],
  },
  {
    icon: Building,
    iconSize: "w-7 h-7",
    dotSize: "w-16 h-16",
    label: "Multi-Team Org",
    size: "20–100 people",
    title: "Align Across Departments",
    description:
      "Product, data science, UX, and strategy teams all generate insights — but rarely share them. Aetio creates a cross-functional knowledge layer so every team benefits from every other's work.",
    highlights: [
      "Cross-functional insight discovery and sharing",
      "Approval workflows for aligned external messaging",
      "Relationship mapping reveals connected research",
    ],
  },
  {
    icon: Building2,
    iconSize: "w-8 h-8",
    dotSize: "w-[4.5rem] h-[4.5rem]",
    label: "Enterprise",
    size: "100+ people",
    title: "Institutional Intelligence at Scale",
    description:
      "At enterprise scale, knowledge is your competitive advantage. Aetio ensures insights are governed, auditable, and accessible — preserving institutional memory no matter how the organization evolves.",
    highlights: [
      "Role-based access, SSO, and compliance-ready security",
      "Full audit trail with version history and traceability",
      "Persistent knowledge base that outlasts any individual",
    ],
  },
];

export function UseCasesSection() {
  const progressRef = useRef(null);
  const isInView = useInView(progressRef, { once: true, margin: "-50px" });

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-aetio-blue-950 mb-4">
            Scale as You Grow
          </h2>
          <p className="text-xl text-aetio-blue-600 max-w-2xl mx-auto">
            From a single team to the entire enterprise — Aetio grows with you.
          </p>
        </motion.div>

        {/* Horizontal progress indicator */}
        <div ref={progressRef} className="mb-10 max-w-3xl mx-auto">
          {/* Progress bar */}
          <div className="relative h-1.5 bg-aetio-blue-100 rounded-full overflow-hidden mb-4">
            <motion.div
              initial={{ width: 0 }}
              animate={isInView ? { width: "100%" } : { width: 0 }}
              transition={{ duration: 2.5, ease: "easeOut", delay: 0.2 }}
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-aetio-blue-600 via-aetio-blue-400 to-emerald-400"
            />
          </div>

          {/* Stage dots on progress track */}
          <div className="relative flex justify-between items-start">
            {stages.map((stage, i) => (
              <motion.div
                key={stage.label}
                initial={{ opacity: 0, y: 8 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.4 + i * 0.35, duration: 0.4 }}
                className="flex flex-col items-center text-center"
              >
                <div
                  className={`rounded-full bg-white border-2 border-aetio-blue-400 flex items-center justify-center mb-2 transition-all shadow-sm ${
                    i === 0
                      ? "w-8 h-8"
                      : i === 1
                      ? "w-9 h-9"
                      : i === 2
                      ? "w-10 h-10"
                      : "w-11 h-11"
                  }`}
                >
                  <stage.icon
                    className={`text-aetio-blue-600 ${
                      i === 0
                        ? "w-3.5 h-3.5"
                        : i === 1
                        ? "w-4 h-4"
                        : i === 2
                        ? "w-4.5 h-4.5"
                        : "w-5 h-5"
                    }`}
                  />
                </div>
                <span className="text-[0.65rem] sm:text-xs font-semibold text-aetio-blue-700 uppercase tracking-wider">
                  {stage.label}
                </span>
                <span className="text-[0.6rem] sm:text-[0.65rem] text-aetio-blue-400 hidden sm:block">
                  {stage.size}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Growth journey cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {stages.map((stage, index) => (
            <motion.div
              key={stage.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="bg-aetio-blue-50 border border-aetio-blue-200 rounded-xl p-6 hover:border-aetio-blue-400/60 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-white border border-aetio-blue-300 flex items-center justify-center">
                  <stage.icon className="w-5 h-5 text-aetio-blue-600" />
                </div>
                <div>
                  <span className="text-xs font-semibold tracking-widest uppercase text-aetio-blue-600">
                    {stage.label}
                  </span>
                  <p className="text-xs text-aetio-blue-400">{stage.size}</p>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-aetio-blue-950 mb-3">
                {stage.title}
              </h3>
              <p className="text-aetio-blue-700 mb-5">{stage.description}</p>

              <ul className="space-y-2">
                {stage.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-aetio-blue-600">
                    <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
