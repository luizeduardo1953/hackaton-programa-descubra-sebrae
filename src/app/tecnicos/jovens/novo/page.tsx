"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  GraduationCap, ArrowRight, ArrowLeft, RefreshCw, CheckCircle 
} from 'lucide-react';
import { db, PIRAPORA_BAIRROS } from '../../../../lib/db';
import type { ReferenceUnit } from '../../../../lib/db';

export default function TecnicosNovoJovemPage() {
  const router = useRouter();
  const [unidades, setUnidades] = useState<ReferenceUnit[]>([]);
  const [regStep, setRegStep] = useState(1);
  const [loadingCEP, setLoadingCEP] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Stepper state
  const [regData, setRegData] = useState({
    nome_completo: '',
    sexo: 'M' as 'M' | 'F' | 'Outro',
    cor_raca: 'Branco' as any,
    escolaridade: 'Ensino Médio Cursando',
    cpf: '',
    data_nascimento: '2009-01-01',
    cep: '',
    endereco: '',
    bairro: 'Centro',
    cidade: 'Pirapora',
    telefone: '',
    whatsapp: '',
    nome_responsavel: '',
    parentesco_responsavel: 'Mãe',
    telefone_responsavel: '',
    pessoas_residencia: 4,
    pessoas_trabalham: 1,
    renda_familiar: 1400,
    indicado_por_unidade: 'u1',
    ano_indicacao: 2026
  });

  const [regVulns, setRegVulns] = useState({
    bolsa_familia: false,
    cad_unico: false,
    medida_socioeducativa: false,
    deficiencia: false,
    deficiencia_qual: '',
    acesso_internet: true,
    computador: true,
    trabalhou_antes: false,
    abandonou_escola: false,
    dificuldade_transporte: false,
    acompanhamento_psicologico: false
  });

  useEffect(() => {
    setUnidades(db.getUnidades());
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ViaCEP API fetching
  const handleCEPChange = async (cepVal: string) => {
    const cleanCEP = cepVal.replace(/\D/g, '');
    setRegData(prev => ({ ...prev, cep: cepVal }));

    if (cleanCEP.length === 8) {
      setLoadingCEP(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
        const data = await res.json();
        
        if (data.erro) {
          showToast('⚠️ CEP não encontrado. Preencha manualmente.');
        } else {
          showToast('Endereço autocompletado com sucesso!');
          let matchedBairro = 'Centro';
          const apiBairro = data.bairro || '';
          const foundBairro = PIRAPORA_BAIRROS.find(b => 
            b.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === 
            apiBairro.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
          );
          if (foundBairro) matchedBairro = foundBairro;

          setRegData(prev => ({
            ...prev,
            endereco: `${data.logradouro || ''}`,
            bairro: matchedBairro,
            cidade: data.localidade || 'Pirapora'
          }));
        }
      } catch (err) {
        showToast('Erro de rede ao buscar o CEP.');
      } finally {
        setLoadingCEP(false);
      }
    }
  };

  const handleRegisterYouth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regData.nome_completo || !regData.cpf) {
      showToast('Por favor, preencha os dados obrigatórios na Etapa 1.');
      setRegStep(1);
      return;
    }

    try {
      db.saveYouth(regData as any, regVulns);
      showToast('Cadastro realizado com sucesso!');
      router.push('/tecnicos/jovens');
    } catch (err) {
      showToast('Erro ao cadastrar. O CPF digitado já existe?');
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn relative">
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-600 shadow-xl text-white font-bold px-6 py-3.5 rounded-2xl text-xs flex items-center gap-2 animate-fadeIn">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Title */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-2">
        <h2 className="text-xl font-black text-slate-900">Indicar Novo Jovem para o Descubra</h2>
        <p className="text-xs text-slate-400">Preencha o formulário em etapas guiadas. As moedas e prioridades serão computadas automaticamente.</p>
      </div>

      {/* Stepper Wizard Card */}
      <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-6">
        
        {/* Wizard Headers */}
        <div className="flex items-center justify-around border-b border-slate-100 pb-4">
          {[1, 2, 3, 4].map(num => (
            <div key={num} className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center font-black text-sm transition-all ${
                regStep === num ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' :
                regStep > num ? 'bg-emerald-500 text-white' : 'bg-slate-150 text-slate-400'
              }`}>
                {regStep > num ? <CheckCircle className="h-4 w-4" /> : num}
              </div>
              <span className={`text-xs font-black hidden md:inline ${regStep === num ? 'text-indigo-600' : 'text-slate-400'}`}>
                {num === 1 ? 'Dados Pessoais' : 
                 num === 2 ? 'Endereço & Contato' :
                 num === 3 ? 'Vulnerabilidades' : 'Interesses'}
              </span>
            </div>
          ))}
        </div>

        <form onSubmit={handleRegisterYouth} className="flex flex-col gap-6">
          
          {/* STEP 1 */}
          {regStep === 1 && (
            <div className="flex flex-col gap-4 animate-fadeIn">
              <div className="border-l-4 border-indigo-500 pl-3">
                <h3 className="text-base font-black text-slate-900">Etapa 1: Dados de Identificação</h3>
                <p className="text-xs text-slate-400">Preencha os campos básicos civis do adolescente indicado.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase">Nome Completo *</label>
                  <input 
                    type="text" 
                    required
                    value={regData.nome_completo}
                    onChange={(e) => setRegData(prev => ({ ...prev, nome_completo: e.target.value }))}
                    placeholder="Nome completo do adolescente"
                    className="border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-indigo-500 bg-slate-50 shadow-inner"
                  />
                </div>

                <div className="flex grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase">Sexo</label>
                    <select 
                      value={regData.sexo}
                      onChange={(e) => setRegData(prev => ({ ...prev, sexo: e.target.value as any }))}
                      className="border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-indigo-500 bg-white"
                    >
                      <option value="M">Masculino</option>
                      <option value="F">Feminino</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase">Cor / Raça</label>
                    <select 
                      value={regData.cor_raca}
                      onChange={(e) => setRegData(prev => ({ ...prev, cor_raca: e.target.value as any }))}
                      className="border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-indigo-500 bg-white"
                    >
                      <option value="Branco">Branco</option>
                      <option value="Pardo">Pardo</option>
                      <option value="Preto">Preto</option>
                      <option value="Amarelo">Amarelo</option>
                      <option value="Indígena">Indígena</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase">CPF *</label>
                  <input 
                    type="text" 
                    required
                    value={regData.cpf}
                    onChange={(e) => setRegData(prev => ({ ...prev, cpf: e.target.value }))}
                    placeholder="000.000.000-00"
                    className="border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-indigo-500 bg-slate-50 shadow-inner"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase">Data de Nascimento *</label>
                  <input 
                    type="date" 
                    required
                    value={regData.data_nascimento}
                    onChange={(e) => setRegData(prev => ({ ...prev, data_nascimento: e.target.value }))}
                    className="border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-indigo-500 bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase">Escolaridade Atual</label>
                  <select 
                    value={regData.escolaridade}
                    onChange={(e) => setRegData(prev => ({ ...prev, escolaridade: e.target.value }))}
                    className="border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-indigo-500 bg-white"
                  >
                    <option value="Ensino Fundamental Incompleto">Ensino Fundamental Incompleto</option>
                    <option value="Ensino Fundamental Completo">Ensino Fundamental Completo</option>
                    <option value="Ensino Médio Cursando">Ensino Médio Cursando</option>
                    <option value="Ensino Médio Completo">Ensino Médio Completo</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase">Unidade Indicadora</label>
                  <select 
                    value={regData.indicado_por_unidade}
                    onChange={(e) => setRegData(prev => ({ ...prev, indicado_por_unidade: e.target.value }))}
                    className="border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-indigo-500 bg-white"
                  >
                    {unidades.map(u => (
                      <option key={u.id} value={u.id}>{u.nome} ({u.tipo})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {regStep === 2 && (
            <div className="flex flex-col gap-4 animate-fadeIn">
              <div className="border-l-4 border-indigo-500 pl-3">
                <h3 className="text-base font-black text-slate-900">Etapa 2: Endereço & Contatos</h3>
                <p className="text-xs text-slate-400">Autocompletar automático via CEP e padronização para Pirapora.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 relative">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase">CEP</label>
                  <input 
                    type="text" 
                    value={regData.cep}
                    onChange={(e) => handleCEPChange(e.target.value)}
                    placeholder="39270-000"
                    className="border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-indigo-500 bg-slate-50 shadow-inner"
                  />
                  {loadingCEP && (
                    <RefreshCw className="h-4 w-4 text-indigo-500 animate-spin absolute right-3 top-10" />
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase">Bairro Padronizado</label>
                  <select 
                    value={regData.bairro}
                    onChange={(e) => setRegData(prev => ({ ...prev, bairro: e.target.value }))}
                    className="border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-indigo-500 bg-white"
                  >
                    {PIRAPORA_BAIRROS.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1 md:col-span-2">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase">Rua e Número</label>
                  <input 
                    type="text" 
                    value={regData.endereco}
                    onChange={(e) => setRegData(prev => ({ ...prev, endereco: e.target.value }))}
                    placeholder="Nome da rua, nº 100"
                    className="border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-indigo-500 bg-slate-50 shadow-inner"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase">Telefone Celular</label>
                  <input 
                    type="text" 
                    value={regData.telefone}
                    onChange={(e) => setRegData(prev => ({ ...prev, telefone: e.target.value }))}
                    placeholder="(38) 99999-9999"
                    className="border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-indigo-500 bg-slate-50 shadow-inner"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold text-emerald-700 uppercase">WhatsApp do Jovem</label>
                  <input 
                    type="text" 
                    value={regData.whatsapp}
                    onChange={(e) => setRegData(prev => ({ ...prev, whatsapp: e.target.value }))}
                    placeholder="(38) 99999-9999"
                    className="border border-emerald-250 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-emerald-500 bg-slate-50 shadow-inner"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase">Responsável Legal</label>
                  <input 
                    type="text" 
                    value={regData.nome_responsavel}
                    onChange={(e) => setRegData(prev => ({ ...prev, nome_responsavel: e.target.value }))}
                    placeholder="Nome da mãe ou pai"
                    className="border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-indigo-500 bg-slate-50 shadow-inner"
                  />
                </div>

                <div className="flex grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase">Parentesco</label>
                    <select 
                      value={regData.parentesco_responsavel}
                      onChange={(e) => setRegData(prev => ({ ...prev, parentesco_responsavel: e.target.value }))}
                      className="border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-indigo-500 bg-white"
                    >
                      <option value="Mãe">Mãe</option>
                      <option value="Pai">Pai</option>
                      <option value="Avó">Avó</option>
                      <option value="Outro">Outro Responsável</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase">Telefone Responsável</label>
                    <input 
                      type="text" 
                      value={regData.telefone_responsavel}
                      onChange={(e) => setRegData(prev => ({ ...prev, telefone_responsavel: e.target.value }))}
                      placeholder="(38) 99999-9999"
                      className="border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-indigo-500 bg-slate-50 shadow-inner"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {regStep === 3 && (
            <div className="flex flex-col gap-4 animate-fadeIn">
              <div className="border-l-4 border-indigo-500 pl-3">
                <h3 className="text-base font-black text-slate-900">Etapa 3: Fatores de Vulnerabilidade Social</h3>
                <p className="text-xs text-slate-400">Clique nas opções correspondentes. Evite digitação livre de dados sensíveis.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Bolsa Família */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between gap-4 shadow-sm">
                  <div>
                    <h4 className="text-xs font-black text-slate-950">Recebe Bolsa Família?</h4>
                    <p className="text-[10px] text-slate-400 font-semibold leading-none mt-1">Membro ativo na base de dados.</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0 bg-white p-1 rounded-xl border border-slate-200">
                    <button 
                      type="button"
                      onClick={() => setRegVulns(prev => ({ ...prev, bolsa_familia: true }))}
                      className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${regVulns.bolsa_familia ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      Sim
                    </button>
                    <button 
                      type="button"
                      onClick={() => setRegVulns(prev => ({ ...prev, bolsa_familia: false }))}
                      className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${!regVulns.bolsa_familia ? 'bg-slate-150 text-slate-700 font-extrabold' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      Não
                    </button>
                  </div>
                </div>

                {/* CadUnico */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between gap-4 shadow-sm">
                  <div>
                    <h4 className="text-xs font-black text-slate-950">Possui inscrição no CadÚnico?</h4>
                    <p className="text-[10px] text-slate-400 font-semibold leading-none mt-1">Inscrito no Cadastro Único municipal.</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0 bg-white p-1 rounded-xl border border-slate-200">
                    <button 
                      type="button"
                      onClick={() => setRegVulns(prev => ({ ...prev, cad_unico: true }))}
                      className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${regVulns.cad_unico ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      Sim
                    </button>
                    <button 
                      type="button"
                      onClick={() => setRegVulns(prev => ({ ...prev, cad_unico: false }))}
                      className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${!regVulns.cad_unico ? 'bg-slate-150 text-slate-700 font-extrabold' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      Não
                    </button>
                  </div>
                </div>

                {/* Socioeducativa */}
                <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100 flex items-center justify-between gap-4 shadow-sm">
                  <div>
                    <h4 className="text-xs font-black text-rose-950">Já cumpriu medida socioeducativa?</h4>
                    <p className="text-[10px] text-rose-800 font-semibold leading-none mt-1">Fator crítico de vulnerabilidade (+3 pts).</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0 bg-white p-1 rounded-xl border border-slate-200">
                    <button 
                      type="button"
                      onClick={() => setRegVulns(prev => ({ ...prev, medida_socioeducativa: true }))}
                      className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${regVulns.medida_socioeducativa ? 'bg-rose-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      Sim
                    </button>
                    <button 
                      type="button"
                      onClick={() => setRegVulns(prev => ({ ...prev, medida_socioeducativa: false }))}
                      className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${!regVulns.medida_socioeducativa ? 'bg-slate-150 text-slate-700 font-extrabold' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      Não
                    </button>
                  </div>
                </div>

                {/* PCD */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-3 shadow-sm">
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <h4 className="text-xs font-black text-slate-950">Possui alguma deficiência (PCD)?</h4>
                      <p className="text-[10px] text-slate-400 font-semibold leading-none mt-1">Comprovada com laudo ou acompanhamento.</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0 bg-white p-1 rounded-xl border border-slate-200">
                      <button 
                        type="button"
                        onClick={() => setRegVulns(prev => ({ ...prev, deficiencia: true }))}
                        className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${regVulns.deficiencia ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        Sim
                      </button>
                      <button 
                        type="button"
                        onClick={() => setRegVulns(prev => ({ ...prev, deficiencia: false }))}
                        className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${!regVulns.deficiencia ? 'bg-slate-150 text-slate-700 font-extrabold' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        Não
                      </button>
                    </div>
                  </div>
                  {regVulns.deficiencia && (
                    <input 
                      type="text"
                      value={regVulns.deficiencia_qual}
                      onChange={(e) => setRegVulns(prev => ({ ...prev, deficiencia_qual: e.target.value }))}
                      placeholder="Qual deficiência? (Ex: Visual Leve)"
                      className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-indigo-500 animate-fadeIn"
                    />
                  )}
                </div>

                {/* Internet */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between gap-4 shadow-sm">
                  <div>
                    <h4 className="text-xs font-black text-slate-950">Possui acesso à Internet em casa?</h4>
                    <p className="text-[10px] text-slate-400 font-semibold leading-none mt-1">Rede sem fio ou 4G residencial.</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0 bg-white p-1 rounded-xl border border-slate-200">
                    <button 
                      type="button"
                      onClick={() => setRegVulns(prev => ({ ...prev, acesso_internet: true }))}
                      className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${regVulns.acesso_internet ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      Sim
                    </button>
                    <button 
                      type="button"
                      onClick={() => setRegVulns(prev => ({ ...prev, acesso_internet: false }))}
                      className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${!regVulns.acesso_internet ? 'bg-slate-150 text-slate-700 font-extrabold' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      Não
                    </button>
                  </div>
                </div>

                {/* PC */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between gap-4 shadow-sm">
                  <div>
                    <h4 className="text-xs font-black text-slate-950">Possui computador ou notebook próprio?</h4>
                    <p className="text-[10px] text-slate-400 font-semibold leading-none mt-1">Exclusivo ou compartilhado na residência.</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0 bg-white p-1 rounded-xl border border-slate-200">
                    <button 
                      type="button"
                      onClick={() => setRegVulns(prev => ({ ...prev, computador: true }))}
                      className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${regVulns.computador ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      Sim
                    </button>
                    <button 
                      type="button"
                      onClick={() => setRegVulns(prev => ({ ...prev, computador: false }))}
                      className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${!regVulns.computador ? 'bg-slate-150 text-slate-700 font-extrabold' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      Não
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STEP 4 */}
          {regStep === 4 && (
            <div className="flex flex-col gap-4 animate-fadeIn">
              <div className="border-l-4 border-indigo-500 pl-3">
                <h3 className="text-base font-black text-slate-900">Etapa 4: Dados Sociais & Interesses</h3>
                <p className="text-xs text-slate-400">Informações socioeconômicas complementares e compatibilidade profissional.</p>
              </div>

              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-inner">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase">Pessoas na Casa</label>
                  <input 
                    type="number" 
                    value={regData.pessoas_residencia}
                    onChange={(e) => setRegData(prev => ({ ...prev, pessoas_residencia: parseInt(e.target.value) }))}
                    className="bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold focus:outline-indigo-500"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase">Pessoas Trabalham</label>
                  <input 
                    type="number" 
                    value={regData.pessoas_trabalham}
                    onChange={(e) => setRegData(prev => ({ ...prev, pessoas_trabalham: parseInt(e.target.value) }))}
                    className="bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold focus:outline-indigo-500"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase">Renda Familiar</label>
                  <input 
                    type="number" 
                    value={regData.renda_familiar}
                    onChange={(e) => setRegData(prev => ({ ...prev, renda_familiar: parseFloat(e.target.value) }))}
                    className="bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold focus:outline-indigo-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <label className="text-xs font-extrabold text-slate-700">Qual a área de maior interesse profissional? *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {['Administrativo', 'Comércio', 'Tecnologia', 'Logística', 'Indústria', 'Saúde'].map(area => (
                    <div 
                      key={area}
                      onClick={() => showToast(`Área ${area} focada!`)}
                      className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-2.5 cursor-pointer hover:bg-slate-100 transition-colors font-bold text-xs"
                    >
                      <div className="h-4.5 w-4.5 rounded-full border border-indigo-500 flex items-center justify-center bg-white shrink-0">
                        <div className="h-2 w-2 rounded-full bg-indigo-600" />
                      </div>
                      {area}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Stepper navigation */}
          <div className="flex justify-between border-t border-slate-100 pt-4">
            {regStep > 1 ? (
              <button 
                type="button" 
                onClick={() => setRegStep(prev => prev - 1)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar Etapa
              </button>
            ) : <div />}

            {regStep < 4 ? (
              <button 
                type="button" 
                onClick={() => setRegStep(prev => prev + 1)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-md transition-colors"
              >
                Avançar Etapa
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button 
                type="submit"
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-xs font-black shadow-md transition-colors"
              >
                Salvar Cadastro & Indicar
              </button>
            )}
          </div>

        </form>
      </section>

    </div>
  );
}
