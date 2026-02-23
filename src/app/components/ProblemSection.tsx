import { motion } from "motion/react";
import {
  AlertCircle,
  Copy,
  Clock,
  Archive,
  Search,
  Layers,
  Zap,
  Shield,
  ArrowRight,
  MessageSquareWarning,
  BadgeCheck,
} from "lucide-react";

const comparisons = [
  {
    before: {
      icon: AlertCircle,
      title: "Fragmented Research",
      description:
        "Outputs scattered across tools, teams, and drives — no single source of truth.",
    },
    after: {
      icon: Search,
      title: "Unified Discovery",
      description:
        "Every insight lives in one searchable, connected knowledge layer across the org.",
    },
  },
  {
    before: {
      icon: Copy,
      title: "Duplicate Analyses",
      description:
        "Teams unknowingly repeat work, wasting resources on redundant insights.",
    },
    after: {
      icon: Layers,
      title: "Compounding Knowledge",
      description:
        "Surface existing work before new projects start — build on what's already proven.",
    },
  },
  {
    before: {
      icon: Clock,
      title: "Slow Decision-Making",
      description:
        "Critical insights remain buried, delaying the data-driven decisions that matter.",
    },
    after: {
      icon: Zap,
      title: "Instant Access",
      description:
        "Find the right insight in seconds, not days — and act with confidence.",
    },
  },
  {
    before: {
      icon: Archive,
      title: "Lost Institutional Memory",
      description:
        "Knowledge walks out the door with every departing team member.",
    },
    after: {
      icon: Shield,
      title: "Persistent, Auditable History",
      description:
        "Institutional knowledge is captured, versioned, and always accessible.",
    },
  },
  {
    before: {
      icon: MessageSquareWarning,
      title: "Contradictory Communications",
      description:
        "Different teams circulate conflicting narratives from the same data — eroding trust and alignment.",
    },
    after: {
      icon: BadgeCheck,
      title: "One Approved Source of Truth",
      description:
        "A single, canonical insight with built-in PR and legal approval workflows — so every message is aligned.",
    },
  },
];

export function ProblemSection() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-aetio-blue-950 mb-4">
            From Scattered to Structured
          </h2>
          <p className="text-lg text-aetio-blue-700 max-w-2xl mx-auto">
            See how Aetio transforms the way your organization discovers, trusts,
            and acts on insights.
          </p>
        </motion.div>

        {/* Column headers */}
        <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-0 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-2"
          >
            <span className="inline-block w-3 h-3 rounded-full bg-aetio-blue-200" />
            <span className="text-sm font-semibold tracking-widest uppercase text-aetio-blue-400">
              Without Aetio
            </span>
          </motion.div>

          {/* Spacer for arrow column */}
          <div className="hidden md:block w-16" />

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-2"
          >
            <span className="inline-block w-3 h-3 rounded-full bg-aetio-blue-600" />
            <span className="text-sm font-semibold tracking-widest uppercase text-aetio-blue-800">
              With Aetio
            </span>
          </motion.div>
        </div>

        {/* Comparison rows */}
        <div className="flex flex-col gap-6">
          {comparisons.map((item, index) => {
            const BeforeIcon = item.before.icon;
            const AfterIcon = item.after.icon;

            return (
              <motion.div
                key={item.before.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="grid md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-0 items-stretch"
              >
                {/* Before card */}
                <div className="relative rounded-xl border border-aetio-blue-100 bg-aetio-blue-50/60 p-6 md:p-8 flex gap-4 items-start">
                  <div className="shrink-0 mt-0.5 flex items-center justify-center w-10 h-10 rounded-lg bg-aetio-blue-100">
                    <BeforeIcon className="w-5 h-5 text-aetio-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-aetio-blue-400 mb-1">
                      {item.before.title}
                    </h3>
                    <p className="text-aetio-blue-500 text-[0.95rem] leading-relaxed">
                      {item.before.description}
                    </p>
                  </div>
                </div>

                {/* Arrow connector */}
                <div className="flex items-center justify-center md:w-16">
                  <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-aetio-blue-950 shadow-lg shadow-aetio-blue-950/20">
                    <ArrowRight className="w-5 h-5 text-aetio-blue-300" />
                  </div>
                  <div className="flex md:hidden items-center justify-center w-8 h-8 rounded-full bg-aetio-blue-950">
                    <ArrowRight className="w-4 h-4 text-aetio-blue-300 rotate-90" />
                  </div>
                </div>

                {/* After card */}
                <div className="relative rounded-xl border border-aetio-blue-700/30 bg-gradient-to-br from-aetio-blue-950 to-aetio-blue-900 p-6 md:p-8 flex gap-4 items-start shadow-lg shadow-aetio-blue-950/10">
                  <div className="shrink-0 mt-0.5 flex items-center justify-center w-10 h-10 rounded-lg bg-aetio-blue-800">
                    <AfterIcon className="w-5 h-5 text-aetio-blue-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {item.after.title}
                    </h3>
                    <p className="text-aetio-blue-200 text-[0.95rem] leading-relaxed">
                      {item.after.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}