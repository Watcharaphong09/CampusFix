"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClipboardEdit, Search, ShieldCheck } from 'lucide-react';

export default function PublicNav() {
  const pathname = usePathname();
  
  return (
    <>
      {/* Desktop Top Nav */}
      <nav className="hidden md:block bg-white/80 backdrop-blur-md border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-slate-800 tracking-tight">
                SmartFix <span className="text-cyan-600">Campus</span>
              </span>
            </div>
            <div className="flex items-center space-x-8">
              <Link href="/report" className={`flex items-center gap-2 font-medium transition ${pathname === '/report' ? 'text-cyan-600' : 'text-slate-500 hover:text-cyan-600'}`}>
                <ClipboardEdit className="w-5 h-5" /> แจ้งซ่อม
              </Link>
              <Link href="/track" className={`flex items-center gap-2 font-medium transition ${pathname === '/track' || pathname === '/' ? 'text-cyan-600' : 'text-slate-500 hover:text-cyan-600'}`}>
                <Search className="w-5 h-5" /> ติดตามสถานะ
              </Link>
              <Link href="/admin/login" className="flex items-center gap-2 font-medium text-slate-300 hover:text-slate-500 transition">
                <ShieldCheck className="w-5 h-5" /> สำหรับเจ้าหน้าที่
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50 pb-safe shadow-[0_-2px_20px_rgba(0,0,0,0.08)]">
        <div className="flex justify-around items-center h-16">
          <Link href="/report" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname === '/report' ? 'text-cyan-600' : 'text-slate-400'}`}>
            <ClipboardEdit className="w-6 h-6" />
            <span className="text-[10px] font-medium">แจ้งซ่อม</span>
          </Link>
          <Link href="/track" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname === '/track' || pathname === '/' ? 'text-cyan-600' : 'text-slate-400'}`}>
            <Search className="w-6 h-6" />
            <span className="text-[10px] font-medium">ติดตามสถานะ</span>
          </Link>
          <Link href="/admin/login" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname.startsWith('/admin') ? 'text-cyan-600' : 'text-slate-400'}`}>
            <ShieldCheck className="w-6 h-6" />
            <span className="text-[10px] font-medium">เจ้าหน้าที่</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
