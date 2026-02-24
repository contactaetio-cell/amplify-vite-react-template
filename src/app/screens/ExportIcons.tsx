import { useEffect, useRef, useCallback } from "react";
import { Link } from "react-router";

// Static SVG markup for the Aetio icon at rest (0 degrees rotation, no animation)
const ICON_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none">
  <g>
    <!-- Edges -->
    <line x1="20" y1="20" x2="20" y2="8" stroke="white" stroke-width="1" opacity="0.6"/>
    <line x1="20" y1="8" x2="20" y2="4" stroke="white" stroke-width="1" opacity="0.6"/>
    <line x1="20" y1="20" x2="30.39" y2="26" stroke="white" stroke-width="1" opacity="0.6"/>
    <line x1="30.39" y1="26" x2="33.86" y2="29" stroke="white" stroke-width="1" opacity="0.6"/>
    <line x1="20" y1="20" x2="9.61" y2="26" stroke="white" stroke-width="1" opacity="0.6"/>
    <line x1="9.61" y1="26" x2="6.14" y2="29" stroke="white" stroke-width="1" opacity="0.6"/>
    <line x1="20" y1="8" x2="30.39" y2="26" stroke="white" stroke-width="1" opacity="0.6"/>
    <line x1="30.39" y1="26" x2="9.61" y2="26" stroke="white" stroke-width="1" opacity="0.6"/>
    <line x1="9.61" y1="26" x2="20" y2="8" stroke="white" stroke-width="1" opacity="0.6"/>
    <!-- Nodes -->
    <circle cx="20" cy="8" r="1.5" fill="white"/>
    <circle cx="20" cy="4" r="1.2" fill="white"/>
    <circle cx="30.39" cy="26" r="1.5" fill="white"/>
    <circle cx="33.86" cy="29" r="1.2" fill="white"/>
    <circle cx="9.61" cy="26" r="1.5" fill="white"/>
    <circle cx="6.14" cy="29" r="1.2" fill="white"/>
    <!-- Center node -->
    <circle cx="20" cy="20" r="2" fill="white"/>
  </g>
</svg>
`;

const RESOLUTIONS = [
  { label: "Low", size: 64, filename: "aetio-icon-64.png" },
  { label: "Medium", size: 256, filename: "aetio-icon-256.png" },
  { label: "High", size: 1024, filename: "aetio-icon-1024.png" },
];

// Circular badge SVG — icon fills most of the circle with minimal padding
const CIRCULAR_BADGE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="512" height="512">
  <defs>
    <clipPath id="circle-clip">
      <circle cx="20" cy="20" r="19"/>
    </clipPath>
  </defs>
  <!-- Circular background -->
  <circle cx="20" cy="20" r="19" fill="#0a1628"/>
  <!-- Subtle border ring -->
  <circle cx="20" cy="20" r="19" fill="none" stroke="#1a2d4a" stroke-width="0.5"/>
  <!-- Icon graph structure clipped to circle -->
  <g clip-path="url(#circle-clip)">
    <!-- Edges -->
    <line x1="20" y1="20" x2="20" y2="8" stroke="white" stroke-width="1" opacity="0.6"/>
    <line x1="20" y1="8" x2="20" y2="4" stroke="white" stroke-width="1" opacity="0.6"/>
    <line x1="20" y1="20" x2="30.39" y2="26" stroke="white" stroke-width="1" opacity="0.6"/>
    <line x1="30.39" y1="26" x2="33.86" y2="29" stroke="white" stroke-width="1" opacity="0.6"/>
    <line x1="20" y1="20" x2="9.61" y2="26" stroke="white" stroke-width="1" opacity="0.6"/>
    <line x1="9.61" y1="26" x2="6.14" y2="29" stroke="white" stroke-width="1" opacity="0.6"/>
    <line x1="20" y1="8" x2="30.39" y2="26" stroke="white" stroke-width="1" opacity="0.6"/>
    <line x1="30.39" y1="26" x2="9.61" y2="26" stroke="white" stroke-width="1" opacity="0.6"/>
    <line x1="9.61" y1="26" x2="20" y2="8" stroke="white" stroke-width="1" opacity="0.6"/>
    <!-- Nodes -->
    <circle cx="20" cy="8" r="1.5" fill="white"/>
    <circle cx="20" cy="4" r="1.2" fill="white"/>
    <circle cx="30.39" cy="26" r="1.5" fill="white"/>
    <circle cx="33.86" cy="29" r="1.2" fill="white"/>
    <circle cx="9.61" cy="26" r="1.5" fill="white"/>
    <circle cx="6.14" cy="29" r="1.2" fill="white"/>
    <!-- Center node -->
    <circle cx="20" cy="20" r="2" fill="white"/>
  </g>
</svg>`;

