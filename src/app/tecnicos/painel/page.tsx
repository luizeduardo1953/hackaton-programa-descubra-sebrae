"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Users, Briefcase, GraduationCap, Building, AlertTriangle, 
  Clock, X, ChevronRight, Star, Sparkles, ArrowLeft, ZoomIn, Loader2
} from 'lucide-react';
import { db } from '../../../lib/db';
import type { Youth } from '../../../lib/db';

import { PageHeader } from '../../../components/ui/PageHeader';
import { Metric } from '../../../components/ui/Metric';
import { Card } from '../../../components/ui/Card';

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

export default function TecnicosPainelPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

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

  // Hardcoded mock data strictly matching the screenshots and layouts
  const metrics = {
    totalJovens: 6,
    jovensAtivos: 5,
    empresas: 4,
    cursos: 4,
    empregabilidade: '17%',
    alertasAtivos: 4
  };

  const priorityQueue = [
    { rank: '#1', initial: 'A', name: 'Ana Beatriz Ferreira', score: 86, badge: 'crítica', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    { rank: '#2', initial: 'M', name: 'Maria Aparecida Souza', score: 78, badge: 'crítica', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    { rank: '#3', initial: 'J', name: 'Juliana Rocha Lima', score: 67, badge: 'alta', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { rank: '#4', initial: 'L', name: 'Lucas Silva Santos', score: 45, badge: 'média', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { rank: '#5', initial: 'P', name: 'Pedro Henrique', score: 13, badge: 'baixa', color: 'bg-slate-100 text-slate-600 border-slate-200' },
    { rank: '#6', initial: 'G', name: 'Gabriel Souza', score: 12, badge: 'baixa', color: 'bg-slate-100 text-slate-600 border-slate-200' }
  ];

  const recentAlerts = [
    { title: '3 faltas consecutivas', subtitle: 'Lucas Silva Santos', badge: 'alta', color: 'bg-amber-50 text-amber-700 border-amber-200', type: 'warning' },
    { title: 'Risco de evasão escolar', subtitle: 'Juliana Rocha Lima', badge: 'crítica', color: 'bg-rose-50 text-rose-700 border-rose-200', type: 'critical' },
    { title: 'Documentação pendente', subtitle: 'Ana Beatriz Ferreira', badge: 'média', color: 'bg-blue-50 text-blue-700 border-blue-200', type: 'doc' },
    { title: 'Baixa adesão na oficina', subtitle: 'Geral', badge: 'baixa', color: 'bg-slate-100 text-slate-600 border-slate-200', type: 'low' }
  ];

  return (
    <div className="flex flex-col gap-6 animate-fadeIn relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-600 shadow-xl text-white font-bold px-6 py-3.5 rounded-2xl text-xs flex items-center gap-2 animate-fadeIn">
          <span>{toastMessage}</span>
        </div>
      )}

      <PageHeader 
        title="Painel Descubra"
        description="Visão geral do programa de inclusão produtiva"
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Metric title="Total de Jovens" value={metrics.totalJovens} icon={Users} iconColor="text-indigo-600" trend="+12% mês" trendUp delay={0} />
        <Metric title="Jovens Ativos" value={metrics.jovensAtivos} icon={Users} iconColor="text-emerald-600" delay={50} />
        <Metric title="Empresas" value={metrics.empresas} icon={Building} iconColor="text-blue-600" delay={100} />
        <Metric title="Cursos" value={metrics.cursos} icon={GraduationCap} iconColor="text-purple-600" delay={150} />
        <Metric title="Empregabilidade" value={metrics.empregabilidade} icon={Briefcase} iconColor="text-emerald-600" trend="+5%" trendUp delay={200} />
        <Metric title="Alertas Ativos" value={metrics.alertasAtivos} icon={AlertTriangle} iconColor="text-rose-600" trend="Risco" delay={250} />
      </div>

      {/* 2. DUAL ROW COLUMNS (MATCHING SCREENSHOT 1!) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* COLUMN 1: STATUS DOS JOVENS (DONUT CHART) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-6">
          <h3 className="text-base font-black text-slate-900">Status dos Jovens</h3>
          
          {/* High Fidelity SVG Donut Chart Portion */}
          <div className="relative h-44 w-full flex items-center justify-center">
            <svg className="h-40 w-40 transform -rotate-95" viewBox="0 0 100 100">
              {/* Outer ring */}
              <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="12" />
              
              {/* Ativo (3/6 - 50%) -> Green */}
              <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="12" 
                strokeDasharray="251.2" strokeDashoffset="125.6" strokeLinecap="round" />
              
              {/* Encaminhado (1/6 - 16.6%) -> Light Purple */}
              <circle cx="50" cy="50" r="40" fill="none" stroke="#a78bfa" strokeWidth="12" 
                strokeDasharray="251.2" strokeDashoffset="209.3" strokeLinecap="round" 
                className="origin-center transform rotate-180" />
              
              {/* Empregado (1/6 - 16.6%) -> Dark Green */}
              <circle cx="50" cy="50" r="40" fill="none" stroke="#047857" strokeWidth="12" 
                strokeDasharray="251.2" strokeDashoffset="209.3" strokeLinecap="round" 
                className="origin-center transform rotate-240" />

              {/* Em Análise (1/6 - 16.6%) -> Blue */}
              <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="12" 
                strokeDasharray="251.2" strokeDashoffset="209.3" strokeLinecap="round" 
                className="origin-center transform rotate-300" />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-slate-900">6</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase leading-none">Jovens</span>
            </div>
          </div>

          {/* Color Legend Indicators */}
          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 border-t border-slate-100 pt-4 text-[10px] font-bold text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#10b981] shrink-0" />
              Ativo (3)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#a78bfa] shrink-0" />
              Encaminhado (1)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#047857] shrink-0" />
              Empregado (1)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#3b82f6] shrink-0" />
              Em Análise (1)
            </span>
          </div>
        </div>

        {/* COLUMN 2: FILA DE PRIORIDADE */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4">
          <h3 className="text-base font-black text-slate-900">Fila de Prioridade</h3>
          
          <div className="flex flex-col gap-3">
            {priorityQueue.map(item => (
              <div key={item.rank} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-slate-400 w-5">{item.rank}</span>
                  {/* Initials circle */}
                  <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-extrabold text-xs shrink-0 select-none">
                    {item.initial}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 leading-tight">{item.name}</h4>
                    <p className="text-[9px] text-slate-400 font-bold leading-none mt-1">Score: {item.score}</p>
                  </div>
                </div>

                <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border ${item.color}`}>
                  {item.badge}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMN 3: ALERTAS RECENTES */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4">
          <h3 className="text-base font-black text-slate-900">Alertas Recentes</h3>
          
          <div className="flex flex-col gap-3">
            {recentAlerts.map((item, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex items-start justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-2.5">
                  <div className={`p-1.5 rounded-xl shrink-0 mt-0.5 ${
                    item.type === 'critical' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                    item.type === 'warning' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                    item.type === 'doc' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                    'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    {item.type === 'critical' || item.type === 'warning' ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 leading-tight">{item.title}</h4>
                    <p className="text-[9px] text-slate-400 font-bold leading-none mt-1">{item.subtitle}</p>
                  </div>
                </div>

                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full border shrink-0 ${item.color}`}>
                  {item.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. ZONAS DE VULNERABILIDADE ─── */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle className="h-5 w-5 text-rose-500 animate-pulse" />
          <h3 className="text-base font-black text-slate-900">Zonas de Vulnerabilidade</h3>
        </div>
        <p className="text-xs font-semibold text-slate-500 mb-2">
          Top bairros com maior concentração de jovens em risco de evasão escolar ou extrema vulnerabilidade social.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-2">
          {[
            { bairro: 'Santos Reis', count: 142, pct: '100%', color: 'from-rose-400 to-rose-600', textColor: 'text-rose-600' },
            { bairro: 'Major Prates', count: 98, pct: '69%', color: 'from-rose-300 to-rose-500', textColor: 'text-rose-500' },
            { bairro: 'Vila Exposição', count: 75, pct: '52%', color: 'from-amber-300 to-amber-500', textColor: 'text-amber-500' },
            { bairro: 'Vera Cruz', count: 54, pct: '38%', color: 'from-amber-200 to-amber-400', textColor: 'text-amber-500' },
            { bairro: 'Delfino Magalhães', count: 31, pct: '21%', color: 'from-amber-200 to-amber-300', textColor: 'text-amber-400' },
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-2 hover:bg-slate-50 transition-all hover:shadow-md">
              <div className="flex justify-between items-start">
                <span className="text-xs font-black text-slate-800 truncate max-w-[120px]">{item.bairro}</span>
                <span className={`text-[10px] font-black ${item.textColor}`}>{item.count} jovens</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                <div className={`bg-gradient-to-r ${item.color} h-1.5 rounded-full`} style={{ width: item.pct }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── MAPA OPERACIONAL E GEORREFERENCIAMENTO ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* LADO ESQUERDO: LISTAGEM DE CIDADES */}
        <Card className="xl:col-span-1 flex flex-col gap-4 border border-slate-100 shadow-sm bg-white p-5 max-h-[550px] overflow-y-auto">
          <div className="border-b border-slate-100 pb-3">
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Monitoramento Técnico
            </span>
            <h4 className="text-sm font-black text-slate-800">Cidades Ativas</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">Clique em um município para focar nos bairros e agentes</p>
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
                      ? 'border-emerald-500 bg-emerald-50/10 shadow-sm'
                      : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h5 className="text-xs font-black text-slate-800 group-hover:text-emerald-600 transition-colors">
                        {cidade.nome}
                      </h5>
                      <span className="text-[10px] text-slate-500 block mt-1">
                        {cidade.alunosTotal} {cidade.alunosTotal === 1 ? 'jovem' : 'jovens'} assistidos
                      </span>
                    </div>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full shrink-0 ${badgeCor}`}>
                      {cidade.riscoGeral}
                    </span>
                  </div>

                  {isSelected && (
                    <div className="mt-4 pt-3.5 border-t border-slate-100/80 space-y-2.5 animate-fadeIn text-[11px]">
                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest block mb-1">
                        Agentes & Bairros:
                      </span>
                      {cidade.bairros.map((b) => {
                        let dotCor = 'bg-emerald-500';
                        if (b.risco === 'Crítico') dotCor = 'bg-rose-500';
                        else if (b.risco === 'Médio') dotCor = 'bg-amber-500';

                        const isBairroSelected = selectedBairro?.nome === b.nome;

                        return (
                          <div
                            key={b.nome}
                            className={`flex items-center justify-between bg-white border rounded-xl p-2 hover:border-emerald-200 hover:shadow-xs transition-all cursor-pointer ${
                              isBairroSelected ? 'border-emerald-500 ring-2 ring-emerald-500/10 bg-emerald-50/5' : 'border-slate-100'
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
        <Card className="xl:col-span-3 !p-0 overflow-hidden relative flex flex-col h-[550px] border border-slate-100 shadow-sm bg-[#0a0f19]">
          {/* Map Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-white relative z-20 shadow-xs">
            <div>
              <p className="text-xs font-black text-slate-800 flex items-center gap-2">
                <Star className="h-4 w-4 text-emerald-500" fill="currentColor" />
                Mapa Operacional — Campo & Monitoramento
              </p>
              <p className="text-[10px] mt-0.5 text-slate-500">
                Visualização georreferenciada de jovens e redes de assistência do programa
              </p>
            </div>
            {selectedCidade && (
              <button
                onClick={resetarFocoMapa}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] px-3 py-1.5 rounded-xl shadow-md transition-all flex items-center gap-1.5"
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
                    className="bg-slate-50 border border-slate-200 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-xl text-slate-700 cursor-pointer outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans"
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
                      ? 'bg-emerald-600 text-white shadow-sm'
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
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                <p className="text-slate-400 text-xs font-black">Carregando componentes geográficos...</p>
              </div>
            )}

            {mapLoaded && !selectedCidade && (
              <div className="absolute bottom-5 right-5 z-20 bg-white/95 border border-slate-200 backdrop-blur-md px-4 py-2.5 rounded-2xl flex items-center gap-2 pointer-events-none shadow-lg">
                <ZoomIn className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] text-slate-700 font-black">
                  Selecione um município ou marcador para aproximar bairros
                </span>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
