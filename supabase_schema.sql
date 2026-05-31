-- ── PROGRAMA DESCUBRA - COMPREHENSIVE PRODUCTION DATABASE SCHEMA ──────────────────────
-- Provisioning script for Supabase PostgreSQL database
-- Includes all 13 business tables, indexes, audit triggers, and permissive RLS policies.

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── DROP EXISTING OLD TABLES TO ENSURE CLEAN MIGRATION ──────────
DROP TABLE IF EXISTS public.resgates CASCADE;
DROP TABLE IF EXISTS public.recompensas CASCADE;
DROP TABLE IF EXISTS public.referrals CASCADE;
DROP TABLE IF EXISTS public.vagas CASCADE;
DROP TABLE IF EXISTS public.company_actions CASCADE;
DROP TABLE IF EXISTS public.empresas CASCADE;
DROP TABLE IF EXISTS public.acompanhamentos CASCADE;
DROP TABLE IF EXISTS public.vulnerabilidades CASCADE;
DROP TABLE IF EXISTS public.jovens CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.unidades CASCADE;
DROP TABLE IF EXISTS public.depoimentos CASCADE;
DROP TABLE IF EXISTS public.auditoria_logs CASCADE;
DROP TABLE IF EXISTS public.acompanhamentos_fila CASCADE;
DROP TABLE IF EXISTS public.historico_scores CASCADE;
DROP TABLE IF EXISTS public.matching_vagas CASCADE;

-- ────────────────────────────────────────────────────────────────
-- 1. TABLE: unidades
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.unidades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(100) NOT NULL, -- e.g. 'CRAS', 'CREAS', 'CECEP'
    endereco VARCHAR(255),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    cep VARCHAR(20),
    telefone VARCHAR(50),
    email VARCHAR(255),
    responsavel_nome VARCHAR(255),
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.unidades ENABLE ROW LEVEL SECURITY;

-- Permissive RLS Policies for Development & Client Anon Access
CREATE POLICY "Allow public select on unidades" ON public.unidades FOR SELECT USING (true);
CREATE POLICY "Allow public insert on unidades" ON public.unidades FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on unidades" ON public.unidades FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete on unidades" ON public.unidades FOR DELETE USING (true);


-- ────────────────────────────────────────────────────────────────
-- 2. TABLE: profiles (Técnicos / Administradores)
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(50),
    email VARCHAR(255),
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'tecnico', 'empresa', 'jovem')),
    unidade_id UUID REFERENCES public.unidades(id) ON DELETE SET NULL,
    cidade VARCHAR(100),
    telefone VARCHAR(50),
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public insert on profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on profiles" ON public.profiles FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete on profiles" ON public.profiles FOR DELETE USING (true);


-- ────────────────────────────────────────────────────────────────
-- 3. TABLE: jovens
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.jovens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome_completo VARCHAR(255) NOT NULL,
    sexo VARCHAR(10) CHECK (sexo IN ('M', 'F', 'Outro')),
    cor_raca VARCHAR(50) CHECK (cor_raca IN ('Branco', 'Pardo', 'Preto', 'Amarelo', 'Indígena')),
    escolaridade VARCHAR(100),
    cpf VARCHAR(50),
    data_nascimento DATE,
    cep VARCHAR(20),
    endereco VARCHAR(255),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    telefone VARCHAR(50),
    whatsapp VARCHAR(50),
    nome_responsavel VARCHAR(255),
    parentesco_responsavel VARCHAR(100),
    telefone_responsavel VARCHAR(50),
    pessoas_residencia INT DEFAULT 0,
    pessoas_trabalham INT DEFAULT 0,
    renda_familiar NUMERIC(10, 2) DEFAULT 0.00,
    status_atual VARCHAR(50) DEFAULT 'Pendente' CHECK (status_atual IN ('Pendente', 'Em Curso', 'Alerta', 'Evadido', 'Concluído', 'Contratado')),
    score_vulnerabilidade INT DEFAULT 0,
    indicado_por_unidade UUID REFERENCES public.unidades(id) ON DELETE SET NULL,
    cadastrado_por_tecnico UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    ano_indicacao INT,
    pontos_gamificacao INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    area_interesse VARCHAR(255),
    outra_area_interesse VARCHAR(255),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jovens_status ON public.jovens(status_atual);
