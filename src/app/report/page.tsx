import { Suspense } from 'react';
import ReportForm from '@/components/report/ReportForm';
import { Skeleton } from '@/components/ui/skeleton';

export default function ReportPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
            SmartFix <span className="text-cyan-600">Campus</span>
          </h1>
          <p className="mt-4 max-w-2xl text-xl text-slate-500 mx-auto">
            ระบบบริหารจัดการงานแจ้งซ่อมภายในสถานศึกษาอัจฉริยะ
          </p>
        </div>
        
        <Suspense fallback={<div className="flex justify-center"><Skeleton className="w-full max-w-2xl h-[800px] rounded-xl" /></div>}>
          <ReportForm />
        </Suspense>
      </div>
    </div>
  );
}
