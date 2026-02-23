import { motion } from "motion/react";
import { useEffect, useState } from "react";

export function NetworkVisualization() {
  const [nodes] = useState(() => 
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
    }))
  );

  const connections = [
    [0, 1], [1, 2], [2, 3], [3, 4],
    [0, 5], [5, 6], [6, 7],
    [4, 8], [8, 9], [9, 10], [10, 11],
    [1, 6], [3, 9]
  ];

  return (
    <div className="relative w-full h-full">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        {/* Connections */}
        <g opacity="0.15">
          {connections.map(([from, to], i) => (
            <motion.line
              key={`line-${i}`}
              x1={nodes[from].x}
              y1={nodes[from].y}
              x2={nodes[to].x}
              y2={nodes[to].y}
              stroke="currentColor"
              strokeWidth="0.3"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.3 }}
              transition={{
                duration: 2,
                delay: i * 0.1,
                repeat: Infinity,
                repeatType: "reverse",
                repeatDelay: 1,
              }}
            />
          ))}
        </g>
        
        {/* Nodes */}
        <g>
          {nodes.map((node) => (
            <motion.circle
              key={`node-${node.id}`}
              cx={node.x}
              cy={node.y}
              r="0.8"
              fill="currentColor"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
              transition={{
                duration: 3,
                delay: node.delay,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
