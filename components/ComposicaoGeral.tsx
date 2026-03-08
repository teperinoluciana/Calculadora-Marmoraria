"use client";

import React, { useRef, useState } from "react";
import { Bancada } from "@/lib/pricing";

const EdgeDisplay = ({ bancada, field, color, labelPrefix, offset, widthPx, heightPx }: { bancada: Bancada, field: "bordaLados" | "paredeLados" | "rodabancaLados", color: string, labelPrefix: string, offset: number, widthPx: number, heightPx: number }) => {
  const current = bancada[field] || [];
  
  const edges = [
    { id: "trás", bx: 0, by: 0, bw: widthPx, bh: 8, lx: widthPx / 2, ly: 0, label: "TRÁS" },
    { id: "frente", bx: 0, by: heightPx - 8, bw: widthPx, bh: 8, lx: widthPx / 2, ly: heightPx, label: "FRENTE" },
    { id: "esquerda", bx: 0, by: 0, bw: 8, bh: heightPx, lx: 0, ly: heightPx / 2, label: "ESQ" },
    { id: "direita", bx: widthPx - 8, by: 0, bw: 8, bh: heightPx, lx: widthPx, ly: heightPx / 2, label: "DIR" },
  ];

  return (
    <g pointerEvents="none">
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
          <g key={e.id}>
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

interface ComposicaoGeralProps {
  bancadas: Bancada[];
  onChange: (updated: Bancada[]) => void;
}

export default function ComposicaoGeral({ bancadas, onChange }: ComposicaoGeralProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragState, setDragState] = useState<{
    id: string;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    type: "move" | "rotate" | "move-title";
    initialRot: number;
  } | null>(null);

  const scale = 150; // 1m = 150px
  const canvasWidth = 1200;
  const canvasHeight = 800;

  const handlePointerDown = (e: React.PointerEvent, id: string, type: "move" | "rotate" | "move-title") => {
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);

    const bancada = bancadas.find(b => b.id === id);
    if (!bancada) return;

    const index = bancadas.findIndex(b => b.id === id);
    const widthPx = bancada.length * scale;
    const heightPx = bancada.width * scale;

    let initialX = bancada.globalX ?? (canvasWidth / 2 - widthPx / 2 + (index * 20));
    let initialY = bancada.globalY ?? (canvasHeight / 2 - heightPx / 2 + (index * 20));

    if (type === "move-title") {
      initialX = bancada.titleOffsetX || 0;
      initialY = bancada.titleOffsetY || 0;
    }

    setDragState({
      id,
      startX: e.clientX,
      startY: e.clientY,
      initialX,
      initialY,
      type,
      initialRot: bancada.globalRotation || 0,
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragState) return;

    const svg = svgRef.current;
    if (!svg) return;

    const CTM = svg.getScreenCTM();
    if (!CTM) return;

    const dx = (e.clientX - dragState.startX) / CTM.a;
    const dy = (e.clientY - dragState.startY) / CTM.d;

    const updatedBancadas = [...bancadas];
    const index = updatedBancadas.findIndex(b => b.id === dragState.id);
    if (index === -1) return;

    if (dragState.type === "move") {
      updatedBancadas[index] = {
        ...updatedBancadas[index],
        globalX: dragState.initialX + dx,
        globalY: dragState.initialY + dy,
      };
    } else if (dragState.type === "move-title") {
      // For title, we need to account for the rotation of the bancada if we want the drag to feel natural,
      // but since the title is inside the rotated group, dx and dy from the screen CTM are in screen space.
      // To make it perfectly follow the mouse, we should inverse-rotate the dx/dy by the bancada's rotation.
      const rotRad = -(updatedBancadas[index].globalRotation || 0) * (Math.PI / 180);
      const localDx = dx * Math.cos(rotRad) - dy * Math.sin(rotRad);
      const localDy = dx * Math.sin(rotRad) + dy * Math.cos(rotRad);

      updatedBancadas[index] = {
        ...updatedBancadas[index],
        titleOffsetX: dragState.initialX + localDx,
        titleOffsetY: dragState.initialY + localDy,
      };
    } else if (dragState.type === "rotate") {
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      let newRot = dragState.initialRot + angle;
      if (e.shiftKey) {
        newRot = Math.round(newRot / 45) * 45;
      }
      updatedBancadas[index] = {
        ...updatedBancadas[index],
        globalRotation: newRot,
      };
    }

    onChange(updatedBancadas);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragState) {
      (e.target as Element).releasePointerCapture(e.pointerId);
      setDragState(null);
    }
  };

  return (
    <div className="w-full overflow-hidden border border-stone-200 bg-stone-50 rounded-xl flex flex-col items-center justify-center relative">
      <div className="absolute top-3 left-3 text-[10px] text-stone-500 bg-white/80 px-2 py-1 rounded shadow-sm pointer-events-none z-10">
        Composição Geral: Arraste as bancadas para montar seu projeto • Use a alça para rotacionar • Shift para ângulos retos
      </div>
      <div className="w-full overflow-auto" style={{ height: '600px' }}>
        <svg
          ref={svgRef}
          width={canvasWidth}
          height={canvasHeight}
          viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
          className="max-w-none drop-shadow-sm touch-none"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <defs>
            <pattern id="grid-comp" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#e5e7eb" strokeWidth="1" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#grid-comp)" />

          {bancadas.map((bancada, index) => {
            const widthPx = bancada.length * scale;
            const heightPx = bancada.width * scale;
            const gx = bancada.globalX ?? (canvasWidth / 2 - widthPx / 2 + (index * 20));
            const gy = bancada.globalY ?? (canvasHeight / 2 - heightPx / 2 + (index * 20));
            const grot = bancada.globalRotation || 0;
            const isDragging = dragState?.id === bancada.id;

            // Elements inside bancada
            const elements: { id: string; type: string; label: string; defaultX: number; defaultY: number; w: number; h: number; shape: "Retangular" | "Redondo"; cubaType?: string; fundo?: string; material?: string }[] = [];
            
            (bancada.cubas || []).forEach((cuba, idx) => {
              let defaultY = 0.5;
              if (cuba.type === "Farm sink" || cuba.type === "Semi-encaixe") {
                defaultY = 1.0;
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

            return (
              <g
                key={bancada.id}
                transform={`translate(${gx}, ${gy}) rotate(${grot}, ${widthPx / 2}, ${heightPx / 2})`}
                className="cursor-move"
                onPointerDown={(e) => handlePointerDown(e, bancada.id, "move")}
                opacity={isDragging ? 0.8 : 1}
              >
                {/* Base */}
                <rect x="0" y="0" width={widthPx} height={heightPx} fill="#f5f5f4" stroke="#57534e" strokeWidth="2" rx="4" />
                
                {/* Edge Selectors (Display Only) */}
                <EdgeDisplay bancada={bancada} field="bordaLados" color="#ea580c" labelPrefix="BORDA" offset={16} widthPx={widthPx} heightPx={heightPx} />
                <EdgeDisplay bancada={bancada} field="paredeLados" color="#4b5563" labelPrefix="PAREDE" offset={36} widthPx={widthPx} heightPx={heightPx} />
                <EdgeDisplay bancada={bancada} field="rodabancaLados" color="#0284c7" labelPrefix="RODABANCA" offset={56} widthPx={widthPx} heightPx={heightPx} />

                {/* Name Label */}
                <g
                  transform={`translate(${widthPx / 2 + (bancada.titleOffsetX || 0)}, ${-10 + (bancada.titleOffsetY || 0)})`}
                  className="cursor-move"
                  onPointerDown={(e) => handlePointerDown(e, bancada.id, "move-title")}
                >
                  {/* Invisible background for easier grabbing */}
                  <rect x="-100" y="-15" width="200" height="30" fill="transparent" />
                  <text x="0" y="0" fill="#57534e" fontSize="12" fontWeight="bold" textAnchor="middle" pointerEvents="none">
                    {bancada.name} ({bancada.tipoBancada})
                  </text>
                </g>

                {/* Dimension Lines */}
                <g stroke="#a8a29e" strokeWidth="1" fill="none" pointerEvents="none">
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
                    if (el.material === "Louça") {
                      fill = "#ffffff";
                    } else if (el.material === "Cerâmica") {
                      fill = "#f5f5dc";
                    } else {
                      fill = "#d6d3d1";
                    }
                    
                    rx = 8;
                    if (el.cubaType === "Esculpida") {
                      fill = "#e7e5e4";
                      rx = 0;
                    } else if (el.cubaType === "Farm sink" || el.cubaType === "Semi-encaixe") {
                      rx = 4;
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

                  return (
                    <g key={el.id} transform={`translate(${cx}, ${cy}) rotate(${pos.rotation})`} pointerEvents="none">
                      {el.shape === "Redondo" ? (
                        <>
                          <circle cx="0" cy="0" r={el.w / 2} fill={fill} stroke={stroke} strokeWidth={el.cubaType === "Apoio" ? "3" : "1.5"} />
                          {el.cubaType === "Apoio" && (
                            <circle cx="0" cy="0" r={(el.w / 2) - 4} fill="none" stroke={stroke} strokeWidth="0.5" opacity={0.5} />
                          )}
                        </>
                      ) : (
                        <>
                          <rect x={-el.w / 2} y={-el.h / 2} width={el.w} height={el.h + (el.cubaType === "Farm sink" || el.cubaType === "Semi-encaixe" ? 10 : 0)} fill={fill} stroke={stroke} strokeWidth={el.cubaType === "Apoio" ? "3" : "1.5"} rx={rx} />
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
                            <rect x={-el.w / 2} y={el.h / 2 - 5} width={el.w} height={15} fill={fill} stroke={stroke} strokeWidth="1.5" rx={4} />
                          )}
                        </>
                      )}
                      <text x="0" y="0" fill={el.type === "cooktop" ? "#fff" : stroke} fontSize="8" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">
                        {el.label}
                      </text>
                    </g>
                  );
                })}

                {/* Rotate Handle */}
                <g
                  transform={`translate(${widthPx + 40}, ${heightPx / 2})`}
                  className="cursor-pointer"
                  onPointerDown={(e) => handlePointerDown(e, bancada.id, "rotate")}
                >
                  <circle cx="0" cy="0" r="12" fill="#fff" stroke="#a8a29e" strokeWidth="1" />
                  <circle cx="0" cy="0" r="4" fill="#ea580c" />
                </g>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
