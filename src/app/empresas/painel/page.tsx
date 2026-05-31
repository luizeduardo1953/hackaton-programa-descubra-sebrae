"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building, Users, Briefcase, FileText, CheckCircle, XCircle, Award, Star, Plus, X, Eye, MapPin, GraduationCap, Phone, Calendar, ShieldAlert, ArrowRight } from 'lucide-react';
import { db } from '../../../lib/db';
import type { Vacancy, Referral, Youth, Company, CompanyAction } from '../../../lib/db';

import { PageHeader } from '../../../components/ui/PageHeader';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';

// Import custom company seals images
import BronzeSeal from '../../assets/watermark-removed-bronze.jpeg';
import PrataSeal from '../../assets/watermark-removed-prata.jpeg';
import OuroSeal from '../../assets/watermark-removed-ouro.jpeg';

export default function EmpresasPainelPage() {
  const [empresa, setEmpresa] = useState<Company | null>(null);
  const [vagas, setVagas] = useState<Vacancy[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [youthList, setYouthList] = useState<Youth[]>([]);
  const [actions, setActions] = useState<CompanyAction[]>([]);
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newActionTipo, setNewActionTipo] = useState<CompanyAction['tipo']>('Visita Técnica');

  useEffect(() => {
    syncData();
  }, []);

  const syncData = () => {
    // SEBRAE company id is 'e1'
    const emp = db.getEmpresas().find(e => e.id === 'e1') || null;
    setEmpresa(emp);
    setVagas(db.getVagas().filter(v => v.empresa_id === 'e1'));
    setReferrals(db.getReferrals());
    setYouthList(db.getYouthList());
    setActions(db.getCompanyActions('e1'));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLogAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (empresa) {
      db.logCompanyAction(empresa.id, undefined, newActionTipo);
      syncData();
      setIsModalOpen(false);
      setNewActionTipo('Visita Técnica');
      showToast('Ação registrada com sucesso! Seus pontos foram atualizados.');
    }
  };

  const pts = empresa?.pontos_engajamento || 0;
  
  const getMedalha = (selo: string | undefined) => {
    if (selo === 'Ouro') return { 
      nome: 'Selo Ouro', 
      icon: <img src={OuroSeal.src} alt="Selo Ouro" className="h-16 w-16 rounded-2xl object-cover border-2 border-amber-400 shadow-md animate-pulse" />, 
      bg: 'bg-gradient-to-br from-yellow-50 to-amber-100', 
      border: 'border-yellow-200', 
      text: 'text-yellow-750 font-black', 
      description: 'Empresa com engajamento máximo e contratações excepcionais.' 
    };
    if (selo === 'Prata') return { 
      nome: 'Selo Prata', 
      icon: <img src={PrataSeal.src} alt="Selo Prata" className="h-16 w-16 rounded-2xl object-cover border-2 border-slate-300 shadow-md" />, 
      bg: 'bg-gradient-to-br from-slate-50 to-slate-200', 
      border: 'border-slate-300', 
      text: 'text-slate-750 font-black', 
      description: 'Empresa engajada em mentorias e visitas técnicas recorrentes.' 
    };
    // Default to Bronze (including when null/undefined)
    return { 
      nome: 'Selo Bronze', 
      icon: <img src={BronzeSeal.src} alt="Selo Bronze" className="h-16 w-16 rounded-2xl object-cover border-2 border-amber-600 shadow-md" />, 
      bg: 'bg-gradient-to-br from-orange-50 to-amber-100', 
      border: 'border-amber-300', 
      text: 'text-amber-900 font-black', 
      description: 'Empresa parceira com ações de campo registradas.' 
    };
  };

  const medalha = getMedalha(empresa?.selo);

  // Dynamic metrics calculations
  const mentorshipSessionsDone = actions.filter(act => act.tipo === 'Assistência / Mentoria').length;
  const jobShadowingDone = actions.filter(act => act.tipo === 'Visita Técnica').length;
  const hiredCount = referrals.filter(r => r.status === 'Contratado').length;
  
  const criticalHiredCount = referrals.filter(r => {
    if (r.status !== 'Contratado') return false;
    const y = youthList.find(youth => youth.id === r.jovem_id);
    return y ? y.score_vulnerabilidade >= 8 : false;
  }).length;

  const bronzeUnlocked = mentorshipSessionsDone >= 2 || jobShadowingDone >= 1;
  const prataUnlocked = hiredCount >= 1;
  const ouroUnlocked = criticalHiredCount >= 1 || (hiredCount >= 1 && vagas.some(v => v.tipo === 'Jovem Aprendiz'));

  return (
    <div className="flex flex-col gap-6 animate-fadeIn relative">
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-600 shadow-xl text-white font-bold px-6 py-3.5 rounded-2xl text-xs flex items-center gap-2 animate-fadeIn">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Corporate header details & Gamification */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Header Info */}
        <div className="lg:col-span-2">
          <PageHeader 
            title="Painel de Seleção Corporativo"
            description={<span>Gerencie as vagas de Jovem Aprendiz postadas por <strong>{empresa?.razao_social || 'Sua Empresa'}</strong> e avalie os candidatos recomendados. Participe também do nosso programa de engajamento social!</span>}
          />
        </div>

        {/* Gamification Card */}
        <Card className={`lg:col-span-1 !p-6 flex items-center gap-4 ${medalha.bg} ${medalha.border} relative overflow-hidden`} glass={false}>
          {/* Subtle shine effect */}
          <div className="absolute inset-0 bg-white/40 mix-blend-overlay"></div>
          
          <div className="relative z-10 shrink-0 filter drop-shadow-md">
            {medalha.icon}
          </div>
          <div className="relative z-10 flex flex-col flex-1">
            <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Selo de Engajamento</span>
            <h3 className={`text-xl font-black ${medalha.text} leading-tight mt-0.5`}>{medalha.nome}</h3>
            <p className="text-[10px] text-slate-500 font-semibold leading-tight mt-1.5">{medalha.description}</p>
            <span className="text-[8px] font-black uppercase tracking-widest text-indigo-650 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-lg w-max mt-3 select-none">
              Homologado pelo Admin
            </span>
          </div>
        </Card>
      </div>

      {/* Minha Jornada de Impacto Widget */}
      <Card className="!p-6 flex flex-col gap-6" glass={false}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[9px] font-black uppercase text-indigo-650 tracking-wider">Metas Sociais</span>
            <h3 className="text-base font-black text-slate-950 mt-0.5">Minha Jornada de Impacto Descubra</h3>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
              Conclua missões de impacto social e contrate jovens para destravar selos exclusivos para a sua marca.
            </p>
          </div>
          <Link 
            href="/empresas/selos" 
            className="text-[11px] font-black text-indigo-650 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-all self-start sm:self-center flex items-center gap-1.5 border border-indigo-100"
          >
            Manual de Selos <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Linha do tempo visual */}
        <div className="relative flex flex-col md:flex-row justify-between gap-6 py-2">
          {/* Connector horizontal line */}
          <div className="hidden md:block absolute left-8 right-8 top-8 h-0.5 bg-slate-150 -z-0"></div>

          {/* Node 1: Bronze */}
          <div className="flex items-start md:items-center md:flex-col gap-4 text-left md:text-center md:w-1/3 relative z-10">
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border-2 shadow-sm ${
              bronzeUnlocked ? 'bg-amber-50 border-amber-600' : 'bg-slate-50 border-slate-200 opacity-60'
            }`}>
              <img src={BronzeSeal.src} alt="Bronze" className="h-10 w-10 rounded-xl object-cover" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 md:justify-center">
                <span className="text-xs font-black text-slate-900">Selo Bronze</span>
                <Badge variant={bronzeUnlocked ? 'success' : 'neutral'}>
                  {bronzeUnlocked ? 'Conquistado' : 'Bloqueado'}
                </Badge>
              </div>
              <p className="text-[10px] text-slate-500 font-bold leading-tight mt-0.5">
                Progresso: {mentorshipSessionsDone}/2 Mentorias ou {jobShadowingDone}/1 Job Shadowing
              </p>
            </div>
          </div>

          {/* Node 2: Prata */}
          <div className="flex items-start md:items-center md:flex-col gap-4 text-left md:text-center md:w-1/3 relative z-10">
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border-2 shadow-sm ${
              prataUnlocked ? 'bg-slate-100 border-slate-350' : 'bg-slate-50 border-slate-200 opacity-60'
            }`}>
              <img src={PrataSeal.src} alt="Prata" className="h-10 w-10 rounded-xl object-cover" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 md:justify-center">
                <span className="text-xs font-black text-slate-900">Selo Prata</span>
                <Badge variant={prataUnlocked ? 'success' : 'neutral'}>
                  {prataUnlocked ? 'Conquistado' : 'Bloqueado'}
                </Badge>
              </div>
              <p className="text-[10px] text-slate-500 font-bold leading-tight mt-0.5">
                Progresso: {hiredCount}/1 Contratação CLT ou Estágio
              </p>
            </div>
          </div>

          {/* Node 3: Ouro */}
          <div className="flex items-start md:items-center md:flex-col gap-4 text-left md:text-center md:w-1/3 relative z-10">
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border-2 shadow-sm ${
              ouroUnlocked ? 'bg-yellow-50 border-amber-400 animate-pulse' : 'bg-slate-50 border-slate-200 opacity-60'
            }`}>
              <img src={OuroSeal.src} alt="Ouro" className="h-10 w-10 rounded-xl object-cover" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 md:justify-center">
                <span className="text-xs font-black text-slate-900">Selo Ouro</span>
                <Badge variant={ouroUnlocked ? 'success' : 'neutral'}>
                  {ouroUnlocked ? 'Conquistado' : 'Bloqueado'}
                </Badge>
              </div>
              <p className="text-[10px] text-slate-500 font-bold leading-tight mt-0.5">
                Missão: Contratar jovem com prioridade social
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex flex-col gap-6">
        
        {/* HEADER & MANAGE ACTION */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-indigo-600 shrink-0" />
              Nossas Vagas Publicadas
            </h3>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
              Confira as oportunidades de contratação disponibilizadas por sua empresa.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="text-[11px] font-black text-white bg-indigo-600 hover:bg-indigo-750 px-4 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer"
            >
              Registrar Ação Social
            </button>
            <Link 
              href="/empresas/vagas" 
              className="text-[11px] font-black text-indigo-600 hover:text-indigo-855 bg-indigo-50 hover:bg-indigo-100 px-4 py-2.5 rounded-xl border border-indigo-100 transition-all"
            >
              Nova Vaga
            </Link>
          </div>
        </div>

        {/* VACANCIES GRID */}
        {vagas.length === 0 ? (
          <Card className="text-center py-12 text-slate-400" glass={false}>
            <Briefcase className="h-10 w-10 mx-auto text-slate-200 mb-2" />
            <p className="text-xs font-semibold">Nenhuma vaga cadastrada por sua empresa ainda.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vagas.map(v => (
              <Card key={v.id} className="!p-5 flex flex-col justify-between gap-4 relative group hover:border-indigo-300 transition-all hover:shadow-sm" glass={false}>
                <div>
                  <div className="flex justify-between items-center gap-2">
                    <Badge variant={v.status_vaga === 'Aberta' ? 'success' : 'neutral'}>
                      {v.status_vaga === 'Aberta' ? 'Aberta' : v.status_vaga === 'Preenchida' ? 'Preenchida' : 'Cancelada'}
                    </Badge>
                    <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider font-mono">{v.tipo}</span>
                  </div>
                  
                  <h4 className="text-base font-black text-slate-950 mt-3 group-hover:text-indigo-600 transition-colors">
                    {v.cargo}
                  </h4>
                  
                  <p className="text-xs font-semibold text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    Requisitos: {v.escolaridade_exigida} · Mínimo {v.idade_minima} anos
                  </p>

                  <div className="flex flex-col gap-2 border-t border-slate-100 pt-3.5 mt-3.5 text-xs font-semibold text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-bold">Quantidade:</span>
                      <span className="text-slate-800">{v.quantidade} vagas</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-bold">Bolsa-Auxílio:</span>
                      <span className="text-slate-900 font-black">R$ {v.bolsa_auxilio.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-bold">Horário:</span>
                      <span className="text-slate-750 truncate max-w-[160px]">{v.horario}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                  <span>ID: {v.id.toUpperCase()}</span>
                  <Link href="/empresas/vagas" className="text-indigo-600 hover:text-indigo-850 font-black flex items-center gap-0.5">
                    Detalhes Vaga <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal Nova Ação */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl relative z-10 overflow-hidden animate-fadeIn flex flex-col">
            <div className="bg-slate-900 p-6 text-white relative">
              <h3 className="text-xl font-black">Registrar Ação Social</h3>
              <p className="text-slate-400 text-xs mt-1">Acumule pontos e ganhe selos da Assistência Social.</p>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-xl text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <form onSubmit={handleLogAction} className="p-6 flex flex-col gap-5">
              
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Qual tipo de ação foi realizada?</label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { tipo: 'Visita Técnica', pt: 50, desc: 'Apresentação da empresa para jovens' },
                    { tipo: 'Assistência / Mentoria', pt: 150, desc: 'Apoio em feiras, doações ou workshops' },
                  ].map(a => (
                    <label key={a.tipo} className={`flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all ${newActionTipo === a.tipo ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-indigo-200'}`}>
                      <input 
                        type="radio" 
                        name="tipo_acao" 
                        value={a.tipo}
                        checked={newActionTipo === a.tipo}
                        onChange={(e) => setNewActionTipo(e.target.value as any)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${newActionTipo === a.tipo ? 'border-indigo-600' : 'border-slate-300'}`}>
                        {newActionTipo === a.tipo && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></div>}
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-sm font-black ${newActionTipo === a.tipo ? 'text-indigo-900' : 'text-slate-700'}`}>{a.tipo} <span className="text-[10px] text-emerald-600 ml-1">+{a.pt} pts</span></span>
                        <span className="text-[10px] text-slate-500 font-semibold">{a.desc}</span>
                      </div>
                    </label>
                  ))}
                  <div className="text-[10px] text-slate-400 font-medium italic p-2">
                    Nota: O preenchimento e contratações de suas vagas de Jovem Aprendiz são gerenciados e validados pelo CRAS/CREAS administrativamente.
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-95 cursor-pointer"
              >
                Registrar e Ganhar Pontos
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
