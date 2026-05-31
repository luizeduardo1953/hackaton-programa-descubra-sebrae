"use client";

import React, { useState } from 'react';
import { Quote, MessageSquare, Check, X, Star } from 'lucide-react';

export default function TecnicosDepoimentosPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const initialDepoimentos = [
    { id: 1, name: 'João Victor Souza Silva', role: 'Jovem Aprendiz (SEBRAE)', text: 'O Descubra mudou minha perspectiva de futuro. Graças ao curso do SENAI e à indicação do CREAS, consegui minha carteira assinada!', approved: true },
    { id: 2, name: 'Gabriela Alves Rezende', role: 'Curso de Auxiliar de Vendas', text: 'Eu não tinha esperanças de arrumar um trabalho digno em Pirapora. O programa abriu as portas e me deu apoio de transporte quando eu mais precisei.', approved: false },
    { id: 3, name: 'Ana Clara Santos Ferreira', role: 'Curso de Operador de Caixa', text: 'Estou aprendendo muito no SENAC! Meus pais apoiam muito e sinto que estou me tornando uma profissional qualificada.', approved: true }
  ];

  return (
    <div className="flex flex-col gap-6 animate-fadeIn relative">
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-600 shadow-xl text-white font-bold px-6 py-3.5 rounded-2xl text-xs flex items-center gap-2 animate-fadeIn">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Title */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-2">
        <h2 className="text-xl font-black text-slate-900">Depoimentos dos Jovens</h2>
        <p className="text-xs text-slate-400">Mensagens de sucesso e superação dos adolescentes cadastrados no programa.</p>
      </div>

      <div className="flex flex-col gap-4">
        {initialDepoimentos.map(dep => (
          <div key={dep.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-3 relative">
            <Quote className="absolute top-4 right-4 h-8 w-8 text-indigo-50/70" />
            
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-extrabold text-sm shrink-0">
                {dep.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-950">{dep.name}</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase">{dep.role}</p>
              </div>
            </div>

            <p className="text-xs text-slate-650 leading-relaxed font-semibold italic">
              &ldquo;{dep.text}&rdquo;
            </p>

            <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                dep.approved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {dep.approved ? 'Publicado no Portal' : 'Aguardando Moderação'}
              </span>

              {!dep.approved && (
                <button 
                  onClick={() => showToast('Depoimento homologado com sucesso!')}
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-3.5 py-1.5 rounded-xl text-xs font-black shadow-sm flex items-center gap-1 transition-all"
                >
                  <Check className="h-3.5 w-3.5" />
                  Aprovar Depoimento
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
