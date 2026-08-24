"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, QrCode, LogOut, BarChart3, Star, ClipboardList, Home, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';

const MENU_ITEMS = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'หน้าแรก (Dashboard)' },
  { href: '/admin/tickets', icon: ClipboardList, label: 'รายการแจ้งซ่อมทั้งหมด' },
  { href: '/admin/tickets/starred', icon: Star, label: 'งานที่ปักหมุดไว้' },
  { href: '/admin/analytics', icon: BarChart3, label: 'สถิติ (Analytics)' },
  { href: '/admin/qr', icon: QrCode, label: 'สร้าง QR Code' },
];

export default function AdminSidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // ตรวจสอบว่าหน้าปัจจุบันตรงกับเมนูไหน
  const isPathActive = (href: string) => {
    if (href === '/admin/dashboard') {
      return pathname === href;
    }
    return pathname === href || (pathname?.startsWith(href + '/') ?? false);
  };

  const NavLinks = () => (
    <nav className="flex-1 space-y-1 p-4">
      {MENU_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = isPathActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all active:scale-[0.97] ${
              isActive 
                ? 'bg-cyan-500/15 text-cyan-400 font-semibold' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : ''}`} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  const FooterLinks = () => (
    <div className="p-4 border-t border-slate-800 space-y-2 mt-auto">
      <Link 
        href="/" 
        className="flex items-center px-4 py-3 w-full text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all active:scale-[0.97]"
      >
        <Home className="w-5 h-5 mr-3" />
        กลับหน้าหลักเว็บ
      </Link>
      <form action="/api/auth/signout" method="post">
        <Button 
          variant="ghost" 
          type="submit" 
          className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-xl py-6 active:scale-[0.97] transition-all text-base"
        >
          <LogOut className="w-5 h-5 mr-3" />
          ออกจากระบบ
        </Button>
      </form>
    </div>
  );

  const UserHeader = () => (
    <div className="p-6 border-b border-slate-800">
      <h2 className="text-xl font-bold text-cyan-400">SmartFix Admin</h2>
      <p className="text-sm text-slate-400 mt-1 truncate">{userEmail}</p>
    </div>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 text-white shadow-md sticky top-0 z-40">
        <h2 className="text-lg font-bold text-cyan-400">SmartFix Admin</h2>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95 transition-transform">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] bg-slate-900 border-r-slate-800 p-0 flex flex-col text-white">
            <SheetHeader className="sr-only">
              <SheetTitle>Admin Menu</SheetTitle>
            </SheetHeader>
            <UserHeader />
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <NavLinks />
            </div>
            <FooterLinks />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-[280px] bg-slate-900 text-white flex-col sticky top-0 h-screen overflow-hidden">
        <UserHeader />
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <NavLinks />
        </div>
        <FooterLinks />
      </aside>
    </>
  );
}
