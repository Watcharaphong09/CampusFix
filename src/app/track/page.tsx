import { Suspense } from 'react';
import TrackingSearch from '@/components/ticket/TrackingSearch';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function TrackPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10 space-y-4">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            ติดตามสถานะแจ้งซ่อม
          </h1>
          <p className="mt-4 text-lg text-slate-500">
            กรุณากรอกรหัสแจ้งซ่อม (Ticket ID) เพื่อดูสถานะล่าสุด
          </p>
          <div className="pt-2">
            <Link href="/report">
              <Button className="bg-cyan-600 hover:bg-cyan-700 text-white rounded-full px-6">
                <PlusCircle className="w-5 h-5 mr-2" /> แจ้งซ่อมใหม่
              </Button>
            </Link>
          </div>
        </div>
        
        <Suspense fallback={<div className="text-center">กำลังโหลด...</div>}>
          <TrackingSearch />
        </Suspense>
      </div>
    </div>
  );
}
