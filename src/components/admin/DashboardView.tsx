"use client";
import React from 'react';
import { Ticket, STATUS_CONFIG } from '@/types/ticket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Clock, PlayCircle, CheckCircle, Eye, Star, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function DashboardView({ initialTickets }: { initialTickets: Ticket[] }) {
  const router = useRouter();
  
  // Calculate stats
  const total = initialTickets.length;
  const pending = initialTickets.filter(t => t.status === 'pending').length;
  const inProgress = initialTickets.filter(t => ['acknowledged', 'in_progress'].includes(t.status)).length;
  const completed = initialTickets.filter(t => ['completed', 'closed'].includes(t.status)).length;

  const toggleStar = async (ticket: Ticket) => {
    const newVal = !ticket.is_starred;
    const { error } = await supabase
      .from('reports')
      .update({ is_starred: newVal })
      .eq('id', ticket.id);
    if (!error) {
      router.refresh();
    }
  };

  const handleDelete = async (id: string, ticketId: string) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบรายการแจ้งซ่อม ${ticketId}?\nข้อมูลทั้งหมดที่เกี่ยวข้องจะถูกลบและไม่สามารถกู้คืนได้`)) {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', id);
      
      if (error) {
        toast.error('ลบข้อมูลไม่สำเร็จ: ' + error.message);
      } else {
        toast.success(`ลบรายการ ${ticketId} สำเร็จ`);
        router.refresh();
      }
    }
  };

  // Sort: Starred first, then newest
  const sortedTickets = [...initialTickets].sort((a, b) => {
    if (a.is_starred && !b.is_starred) return -1;
    if (!a.is_starred && b.is_starred) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const displayTickets = sortedTickets.slice(0, 10);

  return (
    <div className="space-y-6 mt-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">งานทั้งหมด</CardTitle>
            <FileText className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">รอรับเรื่อง</CardTitle>
            <Clock className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pending}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">กำลังดำเนินการ</CardTitle>
            <PlayCircle className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgress}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">เสร็จสิ้น/ปิดงาน</CardTitle>
            <CheckCircle className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle>รายการแจ้งซ่อมล่าสุด (10 รายการ)</CardTitle>
            <Link href="/admin/tickets">
              <Button variant="outline">
                ดูรายการทั้งหมด
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>ผู้แจ้ง</TableHead>
                  <TableHead>ประเภท/สถานที่</TableHead>
                  <TableHead>วันที่</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayTickets.length > 0 ? (
                  displayTickets.map((ticket) => (
                    <TableRow key={ticket.id} className={ticket.is_starred ? 'bg-yellow-50/30' : ''}>
                      <TableCell>
                        <button onClick={() => toggleStar(ticket)} className="focus:outline-none transition-colors">
                          <Star className={`w-5 h-5 ${ticket.is_starred ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300 hover:text-yellow-400'}`} />
                        </button>
                      </TableCell>
                      <TableCell className="font-medium">{ticket.ticket_id}</TableCell>
                      <TableCell>
                        {ticket.first_name} {ticket.last_name}
                        <div className="text-xs text-slate-500">{ticket.department}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{ticket.category}</div>
                        <div className="text-xs text-slate-500">อาคาร {ticket.building} ห้อง {ticket.room}</div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {new Date(ticket.created_at).toLocaleDateString('th-TH')}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${STATUS_CONFIG[ticket.status].color} hover:${STATUS_CONFIG[ticket.status].color} text-white`}>
                          {STATUS_CONFIG[ticket.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/tickets/${ticket.ticket_id}`}>
                          <Button variant="ghost" size="sm" className="text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50">
                            <Eye className="w-4 h-4 mr-1" /> ดูข้อมูล
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(ticket.id, ticket.ticket_id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                      ไม่พบข้อมูล
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
