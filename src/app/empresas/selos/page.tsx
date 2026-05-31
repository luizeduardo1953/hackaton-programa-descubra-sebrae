'use client';

import React, { useState } from 'react';
import { 
  Heart, CheckCircle2, Sparkles, Scale, Megaphone, Users, 
  TrendingUp, Trophy, Star, Newspaper, Globe, Camera,
  ShieldCheck, Briefcase, HandshakeIcon, Award
} from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';

// Import custom company seals images
import BronzeSeal from '../../assets/watermark-removed-bronze.jpeg';
import PrataSeal from '../../assets/watermark-removed-prata.jpeg';
import OuroSeal from '../../assets/watermark-removed-ouro.jpeg';

type TabType = 'bronze' | 'prata' | 'ouro';

const selosData = {
  bronze: {
    titulo: 'Selo Bronze — Apoiador Descubra',
    missao: 'Doar Tempo e Conhecimento',
    nivel: 'Bronze' as const,
    imagem: BronzeSeal,
    corBorda: 'border-amber-600',
    corTexto: 'text-amber-900',
    corBg: 'from-amber-50 to-orange-50',
    tagline: 'A menor barreira de entrada, sem custo financeiro. Ideal para microempresas e MEIs.',
    passos: [
      'Cadastro Básico: O dono da empresa ou colaborador designado cria o perfil como "Empresa Parceira".',
      'Oferta de Mentoria: Cadastre disponibilidade de tempo (ex: 2 horas por mês) ou uma "Pílula de Conhecimento".',
    ],
    gatilho: 'Completar pelo menos UMA das ações práticas:',
    gatilhosItens: [
      'Realizar 2 sessões de mentoria (presencial ou videochamada no app) com jovens na fila, orientando sobre currículo ou profissão.',
      'Promover 1 dia de Job Shadowing: receber jovens na empresa por uma tarde para observarem o ambiente real de trabalho.',
    ],
    beneficiosPilares: [
      {
        icone: Globe,
        cor: 'text-indigo-600',
        bgCor: 'bg-indigo-50',
        titulo: 'Visibilidade Digital',
        descricao: 'Perfil da empresa destacado no app com o selo, ganhando prioridade nas recomendações automáticas do sistema para jovens em busca de vagas.'
      },
      {
        icone: Users,
        cor: 'text-emerald-600',
        bgCor: 'bg-emerald-50',
        titulo: 'Clima Organizacional',
        descricao: 'Colaboradores que doam tempo de mentoria sentem maior propósito e satisfação no trabalho — impacto direto na retenção interna.'
      },
      {
        icone: ShieldCheck,
        cor: 'text-blue-600',
        bgCor: 'bg-blue-50',
        titulo: 'Reputação Comunitária',
        descricao: 'A empresa passa a ser reconhecida como parceira social ativa pela Prefeitura de Pirapora e pelas entidades de assistência (CREAS/CRAS).'
      },
    ],
    divulgacoes: [
      '📱 Perfil da empresa publicado como "Apoiador Ativo" no feed de oportunidades do app, visto por jovens e famílias da região.',
      '📢 Citação da empresa em posts nas redes sociais oficiais do Programa Descubra (Instagram e Facebook da Secretaria Municipal).',
      '🌐 Logotipo e nome da empresa listados na página "Quem Apoia" do site institucional do Programa Descubra.',
    ]
  },
  prata: {
    titulo: 'Selo Prata — Ponte para o Futuro',
    missao: 'Gerar Empregabilidade e Renda',
    nivel: 'Prata' as const,
    imagem: PrataSeal,
    corBorda: 'border-slate-400',
    corTexto: 'text-slate-800',
    corBg: 'from-slate-50 to-slate-100',
    tagline: 'Foco em gerar o primeiro emprego formal fora das cotas legais obrigatórias.',
    passos: [
      'Publicação da Vaga: Divulgue sua oportunidade de contratação diretamente na plataforma de forma simples.',
      'Triagem Assistida: Aguarde o encaminhamento dos candidatos pré-selecionados pela equipe técnica do CRAS/CREAS.',
    ],
    gatilho: 'Ação Prática obrigatória de contratação:',
    gatilhosItens: [
      'Assinar um contrato de trabalho formal (CLT padrão) ou estágio remunerado com o jovem encaminhado.',
      'Registrar a contratação na plataforma para validação e homologação do gestor do CREAS.',
    ],
    beneficiosPilares: [
      {
        icone: Briefcase,
        cor: 'text-indigo-600',
        bgCor: 'bg-indigo-50',
        titulo: 'Mão de Obra Qualificada',
        descricao: 'Os jovens contratados são pré-selecionados e acompanhados por assistentes sociais, reduzindo o turnover e os custos de recrutamento e seleção.'
      },
      {
        icone: TrendingUp,
        cor: 'text-emerald-600',
        bgCor: 'bg-emerald-50',
        titulo: 'Agenda ESG e Licitações',
        descricao: 'O selo Prata pode ser utilizado para pontuar em cláusulas de Responsabilidade Social em licitações públicas municipais e estaduais.'
      },
    ],
    divulgacoes: [
      '🏷️ Autocolante físico oficial do Programa Descubra enviado para a vitrine da empresa — visibilidade no comércio de rua de Pirapora.',
      '📸 Post de destaque nas redes sociais oficiais do Programa: "Conheça a empresa que transformou a vida de [Nome do Jovem]!"',
      '📰 Menção no boletim informativo mensal da Secretaria Municipal de Assistência Social, distribuído a lideranças empresariais da cidade.',
      '🏅 Certificado digital personalizado para uso em apresentações, site e redes sociais da empresa.',
    ]
  },
  ouro: {
    titulo: 'Selo Ouro — Transformador Social',
    missao: 'Abraçar a Causa Principal',
    nivel: 'Ouro' as const,
    imagem: OuroSeal,
    corBorda: 'border-amber-400',
    corTexto: 'text-amber-900',
    corBg: 'from-yellow-50 to-amber-50',
    tagline: 'Inclusão intencional de jovens em altíssima vulnerabilidade ou abertura formal de cotas de Aprendizagem.',
    passos: [
      'Alinhamento Estratégico: Apoiar jovens egressos do sistema socioeducativo, de casas de acolhimento ou em situação de trabalho infantil.',
      'Intencionalidade: Abrir as portas para transformar realidades críticas monitoradas sigilosamente pelo CREAS.',
    ],
    gatilho: 'Cumprir pelo menos UM critério de alto impacto:',
    gatilhosItens: [
      'Opção A: Abrir e preencher vagas formais de Jovem Aprendiz (cota legal com SENAI/SEST SENAT) contratando jovens encaminhados pelo programa.',
      'Opção B: Contratar intencionalmente jovem de alta vulnerabilidade por meio de encaminhamento confidencial do CREAS.',
    ],
    beneficiosPilares: [
      {
        icone: Trophy,
        cor: 'text-amber-600',
        bgCor: 'bg-amber-50',
        titulo: 'Honra ao Mérito Público',
        descricao: 'Reconhecimento pelo Comitê Gestor Interinstitucional (Prefeitura + MPT + Entidades). Convite para cerimônia anual de premiação com cobertura da mídia regional.'
      },
      {
        icone: Megaphone,
        cor: 'text-purple-600',
        bgCor: 'bg-purple-50',
        titulo: 'Case de Sucesso Regional',
        descricao: 'A empresa é posicionada como referência regional de ESG, abrindo portas para linhas de crédito social do BNDES/BDMG com taxas de juros reduzidas.'
      },
    ],
    divulgacoes: [
      '🏆 Troféu físico oficial entregue em cerimônia pública anual com autoridades municipais e cobertura jornalística local.',
      '📺 Reportagem especial no portal de notícias e emissoras locais: "A empresa de Pirapora que transforma o futuro da juventude".',
      '🎖️ Destaque como "Case de Sucesso" em eventos e feiras de empreendedorismo da região Norte de Minas.',
      '🌐 Página dedicada no site do Programa Descubra com a história da empresa e depoimentos dos jovens contratados.',
      '📣 Indicação prioritária pela Prefeitura como empresa de referência social em processos de licitação e parcerias institucionais.',
    ]
  }
};

