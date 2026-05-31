"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  GraduationCap, ArrowRight, Mail, Lock, Eye, EyeOff,
  Users, Trophy, Sliders, Building, AlertCircle, CheckCircle2, Loader2
} from 'lucide-react';
import { db } from '../../lib/db';

// Mock credential table — in production, this comes from Supabase Auth
const MOCK_USERS = [
  { email: 'lorena.creas@descubra.mg.gov.br', senha: 'descubra123', role: 'tecnico',  nome: 'Lorena Silva',         redirect: '/tecnicos/painel' },
  { email: 'mateus.cras@descubra.mg.gov.br',  senha: 'descubra123', role: 'tecnico',  nome: 'Mateus Albuquerque',   redirect: '/tecnicos/painel' },
  { email: 'admin@descubra.mg.gov.br',        senha: 'admin2026',   role: 'admin',    nome: 'Coordenação Descubra', redirect: '/admin/painel'    },
  { email: 'lucas.santos@jovem.com.br',       senha: 'jovem123',    role: 'jovem',    nome: 'Lucas Silva Santos',   redirect: '/jovens/painel'   },
  { email: 'julio.sebrae@sebrae.com.br',      senha: 'sebrae2026',  role: 'empresa',  nome: 'Julio Cesar SEBRAE',   redirect: '/empresas/painel' },
  { email: 'rh.cedro@cedro.com.br',           senha: 'cedro2026',   role: 'empresa',  nome: 'Marcos Frota Cedro',   redirect: '/empresas/painel' },
];

