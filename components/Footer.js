import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-100 bg-white py-12 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-8">

          {/* Brand */}
          <div className="max-w-xs">
            <p className="text-sm font-bold text-zinc-900">Rate My Hospital Food</p>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              A community-driven project helping patients and staff discover the best (and worst) hospital cafeterias.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col sm:flex-row gap-8 text-sm">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Explore</span>
              <Link href="/" className="text-zinc-500 hover:text-zinc-900 transition-colors">Home</Link>
              <Link href="/top-rated" className="text-zinc-500 hover:text-zinc-900 transition-colors">Top Rated</Link>
              <Link href="/recent-reviews" className="text-zinc-500 hover:text-zinc-900 transition-colors">Recent Reviews</Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Contribute</span>
              <Link href="/add" className="text-zinc-500 hover:text-zinc-900 transition-colors">Add Hospital</Link>
              <Link href="/search" className="text-zinc-500 hover:text-zinc-900 transition-colors">Write a Review</Link>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-zinc-400">
            &copy; {new Date().getFullYear()} Rate My Hospital Food. For entertainment purposes.
          </p>
          <p className="text-xs text-zinc-400">
            Built by{' '}
            <a
              href="https://www.instagram.com/jethrochu"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-zinc-600 hover:text-blue-600 transition-colors"
            >
              @jethrochu
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
