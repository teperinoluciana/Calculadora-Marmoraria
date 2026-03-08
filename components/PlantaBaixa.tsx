"use client";

import React, { useRef, useState } from "react";
import { Bancada } from "@/lib/pricing";
import { Plus, Minus } from "lucide-react";

interface PlantaBaixaProps {
  bancada: Bancada;
  onChange: (updated: Bancada) => void;
  printMode?: boolean;
}

const EDGES = [
  { id: "trás", bx: 0, by: 0, bw: 0, bh: 8, lx: 0, ly: 0, label: "TRÁS" },
  { id: "frente", bx: 0, by: 0, bw: 0, bh: 8, lx: 0, ly: 0, label: "FRENTE" },
  { id: "esquerda", bx: 0, by: 0, bw: 8, bh: 0, lx: 0, ly: 0, label: "ESQ" },
  { id: "direita", bx: 0, by: 0, bw: 8, bh: 0, lx: 0, ly: 0, label: "DIR" },
];

const EdgeSelector = ({ bancada, onChange, field, isActive, color, labelPrefix, offset, widthPx, heightPx }: { bancada: Bancada, onChange: (updated: Bancada) => void, field: "bordaLados" | "paredeLados" | "rodabancaLados", isActive: boolean, color: string, labelPrefix: string, offset: number, widthPx: number, heightPx: number }) => {
  if (!isActive) return null;
  const current = bancada[field] || [];
  
  const edges = [
    { id: "trás", bx: 0, by: 0, bw: widthPx, bh: 8, lx: widthPx / 2, ly: 0, label: "TRÁS" },
    { id: "frente", bx: 0, by: heightPx - 8, bw: widthPx, bh: 8, lx: widthPx / 2, ly: heightPx, label: "FRENTE" },
    { id: "esquerda", bx: 0, by: 0, bw: 8, bh: heightPx, lx: 0, ly: heightPx / 2, label: "ESQ" },
    { id: "direita", bx: widthPx - 8, by: 0, bw: 8, bh: heightPx, lx: widthPx, ly: heightPx / 2, label: "DIR" },
  ];

  const toggleEdge = (id: string) => {
    const newEdges = current.includes(id) ? current.filter(e => e !== id) : [...current, id];
    onChange({ ...bancada, [field]: newEdges });
  };

  return (
    <g>
      {edges.filter(e => current.includes(e.id)).map(e => (
        <rect key={e.id + "-strip"} x={e.bx} y={e.by} width={e.bw} height={e.bh} fill={color} fillOpacity="0.8" />
      ))}
      {edges.map(e => {
        const sel = current.includes(e.id);
        let badgeX = e.lx;
        let badgeY = e.ly;
        
        if (e.id === "trás") badgeY -= offset;
        if (e.id === "frente") badgeY += offset;
        if (e.id === "esquerda") {
          badgeX -= 32;
          badgeY += (offset - 36);
        }
        if (e.id === "direita") {
          badgeX += 32;
          badgeY += (offset - 36);
        }

        return (
          <g key={e.id} className="cursor-pointer" onClick={() => toggleEdge(e.id)}>
            <rect x={badgeX - 24} y={badgeY - 8} width="48" height="16" rx="4"
              fill={sel ? color : "#f5f5f4"}
              stroke={sel ? color : "#d6d3d1"} strokeWidth="1" />
            <text x={badgeX} y={badgeY} textAnchor="middle" dominantBaseline="central" fontSize="8"
              fontWeight={sel ? "bold" : "normal"} fill={sel ? "#fff" : "#57534e"}>
              {sel ? labelPrefix : e.label}
            </text>
          </g>
        );
      })}
    </g>
  );
};

