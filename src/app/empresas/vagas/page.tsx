"use client";

import React, { useState, useEffect } from 'react';
import { db } from '../../../lib/db';
import type { Vacancy, Youth } from '../../../lib/db';
import {
  Briefcase, PlusCircle, CheckCircle2, AlertCircle, Sparkles,
  ArrowRight, Users, X, Brain, DollarSign, Clock, MapPin, User, ChevronRight
} from 'lucide-react';

interface LocalVacancy extends Vacancy {
  descricao?: string;
}

interface MatchCandidate {
  youth: Youth;
  score: number;
  reasons: string[];
}

export default function EmpresasVagasPage() {
  const [vagas, setVagas] = useState<LocalVacancy[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states
  const [cargo, setCargo] = useState('');
  const [tipo, setTipo] = useState<'Jovem Aprendiz' | 'Estágio'>('Jovem Aprendiz');
  const [quantidade, setQuantidade] = useState(1);
  const [horario, setHorario] = useState('13:00 - 17:00 (Segunda a Sexta)');
  const [bolsaAuxilio, setBolsaAuxilio] = useState(750);
  const [idadeMinima, setIdadeMinima] = useState(15);
  const [escolaridade, setEscolaridade] = useState('Ensino Médio Cursando');
  const [descricao, setDescricao] = useState('');
  const [competenciaInput, setCompetenciaInput] = useState('');
  const [competencias, setCompetencias] = useState<string[]>(['Informática Básica', 'Proatividade']);

  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    syncData();
  }, []);

  const syncData = () => {
    // Simulated SEBRAE company id is 'e1'
    const companyVacancies = (db.getVagas() as LocalVacancy[]).filter(v => v.empresa_id === 'e1');
    setVagas(companyVacancies);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddCompetencia = () => {
    if (!competenciaInput.trim()) return;
    if (competencias.includes(competenciaInput.trim())) return;
    setCompetencias(prev => [...prev, competenciaInput.trim()]);
    setCompetenciaInput('');
  };

  const handleRemoveCompetencia = (idx: number) => {
    setCompetencias(prev => prev.filter((_, i) => i !== idx));
  };

  const handlePostVacancy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cargo.trim()) {
      showToast('⚠️ O título do cargo é obrigatório.');
      return;
    }

    const payload: Omit<LocalVacancy, 'id'> = {
      empresa_id: 'e1',
      cargo: cargo.trim(),
      tipo,
      quantidade: Number(quantidade),
      horario: horario.trim(),
      bolsa_auxilio: Number(bolsaAuxilio),
      idade_minima: Number(idadeMinima),
      escolaridade_exigida: escolaridade,
      competencias_desejadas: competencias,
      status_vaga: 'Aberta',
      descricao: descricao.trim()
    };

    db.saveVaga(payload);
    syncData();

    // Reset Form
    setCargo('');
    setQuantidade(1);
    setHorario('13:00 - 17:00 (Segunda a Sexta)');
    setBolsaAuxilio(750);
    setIdadeMinima(15);
    setEscolaridade('Ensino Médio Cursando');
    setDescricao('');
    setCompetencias(['Informática Básica', 'Proatividade']);
    setShowAddForm(false);

    showToast('🎉 Vaga publicada no sistema com sucesso!');
  };

  const handleToggleStatus = (id: string, currentStatus: Vacancy['status_vaga']) => {
    const list = db.getVagas();
    const item = list.find(v => v.id === id);
    if (!item) return;

    const nextStatus: Vacancy['status_vaga'] =
      currentStatus === 'Aberta' ? 'Preenchida' :
        currentStatus === 'Preenchida' ? 'Cancelada' : 'Aberta';

    db.saveVaga({ ...item, status_vaga: nextStatus });
    syncData();
    showToast(`Status da vaga atualizado para "${nextStatus}"!`);
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn relative">

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-600 shadow-xl text-white font-bold px-6 py-3.5 rounded-2xl text-xs flex items-center gap-2 animate-fadeIn animate-slideIn">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header section */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">Gerenciar Vagas Publicadas</h2>
          <p className="text-xs text-slate-400">Cadastre e acompanhe o preenchimento de suas cotas legais para o Programa Descubra.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl text-xs font-black shadow-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
        >
          <PlusCircle className="h-4.5 w-4.5" />
          {showAddForm ? 'Cancelar Cadastro' : 'Cadastrar Nova Vaga'}
        </button>
      </div>

      {/* ADD VACANCY FORM PANEL */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-md flex flex-col gap-5 animate-slideDown">
          <h3 className="text-base font-black text-slate-950 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            Publicar Nova Vaga de Contratação
          </h3>

          <form onSubmit={handlePostVacancy} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Cargo */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-slate-450">Título do Cargo *</label>
              <input
                type="text"
                placeholder="Ex: Auxiliar de Arquivo Digital"
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-indigo-500"
                required
              />
            </div>

            {/* Tipo */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-slate-450">Tipo de Contrato</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-indigo-500"
              >
                <option value="Jovem Aprendiz">Jovem Aprendiz (Cota Legal)</option>
                <option value="Estágio">Estágio Supervisionado</option>
                <option value="Contrato CLT">Contrato CLT</option>
              </select>
            </div>

            {/* Quantidade */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-slate-450">Quantidade de Vagas</label>
              <input
                type="number"
                min={1}
                value={quantidade}
                onChange={(e) => setQuantidade(Math.max(1, Number(e.target.value)))}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-indigo-500"
              />
            </div>

            {/* Bolsa Auxilio */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-slate-450">Bolsa Auxílio Mensal (R$)</label>
              <input
                type="number"
                min={100}
                value={bolsaAuxilio}
                onChange={(e) => setBolsaAuxilio(Math.max(0, Number(e.target.value)))}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-indigo-500"
              />
            </div>

            {/* Idade Minima */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-slate-455">Idade Mínima</label>
              <input
                type="number"
                min={14}
                max={24}
                value={idadeMinima}
                onChange={(e) => setIdadeMinima(Math.max(14, Number(e.target.value)))}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-indigo-500"
              />
            </div>

            {/* Escolaridade */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-slate-455">Escolaridade Exigida</label>
              <select
                value={escolaridade}
                onChange={(e) => setEscolaridade(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-indigo-500"
              >
                <option value="Ensino Fundamental Incompleto">Ensino Fundamental Incompleto</option>
                <option value="Ensino Fundamental Completo">Ensino Fundamental Completo</option>
                <option value="Ensino Médio Cursando">Ensino Médio Cursando</option>
                <option value="Ensino Médio Concluído">Ensino Médio Concluído</option>
                <option value="Ensino Superior Cursando">Ensino Superior Cursando</option>
                <option value="Ensino Superior Completo">Ensino Superior Completo</option>
              </select>
            </div>

            {/* Horario */}
            <div className="flex flex-col gap-1.5 md:col-span-3">
              <label className="text-[10px] font-black uppercase text-slate-455">Horário e Carga Horária</label>
              <input
                type="text"
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-indigo-500"
              />
            </div>

            {/* Descricao da Vaga */}
            <div className="flex flex-col gap-1.5 md:col-span-3">
              <label className="text-[10px] font-black uppercase text-slate-455">Descrição Detalhada da Vaga</label>
              <textarea
                rows={3}
                placeholder="Descreva as principais responsabilidades, tarefas diárias e ambiente de trabalho da vaga de forma acessível e acolhedora..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-indigo-500 resize-none leading-relaxed"
              />
            </div>

            {/* Competencias */}
            <div className="flex flex-col gap-1.5 md:col-span-3 border-t border-slate-100 pt-3">
              <label className="text-[10px] font-black uppercase text-slate-455">Habilidades e Competências Desejadas</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Adicionar habilidade (Ex: Excel Básico)"
                  value={competenciaInput}
                  onChange={(e) => setCompetenciaInput(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-indigo-500 flex-1"
                />
                <button
                  type="button"
                  onClick={handleAddCompetencia}
                  className="bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl text-xs font-black text-indigo-700 transition-colors"
                >
                  Adicionar
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-2">
                {competencias.map((comp, idx) => (
                  <span key={idx} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-black border border-indigo-100 flex items-center gap-2">
                    {comp}
                    <button
                      type="button"
                      onClick={() => handleRemoveCompetencia(idx)}
                      className="text-indigo-400 hover:text-indigo-900 font-black text-[10px]"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="md:col-span-3 flex justify-end gap-3 border-t border-slate-100 pt-4 mt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-5 py-2.5 rounded-xl text-xs font-black transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-xs font-black shadow-md transition-colors"
              >
                Salvar e Publicar Vaga!
              </button>
            </div>
          </form>
        </div>
      )}
         {/* INFO BANNER */}
      <div className="bg-indigo-50 border border-indigo-150 rounded-3xl p-5 flex items-start gap-4">
        <Users className="h-6 w-6 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-black text-indigo-900">Encaminhamento Assistido & Curadoria Confidencial</h4>
          <p className="text-xs text-indigo-700 font-semibold mt-1 leading-relaxed">
            Em conformidade com a privacidade e proteção social dos jovens, o Programa Descubra realiza a seleção de forma assistida. 
            Após cadastrar a vaga, a equipe técnica do <strong>CRAS/CREAS</strong> realiza a curadoria confidencial dos jovens prioritários da região de Pirapora 
            e faz a ponte de contratação diretamente com os gestores da sua empresa.
          </p>
        </div>
      </div>

      {/* LIST OF VACANCIES */}
      <div className="flex flex-col gap-4">
        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-indigo-600 shrink-0" />
          Vagas Publicadas e Cota Ativa
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vagas.length === 0 ? (
            <div className="col-span-3 text-center py-12 bg-white rounded-3xl border border-slate-100 shadow-sm text-slate-400">
              <Briefcase className="h-10 w-10 mx-auto text-slate-200 mb-2" />
              <p className="text-xs font-semibold">Nenhuma vaga cadastrada por você ainda.</p>
            </div>
          ) : (
            vagas.map(v => {
              return (
                <div
                  key={v.id}
                  className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between gap-4 hover:shadow-md hover:border-indigo-300 transition-all relative overflow-hidden group"
                >
                  <div>

                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border ${v.status_vaga === 'Aberta' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          v.status_vaga === 'Preenchida' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                            'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                        {v.status_vaga === 'Aberta' ? 'Aberta' : v.status_vaga === 'Preenchida' ? 'Preenchida' : 'Cancelada'}
                      </span>
                      <span className="text-[9px] font-black uppercase text-slate-400">
                        {v.tipo}
                      </span>
                    </div>

                    <h4 className="text-base font-black text-slate-955 mt-3 group-hover:text-indigo-600 transition-colors">
                      {v.cargo}
                    </h4>

                    {/* Vacancy Description */}
                    {v.descricao && (
                      <p className="text-[11px] text-slate-450 font-semibold mt-2 leading-relaxed line-clamp-3">
                        {v.descricao}
                      </p>
                    )}

                    <div className="flex flex-col gap-1.5 mt-3 border-t border-slate-100 pt-3 text-xs font-semibold text-slate-650">
                      <p className="flex justify-between">
                        <span className="text-slate-400 font-bold">Vagas Disponíveis:</span>
                        <span>{v.quantidade}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-slate-400 font-bold">Bolsa-Auxílio:</span>
                        <span className="text-slate-900 font-black">R$ {v.bolsa_auxilio.toFixed(2)}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-slate-400 font-bold">Idade Mínima:</span>
                        <span>{v.idade_minima} anos</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-slate-400 font-bold">Escolaridade:</span>
                        <span className="truncate max-w-[140px]" title={v.escolaridade_exigida}>{v.escolaridade_exigida}</span>
                      </p>
                      <p className="flex justify-between border-t border-slate-50 pt-1.5 mt-1.5 text-[11px] leading-relaxed">
                        <span className="text-slate-400 font-bold">Horário:</span>
                        <span className="text-slate-500 truncate max-w-[160px]" title={v.horario}>{v.horario}</span>
                      </p>
                    </div>

                    {v.competencias_desejadas.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-4">
                        {v.competencias_desejadas.slice(0, 3).map((comp, i) => (
                          <span key={i} className="bg-slate-50 text-[9px] font-black text-slate-500 px-2 py-0.5 rounded border border-slate-100">
                            {comp}
                          </span>
                        ))}
                        {v.competencias_desejadas.length > 3 && (
                          <span className="text-[9px] font-black text-slate-400 self-center pl-1">
                            +{v.competencias_desejadas.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-3 mt-1 flex justify-between items-center">
                    <button
                      onClick={() => handleToggleStatus(v.id, v.status_vaga)}
                      className="text-[9px] font-black text-slate-500 hover:text-indigo-650 hover:bg-slate-100 px-2 py-1.5 rounded-lg border border-slate-200 transition-all select-none cursor-pointer"
                    >
                      Alterar Status
                    </button>
                    <span className="text-[8px] font-bold text-slate-350">ID: {v.id.toUpperCase()}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
