const db = require("../config/database");

// ========================================
// VALIDAR AGENDA DO MEDICAMENTO
// ========================================

function validarAgenda(agenda) {
  if (!Array.isArray(agenda)) {
    return "A agenda deve ser uma lista de dias e horários.";
  }

  const combinacoes = new Set();

  for (const item of agenda) {
    const diaSemana = Number(item?.Dia_Semana);
    const horario = item?.Horario;

    if (
      !Number.isInteger(diaSemana) ||
      diaSemana < 0 ||
      diaSemana > 6
    ) {
      return "Cada dia da agenda deve ser um número de 0 (domingo) a 6 (sábado).";
    }

    if (
      typeof horario !== "string" ||
      !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(horario)
    ) {
      return "Cada horário deve estar no formato HH:MM.";
    }

    const chave = `${diaSemana}-${horario}`;

    if (combinacoes.has(chave)) {
      return "A agenda não pode conter o mesmo horário duas vezes no mesmo dia.";
    }

    combinacoes.add(chave);
  }

  return null;
}

// ========================================
// SALVAR AGENDA DO MEDICAMENTO
// ========================================

function salvarAgendaMedicamento(medicamentoId, agenda) {
  db.prepare(`
    DELETE FROM "MEDICAMENTO_AGENDA"
    WHERE "Medicamento_Id" = ?
  `).run(medicamentoId);

  const inserirHorario = db.prepare(`
    INSERT INTO "MEDICAMENTO_AGENDA"
    ("Medicamento_Id", "Dia_Semana", "Horario")
    VALUES (?, ?, ?)
  `);

  for (const item of agenda) {
    inserirHorario.run(
      medicamentoId,
      Number(item.Dia_Semana),
      item.Horario
    );
  }
}

// ========================================
// BUSCAR AGENDA DO MEDICAMENTO
// ========================================

function buscarAgendaMedicamento(medicamentoId) {
  return db.prepare(`
    SELECT
      "Id",
      "Medicamento_Id",
      "Dia_Semana",
      "Horario"
    FROM "MEDICAMENTO_AGENDA"
    WHERE "Medicamento_Id" = ?
    ORDER BY "Dia_Semana", "Horario"
  `).all(medicamentoId);
}

// ========================================
// VERIFICAR ALTERAÇÃO DA AGENDA
// ========================================

function agendaMedicamentoFoiAlterada(medicamentoId, novaAgenda) {
  const agendaAtual = buscarAgendaMedicamento(medicamentoId)
    .map((item) => `${Number(item.Dia_Semana)}-${item.Horario}`)
    .sort();

  const agendaNova = novaAgenda
    .map((item) => `${Number(item.Dia_Semana)}-${item.Horario}`)
    .sort();

  return JSON.stringify(agendaAtual) !== JSON.stringify(agendaNova);
}

// ========================================
// EXPORTAR FUNÇÕES
// ========================================

module.exports = {
  validarAgenda,
  salvarAgendaMedicamento,
  buscarAgendaMedicamento,
  agendaMedicamentoFoiAlterada,
};