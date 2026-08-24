"use client";
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PROBLEM_CATEGORIES } from '@/types/report';
import { ImagePlus, X, AlertCircle, Send, MapPin } from 'lucide-react';
import { toast } from 'sonner';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const formSchema = z.object({
  firstName: z.string().min(1, 'กรุณากรอกชื่อ'),
  lastName: z.string().min(1, 'กรุณากรอกนามสกุล'),
  nickname: z.string().optional(),
  department: z.string().min(1, 'กรุณาเลือกระดับชั้นปี'),
  phone: z.string().regex(/^0\d{8,9}$/, 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง (ขึ้นต้นด้วย 0 และมี 9-10 หลัก)'),
  building: z.string().min(1, 'กรุณากรอกอาคาร'),
  room: z.string().min(1, 'กรุณากรอกห้อง'),
  category: z.string().min(1, 'กรุณาเลือกประเภทปัญหา'),
  description: z.string().min(5, 'กรุณาระบุรายละเอียดปัญหาอย่างน้อย 5 ตัวอักษร'),
});

type FormValues = z.infer<typeof formSchema>;

export default function ReportForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locationParam = searchParams.get('location');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      nickname: '',
      department: '',
      phone: '',
      building: '',
      room: '',
      category: '',
      description: '',
    },
  });

  useEffect(() => {
    if (locationParam) {
      const parts = locationParam.split('-');
      if (parts.length >= 2) {
        form.setValue('building', parts[0]);
        form.setValue('room', parts.slice(1).join('-'));
      } else {
        form.setValue('building', locationParam);
      }
    }
  }, [locationParam, form]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const selectedFiles = Array.from(e.target.files);
    setImageError(null);
    
    if (images.length + selectedFiles.length > 5) {
      setImageError('สามารถอัปโหลดรูปภาพได้สูงสุด 5 รูป');
      return;
    }
    
    const validFiles: File[] = [];
    const newPreviews: string[] = [];
    
    for (const file of selectedFiles) {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        setImageError('รองรับเฉพาะไฟล์ JPG, JPEG, PNG และ WEBP เท่านั้น');
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setImageError('ขนาดไฟล์ต้องไม่เกิน 5MB ต่อรูป');
        return;
      }
      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }
    
    setImages(prev => [...prev, ...validFiles]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      // อัปโหลดรูปภาพไปยัง Supabase Storage
      const uploadedUrls: string[] = [];
      if (images.length > 0) {
        const { supabase } = await import('@/lib/supabase/client');
        for (const file of images) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `ticket-images/${fileName}`;
          
          const { error: uploadError } = await supabase.storage
            .from('reports')
            .upload(filePath, file);
            
          if (uploadError) {
            console.error('Upload error:', uploadError);
            throw new Error('ไม่สามารถอัปโหลดรูปภาพได้');
          }
          
          const { data: publicUrlData } = supabase.storage
            .from('reports')
            .getPublicUrl(filePath);
            
          uploadedUrls.push(publicUrlData.publicUrl);
        }
      }
      
      const payload = { ...data, imageUrls: uploadedUrls };
      
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit report');
      }

      toast.success(`ส่งข้อมูลสำเร็จ! รหัสแจ้งซ่อมของคุณคือ: ${result.ticketId}`);
      form.reset();
      setImages([]);
      setImagePreviews([]);
      
      router.push(`/track?id=${result.ticketId}`);
      
    } catch (error) {
      console.error(error);
      toast.error('เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  const { register, handleSubmit, control, formState: { errors } } = form;

  return (
    <Card className="shadow-lg border-0 bg-white/50 backdrop-blur-sm overflow-hidden p-0 max-w-3xl mx-auto">
      <div className="bg-slate-900 text-white p-6 md:p-8">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MapPin className="h-6 w-6 text-cyan-400" />
          แจ้งซ่อม
        </h2>
        <p className="text-slate-300 mt-1">
          กรุณากรอกข้อมูลให้ครบถ้วนเพื่อให้เจ้าหน้าที่ดำเนินการได้รวดเร็ว
        </p>
      </div>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">ข้อมูลผู้แจ้ง</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">ชื่อ <span className="text-red-500">*</span></Label>
                <Input id="firstName" {...register('firstName')} placeholder="สมชาย" className={errors.firstName ? 'border-red-500' : ''} />
                {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">นามสกุล <span className="text-red-500">*</span></Label>
                <Input id="lastName" {...register('lastName')} placeholder="ใจดี" className={errors.lastName ? 'border-red-500' : ''} />
                {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nickname">ชื่อเล่น</Label>
                <Input id="nickname" {...register('nickname')} placeholder="ชาย" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">ระดับชั้นปี <span className="text-red-500">*</span></Label>
                <Controller
                  name="department"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className={errors.department ? 'border-red-500' : ''}>
                        <SelectValue placeholder="เลือกระดับชั้นปี" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ปวช. 1">ปวช. 1</SelectItem>
                        <SelectItem value="ปวช. 2">ปวช. 2</SelectItem>
                        <SelectItem value="ปวช. 3">ปวช. 3</SelectItem>
                        <SelectItem value="ปวส. 1">ปวส. 1</SelectItem>
                        <SelectItem value="ปวส. 2">ปวส. 2</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.department && <p className="text-red-500 text-sm">{errors.department.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">เบอร์โทรศัพท์ <span className="text-red-500">*</span></Label>
                <Input id="phone" {...register('phone')} placeholder="0812345678" className={errors.phone ? 'border-red-500' : ''} />
                {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-lg font-semibold text-slate-800">สถานที่</h3>
              {locationParam && (
                <Button type="button" variant="outline" size="sm" onClick={() => {
                  form.setValue('building', '');
                  form.setValue('room', '');
                }}>
                  เปลี่ยนสถานที่
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="building">อาคาร <span className="text-red-500">*</span></Label>
                <Input id="building" {...register('building')} placeholder="อาคาร A" className={errors.building ? 'border-red-500' : ''} />
                {errors.building && <p className="text-red-500 text-sm">{errors.building.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="room">ห้อง <span className="text-red-500">*</span></Label>
                <Input id="room" {...register('room')} placeholder="301" className={errors.room ? 'border-red-500' : ''} />
                {errors.room && <p className="text-red-500 text-sm">{errors.room.message}</p>}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">รายละเอียดปัญหา</h3>
            <div className="space-y-2">
              <Label htmlFor="category">ประเภท <span className="text-red-500">*</span></Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                      <SelectValue placeholder="เลือกประเภทปัญหา" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROBLEM_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">รายละเอียด <span className="text-red-500">*</span></Label>
              <Textarea 
                id="description" 
                {...register('description')} 
                placeholder="อธิบายปัญหาที่พบ..." 
                rows={4}
                className={errors.description ? 'border-red-500' : ''} 
              />
              {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 border-b pb-2 flex items-baseline justify-between">
              <span>รูปภาพประกอบ <span className="text-sm font-normal text-slate-500">(สูงสุด 5 รูป)</span></span>
              <span className="text-xs font-normal text-slate-400">ขนาดไม่เกิน 5MB ต่อรูป</span>
            </h3>
            
            {imageError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>ข้อผิดพลาด</AlertTitle>
                <AlertDescription>{imageError}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {imagePreviews.map((src, index) => (
                <div key={index} className="relative group aspect-square rounded-md overflow-hidden border border-slate-200">
                  <img src={src} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              
              {images.length < 5 && (
                <Label 
                  htmlFor="image-upload" 
                  className="flex flex-col items-center justify-center aspect-square rounded-md border-2 border-dashed border-slate-300 hover:border-cyan-500 hover:bg-cyan-50 cursor-pointer transition-colors"
                >
                  <ImagePlus className="h-8 w-8 text-slate-400 mb-2" />
                  <span className="text-sm text-slate-500">เพิ่มรูปภาพ</span>
                  <Input 
                    id="image-upload" 
                    type="file" 
                    accept="image/jpeg, image/jpg, image/png, image/webp" 
                    multiple 
                    className="hidden" 
                    onChange={handleImageChange}
                  />
                </Label>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white" disabled={isSubmitting}>
            {isSubmitting ? 'กำลังส่งข้อมูล...' : <><Send className="mr-2 h-4 w-4" /> ส่งข้อมูลแจ้งซ่อม</>}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
