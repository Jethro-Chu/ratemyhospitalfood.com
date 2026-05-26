export default function Footer() {
  return (
    <footer className="border-t border-zinc-100 bg-zinc-50/50 py-10 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="text-sm font-medium text-zinc-500">
              Rate My Hospital Food
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              A just-for-fun project helping people find better cafeteria meals.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-zinc-400 font-medium">
            <span>
              Built by{' '}
              <a
                href="https://www.instagram.com/jethrochu"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-brand-600 transition-colors"
              >
                @jethrochu
              </a>
            </span>
            <span className="text-zinc-200">|</span>
            <a href="#" className="hover:text-brand-600 transition-colors">Contact</a>
            <a href="#" className="hover:text-brand-600 transition-colors">Feedback</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
