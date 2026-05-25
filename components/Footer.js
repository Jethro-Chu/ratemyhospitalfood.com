export default function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white py-8 mt-auto">
      <div className="container mx-auto max-w-6xl px-4 text-center">
        <p className="text-sm text-slate-500 mb-2">
          © {new Date().getFullYear()} Rate My Hospital Food — A just-for-fun project helping people find better cafeteria meals.
        </p>
        <p className="text-xs text-slate-400 mb-4">
          Built by <a href="https://www.instagram.com/jethrochu" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors">@jethrochu</a>
        </p>
        <div className="flex justify-center items-center gap-4 text-xs text-slate-400 font-medium">
          <a href="#" className="hover:text-orange-500 transition-colors">Contact</a>
          <span>&middot;</span>
          <a href="#" className="hover:text-orange-500 transition-colors">Submit feedback</a>
        </div>
      </div>
    </footer>
  );
}
