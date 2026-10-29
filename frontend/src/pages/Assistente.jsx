import { useState } from "react";

function Assistente({
  idosos = [],
  idosoSelecionado,
  setIdosoSelecionado,
}) {
  const [mensagem, setMensagem] = useState("");
  const [mensagens, setMensagens] = useState([]);
  const [carregando, setCarregando] = useState(false);

  const perguntasSugeridas = [
    "Quais medicamentos esse idoso utiliza?",
    "Quais são os próximos horários de medicamento?",
    "Quais ocorrências recentes foram registradas?",
  ];

  const selecionarIdoso = (evento) => {
    const idSelecionado = Number(evento.target.value);

    const idoso = idosos.find(
      (item) => item.Id === idSelecionado
    );

    setIdosoSelecionado(idoso || null);

    // Limpa a conversa ao trocar o idoso selecionado.
    setMensagens([]);
  };

  const usarPergunta = (pergunta) => {
    setMensagem(pergunta);
  };

  const enviarMensagem = async (evento) => {
    evento.preventDefault();

    const pergunta = mensagem.trim();

    if (!pergunta || carregando) {
      return;
    }

    // Guarda o idoso selecionado no momento do envio.
    const idosoParaConsulta = idosoSelecionado;

    // Exibe a pergunta imediatamente na conversa.
    setMensagens((anteriores) => [
      ...anteriores,
      {
        autor: "usuario",
        texto: pergunta,
      },
    ]);

    setMensagem("");
    setCarregando(true);

    try {
      const corpoRequisicao = {
        pergunta,
      };

      // O idoso é opcional para perguntas gerais.
      if (idosoParaConsulta?.Id) {
        corpoRequisicao.idosoId = Number(
          idosoParaConsulta.Id
        );
      }

      const respostaHttp = await fetch(
        "http://localhost:3000/api/assistente",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(corpoRequisicao),
        }
      );

      const dados = await respostaHttp.json();

      if (!respostaHttp.ok) {
        throw new Error(
          dados.erro ||
            `Não foi possível obter a resposta (HTTP ${respostaHttp.status}).`
        );
      }

      if (
        typeof dados.resposta !== "string" ||
        !dados.resposta.trim()
      ) {
        throw new Error(
          "O Assistente não retornou uma resposta válida."
        );
      }

      // Exibe a resposta gerada pelo backend e pelo Gemini.
      setMensagens((anteriores) => [
        ...anteriores,
        {
          autor: "assistente",
          texto: dados.resposta,
        },
      ]);
    } catch (erro) {
      console.error(
        "Erro ao enviar mensagem ao Assistente:",
        erro
      );

      setMensagens((anteriores) => [
        ...anteriores,
        {
          autor: "erro",
          texto:
            erro.message ||
            "Não foi possível conectar ao Assistente. Verifique se o backend está funcionando.",
        },
      ]);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div>
      {/* CABEÇALHO */}

      <header className="mb-8">
        <p className="text-sm font-medium text-slate-500">
          Apoio inteligente
        </p>

        <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          Assistente
        </h2>

        <p className="mt-2 max-w-2xl text-slate-500">
          Faça perguntas em linguagem natural sobre a
          rotina dos idosos cadastrados ou tire dúvidas
          gerais e educativas sobre saúde.
        </p>
      </header>

      {/* SELEÇÃO DO IDOSO */}

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Sobre qual idoso você quer perguntar?
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Selecione um idoso para consultar os dados
            cadastrados. Para perguntas gerais, a seleção
            não é obrigatória.
          </p>
        </div>

        {idosos.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
            Nenhum idoso cadastrado. Você ainda pode fazer
            perguntas gerais ao Assistente.
          </div>
        ) : (
          <select
            value={idosoSelecionado?.Id || ""}
            onChange={selecionarIdoso}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-900"
          >
            <option value="">
              Nenhum idoso selecionado — pergunta geral
            </option>

            {idosos.map((idoso) => (
              <option key={idoso.Id} value={idoso.Id}>
                {idoso.Nome}
              </option>
            ))}
          </select>
        )}
      </section>

      {/* ÁREA DO ASSISTENTE */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-2xl">
            ✨
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Assistente inteligente
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {idosoSelecionado
                ? `Você está consultando informações sobre ${idosoSelecionado.Nome}.`
                : "Você pode fazer perguntas gerais ou selecionar um idoso para consultar os dados cadastrados."}
            </p>
          </div>
        </div>

        {/* ÁREA DA CONVERSA */}

        <div className="min-h-72 rounded-2xl bg-slate-50 p-5">
          {mensagens.length > 0 ? (
            <div className="space-y-4">
              {mensagens.map((item, indice) => (
                <div
                  key={`${item.autor}-${indice}`}
                  className={`flex ${
                    item.autor === "usuario"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[90%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-6 ${
                      item.autor === "usuario"
                        ? "bg-slate-900 text-white"
                        : item.autor === "erro"
                          ? "border border-red-200 bg-red-50 text-red-700"
                          : "border border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    {item.autor !== "usuario" && (
                      <p className="mb-1 text-xs font-semibold">
                        {item.autor === "erro"
                          ? "Aviso"
                          : "Assistente"}
                      </p>
                    )}

                    {item.texto}
                  </div>
                </div>
              ))}

              {carregando && (
                <div className="flex justify-start">
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
                    O Assistente está preparando a resposta...
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mx-auto flex min-h-60 max-w-2xl flex-col justify-center">
              <div className="text-center">
                <div className="text-4xl">💬</div>

                <h4 className="mt-4 text-lg font-semibold text-slate-900">
                  Como posso ajudar?
                </h4>

                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                  {idosoSelecionado
                    ? `Pergunte sobre medicamentos, horários, lembretes ou ocorrências registrados para ${idosoSelecionado.Nome}.`
                    : "Digite uma pergunta geral sobre saúde ou selecione um idoso para consultar as informações dele."}
                </p>
              </div>

              {/* PERGUNTAS SUGERIDAS */}

              {idosoSelecionado && (
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {perguntasSugeridas.map((pergunta) => (
                    <button
                      key={pergunta}
                      type="button"
                      onClick={() => usarPergunta(pergunta)}
                      className="rounded-xl border border-slate-200 bg-white p-3 text-left text-sm text-slate-600 transition hover:border-slate-300 hover:bg-slate-100"
                    >
                      {pergunta}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* CAMPO DE MENSAGEM */}

        <form
          onSubmit={enviarMensagem}
          className="mt-5 flex flex-col gap-3 sm:flex-row"
        >
          <input
            type="text"
            value={mensagem}
            onChange={(evento) =>
              setMensagem(evento.target.value)
            }
            placeholder={
              idosoSelecionado
                ? "Digite sua pergunta..."
                : "Digite uma pergunta geral..."
            }
            disabled={carregando}
            className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-900 disabled:cursor-not-allowed disabled:bg-slate-100"
          />

          <button
            type="submit"
            disabled={!mensagem.trim() || carregando}
            className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {carregando ? "Enviando..." : "Enviar"}
          </button>
        </form>

        {/* AVISO */}

        <p className="mt-4 text-xs leading-5 text-slate-400">
          O Assistente oferece informações educativas e
          consultas aos dados registrados no sistema. Ele
          não realiza diagnósticos nem substitui a orientação
          de profissionais de saúde.
        </p>
      </section>
    </div>
  );
}

export default Assistente;