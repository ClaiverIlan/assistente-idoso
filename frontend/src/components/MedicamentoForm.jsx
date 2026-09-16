function MedicamentoForm({
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
            ? "Editar medicamento"
            : "Adicionar medicamento"}
        </h4>

        <p className="mt-1 text-sm text-slate-500">
          {editando
            ? "Altere os dados do medicamento."
            : "Preencha os dados do novo medicamento."}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Nome
          </label>

          <input
            type="text"
            value={dados.Nome}
            onChange={(evento) =>
              onChange({
                ...dados,
                Nome: evento.target.value,
              })
            }
            placeholder="Nome do medicamento"
            required
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Dosagem
          </label>

          <input
            type="text"
            value={dados.Dosagem}
            onChange={(evento) =>
              onChange({
                ...dados,
                Dosagem: evento.target.value,
              })
            }
            placeholder="Ex.: 50 mg"
            required
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Horário
          </label>

          <input
            type="time"
            value={dados.Horario}
            onChange={(evento) =>
              onChange({
                ...dados,
                Horario: evento.target.value,
              })
            }
            required
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Frequência
          </label>

          <input
            type="text"
            value={dados.Frequencia}
            onChange={(evento) =>
              onChange({
                ...dados,
                Frequencia: evento.target.value,
              })
            }
            placeholder="Ex.: 1 vez ao dia"
            required
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Observações
          </label>

          <textarea
            value={dados.Observacoes}
            onChange={(evento) =>
              onChange({
                ...dados,
                Observacoes: evento.target.value,
              })
            }
            placeholder="Observações sobre o medicamento"
            rows="3"
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
            : "Salvar medicamento"}
        </button>
      </div>
    </form>
  );
}

export default MedicamentoForm;