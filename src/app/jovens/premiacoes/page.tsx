'use client';

import React, { useState, useEffect } from 'react';
import { Gift, Zap, ShoppingBag, CheckCircle2, Ticket, Headphones, Book, Monitor, Trophy } from 'lucide-react';
import { db } from '../../../lib/db';
import type { Youth } from '../../../lib/db';

const REWARDS = [
  { id: 'r1', title: 'Kit Material Escolar',     desc: 'Mochila, cadernos, canetas e estojo.',         pts: 500, icon: ShoppingBag, color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-200' },
  { id: 'r2', title: 'Vale Livro (R$ 50)',      desc: 'Vale compras na rede de livrarias parceiras.',pts: 800, icon: Book,        color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' },
  { id: 'r3', title: 'Ingresso de Cinema',      desc: 'Par de ingressos com pipoca e refrigerante.', pts: 1000,icon: Ticket,      color: 'text-rose-600',   bg: 'bg-rose-50 border-rose-200' },
  { id: 'r4', title: 'Fone de Ouvido Bluetooth',desc: 'Fone de ouvido sem fio de alta qualidade.',   pts: 2000,icon: Headphones,  color: 'text-emerald-600',bg: 'bg-emerald-50 border-emerald-200' },
  { id: 'r5', title: 'Curso de Idiomas (1 Ano)',desc: 'Bolsa 100% de Inglês ou Espanhol.',           pts: 5000,icon: Monitor,     color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
  { id: 'r6', title: 'Mentoria com CEO',        desc: 'Sessão de mentoria de carreira exclusiva.',    pts: 10000,icon: Trophy,    color: 'text-amber-600',  bg: 'bg-amber-50 border-amber-200' },
];

export default function PremiacoesPage() {
  const [jovem, setJovem] = useState<Youth | null>(null);
  const [pontos, setPontos] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const list = db.getYouthList();
    const j = list.find(y => y.id === 'y3') || list[0];
    if (j) {
      setJovem(j);
      setPontos(j.pontos_gamificacao);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleRedeem = (reward: typeof REWARDS[0]) => {
    if (pontos >= reward.pts) {
      setPontos(prev => prev - reward.pts);
      showToast(`🎉 Resgate solicitado com sucesso: ${reward.title}! O suporte entrará em contato.`);
    }
  };

  if (!jovem) return null;

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-10">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white shadow-2xl px-6 py-4 rounded-2xl text-sm font-bold flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="h-5 w-5" />
          {toastMessage}
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 animate-fadeIn">
        <div className="flex items-center gap-4">
          <div className="bg-amber-100 text-amber-600 p-4 rounded-2xl">
            <Gift className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-slate-800 text-2xl font-black">Loja de Recompensas</h1>
            <p className="text-slate-500 text-sm mt-1">Troque seus "Descubra Points" por prêmios incríveis!</p>
          </div>
        </div>
        
        {/* User Balance */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shrink-0 min-w-[200px] justify-center shadow-inner">
          <div className="bg-amber-100 p-2 rounded-full">
            <Zap className="h-6 w-6 text-amber-500 fill-amber-500" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Seu Saldo</p>
            <p className="text-3xl font-black text-slate-800 leading-none">{pontos.toLocaleString('pt-BR')} <span className="text-sm font-bold text-slate-500">pts</span></p>
          </div>
        </div>
      </div>

      {/* ── REWARDS GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
        {REWARDS.map((reward, i) => {
          const canAfford = pontos >= reward.pts;
          const progress = Math.min((pontos / reward.pts) * 100, 100);

          return (
            <div 
              key={reward.id} 
              className={`bg-white border rounded-3xl p-6 flex flex-col gap-4 animate-fadeIn transition-all duration-300 ${
                canAfford ? 'border-emerald-200 hover:shadow-lg hover:border-emerald-300' : 'border-slate-200 opacity-90'
              }`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {/* Card Header (Icon & Title) */}
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl shrink-0 ${reward.bg} ${reward.color}`}>
                  <reward.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800 leading-tight">{reward.title}</h3>
                  <p className="text-xs font-semibold text-slate-500 mt-1">{reward.desc}</p>
                </div>
              </div>

              {/* Price & Progress */}
              <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Valor:</span>
                  <span className={`text-base font-black flex items-center gap-1 ${canAfford ? 'text-emerald-600' : 'text-slate-700'}`}>
                    <Zap className={`h-4 w-4 ${canAfford ? 'fill-emerald-600 text-emerald-600' : 'fill-slate-400 text-slate-400'}`} />
                    {reward.pts.toLocaleString('pt-BR')} pts
                  </span>
                </div>
                
                {/* Progress Bar (if cannot afford) */}
                {!canAfford && (
                  <div className="flex flex-col gap-1.5">
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-400 rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-[10px] text-center text-slate-400 font-bold">
                      Faltam {(reward.pts - pontos).toLocaleString('pt-BR')} pts
                    </p>
                  </div>
                )}
                
                {/* Redeem Button */}
                <button
                  onClick={() => handleRedeem(reward)}
                  disabled={!canAfford}
                  className={`w-full py-3 rounded-xl text-sm font-black transition-all ${
                    canAfford 
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-md shadow-emerald-500/20 active:scale-95' 
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {canAfford ? 'Resgatar Prêmio' : 'Pontos Insuficientes'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
