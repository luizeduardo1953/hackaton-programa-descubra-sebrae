"use client";

import React, { useState } from 'react';
import { Quote, MessageSquare } from 'lucide-react';

export default function JovemDepoimentosPage() {
  const [text, setText] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    showToast('🎉 Depoimento enviado para moderação dos técnicos com sucesso!');
    setText('');
  };

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
        <h2 className="text-xl font-black text-slate-900">Seu Depoimento de Superação</h2>
        <p className="text-xs text-slate-400">Escreva sua história de evolução dentro do programa Descubra para inspirar outros jovens!</p>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4">
        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-indigo-600" />
          Como o programa está mudando sua vida?
        </h3>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-extrabold text-slate-500 uppercase">Escreva sua História *</label>
          <textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            placeholder="Conte-nos o curso que está fazendo, seu primeiro dia de aula, se conseguiu emprego, e agradeça aos técnicos que te apoiaram..."
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 focus:outline-indigo-500 h-32 resize-none"
          />
        </div>

        <button 
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-xs font-black shadow-md transition-colors"
        >
          Enviar Histórico de Sucesso
        </button>
      </form>

    </div>
  );
}
