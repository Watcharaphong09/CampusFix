import type { Metadata } from 'next';
import { Inter, Prompt } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import PublicNavWrapper from '@/components/layout/PublicNavWrapper';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const prompt = Prompt({ 
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['thai'], 
  variable: '--font-prompt' 
});

export const metadata: Metadata = {
  title: 'SmartFix Campus',
  description: 'ระบบบริหารจัดการงานแจ้งซ่อมภายในสถานศึกษาอัจฉริยะ',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${inter.variable} ${prompt.variable} font-sans bg-slate-50 min-h-screen text-slate-800 antialiased selection:bg-cyan-100 selection:text-cyan-900`}>
        <PublicNavWrapper>
          {children}
        </PublicNavWrapper>
        <Toaster position="top-center" richColors />
        
        {/* Watermark */}
        <div className="fixed bottom-4 right-4 z-[9999] pointer-events-none">
          <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-slate-200/50 flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Made By</span>
            <span className="text-sm font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">AiNine</span>
          </div>
        </div>
      </body>
    </html>
  );
}
