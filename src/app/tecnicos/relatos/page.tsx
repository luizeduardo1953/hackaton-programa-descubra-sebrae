"use client";

import React, { useState } from 'react';
import {
  MessageSquare, Zap, AlertTriangle, CheckCircle2, Loader2,
  ChevronDown, ChevronUp, Copy, Sparkles, Brain, ClipboardCheck, Info, Clock
} from 'lucide-react';

// ─── IA ENGINE SIMULADA ───────────────────────────────────────────────────────

type Sentimento  = 'positivo' | 'negativo' | 'neutro';
type StatusIA    = 'Em Curso' | 'Alerta' | 'Evadido' | 'Contratado';

interface AnaliseResult {
  sentimento: Sentimento;
  sentimentoScore: number; // 0–100
  status: StatusIA;
  alertas: string[];
  acaoRecomendada: string;
  mensagens: number;
  participantes: string[];
  resumo: string;
}

const PALAVRAS_NEGATIVAS  = ['faltou','problema','difícil','doença','não consegue','abandonou','desanimo','cansado','perdido','triste','dificuldade','preocupado','apreensivo'];
const PALAVRAS_POSITIVAS  = ['contratado','empregado','passei','consegui','ótimo','aprovado','feliz','animado','empolgado','trabalhando','conseguiu','aceitou'];
const PALAVRAS_EVASAO     = ['desisti','sair','não vou mais','parei','desistir','não quero','largei'];
const PALAVRAS_TRANSPORTE = ['ônibus','transporte','passagem','locomoção','dinheiro para ir','não tenho como chegar'];
const PALAVRAS_FINANCEIRO = ['dinheiro','renda','emprego informal','bico','trabalhar','financeiro','precisa','necessita'];
const PALAVRAS_SAUDE      = ['doente','hospital','médico','saúde','internado','operação','covid'];

function detectarFormato(texto: string): 'whatsapp' | 'telegram' | 'livre' {
  if (/\[\d{2}:\d{2}/.test(texto)) return 'whatsapp';
  if (/\d{2}:\d{2}\n/.test(texto) || texto.includes('Encaminhado de')) return 'telegram';
  return 'livre';
}

function extrairParticipantes(texto: string): string[] {
  const matches = new Set<string>();
  const re1 = /\] ([\w\s]+):/g;   // WhatsApp: [HH:MM, DD/MM/YYYY] Nome:
  const re2 = /^([^:]+):/gm;      // Livre: Nome:
  let m;
  while ((m = re1.exec(texto)) !== null) matches.add(m[1].trim());
  if (matches.size === 0) while ((m = re2.exec(texto)) !== null) matches.add(m[1].trim().slice(0,25));
  return Array.from(matches).slice(0, 5);
}

