# SmartFix Campus 🏫🔧

ระบบบริหารจัดการงานแจ้งซ่อมภายในสถานศึกษาอัจฉริยะ (Smart Maintenance Management System for Educational Institutions) ช่วยให้การแจ้งซ่อมและติดตามงานภายในมหาวิทยาลัยหรือโรงเรียนเป็นเรื่องง่าย เป็นระบบที่ทันสมัย รองรับการใช้งานผ่านมือถือเป็นหลัก พร้อมระบบหลังบ้านสำหรับผู้ดูแล

## 🌟 ฟีเจอร์หลัก (Features)

- 📱 **Mobile-first Public Report Form**: หน้าจอแจ้งซ่อมที่ออกแบบมาเพื่อมือถือโดยเฉพาะ ใช้งานง่าย
- 📸 **QR Code Location System**: สแกน QR Code ประจำจุดเพื่อแจ้งซ่อม ระบบจะกรอกสถานที่ให้โดยอัตโนมัติ
- 🖼️ **Image Upload**: อัปโหลดรูปภาพประกอบการแจ้งซ่อม พร้อมระบบบีบอัดภาพ (Cloudinary)
- 🎫 **Ticket Tracking System**: ระบบติดตามสถานะงานซ่อมสำหรับผู้แจ้ง พร้อม Timeline แสดงความคืบหน้า
- 💬 **LINE Group Notifications**: แจ้งเตือนเมื่อมีการแจ้งซ่อมใหม่เข้ากลุ่ม LINE ของทีมช่าง
- 🔐 **Secure Admin Dashboard**: ระบบหลังบ้านสำหรับผู้ดูแล (Admin) และทีมช่าง (เข้าสู่ระบบด้วยอีเมล/รหัสผ่าน)
- 📊 **Real-time Analytics**: หน้า Dashboard สรุปสถิติงานซ่อม สถานะ และประเภทงาน
- ⭐ **Starred Tickets**: ระบบปักหมุดงานซ่อมที่สำคัญ

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

