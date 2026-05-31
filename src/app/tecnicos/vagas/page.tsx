"use client";

import React, { useState, useEffect } from 'react';
import { Building, Briefcase, Brain, Users, Sparkles, X, ChevronRight, CheckCircle2, DollarSign, Clock, User } from 'lucide-react';
import { db } from '../../../lib/db';
import type { Vacancy, Company, Youth } from '../../../lib/db';

interface MatchCandidate {
  youth: Youth;
  score: number;
  reasons: string[];
}

export default function TecnicosVagasPage() {
  const [vagas, setVagas] = useState<Vacancy[]>([]);
  const [empresas, setEmpresas] = useState<Company[]>([]);
  
  // Interactive modal states
  const [selectedVaga, setSelectedVaga] = useState<Vacancy | null>(null);
  const [matchCandidates, setMatchCandidates] = useState<MatchCandidate[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setVagas(db.getVagas());
    setEmpresas(db.getEmpresas());
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // IA Matching Engine
  const calculateMatches = (vaga: Vacancy): MatchCandidate[] => {
    const youths = db.getYouthList();
    
    // Filter active young candidates
    const eligible = youths.filter(
      y => y.status_atual === 'Pendente' || y.status_atual === 'Em Curso' || y.status_atual === 'Alerta'
    );

    const matchesList = eligible.map(youth => {
      let score = 60;
      const reasons: string[] = [];

      // Vulnerability Boost
      if (youth.score_vulnerabilidade >= 10) {
        score += 25;
        reasons.push('Prioridade social (Urgência Crítica)');
      } else if (youth.score_vulnerabilidade >= 6) {
        score += 15;
        reasons.push('Alta vulnerabilidade socioeconômica');
      }

      // Age checks
      const age = 16; // average mock age
      if (age >= vaga.idade_minima) {
        score += 10;
        reasons.push('Atende à idade mínima');
      } else {
        score -= 20;
      }

      // Escolaridade
      if (youth.escolaridade.toLowerCase().includes('médio')) {
        score += 8;
        reasons.push('Nível médio compatível');
      }

      // Location match (same city / neighborhood proximity mock)
      if (youth.bairro) {
        score += 5;
        reasons.push(`Acesso local fácil (${youth.bairro})`);
      }

      const finalScore = Math.min(98, Math.max(35, score));

      return {
        youth,
        score: finalScore,
        reasons: reasons.slice(0, 3)
      };
    });

    return matchesList
      .sort((a, b) => b.score - a.score)
      .slice(0, 3); // top 3 matches
  };

  const handleOpenMatches = (vaga: Vacancy) => {
    const matches = calculateMatches(vaga);
    setMatchCandidates(matches);
    setSelectedVaga(vaga);
  };

  const handleReferral = (youthId: string, youthName: string, vagaId: string, cargo: string) => {
    db.createReferral(youthId, vagaId);
    setSelectedVaga(null);
    showToast(`🎉 ${youthName.split(' ')[0]} encaminhado com sucesso para a vaga de ${cargo}!`);
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-600 shadow-xl text-white font-bold px-6 py-3.5 rounded-2xl text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Title */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-2">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Empresas Parceiras & Vagas</h2>
        <p className="text-xs text-slate-400 font-semibold leading-none">Relação de postos abertos pelas empresas de Pirapora conveniadas ao Descubra.</p>
      </div>

      {/* Vagas List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {vagas.map(v => {
          const emp = empresas.find(e => e.id === v.empresa_id);
          const topMatch = calculateMatches(v)[0]; // Get the absolute top recommendation
          
          return (
            <div 
              key={v.id} 
              onClick={() => handleOpenMatches(v)}
              className="bg-white p-5 rounded-3xl border border-slate-100 flex flex-col justify-between gap-4 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all active:scale-[0.99] cursor-pointer group relative overflow-hidden"
            >
              <div>
                <span className="absolute top-5 right-5 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                  {v.tipo}
                </span>

                <div className="flex items-center gap-3">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150 shrink-0 group-hover:bg-indigo-50 transition-colors">
                    <Building className="h-6 w-6 text-slate-500 group-hover:text-indigo-650" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-950 group-hover:text-indigo-600 transition-colors">{v.cargo}</h4>
                    <p className="text-xs text-slate-400 font-bold mt-0.5">{emp?.nome_fantasia || emp?.razao_social}</p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 mt-3 flex flex-col gap-1.5 text-xs text-slate-650 font-semibold">
                  <p className="flex justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[9px]">Horário:</span> 
                    <span className="text-slate-800 font-medium">{v.horario}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[9px]">Bolsa Auxílio:</span> 
                    <span className="text-slate-900 font-extrabold">R$ {v.bolsa_auxilio.toFixed(2)}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[9px]">Requisitos:</span> 
                    <span className="text-slate-800 font-medium">Idade mín. {v.idade_minima} · {v.escolaridade_exigida}</span>
                  </p>
                </div>

                {/* Skill Badges */}
                <div className="flex items-center gap-1.5 flex-wrap mt-3.5">
                  {v.competencias_desejadas.map(sk => (
                    <span key={sk} className="text-[9px] font-bold bg-slate-50 text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded-md">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom IA recommendation preview */}
              {v.status_vaga === 'Aberta' && topMatch && (
                <div className="border-t border-slate-100 pt-3 mt-1 flex items-center justify-between bg-indigo-50/40 -mx-5 -mb-5 px-5 py-3 group-hover:bg-indigo-50/80 transition-colors">
                  <span className="text-[10px] font-black text-indigo-900 flex items-center gap-1">
                    <Brain className="h-3.5 w-3.5 text-indigo-600 animate-pulse shrink-0" />
                    Recomendado: {topMatch.youth.nome_completo.split(' ')[0]} ({topMatch.score}% Match)
                  </span>
                  <span className="text-[9px] font-black text-indigo-650 flex items-center gap-0.5">
                    Ver Candidato <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* DYNAMIC MATCH ENGINE DRAWER/MODAL */}
      {selectedVaga && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-fadeIn">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-900 to-indigo-950 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-400/20 p-2.5 rounded-2xl border border-indigo-400/30">
                  <Brain className="h-5.5 w-5.5 text-indigo-300" />
                </div>
                <div>
                  <h3 className="text-white text-base font-black leading-tight">Sugestão de Candidato Ideal (IA Match)</h3>
                  <p className="text-indigo-300 text-xs mt-0.5 font-semibold">Cota aberta para {selectedVaga.cargo}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedVaga(null)}
                className="bg-white/10 hover:bg-white/20 text-white/80 p-2 rounded-2xl transition-colors cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex flex-col gap-6">
              
              {/* Vacancy specs card summary */}
              <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl flex flex-col gap-2 font-sans text-xs">
                <h4 className="font-black text-slate-800 text-sm flex items-center gap-1.5 leading-none mb-1">
                  <Building className="h-4 w-4 text-slate-500" />
                  {selectedVaga.cargo}
                </h4>
                <div className="grid grid-cols-2 gap-3 text-slate-650 font-semibold border-t border-slate-100 pt-2.5 mt-1.5">
                  <p className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-slate-400" /> {selectedVaga.horario}</p>
                  <p className="flex items-center gap-1.5"><DollarSign className="h-3.5 w-3.5 text-slate-400" /> R$ {selectedVaga.bolsa_auxilio.toFixed(2)}/mês</p>
                  <p className="flex items-center gap-1.5 md:col-span-2"><User className="h-3.5 w-3.5 text-slate-400" /> Requisitos: Idade mín. {selectedVaga.idade_minima} anos · {selectedVaga.escolaridade_exigida}</p>
                </div>
              </div>

              {/* Candidates matching section */}
              <div className="flex flex-col gap-4">
                <h4 className="text-[10px] font-black uppercase text-slate-450 tracking-wider">Técnico CREAS/CRAS: Jovens Sugeridos</h4>
                
                {matchCandidates.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs font-semibold">
                    Nenhum jovem com status compatível no programa atualmente.
                  </div>
                ) : (
                  matchCandidates.map(({ youth, score, reasons }, idx) => {
                    const youthInitial = youth.nome_completo.charAt(0).toUpperCase();
                    const isTop = idx === 0;

                    return (
                      <div 
                        key={youth.id}
                        className={`border rounded-3xl p-4.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all relative overflow-hidden ${
                          isTop 
                            ? 'border-indigo-200 bg-indigo-50/15 shadow-sm' 
                            : 'border-slate-100 bg-slate-50/50'
                        }`}
                      >
                        {/* IA Best choice ribbon */}
                        {isTop && (
                          <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[8px] font-black uppercase px-2.5 py-0.5 rounded-bl-xl tracking-wider flex items-center gap-0.5 shadow-sm">
                            <Sparkles className="h-2.5 w-2.5" /> Recomendação IA
                          </div>
                        )}

                        <div className="flex items-start gap-3">
                          <div className={`h-11 w-11 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0 shadow-sm ${
                            isTop ? 'bg-indigo-650' : 'bg-slate-400'
                          }`}>
                            {youthInitial}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-black text-slate-900">{youth.nome_completo}</p>
                              <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border ${
                                youth.score_vulnerabilidade >= 10 ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                youth.score_vulnerabilidade >= 6 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                'bg-blue-50 text-blue-700 border-blue-200'
                              }`}>
                                Urgência: {youth.score_vulnerabilidade >= 10 ? 'Crítica' : youth.score_vulnerabilidade >= 6 ? 'Alta' : 'Média'}
                              </span>
                            </div>

                            <p className="text-xs text-slate-400 font-bold mt-1">
                              Bairro: {youth.bairro} · {youth.escolaridade}
                            </p>

                            <div className="flex flex-wrap gap-1 mt-2.5">
                              {reasons.map((r, i) => (
                                <span key={i} className="bg-white border border-slate-150 text-slate-650 text-[9px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                                  {r}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Match score & Call to action */}
                        <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-slate-100 sm:border-0 pt-3 sm:pt-0 shrink-0">
                          
                          <div className="flex items-center gap-2 text-right">
                            <div>
                              <p className="text-[8px] font-bold text-slate-400 leading-none">Compatibilidade</p>
                              <p className={`text-sm font-black mt-0.5 ${
                                score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-indigo-600' : 'text-amber-600'
                              }`}>{score}%</p>
                            </div>
                            <div className="w-10 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-indigo-500' : 'bg-amber-500'
                                }`}
                                style={{ width: `${score}%` }}
                              />
                            </div>
                          </div>

                          <button 
                            onClick={() => handleReferral(youth.id, youth.nome_completo, selectedVaga.id, selectedVaga.cargo)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95 shrink-0 cursor-pointer"
                          >
                            Encaminhar Jovem
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-semibold leading-none">Triagem com inteligência social integrada</span>
              <button 
                onClick={() => setSelectedVaga(null)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-black px-5 py-2 rounded-xl transition-all"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
