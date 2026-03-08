"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Bancada, defaultBancada, calcBancada, STATE_MULTIPLIERS } from "@/lib/pricing";
import BancadaCard from "@/components/BancadaCard";
import PlantaBaixa from "@/components/PlantaBaixa";
import ComposicaoGeral from "@/components/ComposicaoGeral";
import { Plus, FileText, Calculator, X, ArrowRight, ShieldCheck } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function Home() {
  const [bancadas, setBancadas] = useState<Bancada[]>([{ ...defaultBancada(), id: "initial-1" }]);
  const [state, setState] = useState<string>("SP");
  const [currentDate, setCurrentDate] = useState<string>("");
  const printRef = useRef<HTMLDivElement>(null);
  
  // Lead Capture State
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Arquiteto(a)",
    marmoraria_interest: false,
  });

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString("pt-BR"));
    const user = localStorage.getItem("archhub_user");
    if (user) {
      setIsRegistered(true);
    }
  }, []);

  const addBancada = () => {
    setBancadas([
      ...bancadas,
      { ...defaultBancada(), id: Math.random().toString(36).substring(7), name: `Bancada ${bancadas.length + 1}` },
    ]);
  };

  const updateBancada = (updated: Bancada) => {
    setBancadas(bancadas.map((b) => (b.id === updated.id ? updated : b)));
  };

  const removeBancada = (id: string) => {
    setBancadas(bancadas.filter((b) => b.id !== id));
  };

  const totals = useMemo(() => {
    return bancadas.map((b) => calcBancada(b, state));
  }, [bancadas, state]);

  const grandTotal = totals.reduce((acc, curr) => acc + curr.total, 0);

  const handlePrintRequest = () => {
    if (isRegistered) {
      generatePDF();
    } else {
      setIsLeadModalOpen(true);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error('Failed to save lead');
      }

      localStorage.setItem("archhub_user", JSON.stringify(formData));
      setIsRegistered(true);
      setIsLeadModalOpen(false);
      // Optional: generatePDF() here if they clicked "Gerar PDF", but we can just let them see the prices first.
    } catch (error) {
      console.error("Error saving lead:", error);
      alert("Ocorreu um erro ao realizar o cadastro. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const generatePDF = async () => {
    if (!printRef.current) return;
    
    const element = printRef.current;
    
    // Temporarily make it visible for html2canvas
    const originalDisplay = element.style.display;
    element.style.display = "block";
    element.classList.remove("hidden");
    
    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Orcamento_ArchHub_${currentDate.replace(/\//g, "-")}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      // Restore original display
      element.style.display = originalDisplay;
      element.classList.add("hidden");
    }
  };

  const [activeTab, setActiveTab] = useState<"bancadas" | "composicao">("bancadas");

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 font-sans pb-24">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10 print:hidden">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-stone-900 text-white rounded-lg flex items-center justify-center">
              <Calculator size={24} />
            </div>
            <div>
              <h1 className="text-xl font-serif font-semibold tracking-tight">ArchHub Marmoraria</h1>
              <p className="text-xs text-stone-500 uppercase tracking-wider">Estimador de Orçamento</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="h-10 px-3 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-stone-500"
            >
              {Object.keys(STATE_MULTIPLIERS).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button
              onClick={handlePrintRequest}
              className="h-10 flex items-center justify-center gap-2 bg-stone-900 text-white px-4 rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors"
            >
              <FileText size={16} />
              Gerar PDF
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="mb-12 max-w-3xl print:hidden">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-200/50 border border-stone-300 text-stone-700 text-xs font-medium uppercase tracking-wider mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Novo Simulador 2026
          </div>
          <h1 className="text-4xl lg:text-5xl font-serif font-medium leading-[1.1] tracking-tight text-stone-900 mb-6">
            Orçamentos de marmoraria em <span className="italic text-stone-500">minutos</span>, não em dias.
          </h1>
          <p className="text-lg text-stone-600 leading-relaxed">
            A primeira calculadora paramétrica do Brasil para arquitetos e designers. 
            Desenhe a planta baixa, escolha os acabamentos e tenha a estimativa de custo em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-4 mb-8 border-b border-stone-200 pb-4 print:hidden">
          <button
            onClick={() => setActiveTab("bancadas")}
            className={`h-10 flex items-center justify-center px-4 rounded-lg text-sm font-medium transition-colors ${activeTab === "bancadas" ? "bg-stone-900 text-white" : "bg-white text-stone-600 hover:bg-stone-200 border border-stone-200"}`}
          >
            Itens do Projeto
          </button>
          <button
            onClick={() => setActiveTab("composicao")}
            className={`h-10 flex items-center justify-center px-4 rounded-lg text-sm font-medium transition-colors ${activeTab === "composicao" ? "bg-stone-900 text-white" : "bg-white text-stone-600 hover:bg-stone-200 border border-stone-200"}`}
          >
            Composição Geral
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left: Content Area */}
          <div className="xl:col-span-2 space-y-6">
            {activeTab === "bancadas" ? (
              <>
                <div className="flex items-center justify-between mb-2 print:hidden">
                  <h2 className="text-lg font-medium text-stone-800">Itens do Projeto</h2>
                  <button
                    onClick={addBancada}
                    className="h-10 flex items-center justify-center gap-2 bg-stone-100 text-stone-700 px-4 rounded-lg text-sm font-medium hover:bg-stone-200 transition-colors"
                  >
                    <Plus size={16} />
                    Adicionar Bancada
                  </button>
                </div>

                {bancadas.map((bancada, index) => (
                  <BancadaCard
                    key={bancada.id}
                    bancada={bancada}
                    onChange={updateBancada}
                    onRemove={() => removeBancada(bancada.id)}
                  />
                ))}

                {bancadas.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 border-dashed">
                    <p className="text-stone-500 mb-4">Nenhuma bancada adicionada.</p>
                    <button
                      onClick={addBancada}
                      className="h-10 inline-flex items-center justify-center gap-2 bg-stone-900 text-white px-4 rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors"
                    >
                      <Plus size={16} />
                      Adicionar Primeira Bancada
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
                <h2 className="text-lg font-medium text-stone-800 mb-4">Composição Geral</h2>
                <p className="text-sm text-stone-500 mb-6">Arraste e rotacione as bancadas para visualizar a composição final do projeto.</p>
                <ComposicaoGeral bancadas={bancadas} onChange={setBancadas} />
              </div>
            )}
          </div>

          {/* Right: Summary */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 sticky top-24">
              <h2 className="text-lg font-medium text-stone-800 mb-6 font-serif">Resumo do Orçamento</h2>
              
              <div className="space-y-4 mb-6">
                {bancadas.map((b, i) => (
                  <div key={b.id} className="flex justify-between items-center text-sm">
                    <span className="text-stone-600 truncate pr-4">{b.name}</span>
                    <span className="font-medium text-stone-900">
                      {isRegistered ? (
                        `R$ ${totals[i].total.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      ) : (
                        <span className="text-stone-400 blur-[4px] select-none">R$ 0.000,00</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-stone-200">
                <div className="flex justify-between items-end mb-6">
                  <span className="text-sm font-medium text-stone-500 uppercase tracking-wider">Total Estimado</span>
                  <span className="text-3xl font-serif font-semibold text-stone-900">
                    {isRegistered ? (
                      `R$ ${grandTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    ) : (
                      <span className="text-stone-300 blur-[6px] select-none">R$ 00.000,00</span>
                    )}
                  </span>
                </div>
                
                {!isRegistered ? (
                  <button
                    onClick={() => setIsLeadModalOpen(true)}
                    className="w-full h-12 bg-stone-900 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-stone-800 transition-colors shadow-lg shadow-stone-900/20"
                  >
                    <Calculator size={18} />
                    Ver Orçamento Completo
                  </button>
                ) : (
                  <p className="text-xs text-stone-400 text-right">
                    * Valores sujeitos a alteração após medição no local.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Print-only View */}
      <div ref={printRef} className="hidden print:block p-8 bg-[#ffffff] text-[#000000]">
        <div className="border-b-2 border-[#000000] pb-4 mb-8">
          <h1 className="text-3xl font-serif font-bold">ArchHub Marmoraria</h1>
          <p className="text-sm text-[#4b5563]">Orçamento Estimativo - {currentDate}</p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Resumo</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#d1d5db]">
                <th className="py-2">Item</th>
                <th className="py-2">Material</th>
                <th className="py-2 text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {bancadas.map((b, i) => (
                <tr key={b.id} className="border-b border-[#f3f4f6]">
                  <td className="py-2">{b.name}</td>
                  <td className="py-2 text-sm text-[#4b5563]">{b.material} ({b.pattern})</td>
                  <td className="py-2 text-right font-medium">
                    R$ {totals[i].total.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2} className="py-4 text-right font-bold text-lg">Total Estimado:</td>
                <td className="py-4 text-right font-bold text-lg">
                  R$ {grandTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="space-y-8">
          <h2 className="text-xl font-bold border-b border-[#e5e7eb] pb-2">Detalhamento por Item</h2>
          {bancadas.map((b, i) => (
            <div key={b.id} className="break-inside-avoid border border-[#e5e7eb] p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-2">{b.name}</h3>
              <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                <div>
                  <p><span className="font-medium">Tipo:</span> {b.tipoBancada || "Seca"}</p>
                  <p><span className="font-medium">Dimensões:</span> {b.length}m x {b.width}m</p>
                  <p><span className="font-medium">Material:</span> {b.material}</p>
                  <p><span className="font-medium">Padrão:</span> {b.pattern}</p>
                  <p><span className="font-medium">Espessura:</span> {b.thickness}</p>
                  <p><span className="font-medium">Paredes:</span> {b.paredeLados.length > 0 ? b.paredeLados.join(", ") : "Nenhuma"}</p>
                </div>
                <div>
                  <p><span className="font-medium">Saia:</span> {b.saiaAtiva ? `${b.saiaAltura}cm` : "Nenhuma"}</p>
                  <p><span className="font-medium">Rodabanca:</span> {b.rodabancaAtiva ? `${b.rodabancaHeight}cm (${b.rodabancaLados.length > 0 ? b.rodabancaLados.join(", ") : "Nenhuma"})` : "Nenhuma"}</p>
                  <p><span className="font-medium">Borda:</span> {b.bordaTipo} ({b.bordaLados.length > 0 ? b.bordaLados.join(", ") : "Nenhuma"})</p>
                  <p><span className="font-medium">Cubas:</span> {b.cubas && b.cubas.length > 0 ? b.cubas.map(c => `${c.type} (${c.shape === "Redondo" ? `Ø ${Math.round((c.diameter || 0.4)*100)}cm` : `${Math.round((c.length || 0.5)*100)}x${Math.round((c.width || 0.4)*100)}cm`})`).join(", ") : "Nenhuma"}</p>
                  <p><span className="font-medium">Recortes:</span> {b.recortes && b.recortes.length > 0 ? b.recortes.map(r => {
                    const isAlwaysRound = r.type === "Torneira" || r.type === "Dosador";
                    const isRound = isAlwaysRound || r.shape === "Redondo";
                    return `${r.type} (${isRound ? `Ø ${Math.round((r.diameter || 0.1)*100)}cm` : `${Math.round(r.length*100)}x${Math.round(r.width*100)}cm`})`;
                  }).join(", ") : "Nenhum"}</p>
                </div>
              </div>
              <div className="border-t border-[#e5e7eb] pt-4">
                <h4 className="font-medium text-sm mb-2 text-[#4b5563]">Planta Baixa</h4>
                <div className="flex justify-center">
                  <div className="transform scale-[0.8] origin-top">
                    <PlantaBaixa bancada={b} onChange={() => {}} printMode={true} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lead Capture Modal */}
      {isLeadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsLeadModalOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-serif font-medium text-stone-900 mb-2">Quase lá!</h2>
                <p className="text-stone-500 text-sm">
                  Preencha seus dados para gerar o PDF detalhado do seu projeto e liberar acesso completo.
                </p>
              </div>

              <form onSubmit={handleLeadSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-1.5">Nome completo</label>
                  <input 
                    type="text" 
                    id="name"
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full h-11 px-4 rounded-lg border border-stone-300 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-stone-900 focus:border-stone-900 outline-none transition-all"
                    placeholder="João Silva"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1.5">E-mail profissional</label>
                  <input 
                    type="email" 
                    id="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full h-11 px-4 rounded-lg border border-stone-300 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-stone-900 focus:border-stone-900 outline-none transition-all"
                    placeholder="joao@arquitetura.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-stone-700 mb-1.5">WhatsApp</label>
                    <input 
                      type="tel" 
                      id="phone"
                      required
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full h-11 px-4 rounded-lg border border-stone-300 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-stone-900 focus:border-stone-900 outline-none transition-all"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-stone-700 mb-1.5">Atuação</label>
                    <select 
                      id="role"
                      value={formData.role}
                      onChange={e => setFormData({...formData, role: e.target.value})}
                      className="w-full h-11 px-4 rounded-lg border border-stone-300 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-stone-900 focus:border-stone-900 outline-none transition-all"
                    >
                      <option>Arquiteto(a)</option>
                      <option>Designer de Interiores</option>
                      <option>Cliente Final</option>
                      <option>Marmoraria</option>
                    </select>
                  </div>
                </div>

                {formData.role === "Marmoraria" && (
                  <div className="bg-stone-100 p-4 rounded-lg border border-stone-200 mt-4 animate-in fade-in slide-in-from-top-2">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.marmoraria_interest}
                        onChange={e => setFormData({...formData, marmoraria_interest: e.target.checked})}
                        className="mt-1 w-4 h-4 text-stone-900 rounded border-stone-300 focus:ring-stone-900"
                      />
                      <span className="text-sm text-stone-700">
                        <span className="font-medium block mb-0.5">Deseja ser um parceiro ArchHub?</span>
                        Gostaria de ter seus orçamentos acessíveis na maior plataforma para arquitetos e designers do Brasil?
                      </span>
                    </label>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 mt-2 bg-stone-900 hover:bg-stone-800 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <>
                      Liberar Orçamento <ArrowRight size={18} />
                    </>
                  )}
                </button>
                
                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-stone-500">
                  <ShieldCheck size={14} />
                  <span>Seus dados estão seguros e não enviamos spam.</span>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
