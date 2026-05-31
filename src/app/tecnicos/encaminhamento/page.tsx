"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRightCircle, Zap, Filter, CheckCircle2, AlertTriangle,
  ExternalLink, ChevronDown, User, Briefcase, MapPin, Clock, DollarSign,
  UserPlus
} from 'lucide-react';
import { db } from '../../../lib/db';
import type { Youth, Vacancy, Company, Referral } from '../../../lib/db';

// ─── Types ───────────────────────────────────────────────────────────────────

type UrgencyLevel = 'Crítica' | 'Alta' | 'Média' | 'Baixa';
type VacancyType = 'Jovem Aprendiz' | 'Estágio' | 'CLT' | 'Todos';

interface MatchCard {
  youth: Youth;
  vacancy: Vacancy;
  company: Company;
  matchScore: number;
  urgency: UrgencyLevel;
  alreadyReferred: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getUrgency(score: number): UrgencyLevel {
  if (score >= 10) return 'Crítica';
  if (score >= 7)  return 'Alta';
  if (score >= 4)  return 'Média';
  return 'Baixa';
}

const URGENCY_CONFIG: Record<UrgencyLevel, { color: string; bg: string; border: string; dot: string }> = {
  'Crítica': { color: 'text-rose-700',    bg: 'bg-rose-50',    border: 'border-rose-200',    dot: 'bg-rose-500'    },
  'Alta':    { color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200',   dot: 'bg-amber-500'   },
  'Média':   { color: 'text-blue-700',    bg: 'bg-blue-50',    border: 'border-blue-200',    dot: 'bg-blue-500'    },
  'Baixa':   { color: 'text-slate-600',   bg: 'bg-slate-50',   border: 'border-slate-200',   dot: 'bg-slate-400'   },
};

const STATUS_CONFIG: Record<string, { color: string; bg: string }> = {
  'Pendente':   { color: 'text-slate-700',   bg: 'bg-slate-100'   },
  'Em Curso':   { color: 'text-blue-700',    bg: 'bg-blue-100'    },
  'Alerta':     { color: 'text-amber-700',   bg: 'bg-amber-100'   },
  'Evadido':    { color: 'text-rose-700',    bg: 'bg-rose-100'    },
  'Concluído':  { color: 'text-indigo-700',  bg: 'bg-indigo-100'  },
  'Contratado': { color: 'text-emerald-700', bg: 'bg-emerald-100' },
};

function getMatchBar(score: number) {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-blue-500';
  if (score >= 40) return 'bg-amber-400';
  return 'bg-slate-400';
}

function buildMatches(
  youths: Youth[],
  vacancies: Vacancy[],
  companies: Company[],
  referrals: Referral[]
): MatchCard[] {
  const activeYouths = youths.filter(y => y.status_atual === 'Pendente' || y.status_atual === 'Em Curso');
  const openVacancies = vacancies.filter(v => v.status_vaga === 'Aberta');

  const cards: MatchCard[] = [];

  activeYouths.forEach(youth => {
    openVacancies.forEach(vaga => {
      const company = companies.find(c => c.id === vaga.empresa_id);
      if (!company) return;

      // Calculate match %: score / 14 * 100 (max vulnerability score is 14)
      const matchScore = Math.min(99, Math.round((youth.score_vulnerabilidade / 14) * 100));
      const urgency = getUrgency(youth.score_vulnerabilidade);
      const alreadyReferred = referrals.some(
        r => r.jovem_id === youth.id && r.vaga_id === vaga.id
      );

      cards.push({ youth, vacancy: vaga, company, matchScore, urgency, alreadyReferred });
    });
  });

  // Sort by vulnerability score (highest first)
  return cards.sort((a, b) => b.youth.score_vulnerabilidade - a.youth.score_vulnerabilidade);
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function TecnicosEncaminhamentoPage() {
  const [matches, setMatches] = useState<MatchCard[]>([]);
  const [filterUrgency, setFilterUrgency] = useState<UrgencyLevel | 'Todas'>('Todas');
  const [filterType, setFilterType] = useState<VacancyType>('Todos');
  const [filterBairro, setFilterBairro] = useState<string>('Todos');
  const [hideReferred, setHideReferred] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [referredIds, setReferredIds] = useState<Set<string>>(new Set());

  // Manual indication state
  const [manualYouth, setManualYouth] = useState('');
  const [manualVaga, setManualVaga] = useState('');
  const [manualJustification, setManualJustification] = useState('');
  const [allVacancies, setAllVacancies] = useState<Vacancy[]>([]);
  const [empresasList, setEmpresasList] = useState<Company[]>([]);
  const [youthList, setYouthList] = useState<Youth[]>([]);

  // Searchable autocomplete prediction state
  const [youthSearch, setYouthSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const youths = db.getYouthList();
    const vacancies = db.getVagas();
    const companies = db.getEmpresas();
    const referrals = db.getReferrals();
    setMatches(buildMatches(youths, vacancies, companies, referrals));

    // Pre-mark already referred pairs
    const referred = new Set(referrals.map(r => `${r.jovem_id}__${r.vaga_id}`));
    setReferredIds(referred);

    // Load data for manual indication dropdowns
    setAllVacancies(vacancies);
    setEmpresasList(companies);
    setYouthList(youths);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleManualIndication = () => {
    if (!manualYouth || !manualVaga) return;
    db.createReferral(manualYouth, manualVaga);
    const key = `${manualYouth}__${manualVaga}`;
    setReferredIds(prev => new Set([...prev, key]));
    setManualYouth('');
    setManualVaga('');
    setYouthSearch('');
    setManualJustification('');
    showToast(`✅ Jovem indicado manualmente para a vaga com sucesso!`);
    // Reload matches to reflect new referral
    const youths = db.getYouthList();
    const vacancies = db.getVagas();
    const companies = db.getEmpresas();
    const referrals = db.getReferrals();
    setMatches(buildMatches(youths, vacancies, companies, referrals));
  };

  const handleReferral = (card: MatchCard) => {
    const key = `${card.youth.id}__${card.vacancy.id}`;
    if (referredIds.has(key)) return;

    db.createReferral(card.youth.id, card.vacancy.id);
    setReferredIds(prev => new Set([...prev, key]));
    showToast(`✅ ${card.youth.nome_completo.split(' ')[0]} encaminhado para "${card.vacancy.cargo}" na ${card.company.nome_fantasia}!`);
  };

  // Filter youth list for searchable autocomplete indication
  const filteredYouthsForSearch = youthList
    .filter(y => y.status_atual === 'Pendente' || y.status_atual === 'Em Curso')
    .filter(y => {
      if (!youthSearch) return true;
      const term = youthSearch.toLowerCase();
      return y.nome_completo.toLowerCase().includes(term) || y.cpf.includes(term);
    });

  // Filter logic
  const bairros = ['Todos', ...Array.from(new Set(matches.map(m => m.youth.bairro)))];

  const filtered = matches.filter(m => {
    if (filterUrgency !== 'Todas' && m.urgency !== filterUrgency) return false;
    if (filterType !== 'Todos' && m.vacancy.tipo !== filterType) return false;
    if (filterBairro !== 'Todos' && m.youth.bairro !== filterBairro) return false;
    if (hideReferred && referredIds.has(`${m.youth.id}__${m.vacancy.id}`)) return false;
    return true;
  });

  const availableCount = matches.filter(m => !referredIds.has(`${m.youth.id}__${m.vacancy.id}`)).length;

  return (
    <div className="flex flex-col gap-6 animate-fadeIn relative">

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-600 shadow-2xl text-white font-bold px-6 py-3.5 rounded-2xl text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-950 p-6 rounded-3xl shadow-lg flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-400/20 p-3 rounded-2xl border border-indigo-400/30">
            <ArrowRightCircle className="h-6 w-6 text-indigo-300" />
          </div>
          <div>
            <h2 className="text-white text-lg font-black tracking-tight">Central de Encaminhamento — Match IA</h2>
            <p className="text-indigo-400 text-xs font-semibold mt-0.5">
              Cruzamento automático de jovens × vagas abertas por score de vulnerabilidade
            </p>
          </div>
        </div>
        <div className="bg-emerald-500/20 border border-emerald-400/30 px-4 py-2 rounded-2xl text-center shrink-0">
          <p className="text-emerald-300 text-xl font-black">{availableCount}</p>
          <p className="text-emerald-400/70 text-[9px] font-black uppercase tracking-widest">matches disponíveis</p>
        </div>
      </div>

      {/* MANUAL INDICATION FORM */}
      <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-50 p-2 rounded-xl">
            <UserPlus className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900">Indicação Manual de Jovem</h3>
            <p className="text-[10px] text-slate-400">Indique um jovem diretamente para uma vaga específica, além da recomendação automática da IA.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex flex-col gap-1 relative">
            <label className="text-[10px] font-extrabold text-slate-500 uppercase">Jovem</label>
            {manualYouth ? (
              // Beautiful selected youth state card
              <div className="border border-emerald-200 bg-emerald-50/50 rounded-xl px-3 py-2 flex items-center justify-between text-xs font-semibold text-slate-800 h-[38px] transition-all">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-5 w-5 rounded-full bg-emerald-600 flex items-center justify-center text-white text-[10px] font-black shrink-0 shadow-sm">
                    {youthList.find(y => y.id === manualYouth)?.nome_completo.charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate text-slate-900 font-bold">
                    {youthList.find(y => y.id === manualYouth)?.nome_completo}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setManualYouth('');
                    setYouthSearch('');
                  }}
                  className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                  title="Remover seleção"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              // Search input
              <div className="relative">
                <input
                  type="text"
                  placeholder="Digitar nome ou CPF para buscar..."
                  value={youthSearch}
                  onChange={e => {
                    setYouthSearch(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  className="border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-xs font-semibold text-slate-800 focus:outline-emerald-500 bg-slate-50 w-full h-[38px] placeholder:text-slate-400"
                />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {/* Dropdown suggestions list */}
                {showDropdown && (
                  <>
                    {/* Backdrop to close dropdown on click outside */}
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowDropdown(false)} 
                    />
                    <div className="absolute left-0 right-0 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto mt-1 divide-y divide-slate-100 animate-fadeIn">
                      {filteredYouthsForSearch.length === 0 ? (
                        <div className="p-3 text-center text-slate-400 text-xs font-semibold">
                          Nenhum jovem elegível encontrado
                        </div>
                      ) : (
                        filteredYouthsForSearch.map(y => (
                          <button
                            key={y.id}
                            type="button"
                            onClick={() => {
                              setManualYouth(y.id);
                              setYouthSearch(y.nome_completo);
                              setShowDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors flex flex-col gap-0.5"
                          >
                            <span className="text-xs font-bold text-slate-900">{y.nome_completo}</span>
                            <span className="text-[10px] text-slate-400 font-semibold">
                              CPF: {y.cpf} • Score: {y.score_vulnerabilidade} pts • {y.status_atual}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-extrabold text-slate-500 uppercase">Vaga</label>
            <select
              value={manualVaga}
              onChange={e => setManualVaga(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-emerald-500 bg-slate-50"
            >
              <option value="">Selecionar vaga...</option>
              {allVacancies.filter(v => v.status_vaga === 'Aberta').map(v => {
                const emp = empresasList.find(e => e.id === v.empresa_id);
                return <option key={v.id} value={v.id}>{v.cargo} — {emp?.razao_social || v.empresa_id}</option>;
              })}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-extrabold text-slate-500 uppercase">Justificativa (Opcional)</label>
            <input
              type="text"
              value={manualJustification}
              onChange={e => setManualJustification(e.target.value)}
              placeholder="Ex: Jovem muito proativo na formação..."
              className="border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-emerald-500 bg-slate-50"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleManualIndication}
            disabled={!manualYouth || !manualVaga}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-md transition-all active:scale-95"
          >
            <UserPlus className="h-4 w-4" />
            Indicar para Vaga
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-slate-400" />
          <p className="text-xs font-black text-slate-700 uppercase tracking-widest">Filtros</p>
        </div>
        <div className="flex flex-wrap gap-3 items-end">

          {/* Urgency */}
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Urgência</label>
            <select
              value={filterUrgency}
              onChange={e => setFilterUrgency(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-indigo-400"
            >
              <option value="Todas">Todas</option>
              <option value="Crítica">🔴 Crítica</option>
              <option value="Alta">🟠 Alta</option>
              <option value="Média">🔵 Média</option>
              <option value="Baixa">⚪ Baixa</option>
            </select>
          </div>

          {/* Type */}
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Tipo de Vaga</label>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-indigo-400"
            >
              <option value="Todos">Todos</option>
              <option value="Jovem Aprendiz">Jovem Aprendiz</option>
              <option value="Estágio">Estágio</option>
              <option value="CLT">CLT</option>
            </select>
          </div>

          {/* Bairro */}
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Bairro do Jovem</label>
            <select
              value={filterBairro}
              onChange={e => setFilterBairro(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-indigo-400"
            >
              {bairros.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          {/* Hide referred */}
          <label className="flex items-center gap-2 cursor-pointer select-none ml-auto">
            <div
              onClick={() => setHideReferred(v => !v)}
              className={`w-10 h-5 rounded-full transition-colors relative ${hideReferred ? 'bg-indigo-600' : 'bg-slate-200'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${hideReferred ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
            <span className="text-xs font-bold text-slate-600">Apenas não encaminhados</span>
          </label>
        </div>
      </div>

      {/* Match Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-12 shadow-sm flex flex-col items-center gap-3 text-center">
          <Zap className="h-10 w-10 text-slate-300" />
          <p className="text-slate-400 font-bold text-sm">Nenhum match encontrado com os filtros atuais.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map(card => {
            const referred = referredIds.has(`${card.youth.id}__${card.vacancy.id}`);
            const urgConf = URGENCY_CONFIG[card.urgency];
            const statConf = STATUS_CONFIG[card.youth.status_atual] || STATUS_CONFIG['Pendente'];
            const barColor = getMatchBar(card.matchScore);
            const youthInitial = card.youth.nome_completo.charAt(0).toUpperCase();

            return (
              <div
                key={`${card.youth.id}__${card.vacancy.id}`}
                className={`bg-white border-2 rounded-3xl p-5 shadow-sm transition-all ${referred ? 'border-emerald-200 opacity-75' : 'border-slate-100 hover:border-indigo-200 hover:shadow-md'}`}
              >
                {/* Urgency badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border flex items-center gap-1.5 ${urgConf.color} ${urgConf.bg} ${urgConf.border}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${urgConf.dot}`} />
                    Urgência {card.urgency}
                  </span>
                  {referred && (
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Encaminhado
                    </span>
                  )}
                </div>

                {/* Three-column match layout */}
                <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">

                  {/* LEFT — Youth */}
                  <div className="flex flex-col gap-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Jovem</p>
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black text-sm shrink-0">
                        {youthInitial}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-900 truncate">{card.youth.nome_completo.split(' ').slice(0, 2).join(' ')}</p>
                        <p className="text-[10px] text-slate-500 font-semibold truncate">{card.youth.bairro}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${statConf.bg} ${statConf.color}`}>
                        {card.youth.status_atual}
                      </span>
                      <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <AlertTriangle className="h-2.5 w-2.5" />
                        Score {card.youth.score_vulnerabilidade}
                      </span>
                    </div>
                  </div>

                  {/* CENTER — Match % */}
                  <div className="flex flex-col items-center gap-1.5 px-2">
                    <div className="relative">
                      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                        <circle
                          cx="18" cy="18" r="14" fill="none"
                          stroke={card.matchScore >= 70 ? '#10b981' : card.matchScore >= 50 ? '#3b82f6' : '#f59e0b'}
                          strokeWidth="3"
                          strokeDasharray={`${(card.matchScore / 100) * 87.96} 87.96`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-black text-slate-800">{card.matchScore}%</span>
                      </div>
                    </div>
                    <div className="bg-slate-100 rounded-full px-2 py-0.5">
                      <ArrowRightCircle className="h-3.5 w-3.5 text-slate-500" />
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider text-center">Match</p>
                  </div>

                  {/* RIGHT — Vacancy */}
                  <div className="flex flex-col gap-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Vaga</p>
                    <div>
                      <p className="text-sm font-black text-slate-900">{card.vacancy.cargo}</p>
                      <p className="text-[10px] text-slate-500 font-semibold">{card.company.nome_fantasia}</p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                        {card.vacancy.tipo}
                      </span>
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <DollarSign className="h-2.5 w-2.5" />
                        R$ {card.vacancy.bolsa_auxilio.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-slate-400 font-semibold">
                      <Clock className="h-2.5 w-2.5" />
                      {card.vacancy.horario}
                    </div>
                  </div>
                </div>

                {/* Match progress bar */}
                <div className="mt-4 mb-4">
                  <div className="bg-slate-100 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full transition-all ${barColor}`} style={{ width: `${card.matchScore}%` }} />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleReferral(card)}
                    disabled={referred}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-black shadow transition-all flex items-center justify-center gap-1.5 ${
                      referred
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {referred ? (
                      <><CheckCircle2 className="h-3.5 w-3.5" /> Encaminhado</>
                    ) : (
                      <><ArrowRightCircle className="h-3.5 w-3.5" /> Encaminhar com 1 Clique</>
                    )}
                  </button>
                  <Link
                    href={`/tecnicos/jovens/${card.youth.id}`}
                    className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center gap-1.5"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Ver Perfil
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
