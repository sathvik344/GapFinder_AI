-- Enable pgvector extension for dense embedding similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Documents Table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('syllabus', 'textbook', 'notes', 'past_paper')),
    page_count INTEGER DEFAULT 1,
    file_size BIGINT DEFAULT 0,
    chunk_count INTEGER DEFAULT 0,
    is_sample BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document Chunks Table with Vector Embeddings
CREATE TABLE IF NOT EXISTS public.document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    document_name TEXT NOT NULL,
    category TEXT NOT NULL,
    page_number INTEGER NOT NULL DEFAULT 1,
    section_title TEXT,
    content TEXT NOT NULL,
    token_estimate INTEGER DEFAULT 0,
    embedding VECTOR(768),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- HNSW Vector Index for sub-millisecond approximate nearest neighbor cosine search
CREATE INDEX IF NOT EXISTS document_chunks_embedding_hnsw_idx 
ON public.document_chunks 
USING hnsw (embedding vector_cosine_ops);

-- Topics Table
CREATE TABLE IF NOT EXISTS public.topics (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL DEFAULT 'Computer Networks',
    name TEXT NOT NULL,
    unit TEXT NOT NULL,
    description TEXT,
    exam_weightage TEXT CHECK (exam_weightage IN ('High', 'Medium', 'Low')),
    target_score INTEGER DEFAULT 80,
    current_score INTEGER DEFAULT 0,
    questions_attempted INTEGER DEFAULT 0,
    questions_correct NUMERIC DEFAULT 0,
    mastery_level TEXT CHECK (mastery_level IN ('weak', 'medium', 'strong', 'untested')),
    subtopics TEXT[] DEFAULT '{}',
    last_assessed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz Attempts Table
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    total_questions INTEGER NOT NULL,
    correct_count INTEGER NOT NULL,
    overall_score NUMERIC NOT NULL,
    topic_breakdown JSONB NOT NULL,
    evaluations JSONB NOT NULL
);

-- Revision Plans Table
CREATE TABLE IF NOT EXISTS public.revision_plans (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    exam_date DATE NOT NULL,
    days_remaining INTEGER NOT NULL,
    daily_hours_available NUMERIC NOT NULL,
    total_study_hours_available NUMERIC NOT NULL,
    strategy_summary TEXT,
    weak_topic_hours NUMERIC,
    medium_topic_hours NUMERIC,
    strong_topic_hours NUMERIC,
    daily_schedules JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cosine Distance Vector Search Function
CREATE OR REPLACE FUNCTION match_document_chunks (
  query_embedding VECTOR(768),
  match_count INT DEFAULT 5,
  min_similarity FLOAT DEFAULT 0.0
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  document_name TEXT,
  category TEXT,
  page_number INTEGER,
  section_title TEXT,
  content TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.document_id,
    dc.document_name,
    dc.category,
    dc.page_number,
    dc.section_title,
    dc.content,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM public.document_chunks dc
  WHERE 1 - (dc.embedding <=> query_embedding) >= min_similarity
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Enable Row Level Security (RLS)
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revision_plans ENABLE ROW LEVEL SECURITY;

-- Policies for Authenticated Users
CREATE POLICY "Users can manage their own documents" ON public.documents
    FOR ALL USING (auth.uid() = user_id OR is_sample = true);

CREATE POLICY "Users can view chunks of accessible documents" ON public.document_chunks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.documents d 
            WHERE d.id = document_chunks.document_id 
            AND (d.user_id = auth.uid() OR d.is_sample = true)
        )
    );

CREATE POLICY "Users can manage their own topics" ON public.topics
    FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can manage their own quiz attempts" ON public.quiz_attempts
    FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can manage their own revision plans" ON public.revision_plans
    FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);
