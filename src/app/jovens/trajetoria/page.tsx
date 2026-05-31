'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2, Circle, Lock, Loader2,
  Star, Briefcase, GraduationCap, Award, Zap, Flag, ArrowRight
} from 'lucide-react';
import { db } from '../../../lib/db';
import type { Youth } from '../../../lib/db';

type StepStatus = 'done' | 'active' | 'locked';

interface TrilhaStep {
  id: number;
  title: string;
  subtitle: string;
  desc: string;
  icon: React.ElementType;
  date?: string;
  pts: number;
  status: StepStatus;
}

function buildTrilha(jovem: Youth): TrilhaStep[] {
  const s = jovem.status_atual;
  const isDone   = (st: string) => s === 'Concluído' || s === 'Contratado';
  const isCurso  = s !== 'Pendente';
  const isEnc    = s === 'Contratado';

  return [
    {
      id: 1,
      title: 'Entrada no Programa',
      subtitle: 'Indicação CREAS/CRAS',
      desc: 'Você foi indicado por uma unidade de referência e seu cadastro foi criado no sistema.',
      icon: Star,
      date: jovem.created_at ? new Date(jovem.created_at).toLocaleDateString('pt-BR') : '2024',
      pts: 100,
      status: 'done',
    },
    {
      id: 2,
      title: 'Pré-Aprendizagem',
      subtitle: 'Oficinas & Cursos Básicos',
      desc: 'Participação nas oficinas de preparação: CV, entrevistas, informática básica e cidadania.',
      icon: GraduationCap,
      date: '2024',
      pts: 80,
      status: isCurso ? 'done' : 'active',
    },
    {
      id: 3,
      title: 'Aprendizagem Profissional',
      subtitle: 'Jovem Aprendiz / Estágio',
      desc: 'Início das atividades práticas em empresa parceira com contrato de aprendizagem registrado.',
      icon: Briefcase,
      pts: 150,
      status: s === 'Em Curso' ? 'active' : s === 'Contratado' || s === 'Concluído' ? 'done' : 'locked',
    },
    {
      id: 4,
      title: 'Encaminhamento para Vaga',
      subtitle: 'Match com Empresa',
      desc: 'O técnico identificou a vaga ideal para seu perfil e realizou o encaminhamento formal.',
      icon: Zap,
      pts: 80,
      status: isEnc ? 'done' : 'locked',
    },
    {
      id: 5,
      title: 'Contratação',
      subtitle: 'Emprego Formal',
      desc: 'Você foi contratado por uma das empresas parceiras do Programa Descubra. Parabéns! 🎉',
      icon: Award,
      pts: 200,
      status: s === 'Contratado' ? 'active' : 'locked',
    },
    {
      id: 6,
      title: 'Conquistas & Certificados',
      subtitle: 'Reconhecimento',
      desc: 'Acesse seus certificados, depoimentos publicados e o histórico completo de conquistas.',
      icon: Flag,
      pts: 50,
      status: s === 'Contratado' ? 'done' : 'locked',
    },
  ];
}

