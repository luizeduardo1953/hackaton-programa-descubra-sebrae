'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckSquare, Award, Check, X, Edit3, MessageSquare, 
  Clock, Heart, Play, Film, Image as ImageIcon, Sparkles, 
  Search, Filter, ShieldAlert, Loader2, CheckCircle2, ChevronRight, AlertTriangle
} from 'lucide-react';
import { db, type Depoimento, type Youth, type ReferenceUnit } from '../../../lib/db';
import { motion, AnimatePresence } from 'framer-motion';

export default function TecnicosValidacaoPage() {
  const [depoimentos, setDepoimentos] = useState<Depoimento[]>([]);
  const [youths, setYouths] = useState<Youth[]>([]);
  const [units, setUnits] = useState<ReferenceUnit[]>([]);
  
  const [filter, setFilter] = useState<'todos' | 'pendente' | 'aprovado' | 'rejeitado' | 'destaque'>('todos');
  const [search, setSearch] = useState('');
  
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Feedback Modal/Overlay State
  const [adjustingDepId, setAdjustingDepId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');

  // Load database values
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800)); // Smooth loading skeleton simulation
      setDepoimentos(db.getDepoimentos());
      setYouths(db.getYouthList());
      setUnits(db.getUnidades());
      setIsLoading(false);
    };
    loadData();
  }, []);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Moderation Actions
  const handleAprovar = (id: string, name: string) => {
    db.updateDepoimentoStatus(id, 'aprovado');
    setDepoimentos(db.getDepoimentos());
    showToast(`✨ História de ${name.split(' ')[0]} aprovada e publicada no mural!`);
  };

  const handleRejeitar = (id: string, name: string) => {
    db.updateDepoimentoStatus(id, 'rejeitado');
    setDepoimentos(db.getDepoimentos());
    showToast(`❌ Depoimento de ${name.split(' ')[0]} foi rejeitado.`);
  };

  const handleDestacar = (id: string, currentDestaque: boolean, name: string) => {
    db.destacarDepoimento(id, !currentDestaque);
    setDepoimentos(db.getDepoimentos());
    if (!currentDestaque) {
      showToast(`🏆 ${name.split(' ')[0]} foi promovido para "História Inspiradora"!`);
    } else {
      showToast(`Selo de destaque removido de ${name.split(' ')[0]}.`);
    }
  };

  const handleOpenAjustes = (id: string, prevFeedback?: string) => {
    setAdjustingDepId(id);
    setFeedbackText(prevFeedback || '');
  };

  const handleConfirmAjustes = () => {
    if (!adjustingDepId) return;
    if (!feedbackText.trim()) {
      showToast('Por favor, escreva as orientações de ajustes.', 'error');
      return;
    }

    db.updateDepoimentoStatus(adjustingDepId, 'ajustes', feedbackText);
    setDepoimentos(db.getDepoimentos());
    setAdjustingDepId(null);
    setFeedbackText('');
    showToast('⚠️ Solicitação de ajustes encaminhada ao jovem.');
  };

  // Dynamic Mapping: testimonials enriched with youth and unit information
  const enrichedDepoimentos = useMemo(() => {
    return depoimentos.map(dep => {
      const youth = youths.find(y => y.id === dep.jovem_id);
      const unit = units.find(u => u?.id === youth?.indicado_por_unidade);
      
      // Calculate dynamic priority badge based on youth vulnerability score
      let prioridade: 'alta' | 'media' | 'baixa' = 'baixa';
      if (youth) {
        if (youth.score_vulnerabilidade >= 10) prioridade = 'alta';
        else if (youth.score_vulnerabilidade >= 6) prioridade = 'media';
      }

      return {
        ...dep,
        jovem: youth,
        equipamento: unit?.nome || 'Assistência Social',
        prioridade,
        fotoMock: youth?.sexo === 'F' 
          ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop' 
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop'
      };
    });
  }, [depoimentos, youths, units]);

  // Filtering Logic
  const filteredDepoimentos = useMemo(() => {
    return enrichedDepoimentos.filter(dep => {
      const matchesSearch = dep.jovem?.nome_completo.toLowerCase().includes(search.toLowerCase()) ||
                            dep.titulo.toLowerCase().includes(search.toLowerCase()) ||
                            dep.descricao.toLowerCase().includes(search.toLowerCase());
      
      if (!matchesSearch) return false;

      if (filter === 'todos') return true;
      if (filter === 'destaque') return dep.destaque;
      return dep.status === filter;
    });
  }, [enrichedDepoimentos, filter, search]);

  return (
    <div className="flex flex-col gap-6 animate-fadeIn relative pb-10 text-slate-800 min-h-screen">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-50 shadow-2xl px-6 py-4 rounded-2xl text-sm font-black flex items-center gap-3 border ${
              toast.type === 'success' 
                ? 'bg-white text-emerald-600 border-emerald-100 shadow-xl' 
                : 'bg-white text-rose-650 border-rose-100 shadow-xl'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" /> : <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Adjustments Feedback Overlay Modal (White/Blue Theme) */}
      <AnimatePresence>
        {adjustingDepId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAdjustingDepId(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white border border-slate-200 p-6 rounded-3xl shadow-2xl flex flex-col gap-4 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="bg-blue-50 border border-blue-100 p-2.5 rounded-xl text-blue-600">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800">Solicitar Ajustes Técnicos</h3>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Indique as orientações para o jovem readequar seu depoimento.</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Observações do Técnico</label>
                <textarea 
                  value={feedbackText}
                  onChange={e => setFeedbackText(e.target.value)}
                  placeholder="Escreva aqui detalhadamente os pontos que o jovem precisa alterar (ex: melhorar concordância gramatical, adicionar o nome da empresa parceira, detalhar o auxílio-transporte do CREAS...)"
                  className="w-full bg-slate-50 border border-slate-200 hover:border-slate-350 rounded-2xl p-4 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 min-h-[120px] transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="flex justify-end gap-3 mt-2 border-t border-slate-100 pt-4">
                <button 
                  onClick={() => setAdjustingDepId(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-black text-slate-450 hover:text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleConfirmAjustes}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-blue-600/10 transition-all flex items-center gap-1.5 cursor-pointer border border-blue-500"
                >
                  <MessageSquare className="w-4 h-4" /> Enviar Feedback
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header Container (Deep Navy blue theme) */}
      <div className="relative overflow-hidden bg-[#0f172a] p-6 md:p-8 rounded-3xl shadow-md border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-400 p-4 rounded-2xl text-[#0f172a] shadow-inner shadow-black/20">
              <CheckSquare className="h-8 w-8" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Painel do Técnico</span>
              <h1 className="text-2xl font-black mt-1 text-white leading-none">Validação de Depoimentos</h1>
              <p className="text-xs text-slate-400 font-semibold mt-1">Homologue relatos e histórias de superação e transformação dos jovens para publicação no mural de conquistas.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Control Filters & Search (White/Blue Theme) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center bg-white p-4 rounded-3xl border border-slate-100 shadow-xs">
        
        {/* Search */}
        <div className="lg:col-span-1 bg-slate-50 border border-slate-200 rounded-xl flex items-center px-4 py-2.5 gap-3 focus-within:border-blue-400 transition-all">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input 
            type="text" 
            placeholder="Buscar por jovem ou relato..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent focus:outline-none text-xs w-full text-slate-700 font-semibold placeholder:font-medium"
          />
        </div>

        {/* Filters */}
        <div className="lg:col-span-3 flex flex-wrap gap-2 justify-start lg:justify-end">
          {[
            { id: 'todos', label: 'Todos os Relatos', icon: Filter },
            { id: 'pendente', label: 'Pendentes', icon: Clock },
            { id: 'aprovado', label: 'Aprovados', icon: Check },
            { id: 'rejeitado', label: 'Rejeitados', icon: X },
            { id: 'destaque', label: 'Histórias Inspiradoras', icon: Award }
          ].map(f => {
            const Icon = f.icon;
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                  active 
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/10' 
                    : 'bg-slate-50 text-slate-500 hover:text-slate-800 border-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {f.label}
              </button>
            );
          })}
        </div>

      </div>

      {/* Main Validation Queue Area */}
      <div className="flex flex-col gap-4">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            // Skeletons
            Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4 animate-pulse">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-full bg-slate-100 shrink-0" />
                    <div className="space-y-2">
                      <div className="h-3.5 bg-slate-100 rounded-full w-48" />
                      <div className="h-2 bg-slate-100 rounded-full w-24" />
                    </div>
                  </div>
                  <div className="h-5 bg-slate-100 rounded-full w-16" />
                </div>
                <div className="h-3 bg-slate-100 rounded-full w-1/3" />
                <div className="h-3 bg-slate-100 rounded-full w-full" />
                <div className="h-3 bg-slate-100 rounded-full w-5/6" />
              </div>
            ))
          ) : filteredDepoimentos.map(dep => {
            let badgeStatusCor = 'bg-blue-50 text-blue-600 border-blue-100';
            let labelStatus = 'Pendente';
            
            if (dep.status === 'aprovado') {
              badgeStatusCor = 'bg-emerald-50 text-emerald-600 border-emerald-100';
              labelStatus = 'Aprovado e Mural';
            } else if (dep.status === 'rejeitado') {
              badgeStatusCor = 'bg-slate-100 text-slate-650 border-slate-200';
              labelStatus = 'Rejeitado';
            } else if (dep.status === 'ajustes') {
              badgeStatusCor = 'bg-amber-50 text-amber-600 border-amber-100';
              labelStatus = 'Ajustes Solicitados';
            }

            return (
              <motion.div
                layout
                key={dep.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
                className={`relative bg-white p-6 rounded-3xl border shadow-sm flex flex-col gap-4 overflow-hidden transition-all ${
                  dep.destaque 
                    ? 'border-yellow-400 bg-yellow-50/10 ring-1 ring-yellow-350/20 shadow-md shadow-yellow-100' 
                    : 'border-slate-100 hover:shadow-md'
                }`}
              >
                {/* Glowing highlighted backdrop decoration */}
                {dep.destaque && (
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-yellow-300/10 rounded-full blur-2xl pointer-events-none"></div>
                )}

                {/* Header Information (Profile, Equipment, Priority) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src={dep.fotoMock} 
                      alt={dep.jovem?.nome_completo}
                      className="h-11 w-11 rounded-full border border-slate-200 shrink-0 object-cover shadow-sm"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-black text-slate-800 tracking-tight">{dep.jovem?.nome_completo}</h4>
                        {dep.prioridade === 'alta' && (
                          <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-100 animate-pulse">Prioridade Urgente</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2.5 mt-0.5 text-[10px] font-semibold text-slate-400">
                        <span>Equipamento: <strong className="text-blue-600">{dep.equipamento}</strong></span>
                        <span>•</span>
                        <span>Envio: {new Date(dep.criado_em).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    {/* Status Badge */}
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${badgeStatusCor}`}>
                      {labelStatus}
                    </span>

                    {/* Gold Star Badge for Transformation Stories */}
                    {dep.destaque && (
                      <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full bg-gradient-to-r from-yellow-100 to-amber-50 text-yellow-600 border border-yellow-200 flex items-center gap-1 shadow-sm">
                        <Award className="w-3.5 h-3.5 fill-current text-yellow-500" />
                        História Inspiradora
                      </span>
                    )}
                  </div>
                </div>

                {/* Relato Content Section */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest">Título: &ldquo;{dep.titulo}&rdquo;</h3>
                  <p className="text-xs text-slate-650 leading-relaxed font-semibold italic bg-slate-50/50 p-4 rounded-2xl border border-slate-100 relative">
                    <span className="absolute top-2 left-2 text-2xl font-serif text-slate-300 select-none">&ldquo;</span>
                    {dep.descricao}
                  </p>
                  
                  {/* Testimonial Rich Media (Mockups) */}
                  {(dep.imagens && dep.imagens.length > 0) && (
                    <div className="flex gap-2 flex-wrap mt-1">
                      {dep.imagens.map((img, i) => (
                        <div key={i} className="relative rounded-xl overflow-hidden border border-slate-200 group cursor-zoom-in">
                          <img src={img} alt="depoimento" className="h-16 w-28 object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <ImageIcon className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Expanded Feedback area if waiting for adjustments */}
                {dep.status === 'ajustes' && dep.feedback_tecnico && (
                  <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 flex gap-2.5 items-start">
                    <AlertTriangle className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-600">Feedback de Ajustes Pendentes:</span>
                      <p className="text-xs text-slate-650 font-semibold mt-1 leading-relaxed">&ldquo;{dep.feedback_tecnico}&rdquo;</p>
                    </div>
                  </div>
                )}

                {/* Technical Actions Footer Panel */}
                <div className="border-t border-slate-100 pt-4 flex flex-wrap items-center justify-between gap-3">
                  {/* Highlight Story Selector */}
                  <button 
                    onClick={() => handleDestacar(dep.id, dep.destaque, dep.jovem?.nome_completo || 'Jovem')}
                    className={`text-xs font-black px-4 py-2 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                      dep.destaque 
                        ? 'bg-yellow-50 border-yellow-250 text-yellow-600 shadow-sm' 
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Award className={`w-4 h-4 ${dep.destaque ? 'fill-current text-yellow-500' : ''}`} />
                    {dep.destaque ? 'Destacado' : 'Destacar História'}
                  </button>

                  {/* Main Moderation Actions */}
                  <div className="flex items-center gap-2">
                    {/* Ask for adjustments */}
                    <button 
                      onClick={() => handleOpenAjustes(dep.id, dep.feedback_tecnico)}
                      className="bg-slate-50 hover:bg-slate-100 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-black shadow-sm flex items-center gap-1 border border-slate-200 transition-colors cursor-pointer"
                      title="Solicitar Ajustes Técnicos"
                    >
                      <Edit3 className="h-3.5 w-3.5 text-blue-500" />
                      Solicitar Ajustes
                    </button>

                    {dep.status !== 'rejeitado' && (
                      <button 
                        onClick={() => handleRejeitar(dep.id, dep.jovem?.nome_completo || 'Jovem')}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-650 px-3.5 py-2 rounded-xl text-xs font-black shadow-xs flex items-center gap-1 border border-slate-200 transition-colors cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                        Rejeitar Relato
                      </button>
                    )}

                    {dep.status !== 'aprovado' && (
                      <button 
                        onClick={() => handleAprovar(dep.id, dep.jovem?.nome_completo || 'Jovem')}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-black shadow-md flex items-center gap-1 transition-all cursor-pointer border border-emerald-400"
                      >
                        <Check className="h-4 w-4" />
                        Homologar e Publicar
                      </button>
                    )}
                  </div>
                </div>

              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Empty State */}
        {!isLoading && filteredDepoimentos.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm text-slate-400">
            <CheckSquare className="h-12 w-12 mx-auto text-slate-200 mb-3" />
            <h4 className="text-sm font-black text-slate-650">Tudo limpo por aqui!</h4>
            <p className="text-xs font-semibold text-slate-400 mt-1">Nenhum depoimento corresponde ao filtro de moderação selecionado.</p>
          </div>
        )}
      </div>

    </div>
  );
}
