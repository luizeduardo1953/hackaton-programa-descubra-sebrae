'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Database,
  Download,
  Upload,
  Sliders,
  FileText,
  Users,
  TrendingUp,
  Briefcase,
  Bell,
  AlertTriangle,
  CheckCircle2,
  X,
  ChevronRight,
  Star,
  Sparkles,
  ArrowLeft,
  ZoomIn,
  Check,
  Loader2,
  Trophy,
} from 'lucide-react';
import { db, type AuditLog } from '../../../lib/db';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Metric } from '../../../components/ui/Metric';
import { PageHeader } from '../../../components/ui/PageHeader';

// ── Tipos Geográficos e de Dados ──────────────────────────────
type CidadeMapa = {
  id: string
  nome: string
  lat: number
  lng: number
  riscoGeral: 'Crítico' | 'Médio' | 'Baixo'
  alunosTotal: number
  equipamentosQtd: number
  bairros: BairroMapa[]
}

type BairroMapa = {
  nome: string
  lat: number
  lng: number
  tipo: 'Jovem' | 'Empresa' | 'Acolhimento' | 'Formadora'
  risco: 'Crítico' | 'Médio' | 'Baixo' | 'Geral'
  alunosCount: number
  alunosList: string[]
  cep: string
}

// Dados estáticos enriquecidos (Fronteira Geográfica de Teste do MVP)
const CIDADES_SEEDS: CidadeMapa[] = [
  {
    id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    nome: 'Pirapora',
    lat: -17.344933,
    lng: -44.937861,
    riscoGeral: 'Médio',
    alunosTotal: 4,
    equipamentosQtd: 2,
    bairros: [
      {
        nome: 'Marcos Silva (Jovem)',
        tipo: 'Jovem',
        lat: -17.346000,
        lng: -44.936000,
        risco: 'Baixo',
        alunosCount: 25,
        alunosList: ['Fator de Risco: Baixo (Score 25)', 'Escolaridade: Médio Incompleto', 'Turno: Tarde'],
        cep: 'Bairro: Cidade Jardim'
      },
      {
        nome: 'Ana Oliveira (Jovem)',
        tipo: 'Jovem',
        lat: -17.340000,
        lng: -44.945000,
        risco: 'Médio',
        alunosCount: 42,
        alunosList: ['Fator de Risco: Médio (Score 42)', 'Escolaridade: Fundamental Incompleto', 'Turno: Manhã'],
        cep: 'Bairro: Bom Jesus'
      },
      {
        nome: 'Luiz Fernando Melo (Jovem)',
        tipo: 'Jovem',
        lat: -17.355000,
        lng: -44.930000,
        risco: 'Crítico',
        alunosCount: 72,
        alunosList: ['Fator de Risco: Crítico (Score 72)', 'Evasão Escolar Mapeada', 'Região Periférica'],
        cep: 'Bairro: Santos Dumont'
      },
      {
        nome: 'Mateus Ramos (Jovem)',
        tipo: 'Jovem',
        lat: -17.339000,
        lng: -44.936000,
        risco: 'Crítico',
        alunosCount: 88,
        alunosList: ['Fator de Risco: Crítico (Score 88)', 'Bairro: Santo Antônio', 'Acompanhamento do Orientador'],
        cep: 'Bairro: Santo Antônio'
      },
      {
        nome: 'Metalúrgica São Francisco (Empresa)',
        tipo: 'Empresa',
        lat: -17.352000,
        lng: -44.941000,
        risco: 'Geral',
        alunosCount: 0,
        alunosList: ['CNPJ: 12.345.678/0001-90', 'Vagas Ofertadas: 2 (Aprendizagem)', 'Parceira Ativa'],
        cep: 'Bairro: Industrial'
      },
      {
        nome: 'CREAS Pirapora (Acolhimento)',
        tipo: 'Acolhimento',
        lat: -17.343500,
        lng: -44.935000,
        risco: 'Geral',
        alunosCount: 0,
        alunosList: ['Entidade de Acolhimento e Assistência Social', 'Orientadores de Referência: 4', 'Controle de Medidas Ativas'],
        cep: 'Bairro: Centro'
      },
      {
        nome: 'SENAI Pirapora (Formadora)',
        tipo: 'Formadora',
        lat: -17.348000,
        lng: -44.932000,
        risco: 'Geral',
        alunosCount: 0,
        alunosList: ['Entidade Formadora / Cursos Técnicos', 'Programas Ativos: Informática, Administração', 'Parceria Jovem Aprendiz'],
        cep: 'Bairro: Centro'
      }
    ]
  },
  {
    id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    nome: 'Buritizeiro',
    lat: -17.351111,
    lng: -44.962222,
    riscoGeral: 'Crítico',
    alunosTotal: 3,
    equipamentosQtd: 2,
    bairros: [
      {
        nome: 'Patricia Lima (Jovem)',
        tipo: 'Jovem',
        lat: -17.352000,
        lng: -44.960000,
        risco: 'Baixo',
        alunosCount: 18,
        alunosList: ['Fator de Risco: Baixo (Score 18)', 'Curso Preparatório Concluído', 'Pré-aprendizagem Ativa'],
        cep: 'Bairro: Centro'
      },
      {
        nome: 'Lucas Santos (Jovem)',
        tipo: 'Jovem',
        lat: -17.348000,
        lng: -44.970000,
        risco: 'Médio',
        alunosCount: 48,
        alunosList: ['Fator de Risco: Médio (Score 48)', 'Faltas Recentes no Acompanhamento', 'Necessita Preparação Técnica'],
        cep: 'Bairro: São Geraldo'
      },
      {
        nome: 'Rodrigo Silva Cruz (Jovem)',
        tipo: 'Jovem',
        lat: -17.362000,
        lng: -44.955000,
        risco: 'Crítico',
        alunosCount: 85,
        alunosList: ['Fator de Risco: Crítico (Score 85)', 'Reside em Região de Alto Risco', 'Acompanhamento do Orientador'],
        cep: 'Bairro: Nova Pirapora'
      },
      {
        nome: 'Reflorestadora Rio Grande S/A (Empresa)',
        tipo: 'Empresa',
        lat: -17.362000,
        lng: -44.972000,
        risco: 'Geral',
        alunosCount: 0,
        alunosList: ['CNPJ: 45.678.901/0002-30', 'Vagas Ofertadas: 1 (CLT Viveiro)', 'Parceira Ativa'],
        cep: 'Bairro: Industrial'
      },
      {
        nome: 'CRAS Buritizeiro (Acolhimento)',
        tipo: 'Acolhimento',
        lat: -17.355000,
        lng: -44.965000,
        risco: 'Geral',
        alunosCount: 0,
        alunosList: ['Centro de Referência de Assistência Social', 'Atendimento Territorial Ampliado', 'Mapeamento Familiar Ativo'],
        cep: 'Bairro: Aparecida'
      },
      {
        nome: 'CFP Buritizeiro (Formadora)',
        tipo: 'Formadora',
        lat: -17.349000,
        lng: -44.958000,
        risco: 'Geral',
        alunosCount: 0,
        alunosList: ['Centro de Formação Profissional', 'Cursos de Iniciação e Habilidades Básicas', 'Parceria Prefeitura Local'],
        cep: 'Bairro: Nova Pirapora'
      }
    ]
  },
  {
    id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    nome: 'Jequitaí',
    lat: -17.234722,
    lng: -44.431667,
    riscoGeral: 'Baixo',
    alunosTotal: 2,
    equipamentosQtd: 1,
    bairros: [
      {
        nome: 'Thiago Santos (Jovem)',
        tipo: 'Jovem',
        lat: -17.235000,
        lng: -44.432000,
        risco: 'Baixo',
        alunosCount: 10,
        alunosList: ['Fator de Risco: Baixo (Score 10)', 'Estudante Turno da Manhã', 'Acompanhamento Estável'],
        cep: 'Bairro: Centro'
      },
      {
        nome: 'Renato Pinheiro (Jovem)',
        tipo: 'Jovem',
        lat: -17.240000,
        lng: -44.425000,
        risco: 'Médio',
        alunosCount: 52,
        alunosList: ['Fator de Risco: Médio (Score 52)', 'Necessita Apoio Escolar Especializado', 'Interesse em Aprendizagem'],
        cep: 'Bairro: Centro'
      },
      {
        nome: 'Supermercados BH - Jequitaí (Empresa)',
        tipo: 'Empresa',
        lat: -17.236000,
        lng: -44.434000,
        risco: 'Geral',
        alunosCount: 0,
        alunosList: ['CNPJ: 98.765.432/0001-10', 'Vagas Ofertadas: 1 (Caixa Aprendiz)', 'Parceira de Inclusão'],
        cep: 'Bairro: Industrial'
      },
      {
        nome: 'CRAS Jequitaí (Acolhimento)',
        tipo: 'Acolhimento',
        lat: -17.232000,
        lng: -44.429000,
        risco: 'Geral',
        alunosCount: 0,
        alunosList: ['Centro de Referência de Assistência Social Jequitaí', 'Inclusão Produtiva e Proteção Social', 'Orientadores Territoriais'],
        cep: 'Bairro: Centro'
      }
    ]
  }
];