export default function JovemTrajetoriaPage() {
  const [jovem, setJovem]   = useState<Youth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const list = db.getYouthList();
    const j = list.find(y => y.id === 'y3') || list[0];
    setJovem(j ?? null);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!jovem) return null;

  const passos = buildTrilha(jovem);
  const concluidos = passos.filter(p => p.status === 'done').length;
  const total      = passos.length;
  const pctCompleto = Math.round((concluidos / total) * 100);

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">

      {/* ── Header ─────────────────────────────────── */}
      <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-6 animate-fadeIn">
        <h1 className="text-slate-800 text-xl font-black">Minha Trilha 🗺️</h1>
        <p className="text-slate-500 text-xs font-semibold mt-1">
          Acompanhe seu caminho desde a entrada no programa até a contratação.
        </p>

        {/* Overall progress */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-indigo-600 text-[10px] font-black uppercase tracking-wider">Progresso Geral</span>
            <span className="text-slate-800 text-sm font-black">{pctCompleto}%</span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 shadow-sm"
              style={{ width: `${pctCompleto}%` }}
            />
          </div>
          <p className="text-slate-400 text-[10px] mt-2 font-bold">{concluidos} de {total} etapas concluídas</p>
        </div>
      </div>

      {/* ── TIMELINE ───────────────────────────────── */}
      <div className="flex flex-col relative px-2">
        {/* Vertical connector line */}
        <div className="absolute left-9 top-8 bottom-8 w-0.5 bg-slate-200" />

        {passos.map((passo, idx) => {
          return (
            <div
              key={passo.id}
              className={`relative flex gap-6 pb-6 animate-fadeIn group`}
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              {/* Icon bubble */}
              <div className="shrink-0 z-10">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border-2 transition-all ${
                  passo.status === 'done'
                    ? 'bg-emerald-50 border-emerald-400 shadow-emerald-100/50 text-emerald-600'
                    : passo.status === 'active'
                    ? 'bg-indigo-50 border-indigo-400 shadow-indigo-100/50 ring-4 ring-indigo-500/10 text-indigo-600'
                    : 'bg-white border-slate-200 text-slate-300'
                }`}>
                  {passo.status === 'done' ? (
                    <CheckCircle2 className="h-6 w-6 stroke-[2.5]" />
                  ) : passo.status === 'active' ? (
                    <passo.icon className="h-6 w-6 animate-pulse" />
                  ) : (
                    <Lock className="h-5 w-5" />
                  )}
                </div>
              </div>

              {/* Content */}
              <div className={`flex-1 rounded-3xl p-5 border transition-all ${
                passo.status === 'done'
                  ? 'bg-emerald-50/50 border-emerald-100 hover:shadow-md'
                  : passo.status === 'active'
                  ? 'bg-indigo-50/50 border-indigo-200 hover:shadow-md'
                  : 'bg-slate-50/50 border-slate-100 opacity-70'
              }`}>
                {/* Title row */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`text-sm font-black ${
                        passo.status === 'locked' ? 'text-slate-400' : 'text-slate-800'
                      }`}>
                        {passo.title}
                      </h3>
                      {passo.status === 'active' && (
                        <span className="bg-indigo-600 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full tracking-wide animate-pulse">
                          Em andamento
                        </span>
                      )}
                      {passo.status === 'done' && (
                        <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-[8px] font-black uppercase px-2 py-0.5 rounded-full tracking-wide">
                          ✓ Concluído
                        </span>
                      )}
                    </div>
                    <p className={`text-[10px] font-bold mt-1 ${
                      passo.status === 'locked' ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      {passo.subtitle}
                    </p>
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-xl shrink-0 ${
                    passo.status === 'done'
                      ? 'bg-emerald-100 text-emerald-700'
                      : passo.status === 'active'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    +{passo.pts} pts
                  </span>
                </div>

                {/* Description */}
                {passo.status !== 'locked' && (
                  <p className="text-slate-600 text-xs font-medium mt-3 leading-relaxed">{passo.desc}</p>
                )}

                {/* Date */}
                {passo.date && passo.status === 'done' && (
                  <p className="text-slate-400 text-[10px] font-bold mt-3">📅 {passo.date}</p>
                )}

                {/* CTA for active */}
                {passo.status === 'active' && (
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-indigo-100 rounded-full overflow-hidden">
                      <div className="h-full w-1/2 bg-indigo-500 rounded-full animate-pulse" />
                    </div>
                    <span className="text-indigo-600 text-[10px] font-bold uppercase tracking-wider">Em progresso</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── CTA Footer ─────────────────────────────── */}
      <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-5 flex items-center gap-4 animate-fadeIn mt-2">
        <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-2xl">
          <Zap className="h-6 w-6 text-indigo-600" />
        </div>
        <div className="flex-1">
          <p className="text-slate-800 text-sm font-black">Continue evoluindo!</p>
          <p className="text-slate-500 text-xs font-medium mt-0.5">Cada passo vale pontos que podem ser trocados por prêmios.</p>
        </div>
        <div className="bg-slate-50 p-2 rounded-full hover:bg-indigo-50 transition-colors cursor-pointer group">
          <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0" />
        </div>
      </div>
    </div>
  );
}
