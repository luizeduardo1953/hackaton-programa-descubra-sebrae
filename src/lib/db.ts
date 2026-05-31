// DESCUBRA HUB - DATA ACCESS LAYER (db.ts)
// This file serves as a unified database controller. By default, it manages a robust local state in localStorage
// with 3 years of detailed, realistic mock data for Pirapora/MG (CREAS, CRAS, CECEP, etc.).
// It allows full, offline interactivity, and can be connected directly to Supabase client routes.

import { supabase, isLiveMode } from './supabase';

export function getDeterministicUUID(id: string): string {
  if (!id) return '';
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) return id;
  
  let prefix = '00';
  if (id.startsWith('u')) prefix = '11';
  else if (id.startsWith('t')) prefix = '22';
  else if (id.startsWith('e')) prefix = '33';
  else if (id.startsWith('y')) prefix = '44';
  else if (id.startsWith('v')) prefix = '55';
  else if (id.startsWith('l')) prefix = '66';
  else if (id.startsWith('r')) prefix = '77';
  else if (id.startsWith('dep')) prefix = '88';
  else if (id.startsWith('ca')) prefix = '99';
  else if (id.startsWith('ref')) prefix = 'aa';
  
  let hashNum = 0;
  for (let i = 0; i < id.length; i++) {
    hashNum = (hashNum << 5) - hashNum + id.charCodeAt(i);
    hashNum |= 0;
  }
  const absHash = Math.abs(hashNum).toString(16).padStart(12, '0');
  return `${prefix}000000-0000-4000-a000-${absHash.substring(0, 12)}`;
}

export interface ReferenceUnit {
  id: string;
  nome: string;
  tipo: 'CRAS' | 'CREAS' | 'CECEP' | 'Casa de Acolhimento' | 'Parceira';
  endereco: string;
  bairro: string;
  cidade: string;
  cep: string;
  telefone: string;
  email: string;
  responsavel_nome: string;
}

export interface TechnicalProfile {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  role: 'admin' | 'tecnico' | 'empresa' | 'jovem';
  unidade_id?: string;
  cidade: string;
  telefone: string;
}

export interface YouthVulnerabilities {
  jovem_id: string;
  bolsa_familia: boolean;
  cad_unico: boolean;
  medida_socioeducativa: boolean;
  deficiencia: boolean;
  deficiencia_qual?: string;
  acesso_internet: boolean; // true = has internet, false = no internet
  computador: boolean;       // true = has PC, false = no PC
  trabalhou_antes: boolean;
  abandonou_escola: boolean;
  dificuldade_transporte: boolean;
  acompanhamento_psicologico: boolean;
}

export interface Youth {
  id: string;
  nome_completo: string;
  sexo: 'M' | 'F' | 'Outro';
  cor_raca: 'Branco' | 'Pardo' | 'Preto' | 'Amarelo' | 'Indígena';
  escolaridade: string;
  cpf: string;
  data_nascimento: string;
  cep: string;
  endereco: string;
  bairro: string;
  cidade: string;
  telefone: string;
  whatsapp: string;
  nome_responsavel: string;
  parentesco_responsavel: string;
  telefone_responsavel: string;
  pessoas_residencia: number;
  pessoas_trabalham: number;
  renda_familiar: number;
  status_atual: 'Pendente' | 'Em Curso' | 'Alerta' | 'Evadido' | 'Concluído' | 'Contratado';
  score_vulnerabilidade: number;
  indicado_por_unidade: string; // unit id
  cadastrado_por_tecnico: string; // technical id
  ano_indicacao: number; // e.g. 2024, 2025, 2026
  pontos_gamificacao: number;
  created_at: string;
  area_interesse?: string;
  outra_area_interesse?: string;
}

export interface FollowUpLog {
  id: string;
  jovem_id: string;
  tecnico_name: string;
  tipo_contato: 'Visita Domiciliar' | 'Contato Telefônico' | 'WhatsApp' | 'Reunião Familiar' | 'Acompanhamento Escolar' | 'Feedback do Curso' | 'Outro';
  relato_detalhado: string;
  status_momento: 'Pendente' | 'Em Curso' | 'Alerta' | 'Evadido' | 'Concluído' | 'Contratado';
  motivo_evasao?: 'Problema com Transporte' | 'Conflito de Horário com Escola' | 'Necessidade de Renda Imediata' | 'Falta de Interesse' | 'Mudança de Endereço' | 'Problema de Saúde' | 'Outros';
  created_at: string;
}

export interface Company {
  id: string;
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
  cep: string;
  endereco: string;
  bairro: string;
  cidade: string;
  responsavel_nome: string;
  telefone: string;
  email: string;
  pontos_engajamento: number;
  selo?: 'Ouro' | 'Prata' | 'Bronze' | 'Nenhum';
}

export interface CompanyAction {
  id: string;
  empresa_id: string;
  jovem_id?: string; // Optional if it's a general action
  tipo: 'Visita Técnica' | 'Assistência / Mentoria' | 'Contratação Jovem' | 'Outro';
  pontos: number;
  data: string;
}

export interface Vacancy {
  id: string;
  empresa_id: string;
  cargo: string;
  tipo: 'Estágio' | 'Jovem Aprendiz' | 'CLT';
  quantidade: number;
  horario: string;
  bolsa_auxilio: number;
  idade_minima: number;
  escolaridade_exigida: string;
  competencias_desejadas: string[];
  status_vaga: 'Aberta' | 'Preenchida' | 'Cancelada';
}

export interface Referral {
  id: string;
  jovem_id: string;
  vaga_id: string;
  status: 'Selecionado para Entrevista' | 'Contratado' | 'Recusado pela Empresa' | 'Desistência';
  feedback_empresa?: string;
  data_encaminhamento: string;
}

export interface Reward {
  id: string;
  nome: string;
  descricao: string;
  custo_pontos: number;
  estoque: number;
}

export interface Redemption {
  id: string;
  jovem_id: string;
  recompensa_id: string;
  status_resgate: 'Aguardando Entrega' | 'Entregue' | 'Cancelado';
  data_resgate: string;
}

export interface AuditLog {
  id: string;
  usuario_nome: string;
  acao: string;
  tabela: string;
  detalhes: string;
  created_at: string;
}

export interface Depoimento {
  id: string;
  jovem_id: string;
  titulo: string;
  descricao: string;
  imagens?: string[];
  video_url?: string;
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'ajustes';
  destaque: boolean;
  feedback_tecnico?: string;
  criado_em: string;
}

export const INITIAL_DEPOIMENTOS: Depoimento[] = [
  {
    id: 'dep1',
    jovem_id: 'y2',
    titulo: 'Nova perspectiva e carteira assinada!',
    descricao: 'O Descubra mudou minha perspectiva de futuro. Graças ao curso do SENAI e à indicação do CREAS, consegui minha carteira assinada! O apoio com transporte foi essencial para que eu não desistisse nas primeiras semanas.',
    imagens: ['https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop'],
    status: 'aprovado',
    destaque: true,
    criado_em: '2025-06-10T10:00:00Z'
  },
  {
    id: 'dep2',
    jovem_id: 'y3',
    titulo: 'Superando as barreiras da distância',
    descricao: 'Minha jornada no programa foi cheia de desafios porque moro muito longe. Pensei em desistir pela falta de transporte, mas a equipe técnica do CREAS me ouviu e providenciou as passagens. Agora estou me formando no SENAI e já tenho entrevista marcada!',
    imagens: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop'],
    status: 'pendente',
    destaque: false,
    criado_em: '2026-05-28T14:30:00Z'
  },
  {
    id: 'dep3',
    jovem_id: 'y1',
    titulo: 'Do sonho ao primeiro emprego no SEBRAE',
    descricao: 'Sempre sonhei em trabalhar em um escritório mas não tinha preparação. O curso de informática básica e a indicação me deram a chance de ser contratado. Sou muito grato por tudo!',
    status: 'ajustes',
    destaque: false,
    feedback_tecnico: 'João, sua história é excelente, mas você poderia adicionar um pouco mais de detalhes sobre como foi o suporte da equipe técnica no seu acompanhamento familiar?',
    criado_em: '2026-05-20T09:00:00Z'
  },
  {
    id: 'dep4',
    jovem_id: 'y5',
    titulo: 'Minha primeira formação técnica',
    descricao: 'Estou aprendendo coisas incríveis no curso do CFP. É a primeira vez que tenho acesso a computadores bons para estudar e fazer trabalhos. Agradeço imensamente ao suporte do CRAS que me indicou para o programa.',
    status: 'pendente',
    destaque: false,
    criado_em: '2026-05-30T11:45:00Z'
  }
];

// Standardized list of neighborhoods in Pirapora for dropdown integrity
export const PIRAPORA_BAIRROS = [
  'Cidade Jardim',
  'Bom Jesus',
  'Centro',
  'Santa Terezinha',
  'Santos Dumont',
  'Aparecida',
  'Nova Pirapora',
  'São Geraldo',
  'Santo Antônio',
  'Industrial',
  'Cinco Estrelas',
  'Bandeirantes',
  'Jardim Ward',
  'Cícero Passos',
  'Shekinah'
];