interface Municipio {
  id: string;
  nome: string;
  x: number;
  y: number;
  nivel: 'baixo' | 'medio' | 'alto' | 'critico';
  jovens: number;
  cor: string;
  population?: string;
  area?: string;
  populationNum: number;
  income: number;
}

const MUNICIPIOS: Municipio[] = [
  { id: 'm1', nome: 'Pirapora',       x: 350, y: 450, nivel: 'critico', jovens: 65, cor: '#f43f5e', population: '56.402', populationNum: 56402, income: 820, area: '549 km²' },
  { id: 'm2', nome: 'Montes Claros',  x: 480, y: 320, nivel: 'alto',    jovens: 184, cor: '#f59e0b', population: '413.487', populationNum: 413487, income: 1450, area: '3.589 km²' },
  { id: 'm3', nome: 'Januária',       x: 220, y: 240, nivel: 'alto',    jovens: 92, cor: '#f59e0b', population: '67.854', populationNum: 67854, income: 890, area: '6.691 km²' },
  { id: 'm4', nome: 'São Francisco',  x: 300, y: 360, nivel: 'medio',   jovens: 48, cor: '#eab308', population: '53.824', populationNum: 53824, income: 980, area: '3.298 km²' },
  { id: 'm5', nome: 'Manga',          x: 180, y: 150, nivel: 'baixo',   jovens: 15, cor: '#10b981', population: '18.420', populationNum: 18420, income: 1200, area: '1.950 km²' },
  { id: 'm6', nome: 'Buritizeiro',    x: 320, y: 430, nivel: 'alto',    jovens: 34, cor: '#f59e0b', population: '28.150', populationNum: 28150, income: 910, area: '7.218 km²' },
  { id: 'm7', nome: 'Ibiaí',          x: 420, y: 410, nivel: 'baixo',   jovens: 12, cor: '#10b981', population: '8.340', populationNum: 8340, income: 1150, area: '1.411 km²' },
  { id: 'm8', nome: 'Ponto Chique',   x: 280, y: 300, nivel: 'baixo',   jovens: 8, cor: '#10b981', population: '4.200', populationNum: 4200, income: 1100, area: '602 km²' },
  { id: 'm9', nome: 'Várzea da Palma',x: 520, y: 480, nivel: 'alto',    jovens: 52, cor: '#f59e0b', population: '39.500', populationNum: 39500, income: 1050, area: '1.496 km²' },
  { id:'m10', nome: 'Lassance',       x: 580, y: 520, nivel: 'baixo',   jovens: 19, cor: '#10b981', population: '6.550', populationNum: 6550, income: 1250, area: '1.859 km²' },
];

