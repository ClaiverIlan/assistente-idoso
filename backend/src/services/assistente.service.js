
const db = require("../config/database");

const {
  obterDataHoraAtualFortaleza,
} = require("./lembretes.service");

// ========================================
// CLASSIFICAR SITUAÇÃO DO LEMBRETE
// ========================================

function normalizarStatus(valor) {
  return String(valor || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function obterSituacaoLembrete(lembrete, dataHoraAtual) {
  const statusAntigo = normalizarStatus(lembrete.Status);

  // Preserva as confirmações já realizadas.
  const administrado =
    Boolean(lembrete.Administrado_Em) ||
    statusAntigo === "realizado" ||
    statusAntigo === "concluido";

  if (administrado) {
    return "Administrado";
  }

  // Aceita os formatos antigos e atuais de data.
  const dataHoraTexto = String(
    lembrete.Data_Hora || ""
  )
    .trim()
    .replace("T", " ");

  const correspondencia = dataHoraTexto.match(
    /^(\d{4}-\d{2}-\d{2})\s+([01]\d|2[0-3]):([0-5]\d)/
  );

  if (!correspondencia) {
    return "Data não informada";
  }

  const [, dataProgramada, hora, minuto] =
    correspondencia;

  const dataAtual = dataHoraAtual.slice(0, 10);
  const horaAtual = dataHoraAtual.slice(11, 16);

  // A data programada já passou.
  if (dataProgramada < dataAtual) {
    return "Sem confirmação";
  }

  // A data programada ainda está no futuro.
  if (dataProgramada > dataAtual) {
    return "Aguardando horário";
  }

  const horarioProgramado = `${hora}:${minuto}`;

  // Aguarda até o próximo minuto após o horário programado.
  if (horarioProgramado >= horaAtual) {
    return "Aguardando horário";
  }

  return "Pendente";
}

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

  // Referência temporal no horário de Fortaleza.
  const dataHoraAtual = obterDataHoraAtualFortaleza();

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
      // Mantém cada dia associado ao seu horário.
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
  // A situação é calculada usando a data e hora atuais.
  const lembretes = db
    .prepare(`
      SELECT
        l."Id",
        l."Medicamento_Id",
        l."Data_Hora",
        l."Status",
        l."Administrado_Em",
        m."Nome" AS "Medicamento_Nome"
      FROM "LEMBRETE" l
      INNER JOIN "MEDICAMENTO" m
        ON m."Id" = l."Medicamento_Id"
      WHERE m."Idoso_Id" = ?
        AND m."Ativo" = 1
      ORDER BY l."Data_Hora"
    `)
    .all(idosoId)
    .map((lembrete) => ({
      ...lembrete,
      Situacao: obterSituacaoLembrete(
        lembrete,
        dataHoraAtual
      ),
    }));

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
    referenciaTemporal: {
      dataHoraAtual,
      fusoHorario: "America/Fortaleza",
    },
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
