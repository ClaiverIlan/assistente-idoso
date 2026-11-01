const db = require("../config/database");

// ========================================
// OBTER DATA ATUAL DE FORTALEZA
// ========================================

function obterDataAtualFortaleza() {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Fortaleza",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const valores = {};

  for (const parte of partes) {
    if (parte.type !== "literal") {
      valores[parte.type] = parte.value;
    }
  }

  const data = `${valores.year}-${valores.month}-${valores.day}`;

  const diaSemana = new Date(
    Date.UTC(
      Number(valores.year),
      Number(valores.month) - 1,
      Number(valores.day)
    )
  ).getUTCDay();

  return { data, diaSemana };
}

// ========================================
// OBTER DATA E HORA ATUAL DE FORTALEZA
// ========================================

function obterDataHoraAtualFortaleza() {
  const partes = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Fortaleza",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const valores = {};

  for (const parte of partes) {
    if (parte.type !== "literal") {
      valores[parte.type] = parte.value;
    }
  }

  return `${valores.year}-${valores.month}-${valores.day} ${valores.hour}:${valores.minute}:${valores.second}`;
}

// ========================================
// GERAR LEMBRETES DOS PRÓXIMOS SETE DIAS
// ========================================

function gerarLembretesProximosSeteDias({
  transacaoAtiva = false,
} = {}) {
  const { data: dataAtual } = obterDataAtualFortaleza();

  // Consulta somente as agendas dos medicamentos ativos.
  const agendas = db.prepare(`
    SELECT
      agenda."Medicamento_Id",
      agenda."Dia_Semana",
      agenda."Horario"
    FROM "MEDICAMENTO_AGENDA" agenda
    INNER JOIN "MEDICAMENTO" medicamento
      ON medicamento."Id" = agenda."Medicamento_Id"
    WHERE medicamento."Ativo" = 1
    ORDER BY agenda."Dia_Semana", agenda."Horario"
  `).all();

  // Organiza os horários por dia da semana.
  const agendaPorDia = new Map();

  for (const item of agendas) {
    const diaSemana = Number(item.Dia_Semana);

    if (!agendaPorDia.has(diaSemana)) {
      agendaPorDia.set(diaSemana, []);
    }

    agendaPorDia.get(diaSemana).push(item);
  }

  // Procura lembretes já existentes.
  const buscarExistente = db.prepare(`
    SELECT "Id"
    FROM "LEMBRETE"
    WHERE "Medicamento_Id" = ?
      AND datetime("Data_Hora") = datetime(?)
    LIMIT 1
  `);

  // Insere novos lembretes.
  const inserirLembrete = db.prepare(`
    INSERT INTO "LEMBRETE"
    ("Medicamento_Id", "Data_Hora", "Status")
    VALUES (?, ?, 'Pendente')
  `);

  // Usa a data de Fortaleza como ponto inicial.
  const dataBase = new Date(`${dataAtual}T00:00:00.000Z`);

  // Permite utilizar a função dentro de outra transação.
  if (!transacaoAtiva) {
    db.exec("BEGIN");
  }

  try {
    // Inclui hoje e os próximos seis dias.
    for (let deslocamento = 0; deslocamento < 7; deslocamento++) {
      const dataProgramada = new Date(dataBase);

      dataProgramada.setUTCDate(
        dataProgramada.getUTCDate() + deslocamento
      );

      const data = dataProgramada.toISOString().slice(0, 10);
      const diaSemana = dataProgramada.getUTCDay();

      const horariosDoDia = agendaPorDia.get(diaSemana) || [];

      for (const item of horariosDoDia) {
        const dataHora = `${data}T${item.Horario}:00`;

        const existente = buscarExistente.get(
          item.Medicamento_Id,
          dataHora
        );

        if (!existente) {
          inserirLembrete.run(
            item.Medicamento_Id,
            dataHora
          );
        }
      }
    }

    if (!transacaoAtiva) {
      db.exec("COMMIT");
    }

  } catch (erro) {
    if (!transacaoAtiva) {
      db.exec("ROLLBACK");
    }

    throw erro;
  }
}

// ========================================
// EXPORTAR FUNÇÕES
// ========================================

module.exports = {
  obterDataAtualFortaleza,
  obterDataHoraAtualFortaleza,
  gerarLembretesProximosSeteDias,
};