function Sidebar() {
  return (
    <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white p-6 md:flex">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Sistema de Cuidado
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Apoio à rotina do cuidador
        </p>
      </div>

      <nav className="flex flex-col gap-2">
        <button className="rounded-xl bg-slate-900 px-4 py-3 text-left text-sm font-medium text-white">
          🏠 Início
        </button>

        <button className="rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100">
          👥 Idosos
        </button>

        <button className="rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100">
          💊 Medicamentos
        </button>

        <button className="rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100">
          ⚠️ Ocorrências
        </button>

        <button className="rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100">
          ✨ Assistente
        </button>
      </nav>
    </aside>
  );
}

export default Sidebar;