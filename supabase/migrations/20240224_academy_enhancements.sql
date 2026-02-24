-- 20240224_academy_enhancements.sql
-- Enhances the Academy module with access tiers, video/PDF, and quizzes

-- 1. Add access_level + price to courses
ALTER TABLE public.courses
    ADD COLUMN IF NOT EXISTS access_level TEXT DEFAULT 'STANDARD'
    CHECK (access_level IN ('PUBLIC', 'STANDARD', 'PREMIUM', 'PAID'));

ALTER TABLE public.courses
    ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT NULL;

ALTER TABLE public.courses
    ADD COLUMN IF NOT EXISTS order_index INT DEFAULT 0;

-- 2. Enhance lessons table
ALTER TABLE public.lessons
    ADD COLUMN IF NOT EXISTS video_url TEXT DEFAULT NULL;

ALTER TABLE public.lessons
    ADD COLUMN IF NOT EXISTS pdf_url TEXT DEFAULT NULL;

ALTER TABLE public.lessons
    ADD COLUMN IF NOT EXISTS duration_minutes INT DEFAULT 0;

ALTER TABLE public.lessons
    ADD COLUMN IF NOT EXISTS order_index INT DEFAULT 0;

ALTER TABLE public.lessons
    ADD COLUMN IF NOT EXISTS access_level TEXT DEFAULT 'INHERIT'
    CHECK (access_level IN ('INHERIT', 'PUBLIC', 'STANDARD', 'PREMIUM', 'PAID'));

-- 3. Create quizzes table
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL DEFAULT '[]',
    -- options format: [{"text": "Option A", "correct": true}, {"text": "Option B", "correct": false}]
    explanation TEXT DEFAULT NULL,
    order_index INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create quiz_attempts table for student progress tracking
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    selected_option_index INT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT false,
    attempted_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, quiz_id)
);

-- RLS: quizzes
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin manages quizzes" ON public.quizzes;
CREATE POLICY "Admin manages quizzes"
ON public.quizzes FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Verified users view quizzes" ON public.quizzes;
CREATE POLICY "Verified users view quizzes"
ON public.quizzes FOR SELECT TO authenticated
USING (
    public.is_admin(auth.uid()) OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND verification_status = 'APPROVED'
        AND status = 'ACTIVE'
    )
);

-- RLS: quiz_attempts
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own attempts" ON public.quiz_attempts;
CREATE POLICY "Users manage own attempts"
ON public.quiz_attempts FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin view all attempts" ON public.quiz_attempts;
CREATE POLICY "Admin view all attempts"
ON public.quiz_attempts FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_quizzes_lesson ON public.quizzes(lesson_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz ON public.quiz_attempts(quiz_id);

-- Update trigger for quizzes
CREATE OR REPLACE FUNCTION public.update_quizzes_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_quizzes_updated_at ON public.quizzes;
CREATE TRIGGER trg_quizzes_updated_at
BEFORE UPDATE ON public.quizzes
FOR EACH ROW EXECUTE FUNCTION public.update_quizzes_updated_at();

-- *** Supabase Storage Buckets (run via Dashboard or service_role) ***
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES
--   ('academy-videos', 'academy-videos', false, 524288000, ARRAY['video/mp4','video/webm']),
--   ('academy-pdfs', 'academy-pdfs', false, 52428800, ARRAY['application/pdf']);