function IconCanvas({
  size,
  label,
  filename,
}: {
  size: number;
  label: string;
  filename: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const renderIcon = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    const blob = new Blob([ICON_SVG], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      // Dark background matching Aetio blue-950 (#0a1628)
      ctx.fillStyle = "#0a1628";
      ctx.fillRect(0, 0, size, size);

      // Add some padding (10%)
      const padding = size * 0.1;
      const drawSize = size - padding * 2;
      ctx.drawImage(img, padding, padding, drawSize, drawSize);

      URL.revokeObjectURL(url);
    };

    img.src = url;
  }, [size]);

  useEffect(() => {
    renderIcon();
  }, [renderIcon]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = filename;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  // Also render a transparent version
  const handleDownloadTransparent = () => {
    // Create an offscreen canvas for transparent version
    const offscreen = document.createElement("canvas");
    offscreen.width = size;
    offscreen.height = size;
    const ctx = offscreen.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    const blob = new Blob([ICON_SVG], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      // No background fill — transparent
      const padding = size * 0.1;
      const drawSize = size - padding * 2;
      ctx.drawImage(img, padding, padding, drawSize, drawSize);

      const link = document.createElement("a");
      link.download = filename.replace(".png", "-transparent.png");
      link.href = offscreen.toDataURL("image/png");
      link.click();

      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center">
        <h2 className="text-white mb-1">
          {label} Resolution
        </h2>
        <p className="text-aetio-blue-400 text-sm">
          {size} x {size}px
        </p>
      </div>

      <div
        className="border border-aetio-blue-700 rounded-xl overflow-hidden bg-aetio-blue-900/50"
        style={{ padding: 16 }}
      >
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          style={{
            width: Math.min(size, 256),
            height: Math.min(size, 256),
            imageRendering: size <= 64 ? "pixelated" : "auto",
          }}
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleDownload}
          className="px-4 py-2 bg-aetio-blue-500 text-white rounded-lg text-sm hover:bg-aetio-blue-600 transition-colors"
        >
          Download PNG
        </button>
        <button
          onClick={handleDownloadTransparent}
          className="px-4 py-2 bg-white/[0.07] border border-aetio-blue-700 text-white rounded-lg text-sm hover:bg-white/[0.12] transition-colors"
        >
          Transparent
        </button>
      </div>
    </div>
  );
}

