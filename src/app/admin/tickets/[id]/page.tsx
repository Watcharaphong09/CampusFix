import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import TicketDetailView from '@/components/admin/TicketDetailView';

export default async function AdminTicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/admin/login');
  }

  // Next.js dynamic route segment
  const { id: ticketId } = await params;

  const { data: ticket, error } = await supabase
    .from('reports')
    .select('*')
    .eq('ticket_id', ticketId)
    .single();

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">ไม่พบข้อมูลแจ้งซ่อม</h1>
        <p className="text-slate-500 mb-6">รหัส Ticket: {ticketId} อาจไม่ถูกต้อง หรือถูกลบไปแล้ว</p>
        <a href="/admin/dashboard" className="text-cyan-600 hover:underline">กลับไปหน้า Dashboard</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <TicketDetailView initialTicket={ticket} />
      </div>
    </div>
  );
}
