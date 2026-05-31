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
  const [newActionJovem, setNewActionJovem] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<(Youth & { vulnerabilidades?: any }) | null>(null);

  const handleSelectProfile = (y: Youth) => {
    const data = db.getYouthById(y.id);
    if (data) {
      setSelectedProfile({
        ...data.youth,
        vulnerabilidades: data.vulnerabilities
      });
    } else {
      setSelectedProfile(null);
    }
  };

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

  const handleEvaluateCandidate = (refId: string, status: Referral['status']) => {
    db.updateReferralStatus(refId, status, `Avaliado pela empresa em ${new Date().toLocaleDateString('pt-BR')}`);
    syncData();
    showToast(status === 'Contratado' ? '🎉 Parabéns! Jovem contratado. Empresa ganhou 500pts (Selo Ouro)!' : 'Candidato recusado.');
  };

  const handleLogAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (empresa) {
      db.logCompanyAction(empresa.id, newActionJovem || undefined, newActionTipo);
      syncData();
      setIsModalOpen(false);
      setNewActionJovem('');
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMN 1: POSTED VACANCIES (SEBRAE ONLY) */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-indigo-600 shrink-0" />
            Nossas Vagas Postadas
          </h3>

          {vagas.length === 0 ? (
            <span className="text-xs text-slate-400 italic">Nenhuma vaga cadastrada.</span>
          ) : (
            vagas.map(v => (
              <Card key={v.id} className="!p-5 flex flex-col gap-2 relative group hover:border-indigo-200" glass={false}>
                <div className="absolute top-4 right-4">
                  <Badge variant="info">{v.tipo}</Badge>
                </div>
                <h4 className="text-sm font-black text-slate-950 mt-1 pr-16">{v.cargo}</h4>
                <div className="flex flex-col gap-1 border-t border-slate-100 pt-3 mt-1 text-xs font-semibold text-slate-600 leading-relaxed">
                  <p><strong>Quantidade:</strong> {v.quantidade} vagas</p>
                  <p><strong>Bolsa:</strong> R$ {v.bolsa_auxilio.toFixed(2)}</p>
                  <p><strong>Horário:</strong> {v.horario}</p>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* COLUMN 2 & 3: MATCHED REFERRALS CANDIDATE VIEWER */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600 shrink-0" />
            Candidatos Recomendados (Fila de Prioridade)
          </h3>

          {/* Filtering referrals targeting Sebrae vacancies */}
          {(() => {
            const sebraeVagaIds = vagas.map(v => v.id);
            const sebraeReferrals = referrals.filter(r => sebraeVagaIds.includes(r.vaga_id));

            if (sebraeReferrals.length === 0) {
              return (
                <Card className="text-center py-12 text-slate-400" glass={false}>
                  <Users className="h-10 w-10 mx-auto text-slate-200 mb-2" />
                  <p className="text-xs font-semibold">Aguardando recomendações dos técnicos do CRAS/CREAS...</p>
                </Card>
              );
            }

            return (
              <div className="flex flex-col gap-4">
                {sebraeReferrals.map(r => {
                  const y = youthList.find(youth => youth.id === r.jovem_id);
                  const v = vagas.find(vaga => vaga.id === r.vaga_id);
                  if (!y) return null;

                  const age = new Date().getFullYear() - new Date(y.data_nascimento).getFullYear();
                  return (
                    <Card key={r.id} className="!p-5 flex flex-col gap-4 group hover:border-indigo-200" glass={false}>
                      {/* Candidate info row */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center text-indigo-600 shrink-0 shadow-inner">
                            <span className="font-black text-lg">{y.nome_completo[0].toUpperCase()}</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-black uppercase text-indigo-600 tracking-wider">Candidato para: {v?.cargo}</span>
                            <h4 className="text-base font-black text-slate-950 mt-0.5">{y.nome_completo}</h4>
                            <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] font-semibold text-slate-500">
                              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{age} anos</span>
                              <span className="text-slate-300">•</span>
                              <span className="flex items-center gap-1"><GraduationCap className="h-3 w-3" />{y.escolaridade}</span>
                              <span className="text-slate-300">•</span>
                              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{y.bairro}</span>
                            </div>
                          </div>
                        </div>
                        {/* Score badge */}
                        <div className="shrink-0 flex flex-col items-center bg-indigo-50 border border-indigo-100 rounded-2xl px-3 py-2">
                          <span className="text-[9px] font-black uppercase text-indigo-500">Score</span>
                          <span className={`text-lg font-black ${
                            y.score_vulnerabilidade >= 8 ? 'text-rose-600' :
                            y.score_vulnerabilidade >= 4 ? 'text-amber-600' : 'text-emerald-600'
                          }`}>{y.score_vulnerabilidade}</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                        <button
                          onClick={() => handleSelectProfile(y)}
                          className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-xl text-xs font-black transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Ver Perfil Completo
                        </button>

                        <div className="flex items-center gap-2">
                          {r.status === 'Selecionado para Entrevista' ? (
                            <>
                              <button 
                                onClick={() => handleEvaluateCandidate(r.id, 'Recusado pela Empresa')}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-2 rounded-xl text-xs font-black shadow-sm flex items-center gap-1 border border-rose-100 transition-colors"
                              >
                                <XCircle className="h-4 w-4" />
                                Reprovar
                              </button>
                              <button 
                                onClick={() => handleEvaluateCandidate(r.id, 'Contratado')}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-black shadow-md flex items-center gap-1 transition-all"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Contratar!
                              </button>
                            </>
                          ) : (
                            <Badge variant={r.status === 'Contratado' ? 'success' : 'error'}>
                              {r.status === 'Contratado' ? '✅ Contratado' : '❌ Reprovado'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            );
          })()}
        </div>

      </div>

      {/* ── CANDIDATE PROFILE MODAL ── */}
      {selectedProfile && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setSelectedProfile(null)} />
          <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl relative z-10 overflow-hidden animate-fadeIn flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 p-6 relative flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-white text-2xl font-black shrink-0">
                {selectedProfile.nome_completo[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-indigo-300 text-[10px] font-black uppercase tracking-widest">Perfil do Candidato</p>
                <h3 className="text-white text-xl font-black leading-tight mt-0.5">{selectedProfile.nome_completo}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                    selectedProfile.status_atual === 'Pendente' ? 'bg-amber-400/20 text-amber-300' :
                    selectedProfile.status_atual === 'Em Curso' ? 'bg-emerald-400/20 text-emerald-300' :
                    'bg-rose-400/20 text-rose-300'
                  }`}>{selectedProfile.status_atual}</span>
                  <span className="text-indigo-300 text-[10px] font-semibold">{selectedProfile.bairro} · Pirapora/MG</span>
                </div>
              </div>
              <button onClick={() => setSelectedProfile(null)} className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-xl text-white transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto p-6 flex flex-col gap-5">
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 rounded-2xl p-3 text-center border border-slate-100">
                  <p className="text-[9px] font-black uppercase text-slate-400">Idade</p>
                  <p className="text-xl font-black text-slate-900 mt-0.5">
                    {new Date().getFullYear() - new Date(selectedProfile.data_nascimento).getFullYear()}
                  </p>
                  <p className="text-[9px] text-slate-400 font-semibold">anos</p>
                </div>
                <div className={`rounded-2xl p-3 text-center border ${
                  selectedProfile.score_vulnerabilidade >= 8 ? 'bg-rose-50 border-rose-100' :
                  selectedProfile.score_vulnerabilidade >= 4 ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100'
                }`}>
                  <p className="text-[9px] font-black uppercase text-slate-400">Vulnerab.</p>
                  <p className={`text-xl font-black mt-0.5 ${
                    selectedProfile.score_vulnerabilidade >= 8 ? 'text-rose-600' :
                    selectedProfile.score_vulnerabilidade >= 4 ? 'text-amber-600' : 'text-emerald-600'
                  }`}>{selectedProfile.score_vulnerabilidade}</p>
                  <p className="text-[9px] text-slate-400 font-semibold">score</p>
                </div>
                <div className="bg-indigo-50 rounded-2xl p-3 text-center border border-indigo-100">
                  <p className="text-[9px] font-black uppercase text-slate-400">Sexo</p>
                  <p className="text-xl font-black text-indigo-700 mt-0.5">{selectedProfile.sexo}</p>
                  <p className="text-[9px] text-slate-400 font-semibold">{selectedProfile.cor_raca}</p>
                </div>
              </div>

              {/* Personal data */}
              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Dados Pessoais</p>
                <div className="bg-slate-50 rounded-2xl p-4 grid grid-cols-2 gap-3 border border-slate-100">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Escolaridade</p>
                    <p className="text-xs font-black text-slate-800 mt-0.5 flex items-center gap-1"><GraduationCap className="h-3 w-3 text-indigo-500" />{selectedProfile.escolaridade}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Bairro</p>
                    <p className="text-xs font-black text-slate-800 mt-0.5 flex items-center gap-1"><MapPin className="h-3 w-3 text-indigo-500" />{selectedProfile.bairro}</p>
                  </div>
                  {selectedProfile.telefone && (
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Telefone</p>
                      <p className="text-xs font-black text-slate-800 mt-0.5 flex items-center gap-1"><Phone className="h-3 w-3 text-emerald-500" />{selectedProfile.telefone}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Responsável</p>
                    <p className="text-xs font-black text-slate-800 mt-0.5">{selectedProfile.nome_responsavel || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Social factors */}
              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Fatores Sociais</p>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { label: 'Bolsa Família', value: selectedProfile.vulnerabilidades?.bolsa_familia },
                    { label: 'CadÚnico', value: selectedProfile.vulnerabilidades?.cad_unico },
                    { label: 'Medida Socioeducativa', value: selectedProfile.vulnerabilidades?.medida_socioeducativa, critical: true },
                    { label: 'Deficiência (PCD)', value: selectedProfile.vulnerabilidades?.deficiencia },
                    { label: 'Sem Acesso à Internet', value: !selectedProfile.vulnerabilidades?.acesso_internet },
                    { label: 'Dif. de Transporte', value: selectedProfile.vulnerabilidades?.dificuldade_transporte },
                    { label: 'Abandonou Escola', value: selectedProfile.vulnerabilidades?.abandonou_escola, critical: true },
                    { label: 'Acomp. Psicológico', value: selectedProfile.vulnerabilidades?.acompanhamento_psicologico },
                  ] as {label: string; value: boolean | undefined; critical?: boolean}[]).map(f => (
                    <div key={f.label} className={`flex items-center gap-2 p-2.5 rounded-xl border text-[10px] font-bold ${
                      f.value 
                        ? (f.critical ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-amber-50 border-amber-100 text-amber-800')
                        : 'bg-slate-50 border-slate-100 text-slate-400'
                    }`}>
                      <div className={`w-2 h-2 rounded-full shrink-0 ${
                        f.value ? (f.critical ? 'bg-rose-500' : 'bg-amber-400') : 'bg-slate-300'
                      }`} />
                      {f.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-end">
              <button onClick={() => setSelectedProfile(null)} className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-black px-5 py-2.5 rounded-xl transition-all">
                Fechar Perfil
              </button>
            </div>
          </div>
        </div>
      )}

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
                className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-xl text-white transition-colors"
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
                    Nota: A contratação via dashboard gera +500 pts e o Selo Ouro automaticamente!
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Jovem Participante (Opcional)</label>
                <select 
                  value={newActionJovem}
                  onChange={e => setNewActionJovem(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-2xl focus:ring-indigo-600 focus:border-indigo-600 block w-full p-3 font-semibold outline-none"
                >
                  <option value="">Ação com múltiplos jovens ou sem vínculo</option>
                  {youthList.map(y => (
                    <option key={y.id} value={y.id}>{y.nome_completo}</option>
                  ))}
                </select>
              </div>

              <button 
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
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