// Initial realistic database representation to bootstrap the local engine immediately
const INITIAL_UNIDADES: ReferenceUnit[] = [
  { id: 'u1', nome: 'CREAS Pirapora', tipo: 'CREAS', endereco: 'Rua Pernambuco, 412', bairro: 'Centro', cidade: 'Pirapora', cep: '39270-000', telefone: '(38) 3740-6101', email: 'creas@pirapora.mg.gov.br', responsavel_nome: 'Lorena Silva' },
  { id: 'u2', nome: 'CRAS Cidade Jardim', tipo: 'CRAS', endereco: 'Av. Brasil, 1024', bairro: 'Cidade Jardim', cidade: 'Pirapora', cep: '39274-120', telefone: '(38) 3740-6102', email: 'cras.jardim@pirapora.mg.gov.br', responsavel_nome: 'Mateus Albuquerque' },
  { id: 'u3', nome: 'CRAS Bom Jesus', tipo: 'CRAS', endereco: 'Rua São Francisco, 90', bairro: 'Bom Jesus', cidade: 'Pirapora', cep: '39272-350', telefone: '(38) 3740-6103', email: 'cras.jesus@pirapora.mg.gov.br', responsavel_nome: 'Carla Dias' },
  { id: 'u4', nome: 'CECEP Pirapora', tipo: 'CECEP', endereco: 'Rua Belo Horizonte, 12', bairro: 'Centro', cidade: 'Pirapora', cep: '39270-000', telefone: '(38) 3740-6104', email: 'cecep@pirapora.mg.gov.br', responsavel_nome: 'José Santos' },
  { id: 'u5', nome: 'Abrigo Infantil Casa Lar', tipo: 'Casa de Acolhimento', endereco: 'Rua das Flores, 88', bairro: 'Santos Dumont', cidade: 'Pirapora', cep: '39276-000', telefone: '(38) 3740-6105', email: 'casalar@pirapora.mg.gov.br', responsavel_nome: 'Tânia Moura' }
];

const INITIAL_TECNICOS: TechnicalProfile[] = [
  { id: 't1', nome: 'Lorena CREAS', cpf: '123.456.789-01', email: 'lorena.creas@gmail.com', role: 'tecnico', unidade_id: 'u1', cidade: 'Pirapora', telefone: '(38) 99911-2233' },
  { id: 't2', nome: 'Mateus CRAS', cpf: '234.567.890-12', email: 'mateus.cras@gmail.com', role: 'tecnico', unidade_id: 'u2', cidade: 'Pirapora', telefone: '(38) 99922-3344' },
  { id: 't3', nome: 'Coordenação Descubra', cpf: '000.000.000-00', email: 'admin@descubra.mg.gov.br', role: 'admin', cidade: 'Pirapora', telefone: '(38) 3740-6000' }
];

const INITIAL_RECOMPENSAS: Reward[] = [
  { id: 'r1', nome: 'Recarga de Internet Celular (15GB)', descricao: 'Crédito de 15GB de internet 4G/5G para qualquer operadora, ideal para estudos.', custo_pontos: 150, estoque: 45 },
  { id: 'r2', nome: 'Passagem de Ônibus Urbana (Kit 10 viagens)', descricao: 'Vale-transporte com 10 créditos para locomoção ao curso/estágio.', custo_pontos: 100, estoque: 30 },
  { id: 'r3', nome: 'Curso Online de Informática Avançada', descricao: 'Acesso completo a uma plataforma de cursos com certificação válida de 60 horas.', custo_pontos: 200, estoque: 20 },
  { id: 'r4', nome: 'Ingresso de Cinema com Pipoca', descricao: 'Parceria com o Cine Pirapora, inclui 1 ingresso e combo de pipoca com refrigerante.', custo_pontos: 80, estoque: 15 }
];

const INITIAL_EMPRESAS: Company[] = [
  { id: 'e1', razao_social: 'Sebrae Unidade Pirapora', nome_fantasia: 'SEBRAE', cnpj: '12.345.678/0001-90', cep: '39270-000', endereco: 'Rua Piauí, 145', bairro: 'Centro', cidade: 'Pirapora', responsavel_nome: 'Julio Cesar', telefone: '(38) 3741-2030', email: 'julio.sebrae@mg.sebrae.com.br', pontos_engajamento: 80, selo: 'Bronze' },
  { id: 'e2', razao_social: 'Supermercados BH Ltda', nome_fantasia: 'Supermercado BH', cnpj: '23.456.789/0002-88', cep: '39272-100', endereco: 'Av. Humberto Mallard, 600', bairro: 'Bom Jesus', cidade: 'Pirapora', responsavel_nome: 'Adriana Torres', telefone: '(38) 3741-9090', email: 'bh.pirapora@supermercadosbh.com.br', pontos_engajamento: 200, selo: 'Prata' },
  { id: 'e3', razao_social: 'Cedro Cachoeira Têxtil', nome_fantasia: 'Indústria Cedro', cnpj: '34.567.890/0003-77', cep: '39278-000', endereco: 'Av. da Indústria, 1500', bairro: 'Industrial', cidade: 'Pirapora', responsavel_nome: 'Marcos Frota', telefone: '(38) 3749-1000', email: 'rh.cedro@cedro.com.br', pontos_engajamento: 550, selo: 'Ouro' },
  { id: 'e4', razao_social: 'Lojas Cem S/A', nome_fantasia: 'Lojas Cem', cnpj: '45.678.901/0004-66', cep: '39270-000', endereco: 'Rua São Francisco, 450', bairro: 'Centro', cidade: 'Pirapora', responsavel_nome: 'Clara Silveira', telefone: '(38) 3741-5500', email: 'lojas120@lojascem.com.br', pontos_engajamento: 0, selo: 'Nenhum' }
];

const INITIAL_COMPANY_ACTIONS: CompanyAction[] = [
  { id: 'ca1', empresa_id: 'e1', tipo: 'Visita Técnica', pontos: 50, data: '2026-05-15T10:00:00Z' },
  { id: 'ca2', empresa_id: 'e1', tipo: 'Outro', pontos: 30, data: '2026-05-18T10:00:00Z' },
  { id: 'ca3', empresa_id: 'e2', tipo: 'Visita Técnica', pontos: 50, data: '2026-04-10T10:00:00Z' },
  { id: 'ca4', empresa_id: 'e2', jovem_id: 'y1', tipo: 'Assistência / Mentoria', pontos: 150, data: '2026-04-20T10:00:00Z' },
  { id: 'ca5', empresa_id: 'e3', tipo: 'Visita Técnica', pontos: 50, data: '2026-01-10T10:00:00Z' },
  { id: 'ca6', empresa_id: 'e3', jovem_id: 'y2', tipo: 'Contratação Jovem', pontos: 500, data: '2026-02-15T10:00:00Z' }
];

const INITIAL_VAGAS: Vacancy[] = [
  { id: 'v1', empresa_id: 'e1', cargo: 'Auxiliar Administrativo', tipo: 'Jovem Aprendiz', quantidade: 2, horario: '08:00 - 12:00 (Segunda a Sexta)', bolsa_auxilio: 750.00, idade_minima: 15, escolaridade_exigida: 'Ensino Médio Cursando', competencias_desejadas: ['Informática', 'Comunicação', 'Organização'], status_vaga: 'Aberta' },
  { id: 'v2', empresa_id: 'e2', cargo: 'Operador de Caixa / Repositor', tipo: 'Jovem Aprendiz', quantidade: 3, horario: '13:00 - 17:00 (Segunda a Sexta)', bolsa_auxilio: 680.00, idade_minima: 16, escolaridade_exigida: 'Ensino Fundamental Completo', competencias_desejadas: ['Trabalho em equipe', 'Atendimento ao público', 'Proatividade'], status_vaga: 'Aberta' },
  { id: 'v3', empresa_id: 'e3', cargo: 'Auxiliar de Linha de Produção', tipo: 'Jovem Aprendiz', quantidade: 4, horario: '13:00 - 17:00 (Segunda a Sexta)', bolsa_auxilio: 800.00, idade_minima: 17, escolaridade_exigida: 'Ensino Médio Cursando', competencias_desejadas: ['Trabalho em equipe', 'Organização', 'Proatividade'], status_vaga: 'Aberta' },
  { id: 'v4', empresa_id: 'e4', cargo: 'Auxiliar de Vendas', tipo: 'Estágio', quantidade: 1, horario: '09:00 - 15:00 (Sábado Opcional)', bolsa_auxilio: 900.00, idade_minima: 16, escolaridade_exigida: 'Ensino Médio Cursando', competencias_desejadas: ['Comunicação', 'Atendimento ao público', 'Iniciativa'], status_vaga: 'Aberta' }
];

// Helper to compute vulnerability scores in memory
export function calculateVulnerabilityScore(v: Omit<YouthVulnerabilities, 'jovem_id'>): number {
  let score = 0;
  if (v.bolsa_familia) score += 1;
  if (v.cad_unico) score += 1;
  if (v.medida_socioeducativa) score += 3;
  if (v.deficiencia) score += 1;
  if (!v.acesso_internet) score += 1;
  if (!v.computador) score += 1;
  if (!v.trabalhou_antes) score += 1;
  if (v.abandonou_escola) score += 2;
  if (v.dificuldade_transporte) score += 2;
  if (v.acompanhamento_psicologico) score += 1;
  return score;
}

