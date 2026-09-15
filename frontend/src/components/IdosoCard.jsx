function IdosoCard({
  idoso,
  selecionado,
  onSelecionar,
  onEditar,
  onExcluir,
}) {
  return (
    <div
      className={`rounded-2xl border p-5 transition ${
        selecionado
          ? "border-slate-900 bg-slate-900 text-white shadow-md"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
      }`}
    >
      <button
        onClick={() => onSelecionar(idoso)}
        className="w-full text-left"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-lg font-semibold">
              {idoso.Nome}
            </p>

            <p
              className={`mt-1 text-sm ${
                selecionado
                  ? "text-slate-300"
                  : "text-slate-500"
              }`}
            >
              Visualizar rotina
            </p>
          </div>

          <span className="text-xl">👤</span>
        </div>
      </button>

      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={() => onEditar(idoso)}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
            selecionado
              ? "bg-white/10 text-white hover:bg-white/20"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Editar
        </button>

        <button
          onClick={() => onExcluir(idoso)}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
            selecionado
              ? "bg-white/10 text-white hover:bg-white/20"
              : "bg-red-50 text-red-600 hover:bg-red-100"
          }`}
        >
          Excluir
        </button>
      </div>
    </div>
  );
}

export default IdosoCard;