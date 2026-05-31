'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, AlertCircle, Clock, CheckCircle2, Phone, MessageSquare, XCircle, ShieldAlert } from 'lucide-react';
import { db } from '../../../lib/db';
import type { Youth } from '../../../lib/db';

interface Alert {
  id: string;
  jovemId: string;
  jovemNome: string;
  tipo: 'Crítico' | 'Atenção' | 'Resolvido';
  motivo: string;
  data: string;
  telefone: string;
}

const MOCK_ALERTAS: Alert[] = [
  { id: 'a1', jovemId: 'y2', jovemNome: 'Mariana Costa', tipo: 'Crítico', motivo: '3 faltas consecutivas no curso', data: '10/05/2026', telefone: '(38) 99999-1111' },
  { id: 'a2', jovemId: 'y1', jovemNome: 'João Silva', tipo: 'Atenção', motivo: 'Risco de evasão escolar reportado', data: '28/05/2026', telefone: '(38) 98888-2222' },
  { id: 'a3', jovemId: 'y3', jovemNome: 'Lucas Santos', tipo: 'Resolvido', motivo: 'Conflito no ambiente de trabalho', data: '01/05/2026', telefone: '(38) 97777-3333' },
];

export default function AlertasPage() {
  const [alertas, setAlertas] = useState<Alert[]>(MOCK_ALERTAS);
  const [filtro, setFiltro] = useState<'Todos' | 'Crítico' | 'Atenção' | 'Resolvido'>('Todos');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleResolve = (id: string) => {
    setAlertas(alertas.map(a => a.id === id ? { ...a, tipo: 'Resolvido' } : a));
    showToast('✅ Alerta marcado como resolvido!');
  };

  const filtered = alertas.filter(a => filtro === 'Todos' ? true : a.tipo === filtro);

  return (
    <div className="flex flex-col gap-6 animate-fadeIn pb-10">
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white shadow-2xl px-6 py-4 rounded-2xl text-sm font-bold flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="h-5 w-5" />
          {toastMessage}
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-slate-800 text-2xl font-black">Central de Alertas</h1>
            <p className="text-slate-500 text-sm mt-1">Acompanhamento e intervenção rápida para jovens em situação de risco ou evasão.</p>
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex gap-4">
          <div className="bg-rose-50 border border-rose-100 rounded-2xl px-4 py-3 text-center min-w-[100px]">
            <p className="text-3xl font-black text-rose-600 leading-none">{alertas.filter(a => a.tipo === 'Crítico').length}</p>
            <p className="text-[10px] uppercase font-bold text-rose-500 mt-1">Críticos</p>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 text-center min-w-[100px]">
            <p className="text-3xl font-black text-amber-600 leading-none">{alertas.filter(a => a.tipo === 'Atenção').length}</p>
            <p className="text-[10px] uppercase font-bold text-amber-500 mt-1">Atenção</p>
          </div>
        </div>
      </div>

      {/* ── FILTROS ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {['Todos', 'Crítico', 'Atenção', 'Resolvido'].map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f as any)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all shrink-0 ${
              filtro === f 
                ? 'bg-slate-800 text-white shadow-md' 
                : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* ── LISTA DE ALERTAS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((alerta, i) => (
          <div 
            key={alerta.id} 
            className={`bg-white border rounded-3xl p-5 flex flex-col gap-4 animate-fadeIn transition-all ${
              alerta.tipo === 'Crítico' ? 'border-rose-200 shadow-sm shadow-rose-100' :
              alerta.tipo === 'Atenção' ? 'border-amber-200 shadow-sm shadow-amber-100' :
              'border-slate-100 opacity-70'
            }`}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-xl shrink-0 ${
                  alerta.tipo === 'Crítico' ? 'bg-rose-100 text-rose-600' :
                  alerta.tipo === 'Atenção' ? 'bg-amber-100 text-amber-600' :
                  'bg-emerald-100 text-emerald-600'
                }`}>
                  {alerta.tipo === 'Resolvido' ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-slate-800">{alerta.jovemNome}</h3>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                      alerta.tipo === 'Crítico' ? 'bg-rose-100 text-rose-700' :
                      alerta.tipo === 'Atenção' ? 'bg-amber-100 text-amber-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {alerta.tipo}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-600 mt-1">{alerta.motivo}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 shrink-0">
                <Clock className="h-3 w-3" /> {alerta.data}
              </span>
            </div>

            <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button 
                  className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors" 
                  title="Ligar"
                  onClick={() => { const n = alerta.telefone.replace(/\D/g, ''); window.location.href = `tel:+55${n}`; }}
                >
                  <Phone className="h-4 w-4" />
                </button>
                <button 
                  className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors" 
                  title="WhatsApp"
                  onClick={() => { const n = alerta.telefone.replace(/\D/g, ''); window.open(`https://wa.me/55${n}`, '_blank'); }}
                >
                  <MessageSquare className="h-4 w-4" />
                </button>
                <span className="text-xs font-bold text-slate-500 ml-1">{alerta.telefone}</span>
              </div>
              
              {alerta.tipo !== 'Resolvido' && (
                <button 
                  onClick={() => handleResolve(alerta.id)}
                  className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-black transition-all active:scale-95 flex items-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" /> Marcar Resolvido
                </button>
              )}
            </div>
          </div>
        ))}
        
        {filtered.length === 0 && (
          <div className="lg:col-span-2 bg-slate-50 border border-slate-200 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-400 mb-3" />
            <p className="text-slate-500 font-bold text-sm">Nenhum alerta {filtro.toLowerCase()} encontrado</p>
            <p className="text-slate-400 text-xs font-semibold mt-1">Tudo sob controle por aqui.</p>
          </div>
        )}
      </div>

    </div>
  );
}
