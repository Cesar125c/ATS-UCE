export default function Footer() {
  return (
    <footer className="bg-[#050d1a] text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <h3 className="text-lg font-bold text-white">ATS-UCE</h3>
          <p className="mt-1 text-sm">Teacher Recruitment Management System</p>
        </div>
        <p className="text-xs text-slate-500">© 2026 Universidad Central del Ecuador</p>
      </div>
    </footer>
  );
}
