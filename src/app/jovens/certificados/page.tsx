'use client';

import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, Clock, FileText, AlertCircle, FileUp, Zap, Loader2 } from 'lucide-react';

interface Certificate {
  id: string;
  name: string;
  hours: string;
  date: string;
  status: 'Pendente' | 'Aprovado' | 'Recusado';
  pts?: number;
}

const INITIAL_CERTS: Certificate[] = [
  { id: 'c1', name: 'Curso de Informática Básica', hours: '40h', date: '10/05/2026', status: 'Aprovado', pts: 50 },
  { id: 'c2', name: 'Oficina de Currículo', hours: '4h', date: '25/05/2026', status: 'Pendente' },
];

export default function CertificadosPage() {
  const [certs, setCerts] = useState<Certificate[]>(INITIAL_CERTS);
  const [isUploading, setIsUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [courseName, setCourseName] = useState('');
  const [courseHours, setCourseHours] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName || !courseHours) return;

    setIsUploading(true);

    // Simulate network upload
    setTimeout(() => {
      const newCert: Certificate = {
        id: `c${Date.now()}`,
        name: courseName,
        hours: courseHours,
        date: new Date().toLocaleDateString('pt-BR'),
        status: 'Pendente'
      };

      setCerts([newCert, ...certs]);
      setIsUploading(false);
      setCourseName('');
      setCourseHours('');
      showToast('Certificado enviado com sucesso! Aguardando validação do técnico.');
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto pb-10">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white shadow-2xl px-6 py-4 rounded-2xl text-sm font-bold flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="h-5 w-5" />
          {toastMessage}
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 animate-fadeIn">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-50 text-indigo-600 p-4 rounded-2xl">
            <FileUp className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-slate-800 text-xl font-black">Meus Certificados</h1>
            <p className="text-slate-500 text-xs font-semibold mt-1">Envie seus certificados de cursos e ganhe "Descubra Points" após a validação.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* ── UPLOAD FORM (Left Col) ── */}
        <div className="md:col-span-1 flex flex-col gap-4">
          <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-5 animate-fadeIn delay-100">
            <h2 className="text-sm font-black text-slate-800 flex items-center gap-2 mb-4">
              <UploadCloud className="h-4 w-4 text-indigo-600" />
              Enviar Novo
            </h2>

            <form onSubmit={handleUpload} className="flex flex-col gap-4">
              
              {/* Fake Drag & Drop Area */}
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 transition-colors cursor-pointer group">
                <div className="bg-white p-3 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                  <FileText className="h-6 w-6 text-indigo-400 group-hover:text-indigo-600" />
                </div>
                <p className="text-xs font-bold text-slate-600">Clique ou arraste o PDF/Imagem do certificado</p>
                <p className="text-[10px] font-semibold text-slate-400 mt-1">Max 5MB</p>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Nome do Curso/Oficina</label>
                <input 
                  type="text" 
                  required
                  value={courseName}
                  onChange={e => setCourseName(e.target.value)}
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="Ex: Informática Básica"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Carga Horária</label>
                <input 
                  type="text" 
                  required
                  value={courseHours}
                  onChange={e => setCourseHours(e.target.value)}
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="Ex: 40h"
                />
              </div>

              <button 
                type="submit"
                disabled={isUploading || !courseName || !courseHours}
                className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black text-sm py-3 rounded-xl transition-all shadow-md shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar para Validação'
                )}
              </button>

            </form>
          </div>
        </div>

        {/* ── CERTIFICATES LIST (Right Col) ── */}
        <div className="md:col-span-2 flex flex-col gap-4 animate-fadeIn delay-200">
          <h2 className="text-sm font-black text-slate-800 px-2 flex items-center justify-between">
            <span>Histórico de Envios</span>
            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-[10px] border border-slate-200">{certs.length} registros</span>
          </h2>

          <div className="flex flex-col gap-3">
            {certs.map(cert => (
              <div key={cert.id} className="bg-white border border-slate-100 shadow-sm rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-md transition-shadow">
                
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl shrink-0 ${
                    cert.status === 'Aprovado' ? 'bg-emerald-50 text-emerald-600' :
                    cert.status === 'Recusado' ? 'bg-rose-50 text-rose-600' :
                    'bg-amber-50 text-amber-600'
                  }`}>
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800">{cert.name}</h3>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] font-semibold text-slate-500">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {cert.hours}</span>
                      <span className="text-slate-300">•</span>
                      <span>Enviado em {cert.date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                  {cert.status === 'Aprovado' ? (
                    <div className="flex items-center gap-3">
                      <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Aprovado
                      </span>
                      <span className="flex items-center gap-1 text-emerald-600 font-black text-sm">
                        <Zap className="h-4 w-4 fill-emerald-600" /> +{cert.pts}
                      </span>
                    </div>
                  ) : cert.status === 'Recusado' ? (
                    <span className="bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> Recusado
                    </span>
                  ) : (
                    <span className="bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Em Validação
                    </span>
                  )}
                </div>

              </div>
            ))}
          </div>

          {certs.length === 0 && (
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center">
              <FileUp className="h-10 w-10 text-slate-300 mb-3" />
              <p className="text-slate-500 font-bold text-sm">Nenhum certificado enviado</p>
              <p className="text-slate-400 text-xs font-semibold mt-1">Faça o upload do seu primeiro certificado para ganhar pontos!</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
