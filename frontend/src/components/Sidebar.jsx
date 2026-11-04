
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

function Sidebar({ onSair }) {
  const [menuAberto, setMenuAberto] = useState(false);

  const classesDoMenu = ({ isActive }) =>
    `rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
      isActive
        ? "bg-slate-900 text-white"
        : "text-slate-700 hover:bg-slate-100"
    }`;

  const fecharMenu = () => {
    setMenuAberto(false);
  };

  const sair = () => {
    fecharMenu();
    onSair();
  };

  useEffect(() => {
    if (!menuAberto) return;

    const aoPressionarTecla = (evento) => {
      if (evento.key === "Escape") {
        fecharMenu();
      }
    };

    window.addEventListener("keydown", aoPressionarTecla);

    return () => {
      window.removeEventListener("keydown", aoPressionarTecla);
    };
  }, [menuAberto]);

  return (
    <>
      {/* BARRA SUPERIOR - CELULARES E TABLETS */}
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-slate-50 px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setMenuAberto(true)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-700 transition hover:bg-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
          aria-label="Abrir menu de navegação"
          aria-expanded={menuAberto}
          aria-controls="menu-mobile"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <span className="text-sm font-semibold text-slate-900">
          Sistema de Cuidado
        </span>
      </header>

      {/* MENU PARA CELULARES E TABLETS */}
      {menuAberto && (
        <div className="lg:hidden">
          <button
            type="button"
            onClick={fecharMenu}
            className="fixed inset-0 z-40 bg-slate-900/40"
            aria-label="Fechar menu de navegação"
          />

          <aside
            id="menu-mobile"
            aria-label="Menu de navegação"
            className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col overflow-y-auto border-r border-slate-200 bg-white p-6 shadow-xl"
          >
            <div className="mb-8 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Sistema de Cuidado
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Apoio à rotina do cuidador
                </p>
              </div>

              <button
                type="button"
                onClick={fecharMenu}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
                aria-label="Fechar menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="flex flex-col gap-2">
              <NavLink
                to="/"
                end
                className={classesDoMenu}
                onClick={fecharMenu}
              >
                🏠 Início
              </NavLink>

              <NavLink
                to="/idosos"
                className={classesDoMenu}
                onClick={fecharMenu}
              >
                👥 Idosos
              </NavLink>

              <NavLink
                to="/assistente"
                className={classesDoMenu}
                onClick={fecharMenu}
              >
                ✨ Assistente
              </NavLink>
            </nav>

            <button
              type="button"
              onClick={sair}
              className="mt-auto rounded-xl border border-red-200 px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              🚪 Sair
            </button>
          </aside>
        </div>
      )}

      {/* MENU ORIGINAL - COMPUTADORES */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white p-6 lg:flex">
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
          type="button"
          onClick={onSair}
          className="mt-auto rounded-xl border border-red-200 px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
        >
          🚪 Sair
        </button>
      </aside>
    </>
  );
}

export default Sidebar;
