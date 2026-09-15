function RotinaIdoso({
  idoso,
  medicamentos,
  lembretes,
  ocorrencias,
}) {
  const medicamentosDoIdoso = medicamentos.filter(
    (medicamento) => medicamento.Idoso_Id === idoso.Id
  );

  const lembretesDoIdoso = lembretes.filter((lembrete) =>
    medicamentosDoIdoso.some(
      (medicamento) => medicamento.Id === lembrete.Medicamento_Id
    )
  );

  const ocorrenciasDoIdoso = ocorrencias.filter(
    (ocorrencia) => ocorrencia.Idoso_Id === idoso.Id
  );

  return (
    <section>
      <div className="mb-6 flex flex-col gap-1">
        <p className="text-sm font-medium text-slate-500">
          Rotina do idoso
        </p>

        <h3 className="text-2xl font-bold text-slate-900">
          {idoso.Nome}
        </h3>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">

        {/* Medicamentos */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <div className="flex items-center gap-2">
              <span className="text-xl">💊</span>

              <h4 className="text-lg font-semibold">
                Medicamentos
              </h4>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Medicamentos cadastrados
            </p>
          </div>

          <div className="space-y-3">
            {medicamentosDoIdoso.map((medicamento) => (
              <div
                key={medicamento.Id}
                className="rounded-xl bg-slate-50 p-4"
              >
                <p className="font-medium text-slate-900">
                  {medicamento.Nome}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {medicamento.Dosagem} · {medicamento.Horario}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Lembretes */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <div className="flex items-center gap-2">
              <span className="text-xl">⏰</span>

              <h4 className="text-lg font-semibold">
                Lembretes
              </h4>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Horários dos medicamentos
            </p>
          </div>

          <div className="space-y-3">
            {lembretesDoIdoso.map((lembrete) => (
              <div
                key={lembrete.Id}
                className="rounded-xl bg-slate-50 p-4"
              >
                <p className="font-medium text-slate-900">
                  {lembrete.Data_Hora}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Status: {lembrete.Status}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Ocorrências */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚠️</span>

              <h4 className="text-lg font-semibold">
                Ocorrências
              </h4>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Registros relacionados
            </p>
          </div>

          <div className="space-y-3">
            {ocorrenciasDoIdoso.map((ocorrencia) => (
              <div
                key={ocorrencia.Id}
                className="rounded-xl bg-slate-50 p-4"
              >
                <p className="font-medium text-slate-900">
                  {ocorrencia.Tipo}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Ocorrência registrada
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Assistente */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">✨</span>

              <h4 className="text-lg font-semibold">
                Assistente
              </h4>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Em breve você poderá perguntar sobre a rotina de{" "}
              {idoso.Nome}.
            </p>
          </div>

          <button
            disabled
            className="rounded-xl bg-slate-200 px-5 py-3 text-sm font-semibold text-slate-500"
          >
            Em breve
          </button>
        </div>
      </div>
    </section>
  );
}

export default RotinaIdoso;