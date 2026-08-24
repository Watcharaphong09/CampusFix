-- อนุญาตให้ทุกคน (public/anon) สามารถอัปโหลดไฟล์ (INSERT) ลงใน Bucket ชื่อ 'reports' ได้
CREATE POLICY "Allow public uploads to reports bucket" 
ON storage.objects FOR INSERT TO public 
WITH CHECK (bucket_id = 'reports');

-- อนุญาตให้ทุกคนสามารถดูรูปภาพ (SELECT) ใน Bucket ชื่อ 'reports' ได้
CREATE POLICY "Allow public read from reports bucket" 
ON storage.objects FOR SELECT TO public 
USING (bucket_id = 'reports');
