-- Create Reports Table
CREATE TABLE public.reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    nickname TEXT,
    department TEXT NOT NULL,
    phone TEXT NOT NULL,
    building TEXT NOT NULL,
    room TEXT NOT NULL,
    location_id TEXT,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    image_urls TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'pending' NOT NULL,
    priority TEXT DEFAULT 'normal' NOT NULL,
    assigned_to UUID REFERENCES auth.users(id),
    notification_status TEXT DEFAULT 'pending' NOT NULL,
    timeline JSONB DEFAULT '[]'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Create policy for anyone to insert (Public can report)
CREATE POLICY "Allow public inserts on reports" 
ON public.reports 
FOR INSERT 
TO public 
WITH CHECK (true);

-- Create policy for public to select (Need this for the tracking page to read ticket status)
CREATE POLICY "Allow public select on reports" 
ON public.reports 
FOR SELECT 
TO public 
USING (true);

-- Admin can do everything (Using Service Role Key bypasses RLS anyway, but good practice to allow authenticated users)
CREATE POLICY "Allow authenticated full access" 
ON public.reports 
FOR ALL 
TO authenticated 
USING (true);

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update 'updated_at'
CREATE TRIGGER update_reports_updated_at
    BEFORE UPDATE ON public.reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
