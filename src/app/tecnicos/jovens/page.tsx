"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Users, RefreshCw } from 'lucide-react';
import { db } from '../../../lib/db';
import type { Youth } from '../../../lib/db';

export default function TecnicosJovensPage() {
  const [youthList, setYouthList] = useState<Youth[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [yearFilter, setYearFilter] = useState('todos');
  
  // Advanced filters state
  const [sexoFilter, setSexoFilter] = useState('todos');
  const [unidadeFilter, setUnidadeFilter] = useState('todos');
  const [formadoraFilter, setFormadoraFilter] = useState('todos');
  const [unidadesList, setUnidadesList] = useState<any[]>([]);
  
  // Bulk actions selection
  const [selectedForReindication, setSelectedForReindication] = useState<string[]>([]);
  const [reindicationYear, setReindicationYear] = useState<number>(2026);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    syncData();
    setUnidadesList(db.getUnidades());
  }, []);

  const syncData = () => {
    setYouthList(db.getYouthList());
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Re-indication handler
  const handleBulkReindication = () => {
    if (selectedForReindication.length === 0) return;
    db.reindicateYouth(selectedForReindication, reindicationYear);
    syncData();
    setSelectedForReindication([]);
    showToast(`${selectedForReindication.length} jovens indicados com sucesso para a série ${reindicationYear}!`);
  };

  // Filter and prioritize (vulnerability sorting!)
  const filteredYouth = youthList.filter(y => {
    const matchesSearch = y.nome_completo.toLowerCase().includes(searchQuery.toLowerCase()) || y.cpf.includes(searchQuery);
    const matchesStatus = statusFilter === 'todos' || y.status_atual === statusFilter;
    const matchesYear = yearFilter === 'todos' || y.ano_indicacao.toString() === yearFilter;
    
    const matchesSexo = sexoFilter === 'todos' || y.sexo === sexoFilter;
    const matchesUnidade = unidadeFilter === 'todos' || y.indicado_por_unidade === unidadeFilter;
    const matchesFormadora = formadoraFilter === 'todos' || y.indicado_por_unidade === formadoraFilter;

    return matchesSearch && matchesStatus && matchesYear && matchesSexo && matchesUnidade && matchesFormadora;
  }).sort((a, b) => b.score_vulnerabilidade - a.score_vulnerabilidade);

  return (
    <div className="flex flex-col gap-6 animate-fadeIn relative">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-600 shadow-xl text-white font-bold px-6 py-3.5 rounded-2xl text-xs flex items-center gap-2 animate-fadeIn">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Title */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-2">
        <h2 className="text-xl font-black text-slate-900">Fila de Prioridade Inteligente</h2>
        <p className="text-xs text-slate-400">Jovens ordenados pelo cálculo automatizado de vulnerabilidade. Selecione e re-indique em lote.</p>
      </div>

      {/* Filters Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col md:flex-row items-stretch justify-between gap-4">
          
          {/* Search Input */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl flex items-center px-4 py-2.5 flex-1 gap-2 shadow-inner">
            <Search className="h-5 w-5 text-slate-400 shrink-0" />
            <input 
              type="text" 
              placeholder="Buscar jovens por nome ou CPF..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent focus:outline-none text-sm w-full text-slate-800 font-semibold"
            />
          </div>

          {/* Year Filter */}
          <select 
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-700 focus:outline-indigo-500"
          >
            <option value="todos">Séries: Todas</option>
            <option value="2026">Série 2026 (Atual)</option>
            <option value="2025">Série 2025</option>
            <option value="2024">Série 2024</option>
          </select>

          {/* Sexo Filter */}
          <select 
            value={sexoFilter}
            onChange={(e) => setSexoFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-700 focus:outline-indigo-500"
          >
            <option value="todos">Sexo: Todos</option>
            <option value="F">Feminino</option>
            <option value="M">Masculino</option>
            <option value="Outro">Outro</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-3">
          {/* Unidade de Referência Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Unidade de Referência (CRAS/CREAS)</label>
            <select 
              value={unidadeFilter}
              onChange={(e) => setUnidadeFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-700 focus:outline-indigo-500 w-full cursor-pointer"
            >
              <option value="todos">Todas as Unidades</option>
              {unidadesList.filter(u => u.tipo !== 'CECEP').map(u => (
                <option key={u.id} value={u.id}>{u.nome} ({u.tipo})</option>
              ))}
            </select>
          </div>

          {/* Entidade Formadora Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Entidade Formadora (CECEP/Ensino)</label>
            <select 
              value={formadoraFilter}
              onChange={(e) => setFormadoraFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-700 focus:outline-indigo-500 w-full cursor-pointer"
            >
              <option value="todos">Todas as Entidades Formadoras</option>
              {unidadesList.filter(u => u.tipo === 'CECEP').map(u => (
                <option key={u.id} value={u.id}>{u.nome}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[10px] font-black uppercase text-slate-400">Filtrar Status:</span>
          {['todos', 'Pendente', 'Em Curso', 'Alerta', 'Evadido', 'Concluído', 'Contratado'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`text-xs font-black px-3.5 py-1.5 rounded-full transition-all ${
                statusFilter === st ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'todos' ? 'Ver Todos' : st}
            </button>
          ))}
        </div>
      </div>

      {/* BULK RE-INDICATION FLOATING WIDGET (BOTTLENECK SOLVER) */}
      {selectedForReindication.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white h-10 w-10 rounded-xl flex items-center justify-center font-black shadow-md">
              {selectedForReindication.length}
            </div>
            <div>
              <h4 className="text-sm font-black text-indigo-950">Jovens Prontos para Re-indicação</h4>
              <p className="text-xs text-indigo-700">Selecione o ano da nova série e faça a indicação automática em lote.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select 
              value={reindicationYear}
              onChange={(e) => setReindicationYear(parseInt(e.target.value))}
              className="bg-white border border-indigo-200 rounded-xl px-3 py-2 text-xs font-black text-slate-700 focus:outline-indigo-500"
            >
              <option value={2026}>Série 2026</option>
              <option value={2027}>Série 2027</option>
            </select>
            
            <button 
              onClick={handleBulkReindication}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-md transition-colors"
            >
              Re-indicar em 1 Clique!
            </button>
          </div>
        </div>
      )}

      {/* PRIORITY TABLE LIST */}
      <div className="bg-white border border-slate-150 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
              <th className="py-3 px-4 w-12 text-center">
                <input 
                  type="checkbox"
                  checked={selectedForReindication.length === filteredYouth.filter(y => y.ano_indicacao !== 2026).length && filteredYouth.filter(y => y.ano_indicacao !== 2026).length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedForReindication(filteredYouth.filter(y => y.ano_indicacao !== 2026).map(y => y.id));
                    } else {
                      setSelectedForReindication([]);
                    }
                  }}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
              </th>
              <th className="py-3 px-4">Posição / Jovem</th>
              <th className="py-3 px-4 text-center">Score Fila</th>
              <th className="py-3 px-4">Bairro</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Ano</th>
              <th className="py-3 px-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredYouth.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-400">
                  <Users className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-semibold">Nenhum jovem encontrado com os filtros atuais.</p>
                </td>
              </tr>
            ) : (
              filteredYouth.map((y, idx) => (
                <tr 
                  key={y.id} 
                  className={`hover:bg-slate-50/50 transition-colors ${
                    y.status_atual === 'Alerta' ? 'bg-amber-50/20' : ''
                  }`}
                >
                  <td className="py-3.5 px-4 text-center">
                    {y.ano_indicacao !== 2026 ? (
                      <input 
                        type="checkbox"
                        checked={selectedForReindication.includes(y.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedForReindication(prev => [...prev, y.id]);
                          } else {
                            setSelectedForReindication(prev => prev.filter(id => id !== y.id));
                          }
                        }}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    ) : (
                      <span className="text-[10px] text-slate-300 font-extrabold">-</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center ${
                        idx === 0 ? 'bg-amber-500 text-slate-950 font-black' : 
                        idx === 1 ? 'bg-slate-300 text-slate-900' :
                        idx === 2 ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {idx + 1}
                      </span>
                      <div>
                        <p className="text-sm font-black text-slate-900">{y.nome_completo}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-[10px] text-slate-400 font-semibold">CPF: {y.cpf}</p>
                          {y.area_interesse && (
                            <span className="text-[9px] font-black bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded border border-indigo-100/60 leading-none">
                              🎯 {y.area_interesse === 'Outros' ? (y.outra_area_interesse || 'Outros') : y.area_interesse}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`text-xs font-black px-2.5 py-1 rounded-xl border ${
                      y.score_vulnerabilidade >= 9 ? 'bg-rose-50 text-rose-700 border-rose-200' :
                      y.score_vulnerabilidade >= 5 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {y.score_vulnerabilidade} pts
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-xs font-bold text-slate-600">
                    {y.bairro}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      y.status_atual === 'Contratado' ? 'bg-emerald-100 text-emerald-800' :
                      y.status_atual === 'Concluído' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      y.status_atual === 'Em Curso' ? 'bg-blue-100 text-blue-800' :
                      y.status_atual === 'Alerta' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                      y.status_atual === 'Evadido' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-800'
                    }`}>
                      {y.status_atual}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-xs font-bold text-slate-500">
                    {y.ano_indicacao}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <Link 
                      href={`/tecnicos/jovens/${y.id}`}
                      className="bg-slate-100 hover:bg-indigo-600 hover:text-white px-3.5 py-1.5 rounded-xl text-xs font-black text-slate-700 shadow-sm transition-all inline-block"
                    >
                      Acompanhar / Prontuário
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
