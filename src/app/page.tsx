"use client";

import React from 'react';
import Link from 'next/link';
import { GraduationCap, ArrowRight, CheckCircle, Users, Award, ShieldAlert, Heart } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white">
              <GraduationCap className="h-6 w-6 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Descubra Futuro Jovem</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Programa Descubra • Minas Gerais</p>
            </div>
          </div>
          <Link 
            href="/login"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            Acessar o Painel
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-indigo-900 text-white py-20 px-4 relative overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#4338ca,transparent)] opacity-55" />
        <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center gap-6">
          <span className="bg-indigo-700 text-emerald-400 font-extrabold text-[10px] uppercase px-4 py-1 rounded-full border border-indigo-500 tracking-widest shadow-sm">
            Impacto Social de Pirapora/MG
          </span>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight max-w-2xl">
            Inclusão Profissional e Oportunidades para Jovens em Vulnerabilidade
          </h2>
          <p className="text-base text-indigo-100 max-w-xl font-medium leading-relaxed">
            Uma ponte viva ligando os serviços de assistência social (CREAS, CRAS, Acolhimento) e as empresas parceiras para capacitar e inserir adolescentes no mercado de trabalho.
          </p>
          <div className="flex gap-4 mt-2">
            <Link 
              href="/login"
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-8 py-3.5 rounded-2xl text-sm font-black shadow-lg shadow-emerald-500/10 hover:scale-105 transition-all flex items-center gap-2"
            >
              Acessar Painel de Gestão
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Key stats banner */}
      <section className="bg-white border-b border-slate-100 py-8 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-black text-indigo-600">80%+</span>
            <span className="text-xs text-slate-400 font-bold uppercase">Taxa de Conclusão</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-black text-indigo-600">3 Anos</span>
            <span className="text-xs text-slate-400 font-bold uppercase">Série Histórica</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-black text-indigo-600">20+</span>
            <span className="text-xs text-slate-400 font-bold uppercase">Empresas Parceiras</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-black text-indigo-600">100%</span>
            <span className="text-xs text-slate-400 font-bold uppercase">Fila de Vulnerabilidade</span>
          </div>
        </div>
      </section>

      {/* Institutional Framework Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 flex flex-col gap-10">
        <div className="text-center flex flex-col gap-2">
          <h3 className="text-2xl font-black text-slate-900">Aliança Interinstitucional</h3>
          <p className="text-xs text-slate-400 font-semibold leading-relaxed max-w-md mx-auto">
            O Programa Descubra é resultado de uma aliança cooperativa que assegura direitos fundamentais e gera empregabilidade sustentável.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-3">
            <div className="bg-indigo-50 p-3 rounded-2xl w-12 h-12 flex items-center justify-center text-indigo-600 shadow-inner">
              <Users className="h-6 w-6" />
            </div>
            <h4 className="text-base font-black text-slate-900">Assistência Social (Referência)</h4>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              O **CREAS, CRAS, CECEP e Casas de Acolhimento** identificam os adolescentes em extrema vulnerabilidade, realizam a inscrição guiada e acompanham a frequência familiar.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-3">
            <div className="bg-indigo-50 p-3 rounded-2xl w-12 h-12 flex items-center justify-center text-indigo-600 shadow-inner">
              <Award className="h-6 w-6" />
            </div>
            <h4 className="text-base font-black text-slate-900">Entidades Formadoras</h4>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              **SENAI, SENAC, CIEE, Sebrae** e outras entidades fornecem os cursos de aprendizagem profissional e capacitação técnica inicial direcionada.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-3">
            <div className="bg-indigo-50 p-3 rounded-2xl w-12 h-12 flex items-center justify-center text-indigo-600 shadow-inner">
              <ArrowRight className="h-6 w-6" />
            </div>
            <h4 className="text-base font-black text-slate-900">Empresas & Cota Legal</h4>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              O setor privado (como indústrias e comércio de Pirapora) disponibiliza as vagas de **Jovem Aprendiz** sob o suporte legal da auditoria fiscal do MPT/TRT.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-indigo-950 text-indigo-300 border-t border-indigo-900 py-8 text-center text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Descubra Hub. Gestão Municipal e Série Histórica do Programa Descubra.</p>
          <div className="flex gap-4">
            <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Prefeitura Municipal de Pirapora/MG</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
