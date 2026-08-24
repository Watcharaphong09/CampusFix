"use client";
import React, { useState } from 'react';
import { Ticket, STATUS_CONFIG, PRIORITY_CONFIG } from '@/types/ticket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Eye, Star, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function TicketsListView({ initialTickets }: { initialTickets: Ticket[] }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

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

  // Filter tickets
  const filteredTickets = initialTickets.filter(t => {
    const matchesSearch = 
      t.ticket_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.building.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.room.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort: Starred first, then newest
  const sortedTickets = [...filteredTickets].sort((a, b) => {
    if (a.is_starred && !b.is_starred) return -1;
    if (!a.is_starred && b.is_starred) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const totalPages = Math.ceil(sortedTickets.length / itemsPerPage);
  const displayTickets = sortedTickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle>รายการแจ้งซ่อมทั้งหมด ({sortedTickets.length} รายการ)</CardTitle>
          <div className="flex w-full md:w-auto gap-2 flex-wrap md:flex-nowrap">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input 
                placeholder="ค้นหา Ticket ID, ชื่อ, อาคาร, ห้อง..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <Select value={statusFilter} onValueChange={(val) => {
              setStatusFilter(val || 'all');
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="ทุกสถานะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกสถานะ</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                  <SelectItem key={key} value={key}>{val.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              className="flex items-center"
              onClick={() => {
                const headers = ['Ticket ID', 'ผู้แจ้ง', 'หมวดหมู่', 'อาคาร', 'ห้อง', 'รายละเอียด', 'สถานะ', 'วันที่'];
                const csvRows = [headers.join(',')];
                for (const t of sortedTickets) {
                  const row = [
                    t.ticket_id,
                    `"${t.first_name} ${t.last_name}"`,
                    `"${t.category}"`,
                    `"${t.building}"`,
                    `"${t.room}"`,
                    `"${t.description.replace(/"/g, '""')}"`,
                    STATUS_CONFIG[t.status as keyof typeof STATUS_CONFIG]?.label || t.status,
                    new Date(t.created_at).toLocaleDateString('th-TH')
                  ];
                  csvRows.push(row.join(','));
                }
                const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `reports-${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
              }}
            >
              Export CSV
            </Button>
          </div>
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <Button 
              variant="outline" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              ก่อนหน้า
            </Button>
            <span className="text-sm text-slate-500">หน้า {currentPage} จาก {totalPages}</span>
            <Button 
              variant="outline" 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            >
              ถัดไป
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