export default function PlantaBaixa({ bancada, onChange, printMode = false }: PlantaBaixaProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragState, setDragState] = useState<{
    id: string;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    type: "move" | "rotate" | "dimX" | "dimY";
    initialRot: number;
    initialDimXOffset: number;
    initialDimYOffset: number;
  } | null>(null);
  const [zoom, setZoom] = useState(1.5); // Default scale increased

  const scale = 150 * zoom;
  const widthPx = bancada.length * scale; // 1m = 150px * zoom
  const heightPx = bancada.width * scale;

  const elements: { id: string; type: string; label: string; defaultX: number; defaultY: number; w: number; h: number; shape: "Retangular" | "Redondo"; cubaType?: string; fundo?: string; material?: string }[] = [];
  
  (bancada.cubas || []).forEach((cuba, idx) => {
    let defaultY = 0.5;
    if (cuba.type === "Farm sink" || cuba.type === "Semi-encaixe") {
      defaultY = 1.0; // Farm sink and Semi-encaixe default to the front edge
    }
    
    elements.push({ 
      id: cuba.id, 
      type: "cuba", 
      label: cuba.type === "Esculpida" ? "ESC." : (cuba.type === "Farm sink" ? "FARM" : (cuba.type === "Semi-encaixe" ? "SEMI" : "CUBA")), 
      defaultX: 0.5 + (idx * 0.1), 
      defaultY, 
      w: (cuba.length || 0.5) * scale, 
      h: (cuba.width || 0.4) * scale, 
      shape: cuba.shape || "Retangular",
      cubaType: cuba.type,
      fundo: cuba.fundo,
      material: cuba.material
    });
    if (cuba.shape === "Redondo") {
      elements[elements.length - 1].w = (cuba.diameter || 0.4) * scale;
      elements[elements.length - 1].h = (cuba.diameter || 0.4) * scale;
    }
  });
  
  (bancada.recortes || []).forEach((r, idx) => {
    const isAlwaysRound = r.type === "Torneira" || r.type === "Dosador";
    const shape = isAlwaysRound ? "Redondo" : (r.shape || "Retangular");
    const w = shape === "Redondo" ? (r.diameter || 0.1) * scale : (r.length || 0.5) * scale;
    const h = shape === "Redondo" ? (r.diameter || 0.1) * scale : (r.width || 0.4) * scale;

    elements.push({
      id: r.id,
      type: r.type.toLowerCase(),
      label: r.type.substring(0, 4).toUpperCase(),
      defaultX: 0.2 + (idx * 0.1),
      defaultY: 0.5,
      w,
      h,
      shape,
    });
  });

  const handlePointerDown = (e: React.PointerEvent, id: string, type: "move" | "rotate" | "dimX" | "dimY") => {
    if (printMode) return;
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);

    const pos = bancada.posicoes?.[id] || {
      x: elements.find((el) => el.id === id)?.defaultX || 0.5,
      y: elements.find((el) => el.id === id)?.defaultY || 0.5,
      rotation: 0,
      dimXOffset: 0,
      dimYOffset: 0,
    };

    setDragState({
      id,
      startX: e.clientX,
      startY: e.clientY,
      initialX: pos.x,
      initialY: pos.y,
      type,
      initialRot: pos.rotation || 0,
      initialDimXOffset: pos.dimXOffset || 0,
      initialDimYOffset: pos.dimYOffset || 0,
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (printMode || !dragState) return;

    const svg = svgRef.current;
    if (!svg) return;

    const CTM = svg.getScreenCTM();
    if (!CTM) return;

    const dx = (e.clientX - dragState.startX) / CTM.a;
    const dy = (e.clientY - dragState.startY) / CTM.d;

    if (dragState.type === "move") {
      const relDx = dx / widthPx;
      const relDy = dy / heightPx;

      let newX = dragState.initialX + relDx;
      let newY = dragState.initialY + relDy;

      newX = Math.max(0, Math.min(1, newX));
      newY = Math.max(0, Math.min(1, newY));

      onChange({
        ...bancada,
        posicoes: {
          ...(bancada.posicoes || {}),
          [dragState.id]: {
            ...(bancada.posicoes?.[dragState.id] || {}),
            x: newX,
            y: newY,
            rotation: dragState.initialRot,
          },
        },
      });
    } else if (dragState.type === "rotate") {
      const pos = bancada.posicoes?.[dragState.id] || {
        x: elements.find((el) => el.id === dragState.id)?.defaultX || 0.5,
        y: elements.find((el) => el.id === dragState.id)?.defaultY || 0.5,
        rotation: 0,
      };

      const pt = svg.createSVGPoint();
      pt.x = pos.x * widthPx;
      pt.y = pos.y * heightPx;
      const centerScreen = pt.matrixTransform(CTM);

      const startAngle = (Math.atan2(dragState.startY - centerScreen.y, dragState.startX - centerScreen.x) * 180) / Math.PI;
      const currentAngle = (Math.atan2(e.clientY - centerScreen.y, e.clientX - centerScreen.x) * 180) / Math.PI;

      let newRot = dragState.initialRot + (currentAngle - startAngle);

      if (e.shiftKey) {
        newRot = Math.round(newRot / 45) * 45;
      }

      onChange({
        ...bancada,
        posicoes: {
          ...(bancada.posicoes || {}),
          [dragState.id]: {
            ...(bancada.posicoes?.[dragState.id] || {}),
            x: dragState.initialX,
            y: dragState.initialY,
            rotation: newRot,
          },
        },
      });
    } else if (dragState.type === "dimX") {
      onChange({
        ...bancada,
        posicoes: {
          ...(bancada.posicoes || {}),
          [dragState.id]: {
            ...(bancada.posicoes?.[dragState.id] || {}),
            x: dragState.initialX,
            y: dragState.initialY,
            rotation: dragState.initialRot,
            dimXOffset: dragState.initialDimXOffset + dy,
          },
        },
      });
    } else if (dragState.type === "dimY") {
      onChange({
        ...bancada,
        posicoes: {
          ...(bancada.posicoes || {}),
          [dragState.id]: {
            ...(bancada.posicoes?.[dragState.id] || {}),
            x: dragState.initialX,
            y: dragState.initialY,
            rotation: dragState.initialRot,
            dimYOffset: dragState.initialDimYOffset + dx,
          },
        },
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (printMode) return;
    if (dragState) {
      (e.target as Element).releasePointerCapture(e.pointerId);
      setDragState(null);
    }
  };

  return (
    <div className={`w-full overflow-hidden border ${printMode ? 'border-[#e5e7eb] bg-[#f9fafb]' : 'border-stone-200 bg-stone-50'} rounded-xl flex flex-col items-center justify-center p-8 relative`}>
      {!printMode && (
        <>
          <div className="absolute top-3 left-3 text-[10px] text-stone-500 bg-white/80 px-2 py-1 rounded shadow-sm pointer-events-none z-10">
            Arraste para mover • Use a alça para rotacionar • Shift para ângulos retos
          </div>
          <div className="absolute top-3 right-3 flex flex-col gap-1 z-10">
            <button 
              onClick={() => setZoom(z => Math.min(z + 0.25, 3))} 
              className="bg-white border border-stone-200 p-1.5 rounded shadow-sm hover:bg-stone-50 text-stone-600 transition-colors"
              title="Aumentar Zoom"
            >
              <Plus size={16} />
            </button>
            <button 
              onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))} 
              className="bg-white border border-stone-200 p-1.5 rounded shadow-sm hover:bg-stone-50 text-stone-600 transition-colors"
              title="Diminuir Zoom"
            >
              <Minus size={16} />
            </button>
          </div>
        </>
      )}
      <svg
        ref={svgRef}
        width={widthPx + 240}
        height={heightPx + 240}
        viewBox={`-120 -120 ${widthPx + 240} ${heightPx + 240}`}
        className="max-w-full h-auto drop-shadow-sm touch-none"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <defs>
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#e5e7eb" strokeWidth="1" />
          </pattern>
        </defs>
        <rect x="-120" y="-120" width="100%" height="100%" fill="url(#grid)" />

        {/* Countertop Base */}
        <rect x="0" y="0" width={widthPx} height={heightPx} fill="#f5f5f4" stroke="#57534e" strokeWidth="2" rx="4" />

        {/* Edge Selectors */}
        <EdgeSelector 
          bancada={bancada} 
          onChange={(updated) => {
            const newBorda = updated.bordaLados;
            const newParede = updated.paredeLados.filter(p => !newBorda.includes(p));
            const newRodabanca = updated.rodabancaLados.filter(r => !newBorda.includes(r));
            onChange({ ...updated, paredeLados: newParede, rodabancaLados: newRodabanca });
          }} 
          field="bordaLados" 
          isActive={true} 
          color="#ea580c" 
          labelPrefix="BORDA" 
          offset={16} 
          widthPx={widthPx} 
          heightPx={heightPx} 
        />
        <EdgeSelector 
          bancada={bancada} 
          onChange={(updated) => {
            const newParede = updated.paredeLados;
            const newBorda = updated.bordaLados.filter(b => !newParede.includes(b));
            onChange({ ...updated, bordaLados: newBorda });
          }} 
          field="paredeLados" 
          isActive={true} 
          color="#4b5563" 
          labelPrefix="PAREDE" 
          offset={36} 
          widthPx={widthPx} 
          heightPx={heightPx} 
        />
        <EdgeSelector 
          bancada={bancada} 
          onChange={(updated) => {
            const newRodabanca = updated.rodabancaLados;
            const newBorda = updated.bordaLados.filter(b => !newRodabanca.includes(b));
            onChange({ ...updated, bordaLados: newBorda });
          }} 
          field="rodabancaLados" 
          isActive={true} 
          color="#0284c7" 
          labelPrefix="RODABANCA" 
          offset={56} 
          widthPx={widthPx} 
          heightPx={heightPx} 
        />

        {/* Dimension Lines */}
        <g stroke="#a8a29e" strokeWidth="1" fill="none">
          <line x1="0" y1="-70" x2={widthPx} y2="-70" />
          <line x1="0" y1="-75" x2="0" y2="-65" />
          <line x1={widthPx} y1="-75" x2={widthPx} y2="-65" />
          <text x={widthPx / 2} y="-80" fill="none" stroke="#f9fafb" strokeWidth="4" strokeLinejoin="round" fontSize="14" textAnchor="middle">
            {bancada.length.toFixed(2)}m
          </text>
          <text x={widthPx / 2} y="-80" fill="#78716c" fontSize="14" textAnchor="middle" stroke="none">
            {bancada.length.toFixed(2)}m
          </text>

          <line x1="-70" y1="0" x2="-70" y2={heightPx} />
          <line x1="-75" y1="0" x2="-65" y2="0" />
          <line x1="-75" y1={heightPx} x2="-65" y2={heightPx} />
          <text
            x="-80"
            y={heightPx / 2}
            fill="none" stroke="#f9fafb" strokeWidth="4" strokeLinejoin="round"
            fontSize="14"
            textAnchor="middle"
            transform={`rotate(-90, -80, ${heightPx / 2})`}
          >
            {bancada.width.toFixed(2)}m
          </text>
          <text
            x="-80"
            y={heightPx / 2}
            fill="#78716c"
            fontSize="14"
            textAnchor="middle"
            transform={`rotate(-90, -80, ${heightPx / 2})`}
            stroke="none"
          >
            {bancada.width.toFixed(2)}m
          </text>
        </g>

        {/* Elements */}
        {elements.map((el) => {
          const pos = bancada.posicoes?.[el.id] || { x: el.defaultX, y: el.defaultY, rotation: 0 };
          const cx = pos.x * widthPx;
          const cy = pos.y * heightPx;

          let fill = "#e7e5e4";
          let stroke = "#78716c";
          let rx = 2;

          if (el.type === "cuba") {
            // Base fill based on material
            if (el.material === "Louça") {
              fill = "#ffffff"; // White
            } else if (el.material === "Cerâmica") {
              fill = "#f5f5dc"; // Beige
            } else {
              fill = "#d6d3d1"; // Inox / Default Gray
            }
            
            rx = 8;
            if (el.cubaType === "Esculpida") {
              fill = "#e7e5e4"; // Matches countertop base better
              rx = 0; // Usually straight edges
            } else if (el.cubaType === "Farm sink" || el.cubaType === "Semi-encaixe") {
              rx = 4;
            } else if (el.cubaType === "Apoio") {
              // Keep material color
            }
          } else if (el.type === "cooktop") {
            fill = "#292524";
            stroke = "#1c1917";
          } else if (el.type === "torneira") {
            fill = "#93c5fd";
            stroke = "#3b82f6";
            rx = 8;
          } else if (el.type === "dosador") {
            fill = "#d8b4fe";
            stroke = "#a855f7";
            rx = 6;
          } else if (el.type === "tomada") {
            fill = "#fde047";
            stroke = "#eab308";
          } else if (el.type === "lixeira") {
            fill = "#fca5a5";
            stroke = "#ef4444";
            rx = 12;
          }

          const isDragging = dragState?.id === el.id;

          return (
            <g
              key={el.id}
              transform={`translate(${cx}, ${cy}) rotate(${pos.rotation})`}
              className="cursor-move"
              onPointerDown={(e) => handlePointerDown(e, el.id, "move")}
            >
              {el.shape === "Redondo" ? (
                <>
                  <circle
                    cx="0"
                    cy="0"
                    r={el.w / 2}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={el.cubaType === "Apoio" ? "3" : "1.5"}
                    strokeDasharray="none"
                    opacity={isDragging ? 0.7 : 1}
                  />
                  {el.cubaType === "Apoio" && (
                    <circle cx="0" cy="0" r={(el.w / 2) - 4} fill="none" stroke={stroke} strokeWidth="0.5" opacity={0.5} />
                  )}
                </>
              ) : (
                <>
                  <rect
                    x={-el.w / 2}
                    y={-el.h / 2}
                    width={el.w}
                    height={el.h + (el.cubaType === "Farm sink" || el.cubaType === "Semi-encaixe" ? 10 : 0)} // Extends forward
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={el.cubaType === "Apoio" ? "3" : "1.5"}
                    strokeDasharray="none"
                    rx={rx}
                    opacity={isDragging ? 0.7 : 1}
                  />
                  {el.cubaType === "Apoio" && (
                    <rect x={(-el.w / 2) + 4} y={(-el.h / 2) + 4} width={el.w - 8} height={el.h - 8} fill="none" stroke={stroke} strokeWidth="0.5" rx={rx-2} opacity={0.5} />
                  )}
                  {el.cubaType === "Esculpida" && el.fundo === "Inclinado" && (
                    <>
                      <line x1={-el.w / 2} y1={-el.h / 2} x2={el.w / 2} y2={el.h / 2} stroke={stroke} strokeWidth="0.5" opacity={0.5} />
                      <line x1={el.w / 2} y1={-el.h / 2} x2={-el.w / 2} y2={el.h / 2} stroke={stroke} strokeWidth="0.5" opacity={0.5} />
                    </>
                  )}
                  {(el.cubaType === "Farm sink" || el.cubaType === "Semi-encaixe") && (
                    <rect x={-el.w / 2} y={el.h / 2 - 5} width={el.w} height={15} fill={fill} stroke={stroke} strokeWidth="1.5" rx={4} opacity={isDragging ? 0.7 : 1} />
                  )}
                </>
              )}
              <text
                x="0"
                y="0"
                fill={el.type === "cooktop" ? "#fff" : stroke}
                fontSize="8"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="middle"
                pointerEvents="none"
              >
                {el.label}
              </text>

              {/* Rotate Handle */}
              {!printMode && (
                <g
                  transform={`translate(${el.w / 2 + 10}, 0)`}
                  className="cursor-pointer"
                  onPointerDown={(e) => handlePointerDown(e, el.id, "rotate")}
                >
                  <circle cx="0" cy="0" r="6" fill="#fff" stroke="#a8a29e" strokeWidth="1" />
                  <circle cx="0" cy="0" r="2" fill="#a8a29e" />
                </g>
              )}
            </g>
          );
        })}

        {/* Element Dimensions */}
        {elements.map((el) => {
          const pos = bancada.posicoes?.[el.id] || { x: el.defaultX, y: el.defaultY, rotation: 0 };
          const cx = pos.x * widthPx;
          const cy = pos.y * heightPx;
          const dimXOffset = pos.dimXOffset || 0;
          const dimYOffset = pos.dimYOffset || 0;
          
          return (
            <g key={`dim-${el.id}`} stroke="#a8a29e" strokeWidth="1" fill="none">
              {/* X Dimension (Left edge to center) */}
              <g className={!printMode ? "cursor-ns-resize" : ""} onPointerDown={(e) => handlePointerDown(e, el.id, "dimX")}>
                <line x1={0} y1={cy + dimXOffset} x2={cx} y2={cy + dimXOffset} strokeDasharray="2,2" />
                {dimXOffset !== 0 && (
                  <>
                    <line x1={0} y1={cy} x2={0} y2={cy + dimXOffset} strokeDasharray="2,2" />
                    <line x1={cx} y1={cy} x2={cx} y2={cy + dimXOffset} strokeDasharray="2,2" />
                  </>
                )}
                {!printMode && <rect x={0} y={cy + dimXOffset - 10} width={cx} height={20} fill="transparent" stroke="none" />}
                <text x={cx / 2} y={cy + dimXOffset - 4} fill="none" stroke="#f9fafb" strokeWidth="4" strokeLinejoin="round" fontSize="10" textAnchor="middle">
                  {(pos.x * bancada.length).toFixed(2)}m
                </text>
                <text x={cx / 2} y={cy + dimXOffset - 4} fill="#78716c" fontSize="10" textAnchor="middle" stroke="none">
                  {(pos.x * bancada.length).toFixed(2)}m
                </text>
              </g>
              
              {/* Y Dimension (Top edge to center) */}
              <g className={!printMode ? "cursor-ew-resize" : ""} onPointerDown={(e) => handlePointerDown(e, el.id, "dimY")}>
                <line x1={cx + dimYOffset} y1={0} x2={cx + dimYOffset} y2={cy} strokeDasharray="2,2" />
                {dimYOffset !== 0 && (
                  <>
                    <line x1={cx} y1={0} x2={cx + dimYOffset} y2={0} strokeDasharray="2,2" />
                    <line x1={cx} y1={cy} x2={cx + dimYOffset} y2={cy} strokeDasharray="2,2" />
                  </>
                )}
                {!printMode && <rect x={cx + dimYOffset - 10} y={0} width={20} height={cy} fill="transparent" stroke="none" />}
                <text x={cx + dimYOffset + 4} y={cy / 2} fill="none" stroke="#f9fafb" strokeWidth="4" strokeLinejoin="round" fontSize="10" textAnchor="start">
                  {(pos.y * bancada.width).toFixed(2)}m
                </text>
                <text x={cx + dimYOffset + 4} y={cy / 2} fill="#78716c" fontSize="10" textAnchor="start" stroke="none">
                  {(pos.y * bancada.width).toFixed(2)}m
                </text>
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
