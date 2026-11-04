
const FUSO_HORARIO = "America/Fortaleza";

// Interpreta a data e a hora registradas pelo backend.
function interpretarDataHora(valor) {
  const texto = String(valor || "").trim();

  const partes = texto.match(
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/
  );

  if (!partes) {
    return null;
  }

  const [, ano, mes, dia, hora, minuto] = partes;

  return {
    dia: `${ano}-${mes}-${dia}`,
    instante: `${ano}-${mes}-${dia}T${hora}:${minuto}`,
    exibicao: `${dia}/${mes}/${ano} às ${hora}:${minuto}`,
  };
}

// Obtém a data e a hora atuais no fuso de Fortaleza.
function obterAgoraFortaleza() {
  const formatador = new Intl.DateTimeFormat("pt-BR", {
    timeZone: FUSO_HORARIO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const partes = formatador.formatToParts(new Date());

  const valores = Object.fromEntries(
    partes.map((parte) => [parte.type, parte.value])
  );

  const { year, month, day, hour, minute } = valores;

  return {
    dia: `${year}-${month}-${day}`,
    instante: `${year}-${month}-${day}T${hour}:${minute}`,
  };
}

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

  const agora = obterAgoraFortaleza();

  // Separa os lembretes que ainda pertencem
  // à agenda de hoje ou dos próximos dias.
  const lembretesEmAberto = lembretesDoCuidador
    .map((lembrete) => {
      const data = interpretarDataHora(
        lembrete.Data_Hora
      );

      return {
        ...lembrete,
        dataFormatada: data,
      };
    })
    .filter((lembrete) => {
      if (!lembrete.dataFormatada) {
        return false;
      }

      const administrado =
        lembrete.Status === "Administrado";

      const diaValido =
        lembrete.dataFormatada.dia >= agora.dia;

      return !administrado && diaValido;
    });

  // Considera pendente o horário de hoje
  // que já passou e ainda não foi confirmado.
  const lembretesPendentes = lembretesEmAberto.filter(
    (lembrete) =>
      lembrete.dataFormatada.dia === agora.dia &&
      lembrete.dataFormatada.instante < agora.instante
  );

  // Mostra os próximos cinco horários em aberto.
  const proximosLembretes = [...lembretesEmAberto]
    .sort((a, b) =>
      a.dataFormatada.instante.localeCompare(
        b.dataFormatada.instante
      )
    )
    .slice(0, 5);

  const encontrarMedicamento = (medicamentoId) => {
    return medicamentosDoCuidador.find(
      (medicamento) =>
        medicamento.Id === medicamentoId
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
        {/* QUANTIDADE DE IDOSOS */}
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

        {/* LEMBRETES PENDENTES DE HOJE */}
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">
            Lembretes
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {lembretesPendentes.length}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            pendentes hoje
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
            Horários de hoje e dos próximos dias.
          </p>
        </div>

        {proximosLembretes.length === 0 ? (
          <div className="min-w-0 rounded-xl bg-slate-50 p-4 text-center sm:p-6">
            <p className="break-words text-sm text-slate-500">
              Não há lembretes em aberto para hoje
              ou para os próximos dias.
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

              const pendente =
                lembrete.dataFormatada.dia === agora.dia &&
                lembrete.dataFormatada.instante <
                  agora.instante;

              return (
                <div
                  key={lembrete.Id}
                  className="flex min-w-0 flex-col gap-2 rounded-xl border border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between"
                >
                  {/* MEDICAMENTO E IDOSO */}
                  <div className="min-w-0">
                    <p className="break-words font-semibold text-slate-900">
                      {medicamento?.Nome || "Medicamento"}
                    </p>

                    <p className="break-words text-sm text-slate-500">
                      {idoso?.Nome || "Idoso não encontrado"}
                    </p>
                  </div>

                  {/* DATA E SITUAÇÃO */}
                  <div className="min-w-0 text-left lg:text-right">
                    <p className="break-words font-semibold text-slate-900">
                      {lembrete.dataFormatada.exibicao}
                    </p>

                    <p
                      className={`mt-1 text-sm font-medium ${
                        pendente
                          ? "text-amber-600"
                          : "text-blue-600"
                      }`}
                    >
                      {pendente
                        ? "Pendente"
                        : "Aguardando horário"}
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
