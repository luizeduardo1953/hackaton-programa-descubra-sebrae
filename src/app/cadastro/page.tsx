"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  GraduationCap, Trophy, Building2, ArrowRight, CheckCircle2,
  AlertCircle, User, Phone, Mail, Calendar, Hash, Briefcase, Loader2
} from 'lucide-react';

type Profile = 'jovem' | 'empresa' | null;

interface JovemForm {
  nome: string;
  cpf: string;
  dataNascimento: string;
  telefone: string;
  email: string;
}

interface EmpresaForm {
  razaoSocial: string;
  cnpj: string;
  responsavel: string;
  email: string;
  telefone: string;
  segmento: string;
}

const SEGMENTOS = [
  'Comércio Varejista',
  'Indústria Têxtil',
  'Alimentação & Bebidas',
  'Tecnologia & Informática',
  'Serviços Gerais',
  'Construção Civil',
  'Saúde & Bem-estar',
  'Educação',
  'Logística & Transporte',
  'Outro',
];

function formatCPF(value: string) {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function formatCNPJ(value: string) {
  return value
    .replace(/\D/g, '')
    .slice(0, 14)
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

function formatPhone(value: string) {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
}

export default function CadastroPage() {
  const [profile, setProfile] = useState<Profile>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [jovem, setJovem] = useState<JovemForm>({
    nome: '', cpf: '', dataNascimento: '', telefone: '', email: ''
  });

  const [empresa, setEmpresa] = useState<EmpresaForm>({
    razaoSocial: '', cnpj: '', responsavel: '', email: '', telefone: '', segmento: ''
  });

  const handleJovemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jovem.nome.trim() || !jovem.cpf.trim() || !jovem.dataNascimento || !jovem.telefone.trim()) {
      setError('Preencha todos os campos obrigatórios (*).');
      return;
    }
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    console.log('[CADASTRO JOVEM]', jovem);
    setLoading(false);
    setSuccess('Seu cadastro foi enviado! Um técnico do CREAS/CRAS entrará em contato.');
  };

  const handleEmpresaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresa.razaoSocial.trim() || !empresa.cnpj.trim() || !empresa.responsavel.trim() || !empresa.email.trim() || !empresa.telefone.trim()) {
      setError('Preencha todos os campos obrigatórios (*).');
      return;
    }
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    console.log('[CADASTRO EMPRESA]', empresa);
    setLoading(false);
    setSuccess('Cadastro enviado para aprovação da Coordenação. Em breve você receberá acesso.');
  };

  const resetAll = () => {
    setProfile(null);
    setSuccess('');
    setError('');
    setJovem({ nome: '', cpf: '', dataNascimento: '', telefone: '', email: '' });
    setEmpresa({ razaoSocial: '', cnpj: '', responsavel: '', email: '', telefone: '', segmento: '' });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 font-sans"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}
    >
      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-16 left-16 w-80 h-80 bg-indigo-600 opacity-10 rounded-full blur-3xl" />
        <div className="absolute bottom-16 right-16 w-96 h-96 bg-purple-600 opacity-10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500 opacity-5 rounded-full blur-2xl" />
      </div>

      <div className="relative w-full max-w-lg animate-fadeIn">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="bg-indigo-500 p-3 rounded-2xl shadow-lg">
            <GraduationCap className="h-7 w-7 text-white stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-white text-xl font-black tracking-tight">Descubra Hub</h1>
            <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-widest">Pirapora • MG</p>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-8 py-6">
            <h2 className="text-white text-xl font-black tracking-tight">Cadastro Público</h2>
            <p className="text-indigo-200 text-xs font-semibold mt-1">
              Selecione seu perfil para começar o cadastro no Programa Descubra.
            </p>
          </div>

          <div className="p-8">
            {/* Success State */}
            {success ? (
              <div className="flex flex-col items-center gap-5 py-4 animate-fadeIn">
                <div className="bg-emerald-100 rounded-full p-5">
                  <CheckCircle2 className="h-12 w-12 text-emerald-600" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-black text-slate-900 mb-2">Cadastro Enviado! 🎉</p>
                  <p className="text-sm text-slate-600 font-semibold leading-relaxed max-w-xs mx-auto">{success}</p>
                </div>
                <button
                  onClick={resetAll}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-2xl text-sm font-black transition-all"
                >
                  Fazer outro cadastro
                </button>
              </div>
            ) : (
              <>
                {/* Error Banner */}
                {error && (
                  <div className="bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3 flex items-start gap-2.5 mb-5 animate-slideDown">
                    <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-rose-700 font-semibold leading-relaxed">{error}</p>
                  </div>
                )}

                {/* Profile Selector */}
                {!profile && (
                  <div className="flex flex-col gap-4 animate-fadeIn">
                    <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider text-center">
                      Quem é você?
                    </p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {/* Jovem Option */}
                      <button
                        onClick={() => setProfile('jovem')}
                        className="group border-2 border-slate-200 hover:border-emerald-400 bg-slate-50 hover:bg-emerald-50 rounded-2xl p-6 flex flex-col items-center gap-3 transition-all hover:shadow-lg hover:shadow-emerald-100"
                      >
                        <div className="bg-emerald-100 group-hover:bg-emerald-200 p-4 rounded-2xl transition-colors">
                          <Trophy className="h-8 w-8 text-emerald-600 stroke-[2]" />
                        </div>
                        <div className="text-center">
                          <p className="font-black text-slate-900 text-sm">Sou um Jovem</p>
                          <p className="text-[11px] text-slate-500 font-semibold mt-0.5 leading-relaxed">
                            Quero me inscrever no<br />Programa Descubra
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                          Começar <ArrowRight className="h-3 w-3" />
                        </div>
                      </button>

                      {/* Empresa Option */}
                      <button
                        onClick={() => setProfile('empresa')}
                        className="group border-2 border-slate-200 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50 rounded-2xl p-6 flex flex-col items-center gap-3 transition-all hover:shadow-lg hover:shadow-indigo-100"
                      >
                        <div className="bg-indigo-100 group-hover:bg-indigo-200 p-4 rounded-2xl transition-colors">
                          <Building2 className="h-8 w-8 text-indigo-600 stroke-[2]" />
                        </div>
                        <div className="text-center">
                          <p className="font-black text-slate-900 text-sm">Somos uma Empresa</p>
                          <p className="text-[11px] text-slate-500 font-semibold mt-0.5 leading-relaxed">
                            Quero ser parceira<br />do Descubra
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-indigo-600 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                          Começar <ArrowRight className="h-3 w-3" />
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* FORM — JOVEM */}
                {profile === 'jovem' && (
                  <form onSubmit={handleJovemSubmit} className="flex flex-col gap-4 animate-fadeIn">
                    <div className="flex items-center gap-2 mb-1">
                      <button
                        type="button"
                        onClick={() => { setProfile(null); setError(''); }}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-bold"
                      >
                        ← Voltar
                      </button>
                      <span className="text-slate-300">|</span>
                      <div className="flex items-center gap-1.5">
                        <div className="bg-emerald-100 p-1.5 rounded-lg">
                          <Trophy className="h-3.5 w-3.5 text-emerald-600" />
                        </div>
                        <span className="text-xs font-black text-slate-700">Cadastro do Jovem</span>
                      </div>
                    </div>

                    {/* Nome */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Nome completo *</label>
                      <div className="border border-slate-200 bg-slate-50 focus-within:border-emerald-400 focus-within:bg-white rounded-2xl flex items-center px-4 py-3 gap-3 transition-all">
                        <User className="h-4 w-4 text-slate-400 shrink-0" />
                        <input
                          type="text"
                          value={jovem.nome}
                          onChange={e => setJovem(p => ({ ...p, nome: e.target.value }))}
                          placeholder="Seu nome completo"
                          className="bg-transparent focus:outline-none text-sm w-full text-slate-800 font-semibold placeholder:font-normal placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    {/* CPF */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">CPF *</label>
                      <div className="border border-slate-200 bg-slate-50 focus-within:border-emerald-400 focus-within:bg-white rounded-2xl flex items-center px-4 py-3 gap-3 transition-all">
                        <Hash className="h-4 w-4 text-slate-400 shrink-0" />
                        <input
                          type="text"
                          value={jovem.cpf}
                          onChange={e => setJovem(p => ({ ...p, cpf: formatCPF(e.target.value) }))}
                          placeholder="000.000.000-00"
                          className="bg-transparent focus:outline-none text-sm w-full text-slate-800 font-semibold placeholder:font-normal placeholder:text-slate-400"
                          maxLength={14}
                        />
                      </div>
                    </div>

                    {/* Data Nascimento */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Data de Nascimento *</label>
                      <div className="border border-slate-200 bg-slate-50 focus-within:border-emerald-400 focus-within:bg-white rounded-2xl flex items-center px-4 py-3 gap-3 transition-all">
                        <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                        <input
                          type="date"
                          value={jovem.dataNascimento}
                          onChange={e => setJovem(p => ({ ...p, dataNascimento: e.target.value }))}
                          className="bg-transparent focus:outline-none text-sm w-full text-slate-800 font-semibold"
                        />
                      </div>
                    </div>

                    {/* Telefone */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Telefone / WhatsApp *</label>
                      <div className="border border-slate-200 bg-slate-50 focus-within:border-emerald-400 focus-within:bg-white rounded-2xl flex items-center px-4 py-3 gap-3 transition-all">
                        <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                        <input
                          type="text"
                          value={jovem.telefone}
                          onChange={e => setJovem(p => ({ ...p, telefone: formatPhone(e.target.value) }))}
                          placeholder="(38) 99999-9999"
                          className="bg-transparent focus:outline-none text-sm w-full text-slate-800 font-semibold placeholder:font-normal placeholder:text-slate-400"
                          maxLength={15}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">E-mail <span className="normal-case text-slate-400 font-normal">(opcional)</span></label>
                      <div className="border border-slate-200 bg-slate-50 focus-within:border-emerald-400 focus-within:bg-white rounded-2xl flex items-center px-4 py-3 gap-3 transition-all">
                        <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                        <input
                          type="email"
                          value={jovem.email}
                          onChange={e => setJovem(p => ({ ...p, email: e.target.value }))}
                          placeholder="seuemail@exemplo.com"
                          className="bg-transparent focus:outline-none text-sm w-full text-slate-800 font-semibold placeholder:font-normal placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white py-3.5 rounded-2xl text-sm font-black shadow-lg hover:shadow-emerald-200 hover:shadow-xl transition-all flex items-center justify-center gap-2 mt-1"
                    >
                      {loading ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Enviando cadastro...</>
                      ) : (
                        <>Enviar Inscrição <ArrowRight className="h-4 w-4" /></>
                      )}
                    </button>
                  </form>
                )}

                {/* FORM — EMPRESA */}
                {profile === 'empresa' && (
                  <form onSubmit={handleEmpresaSubmit} className="flex flex-col gap-4 animate-fadeIn">
                    <div className="flex items-center gap-2 mb-1">
                      <button
                        type="button"
                        onClick={() => { setProfile(null); setError(''); }}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-bold"
                      >
                        ← Voltar
                      </button>
                      <span className="text-slate-300">|</span>
                      <div className="flex items-center gap-1.5">
                        <div className="bg-indigo-100 p-1.5 rounded-lg">
                          <Building2 className="h-3.5 w-3.5 text-indigo-600" />
                        </div>
                        <span className="text-xs font-black text-slate-700">Cadastro da Empresa</span>
                      </div>
                    </div>

                    {/* Razão Social */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Razão Social *</label>
                      <div className="border border-slate-200 bg-slate-50 focus-within:border-indigo-400 focus-within:bg-white rounded-2xl flex items-center px-4 py-3 gap-3 transition-all">
                        <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                        <input
                          type="text"
                          value={empresa.razaoSocial}
                          onChange={e => setEmpresa(p => ({ ...p, razaoSocial: e.target.value }))}
                          placeholder="Nome Empresa Ltda."
                          className="bg-transparent focus:outline-none text-sm w-full text-slate-800 font-semibold placeholder:font-normal placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    {/* CNPJ */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">CNPJ *</label>
                      <div className="border border-slate-200 bg-slate-50 focus-within:border-indigo-400 focus-within:bg-white rounded-2xl flex items-center px-4 py-3 gap-3 transition-all">
                        <Hash className="h-4 w-4 text-slate-400 shrink-0" />
                        <input
                          type="text"
                          value={empresa.cnpj}
                          onChange={e => setEmpresa(p => ({ ...p, cnpj: formatCNPJ(e.target.value) }))}
                          placeholder="00.000.000/0001-00"
                          className="bg-transparent focus:outline-none text-sm w-full text-slate-800 font-semibold placeholder:font-normal placeholder:text-slate-400"
                          maxLength={18}
                        />
                      </div>
                    </div>

                    {/* Responsável */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Nome do Responsável *</label>
                      <div className="border border-slate-200 bg-slate-50 focus-within:border-indigo-400 focus-within:bg-white rounded-2xl flex items-center px-4 py-3 gap-3 transition-all">
                        <User className="h-4 w-4 text-slate-400 shrink-0" />
                        <input
                          type="text"
                          value={empresa.responsavel}
                          onChange={e => setEmpresa(p => ({ ...p, responsavel: e.target.value }))}
                          placeholder="Fulano de Tal"
                          className="bg-transparent focus:outline-none text-sm w-full text-slate-800 font-semibold placeholder:font-normal placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">E-mail *</label>
                      <div className="border border-slate-200 bg-slate-50 focus-within:border-indigo-400 focus-within:bg-white rounded-2xl flex items-center px-4 py-3 gap-3 transition-all">
                        <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                        <input
                          type="email"
                          value={empresa.email}
                          onChange={e => setEmpresa(p => ({ ...p, email: e.target.value }))}
                          placeholder="rh@empresa.com.br"
                          className="bg-transparent focus:outline-none text-sm w-full text-slate-800 font-semibold placeholder:font-normal placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    {/* Telefone */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Telefone *</label>
                      <div className="border border-slate-200 bg-slate-50 focus-within:border-indigo-400 focus-within:bg-white rounded-2xl flex items-center px-4 py-3 gap-3 transition-all">
                        <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                        <input
                          type="text"
                          value={empresa.telefone}
                          onChange={e => setEmpresa(p => ({ ...p, telefone: formatPhone(e.target.value) }))}
                          placeholder="(38) 3333-4444"
                          className="bg-transparent focus:outline-none text-sm w-full text-slate-800 font-semibold placeholder:font-normal placeholder:text-slate-400"
                          maxLength={15}
                        />
                      </div>
                    </div>

                    {/* Segmento */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Segmento <span className="normal-case text-slate-400 font-normal">(opcional)</span></label>
                      <div className="border border-slate-200 bg-slate-50 focus-within:border-indigo-400 focus-within:bg-white rounded-2xl flex items-center px-4 py-3 gap-3 transition-all">
                        <Briefcase className="h-4 w-4 text-slate-400 shrink-0" />
                        <select
                          value={empresa.segmento}
                          onChange={e => setEmpresa(p => ({ ...p, segmento: e.target.value }))}
                          className="bg-transparent focus:outline-none text-sm w-full text-slate-800 font-semibold"
                        >
                          <option value="">Selecione o segmento...</option>
                          {SEGMENTOS.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-3.5 rounded-2xl text-sm font-black shadow-lg hover:shadow-indigo-200 hover:shadow-xl transition-all flex items-center justify-center gap-2 mt-1"
                    >
                      {loading ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Enviando cadastro...</>
                      ) : (
                        <>Enviar para Aprovação <ArrowRight className="h-4 w-4" /></>
                      )}
                    </button>
                  </form>
                )}

                {/* Footer link */}
                {!success && (
                  <p className="text-center text-xs text-slate-400 font-semibold mt-5">
                    Já tenho conta{' '}
                    <Link href="/login" className="text-indigo-600 hover:text-indigo-800 font-bold underline-offset-2 hover:underline">
                      → Fazer Login
                    </Link>
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        <p className="text-center text-indigo-300/50 text-[10px] mt-6 font-medium">
          © 2026 Descubra Hub · Pirapora, Minas Gerais
        </p>
      </div>
    </div>
  );
}
