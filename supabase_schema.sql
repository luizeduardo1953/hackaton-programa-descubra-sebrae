-- ── PROGRAMA DESCUBRA - PRODUCTION DATABASE SCHEMA ──────────────────────
-- Provisioning script for Supabase PostgreSQL database
-- Includes RLS policies, indexes, audit triggers, and automatic timestamps.

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ────────────────────────────────────────────────────────────────
-- 1. TABLE: depoimentos
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.depoimentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jovem_id UUID NOT NULL, -- references main youth table
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    imagens TEXT[] DEFAULT '{}', -- Array of image URLs
    video_url VARCHAR(512),
    status VARCHAR(50) DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado', 'ajustes')),
    destaque BOOLEAN DEFAULT FALSE,
    feedback_tecnico TEXT,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing for rapid queries by youth and status
CREATE INDEX IF NOT EXISTS idx_depoimentos_jovem_id ON public.depoimentos(jovem_id);
CREATE INDEX IF NOT EXISTS idx_depoimentos_status ON public.depoimentos(status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.depoimentos ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow read access to anyone" ON public.depoimentos
    FOR SELECT USING (true);

CREATE POLICY "Allow youth to insert testimonials" ON public.depoimentos
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow technicians to update testimonials (moderation)" ON public.depoimentos
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'tecnico')
        )
    );

-- ────────────────────────────────────────────────────────────────
-- 2. TABLE: acompanhamentos_fila
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.acompanhamentos_fila (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jovem_id UUID NOT NULL,
    tecnico_id UUID NOT NULL,
    tipo_contato VARCHAR(100) NOT NULL,
    relato_detalhado TEXT NOT NULL,
    status_momento VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_acompanhamentos_jovem ON public.acompanhamentos_fila(jovem_id);

ALTER TABLE public.acompanhamentos_fila ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read to authenticated users" ON public.acompanhamentos_fila
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow technicians to log follow-ups" ON public.acompanhamentos_fila
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'tecnico')
        )
    );

-- ────────────────────────────────────────────────────────────────
-- 3. TABLE: historico_scores
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.historico_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jovem_id UUID NOT NULL,
    score INT NOT NULL CHECK (score BETWEEN 0 AND 100),
    risco VARCHAR(20) NOT NULL CHECK (risco IN ('Baixo', 'Médio', 'Crítico')),
    mes_referencia VARCHAR(20) NOT NULL, -- e.g. "Janeiro", "Fevereiro"
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_historico_scores_jovem ON public.historico_scores(jovem_id);

ALTER TABLE public.historico_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read to authenticated" ON public.historico_scores
    FOR SELECT USING (auth.role() = 'authenticated');

-- ────────────────────────────────────────────────────────────────
-- 4. TABLE: matching_vagas
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.matching_vagas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jovem_id UUID NOT NULL,
    vaga_id UUID NOT NULL,
    score_matching INT NOT NULL CHECK (score_matching BETWEEN 0 AND 100),
    status VARCHAR(50) DEFAULT 'sugerido' CHECK (status IN ('sugerido', 'encaminhado', 'contratado', 'recusado')),
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_matching_jovem ON public.matching_vagas(jovem_id);
CREATE INDEX IF NOT EXISTS idx_matching_vaga ON public.matching_vagas(vaga_id);

ALTER TABLE public.matching_vagas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read and modification to technicians" ON public.matching_vagas
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'tecnico')
        )
    );

-- ────────────────────────────────────────────────────────────────
-- 5. AUDITING AND AUTOMATED TRIGGERS
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

CREATE TRIGGER trigger_update_matching_timestamp
    BEFORE UPDATE ON public.matching_vagas
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Audit log trigger function
CREATE TABLE IF NOT EXISTS public.auditoria_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tabela_nome VARCHAR(100) NOT NULL,
    operacao VARCHAR(20) NOT NULL,
    detalhes TEXT,
    executado_por UUID DEFAULT auth.uid(),
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.auditoria_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admins to read audit logs" ON public.auditoria_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

CREATE OR REPLACE FUNCTION public.audit_table_modifications()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.auditoria_logs (tabela_nome, operacao, detalhes)
    VALUES (TG_TABLE_NAME, TG_OP, 'Alteração realizada no ID ' || COALESCE(NEW.id::text, OLD.id::text));
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER audit_depoimentos_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.depoimentos
    FOR EACH ROW EXECUTE FUNCTION public.audit_table_modifications();
