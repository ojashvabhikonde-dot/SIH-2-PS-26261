import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Document as DocType, AnomalyFlag, ExtractedField } from '../../types';
import { Eye, ShieldAlert, CheckCircle2, ZoomIn, ZoomOut, RotateCcw, AlertTriangle, Layers, FileText } from 'lucide-react';

interface EvidenceViewerProps {
  document: DocType;
  anomalyFlags?: AnomalyFlag[];
}

export const EvidenceViewer: React.FC<EvidenceViewerProps> = ({ document, anomalyFlags = [] }) => {
  const [zoom, setZoom] = useState<number>(1);
  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'ALL' | 'ANOMALIES_ONLY' | 'OFF'>('ALL');

  const fields = document.extractedFields || [];
  const flags = document.anomalyFlags || anomalyFlags || [];

  // Parse bounding boxes from fields and flags
  const fieldHighlights = fields.map((f) => {
    let box = { x: 80, y: 200, w: 200, h: 40 };
    if (f.boundingBoxJson) {
      try {
        box = JSON.parse(f.boundingBoxJson);
      } catch (e) {}
    }
    return {
      id: `field-${f.id}`,
      type: 'FIELD' as const,
      label: f.fieldName,
      value: f.fieldValue,
      confidence: f.confidence,
      box
    };
  });

  const anomalyHighlights = flags.map((a) => {
    let box = { x: 420, y: 570, w: 300, h: 90 };
    if (a.boundingBoxJson) {
      try {
        box = JSON.parse(a.boundingBoxJson);
      } catch (e) {}
    }
    return {
      id: `anomaly-${a.id}`,
      type: 'ANOMALY' as const,
      label: a.title,
      value: a.evidenceSummary,
      confidence: a.confidenceScore,
      severity: a.severity,
      box
    };
  });

  const allHighlights = [...anomalyHighlights, ...fieldHighlights];

  const visibleHighlights = filterMode === 'OFF'
    ? []
    : filterMode === 'ANOMALIES_ONLY'
    ? anomalyHighlights
    : allHighlights;

  // Document file URL
  const fileUrl = document.filePath.startsWith('http')
    ? document.filePath
    : `/${document.filePath}`;

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 bg-trust-midnight/70 overflow-hidden shadow-2xl">
      {/* Top Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between p-4 border-b border-slate-800 bg-slate-900/60 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-trust-blue/20 text-trust-blue">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              {document.originalName}
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                document.status === 'VALIDATED'
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
              }`}>
                {document.status}
              </span>
            </h4>
            <p className="text-xs text-slate-400 font-mono">
              SHA-256: {document.sha256Hash.slice(0, 24)}...
            </p>
          </div>
        </div>

        {/* Zoom & Overlay Controls */}
        <div className="flex items-center gap-2">
          {/* Overlay Filter toggle */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setFilterMode('ALL')}
              className={`px-2.5 py-1 rounded-md transition ${filterMode === 'ALL' ? 'bg-trust-blue text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
            >
              All Regions
            </button>
            <button
              onClick={() => setFilterMode('ANOMALIES_ONLY')}
              className={`px-2.5 py-1 rounded-md transition ${filterMode === 'ANOMALIES_ONLY' ? 'bg-rose-600 text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
            >
              Anomalies
            </button>
            <button
              onClick={() => setFilterMode('OFF')}
              className={`px-2.5 py-1 rounded-md transition ${filterMode === 'OFF' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
            >
              Raw Preview
            </button>
          </div>

          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-slate-300">
            <button
              onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
              className="p-1 hover:text-trust-teal transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono px-2">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(1.8, z + 0.15))}
              className="p-1 hover:text-trust-teal transition"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1 hover:text-trust-teal transition ml-1"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Split Layout: Document Left, Scrutiny Findings Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[550px]">
        {/* Left Side: Document Preview with Bounding Box Overlay Canvas */}
        <div className="lg:col-span-7 bg-slate-950/90 p-4 flex items-center justify-center overflow-auto max-h-[680px] relative border-r border-slate-800 select-none">
          <div
            className="relative transition-transform duration-200 shadow-2xl rounded-lg bg-white overflow-hidden"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
              width: '560px',
              height: '770px'
            }}
          >
            {/* SVG Certificate Document Iframe / Embed */}
            <iframe
              src={fileUrl}
              title={document.originalName}
              className="w-full h-full pointer-events-none border-0"
              style={{ width: '560px', height: '770px' }}
            />

            {/* Bounding Box Overlay Layer (Normalized from 800x1100 to 560x770) */}
            {visibleHighlights.map((hl) => {
              const scaleX = 560 / 800;
              const scaleY = 770 / 1100;

              const isHovered = activeHighlightId === hl.id;
              const isAnomaly = hl.type === 'ANOMALY';

              return (
                <div
                  key={hl.id}
                  onMouseEnter={() => setActiveHighlightId(hl.id)}
                  onMouseLeave={() => setActiveHighlightId(null)}
                  className={`absolute rounded cursor-pointer transition-all duration-200 z-20 ${
                    isAnomaly
                      ? isHovered
                        ? 'bg-rose-500/35 border-2 border-rose-500 shadow-[0_0_15px_#EF4444]'
                        : 'bg-rose-500/20 border-2 border-dashed border-rose-500 animate-pulse'
                      : isHovered
                      ? 'bg-trust-blue/35 border-2 border-trust-teal shadow-[0_0_15px_#00F0FF]'
                      : 'bg-blue-500/10 border border-blue-400/60'
                  }`}
                  style={{
                    left: `${hl.box.x * scaleX}px`,
                    top: `${hl.box.y * scaleY}px`,
                    width: `${hl.box.w * scaleX}px`,
                    height: `${hl.box.h * scaleY}px`
                  }}
                >
                  {/* Floating Tag Label on Hover */}
                  {isHovered && (
                    <div
                      className={`absolute -top-7 left-0 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide whitespace-nowrap shadow-lg ${
                        isAnomaly ? 'bg-rose-600 text-white' : 'bg-trust-midnight text-trust-teal border border-trust-teal/40'
                      }`}
                    >
                      {hl.label} ({(hl.confidence * 100).toFixed(0)}%)
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Interactive Linked Evidence Findings & Fields */}
        <div className="lg:col-span-5 p-4 max-h-[680px] overflow-y-auto space-y-4 bg-slate-900/40">
          {/* Integrity Flags Accordion */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                Integrity Findings ({anomalyHighlights.length})
              </span>
              <span className="text-[11px] text-slate-400">Hover links to preview region</span>
            </div>

            {anomalyHighlights.length === 0 ? (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Zero integrity anomalies or image tampering detected on this document.</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {anomalyHighlights.map((flag) => {
                  const isHovered = activeHighlightId === flag.id;
                  return (
                    <motion.div
                      key={flag.id}
                      onMouseEnter={() => setActiveHighlightId(flag.id)}
                      onMouseLeave={() => setActiveHighlightId(null)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isHovered
                          ? 'bg-rose-950/40 border-rose-500 shadow-[0_0_15px_rgba(239,68,68,0.25)]'
                          : 'bg-slate-900/70 border-rose-500/30 hover:border-rose-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {flag.label}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          {(flag.confidence * 100).toFixed(0)}% Conf.
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed mb-2">
                        {flag.value}
                      </p>
                      <div className="text-[11px] text-amber-300/90 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                        <span className="font-semibold">Suggested Action: </span>
                        {flag.type === 'ANOMALY' ? 'Request physical municipal inspection' : 'Verify original'}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* OCR Extracted Fields */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                <Layers className="w-4 h-4 text-trust-teal" />
                Extracted Fields ({fieldHighlights.length})
              </span>
              <span className="text-[11px] text-slate-400">Click to locate</span>
            </div>

            <div className="space-y-2">
              {fieldHighlights.map((field) => {
                const isHovered = activeHighlightId === field.id;
                return (
                  <div
                    key={field.id}
                    onMouseEnter={() => setActiveHighlightId(field.id)}
                    onMouseLeave={() => setActiveHighlightId(null)}
                    className={`p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                      isHovered
                        ? 'bg-trust-blue/20 border-trust-teal shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-center text-slate-400 text-[11px] mb-1">
                      <span className="font-medium capitalize">{field.label.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="font-mono text-[10px] text-trust-teal">{(field.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <div className="font-semibold text-white font-mono break-words">
                      {field.value}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
