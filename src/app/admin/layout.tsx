import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { LayoutDashboard, QrCode, LogOut, BarChart3, Star, ClipboardList, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-cyan-400">SmartFix Admin</h2>
          <p className="text-xs text-slate-400 mt-1 truncate">{user.email}</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin/dashboard" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition">
            <LayoutDashboard className="w-5 h-5 text-slate-300" />
            <span>หน้าแรก (Dashboard)</span>
          </Link>
          <Link href="/admin/tickets" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition">
            <ClipboardList className="w-5 h-5 text-slate-300" />
            <span>รายการแจ้งซ่อมทั้งหมด</span>
          </Link>
          <Link href="/admin/tickets/starred" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition">
            <Star className="w-5 h-5 text-yellow-400" />
            <span>งานที่ปักหมุดไว้</span>
          </Link>
          <Link href="/admin/analytics" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition">
            <BarChart3 className="w-5 h-5 text-slate-300" />
            <span>สถิติ (Analytics)</span>
          </Link>
          <Link href="/admin/qr" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition">
            <QrCode className="w-5 h-5 text-slate-300" />
            <span>สร้าง QR Code</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link href="/" className="flex items-center px-4 py-2 w-full text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition">
            <Home className="w-5 h-5 mr-3" />
            กลับไปหน้าหลักของเว็บ
          </Link>
          <form action="/api/auth/signout" method="post">
            <Button variant="ghost" type="submit" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-950/30">
              <LogOut className="w-5 h-5 mr-3" />
              ออกจากระบบ
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
