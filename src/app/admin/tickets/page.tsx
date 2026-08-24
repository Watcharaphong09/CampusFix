import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import TicketsListView from '@/components/admin/TicketsListView';

export default async function AdminTicketsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  const { data: tickets, error } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">รายการแจ้งซ่อมทั้งหมด</h1>
          <p className="text-slate-500">ค้นหา, กรอง และจัดการข้อมูลแจ้งซ่อมทั้งหมด</p>
        </div>
        <TicketsListView initialTickets={tickets || []} />
      </div>
    </div>
  );
}
