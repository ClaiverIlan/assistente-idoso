import { useEffect, useState } from "react";

import {
  listarCuidadores,
  listarIdosos,
  listarMedicamentos,
  listarOcorrencias,
  listarLembretes,
  criarIdoso,
  editarIdoso as atualizarIdosoApi,
  excluirIdoso as excluirIdosoApi,
  criarMedicamento,
  editarMedicamento as atualizarMedicamentoApi,
  excluirMedicamento as excluirMedicamentoApi,
  criarOcorrencia,
  editarOcorrencia as atualizarOcorrenciaApi,
  excluirOcorrencia as excluirOcorrenciaApi,
} from "./services/api";

import Sidebar from "./components/Sidebar";
import IdosoCard from "./components/IdosoCard";
import IdosoForm from "./components/IdosoForm";
import RotinaIdoso from "./components/RotinaIdoso";
import MedicamentoForm from "./components/MedicamentoForm";
import OcorrenciaForm from "./components/OcorrenciaForm";

function App() {
  const [idosoSelecionado, setIdosoSelecionado] = useState(null);

  const [cuidadores, setCuidadores] = useState([]);
  const [idosos, setIdosos] = useState([]);
  const [medicamentos, setMedicamentos] = useState([]);
  const [ocorrencias, setOcorrencias] = useState([]);
  const [lembretes, setLembretes] = useState([]);

  // ==============================
  // FORMULÁRIO DE IDOSO
  // ==============================

  const [mostrarFormularioIdoso, setMostrarFormularioIdoso] =
    useState(false);

  const [novoIdoso, setNovoIdoso] = useState({
    Nome: "",
    "Data Nascimento": "",
    Observacoes: "",
  });

  const [mostrarFormularioEdicao, setMostrarFormularioEdicao] =
    useState(false);

  const [idosoEditando, setIdosoEditando] = useState({
    Id: null,
    Nome: "",
    "Data Nascimento": "",
    Observacoes: "",
  });

  // ==============================
  // FORMULÁRIO DE MEDICAMENTO
  // ==============================

  const [mostrarFormularioMedicamento, setMostrarFormularioMedicamento] =
    useState(false);

  const [novoMedicamento, setNovoMedicamento] = useState({
    Nome: "",
    Dosagem: "",
    Horario: "",
    Frequencia: "",
    Observacoes: "",
  });

  const [
    mostrarFormularioEdicaoMedicamento,
    setMostrarFormularioEdicaoMedicamento,
  ] = useState(false);

  const [medicamentoEditando, setMedicamentoEditando] = useState({
    Id: null,
    Idoso_Id: null,
    Nome: "",
    Dosagem: "",
    Horario: "",
    Frequencia: "",
    Observacoes: "",
  });

  // ==============================
  // FORMULÁRIO DE OCORRÊNCIA
  // ==============================

  const [mostrarFormularioOcorrencia, setMostrarFormularioOcorrencia] =
    useState(false);

  const [novaOcorrencia, setNovaOcorrencia] = useState({
    Tipo: "",
    "Descrição": "",
    Data_Hora: "",
  });

  const [
    mostrarFormularioEdicaoOcorrencia,
    setMostrarFormularioEdicaoOcorrencia,
  ] = useState(false);

  const [ocorrenciaEditando, setOcorrenciaEditando] = useState({
    Id: null,
    Idoso_Id: null,
    Tipo: "",
    "Descrição": "",
    Data_Hora: "",
  });

  // ==============================
  // BUSCAR DADOS
  // ==============================

  useEffect(() => {
    listarCuidadores()
      .then((dados) => {
        setCuidadores(dados);
      })
      .catch((erro) => {
        console.error("Erro ao buscar cuidadores:", erro);
      });
  }, []);

  useEffect(() => {
    listarIdosos()
      .then((dados) => {
        setIdosos(dados);
      })
      .catch((erro) => {
        console.error("Erro ao buscar idosos:", erro);
      });
  }, []);

  useEffect(() => {
    listarMedicamentos()
      .then((dados) => {
        setMedicamentos(dados);
      })
      .catch((erro) => {
        console.error("Erro ao buscar medicamentos:", erro);
      });
  }, []);

  useEffect(() => {
    listarOcorrencias()
      .then((dados) => {
        setOcorrencias(dados);
      })
      .catch((erro) => {
        console.error("Erro ao buscar ocorrências:", erro);
      });
  }, []);

  useEffect(() => {
    listarLembretes()
      .then((dados) => {
        setLembretes(dados);
      })
      .catch((erro) => {
        console.error("Erro ao buscar lembretes:", erro);
      });
  }, []);

  // ==============================
  // IDOSOS
  // ==============================

  const cadastrarIdoso = async (evento) => {
    evento.preventDefault();

    if (cuidadores.length === 0) {
      alert("Nenhum cuidador cadastrado.");
      return;
    }

    try {
      const dados = await criarIdoso({
        Cuidador_Id: cuidadores[0].Id,
        Nome: novoIdoso.Nome,
        "Data Nascimento": novoIdoso["Data Nascimento"],
        Observacoes: novoIdoso.Observacoes,
      });

      setIdosos((idososAtuais) => [...idososAtuais, dados]);

      setNovoIdoso({
        Nome: "",
        "Data Nascimento": "",
        Observacoes: "",
      });

      setMostrarFormularioIdoso(false);
    } catch (erro) {
      console.error("Erro ao cadastrar idoso:", erro);
      alert(erro.message);
    }
  };

  const excluirIdoso = async (idoso) => {
    const confirmar = window.confirm(
      `Deseja realmente excluir ${idoso.Nome}?`
    );

    if (!confirmar) {
      return;
    }

    try {
      await excluirIdosoApi(idoso.Id);

      setIdosos((idososAtuais) =>
        idososAtuais.filter((item) => item.Id !== idoso.Id)
      );

      if (idosoSelecionado?.Id === idoso.Id) {
        setIdosoSelecionado(null);
      }

      if (
        mostrarFormularioEdicao &&
        idosoEditando.Id === idoso.Id
      ) {
        setMostrarFormularioEdicao(false);
      }
    } catch (erro) {
      console.error("Erro ao excluir idoso:", erro);
      alert(erro.message);
    }
  };

  const editarIdoso = async (evento) => {
    evento.preventDefault();

    if (cuidadores.length === 0) {
      alert("Nenhum cuidador cadastrado.");
      return;
    }

    try {
      const dados = await atualizarIdosoApi(idosoEditando.Id, {
        Cuidador_Id: cuidadores[0].Id,
        Nome: idosoEditando.Nome,
        "Data Nascimento": idosoEditando["Data Nascimento"],
        Observacoes: idosoEditando.Observacoes,
      });

      setIdosos((idososAtuais) =>
        idososAtuais.map((idoso) =>
          idoso.Id === dados.Id ? dados : idoso
        )
      );

      if (idosoSelecionado?.Id === dados.Id) {
        setIdosoSelecionado(dados);
      }

      setMostrarFormularioEdicao(false);
    } catch (erro) {
      console.error("Erro ao atualizar idoso:", erro);
      alert(erro.message);
    }
  };

  const prepararEdicaoIdoso = (idoso) => {
    setIdosoEditando({
      Id: idoso.Id,
      Nome: idoso.Nome,
      "Data Nascimento": idoso["Data Nascimento"],
      Observacoes: idoso.Observacoes || "",
    });

    setMostrarFormularioEdicao(true);
    setMostrarFormularioIdoso(false);
  };

  // ==============================
  // MEDICAMENTOS
  // ==============================

  const cadastrarMedicamento = async (evento) => {
    evento.preventDefault();

    if (!idosoSelecionado) {
      alert("Selecione um idoso antes de cadastrar o medicamento.");
      return;
    }

    try {
      const dados = await criarMedicamento({
        Idoso_Id: idosoSelecionado.Id,
        Nome: novoMedicamento.Nome,
        Dosagem: novoMedicamento.Dosagem,
        Horario: novoMedicamento.Horario,
        Frequencia: novoMedicamento.Frequencia,
        Observacoes: novoMedicamento.Observacoes,
      });

      setMedicamentos((medicamentosAtuais) => [
        ...medicamentosAtuais,
        dados,
      ]);

      if (dados.lembrete) {
        setLembretes((lembretesAtuais) => [
          ...lembretesAtuais,
          dados.lembrete,
        ]);
      }

      setNovoMedicamento({
        Nome: "",
        Dosagem: "",
        Horario: "",
        Frequencia: "",
        Observacoes: "",
      });

      setMostrarFormularioMedicamento(false);
    } catch (erro) {
      console.error("Erro ao cadastrar medicamento:", erro);
      alert(erro.message);
    }
  };

  const editarMedicamento = async (evento) => {
    evento.preventDefault();

    try {
      const dados = await atualizarMedicamentoApi(
        medicamentoEditando.Id,
        {
          Idoso_Id: medicamentoEditando.Idoso_Id,
          Nome: medicamentoEditando.Nome,
          Dosagem: medicamentoEditando.Dosagem,
          Horario: medicamentoEditando.Horario,
          Frequencia: medicamentoEditando.Frequencia,
          Observacoes: medicamentoEditando.Observacoes,
        }
      );

      setMedicamentos((medicamentosAtuais) =>
        medicamentosAtuais.map((medicamento) =>
          medicamento.Id === dados.Id ? dados : medicamento
        )
      );

      if (dados.lembrete) {
        setLembretes((lembretesAtuais) =>
          lembretesAtuais.map((lembrete) =>
            lembrete.Id === dados.lembrete.Id
              ? dados.lembrete
              : lembrete
          )
        );
      }

      setMostrarFormularioEdicaoMedicamento(false);
    } catch (erro) {
      console.error("Erro ao atualizar medicamento:", erro);
      alert(erro.message);
    }
  };

  const excluirMedicamento = async (medicamento) => {
    const confirmar = window.confirm(
      `Deseja realmente excluir ${medicamento.Nome}?`
    );

    if (!confirmar) {
      return;
    }

    try {
      await excluirMedicamentoApi(medicamento.Id);

      setMedicamentos((medicamentosAtuais) =>
        medicamentosAtuais.filter(
          (item) => item.Id !== medicamento.Id
        )
      );

      setLembretes((lembretesAtuais) =>
        lembretesAtuais.filter(
          (lembrete) =>
            lembrete.Medicamento_Id !== medicamento.Id
        )
      );

      setMostrarFormularioEdicaoMedicamento(false);
    } catch (erro) {
      console.error("Erro ao excluir medicamento:", erro);
      alert(erro.message);
    }
  };

  const prepararEdicaoMedicamento = (medicamento) => {
    setMedicamentoEditando({
      Id: medicamento.Id,
      Idoso_Id: medicamento.Idoso_Id,
      Nome: medicamento.Nome,
      Dosagem: medicamento.Dosagem,
      Horario: medicamento.Horario,
      Frequencia: medicamento.Frequencia,
      Observacoes: medicamento.Observacoes || "",
    });

    setMostrarFormularioEdicaoMedicamento(true);
    setMostrarFormularioMedicamento(false);
  };

  // ==============================
  // OCORRÊNCIAS
  // ==============================

  const cadastrarOcorrencia = async (evento) => {
    evento.preventDefault();

    if (!idosoSelecionado) {
      alert("Selecione um idoso antes de registrar a ocorrência.");
      return;
    }

    try {
      const dados = await criarOcorrencia({
        Idoso_Id: idosoSelecionado.Id,
        Tipo: novaOcorrencia.Tipo,
        "Descrição": novaOcorrencia["Descrição"],
        Data_Hora: novaOcorrencia.Data_Hora,
      });

      setOcorrencias((ocorrenciasAtuais) => [
        ...ocorrenciasAtuais,
        dados,
      ]);

      setNovaOcorrencia({
        Tipo: "",
        "Descrição": "",
        Data_Hora: "",
      });

      setMostrarFormularioOcorrencia(false);
    } catch (erro) {
      console.error("Erro ao cadastrar ocorrência:", erro);
      alert(erro.message);
    }
  };

  const editarOcorrencia = async (evento) => {
    evento.preventDefault();

    try {
      const dados = await atualizarOcorrenciaApi(
        ocorrenciaEditando.Id,
        {
          Idoso_Id: ocorrenciaEditando.Idoso_Id,
          Tipo: ocorrenciaEditando.Tipo,
          "Descrição": ocorrenciaEditando["Descrição"],
          Data_Hora: ocorrenciaEditando.Data_Hora,
        }
      );

      setOcorrencias((ocorrenciasAtuais) =>
        ocorrenciasAtuais.map((ocorrencia) =>
          ocorrencia.Id === dados.Id ? dados : ocorrencia
        )
      );

      setMostrarFormularioEdicaoOcorrencia(false);
    } catch (erro) {
      console.error("Erro ao atualizar ocorrência:", erro);
      alert(erro.message);
    }
  };

  const excluirOcorrencia = async (ocorrencia) => {
    const confirmar = window.confirm(
      `Deseja realmente excluir a ocorrência "${ocorrencia.Tipo}"?`
    );

    if (!confirmar) {
      return;
    }

    try {
      await excluirOcorrenciaApi(ocorrencia.Id);

      setOcorrencias((ocorrenciasAtuais) =>
        ocorrenciasAtuais.filter(
          (item) => item.Id !== ocorrencia.Id
        )
      );

      if (ocorrenciaEditando.Id === ocorrencia.Id) {
        setMostrarFormularioEdicaoOcorrencia(false);
      }
    } catch (erro) {
      console.error("Erro ao excluir ocorrência:", erro);
      alert(erro.message);
    }
  };

  const prepararEdicaoOcorrencia = (ocorrencia) => {
    setOcorrenciaEditando({
      Id: ocorrencia.Id,
      Idoso_Id: ocorrencia.Idoso_Id,
      Tipo: ocorrencia.Tipo,
      "Descrição": ocorrencia["Descrição"],
      Data_Hora: ocorrencia.Data_Hora,
    });

    setMostrarFormularioEdicaoOcorrencia(true);
    setMostrarFormularioOcorrencia(false);
  };

  // ==============================
  // CUIDADOR ATUAL
  // ==============================

  const cuidador = cuidadores[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">

        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">

          {/* Cabeçalho */}
          <header className="mb-8">
            <p className="text-sm font-medium text-slate-500">
              Cuidador
            </p>

            <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              {cuidador
                ? `Olá, ${cuidador.Nome}`
                : "Bem-vindo"}
            </h2>

            <p className="mt-2 text-slate-500">
              Acompanhe a rotina dos seus idosos.
            </p>
          </header>

          {/* Lista de idosos */}
          <section className="mb-8">

            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">
                  Seus idosos
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

            {/* Formulário de cadastro de idoso */}
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

            {/* Formulário de edição de idoso */}
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

            {/* Cards dos idosos */}
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

              onCadastrarMedicamento={cadastrarMedicamento}
              onEditarMedicamento={editarMedicamento}
              onExcluirMedicamento={excluirMedicamento}

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

              setNovaOcorrencia={setNovaOcorrencia}
              setOcorrenciaEditando={setOcorrenciaEditando}

              onCadastrarOcorrencia={cadastrarOcorrencia}
              onEditarOcorrencia={editarOcorrencia}
              onExcluirOcorrencia={excluirOcorrencia}

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

        </main>
      </div>
    </div>
  );
}

export default App;