export default function ManualSelosPage() {
  const [activeTab, setActiveTab] = useState<TabType>('bronze');
  const selo = selosData[activeTab];

  const tabs: { key: TabType; label: string; img: any; cor: string }[] = [
    { key: 'bronze', label: '🥉 Bronze', img: BronzeSeal, cor: 'border-amber-600' },
    { key: 'prata',  label: '🥈 Prata',  img: PrataSeal, cor: 'border-slate-400' },
    { key: 'ouro',   label: '🥇 Ouro',   img: OuroSeal,  cor: 'border-amber-400' },
  ];

  return (
    <div className="flex flex-col gap-8 animate-fadeIn">

      {/* Header */}
      <PageHeader 
        title="Manual de Selos — Certificação Social"
        description="Descubra as missões, os benefícios estratégicos e a visibilidade pública que cada nível de engajamento gera para a sua empresa. Quanto mais você investe na juventude de Pirapora, mais sua marca cresce."
      />

      {/* Tab Navigation */}
      <div className="flex gap-3 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-3 px-5 py-3 rounded-2xl border-2 font-black text-sm transition-all ${
              activeTab === tab.key
                ? `${tab.cor} bg-white shadow-md scale-[1.02]`
                : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'
            }`}
          >
            <img src={tab.img.src} alt={tab.label} className="h-7 w-7 rounded-lg object-cover" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Card */}
      <div className={`rounded-3xl border-2 ${selo.corBorda} bg-gradient-to-br ${selo.corBg} p-6 md:p-8 flex flex-col gap-7`}>

        {/* Selo Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <img
            src={selo.imagem.src}
            alt={selo.titulo}
            className={`h-20 w-20 rounded-[1.5rem] object-cover border-2 ${selo.corBorda} shadow-xl shrink-0 ${activeTab === 'ouro' ? 'animate-pulse' : ''}`}
          />
          <div className="flex flex-col gap-1.5">
            <Badge variant={activeTab === 'ouro' ? 'premium' : activeTab === 'prata' ? 'info' : 'warning'}>
              {selo.nivel}
            </Badge>
            <h2 className={`text-xl font-black ${selo.corTexto} leading-tight`}>{selo.titulo}</h2>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
              <Heart className="h-3.5 w-3.5 text-rose-500 fill-current shrink-0" />
              <span>{selo.tagline}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Coluna Esquerda: Como Conquistar */}
          <div className="flex flex-col gap-5">
            
            {/* Passo a Passo */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/80 flex flex-col gap-3">
              <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">Passo a Passo na Plataforma</span>
              <div className="flex flex-col gap-2">
                {selo.passos.map((passo, idx) => (
                  <div key={idx} className="flex gap-3 items-start">
                    <span className="bg-indigo-600 text-white rounded-lg h-6 w-6 flex items-center justify-center text-[11px] font-black shrink-0 mt-0.5">{idx + 1}</span>
                    <p className="text-xs font-semibold text-slate-700 leading-relaxed">{passo}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Gatilhos de Desbloqueio */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/80 flex flex-col gap-3">
              <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                {selo.gatilho}
              </span>
              <div className="flex flex-col gap-2">
                {selo.gatilhosItens.map((item, idx) => (
                  <div key={idx} className="flex gap-2.5 items-start bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] font-bold text-slate-700 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Coluna Direita: Benefícios + Divulgação */}
          <div className="flex flex-col gap-5">

            {/* Benefícios por Pilar */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/80 flex flex-col gap-3">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Por que vale a pena? (Benefícios)</span>
              <div className="flex flex-col gap-3">
                {selo.beneficiosPilares.map((pilar, idx) => {
                  const Icon = pilar.icone;
                  return (
                    <div key={idx} className="flex gap-3 items-start">
                      <div className={`${pilar.bgCor} p-2 rounded-xl shrink-0`}>
                        <Icon className={`h-4 w-4 ${pilar.cor}`} />
                      </div>
                      <div>
                        <p className={`text-xs font-black ${pilar.cor}`}>{pilar.titulo}</p>
                        <p className="text-[11px] text-slate-600 font-semibold leading-relaxed mt-0.5">{pilar.descricao}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Divulgação e Visibilidade */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/80 flex flex-col gap-3">
              <span className="text-[10px] font-black uppercase text-purple-600 tracking-wider flex items-center gap-1.5">
                <Newspaper className="h-3.5 w-3.5" />
                Como sua empresa será divulgada
              </span>
              <div className="flex flex-col gap-2">
                {selo.divulgacoes.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-start py-2 border-b border-slate-100/70 last:border-b-0">
                    <p className="text-[11px] text-slate-700 font-semibold leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Proposta de Valor Resumida */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            icon: Scale,
            cor: 'text-rose-600',
            bgCor: 'bg-rose-50',
            borda: 'border-rose-100',
            titulo: 'Segurança Legal & Fiscal',
            descricao: 'Cumpra cotas obrigatórias, reduza riscos de autuações do MPT e use o selo como contrapartida em TACs judiciais trabalhistas.'
          },
          {
            icon: Megaphone,
            cor: 'text-indigo-600',
            bgCor: 'bg-indigo-50',
            borda: 'border-indigo-100',
            titulo: 'Marketing de Impacto & ESG',
            descricao: 'Use a chancela do Programa Descubra no seu marketing para atrair o consumidor consciente e se destacar na agenda ESG perante investidores e parceiros.'
          },
          {
            icon: Trophy,
            cor: 'text-amber-600',
            bgCor: 'bg-amber-50',
            borda: 'border-amber-100',
            titulo: 'Reconhecimento & Prioridade',
            descricao: 'Empresas selos Prata e Ouro são indicadas prioritariamente pela Prefeitura em licitações e parcerias, e ganham acesso a crédito social BNDES/BDMG.'
          }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <Card key={idx} className={`!p-5 flex flex-col gap-3 border ${item.borda}`} glass={false}>
              <div className={`${item.bgCor} p-3 rounded-2xl w-fit`}>
                <Icon className={`h-5 w-5 ${item.cor}`} />
              </div>
              <div>
                <h4 className={`text-sm font-black ${item.cor}`}>{item.titulo}</h4>
                <p className="text-[11px] text-slate-600 font-semibold leading-relaxed mt-1">{item.descricao}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Timeline Jornada */}
      <Card className="!p-8 flex flex-col gap-6" glass={false}>
        <div className="text-center flex flex-col gap-1 max-w-xl mx-auto">
          <Badge variant="premium" className="mx-auto">A Jornada da Empresa</Badge>
          <h3 className="text-lg font-black text-slate-900 mt-1">Da Intenção ao Impacto Regional</h3>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed">
            Uma linha do tempo de crescimento sustentável junto ao Programa Descubra e à juventude de Pirapora.
          </p>
        </div>

        <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4 mt-4">
          <div className="hidden md:block absolute left-12 right-12 top-10 h-0.5 bg-slate-200 z-0"></div>

          {[
            { img: BronzeSeal, etapa: 'Etapa 1: Apoiador', titulo: 'Doação de Tempo', cor: 'border-amber-500 bg-amber-50', desc: 'Cadastra-se, doa mentorias e ganha visibilidade digital e comunitária.' },
            { img: PrataSeal,  etapa: 'Etapa 2: Ponte',    titulo: 'Geração de Renda',    cor: 'border-slate-400 bg-slate-50', desc: 'Contrata jovem qualificado, ganha o selo físico para vitrine e benefícios fiscais.' },
            { img: OuroSeal,   etapa: 'Etapa 3: Transformador', titulo: 'Impacto Extremo', cor: 'border-amber-400 bg-yellow-50', desc: 'Inclui jovens em alta vulnerabilidade e recebe Honra ao Mérito público e visibilidade regional.' },
          ].map((ponto, idx) => (
            <div key={idx} className="flex flex-col items-center gap-3 text-center md:w-1/3 relative z-10">
              <div className={`h-20 w-20 rounded-[2rem] border-2 flex items-center justify-center shadow-lg transition-transform hover:scale-105 ${ponto.cor} ${idx === 2 ? 'animate-pulse' : ''}`}>
                <img src={ponto.img.src} alt={ponto.titulo} className="h-16 w-16 rounded-[1.7rem] object-cover" />
              </div>
              <div className="flex flex-col gap-1 px-4">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{ponto.etapa}</span>
                <h4 className="text-sm font-black text-slate-950">{ponto.titulo}</h4>
                <p className="text-[10px] text-slate-500 font-semibold leading-tight mt-0.5">{ponto.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
}
