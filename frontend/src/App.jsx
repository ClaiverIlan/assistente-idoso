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
} from "./services/api";

import Sidebar from "./components/Sidebar";
import IdosoCard from "./components/IdosoCard";
import IdosoForm from "./components/IdosoForm";
import RotinaIdoso from "./components/RotinaIdoso";

function App() {
  const [idosoSelecionado, setIdosoSelecionado] = useState(null);

  const [cuidadores, setCuidadores] = useState([]);
  const [idosos, setIdosos] = useState([]);
  const [medicamentos, setMedicamentos] = useState([]);
  const [ocorrencias, setOcorrencias] = useState([]);
  const [lembretes, setLembretes] = useState([]);

  // Formulário de cadastro de idoso
  const [mostrarFormularioIdoso, setMostrarFormularioIdoso] =
    useState(false);

  const [novoIdoso, setNovoIdoso] = useState({
    Nome: "",
    "Data Nascimento": "",
    Observacoes: "",
  });

  // Formulário de edição de idoso
  const [mostrarFormularioEdicao, setMostrarFormularioEdicao] =
    useState(false);

  const [idosoEditando, setIdosoEditando] = useState({
    Id: null,
    Nome: "",
    "Data Nascimento": "",
    Observacoes: "",
  });

  // Buscar cuidadores
  useEffect(() => {
    listarCuidadores()
      .then((dados) => {
        setCuidadores(dados);
      })
      .catch((erro) => {
        console.error("Erro ao buscar cuidadores:", erro);
      });
  }, []);

  // Buscar idosos
  useEffect(() => {
    listarIdosos()
      .then((dados) => {
        setIdosos(dados);
      })
      .catch((erro) => {
        console.error("Erro ao buscar idosos:", erro);
      });
  }, []);

  // Buscar medicamentos
  useEffect(() => {
    listarMedicamentos()
      .then((dados) => {
        setMedicamentos(dados);
      })
      .catch((erro) => {
        console.error("Erro ao buscar medicamentos:", erro);
      });
  }, []);

  // Buscar ocorrências
  useEffect(() => {
    listarOcorrencias()
      .then((dados) => {
        setOcorrencias(dados);
      })
      .catch((erro) => {
        console.error("Erro ao buscar ocorrências:", erro);
      });
  }, []);

  // Buscar lembretes
  useEffect(() => {
    listarLembretes()
      .then((dados) => {
        setLembretes(dados);
      })
      .catch((erro) => {
        console.error("Erro ao buscar lembretes:", erro);
      });
  }, []);

  // Cadastrar idoso
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

  // Excluir idoso
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

  // Atualizar idoso
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

  // Preparar edição de um idoso
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

  const cuidador = cuidadores[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <Sidebar />

        {/* Conteúdo principal */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">

          {/* Cabeçalho */}
          <header className="mb-8">
            <p className="text-sm font-medium text-slate-500">
              Cuidador
            </p>

            <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              {cuidador ? `Olá, ${cuidador.Nome}` : "Bem-vindo"}
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

            {/* Cards dos idosos */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {idosos.map((idoso) => (
                <IdosoCard
                  key={idoso.Id}
                  idoso={idoso}
                  selecionado={idosoSelecionado?.Id === idoso.Id}
                  onSelecionar={setIdosoSelecionado}
                  onEditar={prepararEdicaoIdoso}
                  onExcluir={excluirIdoso}
                />
              ))}
            </div>
          </section>

          {/* Rotina */}
          {idosoSelecionado ? (
            <RotinaIdoso
              idoso={idosoSelecionado}
              medicamentos={medicamentos}
              lembretes={lembretes}
              ocorrencias={ocorrencias}
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