// Generate realistic youth mock database with active histories across 2024, 2025, 2026
const GENERATED_YOUTH: Youth[] = [
  // Hired Success Case (2024 -> Hired in 2025)
  {
    id: 'y1', nome_completo: 'João Victor Souza Silva', sexo: 'M', cor_raca: 'Pardo', escolaridade: 'Ensino Médio Completo',
    cpf: '124.896.357-89', data_nascimento: '2008-04-12', cep: '39274-100', endereco: 'Rua Minas Gerais, 98', bairro: 'Cidade Jardim',
    cidade: 'Pirapora', telefone: '(38) 99874-5612', whatsapp: '(38) 99874-5612', nome_responsavel: 'Maria Aparecida Souza',
    parentesco_responsavel: 'Mãe', telefone_responsavel: '(38) 99841-2357', pessoas_residencia: 4, pessoas_trabalham: 1, renda_familiar: 1400.00,
    status_atual: 'Contratado', score_vulnerabilidade: 6, indicado_por_unidade: 'u2', cadastrado_por_tecnico: 't2', ano_indicacao: 2024, pontos_gamificacao: 380,
    created_at: '2024-02-10T10:00:00Z', area_interesse: 'Administrativo'
  },
  // Active Success Case (2025 -> Currently active in course 2026)
  {
    id: 'y2', nome_completo: 'Ana Clara Santos Ferreira', sexo: 'F', cor_raca: 'Preto', escolaridade: 'Ensino Médio Cursando',
    cpf: '321.654.987-54', data_nascimento: '2009-08-22', cep: '39272-200', endereco: 'Rua Pará, 12', bairro: 'Bom Jesus',
    cidade: 'Pirapora', telefone: '(38) 98841-5522', whatsapp: '(38) 98841-5522', nome_responsavel: 'Antônio Ferreira',
    parentesco_responsavel: 'Pai', telefone_responsavel: '(38) 98877-4411', pessoas_residencia: 5, pessoas_trabalham: 0, renda_familiar: 750.00,
    status_atual: 'Em Curso', score_vulnerabilidade: 9, indicado_por_unidade: 'u3', cadastrado_por_tecnico: 't1', ano_indicacao: 2025, pontos_gamificacao: 240,
    created_at: '2025-03-15T14:30:00Z', area_interesse: 'Comércio'
  },
  // Risk of Dropout Case (2026 Indication in warning state)
  {
    id: 'y3', nome_completo: 'Lucas Gabriel Oliveira Lima', sexo: 'M', cor_raca: 'Pardo', escolaridade: 'Ensino Fundamental Completo',
    cpf: '987.654.321-00', data_nascimento: '2010-11-05', cep: '39276-050', endereco: 'Rua das Palmeiras, 450', bairro: 'Santos Dumont',
    cidade: 'Pirapora', telefone: '(38) 99122-3344', whatsapp: '(38) 99122-3344', nome_responsavel: 'Rita de Cássia Oliveira',
    parentesco_responsavel: 'Avó', telefone_responsavel: '(38) 98811-2299', pessoas_residencia: 3, pessoas_trabalham: 0, renda_familiar: 600.00,
    status_atual: 'Alerta', score_vulnerabilidade: 11, indicado_por_unidade: 'u5', cadastrado_por_tecnico: 't1', ano_indicacao: 2026, pontos_gamificacao: 45,
    created_at: '2026-01-20T08:15:00Z', area_interesse: 'Tecnologia'
  },
  // Dropout Case (2025 Dropout due to transport)
  {
    id: 'y4', nome_completo: 'Mariana Azevedo Costa', sexo: 'F', cor_raca: 'Branco', escolaridade: 'Ensino Médio Cursando',
    cpf: '456.789.123-45', data_nascimento: '2009-02-14', cep: '39278-150', endereco: 'Av. Industrial, 44', bairro: 'Industrial',
    cidade: 'Pirapora', telefone: '(38) 99988-7766', whatsapp: '(38) 99988-7766', nome_responsavel: 'Claudio Costa',
    parentesco_responsavel: 'Pai', telefone_responsavel: '(38) 99955-4422', pessoas_residencia: 6, pessoas_trabalham: 2, renda_familiar: 2100.00,
    status_atual: 'Evadido', score_vulnerabilidade: 5, indicado_por_unidade: 'u4', cadastrado_por_tecnico: 't2', ano_indicacao: 2025, pontos_gamificacao: 90,
    created_at: '2025-02-18T09:00:00Z', area_interesse: 'Logística'
  },
  // New Indicated Pending (2026 Registration)
  {
    id: 'y5', nome_completo: 'Matheus Santos Rodrigues', sexo: 'M', cor_raca: 'Preto', escolaridade: 'Ensino Médio Cursando',
    cpf: '556.778.889-11', data_nascimento: '2010-06-30', cep: '39274-050', endereco: 'Rua Bahia, 510', bairro: 'Cidade Jardim',
    cidade: 'Pirapora', telefone: '(38) 98412-3698', whatsapp: '(38) 98412-3698', nome_responsavel: 'Sandra Santos',
    parentesco_responsavel: 'Mãe', telefone_responsavel: '(38) 98412-3600', pessoas_residencia: 3, pessoas_trabalham: 1, renda_familiar: 1300.00,
    status_atual: 'Pendente', score_vulnerabilidade: 7, indicado_por_unidade: 'u2', cadastrado_por_tecnico: 't2', ano_indicacao: 2026, pontos_gamificacao: 0,
    created_at: '2026-05-10T11:45:00Z', area_interesse: 'Indústria'
  },
  // Another completed success (2025 completed -> waiting vacancy in 2026)
  {
    id: 'y6', nome_completo: 'Gabriela Alves Rezende', sexo: 'F', cor_raca: 'Amarelo', escolaridade: 'Ensino Médio Completo',
    cpf: '778.889.990-22', data_nascimento: '2008-01-20', cep: '39270-000', endereco: 'Rua Tiradentes, 874', bairro: 'Centro',
    cidade: 'Pirapora', telefone: '(38) 98855-6622', whatsapp: '(38) 98855-6622', nome_responsavel: 'Eliane Alves',
    parentesco_responsavel: 'Mãe', telefone_responsavel: '(38) 98855-6600', pessoas_residencia: 2, pessoas_trabalham: 1, renda_familiar: 1200.00,
    status_atual: 'Concluído', score_vulnerabilidade: 5, indicado_por_unidade: 'u1', cadastrado_por_tecnico: 't1', ano_indicacao: 2025, pontos_gamificacao: 320,
    created_at: '2025-05-02T10:00:00Z', area_interesse: 'Saúde'
  }
];

const GENERATED_VULNERABILIDADES: YouthVulnerabilities[] = [
  { jovem_id: 'y1', bolsa_familia: true, cad_unico: true, medida_socioeducativa: false, deficiencia: false, acesso_internet: true, computador: false, trabalhou_antes: false, abandonou_escola: false, dificuldade_transporte: true, acompanhamento_psicologico: false },
  { jovem_id: 'y2', bolsa_familia: true, cad_unico: true, medida_socioeducativa: false, deficiencia: true, deficiencia_qual: 'Auditiva Leve', acesso_internet: true, computador: false, trabalhou_antes: false, abandonou_escola: true, dificuldade_transporte: true, acompanhamento_psicologico: false },
  { jovem_id: 'y3', bolsa_familia: true, cad_unico: true, medida_socioeducativa: true, deficiencia: false, acesso_internet: false, computador: false, trabalhou_antes: false, abandonou_escola: true, dificuldade_transporte: true, acompanhamento_psicologico: true },
  { jovem_id: 'y4', bolsa_familia: false, cad_unico: true, medida_socioeducativa: false, deficiencia: false, acesso_internet: true, computador: true, trabalhou_antes: false, abandonou_escola: false, dificuldade_transporte: true, acompanhamento_psicologico: false },
  { jovem_id: 'y5', bolsa_familia: true, cad_unico: true, medida_socioeducativa: false, deficiencia: false, acesso_internet: true, computador: false, trabalhou_antes: false, abandonou_escola: false, dificuldade_transporte: true, acompanhamento_psicologico: true },
  { jovem_id: 'y6', bolsa_familia: false, cad_unico: true, medida_socioeducativa: false, deficiencia: false, acesso_internet: true, computador: false, trabalhou_antes: false, abandonou_escola: false, dificuldade_transporte: false, acompanhamento_psicologico: true }
];

const INITIAL_ACOMPANHAMENTOS: FollowUpLog[] = [
  // Joao history
  { id: 'l1', jovem_id: 'y1', tecnico_name: 'Mateus CRAS', tipo_contato: 'WhatsApp', relato_detalhado: 'Primeiro contato realizado com o jovem. Apresentou-se muito interessado em cursar a área administrativa.', status_momento: 'Pendente', created_at: '2024-02-12T10:00:00Z' },
  { id: 'l2', jovem_id: 'y1', tecnico_name: 'Mateus CRAS', tipo_contato: 'Feedback do Curso', relato_detalhado: 'SENAI reportou excelente frequência do João no curso de capacitação técnica inicial.', status_momento: 'Em Curso', created_at: '2024-04-10T14:00:00Z' },
  { id: 'l3', jovem_id: 'y1', tecnico_name: 'Mateus CRAS', tipo_contato: 'Reunião Familiar', relato_detalhado: 'Realizada reunião com a mãe. Discutida a importância do jovem continuar no contraturno. Família apoia.', status_momento: 'Em Curso', created_at: '2024-07-20T16:00:00Z' },
  { id: 'l4', jovem_id: 'y1', tecnico_name: 'Mateus CRAS', tipo_contato: 'Visita Domiciliar', relato_detalhado: 'Jovem concluiu o curso e foi aprovado na entrevista do Sebrae. Contratado como jovem aprendiz!', status_momento: 'Contratado', created_at: '2025-01-10T09:00:00Z' },
  
  // Ana history
  { id: 'l5', jovem_id: 'y2', tecnico_name: 'Lorena CREAS', tipo_contato: 'Visita Domiciliar', relato_detalhado: 'Realizada visita inicial por busca ativa. Jovem havia abandonado a escola no ano anterior devido a conflito de horários. Vamos apoiar seu retorno e inscrição no Descubra.', status_momento: 'Pendente', created_at: '2025-03-20T14:00:00Z' },
  { id: 'l6', jovem_id: 'y2', tecnico_name: 'Lorena CREAS', tipo_contato: 'Acompanhamento Escolar', relato_detalhado: 'Confirmada matrícula escolar e bom início no curso de auxiliar de comércio.', status_momento: 'Em Curso', created_at: '2025-05-15T11:00:00Z' },

  // Lucas history (Warning state)
  { id: 'l7', jovem_id: 'y3', tecnico_name: 'Lorena CREAS', tipo_contato: 'Contato Telefônico', relato_detalhado: 'Contato realizado pois o SENAI reportou 3 faltas consecutivas do Lucas nesta semana. Jovem alega falta de dinheiro para o transporte (estava sem passe escolar).', status_momento: 'Alerta', created_at: '2026-03-10T14:30:00Z' },
  { id: 'l8', jovem_id: 'y3', tecnico_name: 'Lorena CREAS', tipo_contato: 'Visita Domiciliar', relato_detalhado: 'Visita na casa da avó. Providenciamos a entrega emergencial do auxílio transporte de Pirapora. Jovem se comprometeu a retornar na segunda-feira.', status_momento: 'Alerta', created_at: '2026-03-22T10:00:00Z' },

  // Mariana history (Dropout)
  { id: 'l9', jovem_id: 'y4', tecnico_name: 'Mateus CRAS', tipo_contato: 'Contato Telefônico', relato_detalhado: 'Jovem reportou que não conseguirá ir para o curso devido à distância industrial e falta de ônibus direto. Decidiu abandonar para buscar emprego informal próximo de casa.', status_momento: 'Evadido', motivo_evasao: 'Problema com Transporte', created_at: '2025-06-05T15:00:00Z' }
];

