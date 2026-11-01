const DIAS_SEMANA = [
  { valor: 0, nome: "Domingo" },
  { valor: 1, nome: "Segunda-feira" },
  { valor: 2, nome: "Terça-feira" },
  { valor: 3, nome: "Quarta-feira" },
  { valor: 4, nome: "Quinta-feira" },
  { valor: 5, nome: "Sexta-feira" },
  { valor: 6, nome: "Sábado" },
];

function calcularFrequencia(agenda) {
  const dias = [
    ...new Set(
      agenda.map((item) => Number(item.Dia_Semana))
    ),
  ].sort((a, b) => a - b);

  if (dias.length === 0) {
    return "Sem programação";
  }

  if (dias.length === 7) {
    return "Todos os dias";
  }

  if (
    dias.length === 5 &&
    dias.every((dia, indice) => dia === indice + 1)
  ) {
    return "Segunda a sexta";
  }

  return dias
    .map(
      (dia) =>
        DIAS_SEMANA.find((item) => item.valor === dia)?.nome
    )
    .filter(Boolean)
    .join(", ");
}

function MedicamentoForm({
  modo,
  dados,
  onChange,
  onSubmit,
  onCancelar,
}) {
  const agenda = Array.isArray(dados?.agenda)
    ? dados.agenda
    : [];

  // Atualiza os campos comuns do medicamento.
  const atualizarCampo = (campo, valor) => {
    onChange({
      ...dados,
      [campo]: valor,
    });
  };

  // Atualiza a agenda e mantém os campos antigos
  // Horario e Frequencia compatíveis com o backend.
  const atualizarAgenda = (novaAgenda) => {
    const primeiroHorario =
      novaAgenda.find((item) => item.Horario)?.Horario || "";

    onChange({
      ...dados,
      agenda: novaAgenda,
      Horario: primeiroHorario,
      Frequencia: calcularFrequencia(novaAgenda),
    });
  };

  // Marca ou desmarca um dia da semana.
  const alternarDia = (dia, selecionado) => {
    if (selecionado) {
      atualizarAgenda([
        ...agenda,
        {
          Dia_Semana: dia,
          Horario: "",
        },
      ]);
    } else {
      atualizarAgenda(
        agenda.filter(
          (item) => Number(item.Dia_Semana) !== dia
        )
      );
    }
  };

  // Adiciona outro horário para um dia já selecionado.
  const adicionarHorario = (dia) => {
    atualizarAgenda([
      ...agenda,
      {
        Dia_Semana: dia,
        Horario: "",
      },
    ]);
  };

  // Altera um horário específico.
  const alterarHorario = (indice, horario) => {
    const novaAgenda = agenda.map((item, index) =>
      index === indice
        ? { ...item, Horario: horario }
        : item
    );

    atualizarAgenda(novaAgenda);
  };

  // Remove um horário da agenda.
  const removerHorario = (indice) => {
    const novaAgenda = agenda.filter(
      (_, index) => index !== indice
    );

    atualizarAgenda(novaAgenda);
  };

  // Valida o formulário antes de enviar.
  const handleSubmit = (evento) => {
    evento.preventDefault();

    if (!dados.Nome?.trim()) {
      alert("Informe o nome do medicamento.");
      return;
    }

    // Impede salvar um dia selecionado sem horário.
    const possuiHorarioIncompleto = agenda.some(
      (item) => !item.Horario
    );

    if (possuiHorarioIncompleto) {
      alert(
        "Preencha todos os horários dos dias selecionados."
      );
      return;
    }

    // Impede horários duplicados no mesmo dia.
    const combinacoes = new Set();

    for (const item of agenda) {
      const chave =
        `${item.Dia_Semana}-${item.Horario}`;

      if (combinacoes.has(chave)) {
        alert(
          "Existe um horário repetido no mesmo dia da semana."
        );
        return;
      }

      combinacoes.add(chave);
    }

    // Permite cadastrar medicamento sem lembretes,
    // desde que o cuidador confirme essa escolha.
    if (agenda.length === 0) {
      const continuar = window.confirm(
        "Nenhum dia ou horário foi programado. " +
        "Esse medicamento não terá lembretes automáticos. Deseja continuar?"
      );

      if (!continuar) {
        return;
      }
    }

    onSubmit(evento);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="mb-5">
        <h3 className="text-xl font-bold text-slate-900">
          {modo === "editar"
            ? "Editar medicamento"
            : "Adicionar medicamento"}
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Informe os dados e a programação do medicamento.
        </p>
      </div>

      {/* Nome */}
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Nome do medicamento *
        </label>

        <input
          type="text"
          value={dados.Nome || ""}
          onChange={(evento) =>
            atualizarCampo("Nome", evento.target.value)
          }
          placeholder="Ex.: Medicamento"
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
        />
      </div>

      {/* Dosagem */}
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Dosagem
        </label>

        <input
          type="text"
          value={dados.Dosagem || ""}
          onChange={(evento) =>
            atualizarCampo("Dosagem", evento.target.value)
          }
          placeholder="Conforme informação da prescrição"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
        />
      </div>

      {/* Agenda */}
      <div className="mb-5">
        <div className="mb-3">
          <h4 className="font-semibold text-slate-800">
            Programação semanal
          </h4>

          <p className="mt-1 text-sm text-slate-500">
            Selecione os dias em que o medicamento deve
            ter lembretes e informe os horários de cada dia.
          </p>
        </div>

        <div className="space-y-3">
          {DIAS_SEMANA.map((dia) => {
            const horariosDoDia = agenda
              .map((item, indice) => ({
                ...item,
                indiceOriginal: indice,
              }))
              .filter(
                (item) =>
                  Number(item.Dia_Semana) === dia.valor
              );

            const selecionado = horariosDoDia.length > 0;

            return (
              <div
                key={dia.valor}
                className="rounded-xl border border-slate-200 p-3"
              >
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selecionado}
                    onChange={(evento) =>
                      alternarDia(
                        dia.valor,
                        evento.target.checked
                      )
                    }
                    className="h-4 w-4 rounded border-slate-300"
                  />

                  <span className="font-medium text-slate-800">
                    {dia.nome}
                  </span>
                </label>

                {selecionado && (
                  <div className="mt-3 space-y-2 pl-6">
                    {horariosDoDia.map((item) => (
                      <div
                        key={item.indiceOriginal}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="time"
                          value={item.Horario || ""}
                          onChange={(evento) =>
                            alterarHorario(
                              item.indiceOriginal,
                              evento.target.value
                            )
                          }
                          className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removerHorario(
                              item.indiceOriginal
                            )
                          }
                          className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                        >
                          Remover
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() =>
                        adicionarHorario(dia.valor)
                      }
                      className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      + Adicionar outro horário
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-3 rounded-lg bg-slate-50 p-3">
          <p className="text-sm font-medium text-slate-700">
            Frequência identificada:
          </p>

          <p className="mt-1 text-sm text-slate-600">
            {calcularFrequencia(agenda)}
          </p>
        </div>
      </div>

      {/* Observações */}
      <div className="mb-5">
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Observações
        </label>

        <textarea
          value={dados.Observacoes || ""}
          onChange={(evento) =>
            atualizarCampo(
              "Observacoes",
              evento.target.value
            )
          }
          placeholder="Observações adicionais..."
          rows={3}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
        />
      </div>

      {/* Botões */}
      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={onCancelar}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          {modo === "editar"
            ? "Salvar alterações"
            : "Cadastrar medicamento"}
        </button>
      </div>
    </form>
  );
}

export default MedicamentoForm;