"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Ticket, STATUS_CONFIG, PRIORITY_CONFIG } from '@/types/ticket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Clock, MapPin, Wrench, User, Phone, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function TicketDetailView({ initialTicket }: { initialTicket: Ticket }) {
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket>(initialTicket);
  const [status, setStatus] = useState<string>(initialTicket.status);
  const [priority, setPriority] = useState<string>(initialTicket.priority);
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdate = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const newTimelineEvent = {
        status,
        timestamp: new Date().toISOString(),
        updatedBy: user?.email || 'admin',
        note: note.trim() || undefined
      };

      const hasChanges = status !== ticket.status || note.trim() !== '';
      const newTimeline = hasChanges 
        ? [...ticket.timeline, newTimelineEvent]
        : ticket.timeline;

      const { data, error } = await supabase
        .from('reports')
        .update({
          status,
          priority,
          timeline: newTimeline,
        })
        .eq('id', ticket.id)
        .select()
        .single();

      if (error) throw error;
      
      setTicket(data as Ticket);
      setNote('');
      alert('อัปเดตข้อมูลสำเร็จ');
      router.refresh();
    } catch (error) {
      console.error('Update error:', error);
      alert('เกิดข้อผิดพลาดในการอัปเดต');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Link href="/admin/dashboard">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" /> กลับไปหน้าแรก
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">จัดการแจ้งซ่อม: {ticket.ticket_id}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-lg flex items-center">
                <Wrench className="w-5 h-5 mr-2 text-cyan-600" /> ข้อมูลปัญหา
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">ประเภทปัญหา</p>
                  <p className="font-medium">{ticket.category}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">ความสำคัญ</p>
                  <Badge variant="outline" className={PRIORITY_CONFIG[ticket.priority as keyof typeof PRIORITY_CONFIG].color}>
                    {PRIORITY_CONFIG[ticket.priority as keyof typeof PRIORITY_CONFIG].label}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">รายละเอียด</p>
                <div className="bg-slate-50 p-4 rounded-md text-slate-700 whitespace-pre-wrap">
                  {ticket.description}
                </div>
              </div>
              
              {ticket.image_urls && ticket.image_urls.length > 0 && (
                <div>
                  <p className="text-sm text-slate-500 mb-2">รูปภาพประกอบ</p>
                  <div className="flex flex-wrap gap-2">
                    {ticket.image_urls.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noreferrer">
                        <img src={url} alt={`รูปภาพประกอบ ${i+1}`} className="w-32 h-32 object-cover rounded-md border border-slate-200 hover:opacity-80 transition" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-lg flex items-center">
                <Clock className="w-5 h-5 mr-2 text-cyan-600" /> Timeline การทำงาน
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-200">
                {ticket.timeline.map((event, index) => (
                  <div key={index} className="relative flex items-start group">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-cyan-500 shrink-0 z-10">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <div className="ml-4 bg-white p-4 rounded-lg border border-slate-200 w-full shadow-sm">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-slate-800">
                          {STATUS_CONFIG[event.status as keyof typeof STATUS_CONFIG]?.label || event.status}
                        </span>
                        <span className="text-xs text-slate-500">{new Date(event.timestamp).toLocaleString('th-TH')}</span>
                      </div>
                      {event.note && <p className="text-sm text-slate-600 mt-2 bg-slate-50 p-2 rounded">📝 {event.note}</p>}
                      <p className="text-xs text-slate-400 mt-2 text-right">โดย: {event.updatedBy}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card className="border-cyan-100 shadow-md">
            <CardHeader className="bg-cyan-50/50 border-b border-cyan-100">
              <CardTitle className="text-lg">จัดการสถานะงาน</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>ปรับสถานะ</Label>
                <Select value={status} onValueChange={(val) => setStatus(val || status)}>
                  <SelectTrigger className={STATUS_CONFIG[status as keyof typeof STATUS_CONFIG].color + " text-white border-none"}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                      <SelectItem key={key} value={key}>{val.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>ปรับความสำคัญ</Label>
                <Select value={priority} onValueChange={(val) => setPriority(val || priority)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRIORITY_CONFIG).map(([key, val]) => (
                      <SelectItem key={key} value={key}>{val.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>บันทึกการทำงาน (Note)</Label>
                <Textarea 
                  placeholder="เพิ่มบันทึก หรือสาเหตุที่เปลี่ยนสถานะ..." 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                />
              </div>

              <Button 
                className="w-full bg-slate-900 hover:bg-slate-800 text-white" 
                onClick={handleUpdate}
                disabled={isSaving}
              >
                {isSaving ? 'กำลังบันทึก...' : <><Save className="w-4 h-4 mr-2" /> บันทึกข้อมูล</>}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-lg flex items-center">
                <User className="w-5 h-5 mr-2 text-cyan-600" /> ข้อมูลผู้แจ้ง
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <p className="text-sm text-slate-500">ชื่อ - นามสกุล</p>
                <p className="font-medium">{ticket.first_name} {ticket.last_name} {ticket.nickname ? `(${ticket.nickname})` : ''}</p>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-slate-400" />
                <p className="font-medium">{ticket.phone}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">ระดับชั้นปี</p>
                <p className="font-medium">{ticket.department}</p>
              </div>
              <div className="flex items-center pt-2 border-t">
                <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">สถานที่เกิดเหตุ</p>
                  <p className="font-medium">อาคาร {ticket.building} ห้อง {ticket.room}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
