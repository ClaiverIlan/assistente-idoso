import { Navigate, useLocation } from "react-router-dom";

import Sidebar from "./components/Sidebar";

import Login from "./components/Login";

import Dashboard from "./pages/Dashboard";

import Idosos from "./pages/Idosos";

import Assistente from "./pages/Assistente";

import { useAutenticacao } from "./hooks/useAutenticacao";

import { useIdosos } from "./hooks/useIdosos";

import { useMedicamentos } from "./hooks/useMedicamentos";

import { useOcorrencias } from "./hooks/useOcorrencias";

import { useLembretes } from "./hooks/useLembretes";

function App() {
  const {
    acessoLiberado,
    cuidadorAtual,
    entrar,
    cadastrar,
    sair,
  } = useAutenticacao();

  const {
    idosos,
    idosoSelecionado,
    setIdosoSelecionado,
    mostrarFormularioIdoso,
    setMostrarFormularioIdoso,
    novoIdoso,
    setNovoIdoso,
    mostrarFormularioEdicao,
    setMostrarFormularioEdicao,
    idosoEditando,
    setIdosoEditando,
    cadastrarIdoso,
    editarIdoso,
    excluirIdoso,
    prepararEdicaoIdoso,
  } = useIdosos(cuidadorAtual);

  const {
    lembretes,
    setLembretes,
  } = useLembretes();

  const {
    medicamentos,
    mostrarFormularioMedicamento,
    setMostrarFormularioMedicamento,
    novoMedicamento,
    setNovoMedicamento,
    mostrarFormularioEdicaoMedicamento,
    setMostrarFormularioEdicaoMedicamento,
    medicamentoEditando,
    setMedicamentoEditando,
    cadastrarMedicamento,
    editarMedicamento,
    excluirMedicamento,
    prepararEdicaoMedicamento,
  } = useMedicamentos(idosoSelecionado, setLembretes);

  const location = useLocation();

  const {
    ocorrencias,
    mostrarFormularioOcorrencia,
    setMostrarFormularioOcorrencia,
    novaOcorrencia,
    setNovaOcorrencia,
    mostrarFormularioEdicaoOcorrencia,
    setMostrarFormularioEdicaoOcorrencia,
    ocorrenciaEditando,
    setOcorrenciaEditando,
    cadastrarOcorrencia: cadastrarOcorrenciaHook,
    editarOcorrencia,
    excluirOcorrencia,
    prepararEdicaoOcorrencia,
  } = useOcorrencias();

  const cadastrarOcorrencia = (evento) =>
    cadastrarOcorrenciaHook(evento, idosoSelecionado);

  // ==============================
  // SAIR DA CONTA
  // ==============================
  const handleSair = () => {
    const saiu = sair();

    if (!saiu) {
      return;
    }

    setIdosoSelecionado(null);
    setMostrarFormularioIdoso(false);
    setMostrarFormularioEdicao(false);
    setMostrarFormularioMedicamento(false);
    setMostrarFormularioEdicaoMedicamento(false);
    setMostrarFormularioOcorrencia(false);
    setMostrarFormularioEdicaoOcorrencia(false);
  };

  // ==============================
  // CUIDADOR ATUAL
  // ==============================
  const cuidador = cuidadorAtual;

  if (!acessoLiberado) {
    return (
      <Login
        onEntrar={entrar}
        onCadastrar={cadastrar}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar onSair={handleSair} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {location.pathname === "/" ? (
            <Dashboard
              cuidador={cuidador}
              idosos={idosos}
              medicamentos={medicamentos}
              lembretes={lembretes}
            />
          ) : location.pathname === "/idosos" ? (
            <Idosos
              idosos={idosos}
              idosoSelecionado={idosoSelecionado}
              setIdosoSelecionado={setIdosoSelecionado}
              mostrarFormularioIdoso={mostrarFormularioIdoso}
              setMostrarFormularioIdoso={setMostrarFormularioIdoso}
              novoIdoso={novoIdoso}
              setNovoIdoso={setNovoIdoso}
              cadastrarIdoso={cadastrarIdoso}
              mostrarFormularioEdicao={mostrarFormularioEdicao}
              setMostrarFormularioEdicao={
                setMostrarFormularioEdicao
              }
              idosoEditando={idosoEditando}
              setIdosoEditando={setIdosoEditando}
              editarIdoso={editarIdoso}
              prepararEdicaoIdoso={prepararEdicaoIdoso}
              excluirIdoso={excluirIdoso}
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
              cadastrarMedicamento={cadastrarMedicamento}
              editarMedicamento={editarMedicamento}
              excluirMedicamento={excluirMedicamento}
              prepararEdicaoMedicamento={
                prepararEdicaoMedicamento
              }
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
              setNovaOcorrencia={setNovaOcorrencia}
              setOcorrenciaEditando={setOcorrenciaEditando}
              cadastrarOcorrencia={cadastrarOcorrencia}
              editarOcorrencia={editarOcorrencia}
              excluirOcorrencia={excluirOcorrencia}
              prepararEdicaoOcorrencia={
                prepararEdicaoOcorrencia
              }
            />
          ) : location.pathname === "/assistente" ? (
            <Assistente
              idosos={idosos}
              idosoSelecionado={idosoSelecionado}
              setIdosoSelecionado={setIdosoSelecionado}
            />
          ) : (
            <Navigate to="/" replace />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;