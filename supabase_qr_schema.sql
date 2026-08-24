-- สร้างตารางสำหรับบันทึกประวัติการสร้าง QR Code
CREATE TABLE IF NOT EXISTS public.qr_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  building TEXT NOT NULL,
  room TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(building, room)
);

-- เปิดการใช้งาน RLS
ALTER TABLE public.qr_locations ENABLE ROW LEVEL SECURITY;

-- อนุญาตให้แอดมิน (ผู้ที่ล็อกอิน) ทำได้ทุกอย่าง
CREATE POLICY "Allow authenticated full access" 
ON public.qr_locations 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);
