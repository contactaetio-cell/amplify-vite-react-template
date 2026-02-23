import { motion } from "motion/react";

export function Logo({ className = "", variant = "full" }: { className?: string; variant?: "full" | "icon" }) {
  // Animation sequence: rotate 360deg, pause 1s, repeat
  const rotationVariants = {
    animate: {
      rotate: [0, 360],
      transition: {
        rotate: {
          duration: 4,
          ease: "easeInOut",
          repeat: Infinity,
          repeatDelay: 1,
        },
      },
    },
  };

  // Graph structure nodes - 3 arms radiating from center (120 degrees apart)
  // Each arm has nodes at different distances from center
  const centerNode = { cx: 20, cy: 20, r: 2 };
  
  // Define nodes in a fidget spinner pattern (3 symmetric arms)
  const nodes = [
    // Arm 1 (top - 0 degrees)
    { cx: 20, cy: 8, r: 1.5 },
    { cx: 20, cy: 4, r: 1.2 },
    
    // Arm 2 (bottom right - 120 degrees)
    { cx: 30.39, cy: 26, r: 1.5 },
    { cx: 33.86, cy: 29, r: 1.2 },
    
    // Arm 3 (bottom left - 240 degrees)
    { cx: 9.61, cy: 26, r: 1.5 },
    { cx: 6.14, cy: 29, r: 1.2 },
  ];

  // Define edges connecting nodes
  const edges = [
    // Arm 1 connections
    { x1: 20, y1: 20, x2: 20, y2: 8 },
    { x1: 20, y1: 8, x2: 20, y2: 4 },
    
    // Arm 2 connections
    { x1: 20, y1: 20, x2: 30.39, y2: 26 },
    { x1: 30.39, y1: 26, x2: 33.86, y2: 29 },
    
    // Arm 3 connections
    { x1: 20, y1: 20, x2: 9.61, y2: 26 },
    { x1: 9.61, y1: 26, x2: 6.14, y2: 29 },
    
    // Cross-connections for stability/structure
    { x1: 20, y1: 8, x2: 30.39, y2: 26 },
    { x1: 30.39, y1: 26, x2: 9.61, y2: 26 },
    { x1: 9.61, y1: 26, x2: 20, y2: 8 },
  ];

  const iconContent = (
    <motion.g
      variants={rotationVariants}
      animate="animate"
      style={{ transformOrigin: "20px 20px" }}
    >
      {/* Draw edges first (behind nodes) */}
      {edges.map((edge, i) => (
        <line
          key={`edge-${i}`}
          x1={edge.x1}
          y1={edge.y1}
          x2={edge.x2}
          y2={edge.y2}
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.6"
        />
      ))}
      
      {/* Draw nodes */}
      {nodes.map((node, i) => (
        <circle
          key={`node-${i}`}
          cx={node.cx}
          cy={node.cy}
          r={node.r}
          fill="currentColor"
        />
      ))}
      
      {/* Center node (largest) */}
      <circle
        cx={centerNode.cx}
        cy={centerNode.cy}
        r={centerNode.r}
        fill="currentColor"
      />
    </motion.g>
  );

  if (variant === "icon") {
    return (
      <svg
        className={className}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {iconContent}
      </svg>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {iconContent}
      </svg>
      <span className="text-xl font-semibold tracking-tight">Aetio</span>
    </div>
  );
}