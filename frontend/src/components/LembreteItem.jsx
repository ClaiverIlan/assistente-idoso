
import { useState } from "react";

import {
  obterSituacaoLembrete,
  formatarDataLembrete,
  formatarDataEvento,
} from "../utils/lembretes";

// Obtém os minutos atuais no horário de Fortaleza.
function obterMinutosAtuaisFortaleza() {
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

  const dataHora = Date.UTC(
    Number(valores.year),
    Number(valores.month) - 1,
    Number(valores.day),
    Number(valores.hour),
    Number(valores.minute)
  );

  return Math.floor(dataHora / 60000);
}

// Verifica se o lembrete está dentro da janela
// de uma hora antes do horário programado.
function estaNaJanelaConfirmacao(lembrete) {
  const correspondencia = String(
    lembrete?.Data_Hora || ""
  ).match(
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/
  );

  if (!correspondencia) {
    return false;
  }

  const [, ano, mes, dia, hora, minuto] =
    correspondencia;

  const dataHoraProgramada = Date.UTC(
    Number(ano),
    Number(mes) - 1,
    Number(dia),
    Number(hora),
    Number(minuto)
  );

  const minutosProgramados = Math.floor(
    dataHoraProgramada / 60000
  );

  const minutosAtuais = obterMinutosAtuaisFortaleza();

  const minutosRestantes =
    minutosProgramados - minutosAtuais;

  return minutosRestantes >= 0 && minutosRestantes <= 60;
}

function LembreteItem({
  lembrete,
  medicamento,
  onMarcarLembreteAdministrado,
}) {
  const [salvando, setSalvando] = useState(false);

  // Identificação do medicamento.
  const nomeMedicamento =
    medicamento?.Nome || "Medicamento não identificado";

  const dosagem = medicamento?.Dosagem || "";

  // Classificação automática do lembrete.
  const situacao = obterSituacaoLembrete(lembrete);

  const administrado = situacao === "Administrado";

  // Verifica se o medicamento entrou na janela de confirmação.
  const dentroJanelaConfirmacao =
    situacao === "Aguardando horário" &&
    estaNaJanelaConfirmacao(lembrete);

  // Permite confirmar uma hora antes, no horário
  // programado e depois dele.
  const podeConfirmar =
    situacao === "Pendente" ||
    situacao === "Data não informada" ||
    dentroJanelaConfirmacao;

  // Mantém o botão visível nos lembretes futuros.
  const mostrarBotao =
    administrado ||
    situacao === "Pendente" ||
    situacao === "Data não informada" ||
    situacao === "Aguardando horário";

  // Data da administração.
  const dataAdministracao = formatarDataEvento(
    lembrete.Administrado_Em
  );

  // Confirma ou desfaz a administração.
  const alterarAdministracao = async () => {
    if (salvando || (!administrado && !podeConfirmar)) {
      return;
    }

    try {
      setSalvando(true);

      await onMarcarLembreteAdministrado(
        lembrete,
        !administrado
      );
    } catch (erro) {
      console.error(
        "Erro ao atualizar administração:",
        erro
      );
    } finally {
      setSalvando(false);
    }
  };

  // Cores dos status.
  const coresEstado = {
    "Aguardando horário": "bg-blue-100 text-blue-700",
    "Pendente": "bg-amber-100 text-amber-700",
    "Administrado": "bg-green-100 text-green-700",
    "Sem confirmação": "bg-slate-100 text-slate-700",
    "Data não informada": "bg-amber-100 text-amber-700",
  };

  // Aparência do botão conforme sua disponibilidade.
  const estiloBotao = administrado
    ? "border border-slate-300 bg-white text-slate-600 hover:bg-slate-100"
    : podeConfirmar
      ? "bg-green-600 text-white hover:bg-green-700"
      : "bg-slate-200 text-slate-500 cursor-not-allowed";

  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <div className="flex flex-col gap-3">

        {/* Identificação do medicamento */}
        <div>
          <p className="font-semibold text-slate-900">
            💊 {nomeMedicamento}
            {dosagem && ` — ${dosagem}`}
          </p>

          <p className="mt-1 text-sm text-slate-600">
            {formatarDataLembrete(lembrete.Data_Hora)}
          </p>
        </div>

        {/* Status da administração */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm text-slate-600">
            Administração
          </span>

          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
              coresEstado[situacao] ||
              "bg-slate-100 text-slate-700"
            }`}
          >
            {situacao}
          </span>
        </div>

        {/* Data e hora da confirmação */}
        {dataAdministracao && (
          <p className="text-xs text-slate-400">
            Administrado em {dataAdministracao}
          </p>
        )}

        {/* Botão de administração */}
        {mostrarBotao && (
          <div className="flex flex-col items-end gap-1">
            <button
              type="button"
              onClick={alterarAdministracao}
              disabled={
                salvando ||
                (!administrado && !podeConfirmar)
              }
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-100 ${estiloBotao}`}
            >
              {salvando
                ? "Salvando..."
                : administrado
                  ? "Desfazer confirmação"
                  : "Confirmar dose"}
            </button>

            {/* Orientação para lembretes futuros */}
            {situacao === "Aguardando horário" &&
              !dentroJanelaConfirmacao && (
                <p className="max-w-64 text-right text-[11px] leading-4 text-slate-400">
                  O botão será liberado 1 hora antes do horário do medicamento.
                </p>
              )}
          </div>
        )}

      </div>
    </div>
  );
}

export default LembreteItem;
