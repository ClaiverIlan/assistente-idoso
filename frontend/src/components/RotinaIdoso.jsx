
import { useState } from "react";

import MedicamentoForm from "./MedicamentoForm";
import OcorrenciaForm from "./OcorrenciaForm";
import LembreteItem from "./LembreteItem";

import {
  obterDataLembrete,
  formatarDataLembrete,
  formatarDataEvento,
} from "../utils/lembretes";

// Obtém a data atual de Fortaleza.
function obterHojeFortaleza() {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Fortaleza",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const valores = {};

  partes.forEach((parte) => {
    if (parte.type !== "literal") {
      valores[parte.type] = parte.value;
    }
  });

  return `${valores.year}-${valores.month}-${valores.day}`;
}

function RotinaIdoso({
  idoso,
  medicamentos,
  lembretes,
  ocorrencias,
  onMarcarLembreteAdministrado,

  // Histórico
  historicoLembretes,
  carregandoHistorico,
  erroHistorico,
  onCarregarHistorico,
  onLimparHistorico,

  // Medicamentos
  mostrarFormularioMedicamento,
  mostrarFormularioEdicaoMedicamento,
  novoMedicamento,
  medicamentoEditando,
  setMostrarFormularioMedicamento,
  setMostrarFormularioEdicaoMedicamento,
  setNovoMedicamento,
  setMedicamentoEditando,
  onCadastrarMedicamento,
  onEditarMedicamento,
  onExcluirMedicamento,
  onPrepararEdicaoMedicamento,

  // Ocorrências
  mostrarFormularioOcorrencia,
  mostrarFormularioEdicaoOcorrencia,
  novaOcorrencia,
  ocorrenciaEditando,
  setMostrarFormularioOcorrencia,
  setMostrarFormularioEdicaoOcorrencia,
  setNovaOcorrencia,
  setOcorrenciaEditando,
  onCadastrarOcorrencia,
  onEditarOcorrencia,
  onExcluirOcorrencia,
  onPrepararEdicaoOcorrencia,
}) {
  const [mostrarHistorico, setMostrarHistorico] = useState(false);

  const hoje = obterHojeFortaleza();

  const medicamentosDoIdoso = medicamentos.filter(
    (medicamento) => medicamento.Idoso_Id === idoso.Id
  );

  const lembretesDoIdoso = lembretes.filter((lembrete) =>
    medicamentosDoIdoso.some(
      (medicamento) =>
        medicamento.Id === lembrete.Medicamento_Id
    )
  );

  // A rotina atual mostra somente hoje e os próximos dias.
  // Registros antigos e registros sem data ficam no histórico.
  const lembretesDaRotina = lembretesDoIdoso.filter(
    (lembrete) => {
      const data = obterDataLembrete(lembrete.Data_Hora);

      return data && data >= hoje;
    }
  );

  const ocorrenciasDoIdoso = ocorrencias.filter(
    (ocorrencia) => ocorrencia.Idoso_Id === idoso.Id
  );

  // Abre o histórico do idoso selecionado.
  const abrirHistorico = async () => {
    setMostrarHistorico(true);

    try {
      await onCarregarHistorico(idoso.Id);
    } catch (erro) {
      console.error("Erro ao abrir histórico:", erro);
    }
  };

  // Fecha o histórico e limpa seus dados.
  const fecharHistorico = () => {
    setMostrarHistorico(false);
    onLimparHistorico();
  };

  const registrosHistoricos =
    historicoLembretes?.lembretes || [];

  const acoesHistoricas =
    historicoLembretes?.acoes || [];

  const registrosSemData =
    historicoLembretes?.registrosSemData || [];

  return (
    <section>
      <div className="mb-6 flex flex-col gap-1">
        <p className="text-sm font-medium text-slate-500">
          Rotina do idoso
        </p>

        <h3 className="text-2xl font-bold text-slate-900">
          {idoso.Nome}
        </h3>
      </div>

      {/* Formulário de adicionar medicamento */}
      {mostrarFormularioMedicamento && (
        <MedicamentoForm
          modo="adicionar"
          dados={novoMedicamento}
          onChange={setNovoMedicamento}
          onSubmit={onCadastrarMedicamento}
          onCancelar={() => {
            setMostrarFormularioMedicamento(false);

            setNovoMedicamento({
              Nome: "",
              Dosagem: "",
              Horario: "",
              Frequencia: "",
              Observacoes: "",
            });
          }}
        />
      )}

      {/* Formulário de editar medicamento */}
      {mostrarFormularioEdicaoMedicamento && (
        <MedicamentoForm
          modo="editar"
          dados={medicamentoEditando}
          onChange={setMedicamentoEditando}
          onSubmit={onEditarMedicamento}
          onCancelar={() => {
            setMostrarFormularioEdicaoMedicamento(false);
          }}
        />
      )}

      {/* Formulário de adicionar ocorrência */}
      {mostrarFormularioOcorrencia && (
        <OcorrenciaForm
          modo="adicionar"
          dados={novaOcorrencia}
          onChange={setNovaOcorrencia}
          onSubmit={onCadastrarOcorrencia}
          onCancelar={() => {
            setMostrarFormularioOcorrencia(false);

            setNovaOcorrencia({
              Tipo: "",
              "Descrição": "",
              Data_Hora: "",
            });
          }}
        />
      )}

      {/* Formulário de editar ocorrência */}
      {mostrarFormularioEdicaoOcorrencia && (
        <OcorrenciaForm
          modo="editar"
          dados={ocorrenciaEditando}
          onChange={setOcorrenciaEditando}
          onSubmit={onEditarOcorrencia}
          onCancelar={() => {
            setMostrarFormularioEdicaoOcorrencia(false);
          }}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-3">

        {/* MEDICAMENTOS */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">💊</span>

                <h4 className="text-lg font-semibold">
                  Medicamentos
                </h4>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Medicamentos cadastrados
              </p>
            </div>

            <button
              onClick={() => {
                setMostrarFormularioMedicamento(true);
                setMostrarFormularioEdicaoMedicamento(false);
                setMostrarFormularioOcorrencia(false);
                setMostrarFormularioEdicaoOcorrencia(false);
              }}
              className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
            >
              + Adicionar
            </button>
          </div>

          <div className="space-y-3">
            {medicamentosDoIdoso.map((medicamento) => (
              <div
                key={medicamento.Id}
                className="rounded-xl bg-slate-50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">
                      {medicamento.Nome}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {medicamento.Dosagem} ·{" "}
                      {medicamento.Horario}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {medicamento.Frequencia}
                    </p>
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() =>
                        onPrepararEdicaoMedicamento(medicamento)
                      }
                      className="rounded-lg bg-white px-2 py-1 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() =>
                        onExcluirMedicamento(medicamento)
                      }
                      className="rounded-lg bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {medicamentosDoIdoso.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                Nenhum medicamento cadastrado.
              </div>
            )}
          </div>
        </div>

        {/* LEMBRETES */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <div className="flex items-center gap-2">
              <span className="text-xl">⏰</span>

              <h4 className="text-lg font-semibold">
                Lembretes
              </h4>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Horários dos medicamentos
            </p>

            <button
              type="button"
              onClick={abrirHistorico}
              className="mt-3 text-sm font-medium text-slate-700 underline decoration-slate-300 underline-offset-4 transition hover:text-slate-900"
            >
              Ver histórico dos últimos 90 dias
            </button>
          </div>

          <div className="space-y-3">
            {lembretesDaRotina.map((lembrete) => {
              const medicamento = medicamentosDoIdoso.find(
                (item) =>
                  item.Id === lembrete.Medicamento_Id
              );

              return (
                <LembreteItem
                  key={lembrete.Id}
                  lembrete={lembrete}
                  medicamento={medicamento}
                  onMarcarLembreteAdministrado={
                    onMarcarLembreteAdministrado
                  }
                />
              );
            })}

            {lembretesDaRotina.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                Nenhum lembrete para hoje ou próximos dias.
              </div>
            )}
          </div>
        </div>

        {/* OCORRÊNCIAS */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">⚠️</span>

                <h4 className="text-lg font-semibold">
                  Ocorrências
                </h4>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Registros relacionados
              </p>
            </div>

            <button
              onClick={() => {
                setMostrarFormularioOcorrencia(true);
                setMostrarFormularioEdicaoOcorrencia(false);
                setMostrarFormularioMedicamento(false);
                setMostrarFormularioEdicaoMedicamento(false);
              }}
              className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
            >
              + Registrar
            </button>
          </div>

          <div className="space-y-3">
            {ocorrenciasDoIdoso.map((ocorrencia) => (
              <div
                key={ocorrencia.Id}
                className="rounded-xl bg-slate-50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">
                      {ocorrencia.Tipo}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {ocorrencia["Descrição"]}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {ocorrencia.Data_Hora}
                    </p>
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() =>
                        onPrepararEdicaoOcorrencia(ocorrencia)
                      }
                      className="rounded-lg bg-white px-2 py-1 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() =>
                        onExcluirOcorrencia(ocorrencia)
                      }
                      className="rounded-lg bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {ocorrenciasDoIdoso.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                Nenhuma ocorrência registrada.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* JANELA DO HISTÓRICO */}
      {mostrarHistorico && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">

            {/* Cabeçalho */}
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Histórico de medicamentos
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Últimos 90 dias · {idoso.Nome}
                </p>
              </div>

              <button
                type="button"
                onClick={fecharHistorico}
                className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100"
              >
                Fechar
              </button>
            </div>

            {/* Conteúdo com rolagem */}
            <div className="space-y-5 overflow-y-auto p-5">

              {carregandoHistorico && (
                <p className="text-sm text-slate-500">
                  Carregando histórico...
                </p>
              )}

              {erroHistorico && (
                <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
                  {erroHistorico}
                </div>
              )}

              {!carregandoHistorico &&
                !erroHistorico &&
                historicoLembretes && (
                  <>
                    <div className="text-sm text-slate-500">
                      {historicoLembretes.total} registros encontrados.
                    </div>

                    {/* Registros dos últimos 90 dias */}
                    <div>
                      <h4 className="mb-3 font-semibold text-slate-900">
                        Registros anteriores
                      </h4>

                      {registrosHistoricos.length === 0 ? (
                        <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                          Nenhum registro encontrado nesse período.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {registrosHistoricos.map((registro) => (
                            <div
                              key={registro.Id}
                              className="rounded-xl bg-slate-50 p-4"
                            >
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <div>
                                  <p className="font-semibold text-slate-900">
                                    💊 {registro.Medicamento_Nome}
                                  </p>

                                  <p className="text-sm text-slate-500">
                                    {registro.Medicamento_Dosagem}
                                  </p>

                                  <p className="mt-2 text-xs text-slate-500">
                                    {formatarDataLembrete(
                                      registro.Data_Hora
                                    )}
                                  </p>
                                </div>

                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                                    registro.Situacao === "Administrado"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-slate-200 text-slate-700"
                                  }`}
                                >
                                  {registro.Situacao}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Histórico de ações */}
                    <div>
                      <h4 className="mb-3 font-semibold text-slate-900">
                        Histórico de confirmações e alterações
                      </h4>

                      {acoesHistoricas.length === 0 ? (
                        <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                          Nenhuma confirmação ou alteração registrada.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {acoesHistoricas.map((acao) => (
                            <div
                              key={acao.Id}
                              className="rounded-xl border border-slate-200 p-3"
                            >
                              <p className="text-sm font-medium text-slate-900">
                                {acao.Medicamento_Nome} ·{" "}
                                {acao.Medicamento_Dosagem}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {acao.Acao === "ADMINISTRADO"
                                  ? "Administração confirmada"
                                  : "Confirmação desfeita"}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                {formatarDataEvento(
                                  acao.Data_Hora_Evento
                                )}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Registros antigos sem data */}
                    {registrosSemData.length > 0 && (
                      <div>
                        <h4 className="mb-2 font-semibold text-slate-900">
                          Registros antigos sem data
                        </h4>

                        <p className="mb-3 text-xs text-slate-500">
                          Esses registros foram preservados, mas não podem ser
                          posicionados dentro dos últimos 90 dias.
                        </p>

                        <div className="space-y-2">
                          {registrosSemData.map((registro) => (
                            <div
                              key={registro.Id}
                              className="rounded-xl bg-slate-50 p-3"
                            >
                              <p className="text-sm font-medium text-slate-900">
                                {registro.Medicamento_Nome} ·{" "}
                                {registro.Medicamento_Dosagem}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                Horário: {registro.Data_Hora || "Não informado"}
                              </p>

                              <span className="mt-2 inline-flex rounded-full bg-slate-200 px-3 py-1 text-xs text-slate-700">
                                Data não informada
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
            </div>

            {/* Rodapé */}
            <div className="flex justify-end border-t border-slate-200 p-4">
              <button
                type="button"
                onClick={fecharHistorico}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Fechar histórico
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default RotinaIdoso;