const NIVEL_LABEL = {
  'baixo': 'Baixo',
  'medio': 'Médio',
  'alto': 'Alto',
  'critico': 'Crítico'
};

const NEIGHBORHOOD_POLYGONS: Record<string, [number, number][]> = {
  'Santo Antônio': [
    [-17.334, -44.940],
    [-17.332, -44.935],
    [-17.337, -44.930],
    [-17.343, -44.932],
    [-17.344, -44.938],
    [-17.340, -44.942]
  ],
  'Cidade Jardim': [
    [-17.342, -44.938],
    [-17.340, -44.934],
    [-17.344, -44.929],
    [-17.348, -44.931],
    [-17.349, -44.937]
  ],
  'Bom Jesus': [
    [-17.336, -44.948],
    [-17.334, -44.943],
    [-17.339, -44.940],
    [-17.343, -44.943],
    [-17.344, -44.948]
  ],
  'Santos Dumont': [
    [-17.351, -44.933],
    [-17.349, -44.928],
    [-17.354, -44.925],
    [-17.358, -44.928],
    [-17.357, -44.933]
  ],
  'Industrial': [
    [-17.348, -44.943],
    [-17.346, -44.939],
    [-17.351, -44.936],
    [-17.354, -44.938],
    [-17.353, -44.943]
  ],
  'Centro': [
    [-17.340, -44.935],
    [-17.338, -44.931],
    [-17.343, -44.927],
    [-17.347, -44.930],
    [-17.345, -44.935]
  ],
  'Buritizeiro-Centro': [
    [-17.348, -44.964],
    [-17.346, -44.959],
    [-17.351, -44.956],
    [-17.355, -44.958],
    [-17.354, -44.963]
  ],
  'São Geraldo': [
    [-17.344, -44.974],
    [-17.342, -44.969],
    [-17.347, -44.966],
    [-17.351, -44.968],
    [-17.350, -44.973]
  ],
  'Nova Pirapora': [
    [-17.345, -44.960],
    [-17.343, -44.955],
    [-17.355, -44.950],
    [-17.365, -44.953],
    [-17.358, -44.959]
  ],
  'Aparecida': [
    [-17.351, -44.969],
    [-17.349, -44.964],
    [-17.354, -44.961],
    [-17.358, -44.963],
    [-17.357, -44.968]
  ],
  'Jequitaí-Centro': [
    [-17.230, -44.436],
    [-17.228, -44.430],
    [-17.235, -44.422],
    [-17.243, -44.425],
    [-17.242, -44.433]
  ],
  'Jequitaí-Industrial': [
    [-17.232, -44.438],
    [-17.230, -44.433],
    [-17.235, -44.430],
    [-17.239, -44.432],
    [-17.238, -44.437]
  ]
};

function getNeighborhoodCoords(cidadeNome: string, bairroCep: string, bairroLat: number, bairroLng: number): [number, number][] {
  const cleanBairro = (bairroCep || '').replace('Bairro: ', '');
  let lookupKey = cleanBairro;
  if (cidadeNome === 'Buritizeiro' && cleanBairro === 'Centro') {
    lookupKey = 'Buritizeiro-Centro';
  } else if (cidadeNome === 'Jequitaí' && cleanBairro === 'Centro') {
    lookupKey = 'Jequitaí-Centro';
  } else if (cidadeNome === 'Jequitaí' && cleanBairro === 'Industrial') {
    lookupKey = 'Jequitaí-Industrial';
  }

  let coords = NEIGHBORHOOD_POLYGONS[lookupKey];
  if (!coords) {
    const numVertices = 8;
    const radius = 0.0035;
    coords = [];
    for (let i = 0; i < numVertices; i++) {
      const angle = (i * 2 * Math.PI) / numVertices;
      const seed = Math.sin(bairroLat * 1000 + bairroLng * 1000 + angle);
      const factor = 0.85 + seed * 0.15;
      const vLat = bairroLat + Math.sin(angle) * radius * factor;
      const vLng = bairroLng + Math.cos(angle) * radius * factor;
      coords.push([vLat, vLng]);
    }
  }
  return coords;
}



