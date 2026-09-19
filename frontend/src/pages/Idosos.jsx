import IdosoCard from "../components/IdosoCard";
import IdosoForm from "../components/IdosoForm";
import RotinaIdoso from "../components/RotinaIdoso";

function Idosos({
  idosos,
  idosoSelecionado,
  setIdosoSelecionado,
  mostrarFormularioIdoso,
  setMostrarFormularioIdoso,
  novoIdoso,
  setNovoIdoso,
  cadastrarIdoso,
  mostrarFormularioEdicao,
  setMostrarFormularioEdicao,
  idosoEditando,
  setIdosoEditando,
  editarIdoso,
  prepararEdicaoIdoso,
  excluirIdoso,
  medicamentos,
  lembretes,
  ocorrencias,
  mostrarFormularioMedicamento,
  mostrarFormularioEdicaoMedicamento,
  novoMedicamento,
  medicamentoEditando,
  setMostrarFormularioMedicamento,
  setMostrarFormularioEdicaoMedicamento,
  setNovoMedicamento,
  setMedicamentoEditando,
  cadastrarMedicamento,
  editarMedicamento,
  excluirMedicamento,
  prepararEdicaoMedicamento,
  mostrarFormularioOcorrencia,
  mostrarFormularioEdicaoOcorrencia,
  novaOcorrencia,
  ocorrenciaEditando,
  setMostrarFormularioOcorrencia,
  setMostrarFormularioEdicaoOcorrencia,
  setNovaOcorrencia,
  setOcorrenciaEditando,
  cadastrarOcorrencia,
  editarOcorrencia,
  excluirOcorrencia,
  prepararEdicaoOcorrencia,
}) {
  return (
    <div>
      {/* Cabeçalho */}

      <header className="mb-8">
        <p className="text-sm font-medium text-slate-500">
          Gerenciamento
        </p>

        <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          Seus idosos
        </h2>

        <p className="mt-2 text-slate-500">
          Cadastre e acompanhe as informações dos idosos sob seus cuidados.
        </p>
      </header>

      {/* Lista de idosos */}

      <section className="mb-8">

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <h3 className="text-xl font-semibold text-slate-900">
              Idosos cadastrados
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Selecione um idoso para visualizar sua rotina.
            </p>
          </div>

          <button
            onClick={() => {
              setMostrarFormularioIdoso(true);
              setMostrarFormularioEdicao(false);
            }}
            className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            + Adicionar idoso
          </button>

        </div>

        {/* Formulário de cadastro */}

        {mostrarFormularioIdoso && (
          <IdosoForm
            modo="adicionar"
            dados={novoIdoso}
            onChange={setNovoIdoso}
            onSubmit={cadastrarIdoso}
            onCancelar={() => {
              setMostrarFormularioIdoso(false);

              setNovoIdoso({
                Nome: "",
                "Data Nascimento": "",
                Observacoes: "",
              });
            }}
          />
        )}

        {/* Formulário de edição */}

        {mostrarFormularioEdicao && (
          <IdosoForm
            modo="editar"
            dados={idosoEditando}
            onChange={setIdosoEditando}
            onSubmit={editarIdoso}
            onCancelar={() => {
              setMostrarFormularioEdicao(false);
            }}
          />
        )}

        {/* Cards */}

        {idosos.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <div className="mx-auto max-w-md">

              <div className="text-4xl">
                👥
              </div>

              <h3 className="mt-4 text-xl font-semibold text-slate-900">
                Nenhum idoso cadastrado
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Cadastre um idoso para começar a acompanhar sua rotina.
              </p>

            </div>
          </section>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {idosos.map((idoso) => (
              <IdosoCard
                key={idoso.Id}
                idoso={idoso}
                selecionado={
                  idosoSelecionado?.Id === idoso.Id
                }
                onSelecionar={setIdosoSelecionado}
                onEditar={prepararEdicaoIdoso}
                onExcluir={excluirIdoso}
              />
            ))}

          </div>
        )}

      </section>

      {/* Rotina do idoso */}

      {idosoSelecionado ? (
        <RotinaIdoso
          idoso={idosoSelecionado}
          medicamentos={medicamentos}
          lembretes={lembretes}
          ocorrencias={ocorrencias}

          mostrarFormularioMedicamento={
            mostrarFormularioMedicamento
          }

          mostrarFormularioEdicaoMedicamento={
            mostrarFormularioEdicaoMedicamento
          }

          novoMedicamento={novoMedicamento}

          medicamentoEditando={medicamentoEditando}

          setMostrarFormularioMedicamento={
            setMostrarFormularioMedicamento
          }

          setMostrarFormularioEdicaoMedicamento={
            setMostrarFormularioEdicaoMedicamento
          }

          setNovoMedicamento={setNovoMedicamento}

          setMedicamentoEditando={setMedicamentoEditando}

          onCadastrarMedicamento={
            cadastrarMedicamento
          }

          onEditarMedicamento={
            editarMedicamento
          }

          onExcluirMedicamento={
            excluirMedicamento
          }

          onPrepararEdicaoMedicamento={
            prepararEdicaoMedicamento
          }

          /* Ocorrências */

          mostrarFormularioOcorrencia={
            mostrarFormularioOcorrencia
          }

          mostrarFormularioEdicaoOcorrencia={
            mostrarFormularioEdicaoOcorrencia
          }

          novaOcorrencia={novaOcorrencia}

          ocorrenciaEditando={ocorrenciaEditando}

          setMostrarFormularioOcorrencia={
            setMostrarFormularioOcorrencia
          }

          setMostrarFormularioEdicaoOcorrencia={
            setMostrarFormularioEdicaoOcorrencia
          }

          setNovaOcorrencia={
            setNovaOcorrencia
          }

          setOcorrenciaEditando={
            setOcorrenciaEditando
          }

          onCadastrarOcorrencia={
            cadastrarOcorrencia
          }

          onEditarOcorrencia={
            editarOcorrencia
          }

          onExcluirOcorrencia={
            excluirOcorrencia
          }

          onPrepararEdicaoOcorrencia={
            prepararEdicaoOcorrencia
          }
        />
      ) : (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <div className="mx-auto max-w-md">

            <div className="text-4xl">
              👋
            </div>

            <h3 className="mt-4 text-xl font-semibold text-slate-900">
              Selecione um idoso
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Escolha um dos idosos acima para visualizar
              medicamentos, lembretes e ocorrências.
            </p>

          </div>
        </section>
      )}
    </div>
  );
}

export default Idosos;