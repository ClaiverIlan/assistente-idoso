function OcorrenciaForm({
  modo,
  dados,
  onChange,
  onSubmit,
  onCancelar,
}) {
  const editando = modo === "editar";

  return (
    <form
      onSubmit={onSubmit}
      className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-5">
        <h4 className="text-lg font-semibold text-slate-900">
          {editando
            ? "Editar ocorrência"
            : "Registrar ocorrência"}
        </h4>

        <p className="mt-1 text-sm text-slate-500">
          {editando
            ? "Altere os dados da ocorrência."
            : "Preencha os dados da nova ocorrência."}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Tipo
          </label>

          <input
            type="text"
            value={dados.Tipo}
            onChange={(evento) =>
              onChange({
                ...dados,
                Tipo: evento.target.value,
              })
            }
            placeholder="Ex.: Queda, mal-estar, febre"
            required
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Data e hora
          </label>

          <input
            type="datetime-local"
            value={dados.Data_Hora}
            onChange={(evento) =>
              onChange({
                ...dados,
                Data_Hora: evento.target.value,
              })
            }
            required
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Descrição
          </label>

          <textarea
            value={dados["Descrição"]}
            onChange={(evento) =>
              onChange({
                ...dados,
                "Descrição": evento.target.value,
              })
            }
            placeholder="Descreva o que aconteceu..."
            rows="4"
            required
            className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
          />
        </div>
      </div>

      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={onCancelar}
          className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          {editando
            ? "Salvar alterações"
            : "Registrar ocorrência"}
        </button>
      </div>
    </form>
  );
}

export default OcorrenciaForm;