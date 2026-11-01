
import { useState } from "react";

import {
  obterSituacaoLembrete,
  formatarDataLembrete,
  formatarDataEvento,
} from "../utils/lembretes";

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

  const podeConfirmar =
    situacao === "Pendente" ||
    situacao === "Data não informada";

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
        {(administrado || podeConfirmar) && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={alterarAdministracao}
              disabled={salvando}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                administrado
                  ? "border border-slate-300 bg-white text-slate-600 hover:bg-slate-100"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {salvando
                ? "Salvando..."
                : administrado
                  ? "Desfazer confirmação"
                  : "Confirmar dose"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default LembreteItem;