function CircularBadgePreview() {
  const handleDownloadSVG = () => {
    const blob = new Blob([CIRCULAR_BADGE_SVG], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = "aetio-icon-circular.svg";
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center">
        <h2 className="text-white mb-1">Circular Badge</h2>
        <p className="text-aetio-blue-400 text-sm">SVG &middot; Scalable</p>
      </div>

      <div
        className="border border-aetio-blue-700 rounded-xl overflow-hidden bg-aetio-blue-900/50"
        style={{ padding: 16 }}
      >
        {/* Inline preview of the circular badge */}
        <svg
          width="256"
          height="256"
          viewBox="0 0 40 40"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <clipPath id="preview-circle-clip">
              <circle cx="20" cy="20" r="19" />
            </clipPath>
          </defs>
          <circle cx="20" cy="20" r="19" fill="#0a1628" />
          <circle
            cx="20"
            cy="20"
            r="19"
            fill="none"
            stroke="#1a2d4a"
            strokeWidth="0.5"
          />
          <g clipPath="url(#preview-circle-clip)">
            <line x1="20" y1="20" x2="20" y2="8" stroke="white" strokeWidth="1" opacity="0.6" />
            <line x1="20" y1="8" x2="20" y2="4" stroke="white" strokeWidth="1" opacity="0.6" />
            <line x1="20" y1="20" x2="30.39" y2="26" stroke="white" strokeWidth="1" opacity="0.6" />
            <line x1="30.39" y1="26" x2="33.86" y2="29" stroke="white" strokeWidth="1" opacity="0.6" />
            <line x1="20" y1="20" x2="9.61" y2="26" stroke="white" strokeWidth="1" opacity="0.6" />
            <line x1="9.61" y1="26" x2="6.14" y2="29" stroke="white" strokeWidth="1" opacity="0.6" />
            <line x1="20" y1="8" x2="30.39" y2="26" stroke="white" strokeWidth="1" opacity="0.6" />
            <line x1="30.39" y1="26" x2="9.61" y2="26" stroke="white" strokeWidth="1" opacity="0.6" />
            <line x1="9.61" y1="26" x2="20" y2="8" stroke="white" strokeWidth="1" opacity="0.6" />
            <circle cx="20" cy="8" r="1.5" fill="white" />
            <circle cx="20" cy="4" r="1.2" fill="white" />
            <circle cx="30.39" cy="26" r="1.5" fill="white" />
            <circle cx="33.86" cy="29" r="1.2" fill="white" />
            <circle cx="9.61" cy="26" r="1.5" fill="white" />
            <circle cx="6.14" cy="29" r="1.2" fill="white" />
            <circle cx="20" cy="20" r="2" fill="white" />
          </g>
        </svg>
      </div>

      <button
        onClick={handleDownloadSVG}
        className="px-4 py-2 bg-aetio-blue-500 text-white rounded-lg text-sm hover:bg-aetio-blue-600 transition-colors"
      >
        Download SVG
      </button>
    </div>
  );
}

export default function ExportIcons() {
  return (
    <div className="min-h-screen bg-aetio-blue-950 flex flex-col">
      {/* Top bar */}
      <div className="px-6 py-5 flex items-center justify-between border-b border-aetio-blue-800/50">
        <Link
          to="/"
          className="text-aetio-blue-300 hover:text-white transition-colors text-sm"
        >
          &larr; Back to Home
        </Link>
        <h1 className="text-white text-sm">
          Aetio Icon Export
        </h1>
        <div className="w-20" />
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl text-white mb-3">
              Aetio Icon — At Rest
            </h1>
            <p className="text-aetio-blue-300 max-w-lg mx-auto">
              Static renders of the Aetio graph icon at its resting position (0&deg; rotation).
              Available with dark background or transparent.
            </p>
          </div>

          {/* Preview of the live animated icon for reference */}
          <div className="flex justify-center mb-12">
            <div className="flex items-center gap-3 bg-aetio-blue-900/50 border border-aetio-blue-800 rounded-xl px-6 py-3">
              <svg
                width="32"
                height="32"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white"
              >
                <g>
                  <line x1="20" y1="20" x2="20" y2="8" stroke="currentColor" strokeWidth="1" opacity="0.6" />
                  <line x1="20" y1="8" x2="20" y2="4" stroke="currentColor" strokeWidth="1" opacity="0.6" />
                  <line x1="20" y1="20" x2="30.39" y2="26" stroke="currentColor" strokeWidth="1" opacity="0.6" />
                  <line x1="30.39" y1="26" x2="33.86" y2="29" stroke="currentColor" strokeWidth="1" opacity="0.6" />
                  <line x1="20" y1="20" x2="9.61" y2="26" stroke="currentColor" strokeWidth="1" opacity="0.6" />
                  <line x1="9.61" y1="26" x2="6.14" y2="29" stroke="currentColor" strokeWidth="1" opacity="0.6" />
                  <line x1="20" y1="8" x2="30.39" y2="26" stroke="currentColor" strokeWidth="1" opacity="0.6" />
                  <line x1="30.39" y1="26" x2="9.61" y2="26" stroke="currentColor" strokeWidth="1" opacity="0.6" />
                  <line x1="9.61" y1="26" x2="20" y2="8" stroke="currentColor" strokeWidth="1" opacity="0.6" />
                  <circle cx="20" cy="8" r="1.5" fill="currentColor" />
                  <circle cx="20" cy="4" r="1.2" fill="currentColor" />
                  <circle cx="30.39" cy="26" r="1.5" fill="currentColor" />
                  <circle cx="33.86" cy="29" r="1.2" fill="currentColor" />
                  <circle cx="9.61" cy="26" r="1.5" fill="currentColor" />
                  <circle cx="6.14" cy="29" r="1.2" fill="currentColor" />
                  <circle cx="20" cy="20" r="2" fill="currentColor" />
                </g>
              </svg>
              <span className="text-white text-sm">Static reference (SVG)</span>
            </div>
          </div>

          {/* Three resolution canvases */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
            {RESOLUTIONS.map((res) => (
              <IconCanvas
                key={res.label}
                size={res.size}
                label={res.label}
                filename={res.filename}
              />
            ))}
          </div>

          {/* Circular badge preview */}
          <div className="mt-16 pt-16 border-t border-aetio-blue-800/50">
            <div className="text-center mb-10">
              <h2 className="text-2xl text-white mb-2">
                Circular Badge
              </h2>
              <p className="text-aetio-blue-300 text-sm max-w-md mx-auto">
                Tight-fit circular version with minimal padding — ideal for app icons, favicons, and profile avatars. Downloads as a scalable SVG.
              </p>
            </div>
            <CircularBadgePreview />
          </div>
        </div>
      </div>
    </div>
  );
}