const INITIAL_REFERRALS: Referral[] = [
  { id: 'ref1', jovem_id: 'y1', vaga_id: 'v1', status: 'Contratado', feedback_empresa: 'Excelente comportamento na entrevista e testes de informática.', data_encaminhamento: '2025-01-05' },
  { id: 'ref2', jovem_id: 'y6', vaga_id: 'v4', status: 'Selecionado para Entrevista', feedback_empresa: 'Entrevista agendada para 05/06/2026.', data_encaminhamento: '2026-05-25' }
];

// Master DB initializer and local syncing
class LocalDB {
  public liveLoadingPromise: Promise<void> | null = null;
  public liveLoaded: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      if (!localStorage.getItem('descubra_unidades')) {
        this.reset();
      }

      // Preload data if live mode is active
      if (isLiveMode()) {
        this.liveLoadingPromise = this.preloadFromSupabase();
      }
    }
  }

  async preloadFromSupabase() {
    try {
      console.log('Descubra Hub: Precarregando dados do Supabase...');
      const [
        { data: unidades },
        { data: profiles },
        { data: jovens },
        { data: vulnerabilidades },
        { data: acompanhamentos },
        { data: empresas },
        { data: companyActions },
        { data: vagas },
        { data: referrals },
        { data: recompensas },
        { data: resgates },
        { data: depoimentos },
        { data: audits }
      ] = await Promise.all([
        supabase!.from('unidades').select('*'),
        supabase!.from('profiles').select('*'),
        supabase!.from('jovens').select('*'),
        supabase!.from('vulnerabilidades').select('*'),
        supabase!.from('acompanhamentos').select('*'),
        supabase!.from('empresas').select('*'),
        supabase!.from('company_actions').select('*'),
        supabase!.from('vagas').select('*'),
        supabase!.from('referrals').select('*'),
        supabase!.from('recompensas').select('*'),
        supabase!.from('resgates').select('*'),
        supabase!.from('depoimentos').select('*'),
        supabase!.from('auditoria_logs').select('*')
      ]);

      if (unidades && unidades.length > 0) {
        localStorage.setItem('descubra_unidades', JSON.stringify(unidades));
        if (profiles) localStorage.setItem('descubra_tecnicos', JSON.stringify(profiles));
        if (jovens) localStorage.setItem('descubra_jovens', JSON.stringify(jovens));
        if (vulnerabilidades) localStorage.setItem('descubra_vulnerabilidades', JSON.stringify(vulnerabilidades));
        if (acompanhamentos) localStorage.setItem('descubra_acompanhamentos', JSON.stringify(acompanhamentos));
        if (empresas) localStorage.setItem('descubra_empresas', JSON.stringify(empresas));
        if (companyActions) localStorage.setItem('descubra_company_actions', JSON.stringify(companyActions));
        if (vagas) localStorage.setItem('descubra_vagas', JSON.stringify(vagas));
        if (referrals) localStorage.setItem('descubra_referrals', JSON.stringify(referrals));
        if (recompensas) localStorage.setItem('descubra_recompensas', JSON.stringify(recompensas));
        if (resgates) localStorage.setItem('descubra_resgates', JSON.stringify(resgates));
        if (depoimentos) localStorage.setItem('descubra_depoimentos', JSON.stringify(depoimentos));
        if (audits) {
          const mappedAudits = audits.map((a: any) => ({
            id: a.id,
            usuario_nome: a.usuario_nome,
            acao: a.acao,
            tabela: a.tabela,
            detalhes: a.detalhes,
            created_at: a.created_at
          }));
          localStorage.setItem('descubra_audits', JSON.stringify(mappedAudits));
        }
        this.liveLoaded = true;
        console.log('Descubra Hub: Pré-carregamento do Supabase concluído com sucesso!');
        
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('supabase_data_loaded'));
        }
      } else {
        console.log('Descubra Hub: Supabase está sem dados de inicialização. Iniciando migração automática silenciosa...');
        await this.migrateAllToSupabase();
        console.log('Descubra Hub: Migração automática silenciosa concluída!');
      }
    } catch (e) {
      console.error('Descubra Hub: Erro ao precarregar dados do Supabase:', e);
    }
  }

  async migrateAllToSupabase(progressCallback?: (status: string, percent: number) => void) {
    if (!isLiveMode()) throw new Error('Supabase não está configurado.');
    
    const totalSteps = 12;
    let currentStep = 0;
    
    const updateProgress = (msg: string) => {
      currentStep++;
      if (progressCallback) {
        progressCallback(msg, Math.min(100, Math.round((currentStep / totalSteps) * 100)));
      }
    };
    
    try {
      updateProgress('Migrando Unidades de Referência...');
      const unidades = this.getUnidades();
      await supabase!.from('unidades').upsert(unidades.map(u => ({
        id: getDeterministicUUID(u.id),
        nome: u.nome,
        tipo: u.tipo,
        endereco: u.endereco,
        bairro: u.bairro,
        cidade: u.cidade,
        cep: u.cep,
        telefone: u.telefone,
        email: u.email,
        responsavel_nome: u.responsavel_nome
      })));
      
      updateProgress('Migrando Perfis Técnicos...');
      const tecnicos = this.getTecnicos();
      await supabase!.from('profiles').upsert(tecnicos.map(t => ({
        id: getDeterministicUUID(t.id),
        nome: t.nome,
        cpf: t.cpf,
        email: t.email,
        role: t.role,
        unidade_id: t.unidade_id ? getDeterministicUUID(t.unidade_id) : null,
        cidade: t.cidade,
        telefone: t.telefone
      })));
      
      updateProgress('Migrando Empresas Parceiras...');
      const empresas = this.getEmpresas();
      await supabase!.from('empresas').upsert(empresas.map(e => ({
        id: getDeterministicUUID(e.id),
        razao_social: e.razao_social,
        nome_fantasia: e.nome_fantasia,
        cnpj: e.cnpj,
        cep: e.cep,
        endereco: e.endereco,
        bairro: e.bairro,
        cidade: e.cidade,
        responsavel_nome: e.responsavel_nome,
        telefone: e.telefone,
        email: e.email,
        pontos_engajamento: e.pontos_engajamento,
        selo: e.selo
      })));
      
      updateProgress('Migrando Recompensas (Gamificação)...');
      const recompensas = this.getRecompensas();
      await supabase!.from('recompensas').upsert(recompensas.map(r => ({
        id: getDeterministicUUID(r.id),
        nome: r.nome,
        descricao: r.descricao,
        custo_pontos: r.custo_pontos,
        estoque: r.estoque
      })));
      
      updateProgress('Migrando Fichas de Jovens...');
      const jovens = this.getYouthList();
      await supabase!.from('jovens').upsert(jovens.map(y => ({
        id: getDeterministicUUID(y.id),
        nome_completo: y.nome_completo,
        sexo: y.sexo,
        cor_raca: y.cor_raca,
        escolaridade: y.escolaridade,
        cpf: y.cpf,
        data_nascimento: y.data_nascimento,
        cep: y.cep,
        endereco: y.endereco,
        bairro: y.bairro,
        cidade: y.cidade,
        telefone: y.telefone,
        whatsapp: y.whatsapp,
        nome_responsavel: y.nome_responsavel,
        parentesco_responsavel: y.parentesco_responsavel,
        telefone_responsavel: y.telefone_responsavel,
        pessoas_residencia: y.pessoas_residencia,
        pessoas_trabalham: y.pessoas_trabalham,
        renda_familiar: y.renda_familiar,
        status_atual: y.status_atual,
        score_vulnerabilidade: y.score_vulnerabilidade,
        indicado_por_unidade: getDeterministicUUID(y.indicado_por_unidade),
        cadastrado_por_tecnico: getDeterministicUUID(y.cadastrado_por_tecnico),
        ano_indicacao: y.ano_indicacao,
        pontos_gamificacao: y.pontos_gamificacao,
        created_at: y.created_at,
        area_interesse: y.area_interesse,
        outra_area_interesse: y.outra_area_interesse
      })));
      
      updateProgress('Migrando Fatores de Vulnerabilidade...');
      const vulnerabilidades = this.getYouthVulnerabilities();
      await supabase!.from('vulnerabilidades').upsert(vulnerabilidades.map(v => ({
        jovem_id: getDeterministicUUID(v.jovem_id),
        bolsa_familia: v.bolsa_familia,
        cad_unico: v.cad_unico,
        medida_socioeducativa: v.medida_socioeducativa,
        deficiencia: v.deficiencia,
        deficiencia_qual: v.deficiencia_qual,
        acesso_internet: v.acesso_internet,
        computador: v.computador,
        trabalhou_antes: v.trabalhou_antes,
        abandonou_escola: v.abandonou_escola,
        dificuldade_transporte: v.dificuldade_transporte,
        acompanhamento_psicologico: v.acompanhamento_psicologico
      })));
      
      updateProgress('Migrando Diários de Acompanhamento...');
      const acompanhamentos = this.getFollowUpLogs();
      await supabase!.from('acompanhamentos').upsert(acompanhamentos.map(a => ({
        id: getDeterministicUUID(a.id),
        jovem_id: getDeterministicUUID(a.jovem_id),
        tecnico_name: a.tecnico_name,
        tipo_contato: a.tipo_contato,
        relato_detalhado: a.relato_detalhado,
        status_momento: a.status_momento,
        motivo_evasao: a.motivo_evasao,
        created_at: a.created_at
      })));
      
      updateProgress('Migrando Ações de Engajamento...');
      const companyActions = this.getCompanyActions();
      await supabase!.from('company_actions').upsert(companyActions.map(ca => ({
        id: getDeterministicUUID(ca.id),
        empresa_id: getDeterministicUUID(ca.empresa_id),
        jovem_id: ca.jovem_id ? getDeterministicUUID(ca.jovem_id) : null,
        tipo: ca.tipo,
        pontos: ca.pontos,
        data: ca.data
      })));
      
      updateProgress('Migrando Vagas Cadastradas...');
      const vagas = this.getVagas();
      await supabase!.from('vagas').upsert(vagas.map(v => ({
        id: getDeterministicUUID(v.id),
        empresa_id: getDeterministicUUID(v.empresa_id),
        cargo: v.cargo,
        tipo: v.tipo,
        quantidade: v.quantidade,
        horario: v.horario,
        bolsa_auxilio: v.bolsa_auxilio,
        idade_minima: v.idade_minima,
        escolaridade_exigida: v.escolaridade_exigida,
        competencias_desejadas: v.competencias_desejadas,
        status_vaga: v.status_vaga
      })));
      
      updateProgress('Migrando Encaminhamentos de Jovens...');
      const referrals = this.getReferrals();
      await supabase!.from('referrals').upsert(referrals.map(r => ({
        id: getDeterministicUUID(r.id),
        jovem_id: getDeterministicUUID(r.jovem_id),
        vaga_id: getDeterministicUUID(r.vaga_id),
        status: r.status,
        feedback_empresa: r.feedback_empresa,
        data_encaminhamento: r.data_encaminhamento
      })));
      
      updateProgress('Migrando Histórias de Sucesso...');
      const depoimentos = this.getDepoimentos();
      await supabase!.from('depoimentos').upsert(depoimentos.map(d => ({
        id: getDeterministicUUID(d.id),
        jovem_id: getDeterministicUUID(d.jovem_id),
        titulo: d.titulo,
        descricao: d.descricao,
        imagens: d.imagens || [],
        video_url: d.video_url || null,
        status: d.status,
        destaque: d.destaque,
        feedback_tecnico: d.feedback_tecnico || null,
        criado_em: d.criado_em
      })));
      
      updateProgress('Sincronizando Histórico de Auditoria...');
      const audits = this.getAuditLogs();
      await supabase!.from('auditoria_logs').upsert(audits.map(a => ({
        id: getDeterministicUUID(a.id),
        usuario_nome: a.usuario_nome,
        acao: a.acao,
        tabela: a.tabela,
        detalhes: a.detalhes,
        created_at: a.created_at
      })));
      
      updateProgress('Migração Concluída com Sucesso!');
      this.liveLoaded = true;
      await this.preloadFromSupabase();
      
      return true;
    } catch (err) {
      console.error('Erro na migração:', err);
      throw err;
    }
  }

  reset() {
    if (typeof window === 'undefined') return;
    localStorage.setItem('descubra_unidades', JSON.stringify(INITIAL_UNIDADES));
    localStorage.setItem('descubra_tecnicos', JSON.stringify(INITIAL_TECNICOS));
    localStorage.setItem('descubra_recompensas', JSON.stringify(INITIAL_RECOMPENSAS));
    localStorage.setItem('descubra_empresas', JSON.stringify(INITIAL_EMPRESAS));
    localStorage.setItem('descubra_vagas', JSON.stringify(INITIAL_VAGAS));
    localStorage.setItem('descubra_jovens', JSON.stringify(GENERATED_YOUTH));
    localStorage.setItem('descubra_vulnerabilidades', JSON.stringify(GENERATED_VULNERABILIDADES));
    localStorage.setItem('descubra_acompanhamentos', JSON.stringify(INITIAL_ACOMPANHAMENTOS));
    localStorage.setItem('descubra_referrals', JSON.stringify(INITIAL_REFERRALS));
    localStorage.setItem('descubra_resgates', JSON.stringify([]));
    localStorage.setItem('descubra_company_actions', JSON.stringify(INITIAL_COMPANY_ACTIONS));
    localStorage.setItem('descubra_depoimentos', JSON.stringify(INITIAL_DEPOIMENTOS));
    localStorage.setItem('descubra_audits', JSON.stringify([
      { id: 'a1', usuario_nome: 'Sistema', acao: 'Inicialização', tabela: 'Geral', detalhes: 'Banco de dados local iniciado com série histórica de 3 anos (2024-2026).', created_at: new Date().toISOString() }
    ]));
  }

  getItem<T>(key: string): T {
    if (typeof window === 'undefined') return [] as unknown as T;
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : ([] as unknown as T);
  }

  setItem(key: string, data: any) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(data));
  }

  // --- API SIMULATION METHODS ---

  getUnidades(): ReferenceUnit[] {
    return this.getItem<ReferenceUnit[]>('descubra_unidades');
  }

  getTecnicos(): TechnicalProfile[] {
    return this.getItem<TechnicalProfile[]>('descubra_tecnicos');
  }

  getEmpresas(): Company[] {
    return this.getItem<Company[]>('descubra_empresas');
  }

  saveEmpresa(emp: Omit<Company, 'id'> & { id?: string }): Company {
    const list = this.getEmpresas();
    const newEmp: Company = {
      ...emp,
      id: emp.id || 'e_' + Math.random().toString(36).substr(2, 9)
    };
    const index = list.findIndex(e => e.id === newEmp.id);
    if (index > -1) {
      list[index] = newEmp;
    } else {
      list.push(newEmp);
      this.logAudit('Lorena CREAS', 'Inserção', 'empresas', `Empresa ${newEmp.nome_fantasia} cadastrada.`);
    }
    this.setItem('descubra_empresas', list);

    if (isLiveMode()) {
      supabase!.from('empresas').upsert({
        id: getDeterministicUUID(newEmp.id),
        razao_social: newEmp.razao_social,
        nome_fantasia: newEmp.nome_fantasia,
        cnpj: newEmp.cnpj,
        cep: newEmp.cep,
        endereco: newEmp.endereco,
        bairro: newEmp.bairro,
        cidade: newEmp.cidade,
        responsavel_nome: newEmp.responsavel_nome,
        telefone: newEmp.telefone,
        email: newEmp.email,
        pontos_engajamento: newEmp.pontos_engajamento,
        selo: newEmp.selo
      }).then(({ error }) => {
        if (error) console.error('Error syncing empresa to Supabase:', error.message || error);
      });
    }

    return newEmp;
  }

  updateCompanySeal(id: string, selo: 'Ouro' | 'Prata' | 'Bronze' | 'Nenhum'): boolean {
    const list = this.getEmpresas();
    const index = list.findIndex(e => e.id === id);
    if (index > -1) {
      list[index].selo = selo;
      this.setItem('descubra_empresas', list);
      this.logAudit('Coordenação Descubra', 'Atualização Selo', 'empresas', `Selo da empresa ${list[index].nome_fantasia} atualizado para ${selo}.`);

      if (isLiveMode()) {
        supabase!.from('empresas')
          .update({ selo })
          .eq('id', getDeterministicUUID(id))
          .then(({ error }) => {
            if (error) console.error('Error updating seal to Supabase:', error.message || error);
          });
      }

      return true;
    }
    return false;
  }

  getCompanyActions(empresaId?: string): CompanyAction[] {
    const actions = this.getItem<CompanyAction[]>('descubra_company_actions');
    if (empresaId) return actions.filter(a => a.empresa_id === empresaId);
    return actions;
  }

  logCompanyAction(empresa_id: string, jovem_id: string | undefined, tipo: CompanyAction['tipo']): CompanyAction {
    const list = this.getCompanyActions();
    let pontos = 0;
    if (tipo === 'Visita Técnica') pontos = 50;
    else if (tipo === 'Assistência / Mentoria') pontos = 150;
    else if (tipo === 'Contratação Jovem') pontos = 500;
    else pontos = 30;

    const newAction: CompanyAction = {
      id: 'ca_' + Math.random().toString(36).substr(2, 9),
      empresa_id,
      jovem_id,
      tipo,
      pontos,
      data: new Date().toISOString()
    };
    list.push(newAction);
    this.setItem('descubra_company_actions', list);

    // Update company score
    const empresas = this.getEmpresas();
    const eIdx = empresas.findIndex(e => e.id === empresa_id);
    if (eIdx > -1) {
      empresas[eIdx].pontos_engajamento = (empresas[eIdx].pontos_engajamento || 0) + pontos;
      this.setItem('descubra_empresas', empresas);
    }

    this.logAudit('Empresa/Sistema', 'Gamificação', 'company_actions', `Empresa registrou ação "${tipo}" (+${pontos} pts).`);

    if (isLiveMode()) {
      supabase!.from('company_actions').insert({
        id: getDeterministicUUID(newAction.id),
        empresa_id: getDeterministicUUID(empresa_id),
        jovem_id: jovem_id ? getDeterministicUUID(jovem_id) : null,
        tipo,
        pontos,
        data: newAction.data
      }).then(({ error }) => {
        if (error) console.error('Error inserting action to Supabase:', error.message || error);
      });

      if (eIdx > -1) {
        supabase!.from('empresas')
          .update({ pontos_engajamento: empresas[eIdx].pontos_engajamento })
          .eq('id', getDeterministicUUID(empresa_id))
          .then(({ error }) => {
            if (error) console.error('Error updating company points to Supabase:', error.message || error);
          });
      }
    }

    return newAction;
  }

  getVagas(): Vacancy[] {
    return this.getItem<Vacancy[]>('descubra_vagas');
  }

  saveVaga(vaga: Omit<Vacancy, 'id'> & { id?: string }): Vacancy {
    const list = this.getVagas();
    const newVaga: Vacancy = {
      ...vaga,
      id: vaga.id || 'v_' + Math.random().toString(36).substr(2, 9)
    };
    const index = list.findIndex(v => v.id === newVaga.id);
    if (index > -1) {
      list[index] = newVaga;
    } else {
      list.push(newVaga);
      this.logAudit('Lorena CREAS', 'Inserção', 'vagas', `Vaga de ${newVaga.cargo} cadastrada.`);
    }
    this.setItem('descubra_vagas', list);

    if (isLiveMode()) {
      supabase!.from('vagas').upsert({
        id: getDeterministicUUID(newVaga.id),
        empresa_id: getDeterministicUUID(newVaga.empresa_id),
        cargo: newVaga.cargo,
        tipo: newVaga.tipo,
        quantidade: newVaga.quantidade,
        horario: newVaga.horario,
        bolsa_auxilio: newVaga.bolsa_auxilio,
        idade_minima: newVaga.idade_minima,
        escolaridade_exigida: newVaga.escolaridade_exigida,
        competencias_desejadas: newVaga.competencias_desejadas,
        status_vaga: newVaga.status_vaga
      }).then(({ error }) => {
        if (error) console.error('Error syncing vaga to Supabase:', error.message || error);
      });
    }

    return newVaga;
  }

  getYouthList(): Youth[] {
    return this.getItem<Youth[]>('descubra_jovens');
  }

  getYouthVulnerabilities(): YouthVulnerabilities[] {
    return this.getItem<YouthVulnerabilities[]>('descubra_vulnerabilidades');
  }

  getYouthById(id: string): { youth: Youth; vulnerabilities: YouthVulnerabilities } | null {
    const youth = this.getYouthList().find(y => y.id === id);
    const vulnerabilities = this.getYouthVulnerabilities().find(v => v.jovem_id === id);
    if (!youth) return null;
    return {
      youth,
      vulnerabilities: vulnerabilities || {
        jovem_id: id, bolsa_familia: false, cad_unico: false, medida_socioeducativa: false, deficiencia: false,
        acesso_internet: true, computador: true, trabalhou_antes: true, abandonou_escola: false,
        dificuldade_transporte: false, acompanhamento_psicologico: false
      }
    };
  }

  saveYouth(y: Partial<Youth> & { nome_completo: string }, vulns: Omit<YouthVulnerabilities, 'jovem_id'>): Youth {
    const youthList = this.getYouthList();
    const vulnList = this.getYouthVulnerabilities();

    const id = y.id || 'y_' + Math.random().toString(36).substr(2, 9);
    const score = calculateVulnerabilityScore(vulns);

    const newYouth: Youth = {
      id,
      nome_completo: y.nome_completo,
      sexo: y.sexo || 'M',
      cor_raca: y.cor_raca || 'Branco',
      escolaridade: y.escolaridade || 'Ensino Fundamental Completo',
      cpf: y.cpf || '',
      data_nascimento: y.data_nascimento || '2009-01-01',
      cep: y.cep || '',
      endereco: y.endereco || '',
      bairro: y.bairro || 'Centro',
      cidade: y.cidade || 'Pirapora',
      telefone: y.telefone || '',
      whatsapp: y.whatsapp || '',
      nome_responsavel: y.nome_responsavel || '',
      parentesco_responsavel: y.parentesco_responsavel || '',
      telefone_responsavel: y.telefone_responsavel || '',
      pessoas_residencia: y.pessoas_residencia || 3,
      pessoas_trabalham: y.pessoas_trabalham || 0,
      renda_familiar: y.renda_familiar || 0.00,
      status_atual: y.status_atual || 'Pendente',
      score_vulnerabilidade: score,
      indicado_por_unidade: y.indicado_por_unidade || 'u1',
      cadastrado_por_tecnico: y.cadastrado_por_tecnico || 't1',
      ano_indicacao: y.ano_indicacao || new Date().getFullYear(),
      pontos_gamificacao: y.pontos_gamificacao || 0,
      created_at: y.created_at || new Date().toISOString(),
      area_interesse: y.area_interesse || '',
      outra_area_interesse: y.outra_area_interesse || ''
    };

    const newVulns: YouthVulnerabilities = {
      ...vulns,
      jovem_id: id
    };

    const yIdx = youthList.findIndex(item => item.id === id);
    if (yIdx > -1) {
      youthList[yIdx] = newYouth;
    } else {
      youthList.push(newYouth);
      this.logAudit('Técnico', 'Cadastro Jovem', 'jovens', `Novo jovem ${newYouth.nome_completo} cadastrado com score ${score}.`);
    }

    const vIdx = vulnList.findIndex(item => item.jovem_id === id);
    if (vIdx > -1) {
      vulnList[vIdx] = newVulns;
    } else {
      vulnList.push(newVulns);
    }

    this.setItem('descubra_jovens', youthList);
    this.setItem('descubra_vulnerabilidades', vulnList);

    if (isLiveMode()) {
      supabase!.from('jovens').upsert({
        id: getDeterministicUUID(newYouth.id),
        nome_completo: newYouth.nome_completo,
        sexo: newYouth.sexo,
        cor_raca: newYouth.cor_raca,
        escolaridade: newYouth.escolaridade,
        cpf: newYouth.cpf,
        data_nascimento: newYouth.data_nascimento,
        cep: newYouth.cep,
        endereco: newYouth.endereco,
        bairro: newYouth.bairro,
        cidade: newYouth.cidade,
        telefone: newYouth.telefone,
        whatsapp: newYouth.whatsapp,
        nome_responsavel: newYouth.nome_responsavel,
        parentesco_responsavel: newYouth.parentesco_responsavel,
        telefone_responsavel: newYouth.telefone_responsavel,
        pessoas_residencia: newYouth.pessoas_residencia,
        pessoas_trabalham: newYouth.pessoas_trabalham,
        renda_familiar: newYouth.renda_familiar,
        status_atual: newYouth.status_atual,
        score_vulnerabilidade: newYouth.score_vulnerabilidade,
        indicado_por_unidade: getDeterministicUUID(newYouth.indicado_por_unidade),
        cadastrado_por_tecnico: getDeterministicUUID(newYouth.cadastrado_por_tecnico),
        ano_indicacao: newYouth.ano_indicacao,
        pontos_gamificacao: newYouth.pontos_gamificacao,
        created_at: newYouth.created_at,
        area_interesse: newYouth.area_interesse,
        outra_area_interesse: newYouth.outra_area_interesse
      }).then(({ error }) => {
        if (error) {
          console.error('Error syncing youth to Supabase:', error.message || error);
        } else {
          supabase!.from('vulnerabilidades').upsert({
            jovem_id: getDeterministicUUID(newVulns.jovem_id),
            bolsa_familia: newVulns.bolsa_familia,
            cad_unico: newVulns.cad_unico,
            medida_socioeducativa: newVulns.medida_socioeducativa,
            deficiencia: newVulns.deficiencia,
            deficiencia_qual: newVulns.deficiencia_qual,
            acesso_internet: newVulns.acesso_internet,
            computador: newVulns.computador,
            trabalhou_antes: newVulns.trabalhou_antes,
            abandonou_escola: newVulns.abandonou_escola,
            dificuldade_transporte: newVulns.dificuldade_transporte,
            acompanhamento_psicologico: newVulns.acompanhamento_psicologico
          }).then(({ error: vError }) => {
            if (vError) console.error('Error syncing vulnerabilities to Supabase:', vError.message || vError);
          });
        }
      });
    }

    return newYouth;
  }

  reindicateYouth(ids: string[], currentYear: number) {
    const youthList = this.getYouthList();
    const vulnList = this.getYouthVulnerabilities();
    let reindicatedCount = 0;

    const newlyAddedYouth: Youth[] = [];
    const newlyAddedVuln: YouthVulnerabilities[] = [];

    ids.forEach(id => {
      const source = youthList.find(y => y.id === id);
      const sourceVuln = vulnList.find(v => v.jovem_id === id);
      if (source && source.ano_indicacao !== currentYear) {
        // Clone with new year indication
        const newId = 'y_' + Math.random().toString(36).substr(2, 9);
        const reindicatedYouth: Youth = {
          ...source,
          id: newId,
          ano_indicacao: currentYear,
          status_atual: 'Pendente',
          pontos_gamificacao: 0,
          created_at: new Date().toISOString()
        };
        youthList.push(reindicatedYouth);
        newlyAddedYouth.push(reindicatedYouth);

        if (sourceVuln) {
          const reindicatedVuln = {
            ...sourceVuln,
            jovem_id: newId
          };
          vulnList.push(reindicatedVuln);
          newlyAddedVuln.push(reindicatedVuln);
        }
        reindicatedCount++;
      }
    });

    this.setItem('descubra_jovens', youthList);
    this.setItem('descubra_vulnerabilidades', vulnList);
    this.logAudit('Técnico', 'Re-indicação em Lote', 'jovens', `${reindicatedCount} jovens re-indicados para o ano ${currentYear}.`);

    if (isLiveMode() && reindicatedCount > 0) {
      const syncYouthPromise = supabase!.from('jovens').upsert(
        newlyAddedYouth.map(y => ({
          id: getDeterministicUUID(y.id),
          nome_completo: y.nome_completo,
          sexo: y.sexo,
          cor_raca: y.cor_raca,
          escolaridade: y.escolaridade,
          cpf: y.cpf,
          data_nascimento: y.data_nascimento,
          cep: y.cep,
          endereco: y.endereco,
          bairro: y.bairro,
          cidade: y.cidade,
          telefone: y.telefone,
          whatsapp: y.whatsapp,
          nome_responsavel: y.nome_responsavel,
          parentesco_responsavel: y.parentesco_responsavel,
          telefone_responsavel: y.telefone_responsavel,
          pessoas_residencia: y.pessoas_residencia,
          pessoas_trabalham: y.pessoas_trabalham,
          renda_familiar: y.renda_familiar,
          status_atual: y.status_atual,
          score_vulnerabilidade: y.score_vulnerabilidade,
          indicado_por_unidade: getDeterministicUUID(y.indicado_por_unidade),
          cadastrado_por_tecnico: getDeterministicUUID(y.cadastrado_por_tecnico),
          ano_indicacao: y.ano_indicacao,
          pontos_gamificacao: y.pontos_gamificacao,
          created_at: y.created_at,
          area_interesse: y.area_interesse,
          outra_area_interesse: y.outra_area_interesse
        }))
      );

      const syncVulnPromise = supabase!.from('vulnerabilidades').upsert(
        newlyAddedVuln.map(v => ({
          jovem_id: getDeterministicUUID(v.jovem_id),
          bolsa_familia: v.bolsa_familia,
          cad_unico: v.cad_unico,
          medida_socioeducativa: v.medida_socioeducativa,
          deficiencia: v.deficiencia,
          deficiencia_qual: v.deficiencia_qual,
          acesso_internet: v.acesso_internet,
          computador: v.computador,
          trabalhou_antes: v.trabalhou_antes,
          abandonou_escola: v.abandonou_escola,
          dificuldade_transporte: v.dificuldade_transporte,
          acompanhamento_psicologico: v.acompanhamento_psicologico
        }))
      );

      Promise.all([syncYouthPromise, syncVulnPromise]).then(() => {
        console.log('Descubra Hub: Re-indicação em lote sincronizada com o Supabase!');
      }).catch(err => {
        console.error('Error syncing batch re-indications to Supabase:', err.message || err);
      });
    }
  }

  getFollowUpLogs(): FollowUpLog[] {
    return this.getItem<FollowUpLog[]>('descubra_acompanhamentos');
  }

  getFollowUpsByYouth(jovemId: string): FollowUpLog[] {
    return this.getFollowUpLogs()
      .filter(l => l.jovem_id === jovemId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  addFollowUp(log: Omit<FollowUpLog, 'id' | 'created_at'>): FollowUpLog {
    const list = this.getFollowUpLogs();
    const newLog: FollowUpLog = {
      ...log,
      id: 'l_' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString()
    };
    list.push(newLog);
    this.setItem('descubra_acompanhamentos', list);

    // Dynamic state propagation to main youth record
    const youthList = this.getYouthList();
    const yIdx = youthList.findIndex(y => y.id === log.jovem_id);
    if (yIdx > -1) {
      const prevStatus = youthList[yIdx].status_atual;
      youthList[yIdx].status_atual = log.status_momento;
      
      // award 30 points to youth for contact check-in to gamify responsiveness
      youthList[yIdx].pontos_gamificacao += 30;

      this.setItem('descubra_jovens', youthList);
      this.logAudit(log.tecnico_name, 'Acompanhamento', 'jovens_acompanhamentos', `Registrado contato do tipo "${log.tipo_contato}". Status do jovem mudou de "${prevStatus}" para "${log.status_momento}".`);
    }

    if (isLiveMode()) {
      supabase!.from('acompanhamentos').insert({
        id: getDeterministicUUID(newLog.id),
        jovem_id: getDeterministicUUID(log.jovem_id),
        tecnico_name: log.tecnico_name,
        tipo_contato: log.tipo_contato,
        relato_detalhado: log.relato_detalhado,
        status_momento: log.status_momento,
        motivo_evasao: log.motivo_evasao,
        created_at: newLog.created_at
      }).then(({ error }) => {
        if (error) console.error('Error inserting follow up log to Supabase:', error.message || error);
      });

      if (yIdx > -1) {
        supabase!.from('jovens')
          .update({
            status_atual: youthList[yIdx].status_atual,
            pontos_gamificacao: youthList[yIdx].pontos_gamificacao
          })
          .eq('id', getDeterministicUUID(log.jovem_id))
          .then(({ error }) => {
            if (error) console.error('Error updating youth points/status to Supabase:', error.message || error);
          });
      }
    }

    return newLog;
  }

  getReferrals(): Referral[] {
    return this.getItem<Referral[]>('descubra_referrals');
  }

  createReferral(jovemId: string, vagaId: string): Referral {
    const list = this.getReferrals();
    const newRef: Referral = {
      id: 'ref_' + Math.random().toString(36).substr(2, 9),
      jovem_id: jovemId,
      vaga_id: vagaId,
      status: 'Selecionado para Entrevista',
      data_encaminhamento: new Date().toISOString().split('T')[0]
    };
    list.push(newRef);
    this.setItem('descubra_referrals', list);

    this.logAudit('Técnico', 'Encaminhamento Vaga', 'encaminhamentos', `Jovem encaminhado para entrevista.`);

    if (isLiveMode()) {
      supabase!.from('referrals').insert({
        id: getDeterministicUUID(newRef.id),
        jovem_id: getDeterministicUUID(jovemId),
        vaga_id: getDeterministicUUID(vagaId),
        status: newRef.status,
        data_encaminhamento: newRef.data_encaminhamento
      }).then(({ error }) => {
        if (error) console.error('Error inserting referral to Supabase:', error.message || error);
      });
    }

    return newRef;
  }

  updateReferralStatus(id: string, status: Referral['status'], feedback?: string) {
    const list = this.getReferrals();
    const idx = list.findIndex(r => r.id === id);
    if (idx > -1) {
      list[idx].status = status;
      if (feedback) list[idx].feedback_empresa = feedback;
      this.setItem('descubra_referrals', list);

      // If contratado, auto-update youth status and award company gold points
      if (status === 'Contratado') {
        const youthList = this.getYouthList();
        const yIdx = youthList.findIndex(y => y.id === list[idx].jovem_id);
        if (yIdx > -1) {
          youthList[yIdx].status_atual = 'Contratado';
          this.setItem('descubra_jovens', youthList);
        }
        
        // Gamification: Give the company 500 points for hiring!
        const vaga = this.getVagas().find(v => v.id === list[idx].vaga_id);
        if (vaga) {
          this.logCompanyAction(vaga.empresa_id, list[idx].jovem_id, 'Contratação Jovem');
        }
      }

      if (isLiveMode()) {
        const updateData: any = { status };
        if (feedback) updateData.feedback_empresa = feedback;
        
        supabase!.from('referrals')
          .update(updateData)
          .eq('id', getDeterministicUUID(id))
          .then(({ error }) => {
            if (error) console.error('Error updating referral status in Supabase:', error.message || error);
          });

        if (status === 'Contratado') {
          supabase!.from('jovens')
            .update({ status_atual: 'Contratado' })
            .eq('id', getDeterministicUUID(list[idx].jovem_id))
            .then(({ error }) => {
              if (error) console.error('Error updating youth status to hired in Supabase:', error.message || error);
            });
        }
      }
    }
  }

  getRecompensas(): Reward[] {
    return this.getItem<Reward[]>('descubra_recompensas');
  }

  getResgates(): Redemption[] {
    return this.getItem<Redemption[]>('descubra_resgates');
  }

  resgatarItem(jovemId: string, recompensaId: string): { success: boolean; error?: string } {
    const rewards = this.getRecompensas();
    const youthList = this.getYouthList();
    const resgates = this.getResgates();

    const reward = rewards.find(r => r.id === recompensaId);
    const youth = youthList.find(y => y.id === jovemId);

    if (!reward || !youth) return { success: false, error: 'Recompensa ou Jovem inválido.' };
    if (reward.estoque <= 0) return { success: false, error: 'Estoque esgotado para esta recompensa.' };
    if (youth.pontos_gamificacao < reward.custo_pontos) {
      return { success: false, error: `Pontuação insuficiente. Você precisa de ${reward.custo_pontos} pontos, mas tem apenas ${youth.pontos_gamificacao}.` };
    }

    // Deduct points and stock
    youth.pontos_gamificacao -= reward.custo_pontos;
    reward.estoque--;

    const newRedemption: Redemption = {
      id: 'res_' + Math.random().toString(36).substr(2, 9),
      jovem_id: youth.id,
      recompensa_id: reward.id,
      status_resgate: 'Aguardando Entrega',
      data_resgate: new Date().toISOString()
    };

    resgates.push(newRedemption);

    this.setItem('descubra_jovens', youthList);
    this.setItem('descubra_recompensas', rewards);
    this.setItem('descubra_resgates', resgates);

    this.logAudit(youth.nome_completo, 'Resgate Recompensa', 'gamificacao_resgates', `Resgatou: ${reward.nome} por ${reward.custo_pontos} pontos.`);

    if (isLiveMode()) {
      const syncRedemption = supabase!.from('resgates').insert({
        id: getDeterministicUUID(newRedemption.id),
        jovem_id: getDeterministicUUID(youth.id),
        recompensa_id: getDeterministicUUID(reward.id),
        status_resgate: newRedemption.status_resgate,
        data_resgate: newRedemption.data_resgate
      });
      const syncYouthPoints = supabase!.from('jovens')
        .update({ pontos_gamificacao: youth.pontos_gamificacao })
        .eq('id', getDeterministicUUID(youth.id));
      const syncRewardStock = supabase!.from('recompensas')
        .update({ estoque: reward.estoque })
        .eq('id', getDeterministicUUID(reward.id));

      Promise.all([syncRedemption, syncYouthPoints, syncRewardStock]).then(() => {
        console.log('Descubra Hub: Resgate sincronizado com o Supabase!');
      }).catch(err => {
        console.error('Descubra Hub: Erro ao sincronizar resgate:', err);
      });
    }

    return { success: true };
  }

  getAuditLogs(): AuditLog[] {
    return this.getItem<AuditLog[]>('descubra_audits')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  logAudit(usuario: string, acao: string, tabela: string, detalhes: string) {
    const list = this.getAuditLogs();
    const newLog: AuditLog = {
      id: 'a_' + Math.random().toString(36).substr(2, 9),
      usuario_nome: usuario,
      acao,
      tabela,
      detalhes,
      created_at: new Date().toISOString()
    };
    list.push(newLog);
    this.setItem('descubra_audits', list);

    if (isLiveMode()) {
      supabase!.from('auditoria_logs').insert({
        id: getDeterministicUUID(newLog.id),
        usuario_nome: usuario,
        acao,
        tabela,
        detalhes,
        created_at: newLog.created_at
      }).then(({ error }) => {
        if (error) console.error('Error syncing audit log to Supabase:', error.message || error);
      });
    }
  }

  // --- DATA SYNCING BACKUPS ---

  exportJSON(): string {
    const backup: Record<string, any> = {};
    const keys = [
      'descubra_unidades', 'descubra_tecnicos', 'descubra_recompensas',
      'descubra_empresas', 'descubra_vagas', 'descubra_jovens',
      'descubra_vulnerabilidades', 'descubra_acompanhamentos',
      'descubra_referrals', 'descubra_resgates', 'descubra_audits',
      'descubra_depoimentos'
    ];
    keys.forEach(k => {
      backup[k] = this.getItem(k);
    });
    return JSON.stringify(backup, null, 2);
  }

  importJSON(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      const keys = [
        'descubra_unidades', 'descubra_tecnicos', 'descubra_recompensas',
        'descubra_empresas', 'descubra_vagas', 'descubra_jovens',
        'descubra_vulnerabilidades', 'descubra_acompanhamentos',
        'descubra_referrals', 'descubra_resgates', 'descubra_audits',
        'descubra_depoimentos'
      ];
      keys.forEach(k => {
        if (data[k]) {
          this.setItem(k, data[k]);
        }
      });
      this.logAudit('Sistema', 'Restauração Backup', 'Geral', 'Banco de dados restaurado via arquivo JSON.');
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  exportCSV(): string {
    const list = this.getYouthList();
    const headers = ['Nome Completo', 'CPF', 'Data de Nascimento', 'Gênero', 'Raça/Cor', 'Bairro', 'Escolaridade', 'Status Atual', 'Vulnerabilidade Score', 'Ano Indicação'];
    const rows = list.map(y => [
      `"${y.nome_completo.replace(/"/g, '""')}"`,
      `"${y.cpf}"`,
      `"${y.data_nascimento}"`,
      `"${y.sexo}"`,
      `"${y.cor_raca}"`,
      `"${y.bairro}"`,
      `"${y.escolaridade}"`,
      `"${y.status_atual}"`,
      y.score_vulnerabilidade,
      y.ano_indicacao
    ]);
    
    // Excel standard UTF-8 BOM
    return '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  // --- STATISTICAL GRAPH ENGINE FOR DIAGNOSTICS ---

  getDiagnostics(cidade: string = 'Pirapora') {
    const list = this.getYouthList().filter(y => y.cidade === cidade);
    const vulns = this.getYouthVulnerabilities();
    const acomps = this.getFollowUpLogs();

    // 1. Core counters
    const totalJovens = list.length;
    const pendentes = list.filter(y => y.status_atual === 'Pendente').length;
    const emCurso = list.filter(y => y.status_atual === 'Em Curso').length;
    const alertas = list.filter(y => y.status_atual === 'Alerta').length;
    const evadidos = list.filter(y => y.status_atual === 'Evadido').length;
    const concluidos = list.filter(y => y.status_atual === 'Concluído').length;
    const contratados = list.filter(y => y.status_atual === 'Contratado').length;

    // Rates
    const taxaConclusao = totalJovens > 0 ? Math.round(((concluidos + contratados) / totalJovens) * 100) : 0;
    const taxaEmpregabilidade = totalJovens > 0 ? Math.round((contratados / totalJovens) * 100) : 0;

    // 2. Indicators by Referral Unit
    const unidades = this.getUnidades();
    const unitStats: Record<string, number> = {};
    unidades.forEach(u => {
      unitStats[u.nome] = list.filter(y => y.indicado_por_unidade === u.id).length;
    });

    // 3. Historical Series (evolution)
    const years = Array.from(new Set(list.map(y => y.ano_indicacao))).sort();
    const historyStats: Record<number, number> = {};
    years.forEach(yr => {
      historyStats[yr] = list.filter(y => y.ano_indicacao === yr).length;
    });

    // 4. Neighborhood distribution (Territorialization)
    const neighborhoodStats: Record<string, number> = {};
    list.forEach(y => {
      neighborhoodStats[y.bairro] = (neighborhoodStats[y.bairro] || 0) + 1;
    });

    // 5. Dropout reasons diagnostics
    const dropoutReasons: Record<string, number> = {};
    acomps.forEach(a => {
      if (a.status_momento === 'Evadido' && a.motivo_evasao) {
        dropoutReasons[a.motivo_evasao] = (dropoutReasons[a.motivo_evasao] || 0) + 1;
      }
    });

    // 6. Demographic details
    const genderStats = { M: 0, F: 0, Outro: 0 };
    const raceStats: Record<string, number> = {};
    list.forEach(y => {
      if (y.sexo in genderStats) genderStats[y.sexo]++;
      raceStats[y.cor_raca] = (raceStats[y.cor_raca] || 0) + 1;
    });

    return {
      counters: {
        total: totalJovens,
        pendentes,
        emCurso,
        alertas,
        evadidos,
        concluidos,
        contratados,
        taxaConclusao,
        taxaEmpregabilidade
      },
      referralUnits: unitStats,
      history: historyStats,
      neighborhoods: neighborhoodStats,
      dropoutReasons,
      demographics: {
        gender: genderStats,
        race: raceStats
      }
    };
  }

  getDepoimentos(): Depoimento[] {
    return this.getItem<Depoimento[]>('descubra_depoimentos');
  }

  saveDepoimento(dep: Depoimento): Depoimento {
    const list = this.getDepoimentos();
    const index = list.findIndex(d => d.id === dep.id);
    if (index > -1) {
      list[index] = dep;
    } else {
      list.push(dep);
    }
    this.setItem('descubra_depoimentos', list);

    if (isLiveMode()) {
      supabase!.from('depoimentos').upsert({
        id: getDeterministicUUID(dep.id),
        jovem_id: getDeterministicUUID(dep.jovem_id),
        titulo: dep.titulo,
        descricao: dep.descricao,
        imagens: dep.imagens || [],
        video_url: dep.video_url || null,
        status: dep.status,
        destaque: dep.destaque,
        feedback_tecnico: dep.feedback_tecnico || null,
        criado_em: dep.criado_em
      }).then(({ error }) => {
        if (error) console.error('Error syncing depoimento to Supabase:', error.message || error);
      });
    }

    return dep;
  }

  updateDepoimentoStatus(id: string, status: Depoimento['status'], feedback?: string) {
    const list = this.getDepoimentos();
    const idx = list.findIndex(d => d.id === id);
    if (idx > -1) {
      list[idx].status = status;
      if (feedback !== undefined) {
        list[idx].feedback_tecnico = feedback;
      }
      this.setItem('descubra_depoimentos', list);
      
      const statusLabel = status === 'aprovado' ? 'Aprovado' : status === 'rejeitado' ? 'Rejeitado' : 'Ajustes Solicitados';
      this.logAudit('Técnico', 'Moderação Depoimento', 'depoimentos', `Depoimento ID ${id} alterado para ${statusLabel}.`);

      if (isLiveMode()) {
        const updateData: any = { status };
        if (feedback !== undefined) updateData.feedback_tecnico = feedback;
        supabase!.from('depoimentos')
          .update(updateData)
          .eq('id', getDeterministicUUID(id))
          .then(({ error }) => {
            if (error) console.error('Error updating depoimento status in Supabase:', error.message || error);
          });
      }
    }
  }

  destacarDepoimento(id: string, destaque: boolean) {
    const list = this.getDepoimentos();
    const idx = list.findIndex(d => d.id === id);
    if (idx > -1) {
      list[idx].destaque = destaque;
      this.setItem('descubra_depoimentos', list);
      const actionLabel = destaque ? 'Destacado como Inspirador' : 'Removido destaque';
      this.logAudit('Técnico', 'Destaque Depoimento', 'depoimentos', `Depoimento ID ${id}: ${actionLabel}.`);

      if (isLiveMode()) {
        supabase!.from('depoimentos')
          .update({ destaque })
          .eq('id', getDeterministicUUID(id))
          .then(({ error }) => {
            if (error) console.error('Error updating depoimento destaque in Supabase:', error.message || error);
          });
      }
    }
  }
}

export const db = new LocalDB();
