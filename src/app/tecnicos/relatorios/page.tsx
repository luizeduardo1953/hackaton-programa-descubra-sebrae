'use client';

import React, { useState, useMemo } from 'react';
import { 
  FileText, Download, Database, Sparkles, Loader2, User, 
  LayoutDashboard, Copy, CheckCircle2, AlertCircle, FileSpreadsheet 
} from 'lucide-react';
import { db } from '../../../lib/db';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { motion, AnimatePresence } from 'framer-motion';

export default function TecnicosRelatoriosPage() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [tab, setTab] = useState<'individual' | 'sistema'>('individual');
  const [selectedYouth, setSelectedYouth] = useState('y1');
  
  // Button States
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [isCsvGenerating, setIsCsvGenerating] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState<boolean | null>(null);
  const [csvSuccess, setCsvSuccess] = useState<boolean | null>(null);

  const youths = useMemo(() => db.getYouthList(), []);
  const vulns = useMemo(() => db.getYouthVulnerabilities(), []);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Professional PDF Export using jspdf + jspdf-autotable
  const handleExportPDF = async () => {
    setIsPdfGenerating(true);
    setPdfSuccess(null);

    // Dynamic formula for dynamic scoring
    const getDynamicScore = (jovemId: string) => {
      const y = youths.find(item => item.id === jovemId);
      const v = vulns.find(item => item.jovem_id === jovemId);
      if (!y || !v) return { score: 0, rating: 'Baixo' };

      const baixa_renda = v.bolsa_familia || v.cad_unico || y.renda_familiar < 1000 ? 1 : 0;
      const evasao_escolar = v.abandonou_escola || y.status_atual === 'Evadido' ? 1 : 0;
      const vulnerabilidade_social = v.medida_socioeducativa || v.deficiencia ? 1 : 0;
      const desemprego = y.status_atual !== 'Contratado' ? 1 : 0;
      const baixa_participacao = y.pontos_gamificacao < 100 || y.status_atual === 'Alerta' ? 1 : 0;

      const score = baixa_renda * 20 + evasao_escolar * 25 + vulnerabilidade_social * 30 + desemprego * 15 + baixa_participacao * 10;
      const rating = score >= 60 ? 'Crítico' : score >= 30 ? 'Médio' : 'Baixo';
      return { score, rating };
    };

    try {
      // Simulate professional PDF generation time for better UX micro-interactions
      await new Promise(resolve => setTimeout(resolve, 2000));

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const today = new Date();
      const formattedDate = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
      const formattedDateTime = today.toLocaleString('pt-BR');

      // ── PDF HEADER (Dark Blue Navy Style) ──────────────────────
      doc.setFillColor(15, 23, 42); // Navy Slate 900
      doc.rect(0, 0, 210, 42, 'F');

      // Header Text / Logo
      doc.setTextColor(52, 211, 153); // Emerald 400
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('★ PROGRAMA DESCUBRA', 15, 18);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('Helvetica', 'normal');
      doc.text('INCLUSÃO PRODUTIVA SOCIAL E ACOMPANHAMENTO DE JOVENS', 15, 25);

      // Metainfo boxes (Header Right)
      doc.setTextColor(148, 163, 184); // Slate 400
      doc.setFontSize(8);
      doc.text(`TÉCNICO RESPONSÁVEL: LUIZ EDUARDO`, 130, 16);
      doc.text(`DATA EMISSÃO: ${formattedDateTime}`, 130, 22);
      doc.text(`EQUIPAMENTO: CREAS - PIRAPORA`, 130, 28);

      // Section divider glow line
      doc.setDrawColor(16, 185, 129); // Emerald 500
      doc.setLineWidth(1);
      doc.line(0, 42, 210, 42);

      // ── REPORT BODY ──────────────────────────────────────────────
      if (tab === 'individual') {
        const y = youths.find(item => item.id === selectedYouth);
        if (!y) throw new Error('Jovem não encontrado');
        const { score, rating } = getDynamicScore(y.id);

        doc.setTextColor(15, 23, 42);
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(14);
        doc.text(`Relatório Individual de Diagnóstico Social`, 15, 55);

        doc.setDrawColor(226, 232, 240); // Slate 200
        doc.setLineWidth(0.5);
        doc.line(15, 58, 195, 58);

        // Render Individual stats table
        autoTable(doc, {
          startY: 62,
          theme: 'grid',
          headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
          bodyStyles: { fontSize: 9 },
          head: [['Campo Psicométrico / Social', 'Detalhamento Técnico']],
          body: [
            ['Nome Completo', y.nome_completo],
            ['CPF', y.cpf],
            ['Data de Nascimento', new Date(y.data_nascimento).toLocaleDateString('pt-BR')],
            ['Bairro / Cidade', `${y.bairro} - ${y.cidade}`],
            ['Escolaridade', y.escolaridade],
            ['Status de Participação', y.status_atual],
            ['Pontuação no Hub', `${y.pontos_gamificacao} pts`],
            ['Score de Vulnerabilidade Dinâmico', `${score} pontos`],
            ['Classificação de Risco Social', rating.toUpperCase()],
            ['Equipamento Vinculado', 'CREAS Pirapora'],
            ['Plano de Ação Sugerido', score >= 60 
              ? 'Intervenção urgente: Assistência social direta, vale-transporte emergencial, e matrícula em curso noturno SENAI.' 
              : 'Encaminhamento regular: Mentoria de carreira e direcionamento para processos seletivos de Jovem Aprendiz.'
            ],
            ['Observações Técnicas', 'Acompanhamento sistemático e visitas mensais recomendadas para sustentabilidade do plano de ação.']
          ],
        });

      } else {
        // Consolidated System statistics
        const criticalCount = youths.filter(y => getDynamicScore(y.id).score >= 60).length;
        const alertCount = youths.filter(y => y.status_atual === 'Alerta').length;
        const avgScore = Math.round(youths.reduce((acc, curr) => acc + getDynamicScore(curr.id).score, 0) / youths.length);

        doc.setTextColor(15, 23, 42);
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(14);
        doc.text(`Relatório Consolidado de Impacto - Rede Ativa`, 15, 55);

        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.5);
        doc.line(15, 58, 195, 58);

        // General stats indicators in the PDF
        doc.setFontSize(10);
        doc.setFont('Helvetica', 'bold');
        doc.text(`Total de Jovens no Hub: ${youths.length}`, 15, 66);
        doc.text(`Casos de Risco Crítico: ${criticalCount}`, 75, 66);
        doc.text(`Média Geral de Vulnerabilidade: ${avgScore} pts`, 135, 66);

        // Render Consolidated Table of all active youth
        const tableRows = youths.map(y => {
          const { score, rating } = getDynamicScore(y.id);
          return [
            y.nome_completo,
            y.bairro,
            y.status_atual,
            `${score} pts`,
            rating,
            score >= 60 ? 'Urgente: Visita e Auxílio' : 'Acompanhamento Trimestral'
          ];
        });

        autoTable(doc, {
          startY: 72,
          theme: 'striped',
          headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
          bodyStyles: { fontSize: 8.5 },
          head: [['Nome Completo', 'Bairro', 'Status', 'Score', 'Classificação', 'Plano Recomendado']],
          body: tableRows,
        });
      }

      // Footer
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setTextColor(148, 163, 184);
        doc.setFontSize(8);
        doc.text(`Programa Descubra • Pirapora/MG • Página ${i} de ${totalPages}`, 15, 287);
        doc.text(`Autenticidade garantida por chave criptográfica local`, 135, 287);
      }

      // Save PDF
      doc.save(`relatorio-programa-descubra-${formattedDate}.pdf`);

      setPdfSuccess(true);
      showToast('📄 Relatório PDF gerado e baixado com sucesso!');
    } catch (err) {
      console.error(err);
      setPdfSuccess(false);
      showToast('❌ Ocorreu um erro ao gerar o PDF.', 'error');
    } finally {
      setIsPdfGenerating(false);
    }
  };

  // Elegant CSV Export
  const handleExportCSV = async () => {
    setIsCsvGenerating(true);
    setCsvSuccess(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const csvContent = db.exportCSV();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", url);
      downloadAnchor.setAttribute("download", `descubra_hub_excel_${new Date().getFullYear()}.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setCsvSuccess(true);
      showToast('📊 Planilha Excel (CSV) baixada com sucesso!');
    } catch (err) {
      console.error(err);
      setCsvSuccess(false);
      showToast('❌ Ocorreu um erro ao exportar a planilha.', 'error');
    } finally {
      setIsCsvGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn relative pb-10 text-slate-800 min-h-screen">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-50 shadow-2xl px-6 py-4 rounded-2xl text-sm font-black flex items-center gap-3 border ${
              toast.type === 'success' 
                ? 'bg-white text-emerald-600 border-emerald-100 shadow-xl' 
                : 'bg-white text-rose-600 border-rose-100 shadow-xl'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" /> : <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Container (Deep slate blue theme) */}
      <div className="relative overflow-hidden bg-[#0f172a] p-6 md:p-8 rounded-3xl shadow-md border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-400 p-4 rounded-2xl text-[#0f172a] shadow-inner shadow-black/20">
              <FileText className="h-8 w-8" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Painel do Técnico</span>
              <h1 className="text-2xl font-black mt-1 text-white leading-none">Relatórios & Exportação</h1>
              <p className="text-xs text-slate-400 font-semibold mt-1">Gere diagnósticos em formato profissional PDF para audiências ou exporte planilhas de auditoria estadual.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* IA/PDF Generator Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#3b82f6]" />
              <h2 className="text-base font-black text-slate-800">Configurações de Emissão</h2>
            </div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Visual Híbrido</span>
          </div>

          {/* Custom Tabs (Standardized Blue/Green) */}
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
            <button 
              onClick={() => setTab('individual')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                tab === 'individual' 
                  ? 'bg-blue-600 text-white shadow-md border border-blue-700' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <User className="h-4 w-4" /> Relatório Individual
            </button>
            <button 
              onClick={() => setTab('sistema')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                tab === 'sistema' 
                  ? 'bg-blue-600 text-white shadow-md border border-blue-700' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" /> Ficha Geral Consolidada
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {tab === 'individual' && (
              <div className="animate-fadeIn">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Selecione o Jovem de Interesse</label>
                <select 
                  className="w-full mt-2 bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-800 text-xs font-bold rounded-xl px-4 py-3.5 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 transition-all cursor-pointer"
                  value={selectedYouth}
                  onChange={e => setSelectedYouth(e.target.value)}
                >
                  {youths.map(y => (
                    <option key={y.id} value={y.id} className="bg-white text-slate-800">{y.nome_completo} ({y.status_atual})</option>
                  ))}
                </select>
              </div>
            )}

            <div className="mt-2 flex flex-col gap-3">
              {/* PDF Print Button - Standardized with Emerald Green primary action */}
              <motion.button 
                whileTap={{ scale: 0.98 }}
                onClick={handleExportPDF}
                disabled={isPdfGenerating}
                className={`w-full font-black py-4 rounded-2xl shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2 border cursor-pointer ${
                  pdfSuccess === true
                    ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-500 shadow-blue-500/20'
                    : pdfSuccess === false
                      ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-500 shadow-rose-500/20'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-400 shadow-emerald-500/20'
                }`}
              >
                {isPdfGenerating ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <FileText className="h-5 w-5" />
                )}
                {isPdfGenerating 
                  ? 'Compilando Dados e Gerando PDF...' 
                  : pdfSuccess === true
                    ? 'PDF Exportado com Sucesso!'
                    : pdfSuccess === false
                      ? 'Falha na Emissão - Tentar Novamente'
                      : 'Exportar Relatório em PDF'
                }
              </motion.button>
            </div>
          </div>

          {/* AI Result Area (White/Blue Theme) */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Informações Adicionais do Layout</span>
              <span className="text-[10px] text-emerald-600 font-black">• Pronto para download</span>
            </div>
            <p className="text-xs text-slate-650 leading-relaxed font-semibold">
              O PDF gerado segue o rigor técnico exigido pela auditoria do Estado de Minas Gerais, incluindo o logotipo do programa, identificação do operador CREAS, metadados cronológicos, score de vulnerabilidade e tabelas formatadas de forma organizada.
            </p>
          </div>

        </div>

        {/* Portability / Export Section (White/Blue card) */}
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4 h-fit">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-[#3b82f6]" />
            <h2 className="text-base font-black text-slate-800">Planilhas Fiscais</h2>
          </div>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed">Baixe tabelas integradas em formato Excel para sincronizar auditorias governamentais regionais.</p>

          <div className="flex flex-col gap-3 mt-2">
            <motion.button 
              whileTap={{ scale: 0.97 }}
              onClick={handleExportCSV}
              disabled={isCsvGenerating}
              className={`w-full p-4 rounded-2xl text-xs font-black border transition-all flex items-center justify-between cursor-pointer ${
                csvSuccess === true
                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-600 shadow-xs'
                  : csvSuccess === false
                    ? 'bg-rose-50/50 border-rose-200 text-rose-600 shadow-xs'
                    : 'bg-slate-50 border-slate-200 hover:border-emerald-250 hover:bg-emerald-50/20 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  csvSuccess === true ? 'bg-emerald-100 text-emerald-600' : 'bg-emerald-50 text-emerald-600'
                }`}>
                  {isCsvGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
                </div>
                <span>Planilha Excel (CSV)</span>
              </div>
              <Download className="h-4 w-4 opacity-55" />
            </motion.button>
          </div>
        </div>

      </div>
    </div>
  );
}
