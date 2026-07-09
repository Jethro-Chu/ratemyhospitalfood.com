'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PenLine, Plus } from 'lucide-react';

export default function MobileActionBar() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.7);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className={`fixed inset-x-0 bottom-0 z-40 border-t border-ink-900/10 bg-white/95 px-3 pt-2 backdrop-blur-xl transition-transform duration-300 md:hidden ${visible ? 'translate-y-0' : 'translate-y-full'}`} style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}>
      <div className="grid grid-cols-[1fr_48px] gap-2">
        <Link href="/search?intent=review" className="action-primary py-3"><PenLine className="h-4 w-4" /> Write a review</Link>
        <Link href="/add" aria-label="Add a hospital" title="Add a hospital" className="flex h-12 items-center justify-center rounded-md border border-ink-900/15 text-ink-800"><Plus className="h-5 w-5" /></Link>
      </div>
    </div>
  );
}