- **Frontend**: Next.js (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui
- **Backend/API**: Next.js Route Handlers
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Cloudinary (สำหรับจัดการรูปภาพ) / Supabase Storage (สำหรับไฟล์อื่นๆ)
- **Notifications**: LINE Messaging API
- **Deployment**: Vercel

## 📂 โครงสร้างโปรเจกต์ (Folder Structure)

```text
src/
├── app/                  # Next.js App Router (หน้าเว็บต่างๆ)
│   ├── admin/            # ระบบหลังบ้านสำหรับแอดมิน (Dashboard, Tickets, QR, etc.)
│   ├── api/              # API Routes (Auth, Feedback, Reports, etc.)
│   ├── report/           # หน้าแจ้งซ่อมสำหรับผู้ใช้งานทั่วไป
│   └── track/            # หน้าติดตามสถานะงานซ่อม
├── components/           # React Components
│   ├── admin/            # Components สำหรับระบบหลังบ้าน
│   ├── layout/           # Components โครงสร้างหน้าเว็บ (Navbar, etc.)
│   ├── report/           # Components สำหรับฟอร์มแจ้งซ่อม
│   ├── ticket/           # Components สำหรับระบบติดตามงาน
│   └── ui/               # UI Components พื้นฐาน (shadcn/ui)
├── lib/                  # Utility functions และการเชื่อมต่อบริการภายนอก (Supabase, Cloudinary)
└── types/                # TypeScript Interfaces/Types
```

## ⚙️ การติดตั้งและตั้งค่าโปรเจกต์ (Installation & Setup)

### 1. สิ่งที่ต้องเตรียม
- Node.js (เวอร์ชัน 18 ขึ้นไป)
- บัญชี [Supabase](https://supabase.com)
- บัญชี [Cloudinary](https://cloudinary.com)
- บัญชี [LINE Developers](https://developers.line.biz/)

### 2. โคลนโปรเจกต์และติดตั้ง Dependencies
```bash
git clone <repository-url>
cd CampusFix
npm install
```

### 3. ตั้งค่า Database (Supabase)
ให้เข้าไปที่หน้า SQL Editor ในโปรเจกต์ Supabase ของคุณ และรันสคริปต์ SQL ต่อไปนี้ตามลำดับ (ไฟล์อยู่ในโฟลเดอร์ root ของโปรเจกต์):
1. `supabase_schema.sql` (สร้างตารางหลัก)
2. `supabase_qr_schema.sql` (สร้างตารางสำหรับระบบ QR Code)
3. `supabase_feedback_schema.sql` (สร้างตารางสำหรับระบบความพึงพอใจ)
4. `supabase_add_starred.sql` (เพิ่มฟีเจอร์ปักหมุด)
5. `supabase_storage_policy.sql` (ตั้งค่าสิทธิ์การเข้าถึงไฟล์)

### 4. ตั้งค่า Environment Variables
คัดลอกไฟล์ `.env.example` เป็น `.env.local` และกรอกข้อมูลให้ครบถ้วน:
```bash
cp .env.example .env.local
```
**ตัวอย่าง `.env.local` ที่ต้องกรอก:**
- `NEXT_PUBLIC_APP_URL`: URL ของเว็บไซต์คุณ (เช่น http://localhost:3000)
- **Supabase**: `NEXT_PUBLIC_SUPABASE_URL` และ `NEXT_PUBLIC_SUPABASE_ANON_KEY` (จาก Project Settings -> API)
- **Cloudinary**: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- **LINE**: `LINE_CHANNEL_ACCESS_TOKEN`, `LINE_GROUP_ID` (สำหรับแจ้งเตือน)

*(หมายเหตุ: เนื่องจากเพิ่งมีการย้ายจาก Firebase มาใช้ Supabase หากมีค่าของ Firebase หลงเหลืออยู่ สามารถลบออกหรือข้ามไปได้เลย)*

### 5. รันโปรเจกต์
```bash
npm run dev
```
เปิดเบราว์เซอร์ไปที่ `http://localhost:3000`

---

## 📖 คู่มือการใช้งาน (Usage Guide)

### สำหรับผู้ใช้งานทั่วไป (นักเรียน, นักศึกษา, บุคลากร)
1. **การแจ้งซ่อม**: 
   - เข้าไปที่หน้าแรก หรือเมนู "แจ้งปัญหา" (`/report`)
   - หรือสแกน QR Code ที่แปะอยู่ตามจุดต่างๆ ระบบจะระบุสถานที่ให้อัตโนมัติ
   - กรอกข้อมูลปัญหา, ถ่ายรูป/อัปโหลดรูปภาพ, เลือกประเภทงาน และกดส่ง
2. **การติดตามงาน**:
   - เมื่อแจ้งซ่อมเสร็จ ระบบจะให้ **รหัสติดตามงาน (Ticket ID)** เช่น `TKT-1234`
   - เข้าไปที่เมนู "ติดตามสถานะ" (`/track`) และกรอกรหัสเพื่อดูความคืบหน้า

### สำหรับผู้ดูแลระบบ (Admin / ทีมช่าง)
1. **เข้าสู่ระบบ**: 
   - ไปที่ `/admin/login` (ต้องสร้างผู้ใช้ใน Supabase Auth ก่อนผ่านหน้าเว็บ Supabase)
2. **Dashboard** (`/admin/dashboard`):
   - ดูสถิติภาพรวม งานที่รอตรวจสอบ งานกำลังดำเนินการ และงานที่เสร็จแล้ว
3. **จัดการงานซ่อม** (`/admin/tickets`):
   - ดูรายการงานทั้งหมด สามารถกดปักหมุด (Star) งานที่สำคัญ
   - คลิกเข้าไปดูรายละเอียดงาน เปลี่ยนสถานะ (Pending -> In Progress -> Resolved)
   - เพิ่มบันทึกการทำงานของช่าง
4. **ระบบจัดการสถานที่ (QR Code)** (`/admin/locations` หรือ `/admin/qr`):
   - สร้างจุดแจ้งซ่อมใหม่ และพิมพ์ QR Code ไปแปะตามสถานที่ต่างๆ

## 🚀 การ Deploy (Deployment)
แนะนำให้ Deploy ผ่าน **Vercel**
1. Push โค้ดขึ้น GitHub
2. นำเข้า Repository ใน Vercel
3. อย่าลืมตั้งค่า Environment Variables ทั้งหมดในหน้า Settings ของ Vercel
4. กด Deploy!
