
function obterHorarioFortaleza() {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Fortaleza",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const valores = {};

  partes.forEach((parte) => {
    if (parte.type !== "literal") {
      valores[parte.type] = parte.value;
    }
  });

  return {
    data: `${valores.year}-${valores.month}-${valores.day}`,
    hora: `${valores.hour}:${valores.minute}`,
  };
}

// Obtém a data de um lembrete.
export function obterDataLembrete(valor) {
  if (!valor) return null;

  const correspondencia = String(valor).match(
    /^(\d{4}-\d{2}-\d{2})/
  );

  return correspondencia ? correspondencia[1] : null;
}

// Identifica automaticamente o estado atual.
export function obterSituacaoLembrete(lembrete) {
  if (!lembrete) return "Indefinido";

  const statusAntigo = String(lembrete.Status || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  // Compatibilidade com confirmações anteriores.
  const administrado =
    Boolean(lembrete.Administrado_Em) ||
    statusAntigo === "realizado" ||
    statusAntigo === "concluido";

  if (administrado) {
    return "Administrado";
  }

  const dataProgramada = obterDataLembrete(
    lembrete.Data_Hora
  );

  // Registros antigos sem data não podem ser
  // classificados automaticamente.
  if (!dataProgramada) {
    return "Data não informada";
  }

  const horarioAtual = obterHorarioFortaleza();

  // O dia programado já terminou.
  if (dataProgramada < horarioAtual.data) {
    return "Sem confirmação";
  }

  // O lembrete pertence a um dia futuro.
  if (dataProgramada > horarioAtual.data) {
    return "Aguardando horário";
  }

  // Compara os horários do mesmo dia.
  const horarioProgramado = String(
    lembrete.Data_Hora
  ).substring(11, 16);

  if (horarioProgramado > horarioAtual.hora) {
    return "Aguardando horário";
  }

  return "Pendente";
}

// Formata a data programada no padrão brasileiro.
export function formatarDataLembrete(valor) {
  const texto = String(valor || "");

  const correspondencia = texto.match(
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/
  );

  if (!correspondencia) {
    const horario = texto.match(
      /^([01]\d|2[0-3]):([0-5]\d)$/
    );

    return horario
      ? `Data não informada · ${texto}`
      : "Data não informada";
  }

  const [, ano, mes, dia, hora, minuto] =
    correspondencia;

  return `${dia}/${mes}/${ano} às ${hora}:${minuto}`;
}

// Formata os eventos registrados no banco,
// convertendo o horário UTC para Fortaleza.
export function formatarDataEvento(valor) {
  if (!valor) return null;

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Fortaleza",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(data);
}
