"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, CheckCircle, AlertTriangle, Phone, MessageSquare, 
  Calendar, FileText, Clock, Briefcase, RefreshCw
} from 'lucide-react';
import { db } from '../../../../lib/db';
import type { Youth, FollowUpLog, Referral, Vacancy, Company } from '../../../../lib/db';

export default function TecnicoJovemDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  
  // Resolve params Promise (Next.js 15+ standard)
  const resolvedParams = React.use(params);
  const { id } = resolvedParams;

  const [youth, setYouth] = useState<Youth | null>(null);
  const [vulnerabilities, setVulnerabilities] = useState<any>(null);
  const [history, setHistory] = useState<FollowUpLog[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [vagas, setVagas] = useState<Vacancy[]>([]);
  const [empresas, setEmpresas] = useState<Company[]>([]);

  // Form states
  const [newFollowUp, setNewFollowUp] = useState({
    tipo_contato: 'WhatsApp' as any,
    relato_detalhado: '',
    status_momento: 'Em Curso' as any,
    motivo_evasao: 'Problema com Transporte' as any
  });
  const [whatsappText, setWhatsappText] = useState('');
  const [selectedVagaId, setSelectedVagaId] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = () => {
    const data = db.getYouthById(id);
    if (data) {
      setYouth(data.youth);
      setVulnerabilities(data.vulnerabilities);
      setHistory(db.getFollowUpsByYouth(id));
      setReferrals(db.getReferrals().filter(r => r.jovem_id === id));
      setVagas(db.getVagas());
      setEmpresas(db.getEmpresas());
    } else {
      router.push('/tecnicos/jovens');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Add Follow Up log
  const handleAddFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!youth || !newFollowUp.relato_detalhado) return;

    db.addFollowUp({
      jovem_id: youth.id,
      tecnico_name: 'Lorena CREAS',
      tipo_contato: newFollowUp.tipo_contato,
      relato_detalhado: newFollowUp.relato_detalhado,
      status_momento: newFollowUp.status_momento,
      motivo_evasao: newFollowUp.status_momento === 'Evadido' ? newFollowUp.motivo_evasao : undefined
    });

    loadData();
    setNewFollowUp(prev => ({ ...prev, relato_detalhado: '' }));
    showToast('Acompanhamento registrado com sucesso!');
  };

  // Parse WhatsApp log
  const handleParseWhatsApp = () => {
    if (!whatsappText.trim()) return;

    const lines = whatsappText.split('\n');
    let parsedLogs = '';
    let extractedStatus: any = 'Em Curso';

    lines.forEach(line => {
      if (line.includes('As mensagens e as chamadas') || line.includes('código de segurança')) return;
      const cleaned = line.replace(/^\[\d{2}:\d{2},\s\d{2}\/\d{2}\/\d{4}\]\s[^:]+:\s/, '')
                         .replace(/^\d{2}\/\d{2}\/\d{4}\s\d{2}:\d{2}\s-\s[^:]+:\s/, '');
      if (cleaned.trim()) {
        parsedLogs += cleaned.trim() + ' ';
      }
    });

    if (!parsedLogs) {
      showToast('Nenhum texto de conversa válido extraído.');
      return;
    }

    const lowerText = parsedLogs.toLowerCase();
    if (lowerText.includes('trabalho') || lowerText.includes('aprendiz') || lowerText.includes('contratado') || lowerText.includes('clt')) {
      extractedStatus = 'Contratado';
    } else if (lowerText.includes('faltou') || lowerText.includes('dificuldade') || lowerText.includes('problema')) {
      extractedStatus = 'Alerta';
    } else if (lowerText.includes('desisti') || lowerText.includes('sai do curso')) {
      extractedStatus = 'Evadido';
    }

    setNewFollowUp(prev => ({
      ...prev,
      tipo_contato: 'WhatsApp',
      status_momento: extractedStatus,
      relato_detalhado: `[Conversa importada do WhatsApp]: ${parsedLogs.substring(0, 400)}${parsedLogs.length > 400 ? '...' : ''}`
    }));

    setWhatsappText('');
    showToast('Conversa do WhatsApp analisada com sucesso!');
  };

  // Create Referral
  const handleCreateReferral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!youth || !selectedVagaId) return;

    const vacancy = vagas.find(v => v.id === selectedVagaId);
    if (youth.escolaridade.includes('Cursando') && vacancy?.horario.toLowerCase().includes('08:00 - 12:00')) {
      showToast('⚠️ ALERTA: Conflito de horário com o turno escolar do jovem detectado!');
    }

    db.createReferral(youth.id, selectedVagaId);
    loadData();
    setSelectedVagaId('');
    showToast('Adolescente encaminhado para entrevista!');
  };

  if (!youth) return null;

  return (
    <div className="flex flex-col gap-6 animate-fadeIn relative">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-600 shadow-xl text-white font-bold px-6 py-3.5 rounded-2xl text-xs flex items-center gap-2 animate-fadeIn">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header title */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Link 
            href="/tecnicos/jovens"
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{youth.cidade} / Bairro: {youth.bairro}</span>
            <h2 className="text-2xl font-black text-slate-900 mt-0.5">{youth.nome_completo}</h2>
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Score */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col justify-between gap-2 shadow-sm">
          <span className="text-xs font-extrabold text-slate-500 uppercase">Prioridade Fila</span>
          <div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-black text-slate-900">{youth.score_vulnerabilidade}</span>
              <span className="text-xs text-slate-400">/ 15 pontos</span>
            </div>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border mt-1.5 inline-block ${
              youth.score_vulnerabilidade >= 9 ? 'bg-rose-50 text-rose-700 border-rose-200' :
              youth.score_vulnerabilidade >= 5 ? 'bg-amber-50 text-amber-700 border-amber-200' :
              'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {youth.score_vulnerabilidade >= 9 ? 'Vulnerabilidade Altíssima' :
               youth.score_vulnerabilidade >= 5 ? 'Vulnerabilidade Média' : 'Vulnerabilidade Baixa'}
            </span>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col justify-between gap-2 shadow-sm">
          <span className="text-xs font-extrabold text-slate-500 uppercase">Status do Programa</span>
          <div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`h-3 w-3 rounded-full ${
                youth.status_atual === 'Contratado' || youth.status_atual === 'Concluído' ? 'bg-emerald-500' :
                youth.status_atual === 'Em Curso' ? 'bg-blue-500' :
                youth.status_atual === 'Alerta' ? 'bg-amber-500' :
                youth.status_atual === 'Evadido' ? 'bg-rose-500' : 'bg-slate-400'
              }`} />
              <span className="text-base font-black text-slate-900">{youth.status_atual}</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Série de Indicação: {youth.ano_indicacao}</span>
          </div>
        </div>

        {/* Contacts */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col justify-between gap-2 shadow-sm">
          <span className="text-xs font-extrabold text-slate-500 uppercase">Dados de Contato</span>
          <div className="flex flex-col gap-1.5 mt-1 justify-center flex-1">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-slate-400" />
              {youth.telefone || 'Sem telefone'}
            </span>
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />
              {youth.whatsapp || 'Sem WhatsApp'}
            </span>
          </div>
        </div>

        {/* Área de Interesse */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col justify-between gap-2 shadow-sm">
          <span className="text-xs font-extrabold text-slate-500 uppercase">Área de Interesse</span>
          <div>
            <div className="flex items-center gap-2 mt-1">
              <span className="p-1 rounded bg-indigo-50 text-indigo-600 shrink-0">
                <Briefcase className="h-4 w-4" />
              </span>
              <span className="text-sm font-black text-slate-900 truncate">
                {youth.area_interesse === 'Outros' 
                  ? (youth.outra_area_interesse || 'Outros') 
                  : (youth.area_interesse || 'Não informada')}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Preferência profissional</span>
          </div>
        </div>
      </div>

      {/* Timelines and parsers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 border-t border-slate-150 pt-6">
        
        {/* COLUMN 1: LINE OF INTERVENTIONS (TIMELINE) */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              Linha do Tempo de Acompanhamento
            </h3>
            <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {history.length} registros
            </span>
          </div>

          <div className="flex flex-col gap-4 max-h-[380px] overflow-y-auto pr-2">
            {history.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-slate-200">
                <Calendar className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400">Nenhum acompanhamento registrado para este jovem ainda.</p>
              </div>
            ) : (
              history.map((item, idx) => (
                <div key={item.id} className="flex gap-4 relative">
                  {idx !== history.length - 1 && (
                    <div className="absolute top-7 bottom-[-16px] left-[15px] w-0.5 bg-slate-200" />
                  )}
                  
                  <div className={`h-8 w-8 rounded-full border-4 border-white flex items-center justify-center shrink-0 shadow-sm ${
                    item.status_momento === 'Contratado' || item.status_momento === 'Concluído' ? 'bg-emerald-500 text-white' :
                    item.status_momento === 'Em Curso' ? 'bg-blue-500 text-white' :
                    item.status_momento === 'Alerta' ? 'bg-amber-500 text-white' :
                    item.status_momento === 'Evadido' ? 'bg-rose-500 text-white' : 'bg-slate-400 text-white'
                  }`}>
                    <Clock className="h-3 w-3" />
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border border-slate-100 flex-1 flex flex-col gap-1.5 shadow-sm">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs font-black text-slate-900">{item.tipo_contato}</span>
                      <span className="text-[10px] text-slate-400 font-bold">
                        {new Date(item.created_at).toLocaleDateString('pt-BR')} - {item.tecnico_name}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">{item.relato_detalhado}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Status:</span>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                        item.status_momento === 'Contratado' ? 'bg-emerald-100 text-emerald-800' :
                        item.status_momento === 'Em Curso' ? 'bg-blue-100 text-blue-800' :
                        item.status_momento === 'Alerta' ? 'bg-amber-100 text-amber-800' :
                        item.status_momento === 'Evadido' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-800'
                      }`}>
                        {item.status_momento}
                      </span>
                      {item.motivo_evasao && (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
                          Motivo: {item.motivo_evasao}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Form log */}
          <form onSubmit={handleAddFollowUp} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-3">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">Registrar Novo Acompanhamento</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase">Tipo</label>
                <select 
                  value={newFollowUp.tipo_contato}
                  onChange={(e) => setNewFollowUp(prev => ({ ...prev, tipo_contato: e.target.value as any }))}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-indigo-500"
                >
                  <option value="WhatsApp">Conversa WhatsApp</option>
                  <option value="Contato Telefônico">Ligação Telefônica</option>
                  <option value="Visita Domiciliar">Visita na Casa</option>
                  <option value="Reunião Familiar">Reunião Familiar</option>
                  <option value="Acompanhamento Escolar">Check-in na Escola</option>
                  <option value="Feedback do Curso">Check-in no Curso</option>
                  <option value="Outro">Outro Contato</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase">Novo Status</label>
                <select 
                  value={newFollowUp.status_momento}
                  onChange={(e) => setNewFollowUp(prev => ({ ...prev, status_momento: e.target.value as any }))}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-indigo-500"
                >
                  <option value="Pendente">Pendente (Aguardando)</option>
                  <option value="Em Curso">Em Curso (Regular)</option>
                  <option value="Alerta">Alerta (Risco Evasão)</option>
                  <option value="Evadido">Evadido (Desistiu)</option>
                  <option value="Concluído">Concluído (Formado)</option>
                  <option value="Contratado">Contratado (Trabalhando)</option>
                </select>
              </div>
            </div>

            {newFollowUp.status_momento === 'Evadido' && (
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-extrabold text-rose-600 uppercase">Motivo da Evasão *</label>
                <select 
                  value={newFollowUp.motivo_evasao}
                  onChange={(e) => setNewFollowUp(prev => ({ ...prev, motivo_evasao: e.target.value as any }))}
                  className="bg-slate-50 border border-rose-200 rounded-xl px-3 py-2 text-xs font-bold text-rose-800 focus:outline-rose-500"
                >
                  <option value="Problema com Transporte">Problema com Transporte</option>
                  <option value="Conflito de Horário com Escola">Conflito de Horário com Escola</option>
                  <option value="Necessidade de Renda Imediata">Necessidade de Renda Imediata</option>
                  <option value="Falta de Interesse">Falta de Interesse</option>
                  <option value="Mudança de Endereço">Mudança de Endereço</option>
                  <option value="Problema de Saúde">Problema de Saúde</option>
                  <option value="Outros">Outros Motivos</option>
                </select>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase">Relato do Técnico *</label>
              <textarea 
                value={newFollowUp.relato_detalhado}
                onChange={(e) => setNewFollowUp(prev => ({ ...prev, relato_detalhado: e.target.value }))}
                placeholder="Escreva brevemente o que aconteceu neste atendimento..."
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-indigo-500 h-16 resize-none"
              />
            </div>

            <button 
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-xs font-black shadow-md transition-colors"
            >
              Salvar Acompanhamento (+30 pontos pro Jovem)
            </button>
          </form>
        </div>

          {/* REFERRAL SYSTEM */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-3">
            <div className="flex items-center gap-2 text-slate-900">
              <Briefcase className="h-5 w-5 text-indigo-600 shrink-0" />
              <h4 className="text-sm font-black uppercase tracking-wide">Match-Making de Oportunidades</h4>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Encaminhe este jovem para uma vaga de trabalho aberta compatível com seu perfil.
            </p>

            <form onSubmit={handleCreateReferral} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase">Selecione a Vaga Aberta</label>
                <select 
                  value={selectedVagaId}
                  onChange={(e) => setSelectedVagaId(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-indigo-500"
                >
                  <option value="">-- Escolher vaga disponível --</option>
                  {vagas.filter(v => v.status_vaga === 'Aberta').map(v => {
                    const emp = empresas.find(e => e.id === v.empresa_id);
                    return (
                      <option key={v.id} value={v.id}>
                        {v.cargo} ({v.tipo}) - {emp?.nome_fantasia || 'Empresa'}
                      </option>
                    );
                  })}
                </select>
              </div>

              <button 
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-xs font-black shadow-md transition-colors"
              >
                Encaminhar Jovem para Entrevista
              </button>
            </form>

            <div className="flex flex-col gap-2 mt-2">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase">Histórico de Encaminhamentos:</span>
              {referrals.length === 0 ? (
                <span className="text-[10px] text-slate-400 italic">Nenhum encaminhamento registrado para este jovem.</span>
              ) : (
                referrals.map(r => {
                  const v = vagas.find(v => v.id === r.vaga_id);
                  const emp = v ? empresas.find(e => e.id === v.empresa_id) : null;
                  return (
                    <div key={r.id} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
                      <div>
                        <p className="text-slate-900">{v?.cargo} ({v?.tipo})</p>
                        <p className="text-[10px] text-slate-400">{emp?.nome_fantasia}</p>
                      </div>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                        r.status === 'Contratado' ? 'bg-emerald-100 text-emerald-800' :
                        r.status === 'Selecionado para Entrevista' ? 'bg-blue-100 text-blue-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {r.status}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>
  );
}
