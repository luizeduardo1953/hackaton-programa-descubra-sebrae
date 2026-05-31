'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, Users, AlertTriangle, CheckCircle, ShieldAlert, 
  Clock, Search, Filter, BookOpen, Briefcase, Award, 
  MapPin, Calendar, Activity, ChevronRight, User, PlusCircle, ArrowRight, Sparkles
} from 'lucide-react';
import { db, type Youth, type YouthVulnerabilities, type Vacancy, type FollowUpLog } from '../../../lib/db';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, Tooltip, 
  LineChart, Line, CartesianGrid 
} from 'recharts';

export default function TecnicosFilaInteligentePage() {
  const [isMounted, setIsMounted] = useState(false);
  const [youthList, setYouthList] = useState<Youth[]>([]);
  const [vulns, setVulns] = useState<YouthVulnerabilities[]>([]);
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [selectedYouthId, setSelectedYouthId] = useState<string | null>(null);
  
  const [search, setSearch] = useState('');
  const [filterRisco, setFilterRisco] = useState<'todos' | 'critico' | 'medio' | 'baixo'>('todos');
  const [toast, setToast] = useState<string | null>(null);

  // Load database items
  useEffect(() => {
    setIsMounted(true);
    setYouthList(db.getYouthList());
    setVulns(db.getYouthVulnerabilities());
    setVacancies(db.getVagas());
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // ── DYNAMIC SCORE CALCULATION ──────────────────────────────
  const dynamicYouthData = useMemo(() => {
    return youthList.map(y => {
      const v = vulns.find(item => item.jovem_id === y.id) || {
        jovem_id: y.id, bolsa_familia: false, cad_unico: false,
        medida_socioeducativa: false, deficiencia: false,
        acesso_internet: true, computador: true, trabalhou_antes: true,
        abandonou_escola: false, dificuldade_transporte: false,
        acompanhamento_psicologico: false
      };

      // Fatores de vulnerabilidade mapeados
      const baixaRenda = v.bolsa_familia || v.cad_unico || y.renda_familiar < 1000;
      const evasaoEscolar = v.abandonou_escola || y.status_atual === 'Evadido';
      const vulnerabilidadeSocial = v.medida_socioeducativa || v.deficiencia;
      const desemprego = y.status_atual !== 'Contratado';
      const baixaParticipacao = y.pontos_gamificacao < 100 || y.status_atual === 'Alerta';

      // Nova Fórmula Requerida
      const score = (baixaRenda ? 20 : 0) + 
                    (evasaoEscolar ? 25 : 0) + 
                    (vulnerabilidadeSocial ? 30 : 0) + 
                    (desemprego ? 15 : 0) + 
                    (baixaParticipacao ? 10 : 0);

      // Classificação automática
      let risco: 'Baixo' | 'Médio' | 'Crítico' = 'Baixo';
      if (score >= 60) risco = 'Crítico';
      else if (score >= 30) risco = 'Médio';

      return {
        ...y,
        score_dinamico: score,
        risco,
        fatores: {
          baixaRenda,
          evasaoEscolar,
          vulnerabilidadeSocial,
          desemprego,
          baixaParticipacao
        },
        vulnerabilities: v
      };
    });
  }, [youthList, vulns]);

  // Set default selected youth on mount
  useEffect(() => {
    if (dynamicYouthData.length > 0 && !selectedYouthId) {
      // Prioritize the highest score automatically
      const sorted = [...dynamicYouthData].sort((a, b) => b.score_dinamico - a.score_dinamico);
      setSelectedYouthId(sorted[0].id);
    }
  }, [dynamicYouthData, selectedYouthId]);

  // Enriched selected youth details
  const selectedYouth = useMemo(() => {
    if (!selectedYouthId) return null;
    return dynamicYouthData.find(y => y.id === selectedYouthId) || null;
  }, [selectedYouthId, dynamicYouthData]);

  // Selected Youth Timeline
  const selectedTimeline = useMemo(() => {
    if (!selectedYouthId) return [];
    return db.getFollowUpsByYouth(selectedYouthId);
  }, [selectedYouthId]);

  // Intelligent Matching Engine
  const matchedOpportunities = useMemo(() => {
    if (!selectedYouth) return { jobs: [], courses: [], benefits: [] };

    const getAge = (birthdate: string) => {
      const birth = new Date(birthdate);
      const diff = Date.now() - birth.getTime();
      const ageDate = new Date(diff);
      return Math.abs(ageDate.getUTCFullYear() - 1970);
    };
    
    const idade = getAge(selectedYouth.data_nascimento);

    // Job matching (vagas from database)
    const jobs = vacancies.filter(v => {
      if (v.status_vaga !== 'Aberta') return false;
      if (v.idade_minima > idade) return false;
      return true;
    }).slice(0, 2);

    // Course suggestions
    const courses = [];
    if (selectedYouth.fatores.evasaoEscolar || selectedYouth.escolaridade.includes('Incompleto')) {
      courses.push({
        titulo: 'Reingresso Escolar & EJA Pirapora',
        entidade: 'CECEP / Prefeitura',
        duracao: 'Modular',
        tipo: 'Formação Básica'
      });
    }
    courses.push({
      titulo: 'Informática Avançada e Digitação',
      entidade: 'SENAI Pirapora',
      duracao: '60 horas',
      tipo: 'Profissionalizante'
    });
    courses.push({
      titulo: 'Auxiliar Administrativo e Vendas',
      entidade: 'SENAC Jovem Aprendiz',
      duracao: '120 horas',
      tipo: 'Comércio'
    });

    // Benefit suggestions based on vulnerabilities
    const benefits = [];
    if (selectedYouth.score_dinamico >= 60) {
      benefits.push({ nome: 'Vale-transporte Emergencial Municipal', desc: 'Bolsa de passagens diretas para o curso no contraturno.' });
    }
    if (selectedYouth.vulnerabilities.bolsa_familia === false && selectedYouth.renda_familiar < 700) {
      benefits.push({ nome: 'Encaminhamento para Bolsa Família / Cadastro Único', desc: 'Agendamento prioritário no CRAS de referência.' });
    }
    benefits.push({ nome: 'Kit Internet Educacional Descubra', desc: 'Recarga gratuita de 15GB mensais para estudos remotos.' });

    return { jobs, courses: courses.slice(0, 2), benefits: benefits.slice(0, 2) };
  }, [selectedYouth, vacancies]);

  // Filtering list
  const filteredFila = useMemo(() => {
    return dynamicYouthData.filter(y => {
      const matchesSearch = y.nome_completo.toLowerCase().includes(search.toLowerCase()) ||
                            y.bairro.toLowerCase().includes(search.toLowerCase());
      
      if (!matchesSearch) return false;

      if (filterRisco === 'todos') return true;
      return y.risco.toLowerCase() === filterRisco;
    }).sort((a, b) => b.score_dinamico - a.score_dinamico); // Auto-sort by dynamic score descending
  }, [dynamicYouthData, search, filterRisco]);

  // ── GRAPH STATISTICS ───────────────────────────────────────
  const chartData = useMemo(() => {
    // 1. Risk distribution (Pizza)
    const riscoCounts = { Crítico: 0, Médio: 0, Baixo: 0 };
    dynamicYouthData.forEach(y => {
      riscoCounts[y.risco]++;
    });
    const pizzaData = [
      { name: 'Crítico', value: riscoCounts.Crítico, color: '#ef4444' }, // Rose 500
      { name: 'Médio', value: riscoCounts.Médio, color: '#3b82f6' },    // Blue 500 (Standardized)
      { name: 'Baixo', value: riscoCounts.Baixo, color: '#10b981' }     // Emerald 500
    ];

    // 2. Vulnerability factors (Bar)
    let baixaRendaCount = 0;
    let evasaoCount = 0;
    let socialCount = 0;
    let desempregoCount = 0;
    let baixaPartCount = 0;

    dynamicYouthData.forEach(y => {
      if (y.fatores.baixaRenda) baixaRendaCount++;
      if (y.fatores.evasaoEscolar) evasaoCount++;
      if (y.fatores.vulnerabilidadeSocial) socialCount++;
      if (y.fatores.desemprego) desempregoCount++;
      if (y.fatores.baixaParticipacao) baixaPartCount++;
    });

    const barData = [
      { factor: 'Baixa Renda', Qtd: baixaRendaCount },
      { factor: 'Evasão Escolar', Qtd: evasaoCount },
      { factor: 'Vulnerabilidade', Qtd: socialCount },
      { factor: 'Desemprego', Qtd: desempregoCount },
      { factor: 'Baixo Engajamento', Qtd: baixaPartCount }
    ];

    // 3. Score history mockup (Line)
    const lineData = [
      { mes: 'Jan', Media: 34, Criticos: 1 },
      { mes: 'Fev', Media: 42, Criticos: 2 },
      { mes: 'Mar', Media: 48, Criticos: 2 },
      { mes: 'Abr', Media: 50, Criticos: 3 },
      { mes: 'Mai', Media: Math.round(dynamicYouthData.reduce((acc, curr) => acc + curr.score_dinamico, 0) / dynamicYouthData.length), Criticos: dynamicYouthData.filter(y => y.score_dinamico >= 60).length }
    ];

    return { pizzaData, barData, lineData, riscoCounts };
  }, [dynamicYouthData]);

  // Dashboard Stats Card calculations
  const dashboardStats = useMemo(() => {
    const total = dynamicYouthData.length;
    const criticos = dynamicYouthData.filter(y => y.score_dinamico >= 60).length;
    const medios = dynamicYouthData.filter(y => y.score_dinamico >= 30 && y.score_dinamico < 60).length;
    
    const avgScore = total > 0 ? Math.round(dynamicYouthData.reduce((acc, curr) => acc + curr.score_dinamico, 0) / total) : 0;
    
    // Percentage of youth in critical or medium risk state
    const vulnerabilidadeRate = total > 0 ? Math.round(((criticos + medios) / total) * 100) : 0;

    return { total, criticos, avgScore, vulnerabilidadeRate };
  }, [dynamicYouthData]);

  return (
    <div className="flex flex-col gap-6 animate-fadeIn relative pb-10 text-slate-800 min-h-screen">
      
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border border-slate-100 shadow-2xl px-6 py-4 rounded-2xl text-xs font-black text-emerald-600 backdrop-blur-md">
          {toast}
        </div>
      )}

      {/* Header Container (Deep Navy Slate) */}
      <div className="relative overflow-hidden bg-[#0f172a] p-6 md:p-8 rounded-3xl shadow-md border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-400 p-4 rounded-2xl text-[#0f172a] shadow-inner shadow-black/20">
              <TrendingUp className="h-8 w-8" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Painel do Técnico</span>
              <h1 className="text-2xl font-black mt-1 text-white leading-none">Fila Inteligente de Priorização</h1>
              <p className="text-xs text-slate-400 font-semibold mt-1">Classificação preditiva e priorização social instantânea baseada em fatores combinados de vulnerabilidade.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── DASHBOARD ANALÍTICO SUPERIOR ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white border border-slate-100 p-5 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest block font-bold">Total de Jovens</span>
            <span className="text-2xl font-black text-slate-800 mt-1 block">{dashboardStats.total}</span>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest block font-bold">Casos Críticos</span>
            <span className="text-2xl font-black text-rose-650 mt-1 block">{dashboardStats.criticos}</span>
          </div>
          <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest block font-bold">Score Médio</span>
            <span className="text-2xl font-black text-slate-800 mt-1 block">{dashboardStats.avgScore} pts</span>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest block font-bold">Vulnerabilidade</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">{dashboardStats.vulnerabilidadeRate}%</span>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* ─── GRÁFICOS ANALÍTICOS (RECHARTS) ─── */}
      {isMounted && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Chart 1: Risk Level (Pizza) */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex flex-col gap-4">
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Distribuição de Risco</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Separação por criticidade de vulnerabilidade</p>
            </div>
            <div className="h-[200px] flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.pizzaData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.pizzaData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '11px', color: '#1e293b' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-slate-800">{chartData.riscoCounts.Crítico}</span>
                <span className="text-[9px] text-slate-500 font-bold uppercase">Críticos</span>
              </div>
            </div>
            {/* Legend */}
            <div className="flex justify-around text-[10px] font-bold text-slate-500">
              <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div> Crítico ({chartData.riscoCounts.Crítico})</span>
              <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div> Médio ({chartData.riscoCounts.Médio})</span>
              <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> Baixo ({chartData.riscoCounts.Baixo})</span>
            </div>
          </div>

          {/* Chart 2: Vulnerability Factors (Bar) */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex flex-col gap-4">
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Incidência de Fatores</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Quais condições geram maior impacto</p>
            </div>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.barData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="factor" stroke="#94a3b8" fontSize={8} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={8} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '11px', color: '#1e293b' }}
                  />
                  <Bar dataKey="Qtd" fill="url(#barGradient)" radius={[4, 4, 0, 0]}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Temporal Series (Line) */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex flex-col gap-4">
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Evolução Mensal</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Tendência temporal da vulnerabilidade média</p>
            </div>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.lineData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="mes" stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '11px', color: '#1e293b' }}
                  />
                  <Line type="monotone" dataKey="Media" name="Score Médio" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6' }} />
                  <Line type="monotone" dataKey="Criticos" name="Críticos" stroke="#f43f5e" strokeWidth={2} strokeDasharray="4 4" dot={{ fill: '#e11d48' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* ─── FILA E DETALHES (SIDE-BY-SIDE GRID) ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* LADO ESQUERDO: FILA DE JOVENS (xl:col-span-2) */}
        <div className="xl:col-span-2 bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex flex-col gap-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-black text-slate-800">Triagem de Atendimento Técnico</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Ordenado automaticamente por score de vulnerabilidade decrescente</p>
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'critico', label: 'Crítico' },
                { id: 'medio', label: 'Médio' },
                { id: 'baixo', label: 'Baixo' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilterRisco(f.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    filterRisco === f.id 
                      ? 'bg-blue-600 text-white shadow-xs border border-blue-500' 
                      : 'text-slate-550 hover:text-slate-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl flex items-center px-4 py-2.5 gap-3 focus-within:border-blue-400 transition-all">
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <input 
              type="text" 
              placeholder="Buscar por nome do jovem ou bairro..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent focus:outline-none text-xs w-full text-slate-700 font-semibold placeholder:font-medium"
            />
          </div>

          {/* prioritized Fila Queue List */}
          <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
            <AnimatePresence mode="popLayout">
              {filteredFila.map((y) => {
                const isSelected = selectedYouthId === y.id;
                let cardBorderCor = 'border-slate-100 bg-white hover:border-slate-200';
                let riscoCor = 'text-emerald-600 bg-emerald-50 border-emerald-100';

                if (y.risco === 'Crítico') {
                  riscoCor = 'text-rose-600 bg-rose-50 border-rose-100';
                  cardBorderCor = isSelected 
                    ? 'border-rose-550 ring-2 ring-rose-500/10 bg-rose-50/20 shadow-xs' 
                    : 'border-rose-200 bg-rose-50/10 hover:border-rose-450';
                } else if (y.risco === 'Médio') {
                  riscoCor = 'text-blue-600 bg-blue-50 border-blue-100';
                  cardBorderCor = isSelected
                    ? 'border-blue-550 ring-2 ring-blue-550/10 bg-blue-50/20 shadow-xs'
                    : 'border-slate-100 bg-white hover:border-blue-200';
                } else {
                  if (isSelected) cardBorderCor = 'border-blue-550 ring-2 ring-blue-550/10 bg-blue-50/20 shadow-xs';
                }

                return (
                  <motion.div
                    layout
                    key={y.id}
                    onClick={() => setSelectedYouthId(y.id)}
                    className={`group border rounded-2xl p-4 cursor-pointer transition-all flex items-center justify-between gap-4 ${cardBorderCor}`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar initial or emoji */}
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 border font-black text-sm ${
                        y.risco === 'Crítico' 
                          ? 'bg-rose-50 border-rose-200 text-rose-600' 
                          : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}>
                        {y.nome_completo.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-black text-slate-800 group-hover:text-blue-600 transition-colors">{y.nome_completo}</h4>
                          {y.status_atual === 'Alerta' && (
                            <span className="h-1.5 w-1.5 bg-rose-500 rounded-full animate-ping" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[10px] font-semibold text-slate-400">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" /> {y.bairro}</span>
                          <span>•</span>
                          <span>Matrícula: {y.status_atual}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Score Indicator */}
                      <div className="text-right">
                        <span className="text-xs font-black text-slate-800 block">{y.score_dinamico} pts</span>
                        <span className="text-[8px] text-slate-450 font-bold uppercase tracking-wider block mt-0.5 font-bold">Social Score</span>
                      </div>
                      
                      {/* Risco Badge */}
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg border ${riscoCor}`}>
                        {y.risco}
                      </span>

                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {filteredFila.length === 0 && (
              <div className="text-center py-10 text-slate-400 font-semibold text-xs border border-dashed border-slate-200 rounded-2xl">
                Nenhum jovem corresponde aos filtros aplicados.
              </div>
            )}
          </div>

        </div>

        {/* LADO DIREITO: QUADRO COMPLETO DO JOVEM E MATCHING (xl:col-span-1) */}
        <div className="xl:col-span-1 flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {selectedYouth ? (
              <motion.div
                key={selectedYouth.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-6"
              >
                
                {/* 1. PROFILE HEADER CARD */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex flex-col gap-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none"></div>
                  
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-4">
                    <div>
                      <h4 className="text-sm font-black text-slate-800">{selectedYouth.nome_completo}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-bold uppercase tracking-wider">
                        CPF: {selectedYouth.cpf} • {Math.abs(new Date(Date.now() - new Date(selectedYouth.data_nascimento).getTime()).getUTCFullYear() - 1970)} Anos
                      </p>
                    </div>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg border ${
                      selectedYouth.risco === 'Crítico' 
                        ? 'text-rose-600 bg-rose-50 border-rose-100' 
                        : 'text-blue-600 bg-blue-50 border-blue-100'
                    }`}>
                      {selectedYouth.score_dinamico} Pts
                    </span>
                  </div>

                  {/* Vulnerability factors checkboxes list */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1 font-bold">Fatores Analíticos Mapeados</span>
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                      {[
                        { label: 'Baixa Renda', checked: selectedYouth.fatores.baixaRenda },
                        { label: 'Evasão Escolar', checked: selectedYouth.fatores.evasaoEscolar },
                        { label: 'Vulnerabilidade Fam.', checked: selectedYouth.fatores.vulnerabilidadeSocial },
                        { label: 'Desemprego Jovem', checked: selectedYouth.fatores.desemprego },
                        { label: 'Baixo Engajamento', checked: selectedYouth.fatores.baixaParticipacao }
                      ].map(f => (
                        <div key={f.label} className={`flex items-center gap-2 p-2 rounded-xl border ${
                          f.checked 
                            ? 'bg-rose-50 border-rose-100 text-rose-600 shadow-inner' 
                            : 'bg-slate-50 border-slate-200 text-slate-400'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${f.checked ? 'bg-rose-500' : 'bg-slate-300'}`} />
                          <span className="truncate">{f.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[10px] font-semibold text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div>Escolaridade: <strong className="text-slate-800 block mt-0.5 truncate">{selectedYouth.escolaridade}</strong></div>
                    <div>Localização: <strong className="text-slate-800 block mt-0.5 truncate">{selectedYouth.bairro}</strong></div>
                    <div className="col-span-2 border-t border-slate-200/60 pt-2 mt-1">
                      Área de Interesse:{" "}
                      <strong className="text-slate-900 block mt-0.5 font-black">
                        🎯 {selectedYouth.area_interesse === 'Outros' 
                          ? (selectedYouth.outra_area_interesse || 'Outros') 
                          : (selectedYouth.area_interesse || 'Não informada')}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* 2. MATCHING INTELIGENTE PANEL */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex flex-col gap-4 relative">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Matching Recomendado por IA</h3>
                  </div>

                  <div className="flex flex-col gap-3">
                    {/* Vacancies Matches */}
                    {matchedOpportunities.jobs.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-bold">Vagas de Jovem Aprendiz Recomendadas</span>
                        {matchedOpportunities.jobs.map((v: Vacancy) => (
                          <div key={v.id} className="bg-slate-50 p-3 rounded-xl border border-emerald-250 hover:border-emerald-450 transition-all flex justify-between items-center text-[10px] font-bold group">
                            <div>
                              <span className="text-emerald-600">{v.cargo}</span>
                              <span className="text-slate-400 block mt-0.5">Bolsa: R$ {v.bolsa_auxilio.toFixed(2)}</span>
                            </div>
                            <button 
                              onClick={() => showToast(`✅ Jovem encaminhado para entrevista da vaga ${v.cargo}!`)}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white px-2.5 py-1.5 rounded-lg font-black flex items-center gap-0.5 cursor-pointer transition-opacity border border-emerald-400"
                            >
                              Encaminhar <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Courses Matches */}
                    <div className="flex flex-col gap-2 mt-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-bold">Qualificação Técnica Recomendada</span>
                      {matchedOpportunities.courses.map((c, idx) => (
                        <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center text-[10px] font-bold">
                          <div>
                            <span className="text-blue-600">{c.titulo}</span>
                            <span className="text-slate-450 block mt-0.5">{c.entidade} • {c.duracao}</span>
                          </div>
                          <BookOpen className="w-4 h-4 text-slate-400" />
                        </div>
                      ))}
                    </div>

                    {/* Benefits Matches */}
                    <div className="flex flex-col gap-2 mt-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-bold">Benefícios e Apoios Assistenciais</span>
                      {matchedOpportunities.benefits.map((b, idx) => (
                        <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[10px] font-bold flex flex-col gap-1">
                          <span className="text-blue-650">{b.nome}</span>
                          <span className="text-slate-500 font-semibold leading-relaxed">{b.desc}</span>
                        </div>
                      ))}
                    </div>

                  </div>
                </div>

                {/* 3. CASE TIMELINE OF FOLLOW-UPS */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Linha do Tempo Escolar & Social</span>
                    <button 
                      onClick={() => showToast('✏️ Registrar novo acompanhamento familiar!')}
                      className="text-[10px] font-black text-blue-600 hover:text-blue-500 flex items-center gap-0.5 cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> Adicionar
                    </button>
                  </div>

                  <div className="flex flex-col gap-4 mt-2 max-h-[300px] overflow-y-auto pr-1">
                    {selectedTimeline.map((t: FollowUpLog, idx) => (
                      <div key={t.id} className="relative pl-6 border-l-2 border-slate-150 last:border-l-0 pb-4 last:pb-0 text-[10px] font-semibold text-slate-500">
                        {/* Timeline Bullet */}
                        <div className="absolute -left-1.5 top-0.5 h-2.5 w-2.5 bg-blue-600 rounded-full border border-white shadow shadow-blue-500/30"></div>
                        
                        <div className="flex items-center justify-between font-black text-slate-700 text-[10px]">
                          <span>{t.tipo_contato}</span>
                          <span className="text-[9px] text-slate-400 font-bold">{new Date(t.created_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <p className="mt-1 text-slate-500 font-medium leading-relaxed">&ldquo;{t.relato_detalhado}&rdquo;</p>
                        <span className="block mt-1 text-[8px] font-bold text-blue-600/80 uppercase">Por: {t.tecnico_name}</span>
                      </div>
                    ))}

                    {selectedTimeline.length === 0 && (
                      <div className="text-center py-6 text-slate-400 font-bold text-[10px] italic">
                        Nenhum registro histórico anotado para este jovem.
                      </div>
                    )}
                  </div>
                </div>

              </motion.div>
            ) : (
              <div className="text-center py-10 text-slate-450 font-semibold text-xs bg-white rounded-3xl border border-slate-100 shadow-sm">
                Selecione um jovem na fila para visualizar o diagnóstico completo.
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
