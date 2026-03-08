"use client";

import React, { useState } from "react";
import { Bancada, MATERIAL_PRICES, PATTERN_MULTIPLIERS, THICKNESS_MULTIPLIERS, CUBA_PRICES, RECORTE_PRICES, EDGE_PRICES } from "@/lib/pricing";
import PlantaBaixa from "./PlantaBaixa";
import { ChevronDown, ChevronUp, Trash2, Plus, X } from "lucide-react";

interface BancadaCardProps {
  bancada: Bancada;
  onChange: (updated: Bancada) => void;
  onRemove: () => void;
}

const EdgeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "Reto":
      return (
        <svg viewBox="0 0 40 40" className="w-8 h-8 text-stone-600">
          <path d="M 5 15 L 35 15 L 35 25 L 5 25" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "Reto Duplo":
      return (
        <svg viewBox="0 0 40 40" className="w-8 h-8 text-stone-600">
          <path d="M 5 15 L 35 15 L 35 35 L 25 35 L 25 25 L 5 25" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 25 25 L 35 25" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "Meia Esquadria":
      return (
        <svg viewBox="0 0 40 40" className="w-8 h-8 text-stone-600">
          <path d="M 5 15 L 35 15 L 35 35 L 25 35 L 25 25 L 5 25" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 25 25 L 35 15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "Meia Esq. Invertida":
      return (
        <svg viewBox="0 0 40 40" className="w-8 h-8 text-stone-600">
          <path d="M 5 25 L 25 25 L 25 5 L 35 5 L 35 25 L 35 35 L 5 35" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 25 25 L 35 35" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "Bisotado":
      return (
        <svg viewBox="0 0 40 40" className="w-8 h-8 text-stone-600">
          <path d="M 5 15 L 30 15 L 35 20 L 35 25 L 5 25" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "Bisotado Duplo":
      return (
        <svg viewBox="0 0 40 40" className="w-8 h-8 text-stone-600">
          <path d="M 5 15 L 30 15 L 35 20 L 30 25 L 5 25" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "Meia Cana":
      return (
        <svg viewBox="0 0 40 40" className="w-8 h-8 text-stone-600">
          <path d="M 5 15 L 25 15 A 10 10 0 0 1 35 25 L 5 25" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "Meia Cana Dupla":
      return (
        <svg viewBox="0 0 40 40" className="w-8 h-8 text-stone-600">
          <path d="M 5 15 L 25 15 A 10 10 0 0 1 35 25 L 5 25" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 25 25 L 35 25 L 35 35 L 25 35 L 25 25" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "Boleado":
      return (
        <svg viewBox="0 0 40 40" className="w-8 h-8 text-stone-600">
          <path d="M 5 15 L 30 15 A 5 5 0 0 1 35 20 A 5 5 0 0 1 30 25 L 5 25" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "Boleado Duplo":
      return (
        <svg viewBox="0 0 40 40" className="w-8 h-8 text-stone-600">
          <path d="M 5 15 L 25 15 A 10 10 0 0 1 35 25 L 5 25" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 5 25 L 35 25 A 10 10 0 0 1 25 35 L 5 35" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "Peito de Pombo":
      return (
        <svg viewBox="0 0 40 40" className="w-8 h-8 text-stone-600">
          <path d="M 5 15 L 25 15 Q 30 15 30 20 Q 35 20 35 25 L 5 25" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "Borda T":
      return (
        <svg viewBox="0 0 40 40" className="w-8 h-8 text-stone-600">
          <path d="M 5 20 L 25 20 L 25 25 L 5 25" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 25 10 L 30 10 L 30 35 L 25 35 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "Pingadeira":
      return (
        <svg viewBox="0 0 40 40" className="w-8 h-8 text-stone-600">
          <path d="M 5 15 L 35 15 L 35 25 L 5 25" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 20 25 L 25 25 L 25 35 L 20 35 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return null;
  }
};

export default function BancadaCard({ bancada, onChange, onRemove }: BancadaCardProps) {
  const [collapsed, setCollapsed] = useState(false);

  const handleChange = (field: keyof Bancada, value: any) => {
    onChange({ ...bancada, [field]: value });
  };

  const handleRecorteChange = (recorte: string, count: number) => {
    onChange({
      ...bancada,
      recortes: { ...bancada.recortes, [recorte]: count },
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden mb-6 transition-all">
      <div className="flex items-center justify-between p-4 bg-stone-50 border-b border-stone-200">
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={bancada.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="font-serif text-xl font-medium bg-transparent border-none focus:ring-0 p-0 text-stone-800"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="h-10 w-10 flex items-center justify-center text-stone-500 hover:bg-stone-200 rounded-lg transition-colors"
          >
            {collapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </button>
          <button
            onClick={onRemove}
            className="h-10 w-10 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Form */}
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1">Tipo</label>
                <select
                  value={bancada.tipoBancada || "Seca"}
                  onChange={(e) => handleChange("tipoBancada", e.target.value)}
                  className="w-full h-10 px-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
                >
                  <option value="Seca">Seca</option>
                  <option value="Úmida">Úmida</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1">Comprimento (m)</label>
                <input
                  type="number"
                  step="0.01"
                  value={bancada.length}
                  onChange={(e) => handleChange("length", parseFloat(e.target.value) || 0)}
                  className="w-full h-10 px-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1">Profundidade (m)</label>
                <input
                  type="number"
                  step="0.01"
                  value={bancada.width}
                  onChange={(e) => handleChange("width", parseFloat(e.target.value) || 0)}
                  className="w-full h-10 px-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1">Material</label>
              <select
                value={bancada.material}
                onChange={(e) => handleChange("material", e.target.value)}
                className="w-full h-10 px-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
              >
                {Object.keys(MATERIAL_PRICES).map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1">Padrão</label>
                <select
                  value={bancada.pattern}
                  onChange={(e) => handleChange("pattern", e.target.value)}
                  className="w-full h-10 px-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
                >
                  {Object.keys(PATTERN_MULTIPLIERS).map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1">Espessura</label>
                <select
                  value={bancada.thickness}
                  onChange={(e) => handleChange("thickness", e.target.value)}
                  className="w-full h-10 px-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
                >
                  {Object.keys(THICKNESS_MULTIPLIERS).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border border-stone-200 rounded-lg p-4 bg-stone-50">
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  id={`saia-${bancada.id}`}
                  checked={bancada.saiaAtiva}
                  onChange={(e) => handleChange("saiaAtiva", e.target.checked)}
                  className="w-4 h-4 text-stone-800 border-stone-300 rounded focus:ring-stone-500"
                />
                <label htmlFor={`saia-${bancada.id}`} className="text-sm font-medium text-stone-700">
                  Saia
                </label>
              </div>
              
              {bancada.saiaAtiva && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1">Altura (cm)</label>
                    <input
                      type="number"
                      value={bancada.saiaAltura}
                      onChange={(e) => handleChange("saiaAltura", parseInt(e.target.value) || 0)}
                      className="w-full h-10 px-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-2">Acabamento de Borda</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {Object.keys(EDGE_PRICES).map((e) => {
                        const isSelected = bancada.bordaTipo === e;
                        return (
                          <button
                            key={e}
                            onClick={() => handleChange("bordaTipo", e)}
                            className={`flex flex-col items-center justify-center p-3 border rounded-xl transition-all ${
                              isSelected 
                                ? "border-stone-800 bg-stone-100 ring-1 ring-stone-800" 
                                : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50"
                            }`}
                          >
                            <EdgeIcon type={e} />
                            <span className={`text-xs mt-2 text-center ${isSelected ? "font-medium text-stone-900" : "text-stone-600"}`}>
                              {e}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="border border-stone-200 rounded-lg p-4 bg-stone-50">
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  id={`rodabanca-${bancada.id}`}
                  checked={bancada.rodabancaAtiva}
                  onChange={(e) => handleChange("rodabancaAtiva", e.target.checked)}
                  className="w-4 h-4 text-stone-800 border-stone-300 rounded focus:ring-stone-500"
                />
                <label htmlFor={`rodabanca-${bancada.id}`} className="text-sm font-medium text-stone-700">
                  Rodabanca
                </label>
              </div>
              
              {bancada.rodabancaAtiva && (
                <div>
                  <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1">Altura (cm)</label>
                  <input
                    type="number"
                    value={bancada.rodabancaHeight}
                    onChange={(e) => handleChange("rodabancaHeight", parseInt(e.target.value) || 0)}
                    className="w-full h-10 px-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
                  />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider">Cuba e Recortes</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const newCubas = [...(bancada.cubas || []), {
                        id: Math.random().toString(36).substring(7),
                        type: "Embutir",
                        shape: "Retangular" as const,
                        length: 0.5,
                        width: 0.4,
                        diameter: 0.4
                      }];
                      handleChange("cubas", newCubas);
                    }}
                    className="h-10 px-4 text-sm font-medium bg-stone-100 text-stone-700 hover:bg-stone-200 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <Plus size={16} /> Adicionar Cuba
                  </button>
                  <button
                    onClick={() => {
                      const newRecorte = { id: Math.random().toString(36).substring(7), type: "Cooktop", shape: "Retangular" as const, length: 0.6, width: 0.4, diameter: 0.4 };
                      handleChange("recortes", [...(bancada.recortes || []), newRecorte]);
                    }}
                    className="h-10 px-4 text-sm font-medium bg-stone-800 text-white hover:bg-stone-700 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <Plus size={16} /> Adicionar Recorte
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Cubas */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-stone-700">Cubas</label>
                  </div>
                  
                  {(bancada.cubas || []).length === 0 && (
                    <div className="text-sm text-stone-500 italic p-4 bg-stone-50 rounded-lg text-center border border-stone-200">
                      Nenhuma cuba adicionada.
                    </div>
                  )}

                  {(bancada.cubas || []).map((cuba, idx) => (
                    <div key={cuba.id} className="bg-stone-50 p-3 rounded-lg border border-stone-200 flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                          <select
                            value={cuba.type}
                            onChange={(e) => {
                              const newCubas = [...bancada.cubas];
                              newCubas[idx] = { ...cuba, type: e.target.value };
                              handleChange("cubas", newCubas);
                            }}
                            className="w-full h-10 px-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
                          >
                            {Object.keys(CUBA_PRICES).filter(c => c !== "Nenhuma").map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>

                          <select
                            value={cuba.shape}
                            onChange={(e) => {
                              const newCubas = [...bancada.cubas];
                              newCubas[idx] = { ...cuba, shape: e.target.value as "Retangular" | "Redondo" };
                              handleChange("cubas", newCubas);
                            }}
                            className="w-full h-10 px-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
                          >
                            <option value="Retangular">Retangular</option>
                            <option value="Redondo">Redondo</option>
                          </select>

                          {cuba.shape === "Redondo" ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-stone-500">Ø (cm):</span>
                              <input 
                                type="number" 
                                value={Math.round((cuba.diameter || 0.4) * 100)} 
                                onChange={(e) => {
                                  const newCubas = [...bancada.cubas];
                                  newCubas[idx] = { ...cuba, diameter: (parseInt(e.target.value) || 0) / 100 };
                                  handleChange("cubas", newCubas);
                                }} 
                                className="w-full px-2 py-1 border border-stone-300 rounded-md" 
                              />
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <div className="flex items-center gap-2 flex-1">
                                <span className="text-xs text-stone-500">C (cm):</span>
                                <input 
                                  type="number" 
                                  value={Math.round(cuba.length * 100)} 
                                  onChange={(e) => {
                                    const newCubas = [...bancada.cubas];
                                    newCubas[idx] = { ...cuba, length: (parseInt(e.target.value) || 0) / 100 };
                                    handleChange("cubas", newCubas);
                                  }} 
                                  className="w-full px-2 py-1 border border-stone-300 rounded-md" 
                                />
                              </div>
                              <div className="flex items-center gap-2 flex-1">
                                <span className="text-xs text-stone-500">L (cm):</span>
                                <input 
                                  type="number" 
                                  value={Math.round(cuba.width * 100)} 
                                  onChange={(e) => {
                                    const newCubas = [...bancada.cubas];
                                    newCubas[idx] = { ...cuba, width: (parseInt(e.target.value) || 0) / 100 };
                                    handleChange("cubas", newCubas);
                                  }} 
                                  className="w-full px-2 py-1 border border-stone-300 rounded-md" 
                                />
                              </div>
                            </div>
                          )}

                          {cuba.type === "Esculpida" ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-stone-500 w-16">Fundo:</span>
                              <select
                                value={cuba.fundo || "Reto"}
                                onChange={(e) => {
                                  const newCubas = [...bancada.cubas];
                                  newCubas[idx] = { ...cuba, fundo: e.target.value as "Reto" | "Inclinado" };
                                  handleChange("cubas", newCubas);
                                }}
                                className="w-full h-10 px-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
                              >
                                <option value="Reto">Reto</option>
                                <option value="Inclinado">Inclinado</option>
                              </select>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-stone-500 w-16">Material:</span>
                              <select
                                value={cuba.material || "Inox"}
                                onChange={(e) => {
                                  const newCubas = [...bancada.cubas];
                                  newCubas[idx] = { ...cuba, material: e.target.value };
                                  handleChange("cubas", newCubas);
                                }}
                                className="w-full h-10 px-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
                              >
                                <option value="Inox">Inox</option>
                                <option value="Louça">Louça</option>
                                <option value="Cerâmica">Cerâmica</option>
                              </select>
                            </div>
                          )}
                        </div>
                        <button onClick={() => {
                          const newCubas = bancada.cubas.filter((_, i) => i !== idx);
                          handleChange("cubas", newCubas);
                        }} className="text-red-500 hover:text-red-700 p-1 ml-2">
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Outros Recortes */}
                <div className="space-y-2">
                  {(bancada.recortes || []).map((r, idx) => {
                  const isAlwaysRound = r.type === "Torneira" || r.type === "Dosador";
                  const isRound = isAlwaysRound || r.shape === "Redondo";
                  
                  return (
                    <div key={r.id} className="bg-stone-50 p-3 rounded-lg border border-stone-200 flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                          <select
                            value={r.type}
                            onChange={(e) => {
                              const newRecortes = [...bancada.recortes];
                              newRecortes[idx].type = e.target.value;
                              if (e.target.value === "Torneira" || e.target.value === "Dosador") {
                                newRecortes[idx].shape = "Redondo";
                              }
                              handleChange("recortes", newRecortes);
                            }}
                            className="w-full h-10 px-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500 sm:col-span-2"
                          >
                            {Object.keys(RECORTE_PRICES).map(rp => <option key={rp} value={rp}>{rp}</option>)}
                          </select>
                          
                          {!isAlwaysRound ? (
                            <select
                              value={r.shape || "Retangular"}
                              onChange={(e) => {
                                const newRecortes = [...bancada.recortes];
                                newRecortes[idx].shape = e.target.value as "Retangular" | "Redondo";
                                handleChange("recortes", newRecortes);
                              }}
                              className="w-full h-10 px-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
                            >
                              <option value="Retangular">Retangular</option>
                              <option value="Redondo">Redondo</option>
                            </select>
                          ) : (
                            <div className="hidden sm:block"></div>
                          )}

                          {isRound ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-stone-500">Ø (cm):</span>
                              <input type="number" value={Math.round((r.diameter || 0.1) * 100)} onChange={(e) => {
                                const newRecortes = [...bancada.recortes];
                                newRecortes[idx].diameter = (parseInt(e.target.value) || 0) / 100;
                                handleChange("recortes", newRecortes);
                              }} className="w-full px-2 py-1 border border-stone-300 rounded-md" />
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <div className="flex items-center gap-2 flex-1">
                                <span className="text-xs text-stone-500">C (cm):</span>
                                <input type="number" value={Math.round(r.length * 100)} onChange={(e) => {
                                  const newRecortes = [...bancada.recortes];
                                  newRecortes[idx].length = (parseInt(e.target.value) || 0) / 100;
                                  handleChange("recortes", newRecortes);
                                }} className="w-full px-2 py-1 border border-stone-300 rounded-md" />
                              </div>
                              <div className="flex items-center gap-2 flex-1">
                                <span className="text-xs text-stone-500">L (cm):</span>
                                <input type="number" value={Math.round(r.width * 100)} onChange={(e) => {
                                  const newRecortes = [...bancada.recortes];
                                  newRecortes[idx].width = (parseInt(e.target.value) || 0) / 100;
                                  handleChange("recortes", newRecortes);
                                }} className="w-full px-2 py-1 border border-stone-300 rounded-md" />
                              </div>
                            </div>
                          )}
                        </div>
                        <button onClick={() => {
                          const newRecortes = bancada.recortes.filter((_, i) => i !== idx);
                          handleChange("recortes", newRecortes);
                        }} className="text-red-500 hover:text-red-700 p-1 ml-2">
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {(!bancada.recortes || bancada.recortes.length === 0) && (
                  <p className="text-xs text-stone-400 italic">Nenhum recorte adicionado.</p>
                )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`polishing-${bancada.id}`}
                  checked={bancada.polishing}
                  onChange={(e) => handleChange("polishing", e.target.checked)}
                  className="w-4 h-4 text-stone-800 border-stone-300 rounded focus:ring-stone-500"
                />
                <label htmlFor={`polishing-${bancada.id}`} className="text-sm text-stone-700">
                  Polimento Extra
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`impermeabilizacao-${bancada.id}`}
                  checked={bancada.impermeabilizacao}
                  onChange={(e) => handleChange("impermeabilizacao", e.target.checked)}
                  className="w-4 h-4 text-stone-800 border-stone-300 rounded focus:ring-stone-500"
                />
                <label htmlFor={`impermeabilizacao-${bancada.id}`} className="text-sm text-stone-700">
                  Impermeabilização
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Visualizer */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-medium text-stone-500 uppercase tracking-wider">Planta Baixa</h3>
            <PlantaBaixa bancada={bancada} onChange={onChange} />
          </div>
        </div>
      )}
    </div>
  );
}