const ROLE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  admin:   { label: 'Coordenador Geral',   color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200'   },
  tecnico: { label: 'Técnico Social',      color: 'text-indigo-700',  bg: 'bg-indigo-50 border-indigo-200' },
  jovem:   { label: 'Área do Jovem',       color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200'},
  empresa: { label: 'Empresa Parceira',    color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200'     },
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Preencha e-mail e senha para continuar.');
      return;
    }
    setLoading(true);
    setError('');

    // Simulate network latency
    await new Promise(r => setTimeout(r, 900));

    const user = MOCK_USERS.find(
      u => u.email.toLowerCase() === email.toLowerCase().trim() && u.senha === password.trim()
    );

    if (!user) {
      setLoading(false);
      setError('E-mail ou senha incorretos. Verifique os dados e tente novamente.');
      return;
    }

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('descubra_session_role', user.role);
      sessionStorage.setItem('descubra_session_nome', user.nome);
      sessionStorage.setItem('descubra_session_email', user.email);
    }

    const roleInfo = ROLE_LABELS[user.role];
    setSuccess(`Bem-vindo(a), ${user.nome.split(' ')[0]}! Você entrou como ${roleInfo.label}.`);
    await new Promise(r => setTimeout(r, 800));
    router.push(user.redirect);
  };

  const handleQuickLogin = async (role: 'tecnico' | 'jovem' | 'admin' | 'empresa') => {
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 600));
    const user = MOCK_USERS.find(u => u.role === role);
    if (user && typeof window !== 'undefined') {
      sessionStorage.setItem('descubra_session_role', user.role);
      sessionStorage.setItem('descubra_session_nome', user.nome);
      sessionStorage.setItem('descubra_session_email', user.email);
    }
    const map: Record<string,string> = { tecnico:'/tecnicos/painel', jovem:'/jovens/painel', admin:'/admin/painel', empresa:'/empresas/painel' };
    router.push(map[role]);
  };

  return (
    <div className="min-h-screen flex font-sans" style={{background:'linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)'}}>
      
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden">
        {/* Background decorative shapes */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-emerald-400 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="bg-indigo-500 p-3 rounded-2xl shadow-lg">
              <GraduationCap className="h-8 w-8 text-white stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-white text-2xl font-black tracking-tight">Descubra Hub</h1>
              <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest">Pirapora • MG</p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-white text-4xl font-black leading-tight">
              Transformando<br />
              <span className="text-indigo-400">vidas jovens</span><br />
              em Minas Gerais.
            </h2>
            <p className="text-indigo-200 text-sm leading-relaxed font-medium max-w-sm">
              Plataforma integrada de gestão social para CREAS, CRAS, CECEP e empresas parceiras do Programa Descubra.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { value: '6', label: 'Jovens Ativos'   },
            { value: '4', label: 'Empresas Parceiras' },
            { value: '4', label: 'Cursos Ativos'   },
          ].map(s => (
            <div key={s.label} className="glass-dark rounded-2xl p-4 text-center">
              <p className="text-white text-2xl font-black">{s.value}</p>
              <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-wider mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md animate-fadeIn">
          
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-8">
            <div className="bg-indigo-500 p-3 rounded-2xl">
              <GraduationCap className="h-7 w-7 text-white stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-white text-xl font-black">Descubra Hub</h1>
              <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-widest">Pirapora • MG</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Card header */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-8 py-6">
              <h2 className="text-white text-xl font-black tracking-tight">Entrar na Plataforma</h2>
              <p className="text-indigo-200 text-xs font-semibold mt-1">
                O sistema identifica seu cargo e abre o painel correto.
              </p>
            </div>

            <div className="p-8 flex flex-col gap-5">
              
              {/* Error banner */}
              {error && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3 flex items-start gap-2.5 animate-slideDown">
                  <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-rose-700 font-semibold leading-relaxed">{error}</p>
                </div>
              )}

              {/* Success banner */}
              {success && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 flex items-start gap-2.5 animate-slideDown">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-700 font-semibold leading-relaxed">{success}</p>
                </div>
              )}

              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">E-mail institucional</label>
                  <div className={`border rounded-2xl flex items-center px-4 py-3 gap-3 transition-all ${
                    error ? 'border-rose-200 bg-rose-50/30' : 'border-slate-200 bg-slate-50 focus-within:border-indigo-400 focus-within:bg-white'
                  }`}>
                    <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError(''); }}
                      placeholder="seu.email@descubra.mg.gov.br"
                      className="bg-transparent focus:outline-none text-sm w-full text-slate-800 font-semibold placeholder:font-normal placeholder:text-slate-400"
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Senha de acesso</label>
                  <div className={`border rounded-2xl flex items-center px-4 py-3 gap-3 transition-all ${
                    error ? 'border-rose-200 bg-rose-50/30' : 'border-slate-200 bg-slate-50 focus-within:border-indigo-400 focus-within:bg-white'
                  }`}>
                    <Lock className="h-4 w-4 text-slate-400 shrink-0" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError(''); }}
                      placeholder="••••••••"
                      className="bg-transparent focus:outline-none text-sm w-full text-slate-800 font-semibold placeholder:font-normal placeholder:text-slate-400"
                      autoComplete="current-password"
                    />
                    <button type="button" onClick={() => setShowPass(v => !v)} className="text-slate-400 hover:text-slate-600 shrink-0">
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-3.5 rounded-2xl text-sm font-black shadow-lg hover:shadow-indigo-200 hover:shadow-xl transition-all flex items-center justify-center gap-2 mt-1"
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Identificando perfil...</>
                  ) : (
                    <>Acessar Painel <ArrowRight className="h-4 w-4" /></>
                  )}
                </button>
              </form>

              <p className="text-center text-xs text-slate-400 font-semibold">
                Primeira vez?{' '}
                <Link href="/cadastro" className="text-indigo-600 hover:text-indigo-800 font-bold underline-offset-2 hover:underline">
                  Criar conta
                </Link>
              </p>

              {/* Quick access */}
              <div className="border-t border-slate-100 pt-5">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center mb-3">
                  Acesso rápido para demonstração
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { role: 'tecnico' as const, icon: <Users className="h-3.5 w-3.5" />,    label: 'Técnico Social',    sub: 'CREAS/CRAS',    color: 'hover:bg-indigo-50 hover:border-indigo-200 group-hover:bg-indigo-600 group-hover:text-white', iconBg: 'bg-indigo-100 text-indigo-700' },
                    { role: 'jovem'   as const, icon: <Trophy className="h-3.5 w-3.5" />,    label: 'Adolescente',       sub: 'Gamificado',    color: 'hover:bg-emerald-50 hover:border-emerald-200',                                                 iconBg: 'bg-emerald-100 text-emerald-700' },
                    { role: 'admin'   as const, icon: <Sliders className="h-3.5 w-3.5" />,   label: 'Coordenador',       sub: 'Admin Geral',   color: 'hover:bg-amber-50 hover:border-amber-200',                                                     iconBg: 'bg-amber-100 text-amber-700' },
                    { role: 'empresa' as const, icon: <Building className="h-3.5 w-3.5" />,  label: 'Empresa',           sub: 'Parceira',      color: 'hover:bg-blue-50 hover:border-blue-200',                                                       iconBg: 'bg-blue-100 text-blue-700' },
                  ].map(q => (
                    <button
                      key={q.role}
                      onClick={() => handleQuickLogin(q.role)}
                      disabled={loading}
                      className={`bg-slate-50 border border-slate-200 p-2.5 rounded-xl transition-all text-left flex items-center gap-2 group text-xs font-bold text-slate-700 disabled:opacity-50 ${q.color}`}
                    >
                      <div className={`${q.iconBg} p-1.5 rounded-lg shrink-0 transition-colors`}>{q.icon}</div>
                      <div>
                        <p className="text-slate-900 leading-none text-[11px]">{q.label}</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">{q.sub}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          <p className="text-center text-indigo-300/50 text-[10px] mt-6 font-medium">
            © 2026 Descubra Hub · Pirapora, Minas Gerais
          </p>
        </div>
      </div>
    </div>
  );
}