function analisarTexto(texto: string): AnaliseResult {
  const lower   = texto.toLowerCase();
  const linhas  = texto.split('\n').filter(l => l.trim());
  const formato = detectarFormato(texto);
  const participantes = extrairParticipantes(texto);

  let pontoPos = 0;
  let pontoNeg = 0;
  PALAVRAS_POSITIVAS.forEach(w => { if (lower.includes(w)) pontoPos += 20; });
  PALAVRAS_NEGATIVAS.forEach(w => { if (lower.includes(w)) pontoNeg += 15; });
  PALAVRAS_EVASAO.forEach(w => { if (lower.includes(w)) pontoNeg += 30; });

  let sentimento: Sentimento = 'neutro';
  let sentimentoScore = 50;
  if (pontoPos > pontoNeg + 10) { sentimento = 'positivo'; sentimentoScore = Math.min(90, 55 + pontoPos); }
  if (pontoNeg > pontoPos + 10) { sentimento = 'negativo'; sentimentoScore = Math.max(10, 45 - pontoNeg); }

  let status: StatusIA = 'Em Curso';
  if (PALAVRAS_POSITIVAS.some(w => w === 'contratado' || w === 'empregado') && lower.includes('contrat')) status = 'Contratado';
  if (PALAVRAS_EVASAO.some(w => lower.includes(w))) status = 'Evadido';
  if (pontoNeg > 25) status = 'Alerta';
  if (lower.includes('contratado') || lower.includes('foi contratad') || lower.includes('conseguiu emprego')) status = 'Contratado';

  const alertas: string[] = [];
  if (PALAVRAS_TRANSPORTE.some(w => lower.includes(w))) alertas.push('⚠️ Dificuldade de transporte mencionada');
  if (PALAVRAS_FINANCEIRO.some(w => lower.includes(w))) alertas.push('💸 Necessidade financeira identificada');
  if (PALAVRAS_SAUDE.some(w => lower.includes(w))) alertas.push('🏥 Questão de saúde relatada');
  if (PALAVRAS_EVASAO.some(w => lower.includes(w))) alertas.push('🚨 Risco de evasão detectado — ação imediata recomendada');
  if (lower.includes('falt') || lower.includes('ausente') || lower.includes('não foi')) alertas.push('📅 Ausência registrada na conversa');
  if (lower.includes('escola') && lower.includes('não')) alertas.push('📚 Possível conflito com horário escolar');
  if (alertas.length === 0) alertas.push('✅ Nenhum alerta crítico identificado na conversa');

  const acoes: Record<StatusIA, string> = {
    'Em Curso':   'Manter acompanhamento semanal. Verificar frequência no curso e motivação do jovem.',
    'Alerta':     'Agendar visita domiciliar com urgência. Contatar responsável legal e verificar necessidades imediatas.',
    'Evadido':    'Acionar protocolo de busca ativa. Registrar motivo de evasão e contatar a família para reintegração.',
    'Contratado': 'Registrar contratação no sistema e encaminhar para emissão de certificado. Celebrar conquista com o jovem!',
  };

  const resumos: Record<StatusIA, string> = {
    'Em Curso':   `A IA analisou ${linhas.length} mensagens e identificou que o jovem está em acompanhamento ativo. O tom geral da conversa é ${sentimento}.`,
    'Alerta':     `A IA identificou sinais preocupantes em ${linhas.length} mensagens. Foram detectados indicadores que podem comprometer a permanência no programa.`,
    'Evadido':    `A IA detectou intenção clara de abandono do programa. É necessária ação imediata da equipe técnica.`,
    'Contratado': `A IA identificou notícia de contratação formal! O jovem aparentemente conseguiu ingressar no mercado de trabalho.`,
  };

  return {
    sentimento,
    sentimentoScore,
    status,
    alertas,
    acaoRecomendada: acoes[status],
    mensagens: linhas.length,
    participantes,
    resumo: resumos[status],
  };
}

// ─── HISTORICO ────────────────────────────────────────────────────────────────

interface HistoricoItem { id: number; texto: string; resultado: AnaliseResult; timestamp: string; }

