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
      </body>
    </html>
  );
}
