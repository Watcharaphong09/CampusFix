"use client";
import { usePathname } from 'next/navigation';
import PublicNav from './PublicNav';

export default function PublicNavWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <>
      {!isAdmin && <PublicNav />}
      <div className={!isAdmin ? "pb-16 md:pb-0" : ""}>
        {children}
      </div>
    </>
  );
}
