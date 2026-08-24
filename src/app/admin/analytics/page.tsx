import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AnalyticsView from '@/components/admin/AnalyticsView';

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  const { data: tickets, error: ticketError } = await supabase
    .from('reports')
    .select('*');

  const { data: feedbacks, error: feedbackError } = await supabase
    .from('feedback')
    .select('*');

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">สถิติการแจ้งซ่อม (Analytics)</h1>
          <p className="text-slate-500">ดูข้อมูลภาพรวมและการประเมินความพึงพอใจ</p>
        </div>
        <AnalyticsView tickets={tickets || []} feedbacks={feedbacks || []} />
      </div>
    </div>
  );
}
