"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Ticket, STATUS_CONFIG } from '@/types/ticket';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function TrackingSearch() {
  const searchParams = useSearchParams();
  const initialId = searchParams?.get('id') || '';
  
  const [query, setQuery] = useState(initialId);
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e?: React.FormEvent, searchVal?: string) => {
    if (e) e.preventDefault();
    const q = searchVal || query;
    if (!q.trim()) return;

    setLoading(true);
    setError('');
    setHasSearched(true);
    setSelectedTicket(null);
    setTickets([]);

    try {
      const { data, error: fetchError } = await supabase
        .from('reports')
        .select('*')
        .or(`ticket_id.ilike.%${q}%,building.ilike.%${q}%,room.ilike.%${q}%,first_name.ilike.%${q}%`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (fetchError) throw fetchError;

      if (!data || data.length === 0) {
        setError('ไม่พบข้อมูลการแจ้งซ่อมที่ตรงกับคำค้นหา');
      } else if (data.length === 1) {
        setSelectedTicket(data[0] as Ticket);
      } else {
        setTickets(data as Ticket[]);
      }
    } catch (err) {
      console.error(err);
      setError('เกิดข้อผิดพลาดในการค้นหาข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      handleSearch(undefined, initialId);
    }
  }, [initialId]);

  return (
    <div className="w-full">
      {!selectedTicket && (
        <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-lg mx-auto mb-8">
          <Input 
            type="text" 
            placeholder="ค้นหา Ticket ID, อาคาร, ห้อง หรือชื่อผู้แจ้ง..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-white"
          />
          <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white px-6" disabled={loading}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          </Button>
        </form>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-center max-w-lg mx-auto border border-red-100">
          {error}
        </div>
      )}

      {/* Multiple Results List */}
      {!selectedTicket && tickets.length > 0 && (
        <div className="space-y-4 max-w-2xl mx-auto">
          <h3 className="text-lg font-bold text-slate-800">พบ {tickets.length} รายการ:</h3>
          <div className="grid gap-3">
            {tickets.map(t => (
              <div 
                key={t.id} 
                onClick={() => setSelectedTicket(t)}
                className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:border-cyan-400 hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-800">{t.ticket_id}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full text-white ${STATUS_CONFIG[t.status as keyof typeof STATUS_CONFIG]?.color}`}>
                      {STATUS_CONFIG[t.status as keyof typeof STATUS_CONFIG]?.label || t.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">
                    📍 อาคาร {t.building} ห้อง {t.room} | 🔧 {t.category}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">แจ้งโดย: {t.first_name} {t.last_name}</p>
                </div>
                <div className="text-right text-xs text-slate-400">
                  {new Date(t.created_at).toLocaleDateString('th-TH')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Single Ticket Detail */}
      {selectedTicket && (
        <div className="max-w-4xl mx-auto space-y-6">
          <Button variant="ghost" onClick={() => setSelectedTicket(null)} className="mb-4 text-slate-500 hover:text-slate-800 bg-white">
            <ArrowLeft className="w-4 h-4 mr-2" /> กลับไปหน้าค้นหา
          </Button>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
            <div className="bg-slate-900 text-white p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <p className="text-slate-400 text-sm mb-1">รหัสแจ้งซ่อม</p>
                <h2 className="text-2xl md:text-3xl font-bold text-cyan-400">{selectedTicket.ticket_id}</h2>
              </div>
              <div className="flex flex-col md:items-end">
                <span className={`px-4 py-1.5 rounded-full text-sm font-medium border border-white/20 ${STATUS_CONFIG[selectedTicket.status as keyof typeof STATUS_CONFIG]?.color}`}>
                  {STATUS_CONFIG[selectedTicket.status as keyof typeof STATUS_CONFIG]?.label || selectedTicket.status}
                </span>
                <p className="text-slate-400 text-xs mt-2">แจ้งเมื่อ: {new Date(selectedTicket.created_at).toLocaleString('th-TH')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              <div className="p-6 md:p-8 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">รายละเอียดปัญหา</h3>
                  <p className="text-lg font-medium text-slate-800 mb-2">{selectedTicket.category}</p>
                  <p className="text-slate-600 bg-slate-50 p-4 rounded-lg">{selectedTicket.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">สถานที่</h3>
                    <p className="text-slate-800 font-medium">อาคาร {selectedTicket.building}</p>
                    <p className="text-slate-600 text-sm">ห้อง {selectedTicket.room}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">ผู้แจ้ง</h3>
                    <p className="text-slate-800 font-medium">{selectedTicket.first_name} {selectedTicket.last_name}</p>
                    <p className="text-slate-600 text-sm">{selectedTicket.department}</p>
                  </div>
                </div>

                {selectedTicket.image_urls && selectedTicket.image_urls.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">รูปภาพประกอบ</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedTicket.image_urls.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noreferrer" className="block relative group rounded-lg overflow-hidden border border-slate-200">
                          <img src={url} alt={`รูปภาพที่ ${i+1}`} className="w-24 h-24 object-cover group-hover:scale-110 transition duration-300" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 bg-slate-50/50 flex flex-col h-full">
                <h3 className="text-lg font-semibold text-slate-800 mb-6">ความคืบหน้า (Timeline)</h3>
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent flex-1">
                  {selectedTicket.timeline.map((event, index) => (
                    <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-cyan-500 text-slate-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-800 text-sm">
                            {STATUS_CONFIG[event.status as keyof typeof STATUS_CONFIG]?.label || event.status}
                          </span>
                          <span className="text-xs text-slate-500">{new Date(event.timestamp).toLocaleString('th-TH')}</span>
                        </div>
                        {event.note && <p className="text-sm text-slate-600 mt-2">{event.note}</p>}
                        <p className="text-xs text-slate-400 mt-2 text-right">อัปเดตโดย: {event.updatedBy}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Feedback Section */}
                {(selectedTicket.status === 'completed' || selectedTicket.status === 'closed') && (
                  <div className="mt-8 p-4 bg-white rounded-lg border border-cyan-200 shadow-sm">
                    <h4 className="font-semibold text-slate-800 mb-2">ประเมินความพึงพอใจ</h4>
                    <p className="text-sm text-slate-500 mb-4">โปรดให้คะแนนและข้อเสนอแนะเพื่อการปรับปรุงบริการ</p>
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const rating = formData.get('rating');
                      const comment = formData.get('comment');
                      if(!rating) return toast.error('กรุณาเลือกคะแนน');
                      try {
                        const res = await fetch('/api/feedback', {
                          method: 'POST',
                          headers: {'Content-Type': 'application/json'},
                          body: JSON.stringify({ ticketId: selectedTicket.ticket_id, rating: Number(rating), comment })
                        });
                        if(res.ok) {
                          toast.success('ขอบคุณสำหรับคำประเมินครับ!');
                          e.currentTarget.reset();
                        } else {
                          toast.error('เกิดข้อผิดพลาด หรือคุณเคยประเมินไปแล้ว');
                        }
                      } catch (err) {
                        toast.error('เกิดข้อผิดพลาดในการส่งข้อมูล');
                      }
                    }}>
                      <div className="flex space-x-2 mb-4">
                        {[1, 2, 3, 4, 5].map((num) => (
                          <label key={num} className="cursor-pointer">
                            <input type="radio" name="rating" value={num} className="sr-only peer" required />
                            <div className="w-8 h-8 rounded-full flex items-center justify-center border border-slate-300 peer-checked:bg-yellow-400 peer-checked:border-yellow-400 peer-checked:text-white text-slate-400 transition">
                              {num}
                            </div>
                          </label>
                        ))}
                      </div>
                      <textarea name="comment" className="w-full text-sm p-2 border rounded-md mb-3" placeholder="ข้อเสนอแนะเพิ่มเติม (ถ้ามี)" rows={2}></textarea>
                      <Button type="submit" size="sm" className="w-full bg-cyan-600 hover:bg-cyan-700">ส่งคำประเมิน</Button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