// ─── COMPONENT ───────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  'Em Curso':   'bg-blue-50 text-blue-700 border-blue-200',
  'Alerta':     'bg-rose-50 text-rose-700 border-rose-200',
  'Evadido':    'bg-slate-50 text-slate-600 border-slate-200',
  'Contratado': 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export default function TecnicosRelatosPage() {
  const [texto, setTexto]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [resultado, setResultado] = useState<AnaliseResult | null>(null);
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [histAberto, setHistAberto] = useState<number | null>(null);

  const handleAnalisar = async () => {
    if (!texto.trim()) return;
    setLoading(true);
    setResultado(null);
    await new Promise(r => setTimeout(r, 1600));
    const r = analisarTexto(texto);
    setResultado(r);
    setLoading(false);
  };

  const handleSalvar = () => {
    if (!resultado) return;
    const item: HistoricoItem = {
      id: Date.now(),
      texto,
      resultado,
      timestamp: new Date().toLocaleString('pt-BR'),
    };
    setHistorico(h => [item, ...h].slice(0, 5));
    alert('✅ Análise salva no histórico! Use o formulário de acompanhamento para registrar no prontuário do jovem.');
  };

  const sentimentoConfig = resultado ? {
    positivo: { label: '😊 Positivo', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', bar: 'bg-emerald-500' },
    negativo: { label: '😟 Negativo', color: 'text-rose-600',    bg: 'bg-rose-50 border-rose-200',       bar: 'bg-rose-500'    },
    neutro:   { label: '😐 Neutro',   color: 'text-slate-600',   bg: 'bg-slate-50 border-slate-200',     bar: 'bg-slate-400'   },
  }[resultado.sentimento] : null;

  return (
    <div className="flex flex-col gap-6">

      {/* ── Header ────────────────────────────────── */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-emerald-100 p-2 rounded-xl">
                <Brain className="h-5 w-5 text-emerald-700" />
              </div>
              <h1 className="text-lg font-black text-slate-900">Analisador de Relatos por IA</h1>
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider">
                ✨ Gemini
              </span>
            </div>
            <p className="text-xs text-slate-500 font-semibold max-w-lg">
              Cole aqui a conversa do WhatsApp ou Telegram com o jovem. A IA analisa o conteúdo e sugere a ação mais adequada automaticamente.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-purple-50 border border-purple-100 rounded-2xl px-3 py-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            <span className="text-purple-700 text-xs font-bold">Análise por Heurística + NLP</span>
          </div>
        </div>
      </div>

      {/* ── Input area ────────────────────────────── */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
            Cole a conversa aqui
          </label>
          <div className="flex gap-2">
            {(['WhatsApp', 'Telegram', 'Texto Livre'] as const).map(f => (
              <span key={f} className="text-[9px] font-bold text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg">
                {f}
              </span>
            ))}
          </div>
        </div>

        <textarea
          value={texto}
          onChange={e => setTexto(e.target.value)}
          rows={8}
          placeholder={`[14:32, 30/05/2026] Técnica Lorena: Oi Lucas, tudo bem?\n[14:35, 30/05/2026] Lucas: Oi! Tô bem sim. Mas faltei ontem porque não tinha passagem de ônibus.\n[14:36, 30/05/2026] Técnica Lorena: Entendi. Vou ver o que consigo para te ajudar com o transporte.\n\nOu cole qualquer conversa de texto aqui...`}
          className="w-full border border-slate-200 bg-slate-50 rounded-2xl p-4 text-sm font-mono text-slate-700 focus:outline-none focus:border-purple-400 resize-none leading-relaxed"
        />

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleAnalisar}
            disabled={!texto.trim() || loading}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white px-6 py-3 rounded-2xl text-sm font-black shadow-lg shadow-purple-200 transition-all flex items-center gap-2"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Analisando com IA...</>
            ) : (
              <><Brain className="h-4 w-4" /> Analisar com IA Gemini</>
            )}
          </button>

          {texto && (
            <button onClick={() => setTexto('')} className="text-slate-400 hover:text-slate-600 text-xs font-bold transition-colors">
              Limpar
            </button>
          )}

          {texto && (
            <span className="text-slate-400 text-[10px] font-semibold ml-auto">
              {texto.split('\n').filter(l=>l.trim()).length} linhas · formato: {detectarFormato(texto)}
            </span>
          )}
        </div>
      </div>

      {/* ── Loading skeleton ──────────────────────── */}
      {loading && (
        <div className="bg-white rounded-3xl shadow-sm border border-purple-100 p-6 animate-pulse">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-2xl shimmer" />
            <div className="flex-1">
              <div className="h-4 bg-purple-50 rounded-xl w-1/3 shimmer mb-2" />
              <div className="h-3 bg-slate-50 rounded-xl w-2/3 shimmer" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-50 rounded-2xl shimmer" />)}
          </div>
        </div>
      )}

      {/* ── Resultado da IA ───────────────────────── */}
      {resultado && !loading && (
        <div className="bg-white rounded-3xl shadow-sm border border-purple-100 overflow-hidden animate-slideUp">
          {/* Result header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-white/80" />
                <h2 className="text-white font-black text-sm">Análise Concluída</h2>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-white/60 text-[10px]">{resultado.mensagens} msgs · {resultado.participantes.length} participante(s)</span>
                <span className={`text-xs font-black px-3 py-1 rounded-full border ${STATUS_COLORS[resultado.status]}`}>
                  {resultado.status}
                </span>
              </div>
            </div>
            <p className="text-white/70 text-xs mt-2 font-semibold leading-relaxed">{resultado.resumo}</p>
          </div>

          <div className="p-6 flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Card: Sentimento */}
              <div className={`border rounded-2xl p-4 flex flex-col gap-3 ${sentimentoConfig?.bg}`}>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-slate-500" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Sentimento Detectado</span>
                </div>
                <p className={`text-xl font-black ${sentimentoConfig?.color}`}>{sentimentoConfig?.label}</p>
                <div>
                  <div className="h-2 bg-white/60 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${sentimentoConfig?.bar} rounded-full transition-all duration-1000`}
                      style={{ width: `${resultado.sentimentoScore}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1">Intensidade: {resultado.sentimentoScore}%</p>
                </div>
              </div>

              {/* Card: Status */}
              <div className="border border-slate-100 bg-slate-50 rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4 text-slate-500" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Status Sugerido</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-black px-3 py-1.5 rounded-xl border ${STATUS_COLORS[resultado.status]}`}>
                    {resultado.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-semibold">
                  Baseado na análise do conteúdo da conversa.
                </p>
              </div>

              {/* Card: Alertas */}
              <div className="border border-rose-100 bg-rose-50/50 rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-500" />
                  <span className="text-[10px] font-black text-rose-600 uppercase tracking-wider">Alertas Identificados</span>
                </div>
                <ul className="flex flex-col gap-1.5">
                  {resultado.alertas.map((a, i) => (
                    <li key={i} className="text-xs text-slate-700 font-semibold">{a}</li>
                  ))}
                </ul>
              </div>

              {/* Card: Ação */}
              <div className="border border-emerald-100 bg-emerald-50/50 rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Ação Recomendada</span>
                </div>
                <p className="text-xs text-slate-700 font-semibold leading-relaxed">{resultado.acaoRecomendada}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 flex-wrap pt-2 border-t border-slate-100">
              <button
                onClick={handleSalvar}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shadow-md shadow-indigo-100"
              >
                <ClipboardCheck className="h-4 w-4" /> Salvar como Acompanhamento
              </button>
              <button
                onClick={() => navigator.clipboard?.writeText(JSON.stringify(resultado, null, 2))}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2"
              >
                <Copy className="h-4 w-4" /> Copiar JSON
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Histórico ─────────────────────────────── */}
      {historico.length > 0 && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400" />
            <h2 className="text-sm font-black text-slate-700">Histórico de Análises</h2>
          </div>

          <div className="divide-y divide-slate-50">
            {historico.map((item) => (
              <div key={item.id} className="px-6">
                <button
                  onClick={() => setHistAberto(histAberto === item.id ? null : item.id)}
                  className="w-full py-4 flex items-center justify-between gap-3 text-left hover:bg-slate-50 transition-colors rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${STATUS_COLORS[item.resultado.status]}`}>
                      {item.resultado.status}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">{item.timestamp}</span>
                    <span className="text-[10px] text-slate-400">{item.texto.slice(0, 60)}...</span>
                  </div>
                  {histAberto === item.id ? <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />}
                </button>

                {histAberto === item.id && (
                  <div className="pb-4 text-xs text-slate-500 bg-slate-50 rounded-2xl p-4 mb-3">
                    <p className="font-bold mb-1">Sentimento: {item.resultado.sentimento} ({item.resultado.sentimentoScore}%)</p>
                    <p className="font-bold mb-1">Alertas: {item.resultado.alertas.join(' | ')}</p>
                    <p className="font-semibold text-emerald-600">Ação: {item.resultado.acaoRecomendada}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Dica ──────────────────────────────────── */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-4 flex items-start gap-3">
        <Info className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
        <p className="text-xs text-indigo-700 font-semibold leading-relaxed">
          <strong>Como usar:</strong> Abra o WhatsApp Web, selecione a conversa com o jovem, clique em ⋮ → &quot;Exportar conversa&quot; (sem mídia) e cole o texto aqui. Funciona também com Telegram e textos livres de atendimento.
        </p>
      </div>

    </div>
  );
}
