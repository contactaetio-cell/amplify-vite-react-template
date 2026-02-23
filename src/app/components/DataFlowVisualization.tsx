import { motion } from "motion/react";

interface DataFlowVisualizationProps {
  type: "ingestion" | "repository" | "discovery";
}

export function DataFlowVisualization({ type }: DataFlowVisualizationProps) {
  if (type === "ingestion") {
    return (
      <div className="relative w-full h-48 bg-aetio-blue-800 rounded-lg overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid-ing" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-ing)" />
          </svg>
        </div>

        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200">
          {/* Source icons - Excel/Spreadsheet */}
          <motion.g
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <rect x="30" y="22" width="36" height="44" rx="3" fill="none" stroke="white" strokeWidth="1.5" opacity="0.85" />
            <line x1="36" y1="33" x2="60" y2="33" stroke="white" strokeWidth="0.8" opacity="0.5" />
            <line x1="36" y1="40" x2="60" y2="40" stroke="white" strokeWidth="0.8" opacity="0.5" />
            <line x1="36" y1="47" x2="54" y2="47" stroke="white" strokeWidth="0.8" opacity="0.5" />
            <line x1="36" y1="54" x2="58" y2="54" stroke="white" strokeWidth="0.8" opacity="0.5" />
            {/* Grid lines for spreadsheet */}
            <line x1="46" y1="30" x2="46" y2="58" stroke="white" strokeWidth="0.5" opacity="0.3" />
          </motion.g>

          {/* Source icons - Chart/BI tool */}
          <motion.g
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <rect x="112" y="22" width="36" height="44" rx="3" fill="none" stroke="white" strokeWidth="1.5" opacity="0.85" />
            {/* Bar chart inside */}
            <rect x="119" y="46" width="6" height="14" rx="1" fill="white" opacity="0.5" />
            <rect x="127" y="38" width="6" height="22" rx="1" fill="white" opacity="0.5" />
            <rect x="135" y="42" width="6" height="18" rx="1" fill="white" opacity="0.5" />
          </motion.g>

          {/* Source icons - Database/Research */}
          <motion.g
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <rect x="194" y="22" width="36" height="44" rx="3" fill="none" stroke="white" strokeWidth="1.5" opacity="0.85" />
            {/* Database cylinder */}
            <ellipse cx="212" cy="38" rx="10" ry="4" fill="none" stroke="white" strokeWidth="1" opacity="0.6" />
            <line x1="202" y1="38" x2="202" y2="54" stroke="white" strokeWidth="1" opacity="0.6" />
            <line x1="222" y1="38" x2="222" y2="54" stroke="white" strokeWidth="1" opacity="0.6" />
            <ellipse cx="212" cy="54" rx="10" ry="4" fill="none" stroke="white" strokeWidth="1" opacity="0.6" />
          </motion.g>

          {/* Animated flow lines from sources to central funnel */}
          {[
            { sx: 48, sy: 66, label: 0 },
            { sx: 130, sy: 66, label: 1 },
            { sx: 212, sy: 66, label: 2 },
          ].map((src, i) => (
            <g key={i}>
              <motion.path
                d={`M ${src.sx} ${src.sy} C ${src.sx} 100, 290 100, 290 130`}
                stroke="white"
                strokeWidth="1.5"
                fill="none"
                opacity="0.3"
                strokeDasharray="4 4"
              />
              {/* Animated dot traveling along path */}
              <motion.circle
                r="3"
                fill="white"
                cx={src.sx}
                cy={src.sy}
                animate={{
                  cx: [src.sx, (src.sx + 290) / 2, 290],
                  cy: [src.sy, 100, 130],
                  opacity: [0, 0.9, 0.9, 0],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.4,
                  repeat: Infinity,
                  repeatDelay: 1,
                  ease: "easeInOut",
                }}
              />
            </g>
          ))}

          {/* Central unified funnel/destination */}
          <motion.g
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {/* Funnel shape */}
            <motion.path
              d="M 265 120 L 315 120 L 305 145 L 275 145 Z"
              fill="white"
              opacity="0.12"
              stroke="white"
              strokeWidth="1.5"
              strokeOpacity="0.7"
            />
            {/* Unified output box */}
            <rect x="270" y="150" width="40" height="28" rx="4" fill="white" opacity="0.1" stroke="white" strokeWidth="1.5" strokeOpacity="0.7" />
            <line x1="278" y1="159" x2="302" y2="159" stroke="white" strokeWidth="1" opacity="0.5" />
            <line x1="278" y1="166" x2="298" y2="166" stroke="white" strokeWidth="1" opacity="0.5" />

            {/* Pulse effect on the destination */}
            <motion.rect
              x="270"
              y="150"
              width="40"
              height="28"
              rx="4"
              fill="none"
              stroke="white"
              strokeWidth="1"
              animate={{ opacity: [0, 0.5, 0], scale: [1, 1.08, 1.15] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              style={{ transformOrigin: "290px 164px" }}
            />
          </motion.g>

          {/* Label */}
          <text x="290" y="193" textAnchor="middle" fill="white" opacity="0.45" fontSize="9" fontFamily="sans-serif">
            Unified Layer
          </text>
        </svg>
      </div>
    );
  }

  if (type === "repository") {
    return (
      <div className="relative w-full h-48 bg-aetio-blue-800 rounded-lg overflow-hidden">
        {/* Subtle hex pattern background */}
        <div className="absolute inset-0 opacity-[0.06]">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="hex-repo" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="12" cy="12" r="1" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hex-repo)" />
          </svg>
        </div>

        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200">
          {/* Central vault/repository */}
          <motion.g
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
          >
            {/* Main repository box */}
            <rect x="150" y="55" width="100" height="90" rx="8" fill="white" opacity="0.08" stroke="white" strokeWidth="1.5" strokeOpacity="0.6" />

            {/* Header bar */}
            <rect x="150" y="55" width="100" height="22" rx="8" fill="white" opacity="0.12" />
            <rect x="150" y="68" width="100" height="9" fill="white" opacity="0.12" />

            {/* Database icon in header */}
            <circle cx="165" cy="66" r="5" fill="none" stroke="white" strokeWidth="1" opacity="0.7" />
            <line x1="162" y1="66" x2="168" y2="66" stroke="white" strokeWidth="0.8" opacity="0.7" />

            {/* Insight rows with tags */}
            {[0, 1, 2, 3].map((i) => (
              <motion.g
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + i * 0.15 }}
              >
                {/* Row line */}
                <line
                  x1="160"
                  y1={90 + i * 14}
                  x2="216"
                  y2={90 + i * 14}
                  stroke="white"
                  strokeWidth="1.5"
                  opacity="0.35"
                />
                {/* Tag badge */}
                <rect
                  x="220"
                  y={84 + i * 14}
                  width="20"
                  height="10"
                  rx="5"
                  fill="white"
                  opacity={0.15 + i * 0.05}
                  stroke="white"
                  strokeWidth="0.5"
                  strokeOpacity="0.4"
                />
              </motion.g>
            ))}
          </motion.g>

          {/* Metadata tags floating around */}
          {[
            { x: 60, y: 45, label: "v2.1", w: 30 },
            { x: 60, y: 105, label: "Q4", w: 22 },
            { x: 310, y: 55, label: "PMR", w: 28 },
            { x: 300, y: 115, label: "UXR", w: 28 },
            { x: 75, y: 150, label: "2026", w: 30 },
            { x: 295, y: 165, label: "Tier-1", w: 34 },
          ].map((tag, i) => (
            <g key={i}>
              {/* Connecting line to repository */}
              <motion.line
                x1={tag.x + tag.w / 2}
                y1={tag.y + 6}
                x2={tag.x < 200 ? 150 : 250}
                y2={100}
                stroke="white"
                strokeWidth="0.8"
                strokeDasharray="3 3"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.25, 0.25, 0] }}
                transition={{
                  duration: 3,
                  delay: i * 0.4,
                  repeat: Infinity,
                  repeatDelay: 1.5,
                }}
              />
              {/* Tag pill */}
              <motion.g
                animate={{
                  y: [0, -3, 0],
                  opacity: [0.6, 0.9, 0.6],
                }}
                transition={{
                  duration: 3,
                  delay: i * 0.3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <rect
                  x={tag.x}
                  y={tag.y}
                  width={tag.w}
                  height="14"
                  rx="7"
                  fill="white"
                  opacity="0.12"
                  stroke="white"
                  strokeWidth="1"
                  strokeOpacity="0.5"
                />
                <text
                  x={tag.x + tag.w / 2}
                  y={tag.y + 10}
                  textAnchor="middle"
                  fill="white"
                  opacity="0.65"
                  fontSize="7"
                  fontFamily="sans-serif"
                >
                  {tag.label}
                </text>
              </motion.g>
            </g>
          ))}

          {/* Audit trail indicator */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            {/* Checkmark / audit icon bottom center */}
            <motion.circle
              cx="200"
              cy="165"
              r="10"
              fill="white"
              opacity="0.1"
              stroke="white"
              strokeWidth="1"
              strokeOpacity="0.5"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
            <motion.path
              d="M 195 165 L 198 168 L 206 160"
              stroke="white"
              strokeWidth="1.5"
              fill="none"
              opacity="0.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.g>
        </svg>
      </div>
    );
  }

  // discovery
  return (
    <div className="relative w-full h-48 bg-aetio-blue-800 rounded-lg overflow-hidden">
      {/* Subtle radial glow */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-48 h-48 bg-white/[0.03] rounded-full blur-3xl" />
      </div>

      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200">
        {/* Search bar */}
        <motion.g
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <rect
            x="60"
            y="24"
            width="280"
            height="36"
            rx="18"
            fill="white"
            opacity="0.08"
            stroke="white"
            strokeWidth="1.5"
            strokeOpacity="0.5"
          />
          {/* Magnifying glass icon */}
          <circle cx="84" cy="42" r="7" stroke="white" strokeWidth="1.5" fill="none" opacity="0.7" />
          <line x1="89" y1="47" x2="94" y2="52" stroke="white" strokeWidth="1.5" opacity="0.7" strokeLinecap="round" />

          {/* Typing animation */}
          <motion.g
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 1 }}
          >
            <text x="102" y="46" fill="white" opacity="0.55" fontSize="11" fontFamily="sans-serif">
              user onboarding friction...
            </text>
            {/* Blinking cursor */}
            <motion.line
              x1="222"
              y1="35"
              x2="222"
              y2="50"
              stroke="white"
              strokeWidth="1.5"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          </motion.g>
        </motion.g>

        {/* Search results appearing */}
        {[
          { title: "Onboarding UX Study — Q3 Report", relevance: 0.95 },
          { title: "Friction Points Analysis — Mobile App", relevance: 0.82 },
          { title: "User Drop-off Funnel — Signup Flow", relevance: 0.71 },
        ].map((result, i) => (
          <motion.g
            key={i}
            initial={{ opacity: 0, x: -15, y: 5 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{
              duration: 0.5,
              delay: 1.2 + i * 0.25,
              repeat: Infinity,
              repeatDelay: 3,
              repeatType: "loop",
            }}
          >
            {/* Result card */}
            <rect
              x="70"
              y={74 + i * 38}
              width="260"
              height="30"
              rx="5"
              fill="white"
              opacity={0.06 + (2 - i) * 0.02}
              stroke="white"
              strokeWidth="1"
              strokeOpacity={0.3 - i * 0.05}
            />
            {/* Document icon */}
            <rect
              x="78"
              y={79 + i * 38}
              width="14"
              height="18"
              rx="2"
              fill="none"
              stroke="white"
              strokeWidth="0.8"
              opacity="0.5"
            />
            <line
              x1="81"
              y1={84 + i * 38}
              x2="89"
              y2={84 + i * 38}
              stroke="white"
              strokeWidth="0.6"
              opacity="0.4"
            />
            <line
              x1="81"
              y1={88 + i * 38}
              x2="88"
              y2={88 + i * 38}
              stroke="white"
              strokeWidth="0.6"
              opacity="0.4"
            />
            <line
              x1="81"
              y1={92 + i * 38}
              x2="86"
              y2={92 + i * 38}
              stroke="white"
              strokeWidth="0.6"
              opacity="0.4"
            />
            {/* Result title text */}
            <text
              x="98"
              y={92 + i * 38}
              fill="white"
              opacity={0.65 - i * 0.1}
              fontSize="9"
              fontFamily="sans-serif"
            >
              {result.title}
            </text>
            {/* Relevance score badge */}
            <rect
              x="290"
              y={80 + i * 38}
              width="30"
              height="16"
              rx="8"
              fill="white"
              opacity={0.12 - i * 0.02}
              stroke="white"
              strokeWidth="0.8"
              strokeOpacity={0.4 - i * 0.05}
            />
            <text
              x="305"
              y={91 + i * 38}
              textAnchor="middle"
              fill="white"
              opacity={0.6 - i * 0.1}
              fontSize="7"
              fontFamily="sans-serif"
            >
              {Math.round(result.relevance * 100)}%
            </text>
          </motion.g>
        ))}

        {/* AI sparkle indicator near search */}
        <motion.g
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0.8, 1.1, 0.8],
          }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.8 }}
          style={{ transformOrigin: "345px 42px" }}
        >
          {/* Sparkle / star */}
          <path
            d="M 345 35 L 346.5 39.5 L 351 42 L 346.5 44.5 L 345 49 L 343.5 44.5 L 339 42 L 343.5 39.5 Z"
            fill="white"
            opacity="0.7"
          />
        </motion.g>
      </svg>
    </div>
  );
}