CREATE INDEX IF NOT EXISTS idx_jovens_bairro ON public.jovens(bairro);
CREATE INDEX IF NOT EXISTS idx_jovens_unidade ON public.jovens(indicado_por_unidade);

ALTER TABLE public.jovens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on jovens" ON public.jovens FOR SELECT USING (true);
CREATE POLICY "Allow public insert on jovens" ON public.jovens FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on jovens" ON public.jovens FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete on jovens" ON public.jovens FOR DELETE USING (true);


-- ────────────────────────────────────────────────────────────────
-- 4. TABLE: vulnerabilidades
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.vulnerabilidades (
    jovem_id UUID PRIMARY KEY REFERENCES public.jovens(id) ON DELETE CASCADE,
    bolsa_familia BOOLEAN DEFAULT FALSE,
    cad_unico BOOLEAN DEFAULT FALSE,
    medida_socioeducativa BOOLEAN DEFAULT FALSE,
    deficiencia BOOLEAN DEFAULT FALSE,
    deficiencia_qual VARCHAR(255),
    acesso_internet BOOLEAN DEFAULT TRUE,
    computador BOOLEAN DEFAULT TRUE,
    trabalhou_antes BOOLEAN DEFAULT TRUE,
    abandonou_escola BOOLEAN DEFAULT FALSE,
    dificuldade_transporte BOOLEAN DEFAULT FALSE,
    acompanhamento_psicologico BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.vulnerabilidades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on vulnerabilidades" ON public.vulnerabilidades FOR SELECT USING (true);
CREATE POLICY "Allow public insert on vulnerabilidades" ON public.vulnerabilidades FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on vulnerabilidades" ON public.vulnerabilidades FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete on vulnerabilidades" ON public.vulnerabilidades FOR DELETE USING (true);


-- ────────────────────────────────────────────────────────────────
-- 5. TABLE: acompanhamentos
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.acompanhamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jovem_id UUID NOT NULL REFERENCES public.jovens(id) ON DELETE CASCADE,
    tecnico_name VARCHAR(255) NOT NULL,
    tipo_contato VARCHAR(100) NOT NULL,
    relato_detalhado TEXT NOT NULL,
    status_momento VARCHAR(50) NOT NULL,
    motivo_evasao VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_acompanhamentos_jovem ON public.acompanhamentos(jovem_id);

ALTER TABLE public.acompanhamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on acompanhamentos" ON public.acompanhamentos FOR SELECT USING (true);
CREATE POLICY "Allow public insert on acompanhamentos" ON public.acompanhamentos FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on acompanhamentos" ON public.acompanhamentos FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete on acompanhamentos" ON public.acompanhamentos FOR DELETE USING (true);


-- ────────────────────────────────────────────────────────────────
-- 6. TABLE: empresas
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.empresas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255),
    cnpj VARCHAR(50),
    cep VARCHAR(20),
    endereco VARCHAR(255),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    responsavel_nome VARCHAR(255),
    telefone VARCHAR(50),
    email VARCHAR(255),
    pontos_engajamento INT DEFAULT 0,
    selo VARCHAR(50) DEFAULT 'Nenhum' CHECK (selo IN ('Ouro', 'Prata', 'Bronze', 'Nenhum')),
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on empresas" ON public.empresas FOR SELECT USING (true);
CREATE POLICY "Allow public insert on empresas" ON public.empresas FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on empresas" ON public.empresas FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete on empresas" ON public.empresas FOR DELETE USING (true);


-- ────────────────────────────────────────────────────────────────
-- 7. TABLE: company_actions
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.company_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    jovem_id UUID REFERENCES public.jovens(id) ON DELETE SET NULL,
    tipo VARCHAR(100) NOT NULL,
    pontos INT NOT NULL,
    data TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.company_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on company_actions" ON public.company_actions FOR SELECT USING (true);
CREATE POLICY "Allow public insert on company_actions" ON public.company_actions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on company_actions" ON public.company_actions FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete on company_actions" ON public.company_actions FOR DELETE USING (true);


