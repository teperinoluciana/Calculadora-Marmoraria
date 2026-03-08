"use client";

import React, { useEffect, useState } from "react";
import { Users, Download } from "lucide-react";

interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  marmoraria_interest: number;
  created_at: string;
}

export default function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leads")
      .then((res) => res.json())
      .then((data) => {
        if (data.leads) {
          setLeads(data.leads);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch leads", err);
        setIsLoading(false);
      });
  }, []);

  const downloadCSV = () => {
    if (leads.length === 0) return;
    
    const headers = ["ID", "Nome", "E-mail", "Telefone", "Atuação", "Interesse Parceiro", "Data de Cadastro"];
    const csvContent = [
      headers.join(","),
      ...leads.map(lead => [
        lead.id,
        `"${lead.name}"`,
        `"${lead.email}"`,
        `"${lead.phone}"`,
        `"${lead.role}"`,
        `"${lead.marmoraria_interest ? 'Sim' : 'Não'}"`,
        `"${new Date(lead.created_at).toLocaleString('pt-BR')}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `archhub_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-stone-900 text-white rounded-lg flex items-center justify-center">
              <Users size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-semibold tracking-tight">Leads Capturados</h1>
              <p className="text-sm text-stone-500">Gerencie os usuários cadastrados no simulador</p>
            </div>
          </div>
          
          <button 
            onClick={downloadCSV}
            disabled={leads.length === 0}
            className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-800 disabled:opacity-50 transition-colors"
          >
            <Download size={16} />
            Exportar CSV
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-stone-500">Carregando leads...</div>
          ) : leads.length === 0 ? (
            <div className="p-12 text-center text-stone-500">Nenhum lead cadastrado ainda.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600">
                  <tr>
                    <th className="px-6 py-4 font-medium">Nome</th>
                    <th className="px-6 py-4 font-medium">E-mail</th>
                    <th className="px-6 py-4 font-medium">Telefone</th>
                    <th className="px-6 py-4 font-medium">Atuação</th>
                    <th className="px-6 py-4 font-medium">Interesse Parceiro</th>
                    <th className="px-6 py-4 font-medium">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-stone-900">{lead.name}</td>
                      <td className="px-6 py-4 text-stone-600">{lead.email}</td>
                      <td className="px-6 py-4 text-stone-600">{lead.phone}</td>
                      <td className="px-6 py-4 text-stone-600">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-800">
                          {lead.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-stone-600">
                        {lead.role === 'Marmoraria' ? (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${lead.marmoraria_interest ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-500'}`}>
                            {lead.marmoraria_interest ? 'Sim' : 'Não'}
                          </span>
                        ) : (
                          <span className="text-stone-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-stone-500">
                        {new Date(lead.created_at).toLocaleString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