const TOP5 = [...MUNICIPIOS].sort((a, b) => {
  const n = { 'critico': 4, 'alto': 3, 'medio': 2, 'baixo': 1 };
  return n[b.nivel] - n[a.nivel];
}).slice(0, 5);
/* ════════════════════════════════════════════════════════ */
export default function AdminPainelPage() {
  const [auditLogs,        setAuditLogs]        = useState<AuditLog[]>([]);
  const [toastMessage,     setToastMessage]     = useState<string | null>(null);
  const [rankingKey,       setRankingKey]       = useState(0);

  const [diag, setDiag] = useState({
    total: 0, encaminhados: 0, contratados: 0, alertas: 0,
    taxaEnc: 0, taxaCont: 0,
  });

  const [scoreWeights, setScoreWeights] = useState({
    bolsa_familia: 1,
    cad_unico: 1,
    medida_socioeducativa: 3,
    deficiencia: 1,
    sem_internet: 1,
    sem_computador: 1,
    sem_trabalho: 1,
    abandono_escola: 2,
    dificuldade_transporte: 2,
    acompanhamento_psico: 1,
  });

  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedCidade, setSelectedCidade] = useState<CidadeMapa | null>(null);
  const [selectedBairro, setSelectedBairro] = useState<BairroMapa | null>(null);
  const [selectedBairroFilter, setSelectedBairroFilter] = useState<string>('todos');
  const [mapFilter, setMapFilter] = useState<'todos' | 'critico' | 'medio' | 'baixo' | 'formadoras' | 'unidades' | 'empresas'>('todos');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const heatmapLayerRef = useRef<any>(null);
  const bairroBoundaryLayerRef = useRef<any>(null);

  // Injeção dinâmica do Leaflet
  useEffect(() => {
    const cssId = 'leaflet-css';
    const jsId = 'leaflet-js';

    const cssExists = document.getElementById(cssId);
    const jsExists = document.getElementById(jsId);

    if (cssExists && jsExists && window.hasOwnProperty('L')) {
      setMapLoaded(true);
      return;
    }

    if (!cssExists) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      document.head.appendChild(link);
    }

    if (!jsExists) {
      const script = document.createElement('script');
      script.id = jsId;
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      script.crossOrigin = '';
      script.onload = () => {
        setMapLoaded(true);
      };
      document.head.appendChild(script);
    } else if (window.hasOwnProperty('L')) {
      setMapLoaded(true);
    }
  }, []);

  // Cleanup Leaflet
  useEffect(() => {
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  const desenharMarcadoresCidades = useCallback(() => {
    const L = (window as any).L;
    if (!L || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    heatmapLayerRef.current.clearLayers();

    CIDADES_SEEDS.forEach((cidade) => {
      let corGlow = 'bg-green-500';
      if (cidade.riscoGeral === 'Crítico') corGlow = 'bg-red-500';
      else if (cidade.riscoGeral === 'Médio') corGlow = 'bg-orange-500';

      const customIcon = L.divIcon({
        className: 'bg-transparent border-0',
        html: `
          <div class="relative flex items-center justify-center w-8 h-8">
            <span class="animate-ping absolute inline-flex h-6 w-6 rounded-full ${corGlow} opacity-30"></span>
            <span class="relative inline-flex rounded-full h-4.5 w-4.5 ${corGlow} border-2 border-white shadow-lg shadow-black/50"></span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([cidade.lat, cidade.lng], { icon: customIcon });
      
      marker.bindPopup(`
        <div class="bg-zinc-950 text-white p-3 rounded-xl border border-white/5 font-sans min-w-[200px]">
          <h4 class="font-black text-sm text-white">${cidade.nome}</h4>
          <p class="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Status de Risco Geral:</p>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
            cidade.riscoGeral === 'Crítico' 
              ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
              : cidade.riscoGeral === 'Médio'
                ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                : 'bg-green-500/10 text-green-400 border border-green-500/20'
          }">${cidade.riscoGeral}</span>
          <div class="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-white/5 text-[10px] text-zinc-400">
            <div>Jovens: <strong class="text-white">${cidade.alunosTotal}</strong></div>
            <div>Equipamentos: <strong class="text-white">${cidade.equipamentosQtd}</strong></div>
          </div>
        </div>
      `);

      marker.on('click', () => {
        focarNaCidade(cidade);
      });

      markersLayerRef.current.addLayer(marker);
    });
  }, []);

  const selecionarBairro = useCallback((bairro: BairroMapa) => {
    const L = (window as any).L;
    const map = leafletMapRef.current;
    if (!L || !map) return;

    setSelectedBairro(bairro);

    map.flyTo([bairro.lat, bairro.lng], 15, {
      animate: true,
      duration: 1.5
    });

    if (bairroBoundaryLayerRef.current) {
      bairroBoundaryLayerRef.current.clearLayers();
    }
  }, []);

  const focarNaCidade = useCallback((cidade: CidadeMapa) => {
    const L = (window as any).L;
    const map = leafletMapRef.current;
    if (!L || !map) return;

    setSelectedCidade(cidade);
    setSelectedBairro(null);
    if (bairroBoundaryLayerRef.current) {
      bairroBoundaryLayerRef.current.clearLayers();
    }

    map.flyTo([cidade.lat, cidade.lng], 13, {
      animate: true,
      duration: 2.0
    });

    markersLayerRef.current.clearLayers();
    heatmapLayerRef.current.clearLayers();



    cidade.bairros.forEach((bairro) => {
      // Filtragem por Bairro
      const cleanB = (bairro.cep || '').replace('Bairro: ', '');
      if (selectedBairroFilter !== 'todos' && cleanB !== selectedBairroFilter) {
        return;
      }

      // Filtragem dos pontos no mapa
      if (mapFilter !== 'todos') {
        if (mapFilter === 'critico' && (bairro.tipo !== 'Jovem' || bairro.risco !== 'Crítico')) return;
        if (mapFilter === 'medio' && (bairro.tipo !== 'Jovem' || bairro.risco !== 'Médio')) return;
        if (mapFilter === 'baixo' && (bairro.tipo !== 'Jovem' || bairro.risco !== 'Baixo')) return;
        if (mapFilter === 'formadoras' && bairro.tipo !== 'Formadora') return;
        if (mapFilter === 'unidades' && bairro.tipo !== 'Acolhimento') return;
        if (mapFilter === 'empresas' && bairro.tipo !== 'Empresa') return;
      }

      let corCirculo = '#10B981';
      let glowCor = 'bg-green-500';
      let emojiIcon = '👤';

      if (bairro.tipo === 'Jovem') {
        emojiIcon = '👤';
        if (bairro.risco === 'Crítico') {
          corCirculo = '#EF4444';
          glowCor = 'bg-red-500';
        } else if (bairro.risco === 'Médio') {
          corCirculo = '#F59E0B';
          glowCor = 'bg-orange-500';
        }
      } else if (bairro.tipo === 'Empresa') {
        corCirculo = '#3B82F6';
        glowCor = 'bg-blue-500';
        emojiIcon = '💼';
      } else if (bairro.tipo === 'Acolhimento') {
        corCirculo = '#F59E0B';
        glowCor = 'bg-amber-500';
        emojiIcon = '🏠';
      } else if (bairro.tipo === 'Formadora') {
        corCirculo = '#8B5CF6';
        glowCor = 'bg-purple-500';
        emojiIcon = '🎓';
      }

      const coords = getNeighborhoodCoords(cidade.nome, bairro.cep, bairro.lat, bairro.lng);

      // Centroid calculation for army badge position
      let sumLat = 0;
      let sumLng = 0;
      coords.forEach(([lat, lng]) => {
        sumLat += lat;
        sumLng += lng;
      });
      const centerLat = sumLat / coords.length;
      const centerLng = sumLng / coords.length;

      const customIcon = L.divIcon({
        className: 'bg-transparent border-0',
        html: `
          <div class="relative flex items-center justify-center animate-fadeIn select-none">
            <span class="absolute inline-flex h-8 w-8 rounded-full ${glowCor} opacity-25 animate-ping"></span>
            <span class="relative inline-flex rounded-full h-8 w-8 ${glowCor} border-2 border-white shadow-xl shadow-black/40 items-center justify-center text-xs font-black text-white shrink-0 filter drop-shadow">
              ${emojiIcon}
            </span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([centerLat, centerLng], { icon: customIcon });

      const tooltipContent = `
        <div class="bg-zinc-950 text-white p-3 rounded-xl border border-white/10 font-sans text-[11px] shadow-2xl min-w-[200px]">
          <div class="flex items-center gap-1.5 mb-1.5">
            <span class="text-xs">${emojiIcon}</span>
            <strong class="text-orange-400 text-xs">${bairro.nome}</strong>
          </div>
          <span class="text-[9px] text-zinc-500 uppercase tracking-widest font-extrabold block mb-1.5">Dados do Agente:</span>
          <div class="space-y-1">
            ${bairro.alunosList.map(a => `
              <div class="flex items-center gap-1.5 py-0.5 border-b border-white/[0.02] last:border-b-0 pb-0.5 last:pb-0">
                <div class="w-1.5 h-1.5 rounded-full ${glowCor} shrink-0"></div>
                <span class="text-zinc-200">${a}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;



      marker.bindTooltip(tooltipContent, {
        sticky: true,
        className: 'leaflet-tooltip-dark',
        direction: 'top',
        opacity: 0.95
      });

      const alunosHTML = bairro.alunosList.map(a => `
        <div class="flex items-center gap-1.5 py-0.5 text-zinc-300">
          <div class="w-1.5 h-1.5 rounded-full ${glowCor}"></div>
          <span>${a}</span>
        </div>
      `).join('');

      const badgeRiscoHTML = bairro.tipo === 'Jovem' ? `
        <span class="text-[8px] font-bold px-1.5 py-0.5 rounded-md ${
          bairro.risco === 'Crítico' 
            ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
            : bairro.risco === 'Médio'
              ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
              : 'bg-green-500/10 text-green-400 border border-green-500/20'
        }">Risco ${bairro.risco}</span>
      ` : `
        <span class="text-[8px] font-bold px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">${bairro.tipo}</span>
      `;

      marker.bindPopup(`
        <div class="bg-zinc-950 text-white p-3 rounded-xl border border-white/5 font-sans min-w-[220px]">
          <div class="flex justify-between items-start gap-2">
            <div>
              <h4 class="font-extrabold text-sm text-white">${bairro.nome}</h4>
              <p class="text-[9px] text-zinc-500">${bairro.cep}</p>
            </div>
            ${badgeRiscoHTML}
          </div>
          
          <div class="mt-3 pt-2.5 border-t border-white/5">
            <p class="text-[9px] text-zinc-400 uppercase tracking-widest font-bold mb-1.5">Ficha de Informações:</p>
            <div class="space-y-1 max-h-[100px] overflow-y-auto pr-1 text-[10px]">
              ${alunosHTML}
            </div>
          </div>
        </div>
      `);

      marker.on('click', () => {
        selecionarBairro(bairro);
      });


      heatmapLayerRef.current.addLayer(marker);
    });
  }, [selecionarBairro, mapFilter, selectedBairroFilter]);

  const resetarFocoMapa = useCallback(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    setSelectedCidade(null);
    setSelectedBairro(null);
    setMapFilter('todos');
    setSelectedBairroFilter('todos');
    if (bairroBoundaryLayerRef.current) {
      bairroBoundaryLayerRef.current.clearLayers();
    }
    map.setView([-18.5, -44.5], 6);
    desenharMarcadoresCidades();
  }, [desenharMarcadoresCidades]);

  const renderizarMapa = useCallback(() => {
    const L = (window as any).L;
    if (!L || !mapContainerRef.current) return;

    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
    }

    const map = L.map(mapContainerRef.current, {
      zoomControl: false
    }).setView([-18.5, -44.5], 6);

    leafletMapRef.current = map;

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: 'Tiles &copy; Esri'
    }).addTo(map);



    markersLayerRef.current = L.layerGroup().addTo(map);
    heatmapLayerRef.current = L.layerGroup().addTo(map);
    bairroBoundaryLayerRef.current = L.layerGroup().addTo(map);

    desenharMarcadoresCidades();
  }, [desenharMarcadoresCidades]);

  useEffect(() => {
    if (mapLoaded) {
      renderizarMapa();
    }
  }, [mapLoaded, renderizarMapa]);

  useEffect(() => {
    if (selectedCidade) {
      focarNaCidade(selectedCidade);
    }
  }, [mapFilter, selectedBairroFilter, selectedCidade, focarNaCidade]);

  useEffect(() => {
    syncLogs();
    const d = db.getDiagnostics();
    const enc = d.counters.concluidos + d.counters.contratados + d.counters.emCurso;
    setDiag({
      total:       d.counters.total,
      encaminhados: enc,
      contratados: d.counters.contratados,
      alertas:     d.counters.alertas,
      taxaEnc:     d.counters.total > 0 ? Math.round((enc / d.counters.total) * 100) : 0,
      taxaCont:    d.counters.taxaEmpregabilidade,
    });
  }, []);

  const syncLogs = () => setAuditLogs(db.getAuditLogs());

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  /* ─── Export / Import ─── */
  const handleExportCSV = () => {
    const csv  = db.exportCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `descubra_hub_${new Date().getFullYear()}.csv`);
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast('Planilha Excel (CSV) gerada com sucesso!');
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(db.exportJSON());
    const a       = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', `descubra_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast('Backup JSON baixado com sucesso!');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const reader = new FileReader();
    reader.onload = event => {
      const str     = event.target?.result as string;
      const success = db.importJSON(str);
      if (success) { syncLogs(); showToast('Backup restaurado no localStorage!'); }
      else           showToast('Erro: Formato JSON inválido.');
    };
    reader.readAsText(files[0]);
  };

  const handleResetDB = () => {
    if (confirm('Resetar o banco de dados para os valores padrão de Pirapora? Todas as alterações serão perdidas.')) {
      db.reset();
      syncLogs();
      showToast('Banco de dados restaurado para as configurações originais!');
    }
  };

  /* ─── Weight helper ─── */
  const adjustWeight = (key: keyof typeof scoreWeights, delta: number) => {
    setScoreWeights(prev => ({
      ...prev,
      [key]: Math.max(0, Math.min(5, prev[key] + delta)),
    }));
    showToast('Peso do critério atualizado!');
  };

  return (
    <div className="flex flex-col gap-6 relative">

      {/* ─── TOAST ─── */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 shadow-2xl px-5 py-3.5 rounded-2xl text-xs font-black flex items-center gap-2 bg-emerald-500 text-white animate-fadeIn">
          <CheckCircle2 className="h-4 w-4" />
          {toastMessage}
        </div>
      )}

      {/* ─── PAGE HEADER ─── */}
      <PageHeader 
        title={<span>Painel Estratégico — <span className="text-indigo-500">Visão do Estado</span></span>}
        description="Norte de Minas Gerais · Heatmap de Vulnerabilidade Social"
      />

      {/* ─── METRIC CARDS (4 cols) ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Metric title="Total Jovens" value={diag.total} icon={Users} iconColor="text-indigo-500" delay={0} />
        <Metric title="% Encaminhados" value={`${diag.taxaEnc}%`} icon={TrendingUp} iconColor="text-emerald-500" trend="+2%" trendUp delay={100} />
        <Metric title="% Contratados" value={`${diag.taxaCont}%`} icon={Briefcase} iconColor="text-purple-500" delay={200} />
        <Metric title="Alertas Ativos" value={diag.alertas} icon={Bell} iconColor="text-rose-500" trend="-1" trendUp delay={300} />
      </div>

      {/* ─── TOP 5 VULNERABILIDADE ─── */}
      <Card className="!p-6 flex flex-col gap-4 border border-slate-200 shadow-sm">
        <div>
          <h3 className="text-sm font-black text-slate-800">Top 5 · Vulnerabilidade</h3>
          <p className="text-[10px] mt-0.5 text-slate-500">Municípios com maior índice de prioridade e vulnerabilidade social no Norte de Minas</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mt-2">
          {TOP5.map((m, i) => (
            <div
              key={m.id}
              className="flex flex-col gap-3 p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-black h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
                    i === 0 ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {i + 1}
                </span>
                <span className="text-[10px] font-black text-slate-500 bg-white border border-slate-100 px-2 py-0.5 rounded-lg shadow-xs">
                  {m.jovens > 0 ? `${m.jovens} 👤` : '—'}
                </span>
              </div>
              <div className="mt-1">
                <p className="text-xs font-bold text-slate-800 truncate">{m.nome}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span
                    className="h-2 w-2 rounded-full inline-block shadow-sm"
                    style={{ background: m.cor }}
                  />
                  <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: m.cor }}>
                    {NIVEL_LABEL[m.nivel]}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ─── MAPA INTELIGENTE E GEORREFERENCIAMENTO ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* LADO ESQUERDO: LISTAGEM DE CIDADES */}
        <Card className="xl:col-span-1 flex flex-col gap-4 border border-slate-200 shadow-sm bg-white p-5 max-h-[550px] overflow-y-auto">
          <div className="border-b border-slate-100 pb-3">
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Monitoramento MVP
            </span>
            <h4 className="text-sm font-black text-slate-800">Cidades Cadastradas</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">Mapeamento e acompanhamento territorial do programa Descubra</p>
          </div>

          <div className="flex flex-col gap-3">
            {CIDADES_SEEDS.map((cidade) => {
              const isSelected = selectedCidade?.id === cidade.id;
              let badgeCor = '';
              if (cidade.riscoGeral === 'Crítico') badgeCor = 'bg-rose-50 text-rose-600 border border-rose-100';
              else if (cidade.riscoGeral === 'Médio') badgeCor = 'bg-amber-50 text-amber-600 border border-amber-100';
              else badgeCor = 'bg-emerald-50 text-emerald-600 border border-emerald-100';

              return (
                <div
                  key={cidade.id}
                  onClick={() => focarNaCidade(cidade)}
                  className={`group rounded-2xl p-4 cursor-pointer border transition-all ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/10 shadow-sm'
                      : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h5 className="text-xs font-black text-slate-800 group-hover:text-indigo-600 transition-colors">
                        {cidade.nome}
                      </h5>
                      <span className="text-[10px] text-slate-500 block mt-1">
                        {cidade.alunosTotal} {cidade.alunosTotal === 1 ? 'jovem assistido' : 'jovens assistidos'}
                      </span>
                    </div>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full shrink-0 ${badgeCor}`}>
                      {cidade.riscoGeral}
                    </span>
                  </div>

                  {isSelected && (
                    <div className="mt-4 pt-3.5 border-t border-slate-100/80 space-y-2.5 animate-fadeIn text-[11px]">
                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest block mb-1">
                        Bairros & Agentes:
                      </span>
                      {cidade.bairros.map((b) => {
                        let dotCor = 'bg-emerald-500';
                        if (b.risco === 'Crítico') dotCor = 'bg-rose-500';
                        else if (b.risco === 'Médio') dotCor = 'bg-amber-500';

                        const isBairroSelected = selectedBairro?.nome === b.nome;

                        return (
                          <div
                            key={b.nome}
                            className={`flex items-center justify-between bg-white border rounded-xl p-2 hover:border-indigo-200 hover:shadow-xs transition-all cursor-pointer ${
                              isBairroSelected ? 'border-indigo-500 ring-2 ring-indigo-500/10 bg-indigo-50/5' : 'border-slate-100'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              selecionarBairro(b);
                            }}
                          >
                            <span className="flex items-center gap-2 truncate text-slate-600 font-bold text-[10px]">
                              <div className={`w-2 h-2 rounded-full ${dotCor} shrink-0 animate-pulse`}></div>
                              {b.nome}
                            </span>
                            <span className="text-[9px] text-slate-400 font-black shrink-0">
                              {b.alunosCount > 0 ? `${b.alunosCount} jovens` : b.cep}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {selectedCidade && (
            <div className="pt-2 mt-auto">
              <button
                onClick={resetarFocoMapa}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold text-[11px] transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Voltar ao Estado de MG
              </button>
            </div>
          )}
        </Card>

        {/* LADO DIREITO: MAPA LEAFLET */}
        <Card className="xl:col-span-3 !p-0 overflow-hidden relative flex flex-col h-[550px] border border-slate-200 shadow-sm bg-[#0a0f19]">
          {/* Map Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-white relative z-20 shadow-xs">
            <div>
              <p className="text-xs font-black text-slate-800 flex items-center gap-2">
                <Star className="h-4 w-4 text-indigo-500" fill="currentColor" />
                Mapa Inteligente — Visão Espacial MVP
              </p>
              <p className="text-[10px] mt-0.5 text-slate-500">
                Visualização georreferenciada de infraestrutura e índice de risco
              </p>
            </div>
            {selectedCidade && (
              <button
                onClick={resetarFocoMapa}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] px-3 py-1.5 rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Minas Gerais
              </button>
            )}
          </div>

          {/* Leaflet container */}
          <div className="flex-1 w-full h-full relative">
            <div
              ref={mapContainerRef}
              className="absolute inset-0 z-10 w-full h-full"
            />

            {mapLoaded && selectedCidade && (
              <div className="absolute top-4 left-4 z-20 bg-white/95 border border-slate-200 backdrop-blur-md px-3.5 py-2.5 rounded-2xl flex flex-wrap items-center gap-2 shadow-lg max-w-[95%] pointer-events-auto">
                <div className="flex items-center gap-1.5 border-r border-slate-200 pr-2 mr-1">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest select-none">Bairro:</span>
                  <select
                    value={selectedBairroFilter}
                    onChange={(e) => setSelectedBairroFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-xl text-slate-700 cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-sans"
                  >
                    <option value="todos">Todos</option>
                    {Array.from(new Set(selectedCidade.bairros.map(b => (b.cep || '').replace('Bairro: ', ''))))
                      .filter(Boolean)
                      .map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                  </select>
                </div>

                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-1 flex items-center gap-1.5 select-none">
                  Filtrar:
                </span>
                <button
                  onClick={() => setMapFilter('todos')}
                  className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    mapFilter === 'todos'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setMapFilter('critico')}
                  className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    mapFilter === 'critico'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-rose-50 text-rose-600 hover:bg-rose-100/50'
                  }`}
                >
                  Crítico
                </button>
                <button
                  onClick={() => setMapFilter('medio')}
                  className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    mapFilter === 'medio'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-amber-50 text-amber-600 hover:bg-amber-100/50'
                  }`}
                >
                  Médio
                </button>
                <button
                  onClick={() => setMapFilter('baixo')}
                  className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    mapFilter === 'baixo'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100/50'
                  }`}
                >
                  Baixo
                </button>
                <button
                  onClick={() => setMapFilter('formadoras')}
                  className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    mapFilter === 'formadoras'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-purple-50 text-purple-600 hover:bg-purple-100/50'
                  }`}
                >
                  Formadoras
                </button>
                <button
                  onClick={() => setMapFilter('unidades')}
                  className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    mapFilter === 'unidades'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-amber-50 text-amber-600 hover:bg-amber-100/50'
                  }`}
                >
                  Unidades Ref.
                </button>
                <button
                  onClick={() => setMapFilter('empresas')}
                  className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    mapFilter === 'empresas'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100/50'
                  }`}
                >
                  Empresas
                </button>
              </div>
            )}

            {!mapLoaded && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                <p className="text-slate-400 text-xs font-black">Carregando componentes geográficos...</p>
              </div>
            )}

            {mapLoaded && !selectedCidade && (
              <div className="absolute bottom-5 right-5 z-20 bg-white/95 border border-slate-200 backdrop-blur-md px-4 py-2.5 rounded-2xl flex items-center gap-2 pointer-events-none shadow-lg">
                <ZoomIn className="w-4 h-4 text-indigo-500" />
                <span className="text-[10px] text-slate-700 font-black">
                  Selecione um município ou marcador para aproximar bairros
                </span>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* ─── COMPANY RANKING ─── */}
      <Card key={rankingKey} dark className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-400" />
            Ranking de Empresas Parceiras
          </h3>
          <span className="text-[10px] text-slate-500 font-bold">Admin controla os selos</span>
        </div>
        <div className="flex flex-col gap-2">
          {db.getEmpresas().sort((a, b) => (b.pontos_engajamento || 0) - (a.pontos_engajamento || 0)).map((emp, idx) => {
            const medals = ['🥇', '🥈', '🥉'];
            const medal = idx < 3 ? medals[idx] : `#${idx + 1}`;
            return (
              <div key={emp.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#1e293b' }}>
                <span className="text-lg w-8 shrink-0">{medal}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-black text-xs truncate">{emp.razao_social}</p>
                  <p className="text-slate-400 text-[10px] font-bold">{emp.pontos_engajamento || 0} pts</p>
                </div>
                <select
                  value={emp.selo || 'Bronze'}
                  onChange={(e) => {
                    db.updateCompanySeal(emp.id, e.target.value as 'Bronze' | 'Prata' | 'Ouro');
                    setRankingKey(k => k + 1);
                  }}
                  className="bg-slate-700 border border-slate-600 text-white text-[10px] font-black rounded-lg px-2 py-1 shrink-0 focus:outline-none"
                >
                  <option value="Bronze">🥉 Bronze</option>
                  <option value="Prata">🥈 Prata</option>
                  <option value="Ouro">🥇 Ouro</option>
                </select>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ─── BOTTOM PANELS ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* WEIGHT ADJUSTMENTS */}
        <Card dark className="flex flex-col gap-4">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Sliders className="h-4 w-4 text-indigo-400" />
            Pesos de Vulnerabilidade (Score)
          </h3>
          <p className="text-xs leading-relaxed" style={{ color: '#64748b' }}>
            Ajuste o peso de cada critério social para reordenar a fila de prioridade.
          </p>

          <div className="flex flex-col gap-3 max-h-52 overflow-y-auto pr-1">
            {[
              { label: 'Medida Socioeducativa',    key: 'medida_socioeducativa'  as const },
              { label: 'Abandono Escolar',          key: 'abandono_escola'        as const },
              { label: 'Dificuldade de Transporte', key: 'dificuldade_transporte' as const },
              { label: 'Bolsa Família',             key: 'bolsa_familia'          as const },
              { label: 'Inscrição no CadÚnico',    key: 'cad_unico'              as const },
              { label: 'Sem Internet',              key: 'sem_internet'           as const },
            ].map(w => (
              <div
                key={w.key}
                className="flex items-center justify-between text-xs font-bold"
                style={{ color: '#94a3b8' }}
              >
                <span>{w.label}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => adjustWeight(w.key, -1)}
                    className="h-6 w-6 rounded-lg font-black text-base flex items-center justify-center transition-colors"
                    style={{ background: '#1e293b', color: '#94a3b8' }}
                  >
                    −
                  </button>
                  <span className="text-white font-black w-4 text-center">
                    {scoreWeights[w.key]}
                  </span>
                  <button
                    onClick={() => adjustWeight(w.key, +1)}
                    className="h-6 w-6 rounded-lg font-black text-base flex items-center justify-center transition-colors"
                    style={{ background: '#1e293b', color: '#94a3b8' }}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* GRÁFICO DE VULNERABILIDADE */}
        <Card className="flex flex-col gap-4 bg-white border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-rose-500" />
            <h3 className="text-sm font-black text-slate-800">Zonas de Vulnerabilidade</h3>
          </div>
          <p className="text-xs font-semibold text-slate-500 mb-2">
            Top bairros com maior concentração de jovens prioritários.
          </p>
          
          <div className="flex flex-col gap-3">
            {/* Bar 1 */}
            <div>
              <div className="flex justify-between items-end mb-1">
                <span className="text-xs font-bold text-slate-800">Santos Reis</span>
                <span className="text-[10px] font-black text-rose-600">142 jovens</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div className="bg-gradient-to-r from-rose-400 to-rose-600 h-1.5 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>

            {/* Bar 2 */}
            <div>
              <div className="flex justify-between items-end mb-1">
                <span className="text-xs font-bold text-slate-800">Major Prates</span>
                <span className="text-[10px] font-black text-rose-500">98 jovens</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div className="bg-gradient-to-r from-rose-300 to-rose-500 h-1.5 rounded-full" style={{ width: '69%' }}></div>
              </div>
            </div>

            {/* Bar 3 */}
            <div>
              <div className="flex justify-between items-end mb-1">
                <span className="text-xs font-bold text-slate-800">Vila Exposição</span>
                <span className="text-[10px] font-black text-amber-500">75 jovens</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div className="bg-gradient-to-r from-amber-300 to-amber-500 h-1.5 rounded-full" style={{ width: '52%' }}></div>
              </div>
            </div>

            {/* Bar 4 */}
            <div>
              <div className="flex justify-between items-end mb-1">
                <span className="text-xs font-bold text-slate-800">Vera Cruz</span>
                <span className="text-[10px] font-black text-amber-500">54 jovens</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div className="bg-gradient-to-r from-amber-200 to-amber-400 h-1.5 rounded-full" style={{ width: '38%' }}></div>
              </div>
            </div>
            
            {/* Bar 5 */}
            <div>
              <div className="flex justify-between items-end mb-1">
                <span className="text-xs font-bold text-slate-800">Delfino Magalhães</span>
                <span className="text-[10px] font-black text-amber-400">31 jovens</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div className="bg-gradient-to-r from-amber-200 to-amber-300 h-1.5 rounded-full" style={{ width: '21%' }}></div>
              </div>
            </div>
          </div>
        </Card>
      </div>



    </div>
  );
}
