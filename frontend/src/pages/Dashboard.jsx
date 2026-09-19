function Dashboard({
  cuidador,
  idosos,
  medicamentos,
  lembretes,
  ocorrencias,
}) {
  const idsDosIdosos = new Set(
    idosos.map((idoso) => idoso.Id)
  );

  const medicamentosDoCuidador = medicamentos.filter(
    (medicamento) => idsDosIdosos.has(medicamento.Idoso_Id)
  );

  const idsDosMedicamentos = new Set(
    medicamentosDoCuidador.map(
      (medicamento) => medicamento.Id
    )
  );

  const lembretesDoCuidador = lembretes.filter(
    (lembrete) =>
      idsDosMedicamentos.has(lembrete.Medicamento_Id)
  );

  const ocorrenciasDoCuidador = ocorrencias.filter(
    (ocorrencia) => idsDosIdosos.has(ocorrencia.Idoso_Id)
  );

  const lembretesPendentes = lembretesDoCuidador.filter(
    (lembrete) => lembrete.Status === "Pendente"
  );

  const ordenarPorData = (itens) => {
    return [...itens].sort((a, b) => {
      const dataA = new Date(
        String(a.Data_Hora || "").replace(" ", "T")
      );

      const dataB = new Date(
        String(b.Data_Hora || "").replace(" ", "T")
      );

      if (
        Number.isNaN(dataA.getTime()) ||
        Number.isNaN(dataB.getTime())
      ) {
        return 0;
      }

      return dataA - dataB;
    });
  };

  const proximosLembretes = ordenarPorData(
    lembretesPendentes
  ).slice(0, 5);

  const ocorrenciasRecentes = [...ocorrenciasDoCuidador]
    .reverse()
    .slice(0, 5);

  const encontrarMedicamento = (medicamentoId) => {
    return medicamentosDoCuidador.find(
      (medicamento) => medicamento.Id === medicamentoId
    );
  };

  const encontrarIdoso = (idosoId) => {
    return idosos.find(
      (idoso) => idoso.Id === idosoId
    );
  };

  return (
    <div>
      {/* Cabeçalho */}

      <header className="mb-8">
        <p className="text-sm font-medium text-slate-500">
          Início
        </p>

        <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          {cuidador
            ? `Olá, ${cuidador.Nome}`
            : "Bem-vindo"}
        </h2>

        <p className="mt-2 text-slate-500">
          Acompanhe de forma rápida a rotina dos seus idosos.
        </p>
      </header>

      {/* Resumo */}

      <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">
            Idosos
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {idosos.length}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            cadastrados
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">
            Medicamentos
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {medicamentosDoCuidador.length}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            cadastrados
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">
            Lembretes
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {lembretesPendentes.length}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            pendentes
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">
            Ocorrências
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {ocorrenciasDoCuidador.length}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            registradas
          </p>
        </div>

      </section>

      {/* Próximos lembretes */}

      <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6">

        <div className="mb-5">
          <h3 className="text-xl font-semibold text-slate-900">
            Próximos lembretes
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Medicamentos com lembretes pendentes.
          </p>
        </div>

        {proximosLembretes.length === 0 ? (
          <div className="rounded-xl bg-slate-50 p-6 text-center">
            <p className="text-sm text-slate-500">
              Não há lembretes pendentes no momento.
            </p>
          </div>
        ) : (
          <div className="space-y-3">

            {proximosLembretes.map((lembrete) => {
              const medicamento =
                encontrarMedicamento(
                  lembrete.Medicamento_Id
                );

              const idoso = medicamento
                ? encontrarIdoso(medicamento.Idoso_Id)
                : null;

              return (
                <div
                  key={lembrete.Id}
                  className="flex flex-col gap-2 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      {medicamento?.Nome ||
                        "Medicamento"}
                    </p>

                    <p className="text-sm text-slate-500">
                      {idoso?.Nome ||
                        "Idoso não encontrado"}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="font-semibold text-slate-900">
                      {lembrete.Data_Hora}
                    </p>

                    <p className="text-sm text-amber-600">
                      {lembrete.Status}
                    </p>
                  </div>
                </div>
              );
            })}

          </div>
        )}

      </section>

      {/* Ocorrências recentes */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6">

        <div className="mb-5">
          <h3 className="text-xl font-semibold text-slate-900">
            Ocorrências recentes
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Últimos registros feitos para seus idosos.
          </p>
        </div>

        {ocorrenciasRecentes.length === 0 ? (
          <div className="rounded-xl bg-slate-50 p-6 text-center">
            <p className="text-sm text-slate-500">
              Nenhuma ocorrência registrada.
            </p>
          </div>
        ) : (
          <div className="space-y-3">

            {ocorrenciasRecentes.map((ocorrencia) => {
              const idoso = encontrarIdoso(
                ocorrencia.Idoso_Id
              );

              return (
                <div
                  key={ocorrencia.Id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-semibold text-slate-900">
                      {ocorrencia.Tipo}
                    </p>

                    <p className="text-sm text-slate-500">
                      {ocorrencia.Data_Hora}
                    </p>
                  </div>

                  <p className="mt-1 text-sm font-medium text-slate-600">
                    {idoso?.Nome ||
                      "Idoso não encontrado"}
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {ocorrencia["Descrição"]}
                  </p>
                </div>
              );
            })}

          </div>
        )}

      </section>
    </div>
  );
}

export default Dashboard;