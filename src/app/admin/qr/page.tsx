"use client";
import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Download, QrCode, Save, History, Trash2, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function QRManagementPage() {
  const [building, setBuilding] = useState('');
  const [room, setRoom] = useState('');
  const [appUrl, setAppUrl] = useState('');
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    setAppUrl(window.location.origin);
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const { data } = await supabase
      .from('qr_locations')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setHistory(data);
  };

  const saveLocation = async () => {
    if (!building || !room) return toast.error('กรุณากรอกอาคารและห้องก่อนบันทึก');
    const { error } = await supabase.from('qr_locations').insert([{ building, room }]);
    
    if (error) {
      if (error.code === '23505') toast.error('ห้องนี้ถูกบันทึกไปแล้วครับ');
      else toast.error('เกิดข้อผิดพลาดในการบันทึก');
    } else {
      toast.success('บันทึกข้อมูลเรียบร้อยแล้ว');
      fetchHistory();
    }
  };

  const deleteLocation = async (id: string) => {
    await supabase.from('qr_locations').delete().eq('id', id);
    fetchHistory();
    toast.success('ลบข้อมูลสำเร็จ');
  };

  const locationId = (building && room) ? `${building}-${room}` : '';
  const qrUrl = locationId ? `${appUrl}/report?location=${encodeURIComponent(locationId)}` : appUrl;

  const downloadQR = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width + 80;
      canvas.height = img.height + 120;
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 40, 40);
        
        ctx.font = 'bold 24px sans-serif';
        ctx.fillStyle = '#0f172a';
        ctx.textAlign = 'center';
        ctx.fillText('SMARTFIX CAMPUS', canvas.width / 2, canvas.height - 40);
        
        ctx.font = '18px sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText(`อาคาร ${building} ห้อง ${room}`, canvas.width / 2, canvas.height - 15);
      }
      
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `SmartFix-QR-${building}-${room}.png`;
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">สร้าง QR Code สำหรับแจ้งซ่อม</h1>
        <p className="text-slate-500">สร้างและบันทึก QR Code เพื่อนำไปแปะตามห้องต่างๆ ให้ผู้ใช้สแกนอัตโนมัติ</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ฟอร์มและประวัติ */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ระบุสถานที่</CardTitle>
              <CardDescription>กรอกชื่ออาคารและหมายเลขห้องเพื่อสร้าง QR Code ทันที</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="building">อาคาร</Label>
                  <Input 
                    id="building" 
                    placeholder="เช่น A, อาคารเรียนรวม" 
                    value={building}
                    onChange={(e) => setBuilding(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="room">ห้อง</Label>
                  <Input 
                    id="room" 
                    placeholder="เช่น 301, IT-01" 
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={saveLocation} variant="outline" className="w-full mt-2">
                <Save className="w-4 h-4 mr-2" /> บันทึกประวัติการสร้างห้องนี้
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <History className="w-5 h-5 mr-2" /> ประวัติที่เคยบันทึกไว้
              </CardTitle>
            </CardHeader>
            <CardContent>
              {history.length > 0 ? (
                <div className="space-y-2">
                  {history.map((loc) => (
                    <div key={loc.id} className="flex items-center justify-between p-3 bg-slate-50 border rounded-lg hover:bg-slate-100 transition cursor-pointer" onClick={() => { setBuilding(loc.building); setRoom(loc.room); }}>
                      <div className="flex items-center text-slate-700 font-medium">
                        <MapPin className="w-4 h-4 mr-2 text-cyan-600" />
                        อาคาร {loc.building} — ห้อง {loc.room}
                      </div>
                      <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-500 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); deleteLocation(loc.id); }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400 text-sm">
                  ยังไม่มีประวัติการบันทึก
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* พรีวิว QR */}
        <div className="lg:col-span-1">
          <Card className="flex flex-col items-center justify-center py-10 sticky top-6">
            {building && room ? (
              <div className="flex flex-col items-center space-y-6 w-full px-6">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                  <QRCodeSVG 
                    id="qr-code-svg"
                    value={qrUrl} 
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <div className="text-center space-y-1 w-full">
                  <p className="font-bold text-slate-800">SMARTFIX CAMPUS</p>
                  <p className="text-sm text-slate-500">อาคาร {building} ห้อง {room}</p>
                </div>
                <Button onClick={downloadQR} className="bg-cyan-600 hover:bg-cyan-700 text-white w-full">
                  <Download className="w-4 h-4 mr-2" /> ดาวน์โหลด PNG
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center text-slate-400 space-y-4">
                <QrCode className="w-20 h-20 opacity-20" />
                <p>กรุณากรอกอาคารและห้องเพื่อดู QR Code</p>
              </div>
            )}
          </Card>
        </div>

      </div>
    </div>
  );
}
