import { NavLink } from "react-router-dom";

function Sidebar({ onSair }) {
  const classesDoMenu = ({ isActive }) =>
    `rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
      isActive
        ? "bg-slate-900 text-white"
        : "text-slate-700 hover:bg-slate-100"
    }`;

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
        <NavLink to="/" end className={classesDoMenu}>
          🏠 Início
        </NavLink>

        <NavLink to="/idosos" className={classesDoMenu}>
          👥 Idosos
        </NavLink>

        <NavLink to="/assistente" className={classesDoMenu}>
          ✨ Assistente
        </NavLink>
      </nav>

      <button
        onClick={onSair}
        className="mt-auto rounded-xl border border-red-200 px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
      >
        🚪 Sair
      </button>
    </aside>
  );
}

export default Sidebar;