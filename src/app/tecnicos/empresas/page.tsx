"use client";

import React, { useState, useEffect } from 'react';
import { Building, Phone, Mail, User } from 'lucide-react';
import { db } from '../../../lib/db';
import type { Company } from '../../../lib/db';

export default function TecnicosEmpresasPage() {
  const [empresas, setEmpresas] = useState<Company[]>([]);

  useEffect(() => {
    setEmpresas(db.getEmpresas());
  }, []);

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      
      {/* Title */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-2">
        <h2 className="text-xl font-black text-slate-900">Empresas Parceiras Conveniadas</h2>
        <p className="text-xs text-slate-400">Relação de parceiros privados de Pirapora que acolhem jovens aprendizes do programa.</p>
      </div>

      {/* Companies List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {empresas.map(e => (
          <div key={e.id} className="bg-white p-5 rounded-3xl border border-slate-100 flex flex-col gap-4 shadow-sm relative hover:shadow-md transition-shadow">
            
            <div className="flex items-center gap-3">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150 shrink-0">
                <Building className="h-6 w-6 text-slate-500" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-950">{e.nome_fantasia || e.razao_social}</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase">CNPJ: {e.cnpj}</p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 flex flex-col gap-2 text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-2">
                <User className="h-4 w-4 text-slate-400 shrink-0" />
                <strong>Responsável:</strong> {e.responsavel_nome}
              </span>
              <span className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                <strong>Telefone:</strong> {e.telefone || 'Sem telefone'}
              </span>
              <span className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                <strong>E-mail:</strong> {e.email || 'Sem e-mail'}
              </span>
            </div>

            <div className="border-t border-slate-150 pt-2 text-[10px] text-slate-400 font-bold">
              Bairro: {e.bairro} | Cidade: {e.cidade}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
