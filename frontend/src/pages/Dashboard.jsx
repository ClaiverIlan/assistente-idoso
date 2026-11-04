
function Dashboard({
  cuidador,
  idosos,
  medicamentos,
  lembretes,
}) {
  const idsDosIdosos = new Set(
    idosos.map((idoso) => idoso.Id)
  );

  const medicamentosDoCuidador = medicamentos.filter(
    (medicamento) =>
      idsDosIdosos.has(medicamento.Idoso_Id)
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
    <div className="w-full min-w-0 max-w-full">
      {/* CABEÇALHO */}
      <header className="mb-8 min-w-0">
        <p className="text-sm font-medium text-slate-500">
          Início
        </p>

        <h2 className="mt-1 break-words text-3xl font-bold tracking-tight text-slate-900">
          {cuidador
            ? `Olá, ${cuidador.Nome}`
            : "Bem-vindo"}
        </h2>

        <p className="mt-2 break-words text-slate-500">
          Acompanhe de forma rápida a rotina dos seus idosos.
        </p>
      </header>

      {/* RESUMO */}
      <section className="mb-8 grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
        {/* CARTÃO DE IDOSOS */}
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5">
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

        {/* CARTÃO DE LEMBRETES */}
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5">
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
      </section>

      {/* PRÓXIMOS LEMBRETES */}
      <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
        <div className="mb-5 min-w-0">
          <h3 className="break-words text-xl font-semibold text-slate-900">
            Próximos lembretes
          </h3>

          <p className="mt-1 break-words text-sm text-slate-500">
            Medicamentos com lembretes pendentes.
          </p>
        </div>

        {proximosLembretes.length === 0 ? (
          <div className="min-w-0 rounded-xl bg-slate-50 p-4 text-center sm:p-6">
            <p className="break-words text-sm text-slate-500">
              Não há lembretes pendentes no momento.
            </p>
          </div>
        ) : (
          <div className="min-w-0 space-y-3">
            {proximosLembretes.map((lembrete) => {
              const medicamento = encontrarMedicamento(
                lembrete.Medicamento_Id
              );

              const idoso = medicamento
                ? encontrarIdoso(medicamento.Idoso_Id)
                : null;

              return (
                <div
                  key={lembrete.Id}
                  className="flex min-w-0 flex-col gap-2 rounded-xl border border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="min-w-0">
                    <p className="break-words font-semibold text-slate-900">
                      {medicamento?.Nome || "Medicamento"}
                    </p>

                    <p className="break-words text-sm text-slate-500">
                      {idoso?.Nome || "Idoso não encontrado"}
                    </p>
                  </div>

                  <div className="min-w-0 text-left lg:text-right">
                    <p className="break-words font-semibold text-slate-900">
                      {lembrete.Data_Hora}
                    </p>

                    <p className="break-words text-sm text-amber-600">
                      {lembrete.Status}
                    </p>
                  </div>
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
