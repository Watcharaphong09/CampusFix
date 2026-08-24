
-- Add is_starred column to reports
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS is_starred BOOLEAN DEFAULT false;
