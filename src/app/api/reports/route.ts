import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // In Phase 3, we expect images to be uploaded later or just passing empty arrays
    // For now, we will handle text data
    const {
      firstName,
      lastName,
      nickname,
      department,
      phone,
      building,
      room,
      category,
      description,
      imageUrls = [],
    } = body;

    // Generate Ticket ID (SF-YYMMDD-XXX)
    const today = new Date();
    const yy = today.getFullYear().toString().slice(-2);
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const datePrefix = `SF-${yy}${mm}${dd}`;

    // Get count of tickets today for the XXX part
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

    const { count, error: countError } = await supabaseAdmin
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay);

    if (countError) throw countError;

    const sequence = String((count || 0) + 1).padStart(3, '0');
    const ticketId = `${datePrefix}-${sequence}`;

    const timeline = [
      {
        status: 'pending',
        timestamp: new Date().toISOString(),
        updatedBy: 'system',
        note: 'สร้างรายการแจ้งซ่อม'
      }
    ];

    // Insert into Supabase
    const { data, error } = await supabaseAdmin
      .from('reports')
      .insert([
        {
          ticket_id: ticketId,
          first_name: firstName,
          last_name: lastName,
          nickname,
          department,
          phone,
          building,
          room,
          category,
          description,
          image_urls: imageUrls,
          timeline,
          status: 'pending',
          priority: 'normal',
          notification_status: 'pending' // Initial status
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase Error:', error);
      return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
    }

    // --- Send LINE Notification ---
    const lineToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    const lineTargetId = process.env.LINE_ADMIN_USER_ID; // Changed from LINE_GROUP_ID
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://campus-fix-nu.vercel.app';

    if (lineToken && lineTargetId) {
      const messageText = `🚨 SMARTFIX CAMPUS
มีรายการแจ้งซ่อมใหม่
🎫 Ticket: ${ticketId}
👤 ผู้แจ้ง: ${firstName} ${lastName}
📍 สถานที่: อาคาร ${building} ห้อง ${room}
🔧 ประเภท: ${category}
⚡ Priority: Normal
📝 รายละเอียด: ${description}
⏰ เวลา: ${new Date().toLocaleString('th-TH')}
🔎 ดูรายละเอียด: ${appUrl}/track?id=${ticketId}`;

      try {
        const lineResponse = await fetch('https://api.line.me/v2/bot/message/push', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${lineToken}`
          },
          body: JSON.stringify({
            to: lineTargetId,
            messages: [{ type: 'text', text: messageText }]
          })
        });

        if (lineResponse.ok) {
          // Update notification status to sent
          await supabaseAdmin
            .from('reports')
            .update({ notification_status: 'sent' })
            .eq('id', data.id);
        } else {
          console.error('LINE API Error:', await lineResponse.text());
          await supabaseAdmin
            .from('reports')
            .update({ notification_status: 'failed' })
            .eq('id', data.id);
        }
      } catch (lineErr) {
        console.error('LINE Fetch Error:', lineErr);
        await supabaseAdmin
          .from('reports')
          .update({ notification_status: 'failed' })
          .eq('id', data.id);
      }
    }

    return NextResponse.json({ success: true, ticketId: data.ticket_id, data });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
