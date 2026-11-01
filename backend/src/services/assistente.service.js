const db = require("../config/database");

// ========================================
// BUSCAR CONTEXTO COMPLETO DO IDOSO
// ========================================

function buscarContextoIdoso(idosoId) {
  const idoso = db
    .prepare(`
      SELECT
        "Id",
        "Cuidador_Id",
        "Nome",
        "Data Nascimento",
        "Observacoes"
      FROM "IDOSO"
      WHERE "Id" = ?
      LIMIT 1
    `)
    .get(idosoId);

  if (!idoso) {
    return null;
  }

  // Nomes dos dias da semana.
  const nomesDias = [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
  ];

  // Consulta somente medicamentos ativos.
  const medicamentos = db
    .prepare(`
      SELECT
        "Id",
        "Idoso_Id",
        "Nome",
        "Dosagem",
        "Horario",
        "Frequencia",
        "Observacoes"
      FROM "MEDICAMENTO"
      WHERE "Idoso_Id" = ?
        AND "Ativo" = 1
      ORDER BY "Horario"
    `)
    .all(idosoId)
    .map((medicamento) => {
      // Busca todos os dias e horários do medicamento.
      const agenda = db
        .prepare(`
          SELECT
            "Dia_Semana",
            "Horario"
          FROM "MEDICAMENTO_AGENDA"
          WHERE "Medicamento_Id" = ?
          ORDER BY "Dia_Semana", "Horario"
        `)
        .all(medicamento.Id)
        .map((item) => ({
          Dia_Semana: Number(item.Dia_Semana),
          Dia: nomesDias[Number(item.Dia_Semana)],
          Horario: item.Horario,
        }));

      return {
        ...medicamento,
        agenda,
      };
    });

  // Busca lembretes somente dos medicamentos ativos.
  const lembretes = db
    .prepare(`
      SELECT
        l."Id",
        l."Medicamento_Id",
        l."Data_Hora",
        l."Status",
        m."Nome" AS "Medicamento_Nome"
      FROM "LEMBRETE" l
      INNER JOIN "MEDICAMENTO" m
        ON m."Id" = l."Medicamento_Id"
      WHERE m."Idoso_Id" = ?
        AND m."Ativo" = 1
      ORDER BY l."Data_Hora"
    `)
    .all(idosoId);

  // Busca ocorrências do idoso.
  const ocorrencias = db
    .prepare(`
      SELECT
        "Id",
        "Idoso_Id",
        "Tipo",
        "Descrição",
        "Data_Hora"
      FROM "OCORRENCIA"
      WHERE "Idoso_Id" = ?
      ORDER BY "Data_Hora" DESC
    `)
    .all(idosoId);

  return {
    idoso,
    medicamentos,
    lembretes,
    ocorrencias,
  };
}

// ========================================
// EXPORTAR FUNÇÕES
// ========================================

module.exports = {
  buscarContextoIdoso,
};