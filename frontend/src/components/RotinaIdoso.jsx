import MedicamentoForm from "./MedicamentoForm";
import OcorrenciaForm from "./OcorrenciaForm";

function RotinaIdoso({
  idoso,
  medicamentos,
  lembretes,
  ocorrencias,

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
  const medicamentosDoIdoso = medicamentos.filter(
    (medicamento) => medicamento.Idoso_Id === idoso.Id
  );

  const lembretesDoIdoso = lembretes.filter((lembrete) =>
    medicamentosDoIdoso.some(
      (medicamento) => medicamento.Id === lembrete.Medicamento_Id
    )
  );

  const ocorrenciasDoIdoso = ocorrencias.filter(
    (ocorrencia) => ocorrencia.Idoso_Id === idoso.Id
  );

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

        {/* Medicamentos */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">
                  💊
                </span>

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

        {/* Lembretes */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <div className="flex items-center gap-2">
              <span className="text-xl">
                ⏰
              </span>

              <h4 className="text-lg font-semibold">
                Lembretes
              </h4>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Horários dos medicamentos
            </p>
          </div>

          <div className="space-y-3">
            {lembretesDoIdoso.map((lembrete) => (
              <div
                key={lembrete.Id}
                className="rounded-xl bg-slate-50 p-4"
              >
                <p className="font-medium text-slate-900">
                  {lembrete.Data_Hora}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Status: {lembrete.Status}
                </p>
              </div>
            ))}

            {lembretesDoIdoso.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                Nenhum lembrete cadastrado.
              </div>
            )}
          </div>
        </div>

        {/* Ocorrências */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">
                  ⚠️
                </span>

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
    </section>
  );
}

export default RotinaIdoso;