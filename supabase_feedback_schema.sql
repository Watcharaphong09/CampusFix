-- Create Feedback Table
CREATE TABLE public.feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert" ON public.feedback FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public select" ON public.feedback FOR SELECT TO public USING (true);
CREATE POLICY "Allow authenticated full access" ON public.feedback FOR ALL TO authenticated USING (true);