-- ────────────────────────────────────────────────────────────────
-- 8. TABLE: vagas
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.vagas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    cargo VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- e.g. 'Estágio', 'Jovem Aprendiz', 'CLT'
    quantidade INT NOT NULL DEFAULT 1,
    horario VARCHAR(255),
    bolsa_auxilio NUMERIC(10, 2) DEFAULT 0.00,
    idade_minima INT,
    escolaridade_exigida VARCHAR(255),
    competencias_desejadas VARCHAR(255)[] DEFAULT '{}',
    status_vaga VARCHAR(50) DEFAULT 'Aberta' CHECK (status_vaga IN ('Aberta', 'Preenchida', 'Cancelada')),
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.vagas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on vagas" ON public.vagas FOR SELECT USING (true);
CREATE POLICY "Allow public insert on vagas" ON public.vagas FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on vagas" ON public.vagas FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete on vagas" ON public.vagas FOR DELETE USING (true);


-- ────────────────────────────────────────────────────────────────
-- 9. TABLE: referrals (Encaminhamentos de Jovens para Vagas)
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jovem_id UUID NOT NULL REFERENCES public.jovens(id) ON DELETE CASCADE,
    vaga_id UUID NOT NULL REFERENCES public.vagas(id) ON DELETE CASCADE,
    status VARCHAR(100) NOT NULL, -- e.g. 'Selecionado para Entrevista', 'Contratado', 'Recusado pela Empresa', 'Desistência'
    feedback_empresa TEXT,
    data_encaminhamento DATE DEFAULT CURRENT_DATE,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on referrals" ON public.referrals FOR SELECT USING (true);
CREATE POLICY "Allow public insert on referrals" ON public.referrals FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on referrals" ON public.referrals FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete on referrals" ON public.referrals FOR DELETE USING (true);


-- ────────────────────────────────────────────────────────────────
-- 10. TABLE: recompensas
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.recompensas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    custo_pontos INT NOT NULL,
    estoque INT DEFAULT 0,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.recompensas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on recompensas" ON public.recompensas FOR SELECT USING (true);
CREATE POLICY "Allow public insert on recompensas" ON public.recompensas FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on recompensas" ON public.recompensas FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete on recompensas" ON public.recompensas FOR DELETE USING (true);


-- ────────────────────────────────────────────────────────────────
-- 11. TABLE: resgates
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.resgates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jovem_id UUID NOT NULL REFERENCES public.jovens(id) ON DELETE CASCADE,
    recompensa_id UUID NOT NULL REFERENCES public.recompensas(id) ON DELETE CASCADE,
    status_resgate VARCHAR(100) DEFAULT 'Aguardando Entrega',
    data_resgate TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.resgates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on resgates" ON public.resgates FOR SELECT USING (true);
CREATE POLICY "Allow public insert on resgates" ON public.resgates FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on resgates" ON public.resgates FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete on resgates" ON public.resgates FOR DELETE USING (true);


-- ────────────────────────────────────────────────────────────────
-- 12. TABLE: depoimentos
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.depoimentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jovem_id UUID NOT NULL REFERENCES public.jovens(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    imagens TEXT[] DEFAULT '{}',
    video_url VARCHAR(512),
    status VARCHAR(50) DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado', 'ajustes')),
    destaque BOOLEAN DEFAULT FALSE,
    feedback_tecnico TEXT,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_depoimentos_jovem_id ON public.depoimentos(jovem_id);
CREATE INDEX IF NOT EXISTS idx_depoimentos_status ON public.depoimentos(status);

ALTER TABLE public.depoimentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on depoimentos" ON public.depoimentos FOR SELECT USING (true);
CREATE POLICY "Allow public insert on depoimentos" ON public.depoimentos FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on depoimentos" ON public.depoimentos FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete on depoimentos" ON public.depoimentos FOR DELETE USING (true);


-- ────────────────────────────────────────────────────────────────
-- 13. TABLE: auditoria_logs
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.auditoria_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_nome VARCHAR(100) NOT NULL,
    acao VARCHAR(100) NOT NULL,
    tabela VARCHAR(100) NOT NULL,
    detalhes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.auditoria_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on auditoria_logs" ON public.auditoria_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert on auditoria_logs" ON public.auditoria_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on auditoria_logs" ON public.auditoria_logs FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete on auditoria_logs" ON public.auditoria_logs FOR DELETE USING (true);


-- ────────────────────────────────────────────────────────────────
-- 14. AUDITING AND AUTOMATED TRIGGERS
-- ────────────────────────────────────────────────────────────────

-- Automatically update updated_at columns on change
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_depoimentos_timestamp
    BEFORE UPDATE ON public.depoimentos
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_update_jovens_timestamp
    BEFORE UPDATE ON public.jovens
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_update_vagas_timestamp
    BEFORE UPDATE ON public.vagas
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
