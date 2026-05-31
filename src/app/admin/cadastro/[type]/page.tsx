"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '../../../../lib/db';
import { 
  Users, Building, GraduationCap, AlertTriangle, ShieldAlert,
  MapPin, Plus, Trash2, ArrowLeft, Briefcase, CheckCircle2, BookOpen
} from 'lucide-react';

export default function AdminCadastroDynamicPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const type = resolvedParams.type.toLowerCase();

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Entities state
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [tecnicos, setTecnicos] = useState<any[]>([
    { id: 't1', nome: 'Lorena CREAS', cargo: 'Assistente Social', local: 'CREAS Centro', email: 'lorena.creas@pirapora.mg.gov.br' },
    { id: 't2', nome: 'Mateus CRAS', cargo: 'Psicólogo Social', local: 'CRAS Sul', email: 'mateus.cras@pirapora.mg.gov.br' },
    { id: 't3', nome: 'André Socioeducativo', cargo: 'Orientador Pedagógico', local: 'Medidas Socioeducativas', email: 'andre.socio@pirapora.mg.gov.br' }
  ]);
  const [entidades, setEntidades] = useState<any[]>([
    { id: 'en1', nome: 'CREAS Pirapora', tipo: 'Alta Vulnerabilidade / Proteção Especial', bairro: 'Centro' },
    { id: 'en2', nome: 'CRAS Sul - Bom Jesus', tipo: 'Proteção Básica', bairro: 'Bom Jesus' },
    { id: 'en3', nome: 'CRAS Norte - Santos Dumont', tipo: 'Proteção Básica', bairro: 'Santos Dumont' },
    { id: 'en4', nome: 'Acolhimento Municipal Girassol', tipo: 'Acolhimento Institucional', bairro: 'Cidade Jardim' }
  ]);
  const [unidades, setUnidades] = useState<any[]>([
    { id: 'un1', nome: 'Escola Estadual Pirapora', tipo: 'Escola Pública (Ensino Médio)', capacidade: '400 alunos' },
    { id: 'un2', nome: 'Escola Estadual Bom Jesus', tipo: 'Escola Pública (Fundamental/Médio)', capacidade: '300 alunos' },
    { id: 'un3', nome: 'IFNMG - Campus Pirapora', tipo: 'Instituto Federal (Técnico)', capacidade: '150 alunos' }
  ]);
  const [parceiros, setParceiros] = useState<any[]>([
    { id: 'p1', nome: 'Ministério Público de Minas Gerais (Promotoria da Infância)', contato: 'Dr. Roberto Santos', funcao: 'Fiscalização de Vagas Aprendiz' },
    { id: 'p2', nome: 'Poder Judiciário - Vara da Infância e Juventude', contato: 'Dra. Maria Clara', funcao: 'Encaminhamento de Medidas' },
    { id: 'p3', nome: 'Defensoria Pública do Estado de MG', contato: 'Dr. Lucas Silveira', funcao: 'Defesa de Direitos Socioassistenciais' }
  ]);
  const [cursos, setCursos] = useState<any[]>([
    { id: 'c1', nome: 'Auxiliar Administrativo e Vendas', entidade: 'Sebrae / SENAC', carga: '80h', vagas: 15 },
    { id: 'c2', nome: 'Reposição e Caixa Comercial', entidade: 'SENAC', carga: '60h', vagas: 20 },
    { id: 'c3', nome: 'Capacitação Industrial Geral', entidade: 'SENAI', carga: '120h', vagas: 25 },
    { id: 'c4', nome: 'Suporte de TI e Internet', entidade: 'CECEP', carga: '160h', vagas: 10 }
  ]);
  const [jovens, setJovens] = useState<any[]>([]);

  // Score Weights Settings
  const [scoreWeights, setScoreWeights] = useState({
    bolsa_familia: 1,
    cad_unico: 1,
    medida_socioeducativa: 3,
    deficiencia: 1,
    sem_internet: 1,
    sem_computador: 1,
    sem_trabalho: 1,
    abandono_escola: 2,
    dificuldade_transporte: 2,
    acompanhamento_psico: 1
  });

  // Generic forms states
  const [formName, setFormName] = useState('');
  const [formField1, setFormField1] = useState('');
  const [formField2, setFormField2] = useState('');
  const [formNumber, setFormNumber] = useState(10);
  const [formSelo, setFormSelo] = useState<'Ouro' | 'Prata' | 'Bronze' | 'Nenhum'>('Nenhum');

  useEffect(() => {
    syncData();
  }, []);

  const syncData = () => {
    setEmpresas(db.getEmpresas());
    setJovens(db.getYouthList());
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Add handlers
  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (type === 'empresas') {
      const payload = {
        razao_social: formName.trim(),
        nome_fantasia: formName.trim(),
        cnpj: formField1.trim() || '00.000.000/0001-00',
        segmento: formField2.trim() || 'Geral',
        cep: '39270-000',
        endereco: 'Av. Brasil, 120',
        bairro: 'Centro',
        cidade: 'Pirapora',
        responsavel_nome: 'RH Responsável',
        telefone: '(38) 99999-0000',
        email: 'rh@empresa.com.br',
        pontos_engajamento: 0,
        selo: formSelo
      };
      db.saveEmpresa(payload as any); // using as any since Company interface might have other new properties later, or just satisfy Omit
      syncData();
      setFormSelo('Nenhum');
      showToast('🎉 Nova empresa cadastrada com sucesso!');
    } else if (type === 'tecnicos' || type === 'técnicos') {
      const newTec = {
        id: 't_' + Math.random().toString(36).substr(2, 9),
        nome: formName.trim(),
        cargo: formField1.trim() || 'Assistente Social',
        local: formField2.trim() || 'CREAS Centro',
        email: 'tecnico@pirapora.mg.gov.br'
      };
      setTecnicos(prev => [...prev, newTec]);
      showToast('🎉 Técnico de Referência cadastrado!');
    } else if (type === 'entidades') {
      const newEnt = {
        id: 'en_' + Math.random().toString(36).substr(2, 9),
        nome: formName.trim(),
        tipo: formField1.trim() || 'Proteção Básica',
        bairro: formField2.trim() || 'Centro'
      };
      setEntidades(prev => [...prev, newEnt]);
      showToast('🎉 Nova entidade socioassistencial vinculada!');
    } else if (type === 'unidades') {
      const newUni = {
        id: 'un_' + Math.random().toString(36).substr(2, 9),
        nome: formName.trim(),
        tipo: formField1.trim() || 'Escola Pública',
        capacidade: formField2.trim() || '100 alunos'
      };
      setUnidades(prev => [...prev, newUni]);
      showToast('🎉 Nova unidade escolar registrada!');
    } else if (type === 'parceiros') {
      const newPar = {
        id: 'p_' + Math.random().toString(36).substr(2, 9),
        nome: formName.trim(),
        contato: formField1.trim() || 'Dr. Representante',
        funcao: formField2.trim() || 'Parceria Descubra'
      };
      setParceiros(prev => [...prev, newPar]);
      showToast('🎉 Novo parceiro do ecossistema registrado!');
    } else if (type === 'cursos') {
      const newCur = {
        id: 'c_' + Math.random().toString(36).substr(2, 9),
        nome: formName.trim(),
        entidade: formField1.trim() || 'SENAC',
        carga: formField2.trim() || '80 horas',
        vagas: Number(formNumber) || 20
      };
      setCursos(prev => [...prev, newCur]);
      showToast('🎉 Nova turma de aprendizagem cadastrada!');
    }

    // Reset Form
    setFormName('');
    setFormField1('');
    setFormField2('');
    setFormNumber(10);
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Deseja remover "${name}" do cadastro administrativamente?`)) return;

    if (type === 'empresas') {
      // Fake remove empresa from state
      setEmpresas(prev => prev.filter(e => e.id !== id));
      showToast('Empresa removida com sucesso.');
    } else if (type === 'tecnicos' || type === 'técnicos') {
      setTecnicos(prev => prev.filter(t => t.id !== id));
      showToast('Técnico descadastrado.');
    } else if (type === 'entidades') {
      setEntidades(prev => prev.filter(e => e.id !== id));
      showToast('Entidade descadastrada.');
    } else if (type === 'unidades') {
      setUnidades(prev => prev.filter(u => u.id !== id));
      showToast('Unidade de ensino descadastrada.');
    } else if (type === 'parceiros') {
      setParceiros(prev => prev.filter(p => p.id !== id));
      showToast('Parceiro removido.');
    } else if (type === 'cursos') {
      setCursos(prev => prev.filter(c => c.id !== id));
      showToast('Curso/Turma removida.');
    }
  };

  // Map route label for display
  const getRouteLabel = () => {
    switch (type) {
      case 'jovens': return 'Cadastro de Jovens';
      case 'tecnicos':
      case 'técnicos': return 'Cadastro de Técnicos de Referência';
      case 'entidades': return 'Cadastro de Entidades Assistenciais';
      case 'empresas': return 'Cadastro de Empresas Parceiras';
      case 'unidades': return 'Cadastro de Unidades de Ensino';
      case 'vulnerabilidades': return 'Controle de Vulnerabilidades & Score';
      case 'parceiros': return 'Cadastro de Parceiros Institucionais';
      case 'cursos': return 'Cadastro de Cursos e Oficinas';
      default: return 'Cadastro Administrativo';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'jovens': return <Users className="h-6 w-6 text-indigo-600" />;
      case 'empresas': return <Building className="h-6 w-6 text-indigo-600" />;
      case 'tecnicos':
      case 'técnicos': return <Users className="h-6 w-6 text-indigo-600" />;
      case 'cursos': return <BookOpen className="h-6 w-6 text-indigo-600" />;
      case 'unidades':
      case 'entidades': return <MapPin className="h-6 w-6 text-indigo-600" />;
      default: return <GraduationCap className="h-6 w-6 text-indigo-600" />;
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

      {/* Header */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Link 
            href="/admin/painel"
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="bg-indigo-50 p-2 rounded-xl border border-indigo-100 shrink-0">
              {getIcon()}
            </div>
            <div>
              <span className="text-[9px] font-black uppercase text-indigo-600 tracking-wider">Mapeamento e Cadastro Geral</span>
              <h2 className="text-xl font-black text-slate-900 mt-0.5">{getRouteLabel()}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* RENDER DYNAMIC COMPONENT ACCORDING TO ROUTE TYPE */}

      {/* 1. JOVENS MANAGEMENT (ADMIN PERSPECTIVE) */}
      {type === 'jovens' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-900">Jovens Matriculados no Programa</h3>
            <Link 
              href="/tecnicos/cadastro/jovens"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-black shadow-md transition-colors"
            >
              Matricular Novo Jovem
            </Link>
          </div>

          <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-inner max-h-[400px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400">
                  <th className="py-2.5 px-4">Nome</th>
                  <th className="py-2.5 px-4">CPF</th>
                  <th className="py-2.5 px-4">Cidade / Bairro</th>
                  <th className="py-2.5 px-4 text-center">Score</th>
                  <th className="py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {jovens.map(j => (
                  <tr key={j.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-4 font-black text-slate-900">{j.nome_completo}</td>
                    <td className="py-2.5 px-4 text-slate-450">{j.cpf}</td>
                    <td className="py-2.5 px-4">{j.cidade} / {j.bairro}</td>
                    <td className="py-2.5 px-4 text-center">
                      <span className="font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-150 px-2 py-0.5 rounded-lg">
                        {j.score_vulnerabilidade} pts
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                        j.status_atual === 'Contratado' ? 'bg-emerald-100 text-emerald-800' :
                        j.status_atual === 'Alerta' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {j.status_atual}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. VULNERABILIDADES WEIGHT MANAGEMENT */}
      {type === 'vulnerabilidades' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldAlert className="h-5 w-5 text-indigo-600" />
            Configuração Demográfica e Pesos do Algoritmo
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed font-semibold">
            Modifique a calibragem dos scores de vulnerabilidade para que a fila de prioridades atenda com maior rigor os critérios sociais prioritários estipulados pela comissão técnica de Pirapora.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {[
              { label: 'Família em Medida Socioeducativa (Meio Aberto/Fechado)', key: 'medida_socioeducativa', weight: scoreWeights.medida_socioeducativa },
              { label: 'Evasão Escolar Detectada / Abandono de Escola', key: 'abandono_escola', weight: scoreWeights.abandono_escola },
              { label: 'Dificuldade Extrema de Acesso ao Transporte Coletivo', key: 'dificuldade_transporte', weight: scoreWeights.dificuldade_transporte },
              { label: 'Família Cadastrada no CadÚnico do Governo', key: 'cad_unico', weight: scoreWeights.cad_unico },
              { label: 'Residência sem Qualquer Acesso à Internet', key: 'sem_internet', weight: scoreWeights.sem_internet },
              { label: 'Estudante sem Computador de Apoio Escolar', key: 'sem_computador', weight: scoreWeights.sem_computador }
            ].map(w => (
              <div key={w.key} className="bg-slate-50 p-4.5 rounded-2xl border border-slate-150 flex items-center justify-between text-xs font-black text-slate-700">
                <span>{w.label}</span>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      setScoreWeights(prev => ({ ...prev, [w.key]: Math.max(0, (prev as any)[w.key] - 1) }));
                      showToast('Calibragem ajustada com sucesso!');
                    }}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 h-6 w-6 rounded-md font-black shadow-sm"
                  >
                    -
                  </button>
                  <span className="font-black text-indigo-650 w-4 text-center text-sm">{w.weight}</span>
                  <button 
                    onClick={() => {
                      setScoreWeights(prev => ({ ...prev, [w.key]: Math.min(5, (prev as any)[w.key] + 1) }));
                      showToast('Calibragem ajustada com sucesso!');
                    }}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 h-6 w-6 rounded-md font-black shadow-sm"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. OTHER STANDARD ADMINISTRATIVE REGISTERS */}
      {type !== 'jovens' && type !== 'vulnerabilidades' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Form to Add Entry */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4">
            <h3 className="text-base font-black text-slate-900">Novo Registro Administrativo</h3>
            
            <form onSubmit={handleAdd} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Nome / Razão Social *</label>
                <input 
                  type="text" 
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: Novo Registro"
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-indigo-500"
                  required
                />
              </div>

              {type !== 'cursos' ? (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">
                      {type === 'empresas' ? 'CNPJ' : type === 'tecnicos' || type === 'técnicos' ? 'Cargo/Especialidade' : 'Tipo/Função'}
                    </label>
                    <input 
                      type="text" 
                      value={formField1}
                      onChange={(e) => setFormField1(e.target.value)}
                      placeholder={type === 'empresas' ? 'CNPJ' : 'Detalhe descritivo'}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-indigo-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">
                      {type === 'empresas' ? 'Segmento Comercial' : type === 'tecnicos' || type === 'técnicos' ? 'Local/Unidade' : 'Bairro/Zona'}
                    </label>
                    <input 
                      type="text" 
                      value={formField2}
                      onChange={(e) => setFormField2(e.target.value)}
                      placeholder="Zona ou Unidade física"
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-indigo-500"
                    />
                  </div>

                  {type === 'empresas' && (
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black uppercase text-slate-400">Atribuir Selo de Engajamento</label>
                      <select
                        value={formSelo}
                        onChange={(e) => setFormSelo(e.target.value as any)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-indigo-500 outline-none cursor-pointer"
                      >
                        <option value="Nenhum">Empresa Parceira (Nenhum)</option>
                        <option value="Bronze">Selo Bronze</option>
                        <option value="Prata">Selo Prata</option>
                        <option value="Ouro">Selo Ouro</option>
                      </select>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Entidade de Ensino Conveniada</label>
                    <input 
                      type="text" 
                      value={formField1}
                      onChange={(e) => setFormField1(e.target.value)}
                      placeholder="Ex: SENAI"
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-indigo-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Carga Horária (Aulas)</label>
                    <input 
                      type="text" 
                      value={formField2}
                      onChange={(e) => setFormField2(e.target.value)}
                      placeholder="Ex: 80 horas"
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-indigo-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Vagas de Capacitação</label>
                    <input 
                      type="number" 
                      value={formNumber}
                      onChange={(e) => setFormNumber(Number(e.target.value))}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-indigo-500"
                    />
                  </div>
                </>
              )}

              <button 
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-xs font-black shadow-md mt-2 transition-colors cursor-pointer"
              >
                Cadastrar Registro
              </button>
            </form>
          </div>

          {/* List of Entries */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4">
            <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">Registros Existentes</h3>

            <div className="flex flex-col gap-3 max-h-[360px] overflow-y-auto pr-2">
              {/* Empresas List */}
              {type === 'empresas' && empresas.map(emp => (
                <div key={emp.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-150 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="text-sm font-black text-slate-900">{emp.nome_fantasia}</h4>
                    <p className="text-[10px] font-bold text-slate-450 leading-relaxed mt-0.5">CNPJ: {emp.cnpj} • Segmento: {emp.segmento || 'Geral'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[8px] font-black uppercase text-slate-400">Atribuir Selo:</span>
                      <select
                        value={emp.selo || 'Nenhum'}
                        onChange={(e) => {
                          const newSelo = e.target.value as any;
                          db.updateCompanySeal(emp.id, newSelo);
                          syncData();
                          showToast(`🏆 Selo da empresa ${emp.nome_fantasia} atualizado para ${newSelo}!`);
                        }}
                        className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-black uppercase text-slate-700 outline-none cursor-pointer hover:border-slate-350"
                      >
                        <option value="Nenhum">Parceira (Nenhum)</option>
                        <option value="Bronze">Bronze</option>
                        <option value="Prata">Prata</option>
                        <option value="Ouro">Ouro</option>
                      </select>
                    </div>
                    <button 
                      onClick={() => handleDelete(emp.id, emp.nome_fantasia)}
                      className="text-rose-600 hover:bg-rose-50 p-2 rounded-xl border border-rose-100 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Técnicos List */}
              {(type === 'tecnicos' || type === 'técnicos') && tecnicos.map(tec => (
                <div key={tec.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-150 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{tec.nome}</h4>
                    <p className="text-[10px] font-bold text-slate-450 leading-relaxed mt-0.5">{tec.cargo} • Unidade: {tec.local}</p>
                  </div>
                  <button 
                    onClick={() => handleDelete(tec.id, tec.nome)}
                    className="text-rose-600 hover:bg-rose-50 p-2 rounded-xl border border-rose-100 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {/* Entidades List */}
              {type === 'entidades' && entidades.map(ent => (
                <div key={ent.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-150 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{ent.nome}</h4>
                    <p className="text-[10px] font-bold text-slate-450 leading-relaxed mt-0.5">{ent.tipo} • Bairro: {ent.bairro}</p>
                  </div>
                  <button 
                    onClick={() => handleDelete(ent.id, ent.nome)}
                    className="text-rose-600 hover:bg-rose-50 p-2 rounded-xl border border-rose-100 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {/* Unidades List */}
              {type === 'unidades' && unidades.map(uni => (
                <div key={uni.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-150 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{uni.nome}</h4>
                    <p className="text-[10px] font-bold text-slate-450 leading-relaxed mt-0.5">{uni.tipo} • Capacidade: {uni.capacidade}</p>
                  </div>
                  <button 
                    onClick={() => handleDelete(uni.id, uni.nome)}
                    className="text-rose-600 hover:bg-rose-50 p-2 rounded-xl border border-rose-100 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {/* Parceiros List */}
              {type === 'parceiros' && parceiros.map(par => (
                <div key={par.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-150 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{par.nome}</h4>
                    <p className="text-[10px] font-bold text-slate-450 leading-relaxed mt-0.5">Contato: {par.contato} • Ação: {par.funcao}</p>
                  </div>
                  <button 
                    onClick={() => handleDelete(par.id, par.nome)}
                    className="text-rose-600 hover:bg-rose-50 p-2 rounded-xl border border-rose-100 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {/* Cursos List */}
              {type === 'cursos' && cursos.map(cur => (
                <div key={cur.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-150 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{cur.nome}</h4>
                    <p className="text-[10px] font-bold text-slate-450 leading-relaxed mt-0.5">Escola: {cur.entidade} • Carga: {cur.carga} • Turmas: {cur.vagas} Vagas</p>
                  </div>
                  <button 
                    onClick={() => handleDelete(cur.id, cur.nome)}
                    className="text-rose-600 hover:bg-rose-50 p-2 rounded-xl border border-rose-100 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
