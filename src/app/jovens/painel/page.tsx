'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Zap, Trophy, Star, Target, BookOpen, Users, Briefcase,
  CheckCircle2, Clock, Gift, TrendingUp, ArrowRight, Flame, Shield
} from 'lucide-react';
import { db } from '../../../lib/db';
import type { Youth } from '../../../lib/db';

function getTier(pontos: number) {
  if (pontos >= 1000) return { label: 'Diamante', emoji: '💎', gradient: 'from-cyan-500 to-blue-600',    ring: 'ring-cyan-400/40'   };
  if (pontos >= 500)  return { label: 'Ouro',     emoji: '🥇', gradient: 'from-yellow-400 to-amber-500', ring: 'ring-yellow-400/40' };
  if (pontos >= 200)  return { label: 'Prata',    emoji: '🥈', gradient: 'from-slate-400 to-slate-500',  ring: 'ring-slate-300/40'  };
  return                     { label: 'Bronze',   emoji: '🥉', gradient: 'from-orange-500 to-amber-600', ring: 'ring-orange-400/40' };
}

function getNextTierInfo(pontos: number) {
  if (pontos >= 1000) return { label: 'Nível Máximo! 🎖️', progress: 100, remaining: 0, target: 1000 };
  if (pontos >= 500)  return { label: 'Falta para Diamante',   progress: Math.round(((pontos-500)/500)*100), remaining: 1000 - pontos, target: 1000 };
  if (pontos >= 200)  return { label: 'Falta para Ouro',       progress: Math.round(((pontos-200)/300)*100), remaining: 500  - pontos, target: 500  };
  return                     { label: 'Falta para Prata',      progress: Math.round((pontos/200)*100),       remaining: 200  - pontos, target: 200  };
}

const MISSOES = [
  { icon: BookOpen,  label: 'Completar um curso',        pts: '+50 pts', done: true },
  { icon: Users,     label: 'Participar de uma oficina',  pts: '+30 pts', done: true },
  { icon: Briefcase, label: 'Fazer entrevista de emprego',pts: '+80 pts', done: false },
  { icon: Trophy,    label: 'Concluir Jovem Aprendiz',    pts: '+200 pts',done: false },
  { icon: Star,      label: 'Enviar um depoimento',       pts: '+25 pts', done: false },
];

const STATUS_COLOR: Record<string, string> = {
  'Pendente':   'bg-slate-100 text-slate-600 border-slate-200',
  'Em Curso':   'bg-blue-50 text-blue-700 border-blue-200',
  'Alerta':     'bg-rose-50 text-rose-700 border-rose-200',
  'Evadido':    'bg-slate-100 text-slate-500 border-slate-200',
  'Concluído':  'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Contratado': 'bg-yellow-50 text-yellow-700 border-yellow-200',
};

