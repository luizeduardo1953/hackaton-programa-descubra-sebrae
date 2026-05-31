"use client";

import React, { useState } from 'react';
import { BookOpen, GraduationCap, Users, Calendar } from 'lucide-react';

export default function TecnicosCursosPage() {
  const initialCursos = [
    { id: 1, nome: 'Auxiliar Administrativo', entidade: 'Sebrae / SENAC', vagas: 15, alunos: 12, carga: '80 horas', status: 'Em Andamento' },
    { id: 2, nome: 'Operador de Supermercado e Caixa', entidade: 'SENAC', vagas: 20, alunos: 18, carga: '60 horas', status: 'Em Andamento' },
    { id: 3, nome: 'Auxiliar de Linha de Produção Têxtil', entidade: 'SENAI', vagas: 25, alunos: 20, carga: '120 horas', status: 'Em Andamento' },
    { id: 4, nome: 'Técnico em Informática Comercial', entidade: 'CECEP', vagas: 10, alunos: 8, carga: '160 horas', status: 'Aguardando Início' }
  ];

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      
      {/* Title */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-2">
        <h2 className="text-xl font-black text-slate-900">Cursos de Aprendizagem Profissional</h2>
        <p className="text-xs text-slate-400">Relação de turmas e capacitações de entidades parceiras conveniadas ao Descubra.</p>
      </div>

      {/* Courses List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {initialCursos.map(c => (
          <div key={c.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col gap-3 shadow-sm relative">
            <span className={`absolute top-4 right-4 text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
              c.status === 'Em Andamento' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {c.status}
            </span>

            <div className="flex items-center gap-3">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150 shrink-0">
                <BookOpen className="h-6 w-6 text-slate-500" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-950">{c.nome}</h4>
                <p className="text-xs text-slate-400 font-semibold">{c.entidade}</p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-2 flex flex-col gap-1.5 text-xs font-semibold text-slate-600 leading-relaxed">
              <p><strong>Carga Horária:</strong> {c.carga}</p>
              <div className="flex items-center justify-between w-full">
                <p><strong>Alunos Matriculados:</strong> {c.alunos} / {c.vagas}</p>
                <span className="text-[10px] font-black text-indigo-600">{Math.round((c.alunos / c.vagas) * 100)}% Preenchido</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div 
                  style={{ width: `${(c.alunos / c.vagas) * 100}%` }}
                  className="bg-indigo-600 rounded-full h-full" 
                />
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