export default function JovensPainelPage() {
  const [jovem, setJovem] = useState<Youth | null>(null);
  const [displayPts, setDisplayPts] = useState(0);

  useEffect(() => {
    const list = db.getYouthList();
    const j = list.find(y => y.id === 'y3') || list[0];
    setJovem(j ?? null);

    // Animated counter
    if (j) {
      let start = 0;
      const end = j.pontos_gamificacao;
      const step = Math.ceil(end / 40);
      const timer = setInterval(() => {
        start += step;
        if (start >= end) { setDisplayPts(end); clearInterval(timer); }
        else setDisplayPts(start);
      }, 35);
      return () => clearInterval(timer);
    }
  }, []);

  if (!jovem) return null;

  const tier      = getTier(jovem.pontos_gamificacao);
  const tierInfo  = getNextTierInfo(jovem.pontos_gamificacao);
  const firstLetter = jovem.nome_completo[0].toUpperCase();
  const firstName   = jovem.nome_completo.split(' ')[0];
  const missoesConcluidas = MISSOES.filter(m => m.done).length;

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">

      {/* ── HERO CARD ─────────────────────────────── */}
      <div className={`bg-gradient-to-br ${tier.gradient} rounded-3xl p-6 relative overflow-hidden animate-fadeIn shadow-lg`}>
        {/* Background decoration */}
        <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/20 rounded-full blur-xl" />
        <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/20 rounded-full blur-xl" />

        {/* Avatar + info */}
        <div className="relative z-10 flex items-center gap-4">
          <div className={`w-16 h-16 rounded-full bg-white border-4 border-white ${tier.ring} ring-4 flex items-center justify-center shadow-lg shrink-0`}>
            <span className="text-slate-800 text-2xl font-black">{firstLetter}</span>
          </div>
          <div className="min-w-0">
            <p className="text-white/90 text-xs font-bold uppercase tracking-wider">Olá de volta,</p>
            <h1 className="text-white text-xl font-black leading-tight truncate">{firstName}! {tier.emoji}</h1>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="bg-white/20 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-white/30 backdrop-blur-sm">
                {tier.label}
              </span>
              <span className={`text-[9px] font-bold border px-2 py-0.5 rounded-full backdrop-blur-sm bg-white/20 text-white border-white/30`}>
                {jovem.status_atual}
              </span>
            </div>
          </div>
        </div>

        {/* Points display */}
        <div className="relative z-10 mt-6 text-center bg-black/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
          <div className="flex items-center justify-center gap-2">
            <Zap className="h-7 w-7 text-white/90" />
            <span className="text-white text-5xl font-black tracking-tighter leading-none">
              {displayPts.toLocaleString('pt-BR')}
            </span>
          </div>
          <p className="text-white/80 text-xs font-bold uppercase tracking-widest mt-1">Descubra Points</p>
        </div>

        {/* Progress to next tier */}
        <div className="relative z-10 mt-5">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-white/80 text-[10px] font-bold uppercase">{tierInfo.label}</span>
            {tierInfo.remaining > 0 && (
              <span className="text-white/80 text-[10px] font-bold">faltam {tierInfo.remaining} pts</span>
            )}
          </div>
          <div className="h-2 bg-black/20 rounded-full overflow-hidden border border-white/10">
            <div
              className="h-full bg-white rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,255,255,0.8)]"
              style={{ width: `${Math.min(tierInfo.progress, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── STATS GRID ────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: BookOpen,   label: 'Cursos',         value: '2',  sub: 'concluídos',   color: 'text-indigo-600',   bg: 'bg-indigo-50 border-indigo-100'   },
          { icon: Flame,      label: 'Dias Ativos',    value: '45', sub: 'no programa',  color: 'text-orange-600', bg: 'bg-orange-50 border-orange-100'},
          { icon: Briefcase,  label: 'Encaminhamentos',value: '1',  sub: 'realizados',   color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100'},
          { icon: Shield,     label: 'Conquistas',     value: `${missoesConcluidas}/${MISSOES.length}`, sub: 'missões ok', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
        ].map((s, i) => (
          <div
            key={s.label}
            className={`bg-white border rounded-2xl p-4 flex flex-col gap-2 animate-fadeIn shadow-sm hover:shadow-md transition-shadow`}
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <div className={`p-2 rounded-xl w-fit ${s.bg} ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-slate-800 text-2xl font-black leading-none">{s.value}</p>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mt-0.5">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ── PRÓXIMAS MISSÕES ──────────────────────── */}
        <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-5 animate-fadeIn delay-200">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <h2 className="text-slate-800 text-sm font-black flex items-center gap-2">
              <div className="bg-indigo-50 p-1.5 rounded-lg">
                <Target className="h-4 w-4 text-indigo-600" />
              </div>
              Missões
            </h2>
            <span className="bg-slate-50 text-slate-600 px-2 py-1 rounded-md text-[10px] font-bold border border-slate-200">
              {missoesConcluidas}/{MISSOES.length} concluídas
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {MISSOES.map((m, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${
                  m.done
                    ? 'bg-emerald-50 border border-emerald-100'
                    : 'bg-slate-50 border border-slate-100 hover:border-indigo-200'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${m.done ? 'bg-emerald-100 text-emerald-600' : 'bg-white border border-slate-200 text-slate-400'}`}>
                  {m.done ? <CheckCircle2 className="h-4 w-4" /> : <m.icon className="h-4 w-4" />}
                </div>
                <p className={`text-xs font-bold flex-1 ${m.done ? 'text-emerald-700 line-through opacity-70' : 'text-slate-700'}`}>
                  {m.label}
                </p>
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                  m.done ? 'bg-emerald-200/50 text-emerald-800' : 'bg-indigo-100 text-indigo-700'
                }`}>
                  {m.done ? '✓ Ganho' : m.pts}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── ATIVIDADE RECENTE ─────────────────────── */}
        <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-5 animate-fadeIn delay-300">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <h2 className="text-slate-800 text-sm font-black flex items-center gap-2">
              <div className="bg-orange-50 p-1.5 rounded-lg">
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
              Atividade Recente
            </h2>
          </div>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Concluiu o Curso de Informática', time: 'há 3 dias',  pts: '+50',  color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Participou da Oficina de CV',     time: 'há 1 semana',pts: '+30',  color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Inscrito no Programa Descubra',   time: 'há 2 meses', pts: '+100', color: 'text-emerald-600', bg: 'bg-emerald-50' },
            ].map((a, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-2 h-2 bg-indigo-500 rounded-full shrink-0" />
                <div className="flex-1">
                  <p className="text-slate-700 text-xs font-bold">{a.label}</p>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{a.time}</p>
                </div>
                <span className={`${a.color} ${a.bg} px-2 py-1 rounded-md text-[10px] font-black shrink-0`}>{a.pts}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA — Resgatar Prêmio ─────────────────── */}
      <Link
        href="/jovens/premiacoes"
        className="bg-gradient-to-r from-amber-400 to-amber-600 rounded-3xl p-5 flex items-center gap-4 shadow-lg shadow-amber-500/20 animate-fadeIn delay-400 hover:scale-[1.01] hover:shadow-xl transition-all"
      >
        <div className="bg-white/20 p-3 rounded-2xl shrink-0 backdrop-blur-sm border border-white/30">
          <Gift className="h-7 w-7 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-white text-base font-black">Resgatar Prêmio</h3>
          <p className="text-white/90 text-xs font-semibold mt-0.5">
            Você tem <strong className="text-white">{jovem.pontos_gamificacao} pts</strong> disponíveis para trocar!
          </p>
        </div>
        <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
          <ArrowRight className="h-5 w-5 text-white shrink-0" />
        </div>
      </Link>

    </div>
  );
}
